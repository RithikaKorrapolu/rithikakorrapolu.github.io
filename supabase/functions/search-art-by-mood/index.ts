import { createClient } from 'supabase'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const { mood } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const GOOGLE_AI_KEY = Deno.env.get('GOOGLE_AI_KEY');
    if (!GOOGLE_AI_KEY) {
      throw new Error('GOOGLE_AI_KEY is not set');
    }
    
    // Try to call Google AI API to extract mood tags, with fallback
    let tags: string[] = [];
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Extract emotional keywords from this mood description: "${mood}". Return only a JSON array of emotions like ["happy", "energetic", "positive"]. Include 5-8 relevant emotion words.`
            }]
          }]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (responseText) {
          // Try to parse as JSON array directly
          const cleanedResponse = responseText.replace(/```json|```/g, '').trim();
          const parsedTags = JSON.parse(cleanedResponse);
          
          // Ensure it's an array of strings
          if (Array.isArray(parsedTags)) {
            tags = parsedTags.map(tag => String(tag).toLowerCase());
          } else {
            throw new Error("Response is not an array");
          }
        } else {
          throw new Error("No response text found");
        }
      } else {
        // API error - fall back to keyword extraction
        throw new Error(`Google AI API error: ${response.status}`);
      }
    } catch (apiError) {
      console.log("Google AI API unavailable, using keyword extraction fallback:", apiError.message);
      
      // Smart keyword extraction fallback
      const moodWords = mood.toLowerCase().split(/\W+/).filter(word => word.length > 2);
      
      // Add common emotional synonyms based on detected words
      const emotionalMap = {
        'happy': ['joyful', 'cheerful', 'uplifting', 'positive'],
        'sad': ['melancholy', 'somber', 'introspective', 'contemplative'],
        'calm': ['peaceful', 'serene', 'tranquil', 'soothing'],
        'energetic': ['dynamic', 'vibrant', 'lively', 'exciting'],
        'angry': ['intense', 'passionate', 'fiery', 'bold'],
        'love': ['romantic', 'tender', 'affectionate', 'warm'],
        'fear': ['dark', 'mysterious', 'suspenseful', 'dramatic'],
        'tired': ['mellow', 'soft', 'gentle', 'restful']
      };
      
      tags = [...moodWords];
      
      // Add synonyms for detected emotional words
      moodWords.forEach(word => {
        if (emotionalMap[word]) {
          tags.push(...emotionalMap[word]);
        }
      });
      
      // Remove duplicates and limit to 8 tags
      tags = [...new Set(tags)].slice(0, 8);
    }
    
    // Search for art in the database using the extracted tags
    let artQuery = supabase
      .from('art_collection')
      .select('*')
      .limit(3); // Limit to 3 pieces as requested
    
    // Build a search condition that looks for overlapping tags
    if (tags.length > 0) {
      // Use PostgreSQL array overlap operator to find art with matching mood tags
      artQuery = artQuery.or(
        tags.map(tag => `mood_tags.cs.{${tag}}`).join(',') +
        ',' +
        tags.map(tag => `style_tags.cs.{${tag}}`).join(',')
      );
    }
    
    const { data: artResults, error: artError } = await artQuery;
    
    if (artError) {
      console.error("Database error:", artError);
      // Fallback: get random art pieces
      const { data: fallbackArt } = await supabase
        .from('art_collection')
        .select('*')
        .limit(3);
      
      return new Response(
        JSON.stringify({
          mood: mood,
          tags: tags,
          art: fallbackArt || [],
          message: "Found some art for you (using fallback search)"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If no results found with tag matching, get some random pieces
    if (!artResults || artResults.length === 0) {
      const { data: randomArt } = await supabase
        .from('art_collection')
        .select('*')
        .limit(3);
      
      return new Response(
        JSON.stringify({
          mood: mood,
          tags: tags,
          art: randomArt || [],
          message: "Here's some art that might inspire you"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({
        mood: mood,
        tags: tags,
        art: artResults,
        message: `Found ${artResults.length} piece(s) that match your mood`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Function error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        mood: "",
        tags: [],
        art: [],
        message: "Sorry, there was an error searching for art. Please try again."
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
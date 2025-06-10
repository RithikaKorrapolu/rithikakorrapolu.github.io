// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use Deno's built-in HTTP server
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const { title, content } = await req.json();
    
    const HF_API_KEY = Deno.env.get('HF_API_KEY');
    if (!HF_API_KEY) {
      throw new Error('HF_API_KEY is not set');
    }
    
    // Much more specific and detailed prompt
    const prompt = `<s>[INST]You are an expert emotion and content analyst. Analyze this piece of art with high specificity:

Title: ${title}
Content: ${content || 'N/A'}

You must provide specific, concrete emotional analysis. NO GENERIC TERMS ALLOWED.

Return ONLY a JSON object with these exact fields:

{
  "emotions": [Pick 3-4 from: "sad", "joyful", "nostalgic", "romantic", "angry", "peaceful", "anxious", "hopeful", "melancholic", "excited", "loving", "lonely", "inspired", "grateful", "frustrated", "content", "yearning", "bittersweet", "euphoric", "contemplative", "passionate", "serene", "restless", "tender"],
  "themes": [Pick 3-4 from: "love", "friendship", "family", "nature", "growth", "loss", "memories", "dreams", "struggle", "triumph", "beauty", "time", "change", "freedom", "identity", "relationships", "creativity", "spirituality", "mortality", "youth", "wisdom", "adventure", "solitude", "community", "healing", "discovery"],
  "moodTags": [Pick 5-7 from: "uplifting", "comforting", "energizing", "calming", "motivational", "romantic", "melancholic", "inspiring", "healing", "empowering", "nostalgic", "peaceful", "intense", "gentle", "profound", "playful", "dramatic", "soothing", "passionate", "reflective", "bittersweet", "hopeful", "tender", "fierce"],
  "tags": [5-8 specific descriptive words based on the actual content],
  "overallSentiment": [number between -1.0 and 1.0]
}

CRITICAL RULES:
- NEVER use words like "general", "personal", "expression", "unspecified", "various", "mixed"
- Choose emotions that specifically match the content's emotional tone
- Base themes on what the content is actually about
- Make moodTags represent when someone would want to experience this content
- Be specific and meaningful in your analysis[/INST]</s>`;
    
    // Call Hugging Face Inference API with better parameters
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HF_API_KEY}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          return_full_text: false,
          temperature: 0.3, // Lower temperature for more consistent results
          top_p: 0.9,
          repetition_penalty: 1.1
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Parse the response with better error handling
    try {
      let resultText = data[0].generated_text;
      
      // Clean up the response
      if (!resultText.startsWith('{')) {
        const jsonMatch = resultText.match(/(\{.*\})/s);
        if (jsonMatch) {
          resultText = jsonMatch[0];
        } else {
          throw new Error("No valid JSON found in response");
        }
      }
      
      let result = JSON.parse(resultText);
      
      // Post-process to ensure quality
      result = cleanupAnalysis(result, title, content);
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      console.error("Raw response:", data);
      
      // Enhanced fallback analysis
      const fallbackResult = generateFallbackAnalysis(title, content);
      
      return new Response(
        JSON.stringify(fallbackResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Function error:", error);
    
    // Enhanced error fallback
    const errorFallback = generateFallbackAnalysis(
      req.body?.title || "Unknown", 
      req.body?.content || ""
    );
    
    return new Response(
      JSON.stringify(errorFallback),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Function to clean up and validate the analysis
function cleanupAnalysis(result, title, content) {
  const specificEmotions = ["sad", "joyful", "nostalgic", "romantic", "angry", "peaceful", "anxious", "hopeful", "melancholic", "excited", "loving", "lonely", "inspired", "grateful", "frustrated", "content", "yearning", "bittersweet", "euphoric", "contemplative", "passionate", "serene", "restless", "tender"];
  
  const specificThemes = ["love", "friendship", "family", "nature", "growth", "loss", "memories", "dreams", "struggle", "triumph", "beauty", "time", "change", "freedom", "identity", "relationships", "creativity", "spirituality", "mortality", "youth", "wisdom", "adventure", "solitude", "community", "healing", "discovery"];
  
  const specificMoodTags = ["uplifting", "comforting", "energizing", "calming", "motivational", "romantic", "melancholic", "inspiring", "healing", "empowering", "nostalgic", "peaceful", "intense", "gentle", "profound", "playful", "dramatic", "soothing", "passionate", "reflective", "bittersweet", "hopeful", "tender", "fierce"];
  
  // Clean emotions
  if (!result.emotions || !Array.isArray(result.emotions) || result.emotions.some(e => !specificEmotions.includes(e))) {
    result.emotions = generateEmotionsFromContent(title, content, specificEmotions);
  }
  
  // Clean themes
  if (!result.themes || !Array.isArray(result.themes) || result.themes.some(t => !specificThemes.includes(t))) {
    result.themes = generateThemesFromContent(title, content, specificThemes);
  }
  
  // Clean mood tags
  if (!result.moodTags || !Array.isArray(result.moodTags) || result.moodTags.some(m => !specificMoodTags.includes(m))) {
    result.moodTags = generateMoodTagsFromContent(title, content, specificMoodTags);
  }
  
  // Ensure tags are specific
  if (!result.tags || !Array.isArray(result.tags)) {
    result.tags = generateTagsFromContent(title, content);
  }
  
  // Validate sentiment
  if (typeof result.overallSentiment !== 'number' || result.overallSentiment < -1 || result.overallSentiment > 1) {
    result.overallSentiment = calculateSentimentFromContent(title, content);
  }
  
  return result;
}

// Generate emotions based on content analysis
function generateEmotionsFromContent(title, content, validEmotions) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  const emotionKeywords = {
    "sad": ["sad", "cry", "tear", "grief", "sorrow", "pain", "hurt", "broken", "loss", "miss", "goodbye"],
    "joyful": ["happy", "joy", "laugh", "smile", "celebrate", "excited", "wonderful", "amazing", "great", "fantastic"],
    "nostalgic": ["remember", "past", "childhood", "old", "memory", "yesterday", "before", "used to", "back then"],
    "romantic": ["love", "heart", "kiss", "romance", "valentine", "partner", "together", "forever", "marry", "date"],
    "peaceful": ["calm", "quiet", "serene", "tranquil", "peaceful", "still", "gentle", "soft", "rest", "breathe"],
    "hopeful": ["hope", "future", "dream", "wish", "believe", "faith", "tomorrow", "possibility", "bright", "light"],
    "loving": ["love", "care", "affection", "warm", "tender", "sweet", "cherish", "adore", "devoted", "precious"],
    "inspired": ["inspire", "motivate", "creative", "art", "beauty", "vision", "passion", "purpose", "amazing"],
    "contemplative": ["think", "reflect", "ponder", "consider", "wonder", "question", "deep", "meaning", "philosophy"]
  };
  
  const detectedEmotions = [];
  
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    const score = keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 1 : 0), 0);
    if (score > 0) {
      detectedEmotions.push({ emotion, score });
    }
  }
  
  // Sort by score and take top emotions
  detectedEmotions.sort((a, b) => b.score - a.score);
  
  if (detectedEmotions.length > 0) {
    return detectedEmotions.slice(0, 3).map(e => e.emotion);
  }
  
  // Default emotions based on content length/type
  return ["contemplative", "thoughtful", "reflective"].slice(0, 3);
}

// Generate themes based on content analysis
function generateThemesFromContent(title, content, validThemes) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  const themeKeywords = {
    "love": ["love", "heart", "romance", "relationship", "partner", "together"],
    "friendship": ["friend", "buddy", "companion", "together", "support", "loyal"],
    "family": ["family", "mother", "father", "parent", "child", "sibling", "home"],
    "nature": ["nature", "tree", "forest", "ocean", "mountain", "sky", "earth", "flower"],
    "growth": ["grow", "learn", "develop", "progress", "improve", "evolve", "change"],
    "memories": ["memory", "remember", "past", "childhood", "nostalgic", "recall"],
    "dreams": ["dream", "wish", "hope", "aspire", "goal", "future", "imagine"],
    "beauty": ["beautiful", "gorgeous", "stunning", "lovely", "pretty", "aesthetic"],
    "time": ["time", "moment", "hour", "day", "year", "age", "forever", "temporary"],
    "creativity": ["art", "create", "imagine", "design", "music", "write", "paint"]
  };
  
  const detectedThemes = [];
  
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    const score = keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 1 : 0), 0);
    if (score > 0) {
      detectedThemes.push({ theme, score });
    }
  }
  
  detectedThemes.sort((a, b) => b.score - a.score);
  
  if (detectedThemes.length > 0) {
    return detectedThemes.slice(0, 3).map(t => t.theme);
  }
  
  return ["identity", "relationships", "discovery"];
}

// Generate mood tags based on content
function generateMoodTagsFromContent(title, content, validMoodTags) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  // Simple sentiment analysis
  const positiveWords = ["happy", "joy", "love", "beautiful", "amazing", "wonderful", "great", "perfect", "smile"];
  const negativeWords = ["sad", "pain", "hurt", "terrible", "awful", "hate", "angry", "frustrated"];
  
  const positiveCount = positiveWords.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
  const negativeCount = negativeWords.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
  
  if (positiveCount > negativeCount) {
    return ["uplifting", "inspiring", "hopeful", "comforting", "energizing"];
  } else if (negativeCount > positiveCount) {
    return ["melancholic", "reflective", "healing", "profound", "gentle"];
  } else {
    return ["contemplative", "peaceful", "reflective", "soothing", "tender"];
  }
}

// Generate specific tags from content
function generateTagsFromContent(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  const words = text.split(/\W+/).filter(word => word.length > 3);
  const uniqueWords = [...new Set(words)];
  return uniqueWords.slice(0, 8);
}

// Calculate sentiment from content
function calculateSentimentFromContent(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  const positiveWords = ["love", "happy", "joy", "beautiful", "amazing", "wonderful", "great", "perfect", "smile", "laugh", "celebrate", "excited", "hope", "dream"];
  const negativeWords = ["sad", "pain", "hurt", "terrible", "awful", "hate", "angry", "frustrated", "cry", "broken", "loss", "grief", "fear"];
  
  const positiveCount = positiveWords.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
  const negativeCount = negativeWords.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
  
  const sentiment = (positiveCount - negativeCount) * 0.2;
  return Math.max(-1, Math.min(1, sentiment));
}

// Enhanced fallback analysis
function generateFallbackAnalysis(title, content) {
  return {
    emotions: generateEmotionsFromContent(title, content, ["contemplative", "thoughtful", "reflective"]),
    themes: generateThemesFromContent(title, content, ["identity", "relationships", "discovery"]),
    moodTags: generateMoodTagsFromContent(title, content, ["reflective", "peaceful", "contemplative", "soothing", "gentle"]),
    tags: generateTagsFromContent(title, content),
    overallSentiment: calculateSentimentFromContent(title, content)
  };
}
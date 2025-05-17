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
    const { mood } = await req.json();
    
    const HF_API_KEY = Deno.env.get('HF_API_KEY');
    if (!HF_API_KEY) {
      throw new Error('HF_API_KEY is not set');
    }
    
    const prompt = `<s>[INST]I'm feeling: "${mood}"
    
Extract 5-10 relevant emotional keywords, themes, and mood tags that would help find matching content.
Return a JSON object with a single property "tags" containing an array of lowercase strings.

RESPOND ONLY with valid JSON.[/INST]</s>`;
    
    // Call Hugging Face Inference API
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HF_API_KEY}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 512,
          return_full_text: false
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    // Parse the response
    try {
      let resultText = data[0].generated_text;
      
      // If the model didn't return valid JSON, attempt to extract JSON
      if (!resultText.startsWith('{')) {
        const jsonMatch = resultText.match(/(\{.*\})/s);
        if (jsonMatch) {
          resultText = jsonMatch[0];
        } else {
          throw new Error("Response doesn't contain valid JSON");
        }
      }
      
      const result = JSON.parse(resultText);
      
      return new Response(
        JSON.stringify(result), // Return the parsed result directly
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      console.error("Raw response:", data);
      
      // Extract words from mood as fallback
      const moodWords = mood.toLowerCase().split(/\W+/).filter(word => word.length > 2);
      let tags = [...moodWords];
      
      // Ensure we have some tags
      if (tags.length < 3) {
        tags = [...tags, "mood", "feeling", "emotion", "general", "any"];
      }
      
      // Return fallback tags
      return new Response(
        JSON.stringify({ tags: tags.slice(0, 10) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Function error:", error);
    
    // Extract words from mood as fallback
    const mood = req.body?.mood || "";
    const moodWords = mood.toLowerCase().split(/\W+/).filter(word => word.length > 2);
    let tags = [...moodWords, "mood", "feeling", "emotion", "general"];
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        tags: tags.slice(0, 10)
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
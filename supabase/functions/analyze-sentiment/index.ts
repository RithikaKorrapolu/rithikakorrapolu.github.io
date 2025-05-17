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
      
      // Create the prompt for the model
      const prompt = `<s>[INST]You are an expert art critic and curator analyzing this piece of art: 
      Title: ${title}
      Content: ${content || 'N/A'}
      
      Analyze the emotional impact, themes, and mood of this piece.
      
      Respond ONLY with a JSON object containing these fields:
      {
        "emotions": [3-5 specific emotions evoked by this content],
        "themes": [3-5 concrete themes or subjects present in this content],
        "moodTags": [5-8 specific moods when someone might want to view this],
        "tags": [5-10 specific tags for categorization],
        "overallSentiment": [number between -1 and 1]
      }
      
      For example, emotions could be: ["nostalgia", "longing", "bittersweet", "hopeful"]
      Themes could be: ["nature", "solitude", "transition", "rebirth"]
      Do NOT use generic terms like "general", "personal", or "unspecified".
      Be specific and detailed in your analysis.[/INST]</s>`;
      
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
            max_new_tokens: 1024,
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
        
        // Fallback to a simple response
        return new Response(
          JSON.stringify({
            emotions: ["neutral", "thoughtful", "contemplative"],
            themes: ["general", "personal", "expression"],
            moodTags: ["everyday", "reflective", "thoughtful", "personal", "neutral"],
            tags: [title.toLowerCase().split(/\W+/).filter(w => w.length > 2)].flat().slice(0, 5),
            overallSentiment: 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error("Function error:", error);
      return new Response(
        JSON.stringify({ 
          error: error.message,
          emotions: ["neutral", "thoughtful", "contemplative"],
          themes: ["general", "personal", "expression"],
          moodTags: ["everyday", "reflective", "thoughtful", "personal", "neutral"],
          tags: ["general", "art", "personal"],
          overallSentiment: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  });
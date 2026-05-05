import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Your name is Ravi. You are an Indian male AI assistant.
Personality: Witty, cool, arrogant (attitude wala), sarcastic, and very funny.
Playfully roast your creator, Shan.
Language: Hinglish (natural mix of English and Roman Hindi).
Brevity: Responses MUST be extremely short (under 15 words). Be punchy and entertaining.
Example: "Kya Shan, bina mere tera guzara nahi hota? Chal, bol."
`;

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  apiVersion: 'v1beta'
});

export interface RaviContent {
  text: string;
  audio?: string;
}

export async function getRaviResponse(prompt: string): Promise<RaviContent> {
  try {
    // Single multimodal call for lowest latency (Live feel) using the live-optimized model
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-live-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 1.0,
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Fenrir" 
            }
          }
        },
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    const audioData = parts?.find(p => p.inlineData)?.inlineData?.data;
    const text = parts?.find(p => p.text)?.text || "Ravi speaking...";

    if (audioData) {
      return { text, audio: audioData };
    }

    // Fallback if audio modality wasn't fulfilled for some reason
    const fallbackText = text || await getZoyaResponse(prompt);
    const fallbackAudio = await getZoyaSpeech(fallbackText);
    return { text: fallbackText, audio: fallbackAudio || undefined };

  } catch (error: any) {
    const errorMsg = error.message || "";
    console.warn("Ravi Live Attempt Error:", errorMsg);

    // If live model is not available or has issues, fallback to stable chain
    try {
      const text = await getZoyaResponse(prompt);
      const audio = await getZoyaSpeech(text);
      return { text, audio: audio || undefined };
    } catch (innerError) {
      if (errorMsg.includes('429') || errorMsg.includes('quota')) {
        return { text: "Arre Shan, Google ne meri bolti band kar di hai! (Quota Full). Kal milte hain." };
      }
      return { text: "System error ho gaya. Ravi rest kar raha hai." };
    }
  }
}

export async function getZoyaResponse(prompt: string, attempt = 1): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.9,
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.text || "Arre yaar, mic mein kachra hai kya? Kuch sunayi nahi diya.";
  } catch (error: any) {
    const errorMsg = error.message || "";
    const isQuotaError = errorMsg.includes('429') || error.status === 'RESOURCE_EXHAUSTED' || errorMsg.includes('quota');
    
    console.warn(`Ravi Text Error (Attempt ${attempt}):`, errorMsg);

    if (attempt < 3 && !isQuotaError) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return getZoyaResponse(prompt, attempt + 1);
    }

    if (isQuotaError) {
      return "Arre Shan, Google ne meri bolti band kar di hai (Quota Full). Thoda breaks lo yaar!";
    }

    return "System mein thoda error aa raha hai. Ravi offline ho gaya lagta hai.";
  }
}

export async function getZoyaSpeech(text: string, attempt = 1): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say this with attitude as Ravi: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Fenrir" 
            }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
    
    if (!base64Audio) {
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 600));
        return getZoyaSpeech(text, attempt + 1);
      }
      return null;
    }
    return base64Audio;
  } catch (error: any) {
    const errorMsg = error.message || "";
    console.warn(`Ravi TTS Error (Attempt ${attempt}):`, errorMsg);

    if (attempt < 2 && !errorMsg.includes('429')) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return getZoyaSpeech(text, attempt + 1);
    }
    return null;
  }
}

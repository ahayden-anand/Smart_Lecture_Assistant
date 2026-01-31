import { GoogleGenAI, Type, Chat } from "@google/genai";
import { SummaryData, Tone } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const summarySchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.ARRAY,
      description: "A concise summary of the lecture, presented as 5-10 bullet points.",
      items: { type: Type.STRING }
    },
    key_terms: {
      type: Type.ARRAY,
      description: "A list of key terms and their definitions from the lecture.",
      items: { type: Type.STRING }
    },
    action_items: {
      type: Type.ARRAY,
      description: "A list of action items or tasks mentioned in the lecture.",
      items: { type: Type.STRING }
    }
  },
  required: ["summary", "key_terms", "action_items"]
};

const topicsSchema = {
    type: Type.ARRAY,
    description: "A list of the main topics or concepts discussed in the transcript. Each topic should be a short, descriptive phrase.",
    items: { type: Type.STRING }
};


export const summarizeTranscript = async (transcript: string): Promise<SummaryData> => {
  const model = "gemini-2.5-flash";
  const systemInstruction = `You are an expert academic assistant. Your task is to create concise, exam-ready notes from lecture transcripts. 
  - Keep formulas and technical notation verbatim. 
  - Do not add any introductory or concluding remarks. 
  - Focus on extracting the key information into short, clear bullet points.
  - Generate three sections: "Summary", "Key Terms & Definitions", and "Action Items".`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Here is the lecture transcript:\n\n---\n${transcript}\n---`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: summarySchema,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    const validatedData: SummaryData = {
        summary: Array.isArray(parsed.summary) ? parsed.summary : [],
        key_terms: Array.isArray(parsed.key_terms) ? parsed.key_terms : [],
        action_items: Array.isArray(parsed.action_items) ? parsed.action_items : [],
    };

    return validatedData;

  } catch (error) {
    console.error("Error summarizing transcript with Gemini:", error);
    throw new Error("Failed to generate summary from the transcript.");
  }
};

export const translateTranscript = async (transcript: string, language: string): Promise<string> => {
    const model = "gemini-2.5-flash";
    const systemInstruction = `You are a highly skilled translator. Translate the following text into ${language}. 
    - Translate accurately, preserving the original meaning and tone.
    - Do not add any extra commentary or explanation.
    - Return only the translated text.`;

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: transcript,
        config: {
          systemInstruction: systemInstruction
        }
      });
      return response.text;
    } catch (error) {
      console.error(`Error translating transcript to ${language}:`, error);
      throw new Error(`Failed to translate transcript.`);
    }
};

export const extractTopics = async (transcript: string): Promise<string[]> => {
    const model = "gemini-2.5-flash";
    const systemInstruction = `You are a helpful assistant that analyzes lecture transcripts. Your task is to identify the main topics or key concepts as they are being discussed. 
    - Do not provide a summary or introduction.
    - Return only a list of topics.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `Analyze the following transcript and list the main topics:\n\n---\n${transcript}\n---`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: topicsSchema,
            },
        });
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Error extracting topics with Gemini:", error);
        throw new Error("Failed to extract topics from the transcript.");
    }
};

export const createChat = (transcript: string): Chat => {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a helpful AI assistant with expertise in the content of the following lecture transcript. Your role is to answer questions based *only* on the provided text. If the answer cannot be found in the transcript, say that you don't have that information. Do not use external knowledge.

    Here is the lecture transcript:
    ---
    ${transcript}
    ---`;
    
    return ai.chats.create({
        model,
        config: {
          systemInstruction,
        },
    });
};

export const analyzeTone = async (text: string): Promise<Tone> => {
    const model = "gemini-2.5-flash";
    const systemInstruction = `Analyze the following sentence for its primary tone and intent. Respond with a single word: "question", "emphasis" (for strong declarative statements), "humorous", "serious", or "neutral". Do not provide any explanation.`;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: text,
            config: {
                systemInstruction: systemInstruction,
                thinkingConfig: { thinkingBudget: 0 } // Low latency
            },
        });
        
        const result = response.text.trim().toLowerCase();
        if (result === 'question' || result === 'emphasis' || result === 'humorous' || result === 'serious') {
            return result;
        }
        return 'neutral';

    } catch(error) {
        console.error("Error analyzing tone:", error);
        return 'neutral'; // Default to neutral on error
    }
};
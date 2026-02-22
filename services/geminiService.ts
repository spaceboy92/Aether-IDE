
import { GoogleGenAI, Type } from "@google/genai";
import { FileNode, ChatMessage } from '../types';

const getAIClient = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Simplified Schema for Direct Action
const directResponseSchema = {
  type: Type.OBJECT,
  properties: {
    message: { type: Type.STRING, description: "A friendly, creative response to the user describing what you did." },
    files: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          operation: { type: Type.STRING, enum: ["create", "update", "delete"] },
          path: { type: Type.STRING, description: "File path, e.g., 'src/App.js'" },
          code: { type: Type.STRING, description: "The COMPLETE file content. Do not use placeholders." }
        },
        required: ["operation", "path", "code"]
      }
    },
    commands: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Optional terminal commands to run."
    }
  },
  required: ["message", "files"]
};

export interface SimpleAIResponse {
  message: string;
  files: {
    operation: 'create' | 'update' | 'delete';
    path: string;
    code: string;
  }[];
  commands?: string[];
  groundingLinks?: { uri: string; title: string }[];
}

export const enhancePrompt = async (originalPrompt: string): Promise<string> => {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [{ text: `You are an expert prompt engineer. Rewrite the following user prompt to be clear, precise, and optimized for an AI code generator. Keep the intent but add necessary technical details if implied. Return ONLY the rewritten prompt. Prompt: "${originalPrompt}"` }]
            }
        });
        return response.text?.trim() || originalPrompt;
    } catch (e) {
        console.error("Enhance failed", e);
        return originalPrompt;
    }
};

export const chatWithAI = async (
  prompt: string,
  currentFiles: FileNode[],
  history: ChatMessage[],
  attachments: { mimeType: string, data: string }[] = []
): Promise<SimpleAIResponse> => {
  const ai = getAIClient();
  
  const workspaceMap = currentFiles.map(f => {
    if (f.isBinary) return `[ASSET]: ${f.name}`;
    return `[FILE]: ${f.name}\n${f.content}`;
  }).join('\n\n');

  const systemInstruction = `
    You are AETHER, a high-performance creative coding engine.

    CONTEXT:
    You are writing code for a user's web project (HTML/JS/CSS). 
    The code you generate runs in an iframe.

    YOUR MISSION:
    Receive the user's request (e.g., "Make a 3D car game") and IMMEDIATELY generate the fully functional source code for that application.

    CRITICAL RULES:
    1. NO META-INTERFACES: DO NOT generate code that says "Thinking...", "Initializing...", "Aether AI", or "Cognitive Override". DO NOT generate a UI about the AI itself.
    2. ACTUAL APPLICATION: If asked for a car game, generate a canvas, a Three.js scene, a car mesh, controls, and a game loop.
    3. COMPLETE FILES: Return the FULL content for every file you touch (index.html, script.js, style.css). Do not use placeholders.
    4. LIBRARIES: Use CDN links for libraries (Three.js, GSAP, etc.).
    5. AESTHETICS: Make the user's app look professional and polished (unless requested otherwise).
    6. JSON OUTPUT: You must strictly return JSON matching the schema.

    Current Project State:
    ${workspaceMap}
  `;

  // Filter history to simple text parts for context (ignoring previous images to save tokens/complexity for now)
  const historyContents = history.slice(-10).map(msg => ({ 
      role: msg.role, 
      parts: [{ text: msg.text }] 
  }));

  const userParts: any[] = [{ text: `REQUEST: ${prompt}` }];
  
  // Add current attachments
  if (attachments && attachments.length > 0) {
      attachments.forEach(att => {
          userParts.push({
              inlineData: {
                  mimeType: att.mimeType,
                  data: att.data
              }
          });
      });
  }

  const contents = [
    ...historyContents,
    { role: 'user', parts: userParts }
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: directResponseSchema,
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "{}";
    let parsed: SimpleAIResponse;
    try {
        parsed = JSON.parse(text);
    } catch (e) {
        // Fallback if model outputs markdown code block
        const clean = text.replace(/```json/g, '').replace(/```/g, '');
        parsed = JSON.parse(clean);
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      parsed.groundingLinks = groundingChunks
        .map((chunk: any) => {
          if (chunk.web?.uri) {
            return { uri: chunk.web.uri, title: chunk.web.title || 'Source' };
          }
          return null;
        })
        .filter((link: any) => link !== null);
    }

    return parsed;
  } catch (error) {
    console.error("AI Error:", error);
    return {
        message: "I encountered a neural anomaly. Please try again.",
        files: []
    };
  }
};

export const generateMusicalScore = async (prompt: string, genre: string): Promise<any> => {
  const ai = getAIClient();
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      detectedGenre: { type: Type.STRING },
      bpm: { type: Type.INTEGER },
      tracks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["synth", "metal", "membrane"] },
            notes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  note: { type: Type.STRING },
                  duration: { type: Type.STRING }
                },
                required: ["time", "note", "duration"]
              }
            }
          },
          required: ["type", "notes"]
        }
      }
    },
    required: ["title", "detectedGenre", "bpm", "tracks"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [{ text: `Generate a 4-bar musical loop suitable for Tone.js playback. Genre: ${genre}. Description: ${prompt}` }]
      },
      config: {
        systemInstruction: `You are an expert AI composer. Generate a structured JSON musical score.
        - The output must be compatible with Tone.js Part sequencing.
        - Create a loopable 4-bar progression (Measure:Beat:Sixteenth format, from 0:0:0 to 3:3:0).
        - Use "synth" for melody/harmony, "metal" for hi-hats/cymbals, "membrane" for kicks/toms.
        - Ensure rhythmic interest appropriate for the genre.`,
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    });

    const text = response.text || "{}";
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        parsed = JSON.parse(text.replace(/```json|```/g, ''));
    }
    return parsed;
  } catch (e) {
    console.error("Music generation failed", e);
    return null;
  }
};

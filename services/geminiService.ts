
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ArtStyle, StoryGenerationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Generates the full story structure including pages and character descriptions.
 */
export const generateStoryStructure = async (
  topic: string,
  style: ArtStyle
): Promise<StoryGenerationResult> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `你是一个天才儿童绘本作家。请根据主题 "${topic}" 创作一个迷人的绘本故事。
    艺术风格为：${style}。
    
    指令要求：
    1. 必须使用与输入主题相同的语言（如果是中文，则书名和正文必须是中文）。
    2. 提供一个吸引人的书名 (title)。
    3. 提供一个“角色宝典 (characterBible)”：详细描述主角的外貌特征（颜色、衣服、特征），以确保画面一致性。注意：为了绘图效果，此段请用英文书写。
    4. 将故事分为恰好 6 页。每页 2-4 句话，语言要生动、适合儿童。
    5. 为每页提供详细的绘图提示词 (imagePrompt)。注意：绘图提示词必须是英文，描述场景并引用角色宝典中的细节。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          characterBible: { type: Type.STRING, description: "Detailed visual description of characters in English" },
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                imagePrompt: { type: Type.STRING, description: "Detailed image prompt in English" }
              },
              required: ["text", "imagePrompt"]
            }
          }
        },
        required: ["title", "characterBible", "pages"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as StoryGenerationResult;
};

/**
 * Generates an image for a specific page.
 */
export const generatePageImage = async (
  prompt: string,
  characterBible: string,
  style: ArtStyle
): Promise<string> => {
  const fullPrompt = `Art Style: ${style}. Scene: ${prompt}. Essential Character Details: ${characterBible}. High quality, children's book illustration, vibrant colors, magical atmosphere.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [{ text: fullPrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "4:3"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
};

/**
 * Generates speech for a text string.
 */
export const generatePageSpeech = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `用温柔亲切的语气朗读这段绘本故事：${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  return base64Audio;
};

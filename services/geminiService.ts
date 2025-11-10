
import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found in environment variables");
    }
    return new GoogleGenAI({ apiKey });
}

// Helper to convert File to Gemini inlineData part
const fileToPart = async (file: File) => {
  // Limit file size to 4MB to avoid XHR errors in browser
  if (file.size > 4 * 1024 * 1024) {
      throw new Error(`File ${file.name} is too large. Please use files under 4MB.`);
  }

  const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
           const result = reader.result as string;
           // Remove data url prefix (e.g. "data:application/pdf;base64,")
           const base64Data = result.split(',')[1];
           resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
  });
  
  // Determine mime type, default to application/pdf if file name ends in pdf
  let mimeType = file.type;
  if (!mimeType && file.name.toLowerCase().endsWith('.pdf')) {
      mimeType = 'application/pdf';
  }
  
  return {
      inlineData: {
          data: base64,
          mimeType: mimeType || 'application/pdf'
      }
  };
};

export const generateInspiration = async (topic: string, methodology: string, lang: Language): Promise<string> => {
  const ai = getClient();
  
  const langInstruction = lang === 'zh' 
    ? "Output strictly in Simplified Chinese (简体中文)." 
    : "Output in English.";

  let structurePrompt = "";

  if (methodology === 'quantitative') {
      structurePrompt = `
      1. **Proposed Title**: Academic and catchy.
      2. **Research Background**: Brief context (3-4 sentences).
      3. **Key Variables**: Independent, Dependent, Mediating/Moderating variables.
      4. **Research Hypotheses**: 2-3 probable hypotheses (H1, H2...).
      5. **Methodology**: Specific quantitative method (e.g., Survey, Experiment, Secondary Data).
      6. **Potential Contribution**: Theoretical or practical significance.
      `;
  } else if (methodology === 'qualitative') {
      structurePrompt = `
      1. **Proposed Title**: Evocative, focusing on the phenomenon.
      2. **Research Context**: The setting or phenomenon of interest.
      3. **Sensitizing Concepts**: Key theoretical concepts or lenses guiding the inquiry (Not variables).
      4. **Research Questions**: Open-ended "How" or "Why" questions (Not hypotheses).
      5. **Methodology**: Specific qualitative approach (e.g., Grounded Theory, Phenomenology, Ethnography, Case Study).
      6. **Data Collection**: e.g., In-depth interviews, Participant observation, Document analysis.
      `;
  } else if (methodology === 'theoretical') {
      structurePrompt = `
      1. **Proposed Title**: Abstract and conceptual.
      2. **Problematization**: The theoretical tension, paradox, or gap in existing literature.
      3. **Core Constructs**: Definitions of central concepts.
      4. **Theoretical Logic**: The primary mechanism or logic explaining relationships (Not statistical).
      5. **Propositions**: Theoretical propositions (P1, P2...) derived from logic.
      6. **Contribution**: How this extends, challenges, or integrates existing theory.
      `;
  }

  const prompt = `
    I am a social science researcher looking for inspiration. 
    Topic: "${topic}".
    Methodology Approach: ${methodology}
    
    Please generate a one-page research design draft following this structure:
    ${structurePrompt}

    ${langInstruction}
    Format the output in clean Markdown.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        systemInstruction: "You are a senior research mentor in social sciences. Your goal is to help students structure their fuzzy ideas into concrete research proposals suitable for the specific methodology chosen.",
    }
  });

  return response.text || "Failed to generate inspiration.";
};

export const analyzeFramework = async (textInput: string, file: File | null, lang: Language): Promise<string> => {
  const ai = getClient();

  const langInstruction = lang === 'zh' 
    ? "Output the analysis strictly in Simplified Chinese (简体中文)." 
    : "Output in English.";

  const textPart = {
      text: `
        You are an expert academic researcher. Analyze the provided text or document to extract the core research logic.
        
        ${textInput ? `Text content: "${textInput}"` : ''}

        **Instructions:**
        1. Check if the document content is readable academic text. If the content is gibberish, garbled, purely visual without OCR, or unreadable, YOU MUST output strictly: "ERROR_FILE_UNREADABLE".
        2. If valid, extract the research framework.
        3. **Do NOT use tables.** Use clean Markdown Headings (##) and bullet points.

        **Required Output Structure:**

        ## Research Question
        (State the primary question or objective clearly)

        ## Theoretical Framework
        (Identify theories, concepts, or models applied)

        ## Methodology
        (Describe study design, data collection, and analysis methods)

        ## Conclusions
        (Summarize key findings and conclusions)

        ${langInstruction}
      `
  };

  const parts: any[] = [textPart];
  
  if (file) {
      const filePart = await fileToPart(file);
      parts.push(filePart);
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts },
    config: {
        systemInstruction: "You are an expert at dissecting academic papers. You prioritize structural clarity.",
    }
  });

  return response.text || "Failed to analyze framework.";
};

export const generateLitReview = async (keywords: string, files: File[], lang: Language): Promise<{text: string, sources: any[]}> => {
  const ai = getClient();
  
  const langInstruction = lang === 'zh' 
    ? "Write the review in Simplified Chinese (简体中文), but keep the citations in their original language." 
    : "Write the review in English.";

  // Mode 1: Web Search based
  if (files.length === 0) {
      const prompt = `
        Find 5-7 recent and high-impact academic papers related to: "${keywords}".
        
        Synthesize them into a Literature Review draft. 
        Group the review by themes or methodologies. 
        End with a brief "Gap Analysis" suggesting what is missing in the current literature.
        
        ${langInstruction}
        Citations should be inline (Author, Year).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction: "You are an academic research assistant. You synthesize literature objectively and critically.",
        },
      });

      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return {
          text: response.text || "Failed to generate review.",
          sources: sources
      };
  } 
  
  // Mode 2: File based
  else {
      const parts: any[] = [];
      
      // Add files
      for (const file of files) {
          const part = await fileToPart(file);
          parts.push(part);
      }

      // Add Prompt
      parts.push({
          text: `
            Synthesize the attached academic papers into a Literature Review.
            
            Task:
            1. Identify common themes across these papers.
            2. Contrast their methodologies and findings.
            3. Structure the review logically (e.g., by theme).
            
            ${langInstruction}
            Refer to the papers as [Paper 1], [Paper 2] etc, or by their apparent author if visible.
          `
      });

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts },
          config: {
              systemInstruction: "You are an academic research assistant. You synthesize the provided documents into a coherent review.",
          }
      });

      return {
          text: response.text || "Failed to generate review from files.",
          sources: files.map(f => ({ web: { title: f.name, uri: '#' } })) // Mock sources structure for UI consistency
      };
  }
};

export const polishWriting = async (text: string, mode: 'polish' | 'citation', lang: Language): Promise<string> => {
  const ai = getClient();
  
  const langInstruction = lang === 'zh' 
    ? "Ensure the improved text is in Simplified Chinese (if the input is Chinese) or English (if input is English), but maintains a high academic standard." 
    : "Ensure the output is in English.";

  let prompt = "";
  if (mode === 'polish') {
      prompt = `
        Rewrite the following text to be more academic, concise, and formal. 
        Improve flow and vocabulary suitable for a high-impact social science journal.
        
        Text:
        "${text}"

        ${langInstruction}
      `;
  } else {
      prompt = `
        Format the following references into strict APA 7th Edition format.
        If the text is a paragraph, extract citations and format them.
        
        Text/List:
        "${text}"
      `;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        systemInstruction: "You are an academic editor. You value precision, clarity, and strict adherence to formatting guidelines.",
    }
  });

  return response.text || "Failed to process text.";
};

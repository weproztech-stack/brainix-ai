import * as Speech from "expo-speech";

/**
 * Markdown aur complex LaTeX math formulas ko ekdam natural human-like spoken English me convert karta hai
 */
export const cleanTextForSpeech = (text) => {
  if (!text || typeof text !== "string") return "";

  let cleaned = text
    // 1. LaTeX Math fractions & roots formatting
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 over $2")
    .replace(/\\sqrt\{([^}]+)\}/g, "square root of $1")
    .replace(/\^2/g, " squared")
    .replace(/\^3/g, " cubed")
    .replace(/\^([0-9]+)/g, " to the power of $1")
    .replace(/\\boxed\{([^}]+)\}/g, "$1")
    .replace(/\$\$.*?\$\$/gs, " mathematical expression ")
    .replace(/\$.*?\$/g, "")
    // 2. Mathematical Operators translation
    .replace(/\b=\b/g, " equals ")
    .replace(/\+\b/g, " plus ")
    .replace(/-\b/g, " minus ")
    .replace(/\*\b/g, " multiplied by ")
    .replace(/\/\b/g, " divided by ")
    // 3. Markdown formatting cleanup (bold, italics, code blocks, bullet symbols)
    .replace(/[*#_`~>[\]()\\:]/g, " ")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();

  // 4. 🛡️ CRITICAL FIX: Prevent word repetitions (e.g., "multiply by multiply by" -> "multiply by")
  const words = cleaned.split(" ");
  const uniqueWords = [];
  for (let i = 0; i < words.length; i++) {
    // Agar pichla word aur current word same hain toh skip karo taaki repetition na ho
    if (i === 0 || words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
      uniqueWords.push(words[i]);
    }
  }

  return uniqueWords.join(" ");
};

/**
 * 1. AI Response ko naturally human-like speak karega
 */
export const speakAIResponse = async (text, onStart, onDone) => {
  const speechText = cleanTextForSpeech(text);

  if (!speechText) {
    if (onDone) onDone();
    return;
  }

  try {
    // Agar koi audio pehle se chal rahi ho toh stop karein
    await Speech.stop();

    Speech.speak(speechText, {
      language: "en-IN", // Indian English for clear, natural human-like pronunciation
      pitch: 1.0,
      rate: 0.9, // Thoda calm aur smooth tempo taaki bot jaisa na lage
      onStart: () => {
        if (onStart) onStart();
      },
      onDone: () => {
        if (onDone) onDone();
      },
      onStopped: () => {
        if (onDone) onDone();
      },
      onError: (err) => {
        console.error("Speech Execution Error:", err);
        if (onDone) onDone();
      }
    });
  } catch (error) {
    console.error("Text-to-speech Initialization Error:", error);
    if (onDone) onDone();
  }
};

/**
 * 2. Currently playing voice playback ko instant stop karega
 */
export const stopSpeaking = async () => {
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }
  } catch (e) {
    Speech.stop();
  }
};
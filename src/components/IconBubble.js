import React from "react";
import { View, Text } from "react-native";

import colors from "../constants/colors";
import commonStyles from "../styles/commonStyles";

function tint(color) {
  if (color === colors.green) return "#E5F8EF";
  if (color === colors.orange) return "#FFF0E7";
  if (color === colors.blue) return "#E9F1FF";
  if (color === colors.red) return "#FFECEC";
  return "#F1ECFF";
}

function getIcon(label) {
  const map = {
    // --- ChatGPT Core Features ---
    voice: "🎙️",        // ChatGPT Voice Mode
    mic: "🎤",          // Microphone input
    chat: "💬",         // New Chat
    canvas: "🎨",       // ChatGPT Canvas Mode
    search: "🔍",       // Web Search / Browse
    web: "🌐",          // Web Browsing
    code: "💻",         // Code Interpreter / Python
    dalle: "🖼️",        // DALL-E Image Generation
    vision: "👁️",       // Vision / Image Upload
    reasoning: "🧠",    // O1 / Deep Research Reasoning
    gpt: "🤖",          // Custom GPTs / Assistants
    memory: "🧠",       // Memory & Personalization

    // --- Media & File Uploads ---
    cam: "📷",          // Camera Snap
    img: "🖼️",          // Photo Gallery
    pdf: "📄",          // PDF Document
    doc: "📑",          // Text Document / Notes
    attach: "📎",       // Attach File
    file: "📁",         // File Browser

    // --- Account & Pro Features ---
    pro: "👑",          // ChatGPT Plus / Pro / Team
    star: "⭐",         // Favorites / Bookmarks
    settings: "⚙️",     // Settings
    help: "❓",         // Help & Support
    logout: "🚪",       // Logout

    // --- Educational & STEM Subjects ---
    cal: "📅",          // Calculator / Calendar
    math: "➗",         // Mathematics
    phy: "⚛️",          // Physics
    bio: "🌿",          // Biology
    chem: "🧪",         // Chemistry
    cube: "📦",         // Geometry / 3D
    int: "∫",           // Calculus / Integration
    book: "📚",         // Study Material / Summarize
    dna: "🧬",          // Life Sciences
    sqrt: "√",          // Algebra / Roots
    key: "⌨️",         // Keyboard / Prompt

    // --- Quick Action Tools (ChatGPT Response Controls) ---
    copy: "📋",         // Copy Code / Answer
    refresh: "🔄",      // Regenerate Response
    like: "👍",         // Good Response
    dislike: "👎",      // Bad Response
    share: "📤",        // Share Conversation
    edit: "✏️",         // Edit Prompt
    idea: "💡",         // Brainstorm Ideas / Prompts
    sparkles: "✨",     // AI Magic / Enhancement

    "+": "➕"
  };

  return map[label] || label;
}

export default function IconBubble({
  label,
  color = colors.purple,
  size = 54
}) {
  return (
    <View
      style={[
        commonStyles.iconBubble,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: tint(color)
        }
      ]}
    >
      <Text
        style={{
          fontSize: size > 50 ? 22 : 16
        }}
      >
        {getIcon(label)}
      </Text>
    </View>
  );
}
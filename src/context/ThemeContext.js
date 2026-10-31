import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // 📱 Detect phone system theme ('dark' or 'light')
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === "dark";

  // Dynamic Colors Palette
  const theme = {
    isDark,
    bg: isDark ? "#0F172A" : "#F8FAFC",
    card: isDark ? "#1E293B" : "#FFFFFF",
    text: isDark ? "#F8FAFC" : "#0F172A",
    subText: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    primary: "#6C4DFF",
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
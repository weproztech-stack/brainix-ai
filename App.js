import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import AppNavigator from "./src/navigation/AppNavigator";

function MainApp() {
  const theme = useTheme();
  
  return (
    <>
      <StatusBar
        barStyle={theme?.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme?.bg || "#F8FAFC"}
        animated
      />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
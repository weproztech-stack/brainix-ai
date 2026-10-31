import React, { useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Brand from "../components/Brand";
import Robot from "../components/Robot";

import splashStyles from "../styles/splashStyles";

export default function SplashScreen({ onDone }) {

  useEffect(() => {
    let isMounted = true;

    const checkSessionAndFinish = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        
        // 2.5 Seconds Splash Animation Delay
        setTimeout(() => {
          if (isMounted && onDone) {
            onDone(token ? "home" : "onboarding");
          }
        }, 2500);

      } catch (error) {
        if (isMounted && onDone) {
          onDone("onboarding");
        }
      }
    };

    checkSessionAndFinish();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={splashStyles.splashSafe}>
      {/* Background Decor Shapes */}
      <View style={splashStyles.decor1} />
      <View style={splashStyles.decor2} />

      {/* Main Center Content */}
      <View style={splashStyles.splashCenter}>
        <Robot size={150} />

        <View style={{ marginTop: 24 }}>
          <Brand large />
        </View>

        <Text style={splashStyles.splashTag}>
          Your Smart Study Companion
        </Text>

        <View style={splashStyles.tipCard}>
          <View style={splashStyles.tipIcon}>
            <Text style={splashStyles.tipIconText}>🎓</Text>
          </View>

          <Text style={splashStyles.tipText}>
            Solve any question.
            {"\n"}
            Learn better. Achieve more.
          </Text>
        </View>
      </View>

      {/* Wave Background Decorative Elements */}
      <View style={splashStyles.wave1} />
      <View style={splashStyles.wave2} />
      <View style={splashStyles.wave3} />

      {/* Bottom Progress Bar */}
      <View style={splashStyles.splashBottom}>
        <View style={splashStyles.loader}>
          <View style={splashStyles.loaderFill} />
        </View>

        <Text style={splashStyles.loadingText}>
          Loading...
        </Text>
      </View>
    </SafeAreaView>
  );
}
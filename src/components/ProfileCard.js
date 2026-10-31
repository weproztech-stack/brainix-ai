import React from "react";
import {
  View,
  Text,
  TouchableOpacity
} from "react-native";

import commonStyles from "../styles/commonStyles";
import profileStyles from "../styles/profileStyles";

export default function ProfileCard({
  user,
  onPress
}) {
  // Extract dynamic details
  const name = user?.name || "Student User";
  const email = user?.email || "student@brainixai.com";
  
  // Check if user is on Pro Plan
  const isPro = user?.is_pro || user?.plan === "pro" || user?.is_premium;

  // Dynamic Initials Generator (e.g., "Mohammad Atif" -> "MA")
  const getInitials = (fullName) => {
    if (!fullName) return "ST";
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <TouchableOpacity
      style={profileStyles.profileCard}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={profileStyles.profileTop}>
        {/* Dynamic Avatar Initials */}
        <View style={profileStyles.avatarLarge}>
          <Text style={commonStyles.avatarText}>
            {initials}
          </Text>
        </View>

        <View style={profileStyles.profileInfo}>
          {/* Dynamic User Name */}
          <View style={profileStyles.nameRow}>
            <Text style={profileStyles.profileBig} numberOfLines={1}>
              {name}
            </Text>

            <Text style={profileStyles.verified}>
              ✓
            </Text>
          </View>

          {/* Dynamic User Email */}
          <Text style={profileStyles.profileEmail} numberOfLines={1}>
            {email}
          </Text>

          {/* Dynamic Badges Row: Class/Grade & Plan Status */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
            
            {/* Free vs Pro Badge */}
            <View style={[
              profileStyles.proBadge, 
              !isPro && { backgroundColor: "rgba(148, 163, 184, 0.15)", borderColor: "#64748B" }
            ]}>
              <Text style={[
                profileStyles.proBadgeText, 
                !isPro && { color: "#94A3B8" }
              ]}>
                {isPro ? "👑 Pro Plan" : "🎁 Free Plan"}
              </Text>
            </View>

            {/* Class / Grade Badge */}
            {user?.class_grade && (
              <View style={[profileStyles.proBadge, { backgroundColor: "rgba(108, 77, 255, 0.15)" }]}>
                <Text style={profileStyles.proBadgeText}>
                  🎓 {user.class_grade}
                </Text>
              </View>
            )}

          </View>
        </View>

        <Text style={profileStyles.arrow}>
          ›
        </Text>
      </View>

      <Text style={profileStyles.profileBio}>
        AI powered learning enthusiast.
        Solving questions faster with
        Brainix AI.
      </Text>
    </TouchableOpacity>
  );
}
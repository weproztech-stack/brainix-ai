import React from "react";
import {
  View,
  Text,
  TouchableOpacity
} from "react-native";

import colors from "../constants/colors";
import IconBubble from "./IconBubble";

import profileStyles from "../styles/profileStyles";

function subtitle(rawItem) {
  const itemKey = rawItem.includes(":") ? rawItem.split(":")[0].trim() : rawItem;

  return {
    Profile: "View and edit your profile",
    "Study Preferences": "Subjects, classes and more",
    Language: "Choose your preferred language",
    Appearance: "Choose theme and color mode",
    Notifications: "Manage push notifications",
    "Privacy & Security": "Manage your data and privacy",
    "Clear Chat History": "Remove all your chat history",
    "Download Settings": "PDF quality, auto-download",
    "Storage Usage": "Manage app storage",
    "Help & Support": "Get help and contact us",
    "Rate Us": "If you enjoy using Brainix AI",
    About: "App version and information",

    "Personal Information": "Edit your name, email and contact",
    Name: "Your registered full name",
    Email: "Your account email address",
    "Change Password": "Update your password",
    "Account Security": "Manage login and security",

    "Subjects of Interest": "Manage your favorite subjects",
    "Class / Grade": "Update your class or grade",
    "Learning Goal": "Tell us what you want to achieve",
    "Upgrade Subscription": "Get unlimited questions & pro tools",

    "Export My Data": "Download your data and history",
    "Delete Account": "Permanently delete your account"
  }[itemKey] || "";
}

function getIcon(rawItem) {
  const text = rawItem.toLowerCase();

  if (text.includes("name")) return "👤";
  if (text.includes("email")) return "✉️";
  if (text.includes("password")) return "🔑";
  if (text.includes("security")) return "🛡️";
  if (text.includes("class") || text.includes("grade")) return "🎓";
  if (text.includes("subject")) return "📚";
  if (text.includes("goal")) return "🎯";
  if (text.includes("subscription") || text.includes("upgrade")) return "👑";
  if (text.includes("export")) return "📥";
  if (text.includes("delete")) return "🗑️";
  if (text.includes("language")) return "🌐";
  if (text.includes("appearance")) return "🎨";
  if (text.includes("notification")) return "🔔";
  if (text.includes("privacy")) return "🔒";
  if (text.includes("history")) return "📜";
  if (text.includes("help") || text.includes("support")) return "❓";

  return "⚙️";
}

export default function SettingsGroup({
  title,
  items = [],
  values = {},
  onProfile,
  onPressItem
}) {
  return (
    <View style={profileStyles.groupWrap}>
      {title && (
        <Text style={profileStyles.groupTitle}>
          {title}
        </Text>
      )}

      <View style={profileStyles.settingsCard}>
        {items.map((item) => {
          // Handle colon separated items like "Name: Mohammad Atif"
          const hasValueInItem = item.includes(":");
          const itemTitle = hasValueInItem ? item.split(":")[0].trim() : item;
          const itemValue = hasValueInItem ? item.split(":")[1].trim() : values[item];

          const isDelete = itemTitle === "Delete Account";

          return (
            <TouchableOpacity
              key={item}
              style={profileStyles.settingRow}
              onPress={() => {
                if (itemTitle === "Profile" && onProfile) {
                  onProfile();
                } else if (onPressItem) {
                  onPressItem(item);
                }
              }}
              activeOpacity={0.7}
            >
              <IconBubble
                label={getIcon(itemTitle)}
                color={isDelete ? colors.red || "#EF4444" : colors.purple || "#6C4DFF"}
                size={42}
              />

              <View
                style={{
                  flex: 1,
                  marginLeft: 12
                }}
              >
                <Text
                  style={[
                    profileStyles.settingTitle,
                    isDelete && { color: "#EF4444" }
                  ]}
                  numberOfLines={1}
                >
                  {itemTitle}
                </Text>

                <Text style={profileStyles.settingSubtitle}>
                  {subtitle(itemTitle)}
                </Text>
              </View>

              {itemValue === "on" ? (
                <View style={profileStyles.toggle}>
                  <View style={profileStyles.toggleKnob} />
                </View>
              ) : (
                <Text style={profileStyles.value} numberOfLines={1}>
                  {itemValue || "›"}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
import { StyleSheet } from "react-native";

// 🎨 Dynamic Theme Function Export for HomeScreen & Modals
export const getHomeStyles = (isDark = false) => {
  const theme = {
    bg: isDark ? "#0F172A" : "#F8FAFC",
    card: isDark ? "#1E293B" : "#FFFFFF",
    cardSub: isDark ? "#334155" : "#FAFBFF",
    text: isDark ? "#F8FAFC" : "#111827",
    subText: isDark ? "#94A3B8" : "#7B8199",
    metaText: isDark ? "#64748B" : "#9CA3AF",
    border: isDark ? "#334155" : "#E2E8F0",
    shadowColor: isDark ? "#000000" : "#8A8FB5",
  };

  const shadow = {
    shadowColor: theme.shadowColor,
    shadowOpacity: isDark ? 0.3 : 0.16,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10
    },
    elevation: isDark ? 8 : 5
  };

  return StyleSheet.create({
    heroCard: {
      backgroundColor: theme.card,
      borderRadius: 30,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
      ...shadow
    },

    heroTitle: {
      marginTop: 14,
      fontSize: 28,
      fontWeight: "900",
      color: theme.text
    },

    heroSub: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: 22,
      textAlign: "center",
      color: theme.subText
    },

    homeActions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 22,
      width: "100%"
    },

    featureButton: {
      flex: 1,
      backgroundColor: theme.cardSub,
      borderRadius: 20,
      padding: 16,
      minHeight: 150,
      position: "relative",
      borderWidth: 1,
      borderColor: theme.border
    },

    featureTitle: {
      marginTop: 12,
      fontSize: 15,
      fontWeight: "900",
      color: theme.text
    },

    featureSub: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 18,
      color: theme.subText
    },

    featureChevron: {
      position: "absolute",
      right: 16,
      bottom: 14,
      fontSize: 18,
      fontWeight: "900",
      color: theme.text
    },

    sectionHead: {
      marginTop: 26,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between"
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: "900",
      color: theme.text
    },

    link: {
      color: "#6C4DFF",
      fontWeight: "800"
    },

    questionRow: {
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: 12,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
      ...shadow
    },

    questionRowCompact: {
      paddingVertical: 8,
      marginBottom: 8
    },

    questionText: {
      flex: 1,
      marginHorizontal: 12
    },

    questionTitle: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.text
    },

    questionMeta: {
      marginTop: 4,
      fontSize: 12,
      color: theme.subText
    },

    questionTime: {
      fontSize: 11,
      color: theme.metaText,
      marginRight: 10
    },

    rowArrow: {
      fontSize: 16,
      color: theme.metaText,
      fontWeight: "900"
    },

    safeHistory: {
      marginTop: 12,
      textAlign: "center",
      color: theme.metaText,
      fontSize: 12,
      marginBottom: 90
    },

    composer: {
      position: "absolute",
      left: 14,
      right: 14,
      bottom: 14,
      minHeight: 62,
      maxHeight: 120,
      backgroundColor: theme.card,
      borderRadius: 31,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadow
    },

    plus: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? "rgba(108, 77, 255, 0.2)" : "#F1ECFF",
      alignItems: "center",
      justifyContent: "center"
    },

    plusText: {
      color: "#6C4DFF",
      fontSize: 22,
      fontWeight: "900"
    },

    composerInput: {
      flex: 1,
      marginLeft: 12,
      marginRight: 8,
      fontSize: 15,
      color: theme.text,
      paddingVertical: 0,
      maxHeight: 90
    },

    composeIcon: {
      marginHorizontal: 4,
      fontSize: 18
    },

    send: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "#6C4DFF",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 6
    },

    sendText: {
      color: "#FFFFFF",
      fontSize: 20,
      fontWeight: "900"
    },

    drawerWrap: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: "row",
      zIndex: 9999,
      elevation: 9999
    },

    drawer: {
      width: "84%",
      height: "100%",
      backgroundColor: theme.card,
      paddingTop: 50,
      paddingHorizontal: 18,
      borderTopRightRadius: 24,
      borderBottomRightRadius: 24,
      borderRightWidth: 1,
      borderColor: theme.border,
      ...shadow
    },

    drawerRest: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)"
    },

    drawerProfile: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 18,
      marginBottom: 18,
      borderBottomWidth: 1,
      borderBottomColor: theme.border
    },

    newQuestion: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(108, 77, 255, 0.15)" : "#F8F5FF",
      borderRadius: 18,
      padding: 14,
      marginBottom: 20
    },

    newQuestionText: {
      marginLeft: 12,
      fontSize: 15,
      fontWeight: "800",
      color: theme.text
    },

    upgradeCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(108, 77, 255, 0.2)" : "#F3EEFF",
      borderRadius: 18,
      padding: 14,
      marginTop: 20,
      marginBottom: 20
    },

    uploadTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: theme.text
    },

    drawerLink: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.border
    },

    drawerLinkText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 14,
      fontWeight: "600",
      color: theme.text
    },

    profileName: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.text
    },

    drawerHeading: {
      fontSize: 15,
      fontWeight: "800",
      color: theme.text,
      marginTop: 12,
      marginBottom: 12
    },

    drawerDate: {
      fontSize: 12,
      color: theme.subText,
      fontWeight: "700",
      marginTop: 10,
      marginBottom: 6
    }
  });
};

// Standard Default Light Mode Fallback Export
const homeStyles = getHomeStyles(false);
export default homeStyles;
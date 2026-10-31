
import { StyleSheet } from "react-native";

const shadow = {
  shadowColor: "#8A8FB5",
  shadowOpacity: 0.16,
  shadowRadius: 18,
  shadowOffset: {
    width: 0,
    height: 10
  },
  elevation: 5
};

const commonStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F5FF"
  },

  pad: {
    padding: 20,
    paddingBottom: 120
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827"
  },

  square: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...shadow
  },

  squareText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827"
  },

  brand: {
    flexDirection: "row",
    alignItems: "center"
  },

  brandText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827"
  },

  brandAi: {
    fontSize: 24,
    fontWeight: "900",
    color: "#6C4DFF"
  },

  brandTextLarge: {
    fontSize: 34
  },

  spark: {
    marginLeft: 4,
    color: "#6C4DFF",
    fontWeight: "900",
    fontSize: 12
  },

  pro: {
    backgroundColor: "#EEE8FF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8
  },

  proText: {
    color: "#6C4DFF",
    fontWeight: "900",
    fontSize: 12
  },

  restore: {
    color: "#6C4DFF",
    fontWeight: "800",
    fontSize: 14
  },

  iconBubble: {
    alignItems: "center",
    justifyContent: "center"
  },

  iconLabel: {
    fontWeight: "900"
  },

  robot: {
    alignItems: "center",
    justifyContent: "center"
  },

  robotGlow: {
    position: "absolute",
    backgroundColor: "#ECE7FF"
  },

  robotHead: {
    backgroundColor: "#6C4DFF",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center"
  },

  robotFace: {
    flexDirection: "row",
    gap: 12
  },

  robotEye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF"
  },

  robotAntenna: {
    position: "absolute",
    top: 10,
    width: 4,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#6C4DFF"
  },

  rowArrow: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "900"
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#6C4DFF",
    alignItems: "center",
    justifyContent: "center"
  },

  avatarText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16
  },

  profileName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827"
  },

  badge: {
    color: "#6C4DFF",
    fontWeight: "700",
    marginTop: 4,
    fontSize: 12
  },

  drawerHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
    marginTop: 20,
    marginBottom: 12
  },

  drawerDate: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8A8FB5",
    marginTop: 12,
    marginBottom: 8
  },

  drawerLinkText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827"
  }
});

export default commonStyles;

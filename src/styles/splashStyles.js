import { StyleSheet } from "react-native";

const splashStyles = StyleSheet.create({
  splashSafe: {
    flex: 1,
    backgroundColor: "#F7F5FF"
  },

  decor1: {
    position: "absolute",
    bottom: -40,
    left: -50,
    width: 260,
    height: 120,
    borderRadius: 120,
    backgroundColor: "#E9E2FF",
    transform: [{ rotate: "-8deg" }]
  },

  decor2: {
    position: "absolute",
    bottom: -30,
    right: -50,
    width: 280,
    height: 120,
    borderRadius: 120,
    backgroundColor: "#E3DBFF",
    transform: [{ rotate: "10deg" }]
  },

  splashCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },

  splashTag: {
    marginTop: 12,
    fontSize: 16,
    color: "#7B8199",
    fontWeight: "600",
    textAlign: "center"
  },

  tipCard: {
    marginTop: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,

    shadowColor: "#8A8FB5",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 8
    },
    elevation: 5
  },

  tipText: {
    fontSize: 12,
    color: "#7B8199",
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "600"
  },

  splashBottom: {
    alignItems: "center",
    paddingBottom: 40
  },

  loader: {
    width: 120,
    height: 6,
    borderRadius: 10,
    backgroundColor: "#DDD7FF",
    overflow: "hidden"
  },

  loaderFill: {
    width: 70,
    height: 6,
    borderRadius: 10,
    backgroundColor: "#6C4DFF"
  },

  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: "#8A8FB5",
    fontWeight: "500"
  }
});

export default splashStyles;
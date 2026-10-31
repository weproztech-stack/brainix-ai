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

const onboardingStyles = StyleSheet.create({
  onboardSafe: {
    flex: 1,
    backgroundColor: "#F7F5FF",
    padding: 22
  },

  phoneStatus: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  time: {
    color: "#111",
    fontWeight: "900",
    fontSize: 13
  },

  statusIcons: {
    color: "#111",
    fontSize: 10,
    fontWeight: "900"
  },

  skip: {
    position: "absolute",
    right: 22,
    top: 58,
    zIndex: 2
  },

  skipText: {
    color: "#6C4DFF",
    fontWeight: "900"
  },

  onboardArt: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },

  artBlob: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#E9E2FF",
    alignItems: "center",
    justifyContent: "center"
  },

  paper: {
    width: 140,
    height: 170,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 18,
    transform: [{ rotate: "6deg" }],
    ...shadow
  },

  formula: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 14
  },

  lineLong: {
    height: 8,
    borderRadius: 6,
    backgroundColor: "#DDDFF0",
    marginTop: 14,
    width: "90%"
  },

  lineShort: {
    height: 8,
    borderRadius: 6,
    backgroundColor: "#E7E8F4",
    marginTop: 10,
    width: "62%"
  },

  triangle: {
    marginTop: 18,
    width: 0,
    height: 0,
    borderLeftWidth: 34,
    borderRightWidth: 10,
    borderBottomWidth: 44,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#CBD1E9"
  },

  cameraBadge: {
    position: "absolute",
    left: 36,
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#6C4DFF",
    alignItems: "center",
    justifyContent: "center",
    ...shadow
  },

  cameraText: {
    color: "#FFFFFF",
    fontSize: 20
  },

  chatTop: {
    position: "absolute",
    top: 32,
    right: 36,
    backgroundColor: "#6C4DFF",
    borderRadius: 14,
    padding: 14
  },

  chatTopText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12
  },

  solutionCardMini: {
    width: 180,
    height: 132,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 18,
    alignItems: "center",
    ...shadow
  },

  formulaPill: {
    color: "#6C4DFF",
    backgroundColor: "#F0EBFF",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
    fontWeight: "900"
  },

  historyMini: {
    width: 180,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 14,
    ...shadow
  },

  historyMiniHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },

  historyMiniTitle: {
    color: "#111827",
    fontWeight: "900"
  },

  historyMiniRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginTop: 8
  },

  historyMiniQuestion: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 10
  },

  miniLine: {
    height: 4,
    borderRadius: 4,
    backgroundColor: "#E6E8F4",
    marginTop: 4
  },

  miniTime: {
    color: "#7B8199",
    fontSize: 8,
    fontWeight: "900"
  },

  clockBadge: {
    position: "absolute",
    right: 18,
    bottom: 30,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#6C4DFF",
    alignItems: "center",
    justifyContent: "center",
    ...shadow
  },

  clockText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900"
  },

  onboardTitle: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 38,
    textAlign: "center"
  },

  onboardAccent: {
    color: "#6C4DFF"
  },

  onboardBody: {
    color: "#7B8199",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 14,
    fontWeight: "600"
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginVertical: 34
  },

  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#D6D6EA"
  },

  dotActive: {
    backgroundColor: "#6C4DFF"
  },

  nextButton: {
    height: 60,
    borderRadius: 14,
    backgroundColor: "#6C4DFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...shadow
  },

  nextText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16
  },

  nextArrow: {
    position: "absolute",
    right: 24,
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18
  }
});

export default onboardingStyles;
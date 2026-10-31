import { StyleSheet } from "react-native";

export const examStyles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Clean Light Theme Background
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110, // Extra padding to keep content above BottomTabs
  },

  /* ⚙️ Group Section Layout */
  sectionGroup: {
    marginTop: 16,
  },
  groupHeaderTitle: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },

  /* 🎯 Exam Selection Chips */
  examScroll: {
    flexDirection: "row",
    marginBottom: 4,
  },
  examChip: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  examChipSelected: {
    backgroundColor: "#6C4DFF",
    borderColor: "#6C4DFF",
  },
  examChipText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  examChipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  /* 📚 Group Cards & Lists */
  groupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  settingsRowClickable: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
  },
  subjectLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  rowLabelClickable: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "600",
  },
  chevronIcon: {
    color: "#94A3B8",
    fontSize: 18,
    fontWeight: "bold",
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },

  /* ⚡ Mock Exam / Practice Action Button */
  mockExamButton: {
    backgroundColor: "#6C4DFF",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
    shadowColor: "#6C4DFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  mockExamButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  appVersionText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 11,
    fontStyle: "italic",
    marginBottom: 10,
  }
});

export default examStyles;
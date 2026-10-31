import { StyleSheet } from "react-native";

const shadow = {
shadowColor: "#8A8FB5",
shadowOpacity: 0.12,
shadowRadius: 16,
shadowOffset: {
width: 0,
height: 8
},
elevation: 4
};

const profileStyles = StyleSheet.create({
container: {
padding: 20,
paddingBottom: 120
},

profileCard: {
backgroundColor: "#FFFFFF",
borderRadius: 24,
padding: 20,
marginBottom: 20,
...shadow
},

profileTop: {
flexDirection: "row",
alignItems: "center"
},

avatarLarge: {
width: 80,
height: 80,
borderRadius: 40,
backgroundColor: "#6C4DFF",
alignItems: "center",
justifyContent: "center"
},

profileInfo: {
flex: 1,
marginLeft: 14
},

nameRow: {
flexDirection: "row",
alignItems: "center"
},

profileBig: {
fontSize: 20,
fontWeight: "900",
color: "#111827"
},

verified: {
marginLeft: 8,
color: "#10B981",
fontWeight: "900",
fontSize: 16
},

profileEmail: {
marginTop: 4,
fontSize: 13,
color: "#7B8199"
},

proBadge: {
alignSelf: "flex-start",
marginTop: 8,
backgroundColor: "#EEE8FF",
paddingHorizontal: 10,
paddingVertical: 6,
borderRadius: 20
},

proBadgeText: {
color: "#6C4DFF",
fontSize: 12,
fontWeight: "800"
},

arrow: {
fontSize: 28,
color: "#9CA3AF"
},

profileBio: {
marginTop: 14,
color: "#6B7280",
lineHeight: 20
},

statsRow: {
flexDirection: "row",
justifyContent: "space-between",
marginBottom: 20
},

statCard: {
flex: 1,
backgroundColor: "#FFFFFF",
borderRadius: 18,
paddingVertical: 18,
alignItems: "center",
marginHorizontal: 4,
...shadow
},

statNumber: {
fontSize: 22,
fontWeight: "900",
color: "#111827"
},

statLabel: {
marginTop: 6,
fontSize: 12,
color: "#7B8199"
},

groupWrap: {
marginBottom: 18
},

groupTitle: {
fontSize: 17,
fontWeight: "800",
color: "#111827",
marginBottom: 10
},

settingsCard: {
backgroundColor: "#FFFFFF",
borderRadius: 22,
overflow: "hidden",
...shadow
},

settingRow: {
flexDirection: "row",
alignItems: "center",
padding: 16,
borderBottomWidth: 1,
borderBottomColor: "#F3F4F6"
},

settingTitle: {
fontSize: 15,
fontWeight: "700",
color: "#111827"
},

settingSubtitle: {
marginTop: 3,
fontSize: 12,
color: "#7B8199"
},

value: {
color: "#9CA3AF",
fontSize: 18,
fontWeight: "700"
},

toggle: {
width: 44,
height: 24,
borderRadius: 12,
backgroundColor: "#6C4DFF",
justifyContent: "center",
paddingHorizontal: 3
},

toggleKnob: {
width: 18,
height: 18,
borderRadius: 9,
backgroundColor: "#FFFFFF",
alignSelf: "flex-end"
},

tabs: {
position: "absolute",
left: 12,
right: 12,
bottom: 12,
backgroundColor: "#FFFFFF",
borderRadius: 22,
flexDirection: "row",
justifyContent: "space-around",
paddingVertical: 12,
...shadow
},

tab: {
alignItems: "center"
},

tabIcon: {
fontSize: 20,
color: "#9CA3AF"
},

tabText: {
marginTop: 4,
fontSize: 11,
color: "#9CA3AF",
fontWeight: "600"
},

tabActive: {
color: "#6C4DFF"
}
});

export default profileStyles;

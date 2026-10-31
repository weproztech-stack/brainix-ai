import { StyleSheet } from "react-native";

const shadow = {
shadowColor: "#8A8FB5",
shadowOpacity: 0.12,
shadowRadius: 16,
shadowOffset: {
width: 0,
height: 8
},
elevation: 5
};

const premiumStyles = StyleSheet.create({
container: {
padding: 20,
paddingBottom: 120
},

hero: {
backgroundColor: "#FFFFFF",
borderRadius: 28,
padding: 22,
marginBottom: 20,
...shadow
},

heroTitle: {
fontSize: 32,
fontWeight: "900",
color: "#111827",
lineHeight: 40
},

heroAccent: {
color: "#6C4DFF"
},

heroSub: {
marginTop: 12,
color: "#7B8199",
fontSize: 14,
lineHeight: 22
},

robotWrap: {
alignItems: "center",
marginTop: 20,
marginBottom: 10
},

featureGrid: {
flexDirection: "row",
flexWrap: "wrap",
justifyContent: "space-between",
marginBottom: 24
},

featureCard: {
width: "48%",
backgroundColor: "#FFFFFF",
borderRadius: 18,
padding: 14,
marginBottom: 12,
...shadow
},

featureIcon: {
fontSize: 20,
marginBottom: 8
},

featureTitle: {
fontSize: 13,
fontWeight: "800",
color: "#111827"
},

featureSub: {
marginTop: 4,
fontSize: 11,
color: "#7B8199",
lineHeight: 16
},

planHeading: {
fontSize: 20,
fontWeight: "900",
color: "#111827",
marginBottom: 16
},

plan: {
backgroundColor: "#FFFFFF",
borderRadius: 22,
padding: 18,
marginBottom: 16,
borderWidth: 2,
borderColor: "#F1F2F6",
flexDirection: "row",
alignItems: "center",
...shadow
},

planSelected: {
borderColor: "#6C4DFF"
},

radio: {
width: 24,
height: 24,
borderRadius: 12,
borderWidth: 2,
borderColor: "#D1D5DB",
marginRight: 14
},

radioActive: {
borderColor: "#6C4DFF",
backgroundColor: "#6C4DFF"
},

planTitle: {
fontSize: 18,
fontWeight: "800",
color: "#111827"
},

planSub: {
marginTop: 4,
color: "#7B8199",
fontSize: 12
},

planNote: {
marginTop: 8,
color: "#6C4DFF",
fontWeight: "700",
fontSize: 12
},

saveBadge: {
backgroundColor: "#DCFCE7",
paddingHorizontal: 8,
paddingVertical: 4,
borderRadius: 10,
marginBottom: 8
},

saveText: {
color: "#16A34A",
fontWeight: "800",
fontSize: 11
},

price: {
fontSize: 28,
fontWeight: "900",
color: "#111827"
},

oldPrice: {
marginTop: 4,
textDecorationLine: "line-through",
color: "#9CA3AF",
fontSize: 12
},

trialBanner: {
backgroundColor: "#EEF2FF",
borderRadius: 14,
padding: 12,
alignItems: "center",
marginBottom: 16
},

trialText: {
color: "#6C4DFF",
fontWeight: "700",
fontSize: 12
},

ctaButton: {
backgroundColor: "#6C4DFF",
borderRadius: 18,
paddingVertical: 18,
alignItems: "center",
marginTop: 10
},

ctaText: {
color: "#FFFFFF",
fontSize: 17,
fontWeight: "900"
},

secure: {
marginTop: 18,
textAlign: "center",
color: "#7B8199",
fontSize: 12
},

footer: {
marginTop: 12,
textAlign: "center",
color: "#9CA3AF",
fontSize: 11
}
});

export default premiumStyles;

import colors from "../constants/colors";
import questions from "./questions";

const historyGroups = [
  {
    label: "Today",
    date: "May 21, 2024",
    items: questions
  },
  {
    label: "Yesterday",
    date: "May 20, 2024",
    items: [
      {
        icon: "cube",
        title: "What is Covalent Bond?",
        meta: "Chemistry  -  Class 10",
        time: "07:30 PM",
        color: colors.purple
      },
      {
        icon: "int",
        title: "Evaluate integral x^2 dx",
        meta: "Math  -  Calculus",
        time: "06:20 PM",
        color: colors.blue
      }
    ]
  },
  {
    label: "May 19, 2024",
    date: "",
    items: [
      {
        icon: "book",
        title: "Newton's First Law of Motion",
        meta: "Physics  -  Motion",
        time: "09:40 PM",
        color: "#F6B83F"
      },
      {
        icon: "chem",
        title: "Balance the equation: H2 + O2 -> H2O",
        meta: "Chemistry  -  Reactions",
        time: "08:10 PM",
        color: colors.green
      }
    ]
  },
  {
    label: "May 18, 2024",
    date: "",
    items: [
      {
        icon: "dna",
        title: "Structure of DNA",
        meta: "Biology  -  Genetics",
        time: "07:50 PM",
        color: colors.purple
      }
    ]
  }
];

export default historyGroups;
import colors from "../constants/colors";

export default function tint(color) {
  if (color === colors.green) return "#E5F8EF";
  if (color === colors.orange) return "#FFF0E7";
  if (color === colors.blue) return "#E9F1FF";
  if (color === colors.red) return "#FFECEC";
  return colors.soft;
}
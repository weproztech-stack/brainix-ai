import React from "react";
import {
View,
Text,
TouchableOpacity
} from "react-native";

import premiumStyles from "../styles/premiumStyles";

export default function Plan({
months,
price,
old,
note,
selected,
save = "Save ₹500"
}) {
return (
<TouchableOpacity
activeOpacity={0.9}
style={[
premiumStyles.plan,
selected &&
premiumStyles.planSelected
]}
>
<View
style={[
premiumStyles.radio,
selected &&
premiumStyles.radioActive
]}
/>


  <View style={{ flex: 1 }}>
    <Text
      style={premiumStyles.planTitle}
    >
      {months}
    </Text>

    <Text
      style={premiumStyles.planSub}
    >
      {months === "12 Months"
        ? "Billed annually"
        : months === "6 Months"
        ? "Billed every 6 months"
        : "Billed every 3 months"}
    </Text>

    <Text
      style={premiumStyles.planNote}
    >
      {note}
    </Text>
  </View>

  <View
    style={{
      alignItems: "flex-end"
    }}
  >
    <View
      style={
        premiumStyles.saveBadge
      }
    >
      <Text
        style={
          premiumStyles.saveText
        }
      >
        {save}
      </Text>
    </View>

    <Text
      style={premiumStyles.price}
    >
      {price}
    </Text>

    <Text
      style={
        premiumStyles.oldPrice
      }
    >
      {old}
    </Text>
  </View>
</TouchableOpacity>


);
}

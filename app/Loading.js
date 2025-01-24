import { Text, View } from "react-native";

export default function Loading() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Loading screen.</Text>
    </View>
  );
}

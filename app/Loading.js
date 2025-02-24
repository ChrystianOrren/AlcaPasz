import { Text, View } from "react-native";

export default function Loading() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: '#3C3C3B',
      }}
    >
      <Text style={{ color: '#00FF00', fontSize: 25, fontFamily: 'Anonymous Pro Regular' }}>Loading screen.</Text>
    </View>
  );
}

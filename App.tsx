import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";
import { DeviceInfo } from "./src/components/DeviceInfo";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DeviceInfo />
    </SafeAreaView>
  );
}

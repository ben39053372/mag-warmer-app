import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
} from "react-native";
import { useDevices } from "./hooks/useBLE";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useState } from "react";

export default function App() {
  // const device = useBLE();
  const devices = useDevices();
  const [battery, setBattery] = useState(90);
  const [targetTemp, setTargetTemp] = useState(40);
  const [magTemps, setMagTemps] = useState([25, 24, 23, 22]);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <AnimatedCircularProgress
          size={120}
          width={15}
          fill={battery}
          tintColor="#00e0ff"
          onAnimationComplete={() => console.log("onAnimationComplete")}
          backgroundColor="#3d5875"
          rotation={0}
        >
          {(fill: number) => <Text>Battery: {fill}</Text>}
        </AnimatedCircularProgress>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          {magTemps.map((temp, index) => {
            return (
              <View key={index} style={styles.gridItem}>
                <View
                  style={{
                    backgroundColor: "#eee",
                    margin: 8,
                    borderRadius: 8,
                    padding: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <Text>MAGAZINE {index}</Text>
                  <Text style={{ fontSize: 20, fontWeight: "700" }}>
                    {temp} °C
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 24 }}>Target Temp: </Text>
          <NumberInput
            value={targetTemp}
            onChange={setTargetTemp}
            min={30}
            max={60}
            step={1}
          />
        </View>
        <Text>{JSON.stringify(devices, null, 2)}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  gridItem: {
    width: "50%",
  },
  numberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    width: 150,
  },
  button: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    flex: 1,
    height: 50,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "500",
    backgroundColor: "#fff",
  },
});

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

function NumberInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
}: NumberInputProps) {
  const decreaseValue = () => {
    Keyboard.dismiss();
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  const increaseValue = () => {
    Keyboard.dismiss();
    if (value + step <= max) {
      onChange(value + step);
    }
  };

  const handleTextChange = (text: string) => {
    const newValue = parseInt(text);
    if (!isNaN(newValue)) {
      if (newValue >= min && newValue <= max) {
        onChange(newValue);
      }
    }
  };

  return (
    <View style={styles.numberInputContainer}>
      <TouchableOpacity
        style={styles.button}
        onPress={decreaseValue}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>-</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={value.toString()}
        onChangeText={handleTextChange}
        keyboardType="numeric"
        selectTextOnFocus
        onBlur={Keyboard.dismiss}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={increaseValue}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

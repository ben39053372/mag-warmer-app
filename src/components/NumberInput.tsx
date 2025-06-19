import {
  Keyboard,
  TextInput,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberInput({
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

const styles = StyleSheet.create({
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

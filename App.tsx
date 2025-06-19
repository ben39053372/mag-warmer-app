import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  Modal,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useDevices } from "./hooks/useBLE";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useState, useRef, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { BarcodeScanningResult } from "expo-camera";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DeviceInfo />
    </SafeAreaView>
  );
}

export const ScanDeviceModal = ({
  open,
  onClose,
  onScan,
}: {
  open: boolean;
  onClose: () => void;
  onScan?: (data: string) => void;
}) => {
  const [scanning, setScanning] = useState(true);
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    requestPermission();
  }, []);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanning) {
      setScanning(false);
      console.log(
        `Bar code with type ${type} and data ${data} has been scanned!`
      );
      if (onScan) {
        const { deviceId }: { deviceId: string | undefined } = JSON.parse(data);
        if (deviceId) {
          onScan(deviceId);
          setScanning(true);
          onClose();
        }
      }
    }
  };

  if (!permission) {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={open}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={{ marginTop: 20 }}>
              Requesting camera permission...
            </Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={open}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ marginBottom: 20 }}>No access to camera</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={open}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }}
              onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
            />
            <View style={styles.scanOverlay}>
              <View style={styles.scanFrame} />
            </View>
          </View>
          <Text style={styles.scanText}>Scan QR Code</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export const DeviceInfo = () => {
  const [battery, setBattery] = useState(90);
  const [targetTemp, setTargetTemp] = useState(40);
  const [magTemps, setMagTemps] = useState([25, 24, 23, 22]);
  const [deviceId, setDeviceId] = useState<string>();
  const [scanModalOpen, setScanModalOpen] = useState(false);
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => setScanModalOpen(true)}
      >
        <Text style={styles.scanButtonText}>Scan Device</Text>
      </TouchableOpacity>

      <Text>{deviceId}</Text>

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

      <ScanDeviceModal
        open={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onScan={(data) => {
          console.log("QR Code scanned:", data);
          setDeviceId(data);
        }}
      />
    </View>
  );
};

const { width } = Dimensions.get("window");
const CAMERA_SIZE = width * 0.8;
const SCAN_FRAME_SIZE = CAMERA_SIZE * 0.7;

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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: CAMERA_SIZE + 40,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cameraContainer: {
    width: CAMERA_SIZE,
    height: CAMERA_SIZE,
    overflow: "hidden",
    borderRadius: 10,
    position: "relative",
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  scanOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    borderWidth: 2,
    borderColor: "#00e0ff",
    borderRadius: 10,
  },
  scanText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  scanButton: {
    backgroundColor: "#00e0ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 20,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
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

import {
  useCameraPermissions,
  BarcodeScanningResult,
  CameraView,
} from "expo-camera";
import { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");
const CAMERA_SIZE = width * 0.8;
const SCAN_FRAME_SIZE = CAMERA_SIZE * 0.7;

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

const styles = StyleSheet.create({
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
});

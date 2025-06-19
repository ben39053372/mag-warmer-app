import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { ScanDeviceModal } from "./ScanDeviceModal";
import { NumberInput } from "./NumberInput";
import { useBlePermission, useScanAndConnectDevice } from "../services/ble";

export const DeviceInfo = () => {
  const [battery, setBattery] = useState(90);
  const [targetTemp, setTargetTemp] = useState(40);
  const [magTemps, setMagTemps] = useState([25, 24, 23, 22]);
  const [heaterStatus, setHeaterStatus] = useState([false, false]);
  const [deviceId, setDeviceId] = useState<string>();
  const [scanModalOpen, setScanModalOpen] = useState(false);

  const { permission: BLEPermission, requestPermission: requestBLEPermission } =
    useBlePermission();

  if (!BLEPermission) {
    requestBLEPermission();
  }

  const { device, error } = useScanAndConnectDevice(deviceId);
  if (error) {
    console.log({ error });
  }

  useEffect(() => {
    console.log({ device });
  }, [device]);

  return (
    <View style={styles.container}>
      {/* Scan Device button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => {
          setDeviceId("");
          setScanModalOpen(true);
        }}
      >
        <Text style={styles.scanButtonText}>Scan Device</Text>
      </TouchableOpacity>

      <Text>{device?.id}</Text>

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
        {heaterStatus.map((isHeaterOn, index) => {
          return (
            <View
              key={index}
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
              <Text>Heater {index}</Text>
              <Text>{isHeaterOn ? "ON" : "OFF"}</Text>
            </View>
          );
        })}
      </View>
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
          setDeviceId(data);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
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
  gridItem: {
    width: "50%",
  },
});

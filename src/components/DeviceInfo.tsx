import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { ScanDeviceModal } from "./ScanDeviceModal";
import { NumberInput } from "./NumberInput";
import { Buffer } from "buffer";
import {
  useBlePermission,
  useCharacteristic,
  useScanAndConnectDevice,
} from "../services/ble";

export const DeviceInfo = () => {
  const [targetTemp, setTargetTemp] = useState(40);
  const [deviceId, setDeviceId] = useState<string>();
  const [scanModalOpen, setScanModalOpen] = useState(false);

  const handleTargetTempChange = async (temp: number) => {
    setTargetTemp(temp);
    await write(`targetTemp:${temp}`);
    console.log("done");
  };

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

  const serviceUUID = "2aae64b6-8f24-4643-9302-0ba146f8d9f2";
  const characteristicUUID = "c94b7467-2490-46a2-b5e7-6a16752e13d3";

  const { value, error: characteristicMonitorError } = useCharacteristic(
    serviceUUID,
    characteristicUUID,
    device
  );

  const write = async (value: string) => {
    if (!device) {
      console.warn("no device");
      return;
    }
    console.log("send:", value);
    console.log("base64: ", Buffer.from(value).toString("base64"));
    await device
      .writeCharacteristicWithResponseForService(
        serviceUUID,
        characteristicUUID,
        Buffer.from(value).toString("base64")
      )
      .then(() => {
        console.log("success send", value);
      })
      .catch((err) => {
        console.error("send data error: ", err);
      });
  };

  useEffect(() => {
    console.log({ value, characteristicMonitorError });
  }, [value, characteristicMonitorError]);

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
        fill={((value?.["voltage"] || 0) / 12) * 100}
        tintColor="#00e0ff"
        onAnimationComplete={() => console.log("onAnimationComplete")}
        backgroundColor="#3d5875"
        rotation={0}
      >
        {(fill: number) => (
          <Text>Voltage: {value?.["voltage"].toFixed(2)}</Text>
        )}
      </AnimatedCircularProgress>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        {value?.["heater"]?.map((isHeaterOn, index) => {
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
              <Text>{value?.["temp"]?.filter((t) => t > 0)?.[index]}</Text>
            </View>
          );
        })}
      </View>
      <View
        style={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 24 }}>
          Target Temp: {value?.["targetTemp"]}
        </Text>
        <NumberInput
          value={targetTemp || 0}
          onChange={handleTargetTempChange}
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

"use client";

import { PermissionsAndroid, Platform } from "react-native";
import * as ExpoDevice from "expo-device";
import { use, useEffect } from "react";
import { BleManager } from "react-native-ble-plx";

// create your own singleton class
class BLEServiceInstance {
  manager: BleManager;

  constructor() {
    this.manager = new BleManager();
  }
}

export const BLEService = new BLEServiceInstance();

const requestAndroid31Permissions = async () => {
  const bluetoothScanPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    {
      title: "Location Permission",
      message: "Bluetooth Low Energy requires Location",
      buttonPositive: "OK",
    }
  );
  const bluetoothConnectPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    {
      title: "Location Permission",
      message: "Bluetooth Low Energy requires Location",
      buttonPositive: "OK",
    }
  );
  const fineLocationPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: "Location Permission",
      message: "Bluetooth Low Energy requires Location",
      buttonPositive: "OK",
    }
  );

  return (
    bluetoothScanPermission === "granted" &&
    bluetoothConnectPermission === "granted" &&
    fineLocationPermission === "granted"
  );
};

const requestPermissions = async () => {
  if (Platform.OS === "android") {
    if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "Bluetooth Low Energy requires Location",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const isAndroid31PermissionsGranted = await requestAndroid31Permissions();

      return isAndroid31PermissionsGranted;
    }
  } else {
    return true;
  }
};

export const useBLE = () => {
  const permissions = requestPermissions();

  console.log({ permissions });

  useEffect(() => {
    console.log("useBLE");
    const subscription = BLEService.manager.onStateChange((state) => {
      if (state === "PoweredOn") {
        scanAndConnect();
        subscription.remove();
      } else {
        console.log(state);
      }
    });
    return () => subscription.remove();
  }, []);
};

function scanAndConnect() {
  BLEService.manager.startDeviceScan(null, null, (error, device) => {
    console.log("device");
    console.log({ device });
    if (error) {
      console.error(error);
      return;
    }
  });
}

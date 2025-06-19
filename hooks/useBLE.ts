"use client";

import { PermissionsAndroid, Platform } from "react-native";
import * as ExpoDevice from "expo-device";
import { use, useCallback, useEffect, useState } from "react";
import { BleManager, Device } from "react-native-ble-plx";

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

export const useDevices = () => {
  const [discoveredDevices, setDiscoveredDevices] = useState<Device[]>([]);

  useEffect(() => {
    const subscription = BLEService.manager.onStateChange((state) => {
      if (state === "PoweredOn") {
        BLEService.manager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            console.error(error);
            return;
          }

          if (device && !discoveredDevices.some((d) => d.id === device.id)) {
            setDiscoveredDevices((d) => [...d, device]);
            console.log("Discovered Devices: ", device.name, " | ", device.id);
          }
        });

        setTimeout(() => {
          BLEService.manager.stopDeviceScan();
          console.log("Scan stopped.");
        }, 1000);
      } else {
        console.log(state);
      }
    });
    return () => subscription.remove();
  });

  return discoveredDevices;
};

// export const useBLE = () => {
//   const permissions = requestPermissions();

//   const [device, setDevice] = useState<Device | null>(null);

//   console.log({ permissions });

//   const scanAndConnect = useCallback(() => {
//     BLEService.manager.startDeviceScan(null, null, (error, _device) => {
//       if (error) {
//         console.error(error);
//         return;
//       }
//       console.log("device");
//       console.log({ _device });
//       setDevice(_device);
//       BLEService.manager.stopDeviceScan();
//     });
//   }, [setDevice]);

//   useEffect(() => {
//     console.log("useBLE");
//     const subscription = BLEService.manager.onStateChange((state) => {
//       if (state === "PoweredOn") {
//         // scanAndConnect();
//         BLEService.manager.startDeviceScan(null, null, (error, _device) => {
//           if (error) {
//             console.error(error);
//             return;
//           }
//           console.log("device");
//           console.log({ _device });
//           setDevice(_device);
//           BLEService.manager.stopDeviceScan();
//         });
//         subscription.remove();
//       } else {
//         console.log(state);
//       }
//     });
//     return () => subscription.remove();
//   }, []);

//   return device;
// };

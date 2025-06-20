import { useCallback, useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

// create your own singleton class
class BLEServiceInstance {
  manager: BleManager;

  constructor() {
    this.manager = new BleManager();
  }
}

export const BLEService = new BLEServiceInstance();

export const requestBlePermission = async () => {
  if (Platform.OS === "ios") {
    return true;
  }
  if (
    Platform.OS === "android" &&
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  ) {
    const apiLevel = parseInt(Platform.Version.toString(), 10);

    if (apiLevel < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    if (
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    ) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      return (
        result["android.permission.BLUETOOTH_CONNECT"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result["android.permission.BLUETOOTH_SCAN"] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        result["android.permission.ACCESS_FINE_LOCATION"] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    }
  }

  return false;
};

export const useBlePermission = () => {
  const [permission, setPermission] = useState<boolean>();
  const requestPermission = useCallback(async () => {
    const p = await requestBlePermission();
    setPermission(p);
  }, []);

  return { permission, requestPermission };
};

export const useScanAndConnectDevice = (deviceId?: string) => {
  console.log("call useScanAndConnectDevice");
  const [device, setDevice] = useState<Device>();
  const [error, setError] = useState();

  const scanAndConnect = async () => {
    console.log("scanAndConnect", { deviceId });
    if (deviceId)
      try {
        const device = await BLEService.manager
          .connectToDevice(deviceId, {
            timeout: 3000,
          })
          .then((d) => {
            return d.discoverAllServicesAndCharacteristics();
          });
        setDevice(device);
      } catch (error) {
        console.log(error);
      }
  };
  useEffect(() => {
    console.log({ deviceId });
    if (!deviceId) return;
    const sub = BLEService.manager.onStateChange((state) => {
      if (state === "PoweredOn") {
        console.log("PoweredOn");
        (async () => {
          scanAndConnect();
        })();
        sub.remove();
      } else {
        console.log("onStateChange: ", state);
      }
    }, true);
    return () => sub.remove();
  }, [deviceId, BLEService.manager]);

  return { device, error };
};

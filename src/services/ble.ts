import { useCallback, useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleError, BleManager, Device } from "react-native-ble-plx";
import { Buffer } from "buffer";

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

type DataFromBLE = {
  heater: boolean[];
  power: boolean;
  targetTemp: number;
  temp: number[];
  voltage: number;
};

export const useCharacteristic = (
  serviceID: string,
  characteristicUUID: string,
  device?: Device
) => {
  const [value, setValue] = useState<DataFromBLE | null>();
  const [error, setError] = useState<BleError>();
  useEffect(() => {
    const interval = setInterval(() => {
      if (!device) return;
      device
        .readCharacteristicForService(serviceID, characteristicUUID)
        .then((characteristic) => {
          setValue(
            JSON.parse(
              Buffer.from(characteristic.value || "", "base64").toString("utf8")
            )
          );
        })
        .catch((error) => setError(error));
    }, 5000);
    return () => clearInterval(interval);
  }, [device, serviceID, characteristicUUID]);

  return { value, error };
};

export const useScanAndConnectDevice = (deviceId?: string) => {
  console.log("call useScanAndConnectDevice");
  const [device, setDevice] = useState<Device>();
  const [error, setError] = useState();
  const [connected, setConnected] = useState(false);

  const scanAndConnect = async () => {
    console.log("scanAndConnect", { deviceId });
    if (deviceId)
      try {
        console.log(deviceId);
        const device = await BLEService.manager
          .connectToDevice(deviceId, {
            timeout: 20000,
          })
          .then((d) => {
            return d.discoverAllServicesAndCharacteristics();
          });
        device.onDisconnected((error, device) => {
          setConnected(false);
          if (error) {
            console.error(JSON.stringify(error, null, 4));
          }
          if (device) {
            device.connect().then(() => {
              setConnected(true);
            });
          }
        });
        setDevice(device);
      } catch (error) {
        console.error(error);
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
    return () => {
      sub.remove();
      device?.cancelConnection();
    };
  }, [deviceId, BLEService.manager]);

  return { connected, device, error };
};

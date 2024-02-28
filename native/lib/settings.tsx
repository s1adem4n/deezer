import AsyncStorage from "@react-native-async-storage/async-storage";
import { Band } from "./api";
import { createContext, useContext, useEffect, useState } from "react";
import { useAPI } from "./api/context";

export const frequencies = [
  32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000,
];

export interface Settings {
  bitrate: number;
  bands: Band[];
  apiURL: string;
}

export const defaultSettings: Settings = {
  bitrate: 320,
  bands: frequencies.map((frequency) => {
    return {
      frequency,
      gain: 0,
    };
  }),
  apiURL: "http://192.168.1.100:8080/api",
};

const saveSettings = async (settings: Settings) => {
  await AsyncStorage.setItem("settings", JSON.stringify(settings));
};

const getSettings = async (): Promise<Settings> => {
  const value = await AsyncStorage.getItem("settings");
  if (value) {
    return JSON.parse(value);
  } else {
    return defaultSettings;
  }
};

const SettingsContext = createContext<{
  value: Settings;
  setSettings: (settings: Settings) => void;
}>({
  value: defaultSettings,
  setSettings: () => {},
});

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [value, setValue] = useState<Settings>(defaultSettings);
  const { setURL } = useAPI();

  useEffect(() => {
    getSettings().then((settings) => {
      setValue(settings);
    });
  }, []);
  useEffect(() => {
    saveSettings(value);
    setURL(value.apiURL);
  }, [value]);

  return (
    <SettingsContext.Provider value={{ value, setSettings: setValue }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  return useContext(SettingsContext);
};

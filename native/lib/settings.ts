import { Band } from "./api";

export const frequencies = [
  32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000,
];

export interface Settings {
  bitrate: number;
  bands: Band[];
}

export const settings: Settings = {
  bitrate: 320,
  bands: frequencies.map((frequency) => {
    return {
      frequency,
      gain: 0,
    };
  }),
};

import type { Album, Artist, Band, Track } from "./types";

export class API {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // tracks object
  tracks = {
    list: async (): Promise<Track[]> => {
      const response = await fetch(`${this.baseUrl}/tracks`);
      return response.json();
    },
    get: async (id: number): Promise<Track> => {
      const response = await fetch(`${this.baseUrl}/tracks/${id}`);
      return response.json();
    },
    artists: async (id: number): Promise<Artist[]> => {
      const response = await fetch(`${this.baseUrl}/tracks/${id}/artists`);
      return response.json();
    },
    artistsBatch: async (ids: number[]): Promise<Artist[][]> => {
      const response = await fetch(
        `${this.baseUrl}/tracks/artists?ids=${ids.join(",")}`
      );
      return response.json();
    },
    stream: (id: number, bitrate: number, bands?: Band[]) => {
      const query = new URLSearchParams({ bitrate: bitrate.toString() });
      const bandsStrings = bands
        ?.map((band) => `${band.frequency}:${band.gain.toFixed(2)}`)
        .join(",");
      if (
        bands &&
        bands.filter((band) => band.gain !== 0).length > 0 &&
        bandsStrings
      ) {
        query.set("equalizer", bandsStrings);
      }
      return `${this.baseUrl}/tracks/${id}/stream?${query.toString()}`;
    },
  };
  albums = {
    list: async (): Promise<Album[]> => {
      const response = await fetch(`${this.baseUrl}/albums`);
      return response.json();
    },
    get: async (id: number): Promise<Album> => {
      const response = await fetch(`${this.baseUrl}/albums/${id}`);
      return response.json();
    },
    tracks: async (id: number): Promise<Track[]> => {
      const response = await fetch(`${this.baseUrl}/albums/${id}/tracks`);
      return response.json();
    },
    artists: async (id: number): Promise<Artist[]> => {
      const response = await fetch(`${this.baseUrl}/albums/${id}/artists`);
      return response.json();
    },
  };
  artists = {
    list: async (): Promise<Artist[]> => {
      const response = await fetch(`${this.baseUrl}/artists`);
      return response.json();
    },
    get: async (id: number): Promise<Artist> => {
      const response = await fetch(`${this.baseUrl}/artists/${id}`);
      return response.json();
    },
    albums: async (id: number): Promise<Album[] | null> => {
      const response = await fetch(`${this.baseUrl}/artists/${id}/albums`);
      return response.json();
    },
  };
}

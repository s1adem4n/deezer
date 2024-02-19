import type { Album, Artist, Track } from "./types";

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
    tracks: async (id: number): Promise<Track[] | null> => {
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

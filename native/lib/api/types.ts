export interface Track {
  id: number;
  title: string;
  position: number;
  length: number;
  bitrate: number;
  albumId: number;
  path: string;
  audioPath: string;
  coverPath: string;
}

export interface Artist {
  id: number;
  name: string;
  description?: string;
}

export interface Album {
  id: number;
  title: string;
  year: number;
  genre: string;
  coverPath: string;
}

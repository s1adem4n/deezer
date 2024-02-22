import { Artist, Album } from "$lib/api";
import { Track } from "react-native-track-player";

export interface PlayerTrack extends Track {
  bitrate: number;
  id: number;
  artists: Artist[];
  albumData: Album;
  format: string;
}

import { Track } from "react-native-track-player";
import type { Track as APITrack, Album, Artist } from "./types";
import { BASE_URL } from ".";

export interface PlayerTrack extends Track {
  bitrate: number;
  id: number;
  artists: Artist[];
  albumData: Album;
  format: string;
}

export const apiTrackToPlayerTrack = (
  track: APITrack,
  artists: Artist[],
  album: Album
): PlayerTrack => {
  return {
    id: track.id,
    title: track.title,
    artist: artists.map((artist) => artist.name).join(", "),
    artists: artists,
    album: album.title,
    albumData: album,
    url: `${BASE_URL}/${track.audioPath}`,
    artwork: `${BASE_URL}/${track.coverPath || album.coverPath}`,
    bitrate: track.bitrate,
    format: track.format,
  };
};

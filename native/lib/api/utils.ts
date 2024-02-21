import { Track } from "react-native-track-player";
import type { Track as APITrack, Album, Artist } from "./types";
import { BASE_URL } from ".";

export const apiTrackToPlayerTrack = (
  track: APITrack,
  artists: Artist[],
  album: Album
): Track => {
  return {
    id: track.id,
    title: track.title,
    artist: artists.map((artist) => artist.name).join(", "),
    album: album.title,
    url: `${BASE_URL}/${track.audioPath}`,
    artwork: `${BASE_URL}/${track.coverPath || album.coverPath}`,
  };
};

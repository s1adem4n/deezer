import { Artist, Album, Track as APITrack, BASE_URL } from "$lib/api";
import { Track } from "react-native-track-player";

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
    url: `${BASE_URL}/tracks/${track.id}/stream`,
    artwork: `${BASE_URL}/${track.coverPath || album.coverPath}`,
    bitrate: track.bitrate,
    format: track.format,
  };
};

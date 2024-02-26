import { api, Artist, Album, Track as APITrack, BASE_URL } from "$lib/api";
import { settings } from "$lib/settings";
import TrackPlayer, { Track } from "react-native-track-player";

export interface PlayerTrack extends Track {
  bitrate: number;
  id: number;
  artists: Artist[];
  albumData: Album;
  format: string;
}

export const playTrack = async (
  track: APITrack,
  album?: Album,
  tracks?: APITrack[],
  artists?: Artist[][]
) => {
  const albumRes = album || (await api.albums.get(track.albumId));
  const tracksRes = tracks || (await api.albums.tracks(track.albumId));

  const index = tracksRes.findIndex((t) => t.id === track.id);

  const ids = tracksRes.map((track) => track.id);
  const artistsRes = artists || (await api.tracks.artistsBatch(ids));

  const playerTracks: PlayerTrack[] = tracksRes.map((track, index) => {
    return {
      id: track.id,
      title: track.title,
      artist: artistsRes[index].map((artist) => artist.name).join(", "),
      album: albumRes.title,
      url: api.tracks.stream(track.id, settings.bitrate, settings.bands),
      artwork: `${BASE_URL}/${albumRes.coverPath}`,
      bitrate: track.bitrate,
      artists: artistsRes[index],
      albumData: albumRes,
      format: track.format,
    };
  });

  const queue = await TrackPlayer.getQueue();
  for (const track of queue) {
    if (track.id === playerTracks[index].id) {
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
      return;
    }
  }

  await TrackPlayer.reset();

  await TrackPlayer.add(playerTracks);
  await TrackPlayer.skip(index);

  await TrackPlayer.play();
};

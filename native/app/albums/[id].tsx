import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { Dimensions, FlatList, Text, View } from "react-native";
import { Album, Artist, Track as ApiTrack, api } from "$lib/api";
import { apiTrackToPlayerTrack } from "$lib/api/utils";
import { parseLength } from "$lib/utils";
import React from "react";
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { useQuery } from "@tanstack/react-query";
import { useHeaderHeight } from "@react-navigation/elements";
import { PlayerTrack } from "$lib/api/utils";

const windowWidth = Dimensions.get("window").width;

const Track = React.memo(
  ({
    track,
    onPlay,
    active,
  }: {
    track: ApiTrack;
    onPlay?: () => void;
    active: boolean;
  }) => {
    return (
      <View className="flex flex-row justify-between border-b border-zinc-900 p-4">
        <View className="flex flex-row gap-4">
          {track.position ? (
            <Text
              className="text-zinc-500"
              style={{
                fontVariant: ["tabular-nums"],
              }}
            >
              {track.position.toString().padStart(2, "0")}
            </Text>
          ) : null}

          <Text
            className={active ? "text-zinc-200 font-bold" : "text-zinc-200"}
            onPress={onPlay}
            style={{
              width: windowWidth - 125,
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {track.title}
          </Text>
        </View>
        <Text
          className="text-zinc-500"
          style={{
            fontVariant: ["tabular-nums"],
          }}
        >
          {parseLength(track.length)}
        </Text>
      </View>
    );
  }
);

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours === 0) {
    return `${minutes} minutes`;
  } else {
    const remainingMinutes = minutes % 60;
    return `${hours} hours and ${remainingMinutes} minutes`;
  }
}

export default function Page() {
  const { id } = useLocalSearchParams();
  const album = useQuery({
    queryKey: ["albums", id],
    queryFn: async () => {
      if (typeof id === "string") {
        const parsedId = parseInt(id);
        const albums = await api.albums.get(parsedId);
        return albums;
      }
    },
  });
  const tracks = useQuery({
    queryKey: ["albums", id, "tracks"],
    queryFn: async () => {
      if (typeof id === "string") {
        const parsedId = parseInt(id);
        const tracks = await api.albums.tracks(parsedId);
        getPlayerTracks();
        return tracks;
      }
    },
  });
  const trackArtists = useQuery({
    queryKey: ["albums", id, "tracks", "artists"],
    queryFn: async () => {
      const res: Artist[][] = [];
      for (const track of tracks.data || []) {
        const artists = await api.tracks.artists(track.id);
        res.push(artists);
      }
      return res;
    },
    enabled: tracks.data ? true : false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const headerHeight = useHeaderHeight();

  const [track, setTrack] = useState<PlayerTrack | null>(null);

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], (event) => {
    if (event.track) {
      setTrack(event.track as PlayerTrack);
    }
  });

  const getPlayerTracks = () => {
    if (!album.data || !tracks.data || !trackArtists.data) return;

    const playerTracks: PlayerTrack[] = [];
    for (let i = 0; i < tracks.data.length; i++) {
      const track = tracks.data[i];
      const artists = trackArtists.data[i];

      playerTracks.push(apiTrackToPlayerTrack(track, artists, album.data));
    }
    return playerTracks;
  };

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ title: album.data?.title || "Album" }} />
      <FlatList
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await album.refetch();
          await tracks.refetch();
          await trackArtists.refetch();
          setRefreshing(false);
        }}
        contentInset={{ top: headerHeight }}
        initialNumToRender={12}
        data={tracks.data}
        renderItem={({ item, index }) => (
          <Track
            active={track?.id === item.id}
            track={item}
            onPlay={async () => {
              if (!trackArtists.data) return;

              const currentQueue = await TrackPlayer.getQueue();
              let found = false;
              for (const track of currentQueue || []) {
                if (track.id === item.id) {
                  found = true;
                  break;
                }
              }

              if (!found) {
                const playerTracks = getPlayerTracks();
                if (!playerTracks) return;
                await TrackPlayer.reset();
                await TrackPlayer.add(playerTracks);
              }

              await TrackPlayer.skip(index);
              await TrackPlayer.play();
            }}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={
          <Text className="p-2 text-zinc-500 text-sm">
            {tracks.data?.length} tracks,{" "}
            {tracks.data
              ? formatDuration(
                  tracks.data
                    .map((track) => track.length)
                    .reduce((a, b) => a + b, 0)
                )
              : "0 minutes"}
          </Text>
        }
      />
    </View>
  );
}

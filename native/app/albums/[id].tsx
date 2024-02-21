import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { Dimensions, FlatList, Text, View } from "react-native";
import { Album, Artist, Track as ApiTrack, api } from "$lib/api";
import { apiTrackToPlayerTrack } from "$lib/api/utils";
import { parseLength } from "$lib/utils";
import React from "react";
import TrackPlayer, { Track as PlayerTrack } from "react-native-track-player";
import { useQuery } from "@tanstack/react-query";

const windowWidth = Dimensions.get("window").width;

const Track = React.memo(
  ({ track, onPlay }: { track: ApiTrack; onPlay?: () => void }) => {
    return (
      <View className="flex flex-row justify-between border-b border-gray-200 p-4">
        <View className="flex flex-row gap-4">
          {track.position ? (
            <Text
              style={{
                fontVariant: ["tabular-nums"],
              }}
            >
              {track.position.toString().padStart(2, "0")}
            </Text>
          ) : null}

          <Text
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
    <View className="bg-white flex-1">
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
        initialNumToRender={12}
        data={tracks.data}
        renderItem={({ item, index }) => (
          <Track
            track={item}
            onPlay={async () => {
              while (!trackArtists.data) {
                await new Promise((resolve) => setTimeout(resolve, 200));
              }
              const playerTracks = getPlayerTracks();
              if (!playerTracks) return;

              await TrackPlayer.reset();
              await TrackPlayer.add(playerTracks);
              await TrackPlayer.skip(index);
              await TrackPlayer.play();
            }}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={
          <Text className="p-2 text-gray-500 text-sm">
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

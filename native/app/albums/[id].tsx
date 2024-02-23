import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { Dimensions, FlatList, Image, Text, View } from "react-native";
import { Artist, Track as ApiTrack, api, BASE_URL } from "$lib/api";
import { parseLength } from "$lib/utils";
import React from "react";
import TrackPlayer from "react-native-track-player";
import { useQuery } from "@tanstack/react-query";
import { useHeaderHeight } from "@react-navigation/elements";
import { PlayerTrack, apiTrackToPlayerTrack } from "$lib/audio/controls";

const windowWidth = Dimensions.get("window").width;

const Track = React.memo(
  ({ track, onPlay }: { track: ApiTrack; onPlay?: () => void }) => {
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
            className="text-zinc-200"
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
  const albumArtists = useQuery({
    queryKey: ["albums", id, "artists"],
    queryFn: async () => {
      if (typeof id === "string") {
        const parsedId = parseInt(id);
        const artists = await api.albums.artists(parsedId);
        return artists;
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
        scrollIndicatorInsets={{ top: 0 }}
        initialNumToRender={12}
        data={tracks.data}
        ListHeaderComponent={() => (
          <View
            className="flex flex-row h-36 w-full m-2"
            style={{
              marginTop: headerHeight + 8,
            }}
          >
            <View className="rounded-md bg-zinc-800 h-36 w-36">
              {album.data ? (
                <Image
                  source={{ uri: `${BASE_URL}/${album.data.coverPath}` }}
                  className="rounded-md w-36 h-36"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    borderWidth: 0.5,
                  }}
                ></Image>
              ) : null}
            </View>
            <View
              className="flex flex-col ml-2"
              style={{
                width: windowWidth - 164,
              }}
            >
              <Text
                className="font-semibold text-xl text-zinc-200"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {album.data?.title}
              </Text>
              <Text
                className="text-zinc-500"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {albumArtists.data?.map((artist) => artist.name).join(", ")}
              </Text>
              <Text
                className="text-zinc-500 mt-0.5"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {[album.data?.year, album.data?.genre]
                  .filter(Boolean)
                  .join(" • ")}
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item, index }) => (
          <Track
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

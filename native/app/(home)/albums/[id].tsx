import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { Dimensions, FlatList, Image, Text, View } from "react-native";
import { Track as APITrack } from "$lib/api";
import { parseLength } from "$lib/utils";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useHeaderHeight } from "@react-navigation/elements";
import { playTrack } from "$lib/audio/controls";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettings } from "$lib/settings";
import { useAPI } from "$lib/api/context";

const windowWidth = Dimensions.get("window").width;

const Track = React.memo(
  ({
    track,
    index,
    onPlay,
  }: {
    track: APITrack;
    index: number;
    onPlay?: () => void;
  }) => {
    return (
      <View
        className={`flex flex-row justify-between border-b border-zinc-900 p-4 ${
          index === 0 && "border-t"
        }`}
      >
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
  const parsedId = typeof id === "string" ? parseInt(id) : 0;
  const { value: api } = useAPI();
  const { value: settings } = useSettings();

  const album = useQuery({
    queryKey: ["albums", id],
    queryFn: async () => await api.albums.get(parsedId),
  });
  const albumArtists = useQuery({
    queryKey: ["albums", id, "artists"],
    queryFn: async () => await api.albums.artists(parsedId),
  });
  const tracks = useQuery({
    queryKey: ["albums", id, "tracks"],
    queryFn: async () => await api.albums.tracks(parsedId),
  });
  const trackArtists = useQuery({
    queryKey: ["albums", id, "tracks", "artists"],
    queryFn: async () => {
      const ids = tracks.data?.map((track) => track.id) || [];
      return await api.tracks.artistsBatch(ids);
    },
    enabled: !!tracks.data,
  });

  const [refreshing, setRefreshing] = useState(false);
  const headerHeight = useHeaderHeight();
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ title: album.data?.title || "Album" }} />
      <FlatList
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await album.refetch();
          await tracks.refetch();
          setRefreshing(false);
        }}
        initialNumToRender={12}
        data={tracks.data}
        progressViewOffset={headerHeight + safeAreaInsets.top}
        ListHeaderComponent={() => (
          <View
            className="flex flex-row h-36 w-full m-2"
            style={{
              marginTop: headerHeight + safeAreaInsets.top + 8,
            }}
          >
            <View className="rounded-md bg-zinc-800 h-36 w-36">
              {album.data ? (
                <Image
                  source={{ uri: `${settings.apiURL}/${album.data.coverPath}` }}
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
            index={index}
            onPlay={async () => {
              playTrack(
                item,
                settings,
                api,
                album.data,
                tracks.data,
                trackArtists.data
              );
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

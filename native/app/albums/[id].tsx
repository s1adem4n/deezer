import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { Dimensions, FlatList, RefreshControl, Text, View } from "react-native";
import { Album, Track as ITrack, api } from "$lib/api";
import { usePlayer } from "$lib/audioplayer";
import { parseLength, parseLengthHours } from "$lib/utils";
import React from "react";

const windowWidth = Dimensions.get("window").width;

const Track = React.memo(({ track }: { track: ITrack }) => {
  const player = usePlayer();

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
          onPress={async () => {
            if (player.playing) {
              await player.pause();
            }
            await player.play(track);
          }}
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
});

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
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    if (typeof id === "string") {
      const parsedId = parseInt(id);
      setAlbum(await api.albums.get(parsedId));
      setTracks((await api.albums.tracks(parsedId)) || []);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    if (typeof id === "string") {
      const parsedId = parseInt(id);
      api.albums.get(parsedId).then(setAlbum);
      api.albums.tracks(parsedId).then((tracks) => {
        setTracks(tracks || []);
      });
    }
  }, [id]);

  return (
    <View className="bg-white flex-1">
      <Stack.Screen options={{ title: album?.title || "Album" }} />
      <FlatList
        refreshing={refreshing}
        onRefresh={refresh}
        initialNumToRender={12}
        data={tracks}
        renderItem={({ item }) => <Track track={item} />}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={
          <Text className="p-2 text-gray-500 text-sm">
            {tracks?.length} tracks,{" "}
            {formatDuration(
              tracks.map((track) => track.length).reduce((a, b) => a + b, 0)
            )}
          </Text>
        }
      />
    </View>
  );
}

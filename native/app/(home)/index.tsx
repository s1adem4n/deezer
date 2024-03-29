import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Album } from "$lib/api";
import { useState } from "react";
import { Stack, router } from "expo-router";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAPI } from "$lib/api/context";
import { useSettings } from "$lib/settings";

const windowWidth = Dimensions.get("window").width;

const AlbumPreview = React.memo(
  ({ album, index }: { album: Album; index: number }) => {
    const { value: api } = useAPI();
    const { value: settings } = useSettings();

    const artists = useQuery({
      queryKey: ["album", album.id, "artists"],
      queryFn: async () => {
        return await api.albums.artists(album.id);
      },
    });

    return (
      <View
        style={{
          width: windowWidth / 2,
          padding: 8,
          paddingLeft: index % 2 === 0 ? 8 : 4,
          paddingRight: index % 2 === 1 ? 8 : 4,
          paddingTop: 12,
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            router.push(`/albums/${album.id}`);
          }}
        >
          <View
            className="rounded-md bg-zinc-800"
            style={{
              width: "100%",
              height: undefined,
              aspectRatio: 1,
            }}
          >
            <Image
              source={{ uri: `${settings.apiURL}/${album.coverPath}` }}
              className="rounded-md"
              style={{
                borderColor: "rgba(255, 255, 255, 0.2)",
                borderWidth: 0.5,
                width: "100%",
                height: undefined,
                aspectRatio: 1,
              }}
            ></Image>
          </View>
        </TouchableWithoutFeedback>

        <Text
          className="font-semibold mt-1 text-zinc-200"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {album.title}
        </Text>

        <Text className="text-zinc-500" numberOfLines={1} ellipsizeMode="tail">
          {artists.data?.map((artist) => artist.name).join(", ")}
        </Text>
      </View>
    );
  }
);

export default function Page() {
  const { value: api } = useAPI();

  const albums = useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      setRefreshing(true);
      return await api.albums
        .list()
        .then((albums) => {
          setRefreshing(false);
          return albums;
        })
        .catch((e) => {
          setRefreshing(false);
          throw e;
        });
    },
  });
  const [refreshing, setRefreshing] = useState(false);
  const headerHeight = useHeaderHeight();
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-black text-zinc-200">
      <Stack.Screen
        options={{
          title: "Albums",
        }}
      />
      <FlatList
        data={albums.data}
        numColumns={2}
        scrollIndicatorInsets={{ top: 0 }}
        progressViewOffset={headerHeight + safeAreaInsets.top}
        contentInset={{ top: headerHeight + safeAreaInsets.top }}
        renderItem={({ item, index }) => (
          <AlbumPreview album={item} index={index} />
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={albums.refetch}
      />
    </View>
  );
}

import { Dimensions, FlatList, Image, Text, View } from "react-native";
import { Album, BASE_URL, api } from "$lib/api";
import { useState } from "react";
import { Link, Stack } from "expo-router";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const windowWidth = Dimensions.get("window").width;

const AlbumPreview = React.memo(
  ({ album, index }: { album: Album; index: number }) => {
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
        <Link href={`/albums/${album.id}`}>
          <View
            className="rounded-md bg-zinc-800"
            style={{
              width: "100%",
              height: undefined,
              aspectRatio: 1,
            }}
          >
            <Image
              source={{ uri: `${BASE_URL}/${album.coverPath}` }}
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
        </Link>

        <Text
          className="font-semibold mt-0.5 text-zinc-200"
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
  const albums = useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      setRefreshing(true);
      return await api.albums.list().then((albums) => {
        setRefreshing(false);
        return albums;
      });
    },
  });
  const [refreshing, setRefreshing] = useState(false);
  const headerHeight = useHeaderHeight();

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
        renderItem={({ item, index }) => (
          <AlbumPreview album={item} index={index} />
        )}
        scrollIndicatorInsets={{ top: 0 }}
        ListHeaderComponent={() => <View style={{ marginTop: headerHeight }} />}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={albums.refetch}
      />
    </View>
  );
}

import { Dimensions, FlatList, Image, Text, View } from "react-native";
import { Album, Artist, BASE_URL, api } from "$lib/api";
import { useEffect, useState } from "react";
import { Link, Stack } from "expo-router";
import React from "react";
import { useQuery } from "@tanstack/react-query";

const windowWidth = Dimensions.get("window").width;

const AlbumPreview = React.memo(
  ({ album, index }: { album: Album; index: number }) => {
    const artists = useQuery({
      queryKey: ["artists", album.id],
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
            className="rounded-md shadow-sm bg-gray-100"
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
                width: "100%",
                height: undefined,
                aspectRatio: 1,
              }}
            ></Image>
          </View>
        </Link>

        <Text
          className="font-semibold mt-0.5"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {album.title}
        </Text>
        <Text className="text-gray-400" numberOfLines={1} ellipsizeMode="tail">
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

  return (
    <View className="flex-1 bg-white text-gray-800">
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
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={albums.refetch}
      />
    </View>
  );
}

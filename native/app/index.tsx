import {
  Button,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Album, Artist, BASE_URL, api } from "$lib/api";
import { useEffect, useState } from "react";
import { Link, Stack } from "expo-router";
import React from "react";

const windowWidth = Dimensions.get("window").width;

const AlbumPreview = React.memo(
  ({ album, index }: { album: Album; index: number }) => {
    const [artists, setArtists] = useState<Artist[]>([]);

    useEffect(() => {
      api.albums.artists(album.id).then(setArtists);
    }, [album.id]);

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
          {album.coverPath ? (
            <Image
              source={{ uri: `${BASE_URL}/${album.coverPath}` }}
              className="rounded-md"
              style={{
                borderColor: "rgb(229 231 235)",
                borderWidth: 1,
                width: "100%",
                height: undefined,
                aspectRatio: 1,
              }}
            />
          ) : (
            <View
              className="rounded-md border-[.5px] bg-gray-200"
              style={{
                borderColor: "white",
                width: "100%",
                height: undefined,
                aspectRatio: 1,
              }}
            />
          )}
        </Link>
        <Text
          className="font-semibold mt-0.5"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {album.title}
        </Text>
        <Text className="text-gray-400" numberOfLines={1} ellipsizeMode="tail">
          {artists.map((artist) => artist.name).join(", ")}
        </Text>
      </View>
    );
  }
);

export default function Page() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    const albums = await api.albums.list();
    setAlbums(albums);
    setRefreshing(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <View className="flex-1 bg-white text-gray-800">
      <Stack.Screen
        options={{
          title: "Albums",
        }}
      />
      <FlatList
        data={albums}
        numColumns={2}
        renderItem={({ item, index }) => (
          <AlbumPreview album={item} index={index} />
        )}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={refresh}
      />
    </View>
  );
}

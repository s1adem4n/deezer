import { Stack } from "expo-router/stack";
import { AudioPlayer, PlayerProvider } from "$lib/audioplayer";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";

export default function Layout() {
  return (
    <PlayerProvider>
      <StatusBar style="auto" />
      <Stack></Stack>
      <AudioPlayer />
    </PlayerProvider>
  );
}

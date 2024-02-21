import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import playbackService from "$lib/playback-service";
import TrackPlayer, { Capability } from "react-native-track-player";
import { useState } from "react";
import { AudioPlayer } from "$lib/audioplayer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";

TrackPlayer.registerPlaybackService(() => playbackService);
const queryClient = new QueryClient();

export default function Layout() {
  const [loaded, setLoaded] = useState(false);

  TrackPlayer.getPlaybackState().catch(() => {
    TrackPlayer.setupPlayer().then(() => {
      setLoaded(true);
      TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],

        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
      });
    });
  });

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack></Stack>
        {loaded ? <AudioPlayer /> : null}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import playbackService from "$lib/playback-service";
import TrackPlayer, { Capability } from "react-native-track-player";
import { useState } from "react";
import BottomControls from "$lib/audio/bottom-controls";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SystemUI from "expo-system-ui";

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

  SystemUI.setBackgroundColorAsync("black");

  return (
    <GestureHandlerRootView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerTransparent: true,
            headerBlurEffect: "dark",
            headerTintColor: "rgb(229 231 235)",
          }}
        ></Stack>
        {loaded ? <BottomControls /> : null}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

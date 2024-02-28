import { StatusBar } from "expo-status-bar";
import playbackService from "$lib/playback-service";
import TrackPlayer, { Capability } from "react-native-track-player";
import BottomControls from "$lib/audio/bottom-controls";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SystemUI from "expo-system-ui";
import { Tabs } from "expo-router";
import { TouchableOpacity, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PortalHost, PortalProvider } from "@gorhom/portal";
import Mc from "@expo/vector-icons/MaterialCommunityIcons";
import { SettingsProvider } from "$lib/settings";
import { APIProvider } from "$lib/api/context";

TrackPlayer.registerPlaybackService(() => playbackService);
const queryClient = new QueryClient();

export default function Layout() {
  TrackPlayer.getPlaybackState().catch(() => {
    TrackPlayer.setupPlayer().then(() => {
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

  const safeAreaInsets = useSafeAreaInsets();

  return (
    <GestureHandlerRootView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <PortalProvider>
          <APIProvider>
            <SettingsProvider>
              <StatusBar style="light" />
              <Tabs
                safeAreaInsets={{ bottom: 0 }}
                screenOptions={{
                  header: () => null,
                  tabBarStyle: {
                    backgroundColor: "black",
                    borderTopColor: "rgb(24 24 27)",
                    borderTopWidth: 1,
                  },
                }}
                tabBar={({ state, descriptors, navigation }) => (
                  <View
                    className="flex flex-col bg-black"
                    style={{
                      paddingBottom: safeAreaInsets.bottom,
                    }}
                  >
                    <BottomControls />
                    <View className="flex flex-row justify-around pt-2">
                      {state.routes.map((route, index) => {
                        if (
                          route.name !== "(home)" &&
                          route.name !== "settings"
                        ) {
                          return null;
                        }
                        const { options } = descriptors[route.key];

                        const isFocused = state.index === index;

                        const onPress = () => {
                          const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                          });

                          if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                          }
                        };

                        const onLongPress = () => {
                          navigation.emit({
                            type: "tabLongPress",
                            target: route.key,
                          });
                        };

                        return (
                          <TouchableOpacity
                            key={route.key}
                            className="flex flex-col items-center"
                            accessibilityRole="button"
                            accessibilityState={
                              isFocused ? { selected: true } : {}
                            }
                            accessibilityLabel={
                              options.tabBarAccessibilityLabel
                            }
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                          >
                            {route.name === "(home)" ? (
                              isFocused ? (
                                <Mc
                                  name="home"
                                  size={32}
                                  color="rgb(228 228 231)"
                                />
                              ) : (
                                <Mc
                                  name="home-outline"
                                  size={32}
                                  color="rgb(228 228 231)"
                                />
                              )
                            ) : isFocused ? (
                              <Mc
                                name="cog"
                                size={32}
                                color="rgb(228 228 231)"
                              />
                            ) : (
                              <Mc
                                name="cog-outline"
                                size={32}
                                color="rgb(228 228 231)"
                              />
                            )}
                            <Text className="text-zinc-500 text-xs">
                              {route.name === "(home)" ? "Home" : "Settings"}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              />
              <PortalHost name="modal" />
            </SettingsProvider>
          </APIProvider>
        </PortalProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

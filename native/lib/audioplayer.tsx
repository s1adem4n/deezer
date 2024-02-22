import React, { useEffect, useState } from "react";

import { View, Text, Image, Dimensions, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { parseLength } from "./utils";
import TrackPlayer, {
  useProgress,
  Event,
  useTrackPlayerEvents,
  State,
  usePlaybackState,
  Progress,
  PlaybackState,
} from "react-native-track-player";
import { PlayerTrack } from "./api/utils";
import Fa from "@expo/vector-icons/FontAwesome6";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  Directions,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Slider from "@react-native-community/slider";
import { VolumeManager } from "react-native-volume-manager";

const mustNumber = (value: number | null | undefined): number => {
  if (value === null || value === undefined || isNaN(value)) {
    return 0;
  }
  return value;
};

const FullScreenPlayer: React.FC<{
  progress: Progress;
  playbackState:
    | PlaybackState
    | {
        state: undefined;
      };
  track: PlayerTrack | null;
  onClose?: () => void;
}> = ({ progress, playbackState, track, onClose }) => {
  const safeArea = useSafeAreaInsets();
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    VolumeManager.showNativeVolumeUI({ enabled: false });
    VolumeManager.getVolume().then((v) => {
      setVolume(v.volume);
    });
    VolumeManager.addVolumeListener((v) => {
      setVolume(v.volume);
    });

    return () => {
      VolumeManager.showNativeVolumeUI({ enabled: true });
    };
  }, []);

  return (
    <BottomSheet
      onClose={onClose}
      enablePanDownToClose
      snapPoints={["100%"]}
      handleComponent={(props) => (
        <View
          {...props}
          className="w-12 h-1 bg-zinc-700 rounded-md my-2 mx-auto"
          style={{
            marginTop: safeArea.top,
          }}
        />
      )}
      backgroundComponent={(props) => <View {...props} className="bg-black" />}
    >
      <View
        className="flex flex-col px-4"
        style={{
          height: Dimensions.get("window").height - safeArea.top,
          paddingBottom: safeArea.bottom + 24,
        }}
      >
        <View
          className="w-48 h-48 bg-zinc-800 rounded-md shadow-sm"
          style={{
            width: "100%",
            height: undefined,
            aspectRatio: 1,
          }}
        >
          <Image
            source={{
              uri: track?.artwork,
            }}
            className="rounded-md"
            style={{
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 0.5,
              width: "100%",
              height: undefined,
              aspectRatio: 1,
            }}
          />
        </View>

        <View className="flex flex-row mt-12 justify-between items-center">
          <Text
            className="font-semibold text-2xl text-zinc-200"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {track?.title}
          </Text>
          <Text
            className="text-zinc-500"
            style={{
              paddingVertical: 2,
              paddingHorizontal: 4,
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 1,
              borderRadius: 8,
            }}
          >
            {track ? `${track.format.toUpperCase()} | ${track.bitrate}` : ""}
          </Text>
        </View>
        <Text
          className="text-zinc-500 text-lg -mt-1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {track ? track.artist : ""}
        </Text>
        <View className="flex flex-col w-full">
          <View className="w-full h-8">
            <Slider
              style={{
                width: "100%",
              }}
              minimumValue={0}
              maximumValue={mustNumber(progress.duration)}
              value={mustNumber(progress.position)}
              minimumTrackTintColor="rgb(228 228 231)"
              maximumTrackTintColor="rgb(39 39 42)"
              thumbTintColor="transparent"
              onSlidingComplete={(value) => {
                TrackPlayer.seekTo(value);
              }}
            />
          </View>
          <View className="flex flex-row justify-between items-center w-full">
            <Text
              className="text-zinc-500 font-semibold"
              numberOfLines={1}
              style={{
                fontVariant: ["tabular-nums"],
              }}
            >
              {parseLength(progress.position)}
            </Text>
            <Text
              className="text-zinc-500 font-semibold"
              numberOfLines={1}
              style={{
                fontVariant: ["tabular-nums"],
              }}
            >
              {parseLength(progress.duration)}
            </Text>
          </View>
        </View>
        <View className="flex flex-row justify-between items-center w-2/3 m-auto">
          <TouchableOpacity
            onPress={() => {
              TrackPlayer.skipToPrevious();
            }}
          >
            <Fa name="backward-step" size={48} color="rgb(228 228 231)" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (playbackState.state === State.Playing) {
                TrackPlayer.pause();
              } else {
                TrackPlayer.play();
              }
            }}
          >
            {playbackState.state === State.Playing ? (
              <Fa name="pause" size={60} color="rgb(228 228 231)" />
            ) : (
              <Fa
                name="play"
                style={{
                  marginLeft: 8,
                }}
                size={60}
                color="rgb(228 228 231)"
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              TrackPlayer.skipToNext();
            }}
          >
            <Fa name="forward-step" size={48} color="rgb(228 228 231)" />
          </TouchableOpacity>
        </View>
        <Slider
          style={{
            width: "100%",
          }}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          minimumTrackTintColor="rgb(228 228 231)"
          maximumTrackTintColor="rgb(39 39 42)"
          thumbTintColor="rgb(228 228 231)"
          onSlidingComplete={(value) => {
            VolumeManager.setVolume(value);
          }}
        />
      </View>
    </BottomSheet>
  );
};

export const AudioPlayer: React.FC = () => {
  const safeArea = useSafeAreaInsets();
  const progress = useProgress(250);
  const playbackState = usePlaybackState();
  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const [fullScreen, setFullScreen] = useState(false);

  const previous = Gesture.Fling();
  previous.direction(Directions.RIGHT);
  previous.onEnd(() => {
    TrackPlayer.skipToPrevious();
  });

  const next = Gesture.Fling();
  next.direction(Directions.LEFT);
  next.onEnd(() => {
    TrackPlayer.skipToNext();
  });

  const showSheet = Gesture.Fling();
  showSheet.direction(Directions.UP);
  showSheet.onEnd(() => {
    setFullScreen(true);
  });

  const gestures = Gesture.Race(previous, next, showSheet);

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], (event) => {
    if (event.track) {
      setTrack(event.track as PlayerTrack);
    }
  });

  return (
    <>
      <GestureDetector gesture={gestures}>
        <View
          className="flex flex-col border-t border-zinc-900 bg-black"
          style={{
            paddingBottom: safeArea.bottom,
          }}
        >
          <View className="p-2 flex flex-row items-center">
            <View className="w-12 h-12 rounded-md bg-zinc-800 shadow-sm">
              {track ? (
                <Image
                  source={{
                    uri: track.artwork,
                  }}
                  className="w-12 h-12 rounded-md"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    borderWidth: 0.5,
                  }}
                />
              ) : null}
            </View>
            <View
              className="flex flex-col ml-2 h-9"
              style={{
                width: "70%",
              }}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="font-semibold text-zinc-200"
              >
                {track ? track.title : ""}
              </Text>

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-zinc-500"
              >
                {track ? track.artist : ""}
              </Text>
            </View>

            <TouchableOpacity
              className="ml-auto mr-2"
              onPress={() => {
                if (playbackState.state === State.Playing) {
                  TrackPlayer.pause();
                } else {
                  TrackPlayer.play();
                }
              }}
            >
              {playbackState.state === State.Playing ? (
                <Fa name="pause" size={24} color="rgb(228 228 231)" />
              ) : (
                <Fa name="play" size={24} color="rgb(228 228 231)" />
              )}
            </TouchableOpacity>
          </View>
          <View className="flex flex-row justify-between items-center px-2 h-4">
            <Text
              className="text-zinc-500 text-xs"
              style={{
                fontVariant: ["tabular-nums"],
              }}
              numberOfLines={1}
            >
              {parseLength(progress.position)}
            </Text>
            <Slider
              style={{
                width: "75%",
              }}
              minimumValue={0}
              maximumValue={mustNumber(progress.duration)}
              value={mustNumber(progress.position)}
              minimumTrackTintColor="rgb(228 228 231)"
              maximumTrackTintColor="rgb(39 39 42)"
              thumbTintColor="transparent"
              onSlidingComplete={(value) => {
                TrackPlayer.seekTo(value);
              }}
            />
            <Text
              className="text-zinc-500 text-xs"
              style={{
                fontVariant: ["tabular-nums"],
              }}
              numberOfLines={1}
            >
              {parseLength(progress.duration)}
            </Text>
          </View>
        </View>
      </GestureDetector>
      {fullScreen ? (
        <FullScreenPlayer
          progress={progress}
          playbackState={playbackState}
          track={track}
          onClose={() => setFullScreen(false)}
        />
      ) : null}
    </>
  );
};

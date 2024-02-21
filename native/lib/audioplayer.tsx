import React, { useEffect, useRef, useState } from "react";

import {
  View,
  Text,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { parseLength } from "./utils";
import TrackPlayer, {
  useProgress,
  Track,
  Event,
  useTrackPlayerEvents,
  State,
  usePlaybackState,
  Progress,
  PlaybackState,
} from "react-native-track-player";
import Fa from "@expo/vector-icons/FontAwesome5";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  Directions,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

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
  track: Track | null;
  onClose?: () => void;
}> = ({ progress, playbackState, track, onClose }) => {
  const safeArea = useSafeAreaInsets();
  return (
    <BottomSheet
      onClose={onClose}
      topInset={safeArea.top}
      enablePanDownToClose
      snapPoints={["100%"]}
      backgroundComponent={(props) => (
        <View {...props} className="bg-white shadow-sm" />
      )}
    >
      <View
        className="flex-1 flex flex-col items-center px-4"
        style={{
          paddingBottom: safeArea.bottom,
        }}
      >
        <View
          className="w-48 h-48 bg-gray-200 rounded-md shadow-sm"
          style={{
            width: windowWidth - 32,
            height: windowWidth - 32,
          }}
        >
          <Image
            source={{
              uri: track?.artwork,
            }}
            className="rounded-md"
            style={{
              width: windowWidth - 32,
              height: windowWidth - 32,
            }}
          />
        </View>

        <View
          className="flex flex-row justify-between items-center mt-4"
          style={{
            width: windowWidth - 32,
          }}
        >
          <Text
            className="text-gray-500 font-semibold"
            numberOfLines={1}
            style={{
              fontVariant: ["tabular-nums"],
            }}
          >
            {parseLength(progress.position)}
          </Text>
          <View
            className="h-4 flex flex-row items-center"
            onStartShouldSetResponder={() => true}
            onResponderRelease={(event) => {
              const xPosition = event.nativeEvent.locationX;
              const percent = xPosition / (windowWidth - 125);
              TrackPlayer.seekTo(percent * progress.duration);
            }}
          >
            <View
              className="h-4 bg-gray-100 rounded-md shadow-sm"
              style={{
                width: windowWidth - 125,
              }}
            >
              <View
                className="h-4 bg-gray-700 rounded-md"
                style={{
                  width: Math.max(
                    mustNumber(
                      (progress.position / progress.duration) *
                        (windowWidth - 125)
                    ),
                    2
                  ),
                }}
              />
            </View>
          </View>
          <Text
            className="text-gray-500 font-semibold"
            numberOfLines={1}
            style={{
              fontVariant: ["tabular-nums"],
            }}
          >
            {parseLength(progress.duration)}
          </Text>
        </View>
        <Text className="font-semibold mt-4 text-2xl text-center">
          {track ? track.title : ""}
        </Text>
        <Text
          className="text-gray-500 text-center mt-1"
          style={{
            fontSize: 18,
          }}
        >
          {track ? track.artist : ""}
        </Text>
        <View className="flex flex-row justify-center items-center mt-8">
          <TouchableOpacity
            className="h-16 w-16 flex flex-row items-center justify-center"
            onPress={() => {
              TrackPlayer.skipToPrevious();
            }}
          >
            <Fa name="step-backward" size={48} color="rgb(17 24 39)" />
          </TouchableOpacity>
          <TouchableOpacity
            className="h-24 w-24 flex flex-row items-center justify-center bg-gray-100 shadow-sm rounded-full mx-4"
            onPress={() => {
              if (playbackState.state === State.Playing) {
                TrackPlayer.pause();
              } else {
                TrackPlayer.play();
              }
            }}
          >
            {playbackState.state === State.Playing ? (
              <Fa name="pause" size={60} color="rgb(17 24 39)" />
            ) : (
              <Fa
                name="play"
                style={{
                  marginLeft: 8,
                }}
                size={60}
                color="rgb(17 24 39)"
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            className="h-20 w-20 flex flex-row items-center justify-center"
            onPress={() => {
              TrackPlayer.skipToNext();
            }}
          >
            <Fa name="step-forward" size={48} color="rgb(17 24 39)" />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

export const AudioPlayer: React.FC = () => {
  const safeArea = useSafeAreaInsets();
  const progress = useProgress(250);
  const playbackState = usePlaybackState();
  const [track, setTrack] = useState<Track | null>(null);
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
  showSheet.onEnd((e) => {
    setFullScreen(true);
  });

  const gestures = Gesture.Race(previous, next, showSheet);

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged], (event) => {
    if (event.track) {
      setTrack(event.track);
    }
  });

  return (
    <>
      <GestureDetector gesture={gestures}>
        <View
          className="flex flex-col shadow border-t border-gray-200 bg-white"
          style={{
            paddingBottom: safeArea.bottom,
          }}
        >
          <View className="p-2 flex flex-row items-center">
            <View className="w-12 h-12 rounded-md bg-gray-200 shadow-sm">
              {track ? (
                <Image
                  source={{
                    uri: track.artwork,
                  }}
                  className="w-12 h-12 rounded-md"
                />
              ) : null}
            </View>
            <View
              className="flex flex-col ml-2 h-9"
              style={{
                width: windowWidth - 120,
              }}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="font-semibold"
              >
                {track ? track.title : ""}
              </Text>

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-gray-500"
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
                <Fa name="pause" size={24} color="rgb(17 24 39)" />
              ) : (
                <Fa name="play" size={24} color="rgb(17 24 39)" />
              )}
            </TouchableOpacity>
          </View>
          <View className="flex flex-row justify-between items-center px-2">
            <Text className="text-gray-500 text-xs" numberOfLines={1}>
              {parseLength(progress.position)}
            </Text>
            <View
              className="h-4 flex flex-row items-center"
              onStartShouldSetResponder={() => true}
              onResponderRelease={(event) => {
                const xPosition = event.nativeEvent.locationX;
                const percent = xPosition / (windowWidth - 100);
                TrackPlayer.seekTo(percent * progress.duration);
              }}
            >
              <View
                className="h-1 bg-gray-100 rounded-md"
                style={{
                  width: windowWidth - 100,
                }}
              >
                <View
                  className="h-1 bg-gray-700 rounded-md"
                  style={{
                    width: mustNumber(
                      (progress.position / progress.duration) *
                        (windowWidth - 100)
                    ),
                  }}
                />
              </View>
            </View>
            <Text className="text-gray-500 text-xs" numberOfLines={1}>
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

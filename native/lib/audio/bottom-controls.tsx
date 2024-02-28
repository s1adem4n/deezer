import { useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
  Event,
  State,
} from "react-native-track-player";
import { PlayerTrack } from "./controls";
import Fa from "@expo/vector-icons/FontAwesome6";
import FullscreenControls from "./fullscreen-controls";

const BottomControls: React.FC = () => {
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
        <View className="flex flex-col border-t border-zinc-900 bg-black">
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
              <Text numberOfLines={1} className="text-zinc-200">
                {track ? track.title : ""}
              </Text>
              <Text numberOfLines={1} className="text-zinc-500">
                {track ? track.artist : ""}
              </Text>
            </View>

            <TouchableOpacity
              className="ml-auto mr-2 flex items-center justify-center h-9 w-6"
              disabled={
                playbackState.state === State.Loading ||
                playbackState.state === State.Buffering
              }
              onPress={() => {
                if (playbackState.state === State.Playing) {
                  TrackPlayer.pause();
                } else {
                  TrackPlayer.play();
                }
              }}
            >
              {playbackState.state === State.Playing ? (
                <Fa name="pause" size={28} color="rgb(228 228 231)" />
              ) : playbackState.state === State.Loading ||
                playbackState.state === State.Buffering ? (
                <ActivityIndicator />
              ) : (
                <Fa name="play" size={24} color="rgb(228 228 231)" />
              )}
            </TouchableOpacity>
          </View>
          <View className="w-full h-1 bg-zinc-900">
            <View
              className="bg-zinc-200 h-1"
              style={{
                width: `${
                  !(progress.position === 0)
                    ? (progress.position / progress.duration) * 100
                    : 0
                }%`,
              }}
            ></View>
          </View>
        </View>
      </GestureDetector>
      {fullScreen ? (
        <FullscreenControls
          progress={progress}
          playbackState={playbackState}
          track={track}
          onClose={() => setFullScreen(false)}
        />
      ) : null}
    </>
  );
};

export default BottomControls;

import { PlayerTrack } from "./controls";
import { mustNumber, parseLength } from "$lib/utils";
import Slider from "@react-native-community/slider";
import {
  TouchableOpacity,
  View,
  Text,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import TrackPlayer, {
  PlaybackState,
  Progress,
  State,
} from "react-native-track-player";
import { VolumeManager } from "react-native-volume-manager";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import Fa from "@expo/vector-icons/FontAwesome6";
import ProgressSlider from "./progress-slider";
import { Portal } from "@gorhom/portal";

const FullscreenControls: React.FC<{
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
    VolumeManager.getVolume().then((v) => {
      setVolume(v.volume);
    });
    VolumeManager.addVolumeListener((v) => {
      setVolume(v.volume);
    });
  }, []);

  return (
    <Portal hostName="modal">
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
        backgroundComponent={(props) => (
          <View {...props} className="bg-black" />
        )}
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
              className="font-semibold text-2xl text-zinc-200 flex-shrink"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {track?.title}
            </Text>
            <Text
              className="text-zinc-500 ml-2 py-1 px-2"
              style={{
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
          <View className="flex flex-col w-full mt-2">
            <ProgressSlider progress={progress} />

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
                <Fa name="pause" size={64} color="rgb(228 228 231)" />
              ) : playbackState.state === State.Loading ||
                playbackState.state === State.Buffering ? (
                <ActivityIndicator size="large" />
              ) : (
                <Fa name="play" size={64} color="rgb(228 228 231)" />
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
              marginTop: 24,
              height: 32,
            }}
            tapToSeek
            minimumValue={0}
            maximumValue={1}
            value={volume}
            minimumTrackTintColor="rgb(228 228 231)"
            maximumTrackTintColor="rgb(39 39 42)"
            thumbTintColor="rgb(228 228 231)"
            onValueChange={(value) => {
              VolumeManager.setVolume(value);
            }}
          />
        </View>
      </BottomSheet>
    </Portal>
  );
};

export default FullscreenControls;

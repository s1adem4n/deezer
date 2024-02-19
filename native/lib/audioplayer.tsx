import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { AVPlaybackStatus, AVPlaybackStatusSuccess, Audio } from "expo-av";
import { Artist, BASE_URL, Track, api } from "./api";
import {
  View,
  Text,
  Image,
  Dimensions,
  Animated,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { parseLength } from "./utils";

const PlayerContext = createContext<{
  sound: Audio.Sound | null;
  track: Track | null;
  playing: boolean;
  play: (track: Track) => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  resume: () => Promise<void>;
} | null>(null);

export const PlayerProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
  }, []);

  const play = async (track: Track) => {
    const { sound } = await Audio.Sound.createAsync({
      uri: `${BASE_URL}/${track.audioPath}`,
    });

    setSound(sound);
    setTrack(track);
    setPlaying(true);

    await sound.playAsync();
  };

  const pause = async () => {
    if (sound && playing) {
      setPlaying(false);
      await sound.pauseAsync();
    }
  };

  const stop = async () => {
    if (sound) {
      setPlaying(false);
      await sound.stopAsync();
    }
  };

  const resume = async () => {
    if (sound && !playing) {
      setPlaying(true);
      await sound.playAsync();
    }
  };

  return (
    <PlayerContext.Provider
      value={{ sound, track, playing, play, pause, stop, resume }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

const windowWidth = Dimensions.get("window").width;

export const AudioPlayer: React.FC = () => {
  const player = usePlayer();
  const safeArea = useSafeAreaInsets();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [status, setStatus] = useState<AVPlaybackStatusSuccess | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (player.sound) {
        setStatus(
          (await player.sound.getStatusAsync()) as AVPlaybackStatusSuccess
        );
      }
    }, 200);

    return () => clearInterval(interval);
  }, [player.sound]);

  useEffect(() => {
    if (!status) return;
    if (!status.isPlaying) {
      player.pause();
    }
  }, [status]);

  useEffect(() => {
    if (!player.track) return;
    api.tracks.artists(player.track.id).then(setArtists);
  }, [player.track]);

  return (
    <View
      className="flex flex-col shadow border-t border-gray-200 bg-white"
      style={{
        paddingBottom: safeArea.bottom,
      }}
    >
      <View className="p-2 flex flex-row items-center">
        <View className="w-12 h-12 rounded-md bg-gray-200 shadow-sm">
          {player.track ? (
            <Image
              source={{
                uri: `${BASE_URL}/${player.track.coverPath}`,
              }}
              className="w-12 h-12 rounded-md"
            />
          ) : null}
        </View>
        <View
          className="flex flex-col ml-2 h-9"
          style={{
            width: windowWidth - 150,
          }}
        >
          <ScrollView
            showsHorizontalScrollIndicator={false}
            bounces={false}
            horizontal
            className="h-2"
          >
            <Text className="font-semibold">
              {player.track ? player.track.title : ""}
            </Text>
          </ScrollView>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            bounces={false}
            horizontal
            className="h-2"
          >
            <Text className="text-gray-500">
              {artists.map((artist) => artist.name).join(", ")}
            </Text>
          </ScrollView>
        </View>
        <Text
          className="text-gray-500 ml-auto"
          onPress={async () => {
            if (player.playing) {
              await player.pause();
            } else if (player.sound) {
              await player.resume();
            }
          }}
        >
          {player.playing ? "Pause" : "Play"}
        </Text>
      </View>
      <View className="flex flex-row justify-between items-center px-2">
        <Text className="text-gray-500 text-xs" numberOfLines={1}>
          {status ? parseLength(status.positionMillis / 1000) : "00:00"}
        </Text>
        <View
          className="h-4 flex flex-row items-center"
          onStartShouldSetResponder={() => true}
          onResponderRelease={(event) => {
            const xPosition = event.nativeEvent.locationX;
            const progress = xPosition / (windowWidth - 100);

            if (player.sound && player.track) {
              player.sound.setPositionAsync(
                progress * player.track.length * 1000
              );
            }
          }}
        >
          <View
            className="h-1 bg-gray-200 rounded-md"
            style={{
              width: windowWidth - 100,
            }}
          >
            <View
              className="h-1 bg-gray-700 rounded-md"
              style={{
                width:
                  status && player.track
                    ? (status.positionMillis / 1000 / player.track.length) *
                      (windowWidth - 100)
                    : 0,
              }}
            />
          </View>
        </View>
        <Text className="text-gray-500 text-xs" numberOfLines={1}>
          {player.track ? parseLength(player.track.length) : "00:00"}
        </Text>
      </View>
    </View>
  );
};

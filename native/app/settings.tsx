import { ScrollView, Text, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { settings } from "$lib/settings";
import Fa from "@expo/vector-icons/FontAwesome6";
import { Band } from "$lib/api";
import VerticalSlider from "$lib/vertical-slider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Page() {
  const headerHeight = useHeaderHeight();
  const safeAreaInsets = useSafeAreaInsets();
  const [bitrate, setBitrate] = useState<number>(320);
  const [bands, setBands] = useState<Band[]>([]);

  useEffect(() => {
    setBitrate(settings.bitrate);
    setBands(settings.bands);
  }, []);

  useEffect(() => {
    settings.bitrate = bitrate;
  }, [bitrate]);

  return (
    <ScrollView
      className="bg-black flex-1 px-2"
      scrollIndicatorInsets={{ top: 0 }}
      contentInset={{
        top: headerHeight + safeAreaInsets.top,
      }}
    >
      <Stack.Screen options={{ title: "Settings" }} />
      <Text className="text-zinc-200 text-lg">Bitrate</Text>
      <View className="flex flex-col">
        {[
          {
            bitrate: 999999,
            text: "Best quality available, original bitrate",
          },
          {
            bitrate: 320,
            text: "High quality, best for high-end audio systems",
          },
          {
            bitrate: 256,
            text: "Great quality, good for most audio systems",
          },
          {
            bitrate: 192,
            text: "Good quality, works well for most listeners",
          },
          {
            bitrate: 128,
            text: "Fair quality, good for mobile and internet streaming",
          },
          {
            bitrate: 64,
            text: "Lower quality, best for voice and talk radio",
          },
        ].map((value, i) => (
          <View
            key={value.bitrate}
            className={`flex flex-row items-center py-2 border-b border-zinc-900`}
            onStartShouldSetResponder={() => true}
            onResponderRelease={() => {
              setBitrate(value.bitrate);
            }}
          >
            {bitrate === value.bitrate ? (
              <Fa
                name="check"
                size={16}
                color="rgb(228 228 231)"
                style={{
                  marginRight: 8,
                }}
              />
            ) : (
              <Fa
                name="check"
                size={16}
                color="rgb(228 228 231)"
                style={{
                  marginRight: 8,
                  opacity: 0.2,
                }}
              />
            )}
            <View className="flex flex-col">
              <Text className="text-zinc-200 text-lg">
                {value.bitrate === 999999
                  ? "Original"
                  : `${value.bitrate} kbps`}
              </Text>
              <Text
                className="text-zinc-500 text-sm"
                lineBreakStrategyIOS="push-out"
              >
                {value.text}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text className="text-zinc-200 text-lg">Equalizer</Text>
      <View className="flex flex-row justify-between mb-4">
        {bands.map((band, i) => (
          <View className="flex flex-col justify-center items-center" key={i}>
            <Text className="text-zinc-200 text-sm">
              {band.frequency >= 1000
                ? `${band.frequency / 1000}k`
                : `${band.frequency}`}
            </Text>
            <VerticalSlider
              max={-10}
              min={10}
              center={0.5}
              height={100}
              initial={band.gain}
              onChange={(value) => {
                const newBands = bands.slice();
                newBands[i].gain = value;
                setBands(newBands);
              }}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

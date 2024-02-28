import { ScrollView, Text, TextInput, View } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Stack } from "expo-router";
import { useSettings } from "$lib/settings";
import Fa from "@expo/vector-icons/FontAwesome6";
import VerticalSlider from "$lib/vertical-slider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Page() {
  const headerHeight = useHeaderHeight();
  const safeAreaInsets = useSafeAreaInsets();
  const { value: settings, setSettings } = useSettings();

  return (
    <View
      className="bg-black"
      style={{
        paddingTop: headerHeight + safeAreaInsets.top,
        flex: 1,
      }}
    >
      <ScrollView
        className="bg-black flex-1 px-2"
        scrollIndicatorInsets={{ top: 0 }}
      >
        <Stack.Screen options={{ title: "Settings" }} />
        <Text className="text-zinc-200 text-lg">API URL</Text>
        <TextInput
          className="bg-zinc-900 text-zinc-200 p-2 rounded-md"
          value={settings.apiURL}
          onChangeText={(text) => {
            setSettings({
              ...settings,
              apiURL: text,
            });
          }}
        />

        <Text className="text-zinc-200 text-lg mt-4">Bitrate</Text>
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
              className={`flex flex-row items-center py-2 border-b border-zinc-900 ${
                i === 0 && "border-t"
              }`}
              onStartShouldSetResponder={() => true}
              onResponderRelease={() => {
                setSettings({
                  ...settings,
                  bitrate: value.bitrate,
                });
              }}
            >
              {settings.bitrate === value.bitrate ? (
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

        <Text className="text-zinc-200 text-lg mt-4">Equalizer</Text>
        <View className="flex flex-row justify-between mb-4">
          {settings.bands.map((band, i) => (
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
                  const newBands = settings.bands.slice();
                  newBands[i].gain = value;
                  setSettings({
                    ...settings,
                    bands: newBands,
                  });
                }}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

import { mustNumber } from "$lib/utils";
import { useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import TrackPlayer, { Progress } from "react-native-track-player";

const ProgressSlider: React.FC<{
  progress: Progress;
}> = ({ progress }) => {
  const [width, setWidth] = useState(0);
  const [slidingValue, setSlidingValue] = useState<number | null>(null);

  const drag = Gesture.Pan();
  drag.onChange((e) => {
    let value = 0;
    if (e.x > width) {
      value = 1;
    } else if (e.x < 0) {
      value = 0;
    } else {
      value = e.x / width;
    }
    setSlidingValue(value);
  });
  drag.onEnd(() => {
    if (slidingValue !== null) {
      TrackPlayer.seekTo(mustNumber(progress.duration) * slidingValue).then(
        () => {
          setSlidingValue(null);
        }
      );
    }
  });

  return (
    <GestureDetector gesture={drag}>
      <View
        className="flex-shrink w-full flex items-center flex-row h-6"
        onLayout={(e) => {
          setWidth(e.nativeEvent.layout.width);
        }}
      >
        <View className="h-2 bg-zinc-800 w-full absolute rounded-md" />
        <View
          className="h-2 bg-zinc-200 rounded-md absolute"
          style={{
            width: `${
              (mustNumber(progress.position) / mustNumber(progress.duration)) *
              100
            }%`,
          }}
        />
        {slidingValue ? (
          <View
            className="h-2 rounded-full bg-zinc-400 z-10 absolute"
            style={{
              opacity: 0.75,
              width: `${slidingValue * 100}%`,
            }}
          />
        ) : null}
      </View>
    </GestureDetector>
  );
};

export default ProgressSlider;

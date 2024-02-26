import { useEffect, useState } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Text, View } from "react-native";

interface VerticalSliderProps {
  min: number;
  max: number;
  center: number;
  height: number;
  initial?: number;
  onChange: (value: number) => void;
}

const VerticalSlider: React.FC<VerticalSliderProps> = ({
  min,
  max,
  center,
  height,
  initial = 0,
  onChange,
}) => {
  const [progress, setProgress] = useState(center);
  const [value, setValue] = useState(0);

  useEffect(() => {
    setProgress((initial - min) / (max - min));
    setValue(initial);
  }, [initial]);

  const reset = Gesture.LongPress();
  reset.onFinalize(() => {
    setProgress(center);
    setValue(0);
    onChange(0);
  });
  const pan = Gesture.Pan();
  pan.onChange((e) => {
    if (e.y > height) {
      setProgress(1);
    } else if (e.y < 0) {
      setProgress(0);
    } else {
      setProgress(e.y / height);
    }
    setValue(min + progress * (max - min));
  });
  pan.onEnd(() => {
    onChange(value);
  });

  const gesture = Gesture.Race(reset, pan);

  return (
    <GestureDetector gesture={gesture}>
      <View className="flex flex-col items-center w-9">
        <View
          className="w-2 bg-zinc-500 flex flex-row items-center justify-center rounded-md"
          style={{
            height: height,
          }}
        >
          <View
            className="w-2 bg-zinc-200 rounded-md"
            style={{
              position: "absolute",
              top: progress <= center ? progress * height : "50%",
              bottom: progress >= center ? (1 - progress) * height : "50%",
            }}
          />
        </View>
        <Text
          className="text-zinc-500 text-center text-xs"
          style={{
            fontVariant: ["tabular-nums"],
          }}
          numberOfLines={1}
        >
          {value === 0 ? value : `${value > 0 ? "+" : ""}${value.toFixed(1)}`}
        </Text>
      </View>
    </GestureDetector>
  );
};

export default VerticalSlider;

module.exports = function (api) {
  api.cache(true);
  return {
    plugins: [
      "react-native-reanimated/plugin",
      "nativewind/babel",
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            $lib: "./lib",
          },
        },
      ],
    ],
    presets: ["babel-preset-expo"],
  };
};

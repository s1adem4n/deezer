module.exports = function (api) {
  api.cache(true);
  return {
    plugins: [
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

import { Stack } from "expo-router";

export default function Layout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerTransparent: true,
          headerBlurEffect: "dark",
          headerTintColor: "rgb(229 231 235)",
        }}
      ></Stack>
    </>
  );
}

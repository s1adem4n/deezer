import { createContext, useContext, useState } from "react";
import { API } from "./api";

const APIContext = createContext<{
  value: API;
  setURL: (url: string) => void;
}>({
  value: new API(""),
  setURL: () => {},
});

export const APIProvider = ({ children }: { children: React.ReactNode }) => {
  const [value, setValue] = useState<API>(new API(""));

  return (
    <APIContext.Provider
      value={{
        value,
        setURL: (url: string) => {
          setValue(new API(url));
        },
      }}
    >
      {children}
    </APIContext.Provider>
  );
};

export const useAPI = () => {
  return useContext(APIContext);
};

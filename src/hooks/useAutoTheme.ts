import { useEffect, useState } from "react";

import { Theme } from "@excalidraw/excalidraw/types/element/types";

const useAutoTheme = () => {
  const [autoTheme, setAutoTheme] = useState<Theme>("light");

  const handleDarkChange = () => {
    setAutoTheme("light");
  };

  const handleLightChange = () => {
    setAutoTheme("dark");
  };

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const isDark = window.matchMedia("(prefers-color-scheme: dark)");
    const isLight = window.matchMedia("(prefers-color-scheme: light)");

    if (isDark) {
      setAutoTheme("dark");
    }
    if (isLight) {
      setAutoTheme("light");
    }

    isDark.addEventListener("change", handleDarkChange);
    isLight.addEventListener("change", handleLightChange);
    return () => {
      isDark.removeEventListener("change", handleDarkChange);
      isLight.removeEventListener("change", handleLightChange);
    };
  }, []);

  return autoTheme;
};

export default useAutoTheme;

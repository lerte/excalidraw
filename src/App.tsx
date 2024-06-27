import { Excalidraw, WelcomeScreen } from "../packages/excalidraw";
import { useEffect, useState } from "react";

import { AppMainMenu } from "./components/AppMainMenu";
import { ExcalidrawImperativeAPI } from "../packages/excalidraw/types";

const App = () => {
  // @ts-ignore
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();

  const disableContextMenuAfterBundle = () => {
    if (!import.meta.env.DEV) {
      document.oncontextmenu = (event) => {
        event.preventDefault();
      };
    }
  };

  useEffect(() => {
    disableContextMenuAfterBundle();
    if (excalidrawAPI) {
    }
  }, [excalidrawAPI]);

  return (
    <div className="app h-full">
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        gridModeEnabled
        langCode="zh-CN"
        initialData={{
          scrollToContent: true,
          appState: {
            theme: "dark",
            currentItemFontFamily: 5,
          },
        }}
      >
        <WelcomeScreen />
        <AppMainMenu />
      </Excalidraw>
    </div>
  );
};

export default App;

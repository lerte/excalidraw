import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import { useEffect, useState } from "react";

import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";

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
          },
        }}
      >
        <WelcomeScreen />
        <MainMenu>
          <MainMenu.Group>
            <MainMenu.DefaultItems.LoadScene />
            <MainMenu.DefaultItems.Export />
            <MainMenu.DefaultItems.SaveAsImage />
            <MainMenu.DefaultItems.Help />
            <MainMenu.DefaultItems.ClearCanvas />
          </MainMenu.Group>
          <MainMenu.Separator />
          <MainMenu.Group>
            <MainMenu.DefaultItems.ToggleTheme />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
          </MainMenu.Group>
        </MainMenu>
      </Excalidraw>
    </div>
  );
};

export default App;

import { Excalidraw, WelcomeScreen } from "../packages/excalidraw";
import {
  ExcalidrawImperativeAPI,
  UIAppState,
} from "../packages/excalidraw/types";
import { useEffect, useState } from "react";

import { AppMainMenu } from "./components/AppMainMenu";
import CustomStats from "./CustomStats.tsx";
import { NonDeletedExcalidrawElement } from "../packages/excalidraw/element/types";

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

  const renderCustomStats = (
    elements: readonly NonDeletedExcalidrawElement[],
    appState: UIAppState
  ) => {
    return (
      <CustomStats
        setToast={(message: string) => excalidrawAPI!.setToast({ message })}
        appState={appState}
        elements={elements}
      />
    );
  };

  return (
    <div className="app h-full">
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        langCode="zh-CN"
        renderCustomStats={renderCustomStats}
        initialData={{
          scrollToContent: true,
          appState: {
            theme: "dark",
            currentItemFontFamily: 5, // 中文手写 小赖字体
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

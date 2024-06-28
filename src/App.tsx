import { Excalidraw, WelcomeScreen } from "../packages/excalidraw";
import {
  ExcalidrawImperativeAPI,
  UIAppState,
} from "../packages/excalidraw/types";
import { useEffect, useState } from "react";

import { AppMainMenu } from "./components/AppMainMenu";
import CustomStats from "./CustomStats.tsx";
import { NonDeletedExcalidrawElement } from "../packages/excalidraw/element/types";
import { listen } from "@tauri-apps/api/event";
import { readTextFile } from "@tauri-apps/plugin-fs";

const App = () => {
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
  }, []);

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

  type Payload = {
    paths: string[];
    position: {
      x: number;
      y: number;
    };
  };
  useEffect(() => {
    if (excalidrawAPI) {
      listen<Payload>("tauri://drop", (event) => {
        const { paths } = event.payload;
        paths.map(async (path) => {
          // 如果扩展名是.excalidraw (Excalidraw保存的文件格式)
          if (path.endsWith(".excalidraw")) {
            const content = await readTextFile(path);
            const sceneData = JSON.parse(content);
            for (let file in sceneData.files) {
              excalidrawAPI.addFiles([sceneData.files[file]]);
            }
            excalidrawAPI.updateScene(sceneData);
          }
          // 如果扩展名是.excalidrawlib (Excalidraw保存的库文件格式)
          if (path.endsWith("excalidrawlib")) {
            const content = await readTextFile(path);
            const library = JSON.parse(content);
            excalidrawAPI.updateLibrary(library);
          }
        });
      });
    }
  }, [excalidrawAPI]);

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

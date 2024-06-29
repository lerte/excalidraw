import {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  UIAppState,
} from "../packages/excalidraw/types";
import {
  Excalidraw,
  StoreAction,
  WelcomeScreen,
  newElementWith,
} from "../packages/excalidraw";
import {
  FileId,
  NonDeletedExcalidrawElement,
  OrderedExcalidrawElement,
} from "../packages/excalidraw/element/types";
import {
  ResolvablePromise,
  resolvablePromise,
} from "../packages/excalidraw/utils.ts";
import { useEffect, useRef, useState } from "react";

import App from "../packages/excalidraw/components/App";
import { AppMainMenu } from "./components/AppMainMenu";
import CustomStats from "./CustomStats.tsx";
import { LocalData } from "./data/LocalData.ts";
import { ResolutionType } from "../packages/excalidraw/utility-types.ts";
import { RestoredDataState } from "../packages/excalidraw/data/restore.ts";
import { createPasteEvent } from "../packages/excalidraw/clipboard.ts";
import { importFromLocalStorage } from "./data/localStorage";
import { isInitializedImageElement } from "../packages/excalidraw/element/typeChecks.ts";
import { listen } from "@tauri-apps/api/event";
import { loadScene } from "./data";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { updateStaleImageStatuses } from "./data/FileManager.ts";

const ExcalidrawApp = () => {
  const [app, setApp] = useState<App>();
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();

  // initial state
  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise =
      resolvablePromise<ExcalidrawInitialDataState | null>();
  }

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

  const initializeScene = async (_opts: {
    excalidrawAPI: ExcalidrawImperativeAPI;
  }): Promise<
    { scene: ExcalidrawInitialDataState | null } & (
      | { isExternalScene: true; id: string; key: string }
      | { isExternalScene: false; id?: null; key?: null }
    )
  > => {
    const localDataState = importFromLocalStorage();

    let scene: RestoredDataState & {
      scrollToContent?: boolean;
    } = await loadScene(null, null, localDataState);

    if (scene) {
      return { scene, isExternalScene: false };
    }
    return { scene: null, isExternalScene: false };
  };

  const onChange = (
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles
  ) => {
    // this check is redundant, but since this is a hot path, it's best
    // not to evaludate the nested expression every time
    if (!LocalData.isSavePaused()) {
      LocalData.save(elements, appState, files, () => {
        if (excalidrawAPI) {
          let didChange = false;

          const elements = excalidrawAPI
            .getSceneElementsIncludingDeleted()
            .map((element) => {
              if (
                LocalData.fileStorage.shouldUpdateImageElementStatus(element)
              ) {
                const newElement = newElementWith(element, { status: "saved" });
                if (newElement !== element) {
                  didChange = true;
                }
                return newElement;
              }
              return element;
            });

          if (didChange) {
            excalidrawAPI.updateScene({
              elements,
              storeAction: StoreAction.UPDATE,
            });
          }
        }
      });
    }
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
      const loadImages = (
        data: ResolutionType<typeof initializeScene>,
        isInitialLoad = false
      ) => {
        if (!data.scene) {
          return;
        }

        const fileIds =
          data.scene.elements?.reduce((acc, element) => {
            if (isInitializedImageElement(element)) {
              return acc.concat(element.fileId);
            }
            return acc;
          }, [] as FileId[]) || [];

        if (isInitialLoad) {
          if (fileIds.length) {
            LocalData.fileStorage
              .getFiles(fileIds)
              .then(({ loadedFiles, erroredFiles }) => {
                if (loadedFiles.length) {
                  excalidrawAPI.addFiles(loadedFiles);
                }
                updateStaleImageStatuses({
                  excalidrawAPI,
                  erroredFiles,
                  elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
                });
              });
          }
          // on fresh load, clear unused files from IDB (from previous
          // session)
          LocalData.fileStorage.clearObsoleteFiles({ currentFileIds: fileIds });
        }
      };

      // 初始化场景
      initializeScene({ excalidrawAPI }).then(async (data) => {
        loadImages(data, /* isInitialLoad */ true);
        initialStatePromiseRef.current.promise.resolve(data.scene);
      });

      // 处理拖入文件
      listen<Payload>("tauri://drop", (event) => {
        const { paths } = event.payload;
        paths.map(async (path) => {
          // 如果扩展名是.svg,先使用svg-to-excalidraw转换成excalidraw element格式
          if (path.endsWith(".svg")) {
            const text = await readTextFile(path);
            const types = {
              "text/plain": text,
            };
            app?.pasteFromClipboard(createPasteEvent({ types }));
          }
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
        onChange={onChange}
        getApp={(app) => setApp(app)}
        initialData={initialStatePromiseRef.current.promise}
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        langCode="zh-CN"
        renderCustomStats={renderCustomStats}
        aiEnabled={false}
        // initialData={{
        //   scrollToContent: true,
        //   appState: {
        //     theme: "dark",
        //     currentItemFontFamily: 5, // 中文手写 小赖字体
        //   },
        // }}
      >
        <WelcomeScreen />
        <AppMainMenu />
      </Excalidraw>
    </div>
  );
};

export default ExcalidrawApp;

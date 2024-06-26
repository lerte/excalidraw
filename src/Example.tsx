import {
  AppState,
  BinaryFileData,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  PointerDownState as ExcalidrawPointerDownState,
} from "@excalidraw/excalidraw/types/types";
import {
  Excalidraw,
  LiveCollaborationTrigger,
  MIME_TYPES,
  Sidebar,
  THEME,
  sceneCoordsToViewportCoords,
  useHandleLibrary,
} from "@excalidraw/excalidraw";
import {
  NonDeletedExcalidrawElement,
  Theme,
} from "@excalidraw/excalidraw/types/element/types";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { ResolvablePromise } from "@excalidraw/excalidraw/types/utils";
import initialData from "./initialData";
import { resolvablePromise } from "./utils";

declare global {
  interface Window {
    ExcalidrawLib: any;
  }
}

type Comment = {
  x: number;
  y: number;
  value: string;
  id?: string;
};

const COMMENT_ICON_DIMENSION = 32;

export default function App() {
  const appRef = useRef<any>(null);
  const [viewModeEnabled, setViewModeEnabled] = useState(false);
  const [zenModeEnabled, setZenModeEnabled] = useState(false);
  const [gridModeEnabled, setGridModeEnabled] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [canvasUrl, setCanvasUrl] = useState<string>("");
  const [exportWithDarkMode, setExportWithDarkMode] = useState(false);
  const [exportEmbedScene, setExportEmbedScene] = useState(false);
  const [theme, setTheme] = useState<Theme>(THEME.LIGHT);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [commentIcons, setCommentIcons] = useState<{ [id: string]: Comment }>(
    {}
  );
  const [comment, setComment] = useState<Comment | null>(null);

  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise =
      // @ts-ignore
      resolvablePromise<ExcalidrawInitialDataState | null>();
  }

  const [excalidrawAPI, setExcalidrawAPI] =
    useState<ExcalidrawImperativeAPI | null>(null);

  useHandleLibrary({ excalidrawAPI });

  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }
    const fetchData = async () => {
      const res = await fetch("/rocket.jpeg");
      const imageData = await res.blob();
      const reader = new FileReader();
      reader.readAsDataURL(imageData);

      reader.onload = function () {
        const imagesArray: BinaryFileData[] = [
          {
            id: "rocket" as BinaryFileData["id"],
            dataURL: reader.result as BinaryFileData["dataURL"],
            mimeType: MIME_TYPES.jpg,
            created: 1644915140367,
            lastRetrieved: 1644915140367,
          },
        ];

        //@ts-ignore
        initialStatePromiseRef.current.promise.resolve(initialData);
        excalidrawAPI.addFiles(imagesArray);
      };
    };
    fetchData();
  }, [excalidrawAPI]);

  const renderTopRightUI = () => {
    return (
      <>
        <LiveCollaborationTrigger
          isCollaborating={isCollaborating}
          onSelect={() => {
            window.alert("Collab dialog clicked");
          }}
        />
        <button
          onClick={() => alert("This is dummy top right UI")}
          style={{ height: "2.5rem" }}
        >
          {" "}
          Click me{" "}
        </button>
      </>
    );
  };

  const onLinkOpen = useCallback(
    (
      element: NonDeletedExcalidrawElement,
      event: CustomEvent<{
        nativeEvent: MouseEvent | React.PointerEvent<HTMLCanvasElement>;
      }>
    ) => {
      const link = element.link!;
      const { nativeEvent } = event.detail;
      const isNewTab = nativeEvent.ctrlKey || nativeEvent.metaKey;
      const isNewWindow = nativeEvent.shiftKey;
      const isInternalLink =
        link.startsWith("/") || link.includes(window.location.origin);
      if (isInternalLink && !isNewTab && !isNewWindow) {
        // signal that we're handling the redirect ourselves
        event.preventDefault();
        // do a custom redirect, such as passing to react-router
        // ...
      }
    },
    []
  );

  const onPointerDown = (
    activeTool: AppState["activeTool"],
    pointerDownState: ExcalidrawPointerDownState
  ) => {
    if (activeTool.type === "custom" && activeTool.customType === "comment") {
      const { x, y } = pointerDownState.origin;
      setComment({ x, y, value: "" });
    }
  };

  const rerenderCommentIcons = () => {
    if (!excalidrawAPI) {
      return false;
    }
    const commentIconsElements = appRef.current.querySelectorAll(
      ".comment-icon"
    ) as HTMLElement[];
    commentIconsElements.forEach((ele) => {
      const id = ele.id;
      const appstate = excalidrawAPI.getAppState();
      const { x, y } = sceneCoordsToViewportCoords(
        { sceneX: commentIcons[id].x, sceneY: commentIcons[id].y },
        appstate
      );
      ele.style.left = `${
        x - COMMENT_ICON_DIMENSION / 2 - appstate!.offsetLeft
      }px`;
      ele.style.top = `${
        y - COMMENT_ICON_DIMENSION / 2 - appstate!.offsetTop
      }px`;
    });
  };

  const renderSidebar = () => {
    return (
      <Sidebar name="sidebar">
        <Sidebar.Header>Custom header!</Sidebar.Header>
        Custom sidebar!
      </Sidebar>
    );
  };

  return (
    <div
      ref={appRef}
      className="min-h-screen"
    >
      <main className="h-screen">
        <Excalidraw
          excalidrawAPI={(api: ExcalidrawImperativeAPI) =>
            setExcalidrawAPI(api)
          }
          initialData={initialStatePromiseRef.current.promise}
          viewModeEnabled={viewModeEnabled}
          zenModeEnabled={zenModeEnabled}
          gridModeEnabled={gridModeEnabled}
          theme={theme}
          name="Custom name of drawing"
          UIOptions={{
            canvasActions: { loadScene: false },
          }}
          renderTopRightUI={renderTopRightUI}
          onLinkOpen={onLinkOpen}
          onPointerDown={onPointerDown}
          onScrollChange={rerenderCommentIcons}
          renderCustomStats={renderSidebar}
        />
      </main>
    </div>
  );
}

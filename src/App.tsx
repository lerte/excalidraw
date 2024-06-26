import { Excalidraw, WelcomeScreen } from "@excalidraw/excalidraw";

import TopRightUI from "./components/TopRightUI";

const App = () => {
  return (
    <div className="app h-full">
      <Excalidraw
        gridModeEnabled
        langCode="zh-CN"
        renderTopRightUI={TopRightUI}
        initialData={{
          appState: {
            theme: "dark",
          },
        }}
      >
        <WelcomeScreen />
      </Excalidraw>
    </div>
  );
};

export default App;

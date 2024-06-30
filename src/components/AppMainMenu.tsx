import { MainMenu } from "../../packages/excalidraw";
import { Theme } from "../../packages/excalidraw/element/types";

export const AppMainMenu = ({
  theme,
  setTheme,
}: {
  theme: Theme | "system";
  setTheme: (theme: Theme | "system") => void;
}) => {
  return (
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
        <MainMenu.DefaultItems.ToggleTheme
          theme={theme}
          allowSystemTheme
          onSelect={setTheme}
        />
        <MainMenu.DefaultItems.ChangeCanvasBackground />
      </MainMenu.Group>
    </MainMenu>
  );
};

import { MainMenu } from "../../packages/excalidraw";

export const AppMainMenu = () => {
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
        <MainMenu.DefaultItems.ToggleTheme />
        <MainMenu.DefaultItems.ChangeCanvasBackground />
      </MainMenu.Group>
    </MainMenu>
  );
};

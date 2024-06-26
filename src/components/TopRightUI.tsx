import { Button } from "@excalidraw/excalidraw";

const TopRightUI = () => {
  return (
    <div className="flex justify-center items-start">
      <Button
        onSelect={() => {}}
        title="实时协作..."
        className="collab-button"
        style={{
          width: "auto",
        }}
      >
        分享
      </Button>
    </div>
  );
};

export default TopRightUI;

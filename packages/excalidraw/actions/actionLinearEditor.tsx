import { DEFAULT_CATEGORIES } from "../components/CommandPalette/CommandPalette";
import type { ExcalidrawLinearElement } from "../element/types";
import { LinearElementEditor } from "../element/linearElementEditor";
import { StoreAction } from "../store";
import { ToolButton } from "../components/ToolButton";
import { isLinearElement } from "../element/typeChecks";
import { lineEditorIcon } from "../components/icons";
import { register } from "./register";
import { t } from "../i18n";

export const actionToggleLinearEditor = register({
  name: "toggleLinearEditor",
  category: DEFAULT_CATEGORIES.elements,
  label: (_elements, appState, app) => {
    const selectedElement = app.scene.getSelectedElements({
      selectedElementIds: appState.selectedElementIds,
    })[0] as ExcalidrawLinearElement | undefined;

    return selectedElement?.type === "arrow"
      ? "labels.lineEditor.editArrow"
      : "labels.lineEditor.edit";
  },
  keywords: ["line"],
  trackEvent: {
    category: "element",
  },
  predicate: (_elements, appState, _, app) => {
    const selectedElements = app.scene.getSelectedElements(appState);
    if (
      !appState.editingLinearElement &&
      selectedElements.length === 1 &&
      isLinearElement(selectedElements[0])
    ) {
      return true;
    }
    return false;
  },
  perform(_elements, appState, _, app) {
    const selectedElement = app.scene.getSelectedElements({
      selectedElementIds: appState.selectedElementIds,
      includeBoundTextElement: true,
    })[0] as ExcalidrawLinearElement;

    const editingLinearElement =
      appState.editingLinearElement?.elementId === selectedElement.id
        ? null
        : new LinearElementEditor(selectedElement);
    return {
      appState: {
        ...appState,
        editingLinearElement,
      },
      storeAction: StoreAction.CAPTURE,
    };
  },
  PanelComponent: ({ appState, updateData, app }) => {
    const selectedElement = app.scene.getSelectedElements({
      selectedElementIds: appState.selectedElementIds,
    })[0] as ExcalidrawLinearElement;

    const label = t(
      selectedElement.type === "arrow"
        ? "labels.lineEditor.editArrow"
        : "labels.lineEditor.edit"
    );
    return (
      <ToolButton
        type="button"
        icon={lineEditorIcon}
        title={label}
        aria-label={label}
        onClick={() => updateData(null)}
      />
    );
  },
});

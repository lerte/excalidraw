import type { AppClassProperties } from "../types";
import { StoreAction } from "../store";
import { getFontString } from "../utils";
import { getSelectedElements } from "../scene";
import { isTextElement } from "../element";
import { measureText } from "../element/textElement";
import { newElementWith } from "../element/mutateElement";
import { register } from "./register";

export const actionTextAutoResize = register({
  name: "autoResize",
  label: "labels.autoResize",
  icon: null,
  trackEvent: { category: "element" },
  predicate: (elements, appState, _: unknown, _app: AppClassProperties) => {
    const selectedElements = getSelectedElements(elements, appState);
    return (
      selectedElements.length === 1 &&
      isTextElement(selectedElements[0]) &&
      !selectedElements[0].autoResize
    );
  },
  perform: (elements, appState, _, _app) => {
    const selectedElements = getSelectedElements(elements, appState);

    return {
      appState,
      elements: elements.map((element) => {
        if (element.id === selectedElements[0].id && isTextElement(element)) {
          const metrics = measureText(
            element.originalText,
            getFontString(element),
            element.lineHeight
          );

          return newElementWith(element, {
            autoResize: true,
            width: metrics.width,
            height: metrics.height,
            text: element.originalText,
          });
        }
        return element;
      }),
      storeAction: StoreAction.CAPTURE,
    };
  },
});

import {
  BringForwardIcon,
  BringToFrontIcon,
  SendBackwardIcon,
  SendToBackIcon,
} from "../components/icons";
import { CODES, KEYS } from "../keys";
import {
  moveAllLeft,
  moveAllRight,
  moveOneLeft,
  moveOneRight,
} from "../zindex";

import { StoreAction } from "../store";
import { getShortcutKey } from "../utils";
import { isDarwin } from "../constants";
import { register } from "./register";
import { t } from "../i18n";

export const actionSendBackward = register({
  name: "sendBackward",
  label: "labels.sendBackward",
  keywords: ["move down", "zindex", "layer"],
  icon: SendBackwardIcon,
  trackEvent: { category: "element" },
  perform: (elements, appState) => {
    return {
      elements: moveOneLeft(elements, appState),
      appState,
      storeAction: StoreAction.CAPTURE,
    };
  },
  keyPriority: 40,
  keyTest: (event) =>
    event[KEYS.CTRL_OR_CMD] &&
    !event.shiftKey &&
    event.code === CODES.BRACKET_LEFT,
  PanelComponent: ({ updateData, appState: _appState }) => (
    <button
      type="button"
      className="zIndexButton"
      onClick={() => updateData(null)}
      title={`${t("labels.sendBackward")} — ${getShortcutKey("CtrlOrCmd+[")}`}
    >
      {SendBackwardIcon}
    </button>
  ),
});

export const actionBringForward = register({
  name: "bringForward",
  label: "labels.bringForward",
  keywords: ["move up", "zindex", "layer"],
  icon: BringForwardIcon,
  trackEvent: { category: "element" },
  perform: (elements, appState) => {
    return {
      elements: moveOneRight(elements, appState),
      appState,
      storeAction: StoreAction.CAPTURE,
    };
  },
  keyPriority: 40,
  keyTest: (event) =>
    event[KEYS.CTRL_OR_CMD] &&
    !event.shiftKey &&
    event.code === CODES.BRACKET_RIGHT,
  PanelComponent: ({ updateData, appState: _appState }) => (
    <button
      type="button"
      className="zIndexButton"
      onClick={() => updateData(null)}
      title={`${t("labels.bringForward")} — ${getShortcutKey("CtrlOrCmd+]")}`}
    >
      {BringForwardIcon}
    </button>
  ),
});

export const actionSendToBack = register({
  name: "sendToBack",
  label: "labels.sendToBack",
  keywords: ["move down", "zindex", "layer"],
  icon: SendToBackIcon,
  trackEvent: { category: "element" },
  perform: (elements, appState) => {
    return {
      elements: moveAllLeft(elements, appState),
      appState,
      storeAction: StoreAction.CAPTURE,
    };
  },
  keyTest: (event) =>
    isDarwin
      ? event[KEYS.CTRL_OR_CMD] &&
        event.altKey &&
        event.code === CODES.BRACKET_LEFT
      : event[KEYS.CTRL_OR_CMD] &&
        event.shiftKey &&
        event.code === CODES.BRACKET_LEFT,
  PanelComponent: ({ updateData, appState: _appState }) => (
    <button
      type="button"
      className="zIndexButton"
      onClick={() => updateData(null)}
      title={`${t("labels.sendToBack")} — ${
        isDarwin
          ? getShortcutKey("CtrlOrCmd+Alt+[")
          : getShortcutKey("CtrlOrCmd+Shift+[")
      }`}
    >
      {SendToBackIcon}
    </button>
  ),
});

export const actionBringToFront = register({
  name: "bringToFront",
  label: "labels.bringToFront",
  keywords: ["move up", "zindex", "layer"],
  icon: BringToFrontIcon,
  trackEvent: { category: "element" },

  perform: (elements, appState) => {
    return {
      elements: moveAllRight(elements, appState),
      appState,
      storeAction: StoreAction.CAPTURE,
    };
  },
  keyTest: (event) =>
    isDarwin
      ? event[KEYS.CTRL_OR_CMD] &&
        event.altKey &&
        event.code === CODES.BRACKET_RIGHT
      : event[KEYS.CTRL_OR_CMD] &&
        event.shiftKey &&
        event.code === CODES.BRACKET_RIGHT,
  PanelComponent: ({ updateData, appState: _appState }) => (
    <button
      type="button"
      className="zIndexButton"
      onClick={(_event) => updateData(null)}
      title={`${t("labels.bringToFront")} — ${
        isDarwin
          ? getShortcutKey("CtrlOrCmd+Alt+]")
          : getShortcutKey("CtrlOrCmd+Shift+]")
      }`}
    >
      {BringToFrontIcon}
    </button>
  ),
});

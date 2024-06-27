import { CODES, KEYS } from "../keys";

import { StoreAction } from "../store";
import { magnetIcon } from "../components/icons";
import { register } from "./register";

export const actionToggleObjectsSnapMode = register({
  name: "objectsSnapMode",
  label: "buttons.objectsSnapMode",
  icon: magnetIcon,
  viewMode: false,
  trackEvent: {
    category: "canvas",
    predicate: (appState) => !appState.objectsSnapModeEnabled,
  },
  perform(_elements, appState) {
    return {
      appState: {
        ...appState,
        objectsSnapModeEnabled: !this.checked!(appState),
        gridSize: null,
      },
      storeAction: StoreAction.NONE,
    };
  },
  checked: (appState) => appState.objectsSnapModeEnabled,
  predicate: (_elements, _appState, appProps) => {
    return typeof appProps.objectsSnapModeEnabled === "undefined";
  },
  keyTest: (event) =>
    !event[KEYS.CTRL_OR_CMD] && event.altKey && event.code === CODES.S,
});

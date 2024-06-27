import { CODES, KEYS } from "../keys";

import type { AppState } from "../types";
import { GRID_SIZE } from "../constants";
import { StoreAction } from "../store";
import { gridIcon } from "../components/icons";
import { register } from "./register";

export const actionToggleGridMode = register({
  name: "gridMode",
  icon: gridIcon,
  keywords: ["snap"],
  label: "labels.toggleGrid",
  viewMode: true,
  trackEvent: {
    category: "canvas",
    predicate: (appState) => !appState.gridSize,
  },
  perform(_elements, appState) {
    return {
      appState: {
        ...appState,
        gridSize: this.checked!(appState) ? null : GRID_SIZE,
        objectsSnapModeEnabled: false,
      },
      storeAction: StoreAction.NONE,
    };
  },
  checked: (appState: AppState) => appState.gridSize !== null,
  predicate: (_element, _appState, props) => {
    return typeof props.gridModeEnabled === "undefined";
  },
  keyTest: (event) => event[KEYS.CTRL_OR_CMD] && event.code === CODES.QUOTE,
});

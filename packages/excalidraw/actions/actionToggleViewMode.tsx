import { CODES, KEYS } from "../keys";

import { StoreAction } from "../store";
import { eyeIcon } from "../components/icons";
import { register } from "./register";

export const actionToggleViewMode = register({
  name: "viewMode",
  label: "labels.viewMode",
  paletteName: "Toggle view mode",
  icon: eyeIcon,
  viewMode: true,
  trackEvent: {
    category: "canvas",
    predicate: (appState) => !appState.viewModeEnabled,
  },
  perform(_elements, appState) {
    return {
      appState: {
        ...appState,
        viewModeEnabled: !this.checked!(appState),
      },
      storeAction: StoreAction.NONE,
    };
  },
  checked: (appState) => appState.viewModeEnabled,
  predicate: (_elements, _appState, appProps) => {
    return typeof appProps.viewModeEnabled === "undefined";
  },
  keyTest: (event) =>
    !event[KEYS.CTRL_OR_CMD] && event.altKey && event.code === CODES.R,
});

import { CODES, KEYS } from "../keys";

import { StoreAction } from "../store";
import { abacusIcon } from "../components/icons";
import { register } from "./register";

export const actionToggleStats = register({
  name: "stats",
  label: "stats.fullTitle",
  icon: abacusIcon,
  paletteName: "Toggle stats",
  viewMode: true,
  trackEvent: { category: "menu" },
  keywords: ["edit", "attributes", "customize"],
  perform(_elements, appState) {
    return {
      appState: {
        ...appState,
        stats: { ...appState.stats, open: !this.checked!(appState) },
      },
      storeAction: StoreAction.NONE,
    };
  },
  checked: (appState) => appState.stats.open,
  keyTest: (event) =>
    !event[KEYS.CTRL_OR_CMD] && event.altKey && event.code === CODES.SLASH,
});

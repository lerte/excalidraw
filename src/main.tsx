import "./global.scss";

import App from "./App";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

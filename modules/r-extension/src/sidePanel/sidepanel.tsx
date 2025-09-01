import { createRoot } from "react-dom/client";
import "../globals.css";
import App from "./App";

const container = document.getElementById("side-panel-root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("Could not find side-panel-root element");
}

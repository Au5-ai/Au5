import React from "react";
import { createRoot } from "react-dom/client";
import PopupApp from "./PopupApp";
import "../globals.css";

const container = document.getElementById("popup-root");
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
} else {
  console.error("Could not find popup-root element");
}

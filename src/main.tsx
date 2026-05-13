import React from "react";
import { createRoot } from "react-dom/client";
import { WebsitePrinterPage } from "./modules/website-printer";
import "./app/module-preview.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WebsitePrinterPage />
  </React.StrictMode>,
);

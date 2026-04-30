import ExplorerProvider from "@providers/explorer.provider";
import HistoryProvider from "@providers/history.provider";
import PreferenceProvider from "@providers/preference.provider";
import { TooltipProvider } from "@view/ui/tooltip";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <TooltipProvider>
      <PreferenceProvider>
        <HistoryProvider>
          <ExplorerProvider>
            <App />
          </ExplorerProvider>
        </HistoryProvider>
      </PreferenceProvider>
    </TooltipProvider>
  </React.StrictMode>,
);

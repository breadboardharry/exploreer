import ExplorerProvider from "@providers/explorer.provider";
import HistoryProvider from "@providers/history.provider";
import PreferenceProvider from "@providers/preference.provider";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PreferenceProvider>
      <HistoryProvider>
        <ExplorerProvider>
          <App />
        </ExplorerProvider>
      </HistoryProvider>
    </PreferenceProvider>
  </React.StrictMode>,
);

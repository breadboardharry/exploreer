import ExplorerProvider from "@providers/explorer.provider";
import HistoryProvider from "@providers/history.provider";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HistoryProvider>
      <ExplorerProvider>
        <App />
      </ExplorerProvider>
    </HistoryProvider>
  </React.StrictMode>,
);

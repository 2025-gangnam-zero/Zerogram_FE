import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SocketProvider } from "./providers";

const loadSessionId = () => localStorage.getItem("sessionId");

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <SocketProvider sessionId={loadSessionId()}>
      <App />
    </SocketProvider>
  </React.StrictMode>
);

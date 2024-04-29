import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { GameProvider } from "./Context";
import { AchievementsProvider } from "./AchievementContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AchievementsProvider>
      <GameProvider>
        <RouterProvider router={router}></RouterProvider>
      </GameProvider>
    </AchievementsProvider>
  </React.StrictMode>,
);

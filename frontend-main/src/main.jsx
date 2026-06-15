import React from "react";
import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import {
  ToastContainer
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";``

import "./index.css";

import Auth from "./Auth";
import Dashboard from "./Dashboard";
import Lobby from "./Lobby";
import MeetingRoom from "./MeetingRoom";
import ProjectBoard from "./ProjectBoard";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Auth />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/lobby"
          element={<Lobby />}
        />

        <Route
          path="/meeting/:id"
          element={<MeetingRoom />}
        />

        <Route
          path="/project"
          element={<ProjectBoard />}
        />

      </Routes>
      <ToastContainer />
    </BrowserRouter>
  </React.StrictMode>
);
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import LearningPage from "./pages/LearningPage/LearningPage.jsx";

const router = createBrowserRouter([
  // 🔹 Rota isolada do Login (sem Header nem Sidebar)
  {
    path: "/login",
    element: <Home />,
  },

  // 🔹 Layout principal (com Header e Sidebar)
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true, // rota padrão ("/")
        element: <Home />,
      },
      {
        path: "home",
        element: <Home />,
      },
      {
        path: "aprendizado",
        element: <LearningPage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

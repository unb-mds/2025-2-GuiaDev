import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import LearningPage from "./pages/LearningPage/LearningPage.jsx";


import AnalysisPage from "./pages/Analysis/Analysis.jsx";
import { ConfigModalProvider } from "./contexts/ConfigModalContext";

const router = createBrowserRouter([
  
  {
    path: "/login",
    element: <Login />,
  },


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
      {
        path: "analysis/:owner/:repo",
        element: <AnalysisPage/>,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigModalProvider>
      <RouterProvider router={router} />
    </ConfigModalProvider>
  </StrictMode>
);

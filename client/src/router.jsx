import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./components/HomePage";
import CodeEditor from "./components/CodeEditor";
import CodeManagerPage from "./components/CodeManagerPage";
import CodeTreasure from "./components/CodeTreasure";
import SettingsPage from "./components/layout/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "editor",
        element: <CodeEditor />,
      },
      {
        path: "code-manager",
        element: <CodeManagerPage />,
      },
      {
        path: "code-treasure",
        element: <CodeTreasure />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);

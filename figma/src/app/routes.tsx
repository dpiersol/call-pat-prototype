import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import SubmitIssue from "./pages/SubmitIssue";
import Admin from "./pages/Admin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/submit",
    Component: SubmitIssue,
  },
  {
    path: "/admin",
    Component: Admin,
  },
]);

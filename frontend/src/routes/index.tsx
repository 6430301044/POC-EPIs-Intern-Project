import { createBrowserRouter, RouterProvider } from "react-router";
import MainLayout from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import Terms from "@/pages/Terms";
import Policy from "@/pages/Policy";
import Legal from "@/pages/Legal";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Forgotpassword from "@/pages/Forgotpassword";
import AdminLayout from "@/layouts/AdminLayout";
import Admin from "@/pages/admin/Admin";
import Team from "@/pages/admin/Team";
import Projects from "@/pages/admin/Projects";
import Calendar from "@/pages/admin/Calendar";
import Documents from "@/pages/admin/Documents";
import Reports from "@/pages/admin/Reports";
import Settings from "@/pages/admin/Settings";
import Profile from "@/pages/admin/Profile";
import Upload from "@/pages/admin/Upload";
import Approval from "@/pages/admin/Approval";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import TestAPICall from "@/components/TestAPICall";


const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/terms",
        element: <Terms />,
      },
      {
        path: "/privacy",
        element: <Policy />,
      },
      {
        path: "/legal",
        element: <Legal />,
      },
      {
        path: "/about",
        element: <TestAPICall />
      }
    ],
  },
  {
    // Without Layout
    path: "/login",
    element: <Login />,
  },
  {
    // Without Layout
    path: "/register",
    element: <Register />,
  },
  {
    // Without Layout
    path: "/forgotpassword",
    element: <Forgotpassword />,
  },
  {
    // Admin Layout
    path: "/admin",
    // Main Layout
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Admin />,
      },
      {
        path: "/admin/team",
        element: <Team />,
      },
      {
        path: "/admin/projects",
        element: <Projects />,
      },
      {
        path: "/admin/calendar",
        element: <Calendar />,
      },
      {
        path: "/admin/documents",
        element: <Documents />,
      },
      {
        path: "/admin/reports",
        element: <Reports />,
      },
      {
        path: "/admin/settings",
        element: <Settings />,
      },
      {
        path: "/admin/profile",
        element: <Profile />,
      },
      {
        path: "/admin/upload",
        element: <Upload />,
      },
      {
        path: "/admin/approval",
        element: <Approval />,
      },
    ],
  },
]);

export function AppRouter() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
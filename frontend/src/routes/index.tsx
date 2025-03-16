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
import News from "@/pages/admin/News";
import Audiolog from "@/pages/admin/Audiolog";
import Reports from "@/pages/admin/Reports";
import Settings from "@/pages/admin/Settings";
import Profile from "@/pages/admin/Profile";
import Upload from "@/pages/admin/Upload";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import TestAPICall from "@/components/TestAPICall";
import Contact from "@/components/main/Contact";
import Visualization from "@/components/main/Visualization";
// import ApproveUsere from "@/pages/admin/ApproveUser";
// import Approval from "@/pages/admin/Approval";
import ApproveMain from "@/pages/admin/ApproveMain";


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
        element: <TestAPICall />,
      },
      {
        path: "/contact",
        element: <Contact />
      },
      {
        path: "/environment",
        element: <Visualization />,
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
        path: "/admin/news",
        element: <News />,
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
        path: "/admin/approve",
        element: <ApproveMain />,
      },
      {
        path: "/admin/audiolog",
        element: <Audiolog/>,
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
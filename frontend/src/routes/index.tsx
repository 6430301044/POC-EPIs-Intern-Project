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
import AdminHome from "@/pages/admin/AdminHome";
import Team from "@/pages/admin/Team";
import Projects from "@/pages/admin/Projects";
import Calendar from "@/pages/admin/Calendar";
import Documents from "@/pages/admin/Documents";
import Reports from "@/pages/admin/Reports";
import Settings from "@/pages/admin/Settings";
import Profile from "@/pages/admin/Profile";
import Upload from "@/pages/admin/Upload";
import EnhanceTableUpload from "@/pages/admin/EnhanceTableUpload";
import Approval from "@/pages/admin/Approval";
import DataManagement from "@/pages/admin/DataManagement";
import ReferenceDataManagement from "@/pages/admin/ReferenceDataManagement";
import News from "@/pages/admin/News";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import TestAPICall from "@/components/TestAPICall";
import ApproveUser from "@/pages/admin/ApproveUser";
import ApprovalCenter from "@/pages/admin/ApprovalCenter";
import NewsDetail from "@/pages/NewsDetail";
import Data from "@/pages/Data";
import Contact from "@/pages/ContactUs";
import ReferenceDataUpload from "@/pages/admin/ReferenceDataUpload";
import UploadCenter from "@/pages/admin/UploadCenter";
import BulkDataDeletion from "@/pages/admin/BulkDataDeletion";
import NewsPage from "@/pages/NewsPage";
import About from "@/pages/About";


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
        path: "/news",
        element: <NewsPage />, 
      },
      {
        path: "/news/:id",
        element: <NewsDetail />,
      },
      {
        path: "/about",
        element: <About />
      },
      {
        path: "/environment-data",
        element: <Data />,
      },
      {
        path: "/contact",
        element: <Contact />,
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
        element: <AdminHome />,
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
        path: "/admin/enhance-table-upload",
        element: <EnhanceTableUpload />,
      },
      {
        path: "/admin/approval",
        element: <Approval />,
      },
      {
        path: "/admin/data-management",
        element: <DataManagement />,
      },
      {
        path: "/admin/reference-data",
        element: <ReferenceDataManagement />,
      },
      {
        path: "/admin/approve-user",
        element: <ApproveUser />,
      },
      {
        path: "/admin/approval-center",
        element: <ApprovalCenter />,
      },
      {
        path: "/admin/news",
        element: <News />,
      },
      {
        path: "/admin/reference-data-upload",
        element: <ReferenceDataUpload />, 
      },
      {
        path: "/admin/upload-center",
        element: <UploadCenter />,
      },
      {
        path: "/admin/bulk-data-deletion",
        element: <BulkDataDeletion />,
      }
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
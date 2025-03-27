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
import Profile from "@/pages/admin/Profile";
import { ThemeProvider } from "@/contexts/ThemeProvider";
<<<<<<< Updated upstream
import TestAPICall from "@/components/TestAPICall";
import Contact from "@/components/main/Contact";
import Visualization from "@/components/main/Visualization";
=======
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
import Results from "@/pages/Results";
import DataManagementCenter from "@/pages/admin/DataManagementCenter";
import SrirachaOil from "@/pages/SrirachaOil";
import KhaoBoYa from "@/pages/KhaoBoYa";
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
        path: "/environment",
        element: <Visualization />,
=======
        path: "/sriracha-oil",
        element: <SrirachaOil />,
      },
      {
        path: "/khaoboya-terminal",
        element: <KhaoBoYa />,
>>>>>>> Stashed changes
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
        path: "/admin/profile",
        element: <Profile />,
      },
<<<<<<< Updated upstream
=======
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
      },
      {
        path: "/admin/data-management-center",
        element: <DataManagementCenter />,
      }
>>>>>>> Stashed changes
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
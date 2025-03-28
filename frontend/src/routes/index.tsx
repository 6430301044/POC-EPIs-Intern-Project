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
import Profile from "@/pages/admin/Profile";
import Upload from "@/pages/admin/Upload";
import EnhanceTableUpload from "@/pages/admin/EnhanceTableUpload";
import Approval from "@/pages/admin/Approval";
import DataManagement from "@/pages/admin/DataManagement";
import ReferenceDataManagement from "@/pages/admin/ReferenceDataManagement";
import News from "@/pages/admin/News";
import { ThemeProvider } from "@/contexts/ThemeProvider";
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
import BulkDataDeletion2 from "@/pages/admin/BulkDataDeletion2";

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
        path: "/environment-measurement",
        element: <Results />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/sriracha-oil",
        element: <SrirachaOil />,
      },
      {
        path: "/khaoboya-terminal",
        element: <KhaoBoYa />,
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
      },
      {
        path: "/admin/data-management-center",
        element: <DataManagementCenter />,
      },
      {
        path: "/admin/bulk-data-deletion-2",
        element: <BulkDataDeletion2 />,
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
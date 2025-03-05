import Sidebar from "@/components/template/admin/Sidebar";
import TopBar from "@/components/template/admin/TopBar";
import { Outlet } from "react-router";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

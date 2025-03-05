import Navbar from "@/components/template/Navbar";
import Footer from "@/components/template/Footer";
import { Outlet } from "react-router";

export default function MainLayout() {
  return (
    <>
        <Navbar />
            <div>
                <Outlet />
            </div>
        <Footer />
    </>
  )
}

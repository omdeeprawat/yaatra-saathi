import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/navbar/Navbar";

export default function Layout() {
  const { pathname } = useLocation();
  const hideNavbar =
    pathname === "/dashboard" ||
    pathname === "/chat" ||
    pathname === "/feed" ||
    pathname === "/stories" ||
    pathname === "/profile" ||
    pathname === "/route-map" || 
    pathname === "/map" ||
    pathname ===  "/admin" ||
    pathname.startsWith("/stories/");

  return (
    <div className="relative min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
    </div>
  );
}

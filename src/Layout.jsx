import { Outlet } from "react-router";
import { Navigation } from "./components/Navigation.jsx";
import { Footer } from "./components/Footer.jsx";
import { UserSidebar } from "./components/UserSidebar.jsx";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="flex flex-1">
        <UserSidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

import Layout from "./Layout.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Appointment from "./pages/Appointment.jsx";
import Dentures from "./pages/Dentures.jsx";
import FinishedProducts from "./pages/FinishedProducts.jsx";
import Admin from "./pages/Admin.jsx";

function PagePlaceholder({ title }) {
  return (
    <div className="bg-[#f5e6e6] flex flex-col items-center justify-center py-20 w-full min-h-[60vh] font-['Space_Grotesk',sans-serif] page-enter">
      <p className="text-[64px] mb-4">🔍</p>
      <h1 className="text-[36px] font-medium text-[#191a23] mb-3">{title}</h1>
      <p className="text-[18px] text-black/50">The page you're looking for doesn't exist.</p>
    </div>
  );
}

/**
 * Main app shell — checks auth and routes accordingly.
 */
function AppShell() {
  const { user, isLoggedIn } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    function handleNav() {
      setCurrentPath(window.location.pathname);
    }
    window.addEventListener("popstate", handleNav);
    return () => window.removeEventListener("popstate", handleNav);
  }, []);

  if (!isLoggedIn) {
    return <Login />;
  }

  if (user.role === "admin") {
    return <Admin />;
  }

  return <RouterProvider router={userRouter} />;
}

// User routes — removed /track and /message
const userRouter = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "socials", Component: Contact },
      { path: "appointment", Component: Appointment },
      { path: "dentures", Component: Dentures },
      { path: "products", Component: FinishedProducts },
      { path: "*", element: <PagePlaceholder title="Page Not Found" /> },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
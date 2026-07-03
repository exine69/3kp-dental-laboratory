import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About us" },
    { to: "/socials", label: "Contact" },
  ];

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        scrolled
          ? "bg-[#f9abab]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.08)]"
          : "bg-[#f9abab]"
      }`}
      style={{ borderBottom: scrolled ? "1px solid rgba(255,255,255,0.2)" : "none" }}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 md:px-12 lg:px-[100px] h-[72px]">
        {/* Logo */}
        <Link
          to="/"
          className="no-underline flex items-center gap-2 group"
        >
          <span className="font-['Spicy_Rice',sans-serif] text-[#e61717] text-[32px] md:text-[36px] whitespace-nowrap transition-transform duration-300 group-hover:scale-105">
            🦷3KP DENTAL🦷
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-3">
          <div className="bg-[#f36767] flex items-center gap-1 rounded-2xl px-2 py-1.5 shadow-[0_4px_20px_rgba(243,103,103,0.25)]">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-['Space_Grotesk',sans-serif] font-medium text-[15px] no-underline px-5 py-2 rounded-xl transition-all duration-300 ${
                  location.pathname === link.to
                    ? "bg-white/25 text-black shadow-sm"
                    : "text-black/80 hover:text-black hover:bg-white/15"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/appointment"
              className="ml-2 font-['Space_Grotesk',sans-serif] font-medium text-[15px] no-underline px-5 py-2.5 rounded-xl bg-[#191a23] text-white transition-all duration-300 hover:bg-[#2a2b36] hover:shadow-lg hover:-translate-y-0.5 btn-animate"
            >
              Book Appointment
            </Link>
          </div>

          {/* User info + logout */}
          {user && (
            <div className="flex items-center gap-2 ml-1">
              <div className="w-8 h-8 rounded-full bg-[#191a23] text-white flex items-center justify-center text-[13px] font-semibold shadow-sm">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <button
                onClick={logout}
                className="font-['Space_Grotesk',sans-serif] text-[13px] text-black/40 hover:text-[#e05555] bg-transparent border-none cursor-pointer transition-colors duration-300"
                title={`Signed in as ${user.name}`}
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 bg-transparent border-none cursor-pointer"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-[#191a23] transition-all duration-300 ${
              mobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[#191a23] transition-all duration-300 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[#191a23] transition-all duration-300 ${
              mobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-['Space_Grotesk',sans-serif] font-medium text-[16px] no-underline px-4 py-3 rounded-xl transition-all duration-300 ${
                location.pathname === link.to
                  ? "bg-[#f36767] text-black"
                  : "text-black/70 hover:bg-[#f36767]/30 hover:text-black"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/appointment"
            className="font-['Space_Grotesk',sans-serif] font-medium text-[16px] no-underline px-4 py-3 rounded-xl bg-[#191a23] text-white text-center transition-all duration-300 hover:bg-[#2a2b36] mt-1"
          >
            Book Appointment
          </Link>

          {/* Mobile user info + logout */}
          {user && (
            <div className="flex items-center justify-between px-4 py-3 mt-2 border-t border-black/10">
              <span className="font-['Space_Grotesk',sans-serif] text-[14px] text-black/50">
                👋 {user.name}
              </span>
              <button
                onClick={logout}
                className="font-['Space_Grotesk',sans-serif] text-[14px] text-[#e05555] bg-transparent border-none cursor-pointer hover:underline"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Keep the old exports for backward compatibility
export function Logo() {
  return null;
}
export function ContactUs() {
  return null;
}
export function Menu() {
  return null;
}
export function MenuAndContact() {
  return null;
}
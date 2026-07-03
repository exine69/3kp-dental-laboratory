import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-[#191a23] text-white/80 mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[100px] py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <p className="font-['Spicy_Rice',sans-serif] text-[#f36767] text-[28px] mb-3">
              🦷3KP DENTAL🦷
            </p>
            <p className="text-[15px] leading-7 text-white/60 max-w-[300px]">
              Trusted dental laboratory delivering precision-crafted dentures
              and prosthetics for over 40 years.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-[16px] mb-4">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About Us" },
                { to: "/dentures", label: "Dentures" },
                { to: "/products", label: "Our Products" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-white/50 hover:text-[#f36767] no-underline text-[14px] transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-[16px] mb-4">
              Get in Touch
            </h4>
            <div className="flex flex-col gap-2.5 text-[14px]">
              <a
                href="tel:09959271047"
                className="text-white/50 hover:text-[#f36767] no-underline transition-colors duration-300"
              >
                📞 09959271047
              </a>
              <a
                href="mailto:keffgerard@gmail.com"
                className="text-white/50 hover:text-[#f36767] no-underline transition-colors duration-300"
              >
                ✉️ keffgerard@gmail.com
              </a>
              <a
                href="https://www.facebook.com/keff.pabunan.2025"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-[#f36767] no-underline transition-colors duration-300"
              >
                📘 Facebook Page
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-[13px]">
            © {new Date().getFullYear()} 3KP Dental Laboratory. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            <Link
              to="/appointment"
              className="text-[#f36767] hover:text-[#ff8f8f] no-underline text-[13px] font-medium transition-colors duration-300"
            >
              Book Appointment
            </Link>
            <Link
              to="/socials"
              className="text-white/40 hover:text-white/70 no-underline text-[13px] transition-colors duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

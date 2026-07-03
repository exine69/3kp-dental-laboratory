import { Link } from "react-router";
import { useScrollReveal, useStaggerReveal } from "../hooks/useScrollReveal.js";

import completeDenture from "../assets/products/complete-denture.jpg";
import partialDenture from "../assets/products/partial-denture.jpg";
import flexiblePartial from "../assets/products/flexible-partial.jpg";
import immediateDenture from "../assets/products/immediatedenture.jpg";
import overdenture from "../assets/products/Overdenture.jpg";
import premiumDenture from "../assets/products/premiumdenture.png";

const products = [
  {
    title: "Complete Denture",
    image: completeDenture,
    bg: "#f9abab",
    desc: "Full upper and lower denture set featuring natural-looking teeth with a precision-crafted acrylic base. Custom-fitted for maximum comfort and optimal aesthetics.",
  },
  {
    title: "Partial Denture",
    image: partialDenture,
    bg: "#f3f3f3",
    desc: "Removable partial denture with metal framework and precision clasps. Designed to replace multiple missing teeth while preserving natural dentition.",
  },
  {
    title: "Flexible Partial Denture",
    image: flexiblePartial,
    bg: "#f36767",
    desc: "Modern flexible partial denture made from thermoplastic material. Lightweight and comfortable with aesthetic pink clasps that blend naturally with gum tissue.",
  },
  {
    title: "Immediate Denture",
    image: immediateDenture,
    bg: "#f3f3f3",
    desc: "Temporary denture fitted immediately after tooth extraction to maintain appearance and chewing function during the healing process.",
  },
  {
    title: "Overdenture",
    image: overdenture,
    bg: "#f9abab",
    desc: "Implant-assisted overdenture designed for improved retention, stronger bite support, and enhanced comfort compared to traditional dentures.",
  },
  {
    title: "Premium Precision Denture",
    image: premiumDenture,
    bg: "#f36767",
    desc: "High-end custom denture crafted with premium materials for exceptional aesthetics, precise fit, and long-term durability.",
  },
];

function ProductCard({ product, index }) {
  const ref = useScrollReveal({ animation: "scale-in" });

  return (
    <div
      ref={ref}
      style={{ backgroundColor: product.bg }}
      className="border border-[#191a23] rounded-[30px] md:rounded-[35px] shadow-[0px_5px_0px_0px_#191a23] p-6 md:p-[30px] card-hover group"
    >
      <div className="overflow-hidden rounded-[18px] md:rounded-[20px] border border-black/10">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-[200px] md:h-[250px] object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      <h2 className="text-[22px] md:text-[28px] font-medium mt-5 md:mt-6 mb-3 md:mb-4 text-black">
        {product.title}
      </h2>

      <p className="text-[14px] md:text-[16px] leading-7 text-black/70">
        {product.desc}
      </p>
    </div>
  );
}

export default function FinishedProducts() {
  const headerRef = useScrollReveal({ animation: "fade-in-up" });
  const ctaRef = useScrollReveal({ animation: "fade-in-up" });

  return (
    <div className="bg-[#f5e6e6] min-h-screen font-['Space_Grotesk',sans-serif] page-enter">
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[100px] py-12 md:py-[60px]">
        <section ref={headerRef} className="text-center">
          <h1 className="inline-block bg-[#f36767] px-5 py-2.5 rounded-2xl text-[32px] md:text-[44px] font-medium text-black shadow-[0px_4px_20px_rgba(243,103,103,0.3)]">
            Our Finished Products
          </h1>

          <p className="mt-6 text-[16px] md:text-[18px] max-w-[900px] mx-auto text-black/70 leading-8">
            Browse our gallery of expertly crafted dental prosthetics. Each
            piece represents our commitment to precision, quality, and natural
            aesthetics.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-6 text-black/60 hover:text-black no-underline transition-colors duration-300 text-[16px]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12l-4-4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Home
          </Link>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-[40px] mt-12 md:mt-[60px]">
          {products.map((product, i) => (
            <ProductCard key={product.title} product={product} index={i} />
          ))}
        </section>

        <section ref={ctaRef} className="text-center mt-16 md:mt-[80px]">
          <h2 className="inline-block bg-[#f9abab] px-5 py-2.5 rounded-2xl text-[28px] md:text-[36px] font-medium text-black shadow-[0px_4px_20px_rgba(249,171,171,0.3)]">
            Crafted with Precision
          </h2>

          <p className="mt-6 max-w-[900px] mx-auto text-[16px] md:text-[18px] leading-8 text-black/70">
            At 3KP Dental Laboratory, every denture and prosthetic is created
            using a combination of advanced technology and traditional
            craftsmanship. We work closely with dental professionals to ensure
            each piece meets exact specifications and delivers exceptional
            results for patients.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-5 mt-8">
            <Link
              to="/dentures"
              className="bg-white text-black border border-[#191a23] rounded-2xl px-8 py-4 text-[18px] font-medium no-underline btn-animate transition-all duration-300 hover:bg-[#f3f3f3] text-center"
            >
              View All Denture Types
            </Link>

            <Link
              to="/appointment"
              className="bg-[#191a23] text-white border-none rounded-2xl px-8 py-4 text-[18px] font-medium no-underline btn-animate shimmer transition-all duration-300 hover:bg-[#2a2b36] text-center"
            >
              Book Appointment →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
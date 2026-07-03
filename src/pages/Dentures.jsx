import { Link } from "react-router";
import { useScrollReveal, useStaggerReveal } from "../hooks/useScrollReveal.js";

const dentures = [
  {
    title: "Complete Dentures",
    desc: "Full upper or lower replacement dentures designed for patients who need a complete set of teeth restored.",
    features: [
      "Full arch restoration",
      "Natural appearance",
      "Comfortable fit",
      "Restores chewing support",
    ],
    bg: "#f3f3f3",
    text: "black",
    icon: "🦷",
  },
  {
    title: "Partial Dentures",
    desc: "Removable dentures made to replace several missing teeth while preserving the remaining natural teeth.",
    features: [
      "Replaces missing teeth",
      "Supports chewing",
      "Custom-fit design",
      "Preserves remaining teeth",
    ],
    bg: "#f36767",
    text: "black",
    icon: "🔧",
  },
  {
    title: "Temporary / Immediate Dentures",
    desc: "Dentures prepared before extraction so patients can receive teeth immediately after removal while healing.",
    features: [
      "Immediate replacement",
      "Maintains appearance",
      "Supports healing",
      "Short-term functional use",
    ],
    bg: "#f9abab",
    text: "black",
    icon: "⏱️",
  },
  {
    title: "Flexible Partial Dentures",
    desc: "Lightweight partial dentures made with flexible material for comfort and a natural-looking fit.",
    features: [
      "Flexible material",
      "Comfortable feel",
      "Natural gum appearance",
      "No visible metal clasps",
    ],
    bg: "#191a23",
    text: "white",
    icon: "✨",
  },
  {
    title: "Implant-Supported Dentures",
    desc: "Stable dentures supported by dental implants for improved retention, comfort, and stronger bite support.",
    features: [
      "Stronger hold",
      "Better stability",
      "Improved comfort",
      "Supports natural chewing",
    ],
    bg: "#f36767",
    text: "black",
    icon: "🔩",
  },
  {
    title: "Snap-On Dentures",
    desc: "Removable implant-supported dentures that snap securely onto dental implants for better stability.",
    features: [
      "Secure implant support",
      "Easy to remove and clean",
      "Reduced slipping",
      "Comfortable daily use",
    ],
    bg: "#f3f3f3",
    text: "black",
    icon: "🔗",
  },
  {
    title: "Fixed Bridge Dentures",
    desc: "A fixed restoration used to replace missing teeth by attaching artificial teeth to nearby supporting teeth.",
    features: [
      "Non-removable option",
      "Stable fit",
      "Natural appearance",
      "Strong chewing support",
    ],
    bg: "#191a23",
    text: "white",
    icon: "🌉",
  },
  {
    title: "Overdentures",
    desc: "Dentures designed to fit over remaining teeth or implants for added support and better retention.",
    features: [
      "Extra support",
      "Improved fit",
      "Better retention",
      "More stable than traditional dentures",
    ],
    bg: "#f9abab",
    text: "black",
    icon: "🛡️",
  },
  {
    title: "Premium Precision Dentures",
    desc: "High-quality dentures crafted with extra detail for superior fit, appearance, and durability.",
    features: [
      "Premium finish",
      "Precise fit",
      "High durability",
      "Enhanced aesthetics",
    ],
    bg: "#f36767",
    text: "black",
    icon: "💎",
  },
];

function DentureCard({ item, index }) {
  const ref = useScrollReveal({
    animation: index % 2 === 0 ? "fade-in-left" : "fade-in-right",
  });

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: item.bg,
        color: item.text,
      }}
      className={`border border-[#191a23] rounded-[30px] md:rounded-[35px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[40px] card-hover ${
        index === dentures.length - 1
          ? "col-span-1 md:col-span-2 max-w-[600px] mx-auto w-full"
          : ""
      }`}
    >
      <div className="text-[36px] mb-3">{item.icon}</div>
      <h2 className="text-[24px] md:text-[30px] font-medium mb-4">{item.title}</h2>

      <p className="text-[15px] md:text-[17px] leading-7 mb-5 opacity-80">{item.desc}</p>

      <h3 className="text-[16px] md:text-[18px] font-medium mb-3 opacity-90">Key Features:</h3>

      <ul className="list-none pl-0 text-[14px] md:text-[16px] leading-7 space-y-1.5">
        {item.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="text-[14px] mt-1 shrink-0">✓</span>
            <span className="opacity-80">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Dentures() {
  const headerRef = useScrollReveal({ animation: "fade-in-up" });
  const ctaRef = useScrollReveal({ animation: "scale-in" });

  return (
    <div className="bg-[#f5e6e6] min-h-screen font-['Space_Grotesk',sans-serif] page-enter">
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[100px] py-12 md:py-[60px]">
        <section ref={headerRef} className="text-center">
          <h1 className="inline-block bg-[#f36767] px-5 py-2.5 rounded-2xl text-[32px] md:text-[44px] font-medium text-black shadow-[0px_4px_20px_rgba(243,103,103,0.3)]">
            Complete Dentures Catalog
          </h1>

          <p className="mt-6 text-[16px] md:text-[18px] leading-8 max-w-[900px] mx-auto text-black/70">
            Explore our expanded range of denture options and prosthetic
            solutions. Each product is crafted with precision, comfort, and
            long-term usability in mind.
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

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-[40px] mt-12 md:mt-[60px]">
          {dentures.map((item, index) => (
            <DentureCard key={item.title} item={item} index={index} />
          ))}
        </section>

        <section ref={ctaRef} className="text-center mt-16 md:mt-[80px]">
          <h2 className="inline-block bg-[#f9abab] px-5 py-2.5 rounded-2xl text-[28px] md:text-[36px] font-medium text-black shadow-[0px_4px_20px_rgba(249,171,171,0.3)]">
            Need a Custom Solution?
          </h2>

          <p className="mt-6 max-w-[900px] mx-auto text-[16px] md:text-[18px] leading-8 text-black/70">
            Every patient is unique. Contact us to discuss custom denture
            solutions tailored to your specific requirements and patient needs.
          </p>

          <div className="flex justify-center mt-8">
            <Link
              to="/appointment"
              className="bg-[#191a23] text-white border-none rounded-2xl px-8 py-4 text-[18px] font-medium no-underline btn-animate shimmer transition-all duration-300 hover:bg-[#2a2b36]"
            >
              Book Appointment →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
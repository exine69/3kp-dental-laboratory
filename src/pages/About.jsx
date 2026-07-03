import { useScrollReveal } from "../hooks/useScrollReveal.js";

export default function About() {
  const headerRef = useScrollReveal({ animation: "fade-in-up" });
  const missionRef = useScrollReveal({ animation: "fade-in-left" });
  const promiseRef = useScrollReveal({ animation: "fade-in-right" });
  const trustRef = useScrollReveal({ animation: "scale-in" });

  return (
    <div className="bg-[#f5e6e6] min-h-screen font-['Space_Grotesk',sans-serif] page-enter">
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[100px] py-12 md:py-[60px]">
        <section
          ref={headerRef}
          className="bg-[#f9abab] border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[50px] text-center"
        >
          <h1 className="text-[32px] md:text-[44px] font-medium text-black mb-6">
            About <span className="gradient-text">3KP Dental Laboratory</span>
          </h1>

          <p className="text-[16px] md:text-[18px] leading-8 text-black/80 max-w-[1000px] mx-auto">
            3KP Dental Laboratory has been providing dependable dental laboratory
            services for over 40 years. We specialize in high-quality dentures and
            prosthetics crafted with precision, speed, and care.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-[40px] mt-10 md:mt-[50px]">
          <div
            ref={missionRef}
            className="bg-[#f3f3f3] border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[40px] card-hover"
          >
            <div className="text-[40px] mb-4">🎯</div>
            <h2 className="text-[28px] md:text-[32px] font-medium mb-4">Our Mission</h2>
            <p className="text-[16px] md:text-[17px] leading-7 text-black/70">
              To support dentists and clinics by delivering accurate, reliable,
              and patient-ready dental products that reduce unnecessary revisions
              and improve treatment outcomes.
            </p>
          </div>

          <div
            ref={promiseRef}
            className="bg-[#f36767] border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[40px] card-hover"
          >
            <div className="text-[40px] mb-4">🤝</div>
            <h2 className="text-[28px] md:text-[32px] font-medium mb-4">Our Promise</h2>
            <p className="text-[16px] md:text-[17px] leading-7 text-black/80">
              We work fast, deliver products carefully, and maintain quality that
              helps our clients feel confident from the first case to the final
              result.
            </p>
          </div>
        </section>

        <section
          ref={trustRef}
          className="bg-[#191a23] text-white border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[50px] mt-10 md:mt-[50px] shimmer"
        >
          <div className="text-[40px] mb-4">⭐</div>
          <h2 className="text-[30px] md:text-[36px] font-medium mb-5">
            Built on 40 Years of Trust
          </h2>

          <p className="text-[16px] md:text-[18px] leading-8 max-w-[1000px] text-white/80">
            Our long experience in the dental laboratory field allows us to
            combine traditional craftsmanship with modern standards. We aim to
            provide results that dentists can trust and patients can depend on.
          </p>
        </section>
      </main>
    </div>
  );
}
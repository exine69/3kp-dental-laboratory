import { useScrollReveal } from "../hooks/useScrollReveal.js";

export default function Message() {
  const headerRef = useScrollReveal({ animation: "fade-in-up" });
  const card1Ref = useScrollReveal({ animation: "fade-in-left" });
  const card2Ref = useScrollReveal({ animation: "fade-in-right" });

  return (
    <div className="bg-[#f5e6e6] min-h-screen font-['Space_Grotesk',sans-serif] page-enter">
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[100px] py-12 md:py-[60px]">
        <section
          ref={headerRef}
          className="bg-[#f9abab] border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[50px] text-center"
        >
          <h1 className="text-[32px] md:text-[44px] font-medium text-black mb-6">
            Error with your <span className="gradient-text">delivery?</span>
          </h1>

          <p className="text-[16px] md:text-[18px] leading-8 max-w-[850px] mx-auto text-black/80">
            Choose how you would like to contact us regarding your delivery concern.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-[40px] mt-10 md:mt-[50px]">
          <a
            ref={card1Ref}
            href="https://www.facebook.com/gerry.pabunan.94"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-[#f36767] text-black no-underline border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-10 md:p-[50px] text-center card-hover block"
          >
            <div className="text-[48px] mb-4 transition-transform duration-500 group-hover:scale-125">
              💬
            </div>
            <h2 className="text-[28px] md:text-[34px] font-medium mb-4">
              Contact Gerry Pabunan
            </h2>
            <p className="text-[16px] md:text-[18px] text-black/60 transition-colors duration-300 group-hover:text-black/80">
              facebook.com/gerry.pabunan.94
            </p>
          </a>

          <a
            ref={card2Ref}
            href="https://www.facebook.com/grace.suplido"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-[#f3f3f3] text-black no-underline border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-10 md:p-[50px] text-center card-hover block"
          >
            <div className="text-[48px] mb-4 transition-transform duration-500 group-hover:scale-125">
              📨
            </div>
            <h2 className="text-[28px] md:text-[34px] font-medium mb-4">
              Message Grace Suplido
            </h2>
            <p className="text-[16px] md:text-[18px] text-black/50 transition-colors duration-300 group-hover:text-black/70">
              facebook.com/grace.suplido
            </p>
          </a>
        </section>
      </main>
    </div>
  );
}
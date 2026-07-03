import { Link } from "react-router";
import { useScrollReveal, useStaggerReveal } from "../../hooks/useScrollReveal.js";
import svgPaths from "./svg-oegn6waaa7";
import imgImagePhotoroom11 from "./31dde44b140087e514568598be875ceeeea9999d.png";
import imgTokyoMagnifierWebSearchWithElements2 from "./b4bdc286e0d6b4ee51263b01f94aaa2c8a60595a.png";
import imgTokyoSelectingAValueInTheBrowserWindow1 from "./22c82b852d4855c2b6ce87155443b1de128cceb7.png";
import imgTokyoBrowserWindowWithEmoticonLikesAndStarsAround2 from "./5fd295748027146127bd9ba05e5d506f6b53072e.png";
import imgTokyoSendingMessagesFromOnePlaceToAnother1 from "./ef60a6e3f845c9afa584dace8c1b2daced94518e.png";
import imgTokyoVolumetricAnalyticsOfDifferentTypesInWebBrowsers2 from "./cb0153129bd2d37e31683484f8df8c866af21435.png";

function ArrowIcon({ fill = "#191A23", stroke = "#B9FF66" }) {
  return (
    <div className="relative shrink-0 size-[41px] transition-transform duration-300 group-hover:translate-x-1">
      <svg className="absolute block inset-0 size-full" fill="none" viewBox="0 0 41 41">
        <circle cx="20.5" cy="20.5" fill={fill} r="20.5" />
        <path d={svgPaths.p298cdb00} fill={stroke} />
      </svg>
    </div>
  );
}

function ServiceCard({ to, title, titleLines, illustration, bgColor, textColor = "black", linkColor = "black", iconFill, iconStroke }) {
  const ref = useScrollReveal({ animation: "scale-in" });

  return (
    <div ref={ref} className={`relative rounded-[35px] shrink-0 w-full md:w-[calc(50%-20px)] card-hover`} style={{ background: bgColor }}>
      <Link to={to} className="group content-stretch flex items-center justify-between overflow-clip p-8 md:p-[50px] relative rounded-[inherit] size-full no-underline">
        <div className="flex flex-col gap-16 items-start">
          <div className="flex flex-col items-start">
            {titleLines.map((line, i) => (
              <div key={i} className={`px-[7px] rounded-[7px] ${
                bgColor === "#191a23" ? "bg-white" : bgColor === "#f3f3f3" ? "bg-[#f9abab]" : "bg-white"
              }`}>
                <p className="font-['Space_Grotesk',sans-serif] font-medium text-[24px] md:text-[30px] text-black whitespace-nowrap leading-[normal]">
                  {line}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-[15px] items-center">
            <ArrowIcon fill={iconFill || "#191A23"} stroke={iconStroke || "#B9FF66"} />
            <p className={`font-['Space_Grotesk',sans-serif] text-[18px] md:text-[20px] transition-all duration-300 group-hover:translate-x-1`} style={{ color: linkColor }}>
              Learn more
            </p>
          </div>
        </div>
        <div className="hidden sm:block relative shrink-0 w-[160px] h-[140px] md:w-[210px] md:h-[170px] float-animation">
          <img alt={title} className="absolute inset-0 w-full h-full object-contain pointer-events-none" src={illustration} />
        </div>
      </Link>
      <div aria-hidden="true" className="absolute border border-[#191a23] inset-0 pointer-events-none rounded-[35px] shadow-[0px_5px_0px_0px_#191a23]" />
    </div>
  );
}

function HeroSection() {
  const heroRef = useScrollReveal({ animation: "fade-in-up" });
  const imgRef = useScrollReveal({ animation: "fade-in-right" });

  return (
    <section className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[100px] py-10 md:py-16">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div ref={heroRef} className="flex-1 max-w-[700px]">
          <h1 className="font-['Space_Grotesk',sans-serif] font-medium text-[32px] md:text-[42px] lg:text-[48px] text-[#191a23] leading-[1.15] mb-6">
            Modern Dental Solutions
            <br />
            <span className="gradient-text">Built with Precision</span>
          </h1>

          <p className="font-['Space_Grotesk',sans-serif] text-[16px] md:text-[17px] text-[#191a23]/70 leading-[1.8] mb-8 max-w-[600px]">
            3KP Dental Laboratory is a full-service dental lab that specializes
            in creating high-quality dentures and dental prosthetics for
            licensed dentists and clinics. We combine traditional craftsmanship
            with modern technology for precise, patient-specific results.
          </p>

          <Link
            to="/appointment"
            className="inline-flex items-center gap-3 bg-[#191a23] text-white font-['Space_Grotesk',sans-serif] font-medium text-[17px] px-8 py-4 rounded-2xl no-underline btn-animate shimmer transition-all duration-300 hover:bg-[#2a2b36]"
          >
            Book an Appointment
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="transition-transform duration-300 group-hover:translate-x-1">
              <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        <div ref={imgRef} className="relative shrink-0 w-[250px] h-[250px] md:w-[340px] md:h-[340px] float-animation">
          <img
            alt="3KP Dental Hero"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none drop-shadow-2xl"
            src={imgImagePhotoroom11}
          />
          {/* Decorative rings */}
          <div className="absolute -inset-4 border-2 border-[#f36767]/20 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute -inset-8 border border-[#f36767]/10 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
        </div>
      </div>
    </section>
  );
}

function ServicesHeading() {
  const ref = useScrollReveal({ animation: "fade-in-up" });

  return (
    <section ref={ref} className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[100px] py-6">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
        <div className="bg-[#f36767] px-3 py-1 rounded-[7px] shrink-0">
          <p className="font-['Space_Grotesk',sans-serif] font-medium text-[32px] md:text-[40px] text-black">
            Services
          </p>
        </div>
        <p className="font-['Space_Grotesk',sans-serif] text-[16px] md:text-[18px] text-[#191a23]/70 leading-[1.7] max-w-[800px]">
          At 3KP Dental Laboratory, we create high-quality custom dentures and
          dental prosthetics for dentists and clinics with precision,
          reliability, and modern technology.
        </p>
      </div>
    </section>
  );
}

function ServicesCards() {
  return (
    <section className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[100px] pb-16">
      <div className="flex flex-col gap-10">
        {/* Row 1 */}
        <div className="flex flex-col md:flex-row gap-10">
          <ServiceCard
            to="/dentures"
            title="Complete list of Dentures"
            titleLines={["Complete list", "of Dentures"]}
            illustration={imgTokyoMagnifierWebSearchWithElements2}
            bgColor="#f3f3f3"
          />
          <ServiceCard
            to="/products"
            title="Check our Finished products"
            titleLines={["Check our", "Finished products"]}
            illustration={imgTokyoSelectingAValueInTheBrowserWindow1}
            bgColor="#f36767"
          />
        </div>

        {/* Row 2 */}
        <div className="flex flex-col md:flex-row gap-10">
          <ServiceCard
            to="/socials"
            title="Contact & Message us"
            titleLines={["Contact &", "Message us"]}
            illustration={imgTokyoBrowserWindowWithEmoticonLikesAndStarsAround2}
            bgColor="#191a23"
            linkColor="white"
            iconFill="white"
            iconStroke="black"
          />
          <ServiceCard
            to="/appointment"
            title="Book or Order Dentures"
            titleLines={["Book or Order", "Dentures"]}
            illustration={imgTokyoSendingMessagesFromOnePlaceToAnother1}
            bgColor="#f3f3f3"
          />
        </div>
      </div>
    </section>
  );
}


export default function Homepage() {
  return (
    <div className="bg-[#f5e6e6] page-enter">
      <HeroSection />
      <ServicesHeading />
      <ServicesCards />
    </div>
  );
}
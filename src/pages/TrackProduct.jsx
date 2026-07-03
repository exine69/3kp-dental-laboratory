import { useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal.js";

const sampleTrackingData = {
  "1001": {
    customer: "Sample Customer 1",
    product: "Complete Denture",
    status: "Still being made",
    statusIcon: "🔨",
    statusColor: "bg-amber-100 text-amber-800 border-amber-200",
    message:
      "Your product is currently being crafted in the laboratory. Please check again later for updates.",
  },

  "1002": {
    customer: "Sample Customer 2",
    product: "Partial Denture",
    status: "Ready for delivery",
    statusIcon: "📦",
    statusColor: "bg-blue-100 text-blue-800 border-blue-200",
    message:
      "Your product has been completed and is being prepared for delivery.",
  },

  "1003": {
    customer: "Sample Customer 3",
    product: "Flexible Partial Denture",
    status: "Out for delivery",
    statusIcon: "🚚",
    statusColor: "bg-purple-100 text-purple-800 border-purple-200",
    message:
      "Your product is currently out for delivery. Please contact us for delivery updates.",
    trackingLink: "https://www.google.com/maps",
  },

  "1004": {
    customer: "Sample Customer 4",
    product: "Premium Denture",
    status: "Delivered",
    statusIcon: "✅",
    statusColor: "bg-green-100 text-green-800 border-green-200",
    message:
      "Your product has already been delivered. Thank you for trusting 3KP Dental Laboratory.",
  },
};

export default function TrackProduct() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const headerRef = useScrollReveal({ animation: "fade-in-up" });
  const formRef = useScrollReveal({ animation: "scale-in" });

  async function handleTrack(event) {
    event.preventDefault();
    setIsSearching(true);
    setError("");
    setResult(null);

    // Small delay for UX feel
    await new Promise((res) => setTimeout(res, 600));

    const record = sampleTrackingData[trackingNumber.trim()];

    if (!record) {
      setResult(null);
      setError(
        "Tracking number not found. Please check the tracking number provided to you."
      );
      setIsSearching(false);
      return;
    }

    setError("");
    setResult(record);
    setIsSearching(false);
  }

  const inputClasses =
    "w-full p-4 rounded-2xl border border-black/10 bg-white/80 text-[16px] md:text-[18px] font-['Space_Grotesk',sans-serif] placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#f36767]/40 focus:border-[#f36767] transition-all duration-300";

  return (
    <div className="bg-[#f5e6e6] min-h-screen font-['Space_Grotesk',sans-serif] page-enter">
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[100px] py-12 md:py-[60px]">
        {/* Header */}
        <section
          ref={headerRef}
          className="bg-[#f9abab] border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[50px] text-center"
        >
          <h1 className="text-[32px] md:text-[44px] font-medium text-black mb-6">
            Track Your <span className="gradient-text">Product</span>
          </h1>

          <p className="text-[16px] md:text-[18px] leading-8 max-w-[900px] mx-auto text-black/80">
            Enter your phone number and tracking number to check the current
            status of your product.
          </p>
        </section>

        {/* Tracking Form */}
        <section
          ref={formRef}
          className="bg-[#f3f3f3] border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[50px] mt-10 md:mt-[50px]"
        >
          <form onSubmit={handleTrack} className="flex flex-col gap-5">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="Enter your phone number"
              className={inputClasses}
              required
            />

            <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
              <input
                value={trackingNumber}
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder="Enter your tracking number"
                className={`flex-1 ${inputClasses}`}
                required
              />

              <button
                type="submit"
                disabled={isSearching}
                className="bg-[#191a23] text-white border-none rounded-2xl px-8 py-4 text-[16px] md:text-[18px] font-medium cursor-pointer btn-animate transition-all duration-300 hover:bg-[#2a2b36] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSearching ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searching...
                  </span>
                ) : (
                  "Track"
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-[#f36767]/20 border border-[#f36767]/30 text-[#b73030] rounded-2xl p-5 mt-8 text-[16px] md:text-[18px] animate-[pageSlideIn_0.4s_ease_forwards] flex items-start gap-3">
              <span className="text-[20px] shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Tracking Result */}
          {result && (
            <div className="bg-white border border-black/10 rounded-[25px] md:rounded-[30px] p-6 md:p-8 mt-8 animate-[pageSlideIn_0.4s_ease_forwards] shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                <span className="text-[36px]">{result.statusIcon}</span>
                <div>
                  <h2 className="text-[26px] md:text-[32px] font-medium">
                    {result.status}
                  </h2>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[12px] font-semibold border ${result.statusColor}`}>
                    {result.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="bg-[#f5e6e6]/60 rounded-2xl p-4">
                  <p className="text-[12px] text-black/40 mb-1 font-medium uppercase tracking-wider">Customer</p>
                  <p className="text-[16px] md:text-[18px] font-medium">{result.customer}</p>
                </div>
                <div className="bg-[#f5e6e6]/60 rounded-2xl p-4">
                  <p className="text-[12px] text-black/40 mb-1 font-medium uppercase tracking-wider">Product</p>
                  <p className="text-[16px] md:text-[18px] font-medium">{result.product}</p>
                </div>
                <div className="bg-[#f5e6e6]/60 rounded-2xl p-4">
                  <p className="text-[12px] text-black/40 mb-1 font-medium uppercase tracking-wider">Phone Number</p>
                  <p className="text-[16px] md:text-[18px] font-medium">{phoneNumber}</p>
                </div>
              </div>

              <p className="text-[16px] md:text-[18px] leading-8 text-black/70">
                {result.message}
              </p>

              {result.trackingLink && (
                <a
                  href={result.trackingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 bg-[#191a23] text-white border-none rounded-2xl px-8 py-4 text-[16px] md:text-[18px] font-medium no-underline btn-animate transition-all duration-300 hover:bg-[#2a2b36]"
                >
                  📍 Open Google Tracking
                </a>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
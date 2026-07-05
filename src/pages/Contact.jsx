import { useState } from "react";
import { useScrollReveal, useStaggerReveal } from "../hooks/useScrollReveal.js";
import { useAuth } from "../context/AuthContext.jsx";

import facebookLogo from "../assets/Socials/facebook.png";
import phoneLogo from "../assets/Socials/phone.png";
import gmailLogo from "../assets/Socials/gmail.png";

export default function Contact() {
  const headerRef = useScrollReveal({ animation: "fade-in-up" });
  const cardsRef = useStaggerReveal({ animation: "fade-in-up" });

  return (
    <div className="bg-[#f5e6e6] min-h-screen font-['Space_Grotesk',sans-serif] page-enter">
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[100px] py-12 md:py-[60px]">
        <section
          ref={headerRef}
          className="bg-[#f9abab] border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[50px] text-center"
        >
          <h1 className="text-[32px] md:text-[44px] font-medium text-black mb-6">
            Our Socials & <span className="gradient-text">Contact Information</span>
          </h1>

          <p className="text-[16px] md:text-[18px] leading-8 max-w-[900px] mx-auto text-black/80">
            Connect with 3KP Dental Laboratory through our phone numbers,
            Facebook accounts, and email addresses.
          </p>
        </section>

        <section
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-[40px] mt-10 md:mt-[50px]"
        >
          {/* PHONE */}
          <div className="bg-[#f3f3f3] border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[40px] card-hover">
            <div className="flex justify-center mb-5">
              <div className="w-[80px] h-[80px] rounded-full bg-[#f9abab]/40 flex items-center justify-center transition-transform duration-500 hover:scale-110 hover:rotate-6">
                <img
                  src={phoneLogo}
                  alt="Phone"
                  className="w-[50px] h-[50px] object-contain"
                />
              </div>
            </div>

            <h2 className="text-[26px] md:text-[30px] font-medium mb-6 text-center">
              Call Us
            </h2>

            <div className="flex flex-col gap-3 text-[16px] md:text-[18px]">
              {["87107657", "09959271047", "09299627637", "86505228"].map((num) => (
                <a
                  key={num}
                  href={`tel:${num}`}
                  className="text-black/70 hover:text-[#e05555] no-underline transition-all duration-300 link-underline inline-block"
                >
                  {num}
                </a>
              ))}
            </div>
          </div>

          {/* GMAIL */}
          <div className="bg-[#f36767] border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[40px] card-hover">
            <div className="flex justify-center mb-5">
              <div className="w-[80px] h-[80px] rounded-full bg-white/20 flex items-center justify-center transition-transform duration-500 hover:scale-110 hover:rotate-6">
                <img
                  src={gmailLogo}
                  alt="Gmail"
                  className="w-[50px] h-[50px] object-contain"
                />
              </div>
            </div>

            <h2 className="text-[26px] md:text-[30px] font-medium mb-6 text-center">
              Email Us
            </h2>

            <div className="flex flex-col gap-3 text-[16px] md:text-[18px]">
              {[
                "keffgerard@gmail.com",
                "kgpabunan@gmail.com",
                "kspabunan@gmail.com",
              ].map((email) => (
                <a
                  key={email}
                  href={`mailto:${email}`}
                  className="text-black/80 hover:text-[#191a23] no-underline transition-all duration-300 link-underline inline-block break-all"
                >
                  {email}
                </a>
              ))}
            </div>
          </div>

          {/* FACEBOOK */}
          <div className="bg-[#191a23] text-white border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[40px] card-hover">
            <div className="flex justify-center mb-5">
              <div className="w-[80px] h-[80px] rounded-full bg-white/10 flex items-center justify-center transition-transform duration-500 hover:scale-110 hover:rotate-6">
                <img
                  src={facebookLogo}
                  alt="Facebook"
                  className="w-[50px] h-[50px] object-contain bg-white rounded-full"
                />
              </div>
            </div>

            <h2 className="text-[26px] md:text-[30px] font-medium mb-6 text-center">
              Facebook
            </h2>

            <div className="flex flex-col gap-3 text-[16px] md:text-[18px]">
              {[
                { name: "Grace Suplido", url: "https://www.facebook.com/grace.suplido" },
                { name: "Gerry Pabunan", url: "https://www.facebook.com/gerry.pabunan.94" },
                { name: "Keff Pabunan", url: "https://www.facebook.com/keff.pabunan.2025" },
              ].map((fb) => (
                <a
                  key={fb.url}
                  href={fb.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-[#f36767] no-underline transition-all duration-300 link-underline inline-block"
                >
                  {fb.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Message Admin Section */}
        <MessageAdminSection />
      </main>
    </div>
  );
}

function MessageAdminSection() {
  const { user } = useAuth();
  const ref = useScrollReveal({ animation: "fade-in-up" });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSend(e) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);

    const newMsg = {
      public_id: `MSG-${Date.now()}`,
      user_id: user?.id || null,
      from_name: user?.name || user?.username || "User",
      subject: subject || "General Inquiry",
      body: body,
      order_id: null,
      appointment_id: null
    };

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
      const data = await res.json();
      
      if (data.success) {
        setSent(true);
        setSubject("");
        setBody("");
        setTimeout(() => setSent(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      ref={ref}
      className="bg-[#f36767] border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[50px] mt-10 md:mt-[50px]"
    >
      <div className="text-[36px] mb-3">✉️</div>
      <h2 className="text-[28px] md:text-[32px] font-medium mb-2">
        Send us a Message
      </h2>
      <p className="text-[15px] text-black/60 mb-6">
        Have a question or concern? Send us a message and we'll get back to you.
      </p>

      {sent ? (
        <div className="bg-white/30 rounded-2xl p-6 text-center animate-[pageSlideIn_0.4s_ease_forwards]">
          <p className="text-[36px] mb-2">✅</p>
          <p className="text-[18px] font-medium">Message sent!</p>
          <p className="text-[14px] text-black/50 mt-1">
            We'll review your message and respond as soon as possible.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-4">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (optional)"
            className="w-full p-4 rounded-2xl border border-black/10 bg-white/80 text-[16px] font-['Space_Grotesk',sans-serif] placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white transition-all duration-300"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            placeholder="Type your message here..."
            rows={4}
            className="w-full p-4 rounded-2xl border border-black/10 bg-white/80 text-[16px] font-['Space_Grotesk',sans-serif] placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white transition-all duration-300 resize-none"
          />
          <button
            type="submit"
            disabled={!body.trim() || sending}
            className="bg-[#191a23] text-white border-none rounded-2xl px-8 py-4 text-[16px] font-medium cursor-pointer btn-animate transition-all duration-300 hover:bg-[#2a2b36] disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
          >
            {sending ? "Sending..." : "Send Message →"}
          </button>
        </form>
      )}
    </section>
  );
}

import { useState, useEffect } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal.js";
import { useAuth } from "../context/AuthContext.jsx";

const DENTURE_TYPES = [
  "Complete Dentures",
  "Partial Dentures",
  "Implant-Supported Dentures",
  "Flexible Partial Dentures",
  "Crowns & Bridges",
];

const TIME_SLOTS = [
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM",
  "6:00 PM - 7:00 PM",
  "7:00 PM - 8:00 PM",
];

export default function Appointment() {
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastApptId, setLastApptId] = useState(null);
  const [contactNum, setContactNum] = useState("");
  const [contactError, setContactError] = useState("");
  const headerRef = useScrollReveal({ animation: "fade-in-up" });

  const today = new Date().toISOString().slice(0, 10);

  // ====== APPOINTMENT STATE ======
  const [apptDate, setApptDate] = useState("");
  const [apptSlot, setApptSlot] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    if (!apptDate) { setBookedSlots([]); return; }
    
    // Use dedicated endpoint that handles date format correctly
    fetch(`/api/appointments/booked-slots?date=${apptDate}`)
      .then(res => res.json())
      .then(data => {
        const taken = Array.isArray(data) ? data : [];
        setBookedSlots(taken);
        // If currently selected slot is now taken, clear it
        if (taken.includes(apptSlot)) setApptSlot("");
      })
      .catch(err => console.error("Failed to fetch booked slots", err));
  }, [apptDate, apptSlot]);

  // ====== SUBMIT APPOINTMENT ======
  async function handleAppointmentSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setContactError("");
    setSubmitting(true);

    const form = event.currentTarget;
    const fd = new FormData(form);

    if (!apptSlot) {
      setSubmitting(false);
      return;
    }

    // Validate phone: must be exactly 11 digits starting with 09
    if (!/^09\d{9}$/.test(contactNum)) {
      setContactError("Phone number must be 11 digits starting with 09.");
      setSubmitting(false);
      return;
    }

    const apptId = `APT-${Date.now()}`;

    const newAppt = {
      public_id: apptId,
      user_id: user?.id || null,
      customer_name: fd.get("fullName"),
      service: fd.get("dentureType"),
      appointment_date: apptDate,
      time_slot: apptSlot,
      contact: contactNum,
      clinic: fd.get("clinic") || "",
      notes: fd.get("notes") || "",
    };

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppt)
      });
      const data = await res.json();
      
      if (data.success) {
        setLastApptId(apptId);
        setSuccess(true);
        form.reset();
        setApptDate("");
        setApptSlot("");
        setContactNum("");

        setTimeout(() => { setSuccess(false); setSubmitting(false); setLastApptId(null); }, 4000);
      } else {
        setContactError("Failed to book appointment.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setContactError("Server error.");
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full p-4 rounded-2xl border border-black/10 bg-white/80 text-[16px] font-['Space_Grotesk',sans-serif] placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-[#f36767]/40 focus:border-[#f36767] transition-all duration-300";

  return (
    <div className="bg-[#f5e6e6] min-h-screen font-['Space_Grotesk',sans-serif] page-enter">
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-[100px] py-12 md:py-[60px]">
        {/* Header */}
        <section
          ref={headerRef}
          className="bg-[#f9abab] border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[50px] text-center"
        >
          <h1 className="text-[32px] md:text-[44px] font-medium text-black mb-4">
            Book an <span className="gradient-text">Appointment</span>
          </h1>
          <p className="text-[16px] md:text-[18px] leading-8 max-w-[900px] mx-auto text-black/80">
            Schedule a visit to our dental laboratory for consultation, fitting, or denture adjustments.
          </p>
          {/* Free Shipping Banner */}
          <div className="mt-4 inline-block bg-white/60 backdrop-blur-sm border border-[#f36767]/20 rounded-full px-6 py-2 text-[14px] font-medium text-[#e05555]">
            🚚 Free Shipping on all deliveries!
          </div>
        </section>

        {/* Success */}
        {success && (
          <div className="bg-[#34d399] text-white border border-[#059669] rounded-[20px] shadow-[0px_5px_0px_0px_#059669] p-6 mt-8 text-center text-[18px] font-medium animate-[pageSlideIn_0.5s_ease_forwards]">
            ✅ Appointment booked successfully! Your Appointment ID is{" "}
            <span className="font-bold underline">{lastApptId}</span>. Check your sidebar for status updates.
          </div>
        )}

        {/* ==================== APPOINTMENT FORM ==================== */}
        <form
          onSubmit={handleAppointmentSubmit}
          className="bg-[#f3f3f3] border border-[#191a23] rounded-[35px] md:rounded-[45px] shadow-[0px_5px_0px_0px_#191a23] p-8 md:p-[50px] mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-[30px]"
        >
          <input name="fullName" required className={inputClasses} placeholder="Full Name *" defaultValue={user?.name || ""} />
          <div>
            <input
              name="contact"
              required
              className={`${inputClasses} ${contactError ? "ring-2 ring-red-400 border-red-400" : ""}`}
              placeholder="Contact Number (09xxxxxxxxx) *"
              value={contactNum}
              onChange={(e) => { setContactNum(e.target.value.replace(/\D/g, "").slice(0, 11)); setContactError(""); }}
              maxLength={11}
              inputMode="numeric"
            />
            {contactError && <p className="text-[12px] text-[#e05555] mt-1 ml-1">⚠️ {contactError}</p>}
          </div>
          <input name="clinic" className={inputClasses} placeholder="Referred By (optional)" />
          <select name="dentureType" required className={inputClasses} defaultValue="">
            <option value="" disabled>Select Denture Type *</option>
            {DENTURE_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>

          {/* Date Picker */}
          <div>
            <label className="block text-[13px] font-medium text-black/50 mb-1.5 ml-1">Preferred Date *</label>
            <input
              name="date"
              required
              className={inputClasses}
              type="date"
              min={today}
              value={apptDate}
              onChange={(e) => { setApptDate(e.target.value); setApptSlot(""); }}
            />
          </div>

          {/* Time Slots */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[13px] font-medium text-black/50 mb-2 ml-1">
              Available Time Slots {apptDate ? `for ${new Date(apptDate + "T00:00").toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}` : "— pick a date first"} *
            </label>
            {apptDate ? (
              (() => {
                const day = new Date(apptDate).getDay();
                if (day === 0) {
                  return (
                    <div className="bg-red-50 text-red-500 rounded-2xl p-6 text-center text-[14px] border border-red-100 font-medium">
                      ⚠️ The clinic is closed on Sundays. Please select another date.
                    </div>
                  );
                }
                const availableSlots = day === 6 ? TIME_SLOTS.slice(0, 8) : TIME_SLOTS;
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = apptSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setApptSlot(slot)}
                          className={`py-3 px-3 rounded-xl text-[13px] font-medium border transition-all duration-300 ${
                            isBooked
                              ? "bg-red-50 text-red-300 border-red-100 cursor-not-allowed line-through"
                              : isSelected
                              ? "bg-[#191a23] text-white border-[#191a23] shadow-md"
                              : "bg-white text-black/70 border-black/10 hover:border-[#f36767] hover:bg-[#fce8e8] cursor-pointer"
                          }`}
                        >
                          {isBooked ? `${slot} ✕` : slot}
                        </button>
                      );
                    })}
                  </div>
                );
              })()
            ) : (
              <div className="bg-white/50 rounded-2xl p-6 text-center text-black/30 text-[14px] border border-dashed border-black/10">
                Please select a date above to see available time slots
              </div>
            )}
            {apptDate && !apptSlot && (
              <p className="text-[12px] text-[#e05555] mt-2 ml-1">⚠️ Please select a time slot</p>
            )}
          </div>

          <textarea
            name="notes"
            className={`col-span-1 md:col-span-2 ${inputClasses} min-h-[120px] resize-none`}
            placeholder="Additional notes or instructions (optional)"
          />

          <button
            type="submit"
            disabled={submitting || !apptSlot}
            className="col-span-1 md:col-span-2 bg-[#191a23] text-white border-none rounded-2xl px-8 py-4 text-[18px] font-medium cursor-pointer btn-animate shimmer transition-all duration-300 hover:bg-[#2a2b36] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Booking...
              </span>
            ) : "📅 Book Appointment →"}
          </button>
        </form>
      </main>
    </div>
  );
}
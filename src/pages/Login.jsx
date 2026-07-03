import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await new Promise((res) => setTimeout(res, 400));

    if (mode === "login") {
      if (!username.trim() || !password.trim()) {
        setError("All fields are required.");
        setIsLoading(false);
        return;
      }
      const result = await login(username, password);
      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
      } else {
        window.history.replaceState(null, "", "/");
      }
    } else if (mode === "signup") {
      if (!name.trim() || !username.trim() || !password.trim() || !email.trim() || !phone.trim()) {
        setError("All fields are required.");
        setIsLoading(false);
        return;
      }
      const result = await signup(username, password, name, email, phone);
      if (!result.success) {
        setError(result.error);
        setIsLoading(false);
      } else {
        window.history.replaceState(null, "", "/");
      }
    }
  }

  const inputClass = "w-full px-4 py-3.5 rounded-2xl border border-black/10 bg-[#fafafa] text-[15px] focus:outline-none focus:ring-2 focus:ring-[#f36767]/30 focus:border-[#f36767] transition-all duration-300 placeholder:text-black/25";

  return (
    <div className="min-h-screen bg-[#f5e6e6] flex items-center justify-center p-4 font-['Space_Grotesk',sans-serif]">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#f36767]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#f9abab]/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[#f36767]/5 rounded-full blur-2xl animate-[float_8s_ease-in-out_infinite]" />
      </div>

      <div className="relative w-full max-w-[440px] page-enter">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-['Spicy_Rice',sans-serif] text-[#e61717] text-[42px] mb-2">
            🦷3KP DENTAL🦷
          </p>
          <p className="text-[16px] text-black/50">
            Dental Laboratory Management System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 md:p-10 border border-black/5">
          {/* Tab switcher */}
          <div className="flex bg-[#f5e6e6] rounded-2xl p-1 mb-8">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-3 rounded-xl text-[15px] font-medium transition-all duration-300 ${
                mode === "login"
                  ? "bg-white text-black shadow-sm"
                  : "text-black/40 hover:text-black/60"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-3 rounded-xl text-[15px] font-medium transition-all duration-300 ${
                mode === "signup"
                  ? "bg-white text-black shadow-sm"
                  : "text-black/40 hover:text-black/60"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-[13px] font-medium text-black/50 mb-1.5 ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Juan dela Cruz"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-black/50 mb-1.5 ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. juan@email.com"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-black/50 mb-1.5 ml-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder="09xxxxxxxxx"
                    className={inputClass}
                    maxLength={11}
                    inputMode="numeric"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[13px] font-medium text-black/50 mb-1.5 ml-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === "login" ? "Enter username" : "Choose a username"}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-black/50 mb-1.5 ml-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "login" ? "Enter password" : "Choose a password (min. 4 chars)"}
                className={inputClass}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-[14px] px-4 py-3 rounded-2xl border border-red-100 animate-[pageSlideIn_0.3s_ease_forwards]">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#191a23] text-white font-medium text-[16px] py-4 rounded-2xl transition-all duration-300 hover:bg-[#2a2b36] hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed btn-animate shimmer mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : mode === "login" ? (
                "Sign In →"
              ) : (
                "Create Account →"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

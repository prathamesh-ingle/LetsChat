// src/pages/LoginPage.jsx
import { useState } from "react";
import { MessageCircleMore, Eye, EyeOff, Mail, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import useLogin from "../hooks/useLogin";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const { isPending, error, loginMutation } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div
      data-theme="light"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e5fff6] via-[#ece5dd] to-[#f0f2f5] px-3 sm:px-4 py-6"
    >
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative grid grid-cols-1 lg:grid-cols-[1.05fr,0.95fr] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/60 transform md:scale-105">
          {/* LEFT: Login form */}
          <div className="flex flex-col p-4 sm:p-5 lg:p-6">
            {/* Brand header */}
            <header className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center justify-center rounded-2xl bg-[#e2f9f1] p-1.5">
                  <MessageCircleMore className="size-6 text-[#128c7e]" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#075e54]">
                    LetsChat
                  </h1>
                  <p className="text-[11px] sm:text-xs text-gray-500">
                    Modern, fast and secure chat for everyone.
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center rounded-full bg-[#e2f9f1] px-3 py-1 text-[11px] font-medium text-[#128c7e]">
                Welcome back
              </span>
            </header>

            {/* Error message */}
            {error && (
              <div className="alert alert-error mb-3 text-sm">
                <span>
                  {error.response?.data?.message || "Something went wrong"}
                </span>
              </div>
            )}

            {/* Form content */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-3">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Sign in to your account
                </h2>
                <p className="mt-1 text-[11px] sm:text-xs text-gray-500">
                  Continue your conversations and pick up where you left off.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-600 uppercase tracking-wide">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="input input-bordered w-full bg-[#f0f2f5] border-gray-300 focus:border-[#25d366] focus:ring-2 focus:ring-[#25d366]/40 focus:outline-none text-sm rounded-xl pl-10"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password with eye button */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-gray-600 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Your password"
                      className="input input-bordered w-full bg-[#f0f2f5] border-gray-300 focus:border-[#25d366] focus:ring-2 focus:ring-[#25d366]/40 focus:outline-none text-sm rounded-xl pl-10 pr-10"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData((prev) => ({ ...prev, password: e.target.value }))
                      }
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span>Use the password you set during signup.</span>
                    <button
                      type="button"
                      className="text-[#128c7e] hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* CTA button */}
                <button
                  type="submit"
                  className="btn w-full border-none bg-[#128c7e] hover:bg-[#075e54] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#128c7e]/30 transition-transform hover:-translate-y-[1px]"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Signing you in...
                    </>
                  ) : (
                    "login"
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <span className="flex-1 h-px bg-gray-200" />
                  <span>New to LetsChat?</span>
                  <span className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Signup link */}
                <p className="text-center text-xs sm:text-sm text-gray-600">
                  <span>Create an account in seconds: </span>
                  <Link
                    to="/signup"
                    className="text-[#128c7e] hover:underline font-semibold"
                  >
                    Go to signup
                  </Link>
                </p>
              </form>
            </div>

            {/* Small footer */}
            <footer className="mt-4 text-[10px] text-gray-400 flex justify-between items-center">
              <span>Secure login with encrypted sessions.</span>
              <span>Built for modern conversations.</span>
            </footer>
          </div>

          {/* RIGHT: Illustration / preview */}
          <div className="relative hidden lg:flex bg-gradient-to-br from-[#075e54] via-[#128c7e] to-[#25d366] text-white items-center justify-center">
            <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-black/10 blur-3xl" />

            <div className="relative z-10 w-full max-w-xs px-6 py-6 space-y-3">
              {/* Illustration */}
              <div className="rounded-2xl overflow-hidden bg-white/10 border border_white/20 shadow-xl">
                <img
                  src="/i.png"
                  alt="LetsChat illustration"
                  className="w-full h-auto max-h-52 object-contain"
                />
              </div>

              {/* Fake chat card */}
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <p className="text-xs font-semibold">Recent chats</p>
                    <p className="text-[10px] text-white/70">
                      Pick up the conversation instantly.
                    </p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/20">
                    Active
                  </span>
                </div>

                <div className="space-y-2.5 text-[10px]">
                  <div className="flex gap-2">
                    <div className="h-6 w-6 rounded-full bg-[#e2f9f1]" />
                    <div className="max-w-[75%] rounded-2xl rounded-tl-none bg_white/90 text-gray-800 px-2.5 py-1.5 shadow-sm">
                      <p>Hey! Ready for today's language session? 🌍</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <div className="max-w-[75%] rounded-2xl rounded-tr-none bg-[#e2f9f1] text-gray-900 px-2.5 py-1.5 shadow-sm">
                      <p>Just logged in, let's start! 🚀</p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-[#25d366]" />
                  </div>
                </div>
              </div>

              {/* Text block */}
              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold leading-snug">
                  Log in and continue where you stopped.
                </h2>
                <p className="text-[11px] text-white/80">
                  Your chats, partners and practice sessions are always synced
                  across your devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

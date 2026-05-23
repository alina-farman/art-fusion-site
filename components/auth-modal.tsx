"use client";

// =============================================
// components/auth-modal.tsx
// Login / Register — Backend se connected
// =============================================

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { loginUser, registerUser } from "@/lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
  adminOnly?: boolean;
}

export function AuthModal({
  isOpen,
  onClose,
  defaultMode = "login",
  adminOnly = false,
}: AuthModalProps) {
  const { setUser } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">(defaultMode);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "artist">("buyer");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // if (!isOpen) return null;

  // ── Reset form ─────────────────────────

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("buyer");
    setLoading(false);
    setError("");
    setSuccess("");
  };

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      resetForm();
    }
  }, [isOpen, defaultMode]);

  if (!isOpen) return null;

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    resetForm();
  };

  // ── Submit ─────────────────────────────
  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    if (mode === "register" && !name) {
      setError("Name is a required feild");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      let data;

      if (mode === "login") {
        data = await loginUser(email, password);

        if (
          data.user.role !== "admin" &&
          window.location.pathname.includes("/admin")
        ) {
          throw new Error("Admin account required");
        }

        console.log("LOGIN RESPONSE:", data);
        localStorage.setItem("token", data.token);

        setSuccess("Login Successfully! 🎉");
      } else {
        data = await registerUser(name, email, password, role);

        localStorage.setItem("token", data.token); // optional but good

        setSuccess("Account Created Successfully! 🎉");
      }

      // User context update karo
      setUser(data.user);

      localStorage.setItem("current_user", JSON.stringify(data.user));

      // 1 second baad modal band karo
      setTimeout(() => {
        resetForm();
        onClose();
        if (data.user.role === "admin") {
          router.replace("/admin/dashboard");
        // }else{
        //   router.replace("/");
        }
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Something went wrong! Try Again");
    } finally {
      setLoading(false);
    }
  };

  // ── UI ─────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Box */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === "login" ? "Welcome Back 👋" : "Join Art Fusion 🎨"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {mode === "login"
                ? "Login to your account"
                : "Create a new account — its free!"}
            </p>
          </div>

          {/* Tab switch */}
          {!adminOnly && (
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => switchMode("login")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === "login"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Login
              </button>

              <button
                onClick={() => switchMode("register")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === "register"
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
              ✅ {success}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Name — sirf register mein */}
            {mode === "register" && !adminOnly && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Ali Hassan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="ali@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Role — sirf register mein */}
            {mode === "register" && !adminOnly && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a/an...
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setRole("buyer")}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      role === "buyer"
                        ? "border-black bg-black text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    🛒 Buyer
                  </button>
                  <button
                    onClick={() => setRole("artist")}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      role === "artist"
                        ? "border-black bg-black text-white"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    🎨 Artist
                  </button>
                </div>
              </div>
            )}

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg font-medium mt-2"
            >
              {loading
                ? "⏳ Please wait..."
                : mode === "login"
                  ? "Login"
                  : "Create Account"}
            </Button>
          </div>

          {/* Switch mode link */}
          {!adminOnly && (
            <p className="text-center text-sm text-gray-500 mt-4">
              {mode === "login" ? (
                <>
                  Don't have an Account?{" "}
                  <button
                    onClick={() => switchMode("register")}
                    className="text-black font-medium hover:underline"
                  >
                    Register First
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => switchMode("login")}
                    className="text-black font-medium hover:underline"
                  >
                    Just Login
                  </button>
                </>
              )}
            </p>
          )}
          {/* <p className="text-center text-sm text-gray-500 mt-4">
            {mode === "login" ? (
              <>
                Don't have an Account?{" "}
                <button
                  onClick={() => switchMode("register")}
                  className="text-black font-medium hover:underline"
                >
                  Register First
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => switchMode("login")}
                  className="text-black font-medium hover:underline"
                >
                  Just Login to your account
                </button>
              </>
            )}
          </p> */}
        </div>
      </div>
    </>
  );
}

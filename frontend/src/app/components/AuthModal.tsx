import React, { useState } from "react";
import Swal from "sweetalert2";

interface AuthModalProps {
  mode: "login" | "signup";
  onClose: () => void;
  onLogin: (credentials: { email: string; password: string }) => void;
  onSignup: (userData: { name: string; email: string; password: string }) => void;
  error: string | null;
}

const AuthModal: React.FC<AuthModalProps> = ({
  mode,
  onClose,
  onLogin,
  onSignup,
  error,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || (mode === "signup" && !name)) {
      Swal.fire("All fields are required", "", "warning");
      return;
    }

    if (mode === "signup" && password.length < 6) {
      Swal.fire("Password should be at least 6 characters", "", "warning");
      return;
    }

    if (mode === "login") {
      onLogin({ email, password });
    } else {
      onSignup({ name, email, password });
    }
  };

  const handleForgotPassword = async () => {
    const { value: enteredEmail } = await Swal.fire({
      title: "Forgot Password?",
      input: "email",
      inputLabel: "Enter your email address",
      inputPlaceholder: "example@email.com",
      confirmButtonText: "Send Reset Link",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Please enter a valid email";
        return undefined;
      },
    });

    if (enteredEmail) {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: enteredEmail }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Something went wrong.");
        }

        Swal.fire("Check your inbox!", data.message, "success");
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        Swal.fire("Error", errorMessage, "error");
      }

    }
  };

  const inputClasses =
    "w-full border p-2 mb-3 rounded-md text-gray-900 placeholder-gray-500";

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">
          {mode === "login" ? "Login" : "Sign Up"}
        </h2>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Name"
              className={inputClasses}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className={inputClasses}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 mb-2 rounded-md text-gray-900 placeholder-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />

          {mode === "login" && (
            <div className="text-right mb-4">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-600 text-sm hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            {mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
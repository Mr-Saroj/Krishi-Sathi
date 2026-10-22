// src/pages/public/Login.jsx
import { Link } from "react-router-dom";
import { useState } from "react";

// Pressed-in (inset) input; focus shows a green outline
const inputClass =
  "neu-inset w-full rounded-xl border-0 px-4 py-3 text-sm text-on-surface outline-none transition placeholder:text-outline focus:outline-2 focus:outline-offset-2 focus:outline-secondary/60";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // Connect your backend login API here.
      // Example:
      // const response = await loginUser(formData);
      // navigate("/dashboard");

      setError("Connect your login API to continue.");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-surface px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      {/* Centered Login Form */}
      <section className="mx-auto mt-8 w-full max-w-md">
        <div className="neu-raised rounded-3xl p-6 sm:p-9">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="neu-inset flex h-20 w-20 items-center justify-center rounded-full">
              <img
                src="/dashboard_icon.png"
                alt="Krishi Sathi AI"
                className="h-12 w-12 object-contain"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
              Welcome back
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-primary">
              Sign in to your account
            </h1>

            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              Enter your details to continue to Krishi Sathi AI.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-primary"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-primary"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-secondary transition hover:text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`${inputClass} pr-20`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-3 text-sm font-medium text-on-surface-variant transition hover:text-secondary"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p
                role="alert"
                className="neu-inset-sm rounded-xl px-4 py-3 text-sm font-medium text-error"
              >
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="neu-btn-primary flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <span className="ml-2">→</span>}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 border-t border-primary/10 pt-6 text-center">
            <p className="text-sm text-on-surface-variant">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-secondary hover:text-primary hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Terms and Privacy */}
        <p className="mt-6 text-center text-xs leading-5 text-on-surface-variant">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-secondary">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-secondary">
            Privacy Policy
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
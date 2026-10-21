
import { Link } from "react-router-dom";
import { useState } from "react";

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
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f6f8f3] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      {/* Centered Login Form */}
      <section className="mx-auto mt-10 w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-900/[0.06] sm:p-9">
          {/* Logo */}
          <div className="mb-5 flex justify-center">
            <img
              src="/dashboard_icon.png"
              alt="Krishi Sathi AI"
              className="h-14 w-14 object-contain"
            />
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
              Welcome back
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Enter your details to continue to Krishi Sathi AI.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
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
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-100"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-green-700 transition hover:text-green-800 hover:underline"
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-20 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-3 text-sm font-medium text-gray-500 hover:text-green-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-green-700 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <span className="ml-2">→</span>}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-7 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-green-700 hover:text-green-800 hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Terms and Privacy */}
        <p className="mt-5 text-center text-xs leading-5 text-gray-500">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-green-700">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-green-700">
            Privacy Policy
          </Link>.
        </p>
      </section>
    </main>
  );
}

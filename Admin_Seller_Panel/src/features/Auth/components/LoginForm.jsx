import { Link } from "react-router-dom";
import useLogin from "../hooks/useLogin";

// Pressed-in (inset) input; focus shows a green outline
const inputClass =
  "neu-inset w-full rounded-xl border-0 px-4 py-3 text-sm text-on-surface outline-none transition placeholder:text-outline focus:outline-2 focus:outline-offset-2 focus:outline-secondary/60";

export default function LoginForm() {
  const {
    formData,
    error,
    showPassword,
    loading,
    handleChange,
    handleSubmit,
    toggleShowPassword,
  } = useLogin();

  return (
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
            onClick={toggleShowPassword}
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
  );
}
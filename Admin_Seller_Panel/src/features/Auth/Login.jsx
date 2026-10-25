
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import LoginSkeleton from "./Skeliton/LoginSkeleton";


export default function Login() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // Show skeleton for 1 second

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoginSkeleton />;
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-surface px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
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
          <LoginForm />

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


export default function LoginSkeleton() {
  return (
    <main className="flex min-h-[70vh] animate-pulse items-center justify-center bg-[#f6f8f3] px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <section className="mx-auto mt-10 w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-900/[0.06] sm:p-9">

          {/* Mobile logo */}
          <div className="mb-5 flex justify-center lg:hidden">
            <div className="h-14 w-14 rounded-xl bg-gray-200" />
          </div>

          {/* Heading */}
          <div className="mb-8 text-center lg:text-left">
            <div className="mx-auto h-4 w-28 rounded bg-green-100 lg:mx-0" />
            <div className="mx-auto mt-3 h-8 w-64 max-w-full rounded-md bg-gray-200 lg:mx-0" />
            <div className="mx-auto mt-3 h-4 w-60 max-w-full rounded bg-gray-100 lg:mx-0" />
          </div>

          {/* Email */}
          <div className="mb-5">
            <div className="mb-2 h-4 w-28 rounded bg-gray-200" />
            <div className="h-12 w-full rounded-xl border border-gray-100 bg-gray-50" />
          </div>

          {/* Password label and forgot password */}
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-28 rounded bg-green-100" />
          </div>

          {/* Password */}
          <div className="relative h-12 w-full rounded-xl border border-gray-100 bg-gray-50">
            <div className="absolute right-3 top-4 h-4 w-10 rounded bg-gray-200" />
          </div>

          {/* Sign in button */}
          <div className="mt-6 h-12 w-full rounded-xl bg-green-100" />

          {/* Register link */}
          <div className="mt-7 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-36 rounded bg-gray-100" />
              <div className="h-4 w-24 rounded bg-green-100" />
            </div>
          </div>
        </div>

        {/* Terms and privacy footer */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <div className="h-3 w-36 rounded bg-gray-100" />
          <div className="h-3 w-10 rounded bg-gray-100" />
          <div className="h-3 w-12 rounded bg-green-100" />
          <div className="h-3 w-20 rounded bg-gray-100" />
        </div>
      </section>
    </main>
  );
}

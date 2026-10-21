
export default function RegisterSkeleton() {
  return (
    <main className="min-h-screen animate-pulse bg-[#f6f8f3] px-4 pb-12 pt-12 sm:px-6 sm:pt-14 lg:pt-22">
      <div className="mx-auto max-w-5xl">
        {/* Logo and page heading */}
        <header className="mb-7 text-center sm:mb-8">
          <div className="mx-auto mb-3 flex items-center justify-center">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-gray-200" />
              <div className="ml-2 h-5 w-36 rounded-md bg-gray-200" />
            </div>
          </div>

          <div className="mx-auto mt-5 h-9 w-56 rounded-lg bg-gray-200 sm:h-10 sm:w-72" />

          <div className="mx-auto mt-3 h-4 w-64 max-w-full rounded-md bg-gray-200 sm:w-96" />
          <div className="mx-auto mt-2 h-4 w-52 max-w-full rounded-md bg-gray-200 sm:w-72" />
        </header>

        {/* Registration card */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-900/[0.06] sm:rounded-3xl">
          {/* Stepper header */}
          <div className="border-b border-gray-100 px-5 py-6 sm:px-10 sm:py-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <div className="h-4 w-36 rounded-md bg-gray-200" />
                <div className="mt-2 h-3 w-48 max-w-full rounded-md bg-gray-100" />
              </div>

              <div className="h-7 w-24 rounded-full bg-green-100" />
            </div>

            {/* Three centered circular steps */}
            <div className="relative grid grid-cols-3">
              {/* Connector line */}
              <div className="absolute left-[16.66%] right-[16.66%] top-5 h-0.5 bg-gray-200" />

              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="relative z-10 flex min-w-0 flex-col items-center"
                >
                  <div
                    className={`h-10 w-10 rounded-full border-2 ${
                      item === 0
                        ? "border-green-200 bg-green-100"
                        : "border-gray-200 bg-white"
                    }`}
                  />

                  <div
                    className={`mt-3 h-3 w-20 max-w-[90%] rounded-md ${
                      item === 0 ? "bg-green-100" : "bg-gray-100"
                    }`}
                  />

                  <div className="mt-2 hidden h-3 w-24 rounded-md bg-gray-100 sm:block" />
                </div>
              ))}
            </div>
          </div>

          {/* Form skeleton */}
          <div className="px-5 py-7 sm:px-10 sm:py-9">
            {/* Step title */}
            <div className="mb-6">
              <div className="h-3 w-16 rounded bg-green-100" />
              <div className="mt-3 h-7 w-56 max-w-full rounded-md bg-gray-200" />
              <div className="mt-3 h-4 w-72 max-w-full rounded-md bg-gray-100" />
            </div>

            {/* Form fields */}
            <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="min-w-0">
                  <div className="h-4 w-28 rounded-md bg-gray-200" />
                  <div className="mt-2 h-12 w-full rounded-xl border border-gray-100 bg-gray-50" />
                  {item === 1 || item === 2 ? (
                    <div className="mt-2 h-3 w-44 max-w-full rounded bg-gray-100" />
                  ) : null}
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="h-11 w-32 rounded-xl bg-gray-100" />
              <div className="h-11 w-36 rounded-xl bg-green-100" />
            </div>
          </div>
        </section>

        {/* Sign-in footer */}
        <div className="mt-5 flex justify-center gap-2">
          <div className="h-4 w-40 rounded bg-gray-100" />
          <div className="h-4 w-12 rounded bg-green-100" />
        </div>
      </div>
    </main>
  );
}

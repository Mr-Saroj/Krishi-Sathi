// src/components/common/HomeSkeleton.jsx

export default function HomeSkeleton() {
  return (
    <div className="w-full pt-20 bg-white animate-pulse">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="h-5 w-48 rounded-full bg-gray-200" />
            <div className="h-10 sm:h-14 w-full max-w-2xl rounded-lg bg-gray-200" />
            <div className="h-10 sm:h-14 w-4/5 rounded-lg bg-gray-200" />

            <div className="space-y-3 pt-2">
              <div className="h-4 w-full max-w-xl rounded bg-gray-200" />
              <div className="h-4 w-11/12 rounded bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="h-12 w-44 rounded-xl bg-gray-300" />
              <div className="h-12 w-48 rounded-xl bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-4 rounded-xl bg-white space-y-3">
                  <div className="h-7 w-24 rounded bg-gray-200" />
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-3 w-2/3 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Hero Dashboard Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="h-64 rounded-2xl bg-gray-200" />
            <div className="rounded-2xl bg-white p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="p-3 rounded-lg bg-gray-100 space-y-3">
                    <div className="h-3 w-full rounded bg-gray-200" />
                    <div className="h-5 w-3/4 rounded bg-gray-300" />
                    <div className="h-3 w-2/3 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
              <div className="h-28 rounded-xl bg-gray-100" />
              <div className="h-16 rounded-lg bg-gray-100" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-8">
          <div className="space-y-3">
            <div className="h-4 w-48 rounded bg-gray-200" />
            <div className="h-8 w-full max-w-2xl rounded bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="p-6 rounded-2xl border border-gray-100 space-y-5">
                <div className="h-12 w-12 rounded-xl bg-gray-200" />
                <div className="h-5 w-4/5 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-2/3 rounded bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-8">
          <div className="mx-auto max-w-2xl space-y-3 flex flex-col items-center">
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="h-8 w-full rounded bg-gray-200" />
            <div className="h-4 w-4/5 rounded bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="p-6 rounded-2xl bg-white space-y-5">
                <div className="flex justify-between">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="h-6 w-24 rounded-full bg-gray-200" />
                </div>
                <div className="h-5 w-4/5 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-2/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>

          <div className="h-24 rounded-2xl bg-gray-200" />
        </div>
      </section>

      {/* Marketplace Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-8">
          <div className="space-y-3">
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="h-8 w-full max-w-xl rounded bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="p-4 rounded-2xl border border-gray-100 space-y-4">
                <div className="h-40 rounded-xl bg-gray-200" />
                <div className="h-5 w-4/5 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-3/4 rounded bg-gray-200" />
                <div className="pt-2 flex justify-between">
                  <div className="h-3 w-2/3 rounded bg-gray-200" />
                  <div className="h-4 w-4 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller Spotlight */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-8 rounded-3xl bg-white space-y-6">
            <div className="flex justify-between gap-4">
              <div className="h-7 w-44 rounded-full bg-gray-200" />
              <div className="h-4 w-28 rounded bg-gray-200" />
            </div>
            <div className="h-5 w-full rounded bg-gray-200" />
            <div className="h-5 w-full rounded bg-gray-200" />
            <div className="h-5 w-4/5 rounded bg-gray-200" />

            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-gray-100">
              {[1, 2, 3].map((item) => (
                <div key={item} className="space-y-3">
                  <div className="h-6 w-16 rounded bg-gray-200" />
                  <div className="h-3 w-full rounded bg-gray-200" />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-48 rounded bg-gray-200" />
                <div className="h-3 w-full max-w-sm rounded bg-gray-200" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="h-64 rounded-3xl bg-gray-200" />
            <div className="h-32 rounded-3xl bg-white border border-gray-100" />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto p-8 lg:p-14 rounded-3xl bg-gray-200 space-y-6">
          <div className="h-7 w-64 rounded-full bg-gray-300" />
          <div className="h-10 w-full max-w-2xl rounded bg-gray-300" />
          <div className="h-5 w-full max-w-xl rounded bg-gray-300" />
          <div className="h-5 w-4/5 max-w-lg rounded bg-gray-300" />
          <div className="flex flex-col sm:flex-row gap-4 pt-3">
            <div className="h-12 flex-1 max-w-md rounded-xl bg-white" />
            <div className="h-12 w-48 rounded-xl bg-gray-300" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 w-48 rounded bg-gray-200" />
            <div className="h-4 w-full max-w-sm rounded bg-gray-200" />
            <div className="h-4 w-4/5 max-w-sm rounded bg-gray-200" />
            <div className="h-6 w-48 rounded-full bg-gray-200" />
          </div>

          {[1, 2, 3].map((col) => (
            <div key={col} className="space-y-4">
              <div className="h-5 w-28 rounded bg-gray-200" />
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-3 w-full max-w-36 rounded bg-gray-200" />
              ))}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
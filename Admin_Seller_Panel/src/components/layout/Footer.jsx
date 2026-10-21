// src/components/layout/Footer.jsx

const footerCols = [
  [
    "Marketplace",
    [
      "Certified Seeds & Hybrids",
      "Bio-Fertilizers & Nutrients",
      "Crop Protection & Sprayers",
      "Smart Farm Implements",
      "Solar Water Pumps & Drip",
    ],
  ],
  [
    "Sellers & FPOs",
    [
      "Register as Supplier",
      "FPO Wholesale Aggregate",
      "Seller Portal Access",
      "Logistics Network",
      "Payout Guarantees",
    ],
  ],
  [
    "Institutional",
    [
      "Privacy & Data Ethics",
      "Mandi Fair Trade Terms",
      "Agronomic Certification",
      "Administrative Portal",
    ],
  ],
];

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low mt-space-3xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-space-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl">
        <div className="lg:col-span-2 flex flex-col gap-space-sm">
          <div className="flex items-center">
            <img
              src="/dashboard_icon.png"
              alt="Krishi Sathi AI"
              className="w-10 h-10 object-contain"
            />
            <span className="ml-2 text-[18px] leading-5 font-extrabold text-[#14532D]">
              Krishi Sathi AI
            </span>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
            Empowering Indian agriculture through precision intelligence,
            unified Mandi connections, and institutional direct-to-farm supply
            chain transparency.
          </p>

          <div className="pt-space-xs flex items-center gap-space-sm">
            <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              Live APMC Mandi Connected
            </span>
          </div>
        </div>

        {footerCols.map(([title, links]) => (
          <div key={title} className="flex flex-col gap-space-xs">
            <span className="font-title-sm text-title-sm text-on-surface uppercase tracking-wider mb-space-xs">
              {title}
            </span>

            {links.map((link) => (
              <a
                key={link}
                href="#"
                className={`font-body-sm text-body-sm hover:text-on-surface transition-colors ${
                  link === "Administrative Portal"
                    ? "text-outline"
                    : "text-on-surface-variant"
                }`}
              >
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-surface-container py-space-md">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
          <span>
            © 2025 Krishi Sathi AI Technologies Pvt. Ltd. All rights reserved.
          </span>
          <span>
            Dedicated to sustainable Indian farm prosperity and transparent
            rural commerce.
          </span>
        </div>
      </div>
    </footer>
  );
}
import React, { useState } from "react";

const G = "https://lh3.googleusercontent.com/aida-public/";

const Icon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const navLinks = [
  { label: "Home", href: "#" },
  { label: "How It Works", href: "#how-it-works-section" },
  { label: "Marketplace Categories", href: "#categories-section" },
];

const heroStats = [
  ["25,000+", "Verified Farmers Connected", "text-primary", ""],
  ["99.4%", "On-Time Payout Guarantee", "text-secondary", ""],
  ["14+", "States Active Dispatch", "text-primary", "col-span-2 sm:col-span-1"],
];

const telemetry = [
  ["Soil Moisture", "34.2%", "Optimal Range"],
  ["NPK Ratio", "4:2:1", "Balanced Index"],
  ["Canopy Temp", "24.5°C", "Normal"],
];

const benefits = [
  ["group_add", "Reach More Farmers", "Direct digital access to over 25,000+ certified progressive growers and active FPO bulk procurement clusters across 14 states.", "Regional GPS Pinpointing"],
  ["inventory_2", "Manage Products Easily", "Intelligent agricultural cataloging with dynamic batch pricing, seasonal discounts, and automated unit-of-measure bulk sync.", "Automated Barcode & SKU"],
  ["local_shipping", "Track Orders in One Place", "Integrated rural freight partner pickups, pin-code level dispatch tracking, and automated farmer delivery alerts.", "Last-Mile Telematics"],
  ["account_balance_wallet", "Transparent Earnings", "No hidden commissions. Weekly automatic direct bank transfers via IMPS/NEFT, accompanied by GST-compliant invoices.", "Every Tuesday Settlements"],
];

const steps = [
  ["1", "bg-primary", "5 Mins KYC", "bg-secondary-container text-on-secondary-container", "Register Your Shop", "Enter your business name, mobile number with OTP verification, and basic location details.", "shield", "Aadhaar & GSTIN Protected", "text-outline"],
  ["2", "bg-primary-container", "< 24h Review", "bg-surface-container-high text-on-surface", "Verification & Licensing", "Upload Fertilizer License, Seed Dealer Certificate, or Pesticide Authorization for instant admin audit.", "rule", "Dept. of Agriculture Approved", "text-outline"],
  ["3", "bg-primary-container", "Bulk Upload", "bg-surface-container-high text-on-surface", "List Agri Catalog", "Upload SKU inventory using flexible pack units (500g, 5kg, 50kg bags, or drum barrels) with customized regional pricing.", "auto_awesome", "AI Catalog Assist Pre-fills Data", "text-outline"],
  ["4", "bg-secondary", "Direct Payout", "bg-primary-fixed text-on-primary-fixed-variant", "Fulfill Orders & Scale", "Accept verified farmer bookings, hand parcel over to our doorstep rural pickup fleet, and watch revenue deposit automatically.", "check_circle", "Next-Day Payout Eligible", "text-secondary font-semibold"],
];

const categories = [
  [G + "AB6AXuBPXVqj0B8Ten5p4jPEB4q7JGMqbwGWUDXa92ez3id3QSgZSP0u6gn0otL2wHjB2s8W9eMGov3UxU4Ouy_xdt0dUvcaT4n43sclSrRBrHwZXgpg79SSAdhw2IRffnnzaC6LsUzAlFASf-5oyftI_AvqqdoBBG6J0ars4sdLkOH3xz_lwp9ys1dI1c9_VMbqHAa6tYQpp8M7Ypa4qXfMEphrQu47kLBv_p7BGIvKYVqHb6jPtfVrl2d2", "1,240+ varieties", "Hybrid & Certified Seeds", "High germination rates, drought-resistant & high-yield cultivars.", "Top Sold: PBW-824 Wheat"],
  [G + "AB6AXuCpXQanP0_9Uf9b1DZrd6YukE0gQqU1PY8QzVRAVySuX9WvJNq6FnNRgDbcvPGMilBlYOkJzi0v4xsJL-ntAwKf_b8oDa9qLoCovgJGtGppWPRvb1cUW6aHSa2tBSVBEcKahvslppR4fNzmI2OGYD4X3UGSCYSJh0WRcGGNeqrMDQi-JnM1chg3RGhxeGe30pys4IJQCcxfDijfYg0zJF0fELoEXry8S6y9y9vFi9uJMORnT__FrTuK", "850+ items", "Organic Fertilizers & Nutrients", "Bio-NPK, humic acid, micronutrient mixtures, and vermicompost.", "Top Sold: Liquid Potash"],
  [G + "AB6AXuCQlGd1de2tX4o2rL2at9-cJOsO3l5NjWLH24IQ2wmAPeyYPp2FxgMFpAxqfqPT3fmRAmLq5eOjNBikzo7YgQM19swS20h9OEFR7sVJgbP7q0DKM_MBmf_bg_um_p8EnOQHhM4EOXaEA_VjwWYcQxhFK3ePTPAl8ncHr_GfLLSANr3VvAgY0bnevgGu0_7ITRHd2Jftq1hwOvSReM3psI6emW3YmrqqPZXlXvx9D7hYDm627v5laKHy", "620+ solutions", "Bio-Crop Protection", "Pest defense, bio-fungicides, and eco-certified botanical sprays.", "Top Sold: Trichoderma Bio"],
  [G + "AB6AXuA6VzNj4ozbm-59-daKLXAIu7rbRe72Nu6e5Yoo4Rq0sN0jz6W1FQ7CL-6EATFxWwT3T55rpeoc3pg5O_o6qP0kcrwEGmSsaB0IK3IV2SuLWkFdAaEHXtTOv3s4FEebRNerLfMGdP2u5_yMwo6mvPJcDapjGd1SfR4EB9bKer5z3Ujp69n1bWG3Qq7xoh8gSRU-JbIuHXHNxmPKjKICfEIj8r_m_e0PTjeK9cN9ndf2H3ny3w0q8NnQ", "310+ implements", "Power Tools & Equipment", "Battery sprayers, rotavator blades, and smart seed drills.", "Top Sold: 18L Lithium Sprayer"],
  [G + "AB6AXuC3KSWjRQc5AjaeMh836otGci8oJgJfMppKQwkuuwSf4aZ3H-UxcGrBGZYDgCgPQwKiKAWUhMoOuPRH4FyzuilaG2clCwRzQQCvQgmiOKqbyRdpZUb0pMuDJ_8cNAE_1wZWUTmRChH00Ejp40JCMIS3jTTB4768NZGPcuqhM1jpHbcYVg2JYcH7x1bxXIJ7fwLvg5vlpdMrN8uTO8_wFqytsNVT_wzsV1wTI9yn_4DEr_LQ1e4m5gS8", "490+ parts", "Drip & Micro Irrigation", "Pressure compensating drippers, venturi injectors, and drip tubes.", "Top Sold: 16mm Inline Lateral"],
  [G + "AB6AXuAe2i8VZOWsKlT25zIuS08npQI6KXYscm6ZlQpp6ogb3CqOm1yF8WUgl6k9tj7CHV3w2VFvKIsQDlPXs9HaHeOfGUT8Q0QDMEKmVFpslsvWUe8GFbbt-UcjTNQdIgXOzOAwjuS0uKHrob_J3qotLkliEhNNmVWoS0reKQeXnjBGHES1pG_qCGOQzt_XC8zubHfWfs0CCQWsm902Vx2DYPe611NYIA7t15Vqs7sEfebUciDcovSNMODM", "540+ inputs", "Plant Care & Growth Tonics", "Bio-stimulants, amino formulations, and flowering activators.", "Top Sold: Seaweed Booster 1L"],
  [G + "AB6AXuDLjQflS_hT5WAX1JNU_NFUIXNyOdCH9GG9MECPGHMsg8YONBQrJR5mBQsGBX0HXeiiyAguT9YXlG3f90gxH5Ykx5HO9U74bY_Z8V-z1F2vV0ZnLH6x11LynhKj_VzJwc-MnNsoF7NX1TW-ZCaLq9lpm03hV890QYA3CK6iiytbQn8bPYvk9q26XOszZDtvvIMxu_3vlfliAq1MkDvaFmNvXFw_z0wkvc31J8ooebGiIzIQqXoDRAG2", "280+ supplies", "Dairy & Animal Husbandry", "Chelated mineral mixtures, bypass proteins, and silage inoculants.", "Top Sold: Milk Booster 5kg"],
  [G + "AB6AXuBu-a4W9pSVflHNeAA5NOuQg8-_KUb8FUFiMZ-688K6uta0lnyH6IqnCh8hZbIdVTc9a9NGyl5u295l9PmENLBuM09nCo3Ct-QXFwowVcZDpezjOowB1zUVOkmCZStFeuLcaOy4XA1yaz6M729x_wd4cBPo3g3O9O-wm52dioVoKYcwGJOKYC0Lh1uRvGX76BiIW9u-f5CkIqNJgR1BhEyTjgbPfUgr5FTqb2Mm4QpmJuEIvs-2DCie", "710+ products", "Certified Organic Inputs", "Jaivik Bharat & NPOP-compliant certified input catalog for exporters.", "Top Sold: Panchagavya Concentrates"],
];

const footerCols = [
  ["Marketplace", ["Certified Seeds & Hybrids", "Bio-Fertilizers & Nutrients", "Crop Protection & Sprayers", "Smart Farm Implements", "Solar Water Pumps & Drip"]],
  ["Sellers & FPOs", ["Register as Supplier", "FPO Wholesale Aggregate", "Seller Portal Access", "Logistics Network", "Payout Guarantees"]],
  ["Institutional", ["Privacy & Data Ethics", "Mandi Fair Trade Terms", "Agronomic Certification", "Administrative Portal"]],
];

const Header = () => {
  const [active, setActive] = useState("Home");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-space-md">
        {/* Left: logo + brand name */}
        <a href="#" className="flex items-center">
          <img src="/dashboard_icon.png" alt="Krishi Sathi AI" className="w-10 h-10 object-contain" />
          <span className="ml-2 text-[18px] leading-5 font-extrabold text-[#14532D]">Krishi Sathi AI</span>
        </a>

        {/* Center: nav with underline effect */}
        <nav className="hidden xl:flex items-center gap-10">
          {navLinks.map((l) => {
            const isActive = active === l.label;
            return (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setActive(l.label)}
                aria-current={isActive ? "page" : undefined}
                className={`group relative py-2 font-label-lg text-label-lg transition-colors ${
                  isActive ? "text-primary font-semibold" : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {l.label}
                <span
                  className={`absolute left-0 -bottom-0.5 h-0.5 w-full origin-left rounded-full bg-secondary transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        {/* Right: buttons */}
        <div className="flex items-center gap-space-sm">
          <a className="hidden sm:inline-flex items-center justify-center font-label-lg text-label-lg px-space-md py-space-xs rounded-lg text-on-surface hover:bg-surface-container-high transition-colors" href="#">
            Seller Login
          </a>
          <a className="inline-flex items-center justify-center font-label-lg text-label-lg px-space-md py-space-xs rounded-lg bg-primary text-on-primary hover:bg-primary-container shadow-[0_1px_3px_rgba(31,41,55,0.05)] transition-all" href="#">
            Become a Seller
          </a>
        </div>
      </div>
    </header>
  );
};

const Hero = () => (
  <section className="relative w-full pt-space-sm pb-space-xl lg:pt-space-md lg:pb-space-3xl overflow-hidden bg-gradient-to-b from-surface via-surface-container-low to-surface">
    <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-primary-fixed/40 blur-3xl pointer-events-none" />
    <div className="absolute top-1/2 right-0 w-[32rem] h-[32rem] rounded-full bg-secondary-container/30 blur-3xl pointer-events-none" />
    <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl lg:gap-space-2xl items-center">
        {/* Left column: aligned to the top */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          
          <div className="flex flex-col gap-space-xs">
            <h1 className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">
              Grow Your Agricultural Business with{" "}
              <span className="text-secondary underline decoration-secondary-container decoration-4 underline-offset-8">Krishi Sathi AI</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-space-xs">
              Bring your agricultural products online, reach more farmers, manage orders effortlessly, and grow your business with one powerful marketplace built specifically for rural India's verified agritech distribution.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
            <a className="inline-flex items-center justify-center gap-space-xs px-space-xl py-3.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5" href="#">
              <span>Become a Seller</span>
              <Icon name="arrow_forward" className="text-lg" />
            </a>
            <a className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg hover:bg-surface-container transition-all duration-200 shadow-sm" href="#how-it-works-section">
              <Icon name="play_circle" className="text-lg text-secondary" />
              <span>Explore How It Works</span>
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-md pt-space-md">
            {heroStats.map(([v, l, c, x]) => (
              <div key={l} className={`${x} p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col`}>
                <span className={`font-headline-sm text-headline-sm ${c} font-bold`}>{v}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 relative">
          <div className="rounded-2xl overflow-hidden bg-surface-container-lowest shadow-xl flex flex-col">
            <div className="relative h-64 w-full">
              <img className="w-full h-full object-cover" alt="Lush green farm in Punjab at golden hour with precision irrigation" src={G + "AB6AXuAtvvj0ZRBr8dpXeAn2yg-LTIl6zcznA3whKs5UboBeKSI8kTBdNP_WKH3rJ-qxjyThQ2Dbo30Z1xbH_3ahs760RPdFG6IFEDk-3XoU8QEQDV6cyAX66z6IH8c3_Vy9XEQnG4g-lFoXjjwh800erjXfo-6iDqmZ8C_11OTuSuJPDWph2NywUxZBlq4EnzOOzU8Aczs0SCXzxFKRaTcdiRdIvUmpAFwHP6R4xTCQ9vgS5k5AnMpUemjZ"} />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
              <div className="absolute top-4 left-4 inline-flex items-center gap-space-2xs bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-primary font-label-sm text-label-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                <span>Plot #PB-LUD-402 • IoT Telemetry Active</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-on-primary">
                <div>
                  <p className="font-label-sm text-label-sm opacity-90">Kharif Yield Forecast</p>
                  <p className="font-title-md text-title-md font-bold">4.8 MT / Hectare (+18.4%)</p>
                </div>
                <span className="px-space-xs py-1 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">A+ Grade</span>
              </div>
            </div>
            <div className="p-space-lg flex flex-col gap-space-md bg-surface-container-lowest">
              <div className="grid grid-cols-3 gap-space-sm">
                {telemetry.map(([l, v, n]) => (
                  <div key={l} className="bg-surface-container-low p-space-sm rounded-lg flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{l}</span>
                    <span className="font-title-md text-title-md font-bold text-primary">{v}</span>
                    <span className="text-[10px] text-secondary font-medium mt-0.5">{n}</span>
                  </div>
                ))}
              </div>
              <div className="bg-surface-container p-space-sm rounded-xl">
                <div className="flex items-center justify-between mb-space-xs">
                  <span className="font-title-sm text-title-sm text-on-surface font-semibold">Weekly Seller Demand Index</span>
                  <span className="font-label-sm text-label-sm text-secondary font-bold">+32% MoM</span>
                </div>
                <div className="h-16 w-full flex items-end">
                  <svg className="w-full h-full text-secondary fill-none" preserveAspectRatio="none" viewBox="0 0 320 60">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#1b6d24" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#1b6d24" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,45 C40,48 70,30 110,34 C150,38 180,18 220,22 C260,26 290,8 320,5 L320,60 L0,60 Z" fill="url(#chartGradient)" />
                    <path d="M0,45 C40,48 70,30 110,34 C150,38 180,18 220,22 C260,26 290,8 320,5" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
                    <circle className="fill-primary" cx="320" cy="5" r="4" />
                  </svg>
                </div>
                <div className="flex justify-between text-[11px] text-on-surface-variant pt-1 font-mono">
                  <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun (Peak: 890 orders)</span>
                </div>
              </div>
              <div className="flex items-center gap-space-sm p-space-sm rounded-lg bg-primary-fixed/50">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-sm">
                  <Icon name="shopping_basket" className="text-lg" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-title-sm text-title-sm text-on-surface font-semibold truncate">New Bulk Inquiry from Bhatinda FPO</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">500 Bags of Certified Bio-Potash • Direct Dispatch</p>
                </div>
                <span className="font-label-sm text-label-sm text-primary font-bold shrink-0">Just Now</span>
              </div>
            </div>
          </div>
          <div className="-mt-6 -ml-4 sm:-ml-6 bg-surface-container-lowest p-space-sm rounded-xl shadow-lg inline-flex items-center gap-space-xs z-20 relative">
            <Icon name="verified_user" className="text-secondary text-2xl" />
            <div>
              <p className="font-title-sm text-title-sm text-primary font-bold">100% Authentic Seller Shield</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Zero Counterfeit Product Guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Benefits = () => (
  <section className="w-full py-space-2xl bg-surface">
    <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-space-xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-2xs">
          <span className="font-label-md text-label-md text-secondary uppercase font-bold tracking-wider">Unmatched Growth Advantage</span>
          <h2 className="font-headline-lg text-headline-lg text-primary font-bold">Built for Agricultural Distributors, Manufacturers &amp; FPOs</h2>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md">
          Say goodbye to delayed local payment collections, unorganized agent commissions, and manual order spreadsheets.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
        {benefits.map(([icon, title, text, tag]) => (
          <div key={title} className="group bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div className="flex flex-col gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <Icon name={icon} className="text-2xl" />
              </div>
              <div className="flex flex-col gap-space-xs">
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold">{title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{text}</p>
              </div>
            </div>
            <div className="pt-space-md mt-space-md flex items-center gap-space-xs text-secondary font-label-md text-label-md font-semibold">
              <span>{tag}</span>
              <Icon name="arrow_forward" className="text-base group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section className="w-full py-space-2xl bg-surface-container-low" id="how-it-works-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-space-xl">
      <div className="text-center flex flex-col items-center gap-space-2xs max-w-2xl mx-auto">
        <span className="font-label-md text-label-md text-secondary uppercase font-bold tracking-wider">Simple Onboarding</span>
        <h2 className="font-headline-lg text-headline-lg text-primary font-bold">How Krishi Sathi AI Works for Sellers</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Go from offline local dealer to pan-India agritech supplier in under 24 hours with our streamlined compliance funnel.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md relative">
        {steps.map(([n, nBg, badge, badgeCls, title, text, icon, foot, footCls]) => (
          <div key={n} className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm relative flex flex-col gap-space-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className={`w-10 h-10 rounded-full ${nBg} text-on-primary flex items-center justify-center font-title-md text-title-md font-bold`}>{n}</span>
              <span className={`font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-semibold ${badgeCls}`}>{badge}</span>
            </div>
            <h3 className="font-title-md text-title-md text-primary font-bold mt-space-xs">{title}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{text}</p>
            <div className={`mt-auto pt-space-xs flex items-center gap-1 text-[11px] font-mono ${footCls}`}>
              <Icon name={icon} className="text-xs" />
              <span>{foot}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <Icon name="calculate" className="text-2xl" />
          </div>
          <div>
            <h4 className="font-title-md text-title-md text-primary font-bold">Curious about your revenue potential?</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Average active agritech dealer reports 3.8x sales increase in the first 90 days.</p>
          </div>
        </div>
        <a className="px-space-md py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-lg text-label-lg hover:bg-surface-variant transition-colors shrink-0" href="#">
          Calculate Your Earnings Potential
        </a>
      </div>
    </div>
  </section>
);

const Categories = () => (
  <section className="w-full py-space-2xl bg-surface" id="categories-section">
    <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-space-xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-2xs">
          <span className="font-label-md text-label-md text-secondary uppercase font-bold tracking-wider">Diverse Demand</span>
          <h2 className="font-headline-lg text-headline-lg text-primary font-bold">High-Converting Marketplace Categories</h2>
        </div>
        <a className="inline-flex items-center gap-space-2xs text-secondary font-label-lg text-label-lg font-semibold hover:underline" href="#">
          <span>View All 3,200+ Active SKUs</span>
          <Icon name="arrow_outward" className="text-lg" />
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        {categories.map(([img, count, title, text, top]) => (
          <div key={title} className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
            <div className="relative h-40 rounded-xl overflow-hidden mb-space-sm">
              <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={title} src={img} />
              <div className="absolute top-3 right-3 bg-surface-container-lowest/90 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-bold text-primary font-mono shadow-sm">{count}</div>
            </div>
            <div>
              <h3 className="font-title-md text-title-md text-primary font-bold">{title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{text}</p>
            </div>
            <div className="mt-space-sm pt-space-xs flex items-center justify-between text-secondary font-label-sm text-label-sm">
              <span className="font-semibold">{top}</span>
              <Icon name="north_east" className="text-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Spotlight = () => (
  <section className="w-full py-space-2xl bg-surface-container-high/60">
    <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-space-2xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-xl rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                <Icon name="star" className="text-sm" />
                Verified Seller Spotlight
              </span>
              <span className="font-label-sm text-label-sm text-outline font-mono">Partner since 2023</span>
            </div>
            <blockquote className="font-headline-sm text-headline-sm text-primary font-medium leading-snug">
              “Before Krishi Sathi AI, our seed distribution was restricted to our tehsil radius. In our first Kharif season on the portal, we supplied certified wheat seed to 420+ farmers across 3 neighboring districts with zero payment defaults.”
            </blockquote>
            <div className="grid grid-cols-3 gap-space-sm py-space-xs bg-surface-container-low rounded-xl p-space-sm">
              {[["4.2x", "Annual Revenue Growth", "text-primary"], ["18 Hrs", "Avg Pickup Dispatch", "text-secondary"], ["4.9 / 5", "Farmer Review Score", "text-primary"]].map(([v, l, c]) => (
                <div key={l}>
                  <p className={`font-metric-num text-metric-num ${c} font-bold`}>{v}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-space-md pt-space-md">
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 shadow-sm">
              <img className="w-full h-full object-cover" alt="Gurpreet Singh Gill in front of a seed warehouse in Punjab" src={G + "AB6AXuDH33ttOjsJ3qzvw9oJuSkgkmD8QS7Z74knhwQ1SjpB6lZebVF-hi8eEwcaDu26Me_UjabukimhEy_2HJE0mwWCB6fhgOxh11P1bHw8iVZj1X2Y8sIz5X9lPdYYIZiT-ffXlTQLu6Mn9hbn1xNGEF6iI1r7Dc5WhgmBeARE8bMujT7Be-CZ9dBuC_h7HQmUhwP5PJHycpHwwcTzS2qY7KctZO_gRBWlfiPoqkpORc0QJz1Hepsg2RpP"} />
            </div>
            <div>
              <p className="font-title-md text-title-md text-primary font-bold">Sardar Gurpreet Singh Gill</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Managing Director, Gill Agri-Biotech &amp; Seed Producers • Ludhiana, Punjab</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-primary text-on-primary p-space-lg rounded-3xl shadow-md flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between">
              <Icon name="electric_bolt" className="text-secondary-fixed text-3xl" />
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-semibold">Logistics Fleet</span>
            </div>
            <div className="my-space-sm">
              <h4 className="font-headline-sm text-headline-sm font-bold">Integrated Rural Dispatch Network</h4>
              <p className="font-body-sm text-body-sm opacity-80 mt-1">Our dedicated agrarian carrier network picks up from your shop warehouse and delivers directly to farm gates within 36 hours.</p>
            </div>
            <div className="flex items-center gap-space-sm pt-space-xs">
              <div className="flex-1 bg-surface-container/20 h-2 rounded-full overflow-hidden">
                <div className="bg-secondary-fixed h-full w-[94%]" />
              </div>
              <span className="font-mono text-xs font-bold text-secondary-fixed">94% On-Schedule</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-space-lg rounded-3xl shadow-sm flex items-center gap-space-md">
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <Icon name="phonelink_ring" className="text-3xl" />
            </div>
            <div>
              <h4 className="font-title-md text-title-md text-primary font-bold">Farmer AI Assistant Sync</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Your products are automatically recommended by our multilingual AI agronomy bot whenever farmers diagnose soil deficiencies.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const CTA = () => (
  <section className="w-full py-space-3xl px-6 lg:px-12 bg-surface">
    <div className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary-container to-secondary shadow-2xl p-space-xl lg:p-space-3xl text-on-primary">
      <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-secondary-fixed/20 blur-3xl pointer-events-none" />
      <div className="relative z-10 max-w-3xl flex flex-col gap-space-md">
        <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold w-fit shadow-sm">
          <Icon name="local_fire_department" className="text-sm" />
          <span>Zero Platform Commission for Your First 30 Days</span>
        </div>
        <h2 className="font-headline-xl text-headline-xl font-bold tracking-tight text-on-primary">Ready to Modernize Your Agri-Distribution?</h2>
        <p className="font-body-lg text-body-lg text-on-primary-container max-w-2xl">
          Join India's most dependable agritech network today. Secure immediate access to thousands of progressive farmers, guaranteed payment schedules, and end-to-end logistics support.
        </p>
        <div className="pt-space-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm">
          <div className="flex-1 bg-surface-container-lowest rounded-xl flex items-center px-4 py-1 shadow-inner">
            <span className="text-on-surface-variant font-bold text-sm mr-2">+91</span>
            <input className="w-full h-11 bg-transparent text-on-surface placeholder:text-outline text-body-md focus:outline-none" placeholder="Enter your mobile number to start KYC" type="tel" />
          </div>
          <button className="px-space-xl py-3.5 rounded-xl bg-secondary-container text-on-secondary-container font-label-lg text-label-lg font-bold hover:bg-secondary-fixed transition-colors shadow-md flex items-center justify-center gap-space-2xs" type="button">
            <span>Register Your Shop</span>
            <Icon name="arrow_forward" className="text-lg" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-space-lg pt-space-xs text-on-primary-container font-label-sm text-label-sm">
          {["No upfront listing fees", "Dedicated multilingual dealer support", "Direct IMPS Bank Deposits"].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <Icon name="check_circle" className="text-base" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="w-full bg-surface-container-low mt-space-3xl">
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-space-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl">
      <div className="lg:col-span-2 flex flex-col gap-space-sm">
        <div className="flex items-center">
          <img alt="Krishi Sathi AI" className="w-10 h-10 object-contain" src="/dashboard_icon.png" />
          <span className="ml-2 text-[18px] leading-5 font-extrabold text-[#14532D]">Krishi Sathi AI</span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
          Empowering Indian agriculture through precision intelligence, unified Mandi connections, and institutional direct-to-farm supply chain transparency.
        </p>
        <div className="pt-space-xs flex items-center gap-space-sm">
          <span className="inline-flex items-center gap-space-2xs px-space-sm py-space-2xs rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
            <span className="w-2 h-2 rounded-full bg-secondary" /> Live APMC Mandi Connected
          </span>
        </div>
      </div>
      {footerCols.map(([title, links]) => (
        <div key={title} className="flex flex-col gap-space-xs">
          <span className="font-title-sm text-title-sm text-on-surface uppercase tracking-wider mb-space-xs">{title}</span>
          {links.map((l) => (
            <a key={l} className={`font-body-sm text-body-sm hover:text-on-surface transition-colors ${l === "Administrative Portal" ? "text-outline" : "text-on-surface-variant"}`} href="#">{l}</a>
          ))}
        </div>
      ))}
    </div>
    <div className="bg-surface-container py-space-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
        <span>© 2025 Krishi Sathi AI Technologies Pvt. Ltd. All rights reserved.</span>
        <span>Dedicated to sustainable Indian farm prosperity and transparent rural commerce.</span>
      </div>
    </div>
  </footer>
);

export default function Home() {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased">
      <Header />
      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
          <Hero />
          <Benefits />
          <HowItWorks />
          <Categories />
          <Spotlight />
          <CTA />
        </div>
      </main>
      <Footer />
    </div>
  );
}
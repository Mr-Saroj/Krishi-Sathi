// src/components/layout/Header.jsx
import { useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/#how-it-works-section" },
  { label: "Marketplace Categories", href: "/#categories-section" },
];

export default function Header() {
  const [active, setActive] = useState("Home");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface shadow-[0_8px_20px_rgba(20,83,45,0.12)]">
      <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-space-md">
        <a href="/" className="flex items-center">
          <span className="neu-raised-sm rounded-xl w-12 h-12 flex items-center justify-center">
            <img src="/dashboard_icon.png" alt="Krishi Sathi AI" className="w-8 h-8 object-contain" />
          </span>
          <span className="ml-3 text-[18px] leading-5 font-extrabold text-[#14532D]">Krishi Sathi AI</span>
        </a>

        <nav className="hidden xl:flex items-center gap-4">
          {navLinks.map((link) => {
            const isActive = active === link.label;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActive(link.label)}
                aria-current={isActive ? "page" : undefined}
                className={`px-5 py-2.5 rounded-xl font-label-lg text-label-lg transition-all duration-200 ${
                  isActive
                    ? "neu-inset-sm text-primary font-semibold"
                    : "text-on-surface-variant hover:text-primary hover:neu-raised-sm"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-space-sm">
          <a
            href="/login"
            className="neu-btn hidden sm:inline-flex items-center justify-center font-label-lg text-label-lg px-space-md py-space-xs rounded-xl text-on-surface"
          >
            Seller Login
          </a>
          <a
            href="/register"
            className="neu-btn-primary inline-flex items-center justify-center font-label-lg text-label-lg px-space-md py-space-xs rounded-xl"
          >
            Become a Seller
          </a>
        </div>
      </div>
    </header>
  );
}
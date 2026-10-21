// src/components/layout/Header.jsx

import { useState } from "react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/#how-it-works-section" },
  { label: "Marketplace Categories", href: "/#categories-section" },
];

const Icon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined ${className}`}>
    {name}
  </span>
);

export default function Header() {
  const [active, setActive] = useState("Home");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-space-md">
        <a href="/" className="flex items-center">
          <img
            src="/dashboard_icon.png"
            alt="Krishi Sathi AI"
            className="w-10 h-10 object-contain"
          />
          <span className="ml-2 text-[18px] leading-5 font-extrabold text-[#14532D]">
            Krishi Sathi AI
          </span>
        </a>

        <nav className="hidden xl:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = active === link.label;

            return (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActive(link.label)}
                aria-current={isActive ? "page" : undefined}
                className={`group relative py-2 font-label-lg text-label-lg transition-colors ${
                  isActive
                    ? "text-primary font-semibold"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {link.label}
                <span
                  className={`absolute left-0 -bottom-0.5 h-0.5 w-full origin-left rounded-full bg-secondary transition-transform duration-300 ${
                    isActive
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-space-sm">
          <a
            href="/login"
            className="hidden sm:inline-flex items-center justify-center font-label-lg text-label-lg px-space-md py-space-xs rounded-lg text-on-surface hover:bg-surface-container-high transition-colors"
          >
            Seller Login
          </a>

          <a
            href="/register"
            className="inline-flex items-center justify-center font-label-lg text-label-lg px-space-md py-space-xs rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all"
          >
            Become a Seller
          </a>
        </div>
      </div>
    </header>
  );
}
/**
 * Shared TopNavbar Utility Functions (Neumorphic)
 * @file topNavbarUtils.js
 * Requires the neu-* utilities from index.css.
 */

// ─── String Helpers ───────────────────────────────────────────────────────────

export const getInitials = (name, fallback = '?') => {
  if (!name || typeof name !== 'string') return fallback;
  const trimmed = name.trim();
  if (!trimmed) return fallback;
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getFirstName = (name, fallback = 'Guest') => {
  if (!name || typeof name !== 'string') return fallback;
  const first = name.trim().split(/\s+/)[0];
  return first || fallback;
};

export const getGreetingText = (firstName) => {
  return `Welcome back, ${firstName}`;
};

// ─── Class Name Builders ──────────────────────────────────────────────────────

export const getHeaderClasses = () => {
  return 'sticky top-0 z-30 h-20 bg-surface shadow-[0_6px_16px_var(--neu-dark)] flex items-center justify-between px-4 md:px-6 lg:px-8 transition-all duration-300';
};

export const getHamburgerButtonClasses = () => {
  return 'neu-btn p-2.5 rounded-xl text-primary';
};

export const getHamburgerIconClasses = (isOpen) => {
  return `material-symbols-outlined text-[22px] transition-transform duration-300 ${
    !isOpen ? 'rotate-180' : ''
  }`;
};

export const getSearchContainerClasses = () => {
  return 'neu-inset hidden xl:flex items-center rounded-xl px-4 py-2.5 w-64';
};

export const getActionButtonClasses = () => {
  return 'neu-btn relative p-2.5 rounded-xl text-on-surface-variant hover:text-primary';
};

export const getAvatarClasses = () =>
  'neu-btn-primary flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm cursor-pointer select-none';
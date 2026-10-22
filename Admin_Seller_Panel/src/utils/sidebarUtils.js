// src/utils/sidebarUtils.js
// Neumorphic version. Requires the neu-* utilities from index.css.

// ─── Breakpoints ─────────────────────────────────────────────────────────

export const DESKTOP_BREAKPOINT = 1024;

// ─── Viewport Helper ──────────────────────────────────────────────────────

export const isMobileView = (breakpoint = DESKTOP_BREAKPOINT) => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoint;
};

// ─── Class Name Builders ─────────────────────────────────────────────────

// Dark overlay behind the sidebar on mobile
export const getBackdropClasses = (isOpen) => {
  return `fixed inset-0 bg-primary/30 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 ${
    isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
  }`;
};

// Sidebar shell (same fixed + slide behaviour as before)
export const getSidebarContainerClasses = (isOpen) => {
  return `fixed left-0 top-0 h-screen bg-surface flex flex-col z-50 transition-all duration-300 ease-in-out ${
    isOpen
      ? 'translate-x-0 w-72 shadow-[8px_0_20px_var(--neu-dark)]'
      : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden shadow-none'
  }`;
};

// ─── Main Navigation ─────────────────────────────────────────────────────

// Pressed-in when active, raised on hover
export const getNavLinkClasses = (isActive) => {
  return `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
    isActive
      ? 'neu-inset-sm text-primary font-semibold'
      : 'text-on-surface-variant hover:neu-raised-sm hover:text-primary'
  }`;
};

export const getActiveIndicatorClasses = () => {
  return 'absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary rounded-full';
};

export const getIconClasses = (isActive) => {
  return `material-symbols-outlined text-[22px] transition-all duration-200 group-hover:scale-110 ${
    isActive ? 'text-secondary' : 'text-outline group-hover:text-secondary'
  }`;
};

// ─── Badges ──────────────────────────────────────────────────────────────

export const getBadgeClasses = () => {
  return 'bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[2px_2px_5px_var(--neu-dark)]';
};

// ─── Bottom Navigation ────────────────────────────────────────────────────

export const getBottomLinkClasses = (isDanger = false) => {
  // Logout / danger: always a raised red button so it stands out
  if (isDanger) {
    return 'neu-btn flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-error group';
  }

  // Normal links (Help Center, Settings...): flat, raise on hover
  return 'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:neu-raised-sm hover:text-primary active:neu-inset-sm transition-all duration-200 group';
};

// ─── Close Button ────────────────────────────────────────────────────────

export const getCloseButtonClasses = () => {
  return 'neu-btn lg:hidden w-10 h-10 shrink-0 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary group';
};

 // ─── Breakpoints ─────────────────────────────────────────────────────────

export const DESKTOP_BREAKPOINT = 1024;

// ─── Viewport Helper ──────────────────────────────────────────────────────

export const isMobileView = (breakpoint = DESKTOP_BREAKPOINT) => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoint;
};

// ─── Theme Colors ────────────────────────────────────────────────────────

const BRAND_GREEN = '#14532D';
const LEAF_GREEN = '#2E7D32';

// ─── Class Name Builders ─────────────────────────────────────────────────

export const getBackdropClasses = (isOpen) => {
  return `fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 ${
    isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
  }`;
};

export const getSidebarContainerClasses = (isOpen) => {
  return `fixed left-0 top-0 h-screen bg-white border-r border-slate-100 flex flex-col z-50 transition-all duration-300 ease-in-out shadow-[4px_0_30px_-10px_rgba(20,83,45,0.10)] ${
    isOpen
      ? 'translate-x-0 w-72'
      : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-r-0 lg:shadow-none'
  }`;
};

// ─── Main Navigation ─────────────────────────────────────────────────────

export const getNavLinkClasses = (isActive) => {
  return `w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
    isActive
      ? 'bg-[#14532D]/10 text-[#14532D] font-semibold'
      : 'text-slate-500 hover:bg-[#2E7D32]/10 hover:text-[#14532D]'
  }`;
};

export const getActiveIndicatorClasses = () => {
  return 'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#2E7D32] rounded-r-full';
};

export const getIconClasses = (isActive) => {
  return `material-symbols-outlined text-[22px] transition-all duration-200 group-hover:scale-110 ${
    isActive ? 'text-[#14532D]' : 'text-slate-400 group-hover:text-[#2E7D32]'
  }`;
};

// ─── Badges ──────────────────────────────────────────────────────────────

export const getBadgeClasses = () => {
  return 'bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm';
};

// ─── Bottom Navigation ────────────────────────────────────────────────────

export const getBottomLinkClasses = (isDanger = false) => {
  if (isDanger) {
    return 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group';
  }

  return 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-500 hover:bg-[#2E7D32]/10 hover:text-[#14532D] transition-all duration-200 group';
};

// ─── Close Button ────────────────────────────────────────────────────────

export const getCloseButtonClasses = () => {
  return 'lg:hidden p-2 rounded-xl text-slate-400 hover:text-[#14532D] hover:bg-[#2E7D32]/10 transition-all duration-200 group';
};

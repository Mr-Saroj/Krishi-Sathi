
import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';

import {
  getBackdropClasses,
  getSidebarContainerClasses,
  getNavLinkClasses,
  getActiveIndicatorClasses,
  getIconClasses,
  getBadgeClasses,
  getBottomLinkClasses,
  getCloseButtonClasses,
  isMobileView,
  DESKTOP_BREAKPOINT,
} from '../../utils/sidebarUtils';

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  navLinks = [],
  bottomLinks = [],
  dashboardLabel,
}) => {
  const handleMobileClose = useCallback(() => {
    if (isMobileView(DESKTOP_BREAKPOINT)) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={getBackdropClasses(sidebarOpen)}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Container */}
      <aside className={getSidebarContainerClasses(sidebarOpen)}>
        <div className="flex h-full w-72 min-w-[18rem] flex-col overflow-hidden">

          {/* Logo, Brand Name and Close Button */}
          <div className="flex h-20 shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4">
            <NavLink
              to="/"
              end
              onClick={handleMobileClose}
              className="flex min-w-0 items-center"
              aria-label="Krishi Sathi AI home"
            >
              <img
                src="/dashboard_icon.png"
                alt="Krishi Sathi AI"
                className="h-10 w-10 shrink-0 object-contain"
              />

              <span className="ml-2 text-[18px] leading-5 font-extrabold text-[#14532D]">
                Krishi Sathi AI
              </span>
            </NavLink>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className={getCloseButtonClasses()}
              aria-label="Close sidebar"
            >
              <span className="material-symbols-outlined text-[22px] transition-transform duration-200 group-hover:rotate-90">
                close
              </span>
            </button>
          </div>

          {/* Dashboard Label */}
          <p className="shrink-0 px-6 pb-1 pt-4 text-xs font-medium tracking-wide text-slate-400">
            {dashboardLabel}
          </p>

          {/* Main Navigation - Independently Scrollable */}
          <nav className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                onClick={handleMobileClose}
                className={({ isActive }) =>
                  getNavLinkClasses(isActive)
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className={getActiveIndicatorClasses()} />
                    )}

                    <span className={getIconClasses(isActive)}>
                      {link.icon}
                    </span>

                    <span className="flex-1 text-left">
                      {link.label}
                    </span>

                    {/* Dynamic Count Badge */}
                    {link.showBadge && link.badgeCount > 0 && (
                      <span className={getBadgeClasses()}>
                        {link.badgeCount}
                      </span>
                    )}

                    {/* Static Badge */}
                    {link.badge && (
                      <span className={getBadgeClasses()}>
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Navigation - Always Visible */}
          <div className="shrink-0 space-y-1 border-t border-slate-100 bg-white p-4">
            {bottomLinks.map((link) => {
              const content = (
                <>
                  <span className="material-symbols-outlined text-[22px] transition-transform group-hover:scale-110">
                    {link.icon}
                  </span>

                  <span>{link.label}</span>
                </>
              );

              // Logout Button
              if (link.action === 'logout') {
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => {
                      link.onClick?.();
                      handleMobileClose();
                    }}
                    className={`flex w-full items-center gap-3 ${getBottomLinkClasses(
                      link.isDanger
                    )}`}
                  >
                    {content}
                  </button>
                );
              }

              // Other Bottom Links
              return (
                <NavLink
                  key={link.label}
                  to={link.to || '/'}
                  onClick={() => {
                    link.onClick?.();
                    handleMobileClose();
                  }}
                  className={getBottomLinkClasses(link.isDanger)}
                >
                  {content}
                </NavLink>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

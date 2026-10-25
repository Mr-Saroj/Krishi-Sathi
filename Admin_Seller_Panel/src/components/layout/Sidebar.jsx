
 // src/components/layout/Sidebar.jsx
import React, { useCallback, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import api from '../../services/api';

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
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleMobileClose = useCallback(() => {
    if (isMobileView(DESKTOP_BREAKPOINT)) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]);

  const handleLogout = async (link) => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      // Ask Spring Boot to clear the HttpOnly accessToken cookie.
      await api.post('/auth/logout');

      // Run any optional callback supplied by the parent.
      link.onClick?.();

      // Close the sidebar on mobile.
      handleMobileClose();

      // Navigate to login after successful logout.
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);

      // Do not claim logout succeeded if the server did not clear
      // the cookie. Keep the user on the current page.
      window.alert(
        'Unable to log out because the server could not be reached. Please try again.'
      );
    } finally {
      setLoggingOut(false);
    }
  };

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
          <div className="flex h-20 shrink-0 items-center justify-between gap-2 px-4">
            <NavLink
              to="/"
              end
              onClick={handleMobileClose}
              className="flex min-w-0 items-center"
              aria-label="Krishi Sathi AI home"
            >
              <span className="neu-raised-sm flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <img
                  src="/dashboard_icon.png"
                  alt="Krishi Sathi AI"
                  className="h-8 w-8 object-contain"
                />
              </span>

              <span className="ml-3 text-[18px] leading-5 font-extrabold text-[#14532D]">
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
          <p className="shrink-0 px-6 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-secondary">
            {dashboardLabel}
          </p>

          {/* Main Navigation */}
          <nav className="mt-2 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-5">
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

          {/* Bottom Navigation */}
          <div className="shrink-0 space-y-2 border-t border-primary/10 bg-surface p-4">
            {bottomLinks.map((link) => {
              const content = (
                <>
                  <span className="material-symbols-outlined text-[22px] transition-transform group-hover:scale-110">
                    {link.icon}
                  </span>

                  <span>
                    {link.action === 'logout' && loggingOut
                      ? 'Logging out...'
                      : link.label}
                  </span>
                </>
              );

              // Logout Button
              if (link.action === 'logout') {
                return (
                  <button
                    key={link.label}
                    type="button"
                    disabled={loggingOut}
                    onClick={() => handleLogout(link)}
                    className={`flex w-full items-center gap-3 ${getBottomLinkClasses(
                      link.isDanger !== false
                    )} disabled:cursor-not-allowed disabled:opacity-60`}
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

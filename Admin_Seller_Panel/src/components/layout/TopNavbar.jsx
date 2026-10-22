// src/components/layout/TopNavbar.jsx
import React from 'react';

import {
  getHeaderClasses,
  getHamburgerButtonClasses,
  getHamburgerIconClasses,
  getSearchContainerClasses,
  getActionButtonClasses,
  getAvatarClasses,
} from '../../utils/topNavbarUtils';

import useTopNavbar from '../../hooks/useTopNavbar';

const TopNavbar = ({
  sidebarOpen,
  setSidebarOpen,
  subtitle,
  actionButton,
  userName = '', // optional: pass the logged-in user's name
}) => {
  const { initials, avatarTitle, greeting, toggleSidebar } = useTopNavbar(
    sidebarOpen,
    setSidebarOpen,
    userName
  );

  return (
    <header className={getHeaderClasses()}>
      {/* Left: Hamburger + Greeting */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={toggleSidebar}
          className={getHamburgerButtonClasses()}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className={getHamburgerIconClasses(sidebarOpen)}>menu_open</span>
        </button>

        <div className="hidden sm:block">
          <h1 className="text-lg font-bold text-primary lg:text-xl">
            {greeting}
          </h1>

          {subtitle && (
            <p className="hidden text-sm text-on-surface-variant lg:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search */}
        <div className={getSearchContainerClasses()}>
          <span className="material-symbols-outlined mr-2 text-[20px] text-outline">
            search
          </span>

          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-outline"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          className={getActionButtonClasses()}
          title="Notifications"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[22px]">
            notifications
          </span>
        </button>

        {/* Optional Action Button */}
        {actionButton}

        {/* Avatar */}
        <div title={avatarTitle} className={getAvatarClasses()}>
          {initials}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
import { useMemo, useCallback } from 'react';

import {
  getInitials,
  getFirstName,
  getGreetingText,
} from '../utils/topNavbarUtils';

/**
 * Reusable hook for TopNavbar state and logic
 * @param {boolean} sidebarOpen - Current sidebar state
 * @param {function} setSidebarOpen - Setter from parent
 * @param {string} userName - Optional user name
 */
const useTopNavbar = (sidebarOpen, setSidebarOpen, userName = '') => {
  const firstName = useMemo(
    () => getFirstName(userName),
    [userName]
  );

  const initials = useMemo(
    () => getInitials(userName),
    [userName]
  );

  const avatarTitle = useMemo(
    () => userName || 'Guest',
    [userName]
  );

  const greeting = useMemo(
    () => getGreetingText(firstName),
    [firstName]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, [setSidebarOpen]);

  return {
    firstName,
    initials,
    avatarTitle,
    greeting,
    toggleSidebar,
  };
};

export default useTopNavbar;
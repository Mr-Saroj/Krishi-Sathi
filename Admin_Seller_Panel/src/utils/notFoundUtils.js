// notFoundUtils.js — helpers for the 404 page

export const ADMIN_PREFIX = '/admin-dashboard';

export const isAdminPath = (pathname) =>
  pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);

// Where to send the user when there is no previous page in history
export const fallbackPath = (pathname) => (isAdminPath(pathname) ? ADMIN_PREFIX : '/');
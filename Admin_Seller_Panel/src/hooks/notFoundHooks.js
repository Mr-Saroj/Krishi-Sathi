// notFoundHooks.js — router-aware state for the 404 page
import { useLocation, useNavigate } from 'react-router-dom';
import { fallbackPath } from '../utils/notFoundUtils';

export const useNotFound = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  // Return to the last page the user was on; if they opened this URL directly
  // (no history), fall back to the dashboard or home.
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallbackPath(pathname), { replace: true });
  };

  return {
    attemptedPath: `${pathname}${search}`,
    goBack,
  };
};
import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * A hook that scrolls the window to the top when the location changes.
 * Use this in the main App component to ensure all page transitions start at the top.
 */
export const useScrollToTop = () => {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);
};
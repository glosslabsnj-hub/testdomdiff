import { useEffect } from "react";

const BASE_TITLE = "Redeemed Strength";

/**
 * Sets the document title for the current page.
 * Automatically resets to base title on unmount.
 */
export function usePageTitle(title?: string) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | ${BASE_TITLE}`;
    } else {
      document.title = `${BASE_TITLE} | Faith-Based Fitness Coaching`;
    }
    return () => {
      document.title = `${BASE_TITLE} | Faith-Based Fitness Coaching`;
    };
  }, [title]);
}

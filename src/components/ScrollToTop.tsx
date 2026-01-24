import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface ScrollToTopProps {
  behavior?: ScrollBehavior;
  delay?: number;
}

const ScrollToTop = ({ 
  behavior = 'smooth', 
  delay = 0 
}: ScrollToTopProps) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: behavior
      });
    };

    if (delay > 0) {
      const timer = setTimeout(scrollToTop, delay);
      return () => clearTimeout(timer);
    } else {
      scrollToTop();
    }
  }, [pathname, behavior, delay]);

  return null;
};

export default ScrollToTop;

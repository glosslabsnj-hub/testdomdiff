import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface KeyboardAwareFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
}

export function KeyboardAwareForm({ children, className, ...props }: KeyboardAwareFormProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Only apply on mobile devices
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    const handleResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const newKeyboardHeight = windowHeight - viewportHeight;
        
        // Only set if keyboard is actually visible (>100px difference)
        if (newKeyboardHeight > 100) {
          setKeyboardHeight(newKeyboardHeight);
        } else {
          setKeyboardHeight(0);
        }
      }
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    window.visualViewport?.addEventListener("scroll", handleResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
    };
  }, []);

  return (
    <form
      ref={formRef}
      className={cn(className)}
      style={{
        paddingBottom: keyboardHeight > 0 ? `${keyboardHeight + 20}px` : undefined,
        transition: "padding-bottom 0.15s ease-out",
      }}
      {...props}
    >
      {children}
    </form>
  );
}

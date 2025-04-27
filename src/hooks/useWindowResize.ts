// src/hooks/useWindowResize.ts
import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Hook that returns the current window dimensions and
 * updates when the window is resized
 */
const useWindowResize = (): WindowSize => {
  // Initialize with current window dimensions
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // Handler to call on window resize
    const handleResize = () => {
      // Update window size
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away to ensure initial size is correct
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures effect runs only on mount and unmount

  return windowSize;
};

export default useWindowResize;

// src/components/Window.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WindowContainer from "./WindowContainer";
import styles from "./Window.module.css";
// import useWindowsStore from "../store/windowsStore";

interface WindowProps {
  id: string;
  title: string;
  component: string;
  initialPosition: { x: number; y: number };
  initialSize: { width: number; height: number };
  currentState: "normal" | "minimized" | "maximized";
  zIndex: number;
  props?: Record<string, any>; // Add props to the interface
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  initialPosition,
  initialSize,
  currentState,
  zIndex,
}) => {
  // State to track animation for minimize
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [minimizeTarget, setMinimizeTarget] = useState({ x: 0, y: 0 });

  // Get dock position for minimize animation
  useEffect(() => {
    if (currentState === "minimized" && !isMinimizing) {
      // Find the dock icon's position for this window
      const dockIcon = document.querySelector(`[data-window-id="${id}"]`);
      if (dockIcon) {
        const rect = dockIcon.getBoundingClientRect();
        setMinimizeTarget({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        setIsMinimizing(true);

        // After animation completes, reset the flag
        const timer = setTimeout(() => {
          setIsMinimizing(false);
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [currentState, id]);

  // The WindowContent component can be dynamically selected based on the 'component' string
  // In a more complete implementation, you'd map the string to actual components
  const WindowContent = () => {
    // Here you could implement a switch statement to return different content based on component
    return (
      <div className={styles.windowContent}>
        <h3>Content for: {title}</h3>
        <p>Current State: {currentState}</p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    );
  };

  // If we're animating minimization, render a Framer Motion div
  if (isMinimizing) {
    return (
      <motion.div
        className={styles.minimizingWindow}
        initial={{
          x: initialPosition.x,
          y: initialPosition.y,
          width: initialSize.width,
          height: initialSize.height,
          opacity: 1,
          scale: 1,
          zIndex,
        }}
        animate={{
          x: minimizeTarget.x - initialSize.width / 2,
          y: minimizeTarget.y - initialSize.height / 2,
          width: 50,
          height: 50,
          opacity: 0,
          scale: 0.1,
          zIndex,
        }}
        transition={{
          duration: 0.3,
          ease: [0.2, 0, 0, 1],
        }}
      >
        <div className={styles.minimizingContent}>
          <div className={styles.titleBar}>
            <span className={styles.windowTitle}>{title}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // If the window is minimized and not animating, don't render anything
  if (currentState === "minimized" && !isMinimizing) {
    return null;
  }

  // Otherwise, render the regular window
  return (
    <WindowContainer
      id={id}
      title={title}
      position={initialPosition}
      size={initialSize}
      currentState={currentState}
      zIndex={zIndex}
    >
      <WindowContent />
    </WindowContainer>
  );
};

export default Window;

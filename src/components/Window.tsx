// src/components/Window.tsx
import React, { useRef } from "react";
import {
  motion,
  PanInfo,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
import styles from "./Window.module.css";
import useWindowsStore from "../store/windowsStore";

interface WindowProps {
  id: string;
  title: string;
  component: string;
  initialPosition: { x: number; y: number };
  initialSize: { width: number; height: number };
  currentState: "normal" | "minimized" | "maximized";
  zIndex: number;
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  component,
  initialPosition,
  initialSize,
  currentState,
  zIndex,
}) => {
  const closeWindow = useWindowsStore((state) => state.closeWindow);
  const updateWindowPosition = useWindowsStore(
    (state) => state.updateWindowPosition
  );
  const updateWindowSize = useWindowsStore((state) => state.updateWindowSize);
  const minimizeWindow = useWindowsStore((state) => state.minimizeWindow);
  const maximizeWindow = useWindowsStore((state) => state.maximizeWindow);
  const restoreWindow = useWindowsStore((state) => state.restoreWindow);
  const bringWindowToFront = useWindowsStore(
    (state) => state.bringWindowToFront
  );

  const windowRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);
  const width = useMotionValue(initialSize.width);
  const height = useMotionValue(initialSize.height);

  React.useEffect(() => {
    x.set(initialPosition.x);
    y.set(initialPosition.y);
    width.set(initialSize.width);
    height.set(initialSize.height);
  }, [
    initialPosition.x,
    initialPosition.y,
    initialSize.width,
    initialSize.height,
    x,
    y,
    width,
    height,
  ]);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (currentState === "normal") {
      const finalPosition = {
        x: x.get(),
        y: y.get(),
      };
      updateWindowPosition(id, finalPosition);
    }
  };

  const handleWindowClick = () => {
    bringWindowToFront(id);
  };

  const WindowContent = () => {
    // TODO: Map 'component' string to actual React components
    return (
      <div
        className={styles.windowContent}
        style={{ overflow: currentState === "maximized" ? "auto" : "auto" }}
      >
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

  const animationTarget = React.useMemo(() => {
    const baseTarget = {
      opacity: 1,
      scale: 1,
      pointerEvents: "auto" as "auto" | "none", // Cast to union type
    };

    switch (currentState) {
      case "normal":
        return {
          ...baseTarget,
          x: initialPosition.x,
          y: initialPosition.y,
          width: initialSize.width,
          height: initialSize.height,
        };
      case "minimized":
        // Placeholder for minimize animation target
        return {
          ...baseTarget,
          x: x.get(), // Stay at current x for now
          y: window.innerHeight - 30, // Example: move near the bottom
          width: 50, // Example: shrink to icon size
          height: 30, // Example: shrink height
          opacity: 0, // Fade out
          scale: 0.5, // Shrink animation
          pointerEvents: "none" as "auto" | "none", // Disable interactions
        };
      case "maximized":
        // Target for maximized state
        return {
          ...baseTarget,
          x: 0,
          y: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          transition: {
            // Define specific transitions for maximize
            x: { duration: 0.3, ease: "easeOut" },
            y: { duration: 0.3, ease: "easeOut" },
            width: { duration: 0.3, ease: "easeOut" },
            height: { duration: 0.3, ease: "easeOut" },
            // Add other properties if needed
          },
        };
      default:
        return {};
    }
  }, [currentState, initialPosition, initialSize, x, y]);

  const isDraggable = currentState === "normal";
  const greenButtonAction =
    currentState === "maximized" ? restoreWindow : maximizeWindow;

  // Log the animation target whenever it changes
  React.useEffect(() => {
    console.log(
      `Window ${id} - Animation Target for state ${currentState}:`,
      animationTarget
    );
  }, [animationTarget, currentState, id]);

  return (
    <motion.div
      ref={windowRef}
      className={styles.window}
      initial={{ opacity: 0, scale: 0.8 }} // Initial mount animation
      animate={animationTarget} // Animate to the target based on state
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }} // Default transition for exit, etc.
      style={{
        x,
        y,
        width,
        height,
        zIndex,
        pointerEvents: currentState === "minimized" ? "none" : "auto",
      }}
      drag={isDraggable}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onMouseDown={handleWindowClick}
      onDragStart={handleWindowClick}
    >
      <div className={styles.titleBar}>
        <div className={styles.windowControls}>
          <div
            className={`${styles.controlButton} ${styles.closeButton}`}
            onClick={() => closeWindow(id)}
          ></div>
          {/* Minimize Button */}
          <div
            className={`${styles.controlButton} ${styles.minimizeButton}`}
            onClick={() => minimizeWindow(id)}
          ></div>
          {/* Maximize/Restore Button */}
          <div
            className={`${styles.controlButton} ${styles.maximizeButton}`}
            onClick={() => greenButtonAction(id)}
            style={{
              backgroundColor:
                currentState === "maximized" ? "#00a03f" : "#00ca4e",
            }}
          ></div>
        </div>
        <span className={styles.windowTitle}>{title}</span>
      </div>
      <WindowContent />
    </motion.div>
  );
};

export default Window;

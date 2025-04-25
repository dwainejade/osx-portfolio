import React, { useRef, useState, useEffect } from "react";
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

  // Store the pre-maximized position and size for the restore animation
  const [preMaximizedState, setPreMaximizedState] = useState({
    x: initialPosition.x,
    y: initialPosition.y,
    width: initialSize.width,
    height: initialSize.height,
  });

  const windowRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);
  const width = useMotionValue(initialSize.width);
  const height = useMotionValue(initialSize.height);

  // Update motion values when props change
  useEffect(() => {
    if (currentState !== "maximized") {
      x.set(initialPosition.x);
      y.set(initialPosition.y);
      width.set(initialSize.width);
      height.set(initialSize.height);
    }
  }, [
    initialPosition.x,
    initialPosition.y,
    initialSize.width,
    initialSize.height,
    currentState,
    x,
    y,
    width,
    height,
  ]);

  // Store current position and size before maximizing
  useEffect(() => {
    if (currentState === "normal") {
      setPreMaximizedState({
        x: x.get(),
        y: y.get(),
        width: width.get(),
        height: height.get(),
      });
    }
  }, [currentState, x, y, width, height]);

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

      // Update pre-maximized state after drag
      setPreMaximizedState((prev) => ({
        ...prev,
        x: finalPosition.x,
        y: finalPosition.y,
      }));
    }
  };

  const handleWindowClick = () => {
    bringWindowToFront(id);
  };

  // Custom maximize handler to save position before maximizing
  const handleMaximize = () => {
    if (currentState !== "maximized") {
      setPreMaximizedState({
        x: x.get(),
        y: y.get(),
        width: width.get(),
        height: height.get(),
      });
    }
    maximizeWindow(id);
  };

  // Custom restore handler that uses the saved pre-maximized state
  const handleRestore = () => {
    setIsRestoring(true);
    restoreWindow(id);

    // Reset isRestoring after the animation completes
    setTimeout(() => {
      setIsRestoring(false);
    }, 400); // A bit longer than animation duration to ensure it completes
  };

  const WindowContent = () => {
    // TODO: Map 'component' string to actual React components
    return (
      <div className={styles.windowContent} style={{ overflow: "auto" }}>
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

  // Create animation variants for the different window states
  const windowVariants = {
    normal: {
      x: initialPosition.x,
      y: initialPosition.y,
      width: initialSize.width,
      height: initialSize.height,
      opacity: 1,
      scale: 1,
      borderRadius: "8px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 1,
      },
    },
    minimized: {
      x: window.innerWidth / 2 - 25, // Center at bottom
      y: window.innerHeight - 10,
      width: 50,
      height: 30,
      opacity: 0,
      scale: 0.5,
      borderRadius: "4px",
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1], // Material Design easing
      },
    },
    maximizing: {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      opacity: 1,
      scale: 1,
      borderRadius: "0px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 1,
      },
    },
    restoring: {
      x: preMaximizedState.x,
      y: preMaximizedState.y,
      width: preMaximizedState.width,
      height: preMaximizedState.height,
      opacity: 1,
      scale: 1,
      borderRadius: "8px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 1,
      },
    },
  };

  // Track when we're transitioning between states
  const [isRestoring, setIsRestoring] = useState(false);

  // Determine which variant to use based on current state
  const currentVariant = React.useMemo(() => {
    switch (currentState) {
      case "normal":
        return isRestoring ? "restoring" : "normal";
      case "minimized":
        return "minimized";
      case "maximized":
        return "maximizing";
      default:
        return "normal";
    }
  }, [currentState, isRestoring]);

  const isDraggable = currentState === "normal";
  const greenButtonAction =
    currentState === "maximized" ? handleRestore : handleMaximize;

  // macOS animation for the content - slight fade and scaling
  const contentVariants = {
    normal: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
      },
    },
    maximizing: {
      opacity: [0.9, 1],
      scale: [0.98, 1],
      transition: {
        duration: 0.3,
        times: [0, 1],
      },
    },
    restoring: {
      opacity: [0.9, 1],
      scale: [0.98, 1],
      transition: {
        duration: 0.3,
        times: [0, 1],
      },
    },
    minimized: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      ref={windowRef}
      className={styles.window}
      initial="normal"
      animate={currentVariant}
      variants={windowVariants}
      style={{
        x,
        y,
        width,
        height,
        zIndex,
        pointerEvents: currentState === "minimized" ? "none" : "auto",
        boxShadow:
          currentState === "maximized"
            ? "none"
            : "0 10px 25px rgba(0,0,0,0.15)",
        borderRadius: currentState === "maximized" ? 0 : "8px",
      }}
      data-state={currentState}
      data-restoring={isRestoring}
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
            onClick={greenButtonAction}
            style={{
              backgroundColor:
                currentState === "maximized" ? "#00a03f" : "#00ca4e",
            }}
          ></div>
        </div>
        <span className={styles.windowTitle}>{title}</span>
      </div>
      <motion.div
        variants={contentVariants}
        initial="normal"
        animate={currentVariant}
        className={styles.contentWrapper}
      >
        <WindowContent />
      </motion.div>
    </motion.div>
  );
};

export default Window;

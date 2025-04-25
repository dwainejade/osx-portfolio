// src/components/Window.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  PanInfo,
  useMotionValue,
  AnimatePresence,
  useDragControls,
} from "framer-motion";
import styles from "./Window.module.css";
import useWindowsStore from "../store/windowsStore";

interface WindowProps {
  id: string;
  title: string;
  component: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  currentState: "normal" | "minimized" | "maximized";
  zIndex: number;
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  component,
  position = { x: 0, y: 0 },
  size = { width: 600, height: 400 },
  currentState,
  zIndex,
}) => {
  // Track resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState("");
  const [initialMousePosition, setInitialMousePosition] = useState({
    x: 0,
    y: 0,
  });
  const [initialWindowSize, setInitialWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const [initialWindowPosition, setInitialWindowPosition] = useState({
    x: 0,
    y: 0,
  });

  // Minimum window size
  const minWidth = 300;
  const minHeight = 200;
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

  // Initialize drag controls
  const dragControls = useDragControls();

  // Track the previous state to determine animation behavior
  const [prevState, setPrevState] = useState<
    "normal" | "minimized" | "maximized"
  >(currentState);

  // Store pre-maximized state in a ref to avoid re-renders
  const preMaximizedStateRef = useRef({
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
  });

  const windowRef = useRef<HTMLDivElement>(null);
  const titleBarRef = useRef<HTMLDivElement>(null);

  // Keep motion values as refs to ensure they persist across renders
  const motionValues = useRef({
    x: useMotionValue(position.x),
    y: useMotionValue(position.y),
    width: useMotionValue(size.width),
    height: useMotionValue(size.height),
  });

  // Update previous state when current state changes
  useEffect(() => {
    if (currentState !== prevState) {
      setPrevState(currentState);
    }
  }, [currentState, prevState]);

  const isInitialRender = true;

  // Handle initial animation
  const animateState = isInitialRender ? "opening" : currentState;

  // Set initial state if coming from normal state
  useEffect(() => {
    if (currentState === "normal" && prevState !== "normal") {
      // If transitioning to normal state, use stored pre-maximized values
      motionValues.current.x.set(preMaximizedStateRef.current.x);
      motionValues.current.y.set(preMaximizedStateRef.current.y);
      motionValues.current.width.set(preMaximizedStateRef.current.width);
      motionValues.current.height.set(preMaximizedStateRef.current.height);
    } else if (currentState === "normal" && prevState === "normal") {
      // If already in normal state, keep updated position/size values
      motionValues.current.x.set(position.x);
      motionValues.current.y.set(position.y);
      motionValues.current.width.set(size.width);
      motionValues.current.height.set(size.height);

      // Update preMaximizedState with current values
      preMaximizedStateRef.current = {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      };
    }
  }, [
    currentState,
    prevState,
    position.x,
    position.y,
    size.width,
    size.height,
  ]);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (currentState === "normal") {
      const finalPosition = {
        x: motionValues.current.x.get(),
        y: motionValues.current.y.get(),
      };
      updateWindowPosition(id, finalPosition);

      // Update pre-maximized state after drag ends
      preMaximizedStateRef.current = {
        ...preMaximizedStateRef.current,
        x: finalPosition.x,
        y: finalPosition.y,
      };
    }
  };

  const handleWindowClick = () => {
    bringWindowToFront(id);
  };

  const handleMaximize = () => {
    // Capture current state before maximizing
    preMaximizedStateRef.current = {
      x: motionValues.current.x.get(),
      y: motionValues.current.y.get(),
      width: motionValues.current.width.get(),
      height: motionValues.current.height.get(),
    };
    maximizeWindow(id);
  };

  const handleRestore = () => {
    restoreWindow(id);
  };

  const WindowContent = () => {
    return (
      <div
        className={styles.windowContent}
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          color: "#333",
        }}
      >
        <h3>Content for: {title}</h3>
        <p>Current State: {currentState}</p>
        {/* Add some dummy content to test scrolling */}
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

  // Define animation variants
  const windowVariants = {
    normal: {
      x: preMaximizedStateRef.current.x,
      y: preMaximizedStateRef.current.y,
      width: preMaximizedStateRef.current.width,
      height: preMaximizedStateRef.current.height,
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
    // Special variant for initial opening animation
    opening: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.2, 0.8, 0.2, 1.0],
      },
    },
    minimized: {
      x: window.innerWidth / 2 - 25,
      y: window.innerHeight - 10,
      width: 50,
      height: 30,
      opacity: 0,
      scale: 0.5,
      borderRadius: "4px",
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    maximized: {
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
  };

  // Content animation variants
  const contentVariants = {
    normal: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 },
    },
    maximized: {
      opacity: [0.9, 1],
      scale: [0.98, 1],
      transition: { duration: 0.3, times: [0, 1] },
    },
    minimized: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const isDraggable = currentState === "normal";
  const greenButtonAction =
    currentState === "maximized" ? handleRestore : handleMaximize;

  return (
    <motion.div
      ref={windowRef}
      className={styles.window}
      // Use layout prop for smoother transitions
      layout
      // Initial animation - scale up from 0.9 to 1
      initial={
        isInitialRender
          ? {
              opacity: 0.8,
              scale: 0.9,
              x: position.x,
              y: position.y,
              width: size.width,
              height: size.height,
              borderRadius: "8px",
            }
          : false
      }
      // Use animation instead of directly setting style.x, style.y, etc.
      animate={animateState}
      variants={windowVariants}
      style={{
        zIndex,
        pointerEvents: currentState === "minimized" ? "none" : "auto",
        boxShadow:
          currentState === "maximized"
            ? "none"
            : "0 10px 25px rgba(0,0,0,0.15)",
      }}
      data-state={currentState}
      drag={isDraggable}
      dragMomentum={false}
      dragConstraints={{
        left: 0,
        top: 0,
        right: window.innerWidth - 100,
        bottom: window.innerHeight - 50,
      }}
      dragElastic={0}
      dragControls={dragControls}
      onDragStart={(e, info) => {
        if (isDraggable && !isResizing) {
          bringWindowToFront(id);
        }
      }}
      onDragEnd={handleDragEnd}
      onMouseDown={handleWindowClick}
    >
      <div
        className={styles.titleBar}
        ref={titleBarRef}
        onMouseDown={(e) => {
          if (isDraggable && !isResizing) {
            dragControls.start(e);
            windowRef.current?.setAttribute("data-dragging", "true");
          }
        }}
        onMouseUp={() => {
          windowRef.current?.removeAttribute("data-dragging");
        }}
      >
        <div className={styles.windowControls}>
          <div
            className={`${styles.controlButton} ${styles.closeButton}`}
            onClick={() => closeWindow(id)}
            onMouseDown={(e) => e.stopPropagation()}
          ></div>
          <div
            className={`${styles.controlButton} ${styles.minimizeButton}`}
            onClick={() => minimizeWindow(id)}
            onMouseDown={(e) => e.stopPropagation()}
          ></div>
          <div
            className={`${styles.controlButton} ${styles.maximizeButton}`}
            onClick={greenButtonAction}
            style={{
              backgroundColor:
                currentState === "maximized" ? "#00a03f" : "#00ca4e",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          ></div>
        </div>
        <span className={styles.windowTitle}>{title}</span>
      </div>
      <motion.div
        variants={contentVariants}
        animate={currentState}
        className={styles.contentWrapper}
        style={{
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <WindowContent />
      </motion.div>
    </motion.div>
  );
};

export default Window;

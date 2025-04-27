// src/components/WindowContainer.tsx
import React, { useRef, useEffect, useState } from "react";
import { Rnd, Props as RndProps } from "react-rnd";
import styles from "./Window.module.css";
import useWindowsStore from "../store/windowsStore";
import useWindowResize from "../hooks/useWindowResize";

// Define a specific class name for the drag handle
const DRAG_HANDLE_CLASS = "window-drag-handle";

interface WindowContainerProps {
  id: string;
  title: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  currentState: "normal" | "minimized" | "maximized";
  zIndex: number;
  children: React.ReactNode;
}

const WindowContainer: React.FC<WindowContainerProps> = ({
  id,
  title,
  position = { x: 100, y: 100 },
  size = { width: 600, height: 400 },
  currentState,
  zIndex,
  children,
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

  // Get current window size from our custom hook
  const windowSize = useWindowResize();

  // Store pre-maximized state (position and size)
  const preMaximizedStateRef = useRef({
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
  });

  // Keep track if the component has mounted
  const hasMounted = useRef(false);

  // Flag to track if we're currently dragging or resizing
  const [isInteracting, setIsInteracting] = useState(false);

  // Update pre-maximized state when in normal state
  useEffect(() => {
    if (hasMounted.current && currentState === "normal") {
      preMaximizedStateRef.current = {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      };
    } else if (!hasMounted.current) {
      preMaximizedStateRef.current = {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      };
      hasMounted.current = true;
    }
  }, [position.x, position.y, size.width, size.height, currentState]);

  // --- Event Handlers for Rnd ---

  const handleDragStart = () => {
    setIsInteracting(true);
    bringWindowToFront(id);
  };

  const handleDragStop: RndProps["onDragStop"] = (_e, d) => {
    setIsInteracting(false);

    if (position.x !== d.x || position.y !== d.y) {
      if (currentState === "normal") {
        const newPosition = { x: d.x, y: d.y };
        updateWindowPosition(id, newPosition);
        preMaximizedStateRef.current.x = newPosition.x;
        preMaximizedStateRef.current.y = newPosition.y;
      }
    }
  };

  const handleResizeStart = () => {
    setIsInteracting(true);
    bringWindowToFront(id);
  };

  const handleResizeStop: RndProps["onResizeStop"] = (
    _e,
    _direction,
    ref,
    _delta,
    pos
  ) => {
    setIsInteracting(false);

    if (currentState === "normal") {
      const newWidth = parseInt(ref.style.width, 10);
      const newHeight = parseInt(ref.style.height, 10);
      const newSize = { width: newWidth, height: newHeight };
      const newPosition = { x: pos.x, y: pos.y };

      updateWindowSize(id, newSize);
      updateWindowPosition(id, newPosition);

      preMaximizedStateRef.current = { ...newPosition, ...newSize };
    }
  };

  // --- Window Actions ---

  const handleMaximize = () => {
    // Save current state before maximizing
    if (currentState === "normal") {
      preMaximizedStateRef.current = {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      };
    }

    // Apply the state change immediately
    maximizeWindow(id);
  };

  const handleRestore = () => {
    restoreWindow(id);
  };

  // --- Rnd Configuration based on State ---
  let rndConfig: Partial<RndProps> = {
    size: { width: size.width, height: size.height },
    position: { x: position.x, y: position.y },
    minWidth: 300,
    minHeight: 200,
    dragHandleClassName: DRAG_HANDLE_CLASS,
    onDragStart: handleDragStart,
    onDragStop: handleDragStop,
    onResizeStart: handleResizeStart,
    onResizeStop: handleResizeStop,
    enableResizing: true,
    disableDragging: false,
    dragGrid: [1, 1], // Fine-grained grid for smoother dragging
    resizeGrid: [1, 1], // Fine-grained grid for smoother resizing
  };

  if (currentState === "maximized") {
    rndConfig = {
      ...rndConfig,
      size: { width: windowSize.width, height: windowSize.height },
      position: { x: 0, y: 0 },
      enableResizing: false,
      disableDragging: true,
    };
  } else if (currentState === "minimized") {
    return null;
  }

  const greenButtonAction =
    currentState === "maximized" ? handleRestore : handleMaximize;

  const handleMouseDownCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    const targetElement = e.target as HTMLElement;
    if (targetElement.closest(`.${styles.controlButton}`)) {
      return;
    }
    bringWindowToFront(id);
  };

  // Only apply transitions when not interacting with the window
  const containerStyle = {
    zIndex,
    boxShadow:
      currentState === "maximized" ? "none" : "0 10px 25px rgba(0,0,0,0.15)",
    ...(isInteracting
      ? {}
      : { transition: "all 300ms cubic-bezier(0.2, 0, 0, 1)" }),
  };

  return (
    <Rnd
      {...rndConfig}
      style={containerStyle}
      className={`${styles.window} ${
        currentState === "maximized" ? styles.maximized : ""
      }`}
      onMouseDownCapture={handleMouseDownCapture}
      cancel={`.${styles.controlButton}`} // Don't initiate drag from control buttons
    >
      {/* Title Bar */}
      <div className={`${styles.titleBar} ${DRAG_HANDLE_CLASS}`}>
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

      {/* Content Area */}
      <div
        className={styles.contentWrapper}
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          height: "calc(100% - 24px)",
          color: "#333",
        }}
      >
        {children}
      </div>
    </Rnd>
  );
};

export default WindowContainer;

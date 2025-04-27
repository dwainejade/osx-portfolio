// src/components/WindowContainer.tsx
import React, { useRef, useEffect } from "react";
import { Rnd, Props as RndProps } from "react-rnd"; // Import Rnd and its types
import styles from "./Window.module.css";
import useWindowsStore from "../store/windowsStore";

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
  position = { x: 100, y: 100 }, // Provide default initial position
  size = { width: 600, height: 400 }, // Provide default initial size
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

  // Store pre-maximized state (position and size)
  const preMaximizedStateRef = useRef({
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
  });

  // Keep track if the component has mounted to avoid setting preMax state incorrectly on first render
  const hasMounted = useRef(false);

  // Update pre-maximized state only when position/size changes while in normal state
  useEffect(() => {
    // Only update after mount and when in normal state
    if (hasMounted.current && currentState === "normal") {
      preMaximizedStateRef.current = {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      };
    } else if (!hasMounted.current) {
      // On first mount, ensure ref matches initial props
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

  const handleDragStop: RndProps["onDragStop"] = (e, d) => {
    // Avoid updating position if it resulted from a click without dragging
    if (position.x !== d.x || position.y !== d.y) {
      if (currentState === "normal") {
        const newPosition = { x: d.x, y: d.y };
        updateWindowPosition(id, newPosition);
        // Also update ref here as dragging changes position
        preMaximizedStateRef.current.x = newPosition.x;
        preMaximizedStateRef.current.y = newPosition.y;
      }
    }
    // Always bring to front on interaction end if needed
    bringWindowToFront(id);
  };

  const handleResizeStop: RndProps["onResizeStop"] = (
    e,
    direction,
    ref,
    delta,
    pos // `pos` gives the final position after resize
  ) => {
    if (currentState === "normal") {
      // Parse width/height which might have "px"
      const newWidth = parseInt(ref.style.width, 10);
      const newHeight = parseInt(ref.style.height, 10);
      const newSize = { width: newWidth, height: newHeight };
      const newPosition = { x: pos.x, y: pos.y };

      updateWindowSize(id, newSize);
      // Update position as well, as resizing from top/left changes position
      updateWindowPosition(id, newPosition);

      // Also update ref here as resizing changes size/position
      preMaximizedStateRef.current = { ...newPosition, ...newSize };
    }
    // Always bring to front on interaction end
    bringWindowToFront(id);
  };

  // --- Window Actions ---

  const handleMaximize = () => {
    // Capture current state *before* maximizing if it's normal
    if (currentState === "normal") {
      preMaximizedStateRef.current = {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      };
    }
    maximizeWindow(id); // This should update the state, triggering re-render
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
    dragHandleClassName: DRAG_HANDLE_CLASS, // Use the defined class for dragging
    onDragStop: handleDragStop,
    onResizeStop: handleResizeStop,
    enableResizing: true,
    disableDragging: false,
  };

  if (currentState === "maximized") {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    rndConfig = {
      ...rndConfig,
      size: { width: viewportWidth, height: viewportHeight },
      position: { x: 0, y: 0 },
      enableResizing: false,
      disableDragging: true,
    };
  } else if (currentState === "minimized") {
    // For minimized, we don't render Rnd
    return null;
  } else {
    // Ensure 'normal' state uses the potentially restored values if coming from maximized
    rndConfig = {
      ...rndConfig,
      size: { width: size.width, height: size.height },
      position: { x: position.x, y: position.y },
      enableResizing: true,
      disableDragging: false,
    };
  }

  const greenButtonAction =
    currentState === "maximized" ? handleRestore : handleMaximize;

  const handleMouseDownCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click target is a control button or is inside one
    const targetElement = e.target as HTMLElement;
    if (targetElement.closest(`.${styles.controlButton}`)) {
      return;
    }

    // If the click was anywhere else on the window, bring it to the front.
    bringWindowToFront(id);
  };

  // Render the Window using Rnd
  return (
    <Rnd
      {...rndConfig} // Spread the calculated config
      style={{
        zIndex,
        boxShadow:
          currentState === "maximized"
            ? "none"
            : "0 10px 25px rgba(0,0,0,0.15)",
      }} // Apply zIndex and conditional shadow
      className={styles.window} // Use existing CSS module class for basic frame styling
      onMouseDownCapture={handleMouseDownCapture}
    >
      {/* Title Bar - Add the drag handle class here */}
      <div
        className={`${styles.titleBar} ${DRAG_HANDLE_CLASS}`} // Add drag handle class
        // No onMouseDown needed here for dragging anymore
      >
        <div className={styles.windowControls}>
          <div
            className={`${styles.controlButton} ${styles.closeButton}`}
            onClick={() => closeWindow(id)}
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag initiation from buttons
          ></div>
          <div
            className={`${styles.controlButton} ${styles.minimizeButton}`}
            onClick={() => minimizeWindow(id)}
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag initiation
          ></div>
          <div
            className={`${styles.controlButton} ${styles.maximizeButton}`}
            onClick={greenButtonAction}
            style={{
              backgroundColor:
                currentState === "maximized" ? "#00a03f" : "#00ca4e",
            }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag initiation
          ></div>
        </div>
        <span className={styles.windowTitle}>{title}</span>
      </div>

      {/* Content Area */}
      <div
        className={styles.contentWrapper}
        // Make content area non-draggable explicitly if needed, though dragHandleClassName should suffice
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          height: "calc(100% - 24px)", // Adjust based on title bar height
          color: "#333",
        }}
      >
        {children}
      </div>
    </Rnd>
  );
};

export default WindowContainer;

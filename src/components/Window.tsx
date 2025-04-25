// src/components/Window.tsx
import React, { useRef } from "react";
import { motion, PanInfo, useMotionValue } from "framer-motion"; // Import useMotionValue
import styles from "./Window.module.css";
import useWindowsStore from "../store/windowsStore";

interface WindowProps {
  id: string;
  title: string;
  component: string;
  initialPosition: { x: number; y: number };
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  component,
  initialPosition,
}) => {
  const closeWindow = useWindowsStore((state) => state.closeWindow);
  const updateWindowPosition = useWindowsStore(
    (state) => state.updateWindowPosition
  );

  const windowRef = useRef<HTMLDivElement>(null);

  // Create motion values initialized with the initial position from state
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);

  // Update motion values whenever initialPosition prop changes (e.g., state update)
  // This ensures Framer Motion's internal x/y stays in sync with our state
  React.useEffect(() => {
    x.set(initialPosition.x);
    y.set(initialPosition.y);
  }, [initialPosition.x, initialPosition.y, x, y]);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    // Get the final x and y values directly from Framer Motion's internal state
    const finalPosition = {
      x: x.get(), // Use the current value of the motion value
      y: y.get(), // Use the current value of the motion value
    };

    console.group(`Drag End for Window: ${id}`);
    console.log("Initial Position (from state prop):", initialPosition);
    console.log("Drag Info Point (pointer position):", info.point);
    console.log("Drag Info Offset (total movement from start):", info.offset);
    console.log("Framer Motion final x.get():", x.get()); // Log the value from the motion value
    console.log("Framer Motion final y.get():", y.get()); // Log the value from the motion value
    console.log("Calculated Final Position (saved to state):", finalPosition);

    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      console.log(
        "Element getBoundingClientRect() AFTER Framer Motion applies transforms:",
        { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
      );
    }
    console.groupEnd();

    // Update the window's position in the Zustand store using the values from motion values
    updateWindowPosition(id, finalPosition);
  };

  const WindowContent = () => {
    // TODO: Map 'component' string to actual React components
    return (
      <div className={styles.windowContent}>
        <h3>Content for: {title}</h3>
        <p>Rendering component: {component}</p>
      </div>
    );
  };

  return (
    <motion.div
      ref={windowRef}
      className={styles.window}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      // Pass motion values directly to control position
      x={x}
      y={y}
      drag
      dragMomentum={false}
      // Constraints should ideally work relative to the origin (0,0) when using x/y

      onDragEnd={handleDragEnd}
    >
      <div className={styles.titleBar}>
        <div className={styles.windowControls}>
          <div
            className={`${styles.controlButton} ${styles.closeButton}`}
            onClick={() => closeWindow(id)}
          ></div>
          <div
            className={`${styles.controlButton} ${styles.minimizeButton}`}
          ></div>
          <div
            className={`${styles.controlButton} ${styles.maximizeButton}`}
          ></div>
        </div>
        <span className={styles.windowTitle}>{title}</span>
      </div>
      <WindowContent />
    </motion.div>
  );
};

export default Window;

// src/components/Window.tsx
import React, { useRef } from "react";
import { motion, PanInfo, useMotionValue } from "framer-motion";
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

  // Log the initial position prop and motion value initialization
  console.log(
    `Window ${id} - Rendered with initialPosition prop:`,
    initialPosition
  );
  console.log(
    `Window ${id} - useMotionValue initialized x: ${x.get()}, y: ${y.get()}`
  );

  // Update motion values whenever initialPosition prop changes (e.g., state update)
  React.useEffect(() => {
    console.log(
      `Window ${id} - useEffect updating motion values to:`,
      initialPosition
    );
    x.set(initialPosition.x);
    y.set(initialPosition.y);
  }, [initialPosition.x, initialPosition.y, x, y]);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const finalPosition = {
      x: x.get(),
      y: y.get(),
    };

    console.group(`Drag End for Window: ${id}`);
    console.log(
      "Initial Position (from state prop AT DRAG END):",
      initialPosition
    );
    console.log("Drag Info Point (pointer position):", info.point);
    console.log("Drag Info Offset (total movement from start):", info.offset);
    console.log("Framer Motion final x.get() AT DRAG END:", x.get());
    console.log("Framer Motion final y.get() AT DRAG END:", y.get());
    console.log("Calculated Final Position (saved to state):", finalPosition);

    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      console.log(
        "Element getBoundingClientRect() AFTER Framer Motion applies transforms:",
        { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
      );
    }
    console.groupEnd();

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
      initial={{
        opacity: 0,
        scale: 0.8,
        x: initialPosition.x,
        y: initialPosition.y,
      }} // Use initialPosition prop directly in initial animation
      animate={{
        opacity: 1,
        scale: 1,
        x: initialPosition.x,
        y: initialPosition.y,
      }} // Use initialPosition prop directly in animate
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      // Use motion values here
      x={x}
      y={y}
      drag
      dragMomentum={false}
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

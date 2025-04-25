// src/components/Window.tsx
import React, { useRef } from "react";
import { motion, PanInfo } from "framer-motion";
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

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    updateWindowPosition(id, { x: info.point.x, y: info.point.y });
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

  console.log(initialPosition);
  return (
    <motion.div
      className={styles.window}
      initial={{ opacity: 0, scale: 0.8, ...initialPosition }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      drag
      dragMomentum={false}
      dragConstraints={{
        left: 0,
        right: window.innerWidth - 50,
        top: 0,
        bottom: window.innerHeight - 50,
      }}
      onDragEnd={handleDragEnd}
      style={{
        position: "absolute",
        left: initialPosition.x,
        top: initialPosition.y,
      }}
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

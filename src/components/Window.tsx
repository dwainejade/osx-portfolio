// src/components/Window.tsx
import React from "react";
import WindowContainer from "./WindowContainer";
import styles from "./Window.module.css";

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

  // If the window is minimized, we could animate it to the dock
  // For now we'll just let WindowContainer handle minimization
  if (currentState === "minimized") {
    return null;
  }

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

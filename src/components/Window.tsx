import React from "react";
import WindowContainer from "./WindowContainer";
import styles from "./Window.module.css";

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
      </div>
    );
  };

  return (
    <WindowContainer
      id={id}
      title={title}
      position={position}
      size={size}
      currentState={currentState}
      zIndex={zIndex}
    >
      <WindowContent />
    </WindowContainer>
  );
};

export default Window;

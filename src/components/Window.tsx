// src/components/Window.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import WindowContainer from "./WindowContainer";
import styles from "./Window.module.css";
// import useWindowsStore from "../store/windowsStore";
import MarkdownWindow from "./windows/MarkdownWindow";
import ContentListWindow from "./windows/ContentListWindow";
// import AboutMeWindow from "./windows/AboutMeWindow";
// import ProjectsWindow from "./windows/ProjectsWindow";
// import ProjectDetailWindow from "./windows/ProjectDetailWindow";
// import BlogWindow from "./windows/BlogWindow";
// import BlogPostWindow from "./windows/BlogPostWindow";

interface WindowProps {
  id: string;
  title: string;
  component: string;
  initialPosition: { x: number; y: number };
  initialSize: { width: number; height: number };
  currentState: "normal" | "minimized" | "maximized";
  zIndex: number;
  props?: Record<string, any>; // Add props to the interface
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  component,
  initialPosition,
  initialSize,
  currentState,
  zIndex,
  props,
}) => {
  // State to track animation for minimize
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [minimizeTarget, setMinimizeTarget] = useState({ x: 0, y: 0 });

  // Get dock position for minimize animation
  useEffect(() => {
    if (currentState === "minimized" && !isMinimizing) {
      // Find the dock icon's position for this window
      const dockIcon = document.querySelector(`[data-window-id="${id}"]`);
      if (dockIcon) {
        const rect = dockIcon.getBoundingClientRect();
        setMinimizeTarget({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
        setIsMinimizing(true);

        // After animation completes, reset the flag
        const timer = setTimeout(() => {
          setIsMinimizing(false);
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [currentState, id]);

  // Render the appropriate window content based on the component string
  const renderWindowContent = () => {
    switch (component) {
      case "markdown":
        // Used for About Me, Project Detail, and Blog Post windows
        return (
          <MarkdownWindow
            content={props?.content}
            filePath={props?.filePath}
            title={props?.showTitle ? title : undefined}
          />
        );
      case "projects-list":
        return (
          <ContentListWindow
            type="projects"
            listPath={props?.listPath || "/content/projects/projects.json"}
            title={props?.title || "Projects"}
          />
        );
      case "blog-list":
        return (
          <ContentListWindow
            type="blog"
            listPath={props?.listPath || "/content/blog/blog.json"}
            title={props?.title || "Blog"}
          />
        );
      // Add other window types here as needed
      default:
        return (
          <div className={styles.defaultWindowContent}>
            <h3>Content for: {title}</h3>
            <p>Component type: {component}</p>
            <p>Window ID: {id}</p>
          </div>
        );
    }
  };

  // If we're animating minimization, render a Framer Motion div
  if (isMinimizing) {
    return (
      <motion.div
        className={styles.minimizingWindow}
        initial={{
          x: initialPosition.x,
          y: initialPosition.y,
          width: initialSize.width,
          height: initialSize.height,
          opacity: 1,
          scale: 1,
          zIndex,
        }}
        animate={{
          x: minimizeTarget.x - initialSize.width / 2,
          y: minimizeTarget.y - initialSize.height / 2,
          width: 50,
          height: 50,
          opacity: 0,
          scale: 0.1,
          zIndex,
        }}
        transition={{
          duration: 0.3,
          ease: [0.2, 0, 0, 1],
        }}
      >
        <div className={styles.minimizingContent}>
          <div className={styles.titleBar}>
            <span className={styles.windowTitle}>{title}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // If the window is minimized and not animating, don't render anything
  if (currentState === "minimized" && !isMinimizing) {
    return null;
  }

  // Otherwise, render the regular window
  return (
    <WindowContainer
      id={id}
      title={title}
      position={initialPosition}
      size={initialSize}
      currentState={currentState}
      zIndex={zIndex}
    >
      {renderWindowContent()}
    </WindowContainer>
  );
};

export default Window;

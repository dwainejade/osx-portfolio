// src/components/windows/ProjectDetailWindow.tsx
import React from "react";
import MarkdownWindow from "./MarkdownWindow";
import useMarkdownLoader from "../../hooks/useMarkdownLoader";
import styles from "./ProjectDetailWindow.module.css";

interface ProjectDetailWindowProps {
  filePath: string;
}

const ProjectDetailWindow: React.FC<ProjectDetailWindowProps> = ({
  filePath,
}) => {
  // Load the markdown content from the specified file path
  const { content, loading, error } = useMarkdownLoader(filePath);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error loading project: {error}</p>
      </div>
    );
  }

  // Pass the loaded markdown content to the MarkdownWindow component
  return <MarkdownWindow content={content} />;
};

export default ProjectDetailWindow;

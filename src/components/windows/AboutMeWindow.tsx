// src/components/windows/AboutMeWindow.tsx
import React from "react";
import MarkdownWindow from "./MarkdownWindow";
import useMarkdownLoader from "../../hooks/useMarkdownLoader";
import styles from "./AboutMeWindow.module.css";

const AboutMeWindow: React.FC = () => {
  // Load the markdown content from the about-me.md file in the public folder
  const { content, loading, error } = useMarkdownLoader("/content/about-me.md");

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error loading content: {error}</p>
      </div>
    );
  }

  // Pass the loaded markdown content to the MarkdownWindow component
  return <MarkdownWindow content={content} title="About Me" />;
};

export default AboutMeWindow;

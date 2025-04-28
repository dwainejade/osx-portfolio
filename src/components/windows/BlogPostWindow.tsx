// src/components/windows/BlogPostWindow.tsx
import React from "react";
import MarkdownWindow from "./MarkdownWindow";
import useMarkdownLoader from "../../hooks/useMarkdownLoader";
import styles from "./BlogPostWindow.module.css";

interface BlogPostWindowProps {
  filePath: string;
}

const BlogPostWindow: React.FC<BlogPostWindowProps> = ({ filePath }) => {
  // Load the markdown content from the specified file path
  const { content, loading, error } = useMarkdownLoader(filePath);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading blog post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error loading blog post: {error}</p>
      </div>
    );
  }

  // Pass the loaded markdown content to the MarkdownWindow component
  return <MarkdownWindow content={content} />;
};

export default BlogPostWindow;

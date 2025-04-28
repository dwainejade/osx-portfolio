// src/components/windows/MarkdownWindow.tsx
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./MarkdownWindow.module.css";

interface MarkdownWindowProps {
  content?: string; // Direct markdown content
  filePath?: string; // Path to a markdown file
  title?: string; // Optional title to display
}

const MarkdownWindow: React.FC<MarkdownWindowProps> = ({
  content,
  filePath,
  title,
}) => {
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to load markdown from file if filePath is provided
  useEffect(() => {
    const loadMarkdownFile = async () => {
      // If direct content is provided, use that
      if (content) {
        setMarkdownContent(content);
        return;
      }

      // If no filePath is provided, show an error
      if (!filePath) {
        setError("No content or file path provided");
        return;
      }

      try {
        setLoading(true);
        const publicPath = `${filePath}`;

        console.log("Attempting to load from:", publicPath);
        const response = await fetch(publicPath);

        if (!response.ok) {
          throw new Error(`Failed to load markdown file: ${response.status}`);
        }

        const text = await response.text();
        setMarkdownContent(text);
        setError(null);
      } catch (err) {
        console.error("Error loading markdown:", err);
        setError("Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    loadMarkdownFile();
  }, [content, filePath]);

  // Component rendering logic remains the same...
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.markdownWindow}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.markdownContent}>
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownWindow;

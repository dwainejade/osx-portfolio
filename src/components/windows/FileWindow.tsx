// src/components/windows/FileWindow.tsx
import React, { useState, useEffect } from "react";
import useFileSystemStore from "../../store/fileSystemStore";
import styles from "./FileWindow.module.css";

interface FileWindowProps {
  fileId: string;
  fileType?: string;
}

const FileWindow: React.FC<FileWindowProps> = ({
  fileId,
  fileType = "txt",
}) => {
  const { items, updateContent } = useFileSystemStore();
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  // Get the file
  const file = items[fileId];
  if (!file || file.type !== "file") {
    return <div className={styles.error}>File not found</div>;
  }

  // Initialize content from file
  useEffect(() => {
    if (file.content !== undefined) {
      setContent(file.content);
      setIsDirty(false);
    }
  }, [file.content]);

  // Save content to file
  const handleSave = () => {
    updateContent(fileId, content);
    setIsDirty(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
  };

  // Render different file types
  const renderFileContent = () => {
    switch (fileType) {
      case "txt":
      case "md":
      case "js":
      case "ts":
      case "jsx":
      case "tsx":
      case "html":
      case "css":
        return (
          <div className={styles.textEditor}>
            <textarea
              value={content}
              onChange={handleContentChange}
              className={styles.textArea}
              spellCheck={false}
            />
          </div>
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        // For image files, we would typically show the image
        // but for this example, we'll just show a placeholder
        return (
          <div className={styles.imageViewer}>
            <div className={styles.imagePlaceholder}>
              <img
                src={file.metadata.icon}
                alt="File icon"
                className={styles.filePlaceholderIcon}
              />
              <p>{file.name} (Image Viewer)</p>
            </div>
          </div>
        );
      default:
        return (
          <div className={styles.unsupported}>
            <img
              src={file.metadata.icon}
              alt="File icon"
              className={styles.fileIcon}
            />
            <p>This file type is not supported for viewing/editing</p>
          </div>
        );
    }
  };

  return (
    <div className={styles.fileWindow}>
      <div className={styles.toolbar}>
        <button
          className={styles.toolbarButton}
          onClick={handleSave}
          disabled={!isDirty}
        >
          Save
        </button>
      </div>
      {renderFileContent()}
    </div>
  );
};

export default FileWindow;

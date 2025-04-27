// src/components/windows/FinderWindow.tsx
import React, { useState, useEffect } from "react";
import styles from "./FinderWindow.module.css";
import FileExplorer from "../FileExplorer";
import useFileSystemStore from "../../store/fileSystemStore";
import { saveFileSystem } from "../../store/fileSystemPersistence";

interface FinderWindowProps {
  initialFolderId?: string;
}

const FinderWindow: React.FC<FinderWindowProps> = ({
  initialFolderId = "desktop",
}) => {
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  const {
    nodes,
    currentFolderId,
    navigateTo,
    navigateBack,
    navigateForward,
    navigateUp,
    getPath,
  } = useFileSystemStore();

  // When the window opens, navigate to the initial folder
  useEffect(() => {
    if (initialFolderId && initialFolderId !== currentFolderId) {
      navigateTo(initialFolderId);
    }
  }, [initialFolderId, currentFolderId, navigateTo]);

  // Save file system when changes occur
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveFileSystem();
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [nodes]);

  // Handle opening a node (file or folder)
  const handleNodeOpen = (nodeId: string) => {
    const node = nodes[nodeId];
    if (!node) return;

    if (node.type === "folder") {
      navigateTo(nodeId);
    } else {
      // For files, we could open a specific window based on file type
      // This is where you'd integrate with your windowsStore to open
      // the appropriate window for each file type
      console.log(`Opening file: ${node.name} (${node.type})`);

      // Example: Open an image in the image viewer
      if (node.type === "image") {
        // openWindow("image", node.name, "ImageWindow", undefined, undefined, { fileId: nodeId });
      }
      // Similar for other file types
    }
  };

  // Generate breadcrumb path
  const currentPath = getPath(currentFolderId);
  const pathNames = currentPath.map((id) => nodes[id]?.name || id);

  return (
    <div className={styles.finderWindow}>
      <div className={styles.toolbar}>
        <div className={styles.navigationButtons}>
          <button
            onClick={() => navigateBack()}
            disabled={
              !useFileSystemStore.getState().navigationHistory[
                useFileSystemStore.getState().historyIndex - 1
              ]
            }
          >
            ←
          </button>
          <button
            onClick={() => navigateForward()}
            disabled={
              !useFileSystemStore.getState().navigationHistory[
                useFileSystemStore.getState().historyIndex + 1
              ]
            }
          >
            →
          </button>
          <button
            onClick={() => navigateUp()}
            disabled={!nodes[currentFolderId]?.parentId}
          >
            ↑
          </button>
        </div>

        <div className={styles.pathBreadcrumb}>
          {pathNames.map((name, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className={styles.separator}>/</span>}
              <button
                className={styles.breadcrumbButton}
                onClick={() => navigateTo(currentPath[index])}
              >
                {name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className={styles.viewControls}>
          <button
            className={viewType === "grid" ? styles.activeView : ""}
            onClick={() => setViewType("grid")}
          >
            Grid
          </button>
          <button
            className={viewType === "list" ? styles.activeView : ""}
            onClick={() => setViewType("list")}
          >
            List
          </button>
        </div>
      </div>

      <div className={styles.finderContent}>
        <FileExplorer
          folderId={currentFolderId}
          viewType={viewType}
          onNodeOpen={handleNodeOpen}
        />
      </div>

      <div className={styles.statusBar}>
        {Object.keys(nodes).length - 1} items, {/* Subtract 1 for root */}
        {nodes[currentFolderId]?.type === "folder"
          ? (nodes[currentFolderId] as any).children.length
          : 0}{" "}
        items in this folder
      </div>
    </div>
  );
};

export default FinderWindow;

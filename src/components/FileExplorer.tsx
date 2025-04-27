// src/components/FileExplorer.tsx
import { useEffect, useState } from "react";
import styles from "./FileExplorer.module.css";
import useFileSystemStore from "../store/fileSystemStore";
import { Folder, isFolder } from "../store/fileSystemTypes";

interface FileExplorerProps {
  folderId: string;
  viewType?: "grid" | "list";
  onNodeOpen?: (nodeId: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  folderId,
  viewType = "grid",
  onNodeOpen,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const { nodes, selectedNodeIds, selectNode, deselectAll, navigateTo } =
    useFileSystemStore();

  const folder = nodes[folderId] as Folder;

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [folderId]);

  if (!folder || !isFolder(folder)) {
    return <div className={styles.error}>Folder not found</div>;
  }

  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    const isMultiSelect = e.ctrlKey || e.metaKey;
    selectNode(nodeId, isMultiSelect);
  };

  const handleNodeDoubleClick = (nodeId: string) => {
    const node = nodes[nodeId];

    if (isFolder(node)) {
      navigateTo(nodeId);
    } else if (onNodeOpen) {
      onNodeOpen(nodeId);
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the background (not bubbled)
    if (e.target === e.currentTarget) {
      deselectAll();
    }
  };

  return (
    <div
      className={`${styles.fileExplorer} ${styles[viewType]}`}
      onClick={handleBackgroundClick}
    >
      {isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          {folder.children.length === 0 ? (
            <div className={styles.emptyFolder}>This folder is empty</div>
          ) : (
            <div className={styles.nodesContainer}>
              {folder.children.map((childId) => {
                const node = nodes[childId];
                if (!node) return null;

                const isSelected = selectedNodeIds.includes(childId);

                return (
                  <div
                    key={childId}
                    className={`${styles.node} ${
                      isSelected ? styles.selected : ""
                    }`}
                    onClick={(e) => handleNodeClick(e, childId)}
                    onDoubleClick={() => handleNodeDoubleClick(childId)}
                  >
                    <img src={node.icon} alt="" className={styles.nodeIcon} />
                    <div className={styles.nodeName}>{node.name}</div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FileExplorer;

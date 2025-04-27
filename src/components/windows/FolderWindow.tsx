// src/components/windows/FolderWindow.tsx
import React, { useState } from "react";
import useFileSystemStore from "../../store/fileSystemStore";
import useWindowsStore from "../../store/windowsStore";
import styles from "./FolderWindow.module.css";

interface FolderWindowProps {
  folderId: string;
}

const FolderWindow: React.FC<FolderWindowProps> = ({ folderId }) => {
  const { items, createItem, renameItem, deleteItem } = useFileSystemStore();
  const openWindow = useWindowsStore((state) => state.openWindow);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");

  // Get the folder
  const folder = items[folderId];
  if (!folder || folder.type !== "folder") {
    return <div className={styles.error}>Folder not found</div>;
  }

  // Get all items in this folder
  const folderContents = Object.values(items).filter(
    (item) => item.parentId === folderId
  );

  const handleItemClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedItemId(id);
  };

  const handleItemDoubleClick = (id: string) => {
    const item = items[id];
    if (!item) return;

    if (item.type === "folder") {
      // Open a window with the folder contents
      openWindow(
        `folder-${id}`,
        item.name,
        "FolderWindow",
        undefined,
        undefined,
        { folderId: id }
      );
    } else {
      // Open a window with the file contents
      const fileType = item.name.split(".").pop() || "txt";

      openWindow(`file-${id}`, item.name, "FileWindow", undefined, undefined, {
        fileId: id,
        fileType,
      });
    }
  };

  const handleCreateNew = (type: "file" | "folder") => {
    setIsCreatingNew(true);
    setNewItemType(type);
    setNewItemName(type === "folder" ? "New Folder" : "New File.txt");
  };

  const handleBackgroundClick = () => {
    setSelectedItemId(null);

    // If creating a new item, finalize it
    if (isCreatingNew) {
      createItem(newItemName, newItemType, folderId);
      setIsCreatingNew(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isCreatingNew) return;

    if (e.key === "Enter") {
      createItem(newItemName, newItemType, folderId);
      setIsCreatingNew(false);
    } else if (e.key === "Escape") {
      setIsCreatingNew(false);
    }
  };

  return (
    <div className={styles.folderWindow}>
      <div className={styles.toolbar}>
        <button
          className={styles.toolbarButton}
          onClick={() => handleCreateNew("file")}
        >
          New File
        </button>
        <button
          className={styles.toolbarButton}
          onClick={() => handleCreateNew("folder")}
        >
          New Folder
        </button>
        <button
          className={styles.toolbarButton}
          onClick={() => {
            if (selectedItemId) deleteItem(selectedItemId);
          }}
          disabled={!selectedItemId}
        >
          Delete
        </button>
      </div>

      <div className={styles.contents} onClick={handleBackgroundClick}>
        {folderContents.map((item) => (
          <div
            key={item.id}
            className={`${styles.item} ${
              selectedItemId === item.id ? styles.selected : ""
            }`}
            onClick={(e) => handleItemClick(e, item.id)}
            onDoubleClick={() => handleItemDoubleClick(item.id)}
          >
            <div className={styles.itemIcon}>
              <img src={item.metadata.icon} alt={item.type} />
            </div>
            <div className={styles.itemName}>{item.name}</div>
          </div>
        ))}

        {isCreatingNew && (
          <div className={`${styles.item} ${styles.newItem}`}>
            <div className={styles.itemIcon}>
              <img
                src={
                  newItemType === "folder"
                    ? "/assets/icons/folder.png"
                    : "/assets/icons/document.png"
                }
                alt={newItemType}
              />
            </div>
            <input
              className={styles.newItemInput}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderWindow;

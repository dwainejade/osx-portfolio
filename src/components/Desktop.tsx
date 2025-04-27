// In src/components/Desktop.tsx
import React, { useState } from "react";
import useFileSystemStore from "../store/fileSystemStore";
import useWindowsStore from "../store/windowsStore";
import styles from "./Desktop.module.css";
import { FileSystemNode, isFolder } from "../store/fileSystemTypes";

const Desktop: React.FC = () => {
  const { nodes } = useFileSystemStore(); // Use 'nodes' instead of 'items'
  const openWindow = useWindowsStore((state) => state.openWindow);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Find all items that are on the desktop (parentId is null)
  const desktopItems = Object.values(nodes).filter(
    (item: FileSystemNode) => item.parentId === null
  );

  const handleItemClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedItemId(id);
  };

  const handleItemDoubleClick = (id: string) => {
    const item = nodes[id];
    if (!item) return;

    if (isFolder(item)) {
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

  const handleDesktopClick = () => {
    setSelectedItemId(null);
  };

  return (
    <div className={styles.desktop} onClick={handleDesktopClick}>
      {desktopItems.map((item: FileSystemNode) => (
        <div
          key={item.id}
          className={`${styles.desktopItem} ${
            selectedItemId === item.id ? styles.selected : ""
          }`}
          onClick={(e) => handleItemClick(e, item.id)}
          onDoubleClick={() => handleItemDoubleClick(item.id)}
        >
          <div className={styles.itemIcon}>
            <img src={item.icon} alt={item.type} />
          </div>
          <div className={styles.itemName}>{item.name}</div>
        </div>
      ))}
    </div>
  );
};

export default Desktop;

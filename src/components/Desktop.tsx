// src/components/Desktop.tsx
import React, { useState } from "react";
import useFileSystemStore from "../store/fileSystemStore";
import useWindowsStore from "../store/windowsStore";
import styles from "./Desktop.module.css";

const Desktop: React.FC = () => {
  const { items } = useFileSystemStore();
  const openWindow = useWindowsStore((state) => state.openWindow);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Find all items that are on the desktop (parentId is null)
  const desktopItems = Object.values(items).filter(
    (item) => item.parentId === null
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

  const handleDesktopClick = () => {
    setSelectedItemId(null);
  };

  return (
    <div className={styles.desktop} onClick={handleDesktopClick}>
      {desktopItems.map((item) => (
        <div
          key={item.id}
          className={`${styles.desktopItem} ${
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
    </div>
  );
};

export default Desktop;

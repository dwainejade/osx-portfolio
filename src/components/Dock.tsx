// src/components/Dock.tsx
import React from "react";
import DockIcon from "./DockIcon";
import styles from "./Dock.module.css";
import useWindowsStore from "../store/windowsStore";
import useFileSystemStore from "../store/fileSystemStore";
import { initializeFileSystem } from "../store/fileSystemPersistence";

// Example array of dock items - replace with your actual portfolio items
const dockItems = [
  {
    id: "finder",
    src: "/assets/icons/finder.png",
    alt: "Finder",
    label: "Finder",
    type: "system",
    component: "FinderWindow", // Component to render
  },
  {
    id: "browser",
    src: "/assets/icons/safari.png",
    alt: "Browser",
    label: "Browser (Portfolio)",
    type: "portfolio",
    component: "BrowserWindow",
  },
  {
    id: "code",
    src: "/assets/icons/vscode.png",
    alt: "VS Code",
    label: "Code Editor (Project 1)",
    type: "portfolio",
    component: "CodeWindow",
  },
  {
    id: "image",
    src: "/assets/icons/photos.png",
    alt: "Photos",
    label: "Image Viewer (Project 2)",
    type: "portfolio",
    component: "ImageWindow",
  },
  {
    id: "settings",
    src: "/assets/icons/settings.png",
    alt: "Settings",
    label: "Settings",
    type: "system",
    component: "SettingsWindow",
  },
  {
    id: "trash",
    src: "/assets/icons/trash_empty.png",
    alt: "Trash",
    label: "Trash",
    type: "system",
    component: "TrashWindow",
  },
];

const Dock: React.FC = () => {
  const openWindow = useWindowsStore((state) => state.openWindow);
  const openWindows = useWindowsStore((state) => state.openWindows);
  const navigateTo = useFileSystemStore((state) => state.navigateTo);

  // Initialize file system on first render
  React.useEffect(() => {
    initializeFileSystem();
  }, []);

  const handleIconClick = (item: (typeof dockItems)[0]) => {
    // Handle special case for Finder: open it with the current folder
    if (item.id === "finder") {
      // Get current folder ID from file system store
      const currentFolderId = useFileSystemStore.getState().currentFolderId;

      // Open the Finder window and pass the current folder as a prop
      openWindow(item.id, item.label, item.component, undefined, undefined, {
        initialFolderId: currentFolderId,
      });
    } else {
      // For other apps, just open the window normally
      openWindow(item.id, item.label, item.component);
    }
  };

  return (
    <div className={styles.dockContainer}>
      <div className={styles.dock}>
        {dockItems.map((item) => (
          <DockIcon
            key={item.id}
            src={item.src}
            alt={item.alt}
            label={item.label}
            onClick={() => handleIconClick(item)}
            isOpen={openWindows.some((window) => window.id === item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dock;

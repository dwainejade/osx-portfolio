// src/components/Dock.tsx
import React from "react";
import DockIcon from "./DockIcon";
import styles from "./Dock.module.css";
import useWindowsStore from "../store/windowsStore";

// Example array of dock items with components
const dockItems = [
  {
    id: "finder",
    src: "/assets/icons/finder.png",
    alt: "Finder",
    label: "Finder",
    type: "system",
    component: "finder", // Component identifier
  },
  {
    id: "browser",
    src: "/assets/icons/safari.png",
    alt: "Browser",
    label: "Browser (Portfolio)",
    type: "portfolio",
    component: "browser", // Component identifier
  },
  {
    id: "code",
    src: "/assets/icons/vscode.png",
    alt: "VS Code",
    label: "Code Editor (Project 1)",
    type: "portfolio",
    component: "code", // Component identifier
  },
  {
    id: "image",
    src: "/assets/icons/photos.png",
    alt: "Photos",
    label: "Image Viewer (Project 2)",
    type: "portfolio",
    component: "image", // Component identifier
  },
  {
    id: "settings",
    src: "/assets/icons/settings.png",
    alt: "Settings",
    label: "Settings",
    type: "system",
    component: "settings", // Component identifier
  },
  {
    id: "trash",
    src: "/assets/icons/trash_empty.png",
    alt: "Trash",
    label: "Trash",
    type: "system",
    component: "trash", // Component identifier
  },
];

const Dock: React.FC = () => {
  const openWindow = useWindowsStore((state) => state.openWindow);
  const openWindows = useWindowsStore((state) => state.openWindows);
  const restoreWindow = useWindowsStore((state) => state.restoreWindow);

  const handleIconClick = (item: (typeof dockItems)[0]) => {
    // Check if window is already open
    const existingWindow = openWindows.find((window) => window.id === item.id);

    if (existingWindow) {
      // If minimized, restore it
      if (existingWindow.state === "minimized") {
        restoreWindow(item.id);
      } else {
        // If already open but not minimized, bring to front
        useWindowsStore.getState().bringWindowToFront(item.id);
      }
    } else {
      // If not open, open a new window
      openWindow(item.id, item.label, item.component);
    }
  };

  return (
    <div className={styles.dockContainer}>
      <div className={styles.dock}>
        {dockItems.map((item) => (
          <DockIcon
            key={item.id}
            id={item.id} // Pass id for data-window-id attribute
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

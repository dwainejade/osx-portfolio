// src/components/Dock.tsx
import React from "react";
import DockIcon from "./DockIcon";
import styles from "./Dock.module.css";
import useWindowsStore from "../store/windowsStore";

// Example array of dock items - replace with your actual portfolio items
const dockItems = [
  {
    id: "finder",
    src: "/assets/icons/finder.png",
    alt: "Finder",
    label: "Finder",
    type: "system",
  },
  {
    id: "browser",
    src: "/assets/icons/safari.png",
    alt: "Browser",
    label: "Browser (Portfolio)",
    type: "portfolio",
  },
  {
    id: "code",
    src: "/assets/icons/vscode.png",
    alt: "VS Code",
    label: "Code Editor (Project 1)",
    type: "portfolio",
  },
  {
    id: "image",
    src: "/assets/icons/photos.png",
    alt: "Photos",
    label: "Image Viewer (Project 2)",
    type: "portfolio",
  },
  {
    id: "trash",
    src: "/assets/icons/trash_empty.png",
    alt: "Trash",
    label: "Trash",
    type: "system",
  },
];

const Dock: React.FC = () => {
  const openWindow = useWindowsStore((state) => state.openWindow);
  const openWindows = useWindowsStore((state) => state.openWindows);

  const handleIconClick = (item: (typeof dockItems)[0]) => {
    openWindow(item.id, item.label, item.component, {
      x: 150 + Math.random() * 50,
      y: 150 + Math.random() * 50,
    });
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

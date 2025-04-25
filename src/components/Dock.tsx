// src/components/Dock.tsx
import React from "react";
import DockIcon from "./DockIcon";
import styles from "./Dock.module.css";

// Assume these are dummy functions for now
// We will connect these to Zustand state later
const handleIconClick = (appName: string) => {
  console.log(`Clicked on ${appName}`);
  // TODO: Implement logic to open window for appName using Zustand
};

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

const openWindows = ["browser", "code"]; // Dummy array of open window IDs for demonstration

const Dock: React.FC = () => {
  return (
    <div className={styles.dockContainer}>
      <div className={styles.dock}>
        {dockItems.map((item) => (
          <DockIcon
            key={item.id}
            src={item.src}
            alt={item.alt}
            label={item.label}
            onClick={() => handleIconClick(item.id)}
            isOpen={openWindows.includes(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Dock;

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
    label: "About Me",
    type: "system",
    component: "markdown", // Use markdown component for About Me
    props: {
      filePath: "/content/about-me.md",
      showTitle: true,
    },
  },
  {
    id: "browser",
    src: "/assets/icons/safari.png",
    alt: "Browser",
    label: "Blog",
    type: "portfolio",
    component: "blog-list", // Use blog-list component type for blog listing
    props: {
      listPath: "/content/blog/index.json",
      showTitle: true,
    },
  },
  {
    id: "code",
    src: "/assets/icons/vscode.png",
    alt: "VS Code",
    label: "Projects",
    type: "portfolio",
    component: "projects-list", // Use projects-list component type for projects listing
    props: {
      listPath: "/content/projects/index.json",
      showTitle: true,
    },
  },
  {
    id: "image",
    src: "/assets/icons/photos.png",
    alt: "Photos",
    label: "Gallery",
    type: "portfolio",
    component: "markdown", // Can use markdown for a photo gallery page too
    props: {
      filePath: "/content/gallery.md",
      showTitle: true,
    },
  },
  {
    id: "settings",
    src: "/assets/icons/settings.png",
    alt: "Settings",
    label: "Settings",
    type: "system",
    component: "markdown",
    props: {
      filePath: "/content/settings.md",
      showTitle: true,
    },
  },
  {
    id: "trash",
    src: "/assets/icons/trash_empty.png",
    alt: "Trash",
    label: "Trash",
    type: "system",
    component: "markdown",
    props: {
      filePath: "/content/trash.md",
      showTitle: true,
    },
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
      // If not open, open a new window with appropriate size and position
      const defaultPosition = { x: 100, y: 50 };
      let windowSize = { width: 700, height: 500 };

      // Adjust size based on component type
      if (
        item.component === "projects-list" ||
        item.component === "blog-list"
      ) {
        windowSize = { width: 800, height: 600 };
      }

      // Open the window with the component type and any custom props
      openWindow(
        item.id,
        item.label,
        item.component,
        defaultPosition,
        windowSize,
        item.props
      );
    }
  };

  return (
    <div className={styles.dockContainer}>
      <div className={styles.dock}>
        {dockItems.map((item) => (
          <DockIcon
            key={item.id}
            id={item.id}
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

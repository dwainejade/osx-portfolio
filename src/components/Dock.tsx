// src/components/Dock.tsx
import React from "react";
import DockIcon from "./DockIcon";
import styles from "./Dock.module.css";
import useWindowsStore from "../store/windowsStore";

// Updated dock items with portfolio components
const dockItems = [
  {
    id: "about",
    src: "/assets/icons/user.png", // Replace with your own icon
    alt: "About Me",
    label: "About Me",
    component: "AboutMeWindow",
  },
  {
    id: "projects",
    src: "/assets/icons/folder.png", // Replace with your own icon
    alt: "Projects",
    label: "Projects",
    component: "ProjectsWindow",
  },
  {
    id: "resume",
    src: "/assets/icons/document.png", // Replace with your own icon
    alt: "Resume",
    label: "Resume",
    component: "ResumeWindow",
  },
  {
    id: "contact",
    src: "/assets/icons/mail.png", // Replace with your own icon
    alt: "Contact",
    label: "Contact",
    component: "ContactWindow",
  },
  // You can keep any existing items like settings or finder
];

const Dock: React.FC = () => {
  const openWindow = useWindowsStore((state) => state.openWindow);
  const openWindows = useWindowsStore((state) => state.openWindows);

  const handleIconClick = (item: (typeof dockItems)[0]) => {
    // Call the openWindow action
    openWindow(item.id, item.label, item.component);
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

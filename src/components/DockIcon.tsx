// src/components/DockIcon.tsx
import React from "react";
import { motion } from "framer-motion";
import styles from "./DockIcon.module.css";

interface DockIconProps {
  id: string; // Add id for data attribute
  src: string; // Path to the icon image
  alt: string; // Alt text for accessibility
  label: string; // Name of the application/portfolio item
  onClick: () => void; // Function to call when the icon is clicked
  isOpen?: boolean; // Optional: indicates if the corresponding window is open
}

const DockIcon: React.FC<DockIconProps> = ({
  id,
  src,
  alt,
  label,
  onClick,
  isOpen,
}) => {
  // Add hover animation
  const hoverScale = 1.2;

  return (
    // motion.div enables Framer Motion animations
    <motion.div
      className={styles.dockIcon}
      whileHover={{ scale: hoverScale, y: -10 }} // Scale up and move up slightly on hover
      whileTap={{ scale: 0.9 }} // Scale down slightly when clicked
      onClick={onClick}
      title={label} // Tooltip on hover
      data-window-id={id} // Add data attribute for targeting in minimize animation
    >
      <motion.img src={src} alt={alt} className={styles.iconImage} />
      {isOpen && <div className={styles.indicatorDot}></div>}{" "}
      {/* Conditional indicator dot */}
    </motion.div>
  );
};

export default DockIcon;

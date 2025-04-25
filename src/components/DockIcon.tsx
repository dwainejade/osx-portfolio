// src/components/DockIcon.tsx
import React from "react";
import { motion } from "framer-motion";
import styles from "./DockIcon.module.css";

interface DockIconProps {
  src: string; // Path to the icon image
  alt: string; // Alt text for accessibility
  label: string; // Name of the application/portfolio item
  onClick: () => void; // Function to call when the icon is clicked
  isOpen?: boolean; // Optional: indicates if the corresponding window is open
}

const DockIcon: React.FC<DockIconProps> = ({
  src,
  alt,
  label,
  onClick,
  isOpen,
}) => {
  return (
    // motion.div enables Framer Motion animations
    <motion.div
      className={styles.dockIcon}
      whileHover={{ scale: 1.15 }} // Scale up slightly on hover
      whileTap={{ scale: 0.95 }} // Scale down slightly when clicked
      onClick={onClick}
      title={label} // Tooltip on hover
    >
      <img src={src} alt={alt} className={styles.iconImage} />
      {isOpen && <div className={styles.indicatorDot}></div>}{" "}
      {/* Conditional indicator dot */}
    </motion.div>
  );
};

export default DockIcon;

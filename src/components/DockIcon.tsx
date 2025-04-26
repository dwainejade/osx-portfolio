import React from "react";
import { motion } from "framer-motion";
import styles from "./DockIcon.module.css";

interface DockIconProps {
  src: string; // Path to the icon image
  alt: string; // Alt text
  label: string; // Name of the application/portfolio item
  onClick: () => void;
  isOpen?: boolean;
}

const DockIcon: React.FC<DockIconProps> = ({
  src,
  alt,
  label,
  onClick,
  isOpen,
}) => {
  return (
    <motion.div
      className={styles.dockIcon}
      whileTap={{ filter: "brightness(.4)" }}
      onClick={onClick}
      title={label} // Tooltip
    >
      <img src={src} alt={alt} className={styles.iconImage} />
      {isOpen && <div className={styles.indicatorDot}></div>}{" "}
    </motion.div>
  );
};

export default DockIcon;

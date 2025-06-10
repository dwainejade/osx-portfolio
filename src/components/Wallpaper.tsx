import React from "react";
import styles from "./Wallpaper.module.css";

interface WallpaperProps {
  src: string;
  alt?: string;
}

const Wallpaper: React.FC<WallpaperProps> = ({ src, alt = "Wallpaper" }) => {
  return <div className={styles.wallpaper} style={{ backgroundImage: `url(${src})` }} aria-label={alt} />;
};

export default Wallpaper;

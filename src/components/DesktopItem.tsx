import React from "react";
import { useDrag } from "react-dnd";
import { DesktopItemData, ItemTypes } from "../store/desktopStore";
import styles from "./Desktop.module.css";

interface DesktopItemProps {
  item: DesktopItemData;
  gridSize: { width: number; height: number };
}

const DesktopItem: React.FC<DesktopItemProps> = ({ item, gridSize }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.DESKTOP_ICON,
    item: { id: item.id, originalPosition: item.position }, // Pass ID and original pos
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Calculate pixel position from grid position
  const pixelPosition = {
    left: item.position.x * gridSize.width,
    top: item.position.y * gridSize.height,
  };

  return (
    <div
      ref={drag}
      className={styles.desktopItem}
      style={{
        position: "absolute",
        left: `${pixelPosition.left}px`,
        top: `${pixelPosition.top}px`,
        width: `${gridSize.width}px`, // Set size to match grid cell
        height: `${gridSize.height}px`,
        opacity: isDragging ? 0.5 : 1,
        cursor: "default",
      }}
    >
      {/* Replace with actual icon based on item.type/item.icon */}
      <div className={styles.iconPlaceholder}>
        {/* {item.type === "folder" ? " Fldr" : " File"} */}
      </div>
      <span className={styles.iconLabel}>{item.name}</span>
    </div>
  );
};

export default DesktopItem;

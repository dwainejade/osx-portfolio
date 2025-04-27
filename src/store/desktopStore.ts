import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export interface DesktopItemData {
  id: string;
  type: "file" | "folder";
  name: string;
  icon: string; // Placeholder for icon path or identifier
  position: { x: number; y: number }; // Grid position (0,0), (1,0), etc.
}

interface DesktopState {
  items: DesktopItemData[];
  gridSize: { width: number; height: number }; // Size of each grid cell in pixels
  addItem: (newItemData: Omit<DesktopItemData, "id" | "position">) => void;
  updateItemPosition: (
    id: string,
    gridPosition: { x: number; y: number }
  ) => void;
  isOccupied: (gridPosition: { x: number; y: number }) => boolean;
  findNextAvailablePosition: () => { x: number; y: number };
}

// Example Grid Cell Size
const DEFAULT_GRID_WIDTH = 90;
const DEFAULT_GRID_HEIGHT = 100;

const useDesktopStore = create<DesktopState>((set, get) => ({
  items: [
    // Add some default items for testing
    {
      id: uuidv4(),
      type: "folder",
      name: "My Documents",
      icon: "folder-icon",
      position: { x: 0, y: 0 },
    },
    {
      id: uuidv4(),
      type: "file",
      name: "notes.txt",
      icon: "file-icon",
      position: { x: 0, y: 1 },
    },
  ],
  gridSize: { width: DEFAULT_GRID_WIDTH, height: DEFAULT_GRID_HEIGHT },

  isOccupied: (gridPosition) => {
    return get().items.some(
      (item) =>
        item.position.x === gridPosition.x && item.position.y === gridPosition.y
    );
  },

  findNextAvailablePosition: () => {
    const { items, isOccupied } = get();
    // Simple grid filling logic (column-first, then row) - adjust as needed
    // Determine max columns/rows based on assumed desktop size or keep it simple
    let position = { x: 0, y: 0 };
    let found = false;
    const maxAttempts = 1000; // Prevent infinite loop
    let attempts = 0;

    // Crude estimation of max Y based on typical screen height - refine this
    const maxY =
      Math.floor((window.innerHeight || 800) / DEFAULT_GRID_HEIGHT) - 1;

    while (!found && attempts < maxAttempts) {
      if (!isOccupied(position)) {
        found = true;
      } else {
        position.y++;
        if (position.y > maxY) {
          // Move to next column if end of row is reached
          position.y = 0;
          position.x++;
        }
      }
      attempts++;
    }
    if (!found) {
      console.warn("Could not find available desktop position easily.");
    } // Fallback or error
    return position;
  },

  addItem: (newItemData) => {
    const { findNextAvailablePosition } = get();
    const newPosition = findNextAvailablePosition();
    const newItem: DesktopItemData = {
      ...newItemData,
      id: uuidv4(),
      position: newPosition,
    };
    set((state) => ({ items: [...state.items, newItem] }));
  },

  updateItemPosition: (id, gridPosition) => {
    // Basic update: Allows overlapping for now.
    // TODO: Implement collision detection/shifting logic here for true macOS feel
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, position: gridPosition } : item
      ),
    }));
  },
}));

export default useDesktopStore;

// Define item type for react-dnd
export const ItemTypes = {
  DESKTOP_ICON: "desktop_icon",
};

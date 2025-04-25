// src/store/windowsStore.ts
import { create } from "zustand";

interface WindowState {
  id: string;
  title: string;
  component: string;
  position: { x: number; y: number };
}

interface WindowsState {
  openWindows: WindowState[];
  nextDefaultPositionOffset: number; // State to track offset for new windows

  openWindow: (
    id: string,
    title: string,
    component: string,
    initialPosition?: { x: number; y: number }
  ) => void;
  closeWindow: (id: string) => void;
  updateWindowPosition: (
    id: string,
    position: { x: number; y: number }
  ) => void;
}

// Assume default window size for centering calculation
const DEFAULT_WINDOW_WIDTH = 600;
const DEFAULT_WINDOW_HEIGHT = 400;
const OFFSET_INCREMENT = 20; // How much to offset each new window

const useWindowsStore = create<WindowsState>((set, get) => ({
  openWindows: [],
  nextDefaultPositionOffset: 0, // Initialize offset

  openWindow: (id, title, component, userProvidedPosition) => {
    const { openWindows, nextDefaultPositionOffset } = get();

    // Prevent opening if already open
    if (openWindows.find((window) => window.id === id)) {
      console.log(`Window ${id} is already open.`);
      // TODO: Bring existing window to front
      return;
    }

    let windowPosition = userProvidedPosition;

    // If no position was provided (e.g., from dock click), calculate a default
    if (!windowPosition) {
      // Calculate center based on current viewport size
      const centerX = window.innerWidth / 2 - DEFAULT_WINDOW_WIDTH / 2;
      const centerY = window.innerHeight / 2 - DEFAULT_WINDOW_HEIGHT / 2;

      // Apply the current offset
      windowPosition = {
        x: centerX + nextDefaultPositionOffset,
        y: centerY + nextDefaultPositionOffset,
      };

      // Increment the offset for the next window
      set((state) => ({
        nextDefaultPositionOffset:
          state.nextDefaultPositionOffset + OFFSET_INCREMENT,
      }));
    } else {
      // If a position was provided (e.g., maybe from saving/loading state later),
      // we might want to reset the offset or handle this differently,
      // but for now, just use the provided position.
      // We could also add logic here to check proximity to other windows
      // if userProvidedPosition is the *intended* spot.
    }

    const newWindow: WindowState = {
      id,
      title,
      component,
      position: windowPosition!, // Use the calculated or provided position
    };

    set((state) => ({
      openWindows: [...state.openWindows, newWindow],
    }));
  },

  closeWindow: (id) => {
    set((state) => ({
      openWindows: state.openWindows.filter((window) => window.id !== id),
      // Optional: Reset offset if all windows are closed?
      // if (state.openWindows.length === 1) { // Check if this is the last one
      //   nextDefaultPositionOffset: 0
      // }
    }));
    // Reset offset if all windows are closed (action receives current state before filter)
    if (get().openWindows.length === 1) {
      set({ nextDefaultPositionOffset: 0 });
    }
  },

  updateWindowPosition: (id, position) => {
    set((state) => ({
      openWindows: state.openWindows.map((window) =>
        window.id === id ? { ...window, position } : window
      ),
    }));
  },
}));

export default useWindowsStore;

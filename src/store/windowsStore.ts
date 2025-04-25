// src/store/windowsStore.ts
import { create } from "zustand";

// Define the possible states of a window
type WindowDisplayState = "normal" | "minimized" | "maximized";

interface WindowState {
  id: string;
  title: string;
  component: string;
  position: { x: number; y: number };
  size: { width: number; height: number }; // Add size to state
  state: WindowDisplayState; // Add display state
  prevPosition?: { x: number; y: number }; // Store position before maximize
  prevSize?: { width: number; height: number }; // Store size before maximize
  zIndex: number; // Add z-index for layering (MVP Extra Feature)
}

interface WindowsState {
  openWindows: WindowState[];
  nextDefaultPositionOffset: number;
  lastZIndex: number; // To manage z-index

  openWindow: (
    id: string,
    title: string,
    component: string,
    initialPosition?: { x: number; y: number },
    initialSize?: { width: number; height: number }
  ) => void;
  closeWindow: (id: string) => void;
  updateWindowPosition: (
    id: string,
    position: { x: number; y: number }
  ) => void;
  updateWindowSize: (
    id: string,
    size: { width: number; height: number }
  ) => void; // Action to update size
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  bringWindowToFront: (id: string) => void; // Action for z-index
}

const DEFAULT_WINDOW_WIDTH = 600;
const DEFAULT_WINDOW_HEIGHT = 400;
const OFFSET_INCREMENT = 20;

const useWindowsStore = create<WindowsState>((set, get) => ({
  openWindows: [],
  nextDefaultPositionOffset: 0,
  lastZIndex: 0, // Initialize z-index counter

  openWindow: (
    id,
    title,
    component,
    userProvidedPosition,
    userProvidedSize
  ) => {
    const { openWindows, nextDefaultPositionOffset, lastZIndex } = get();

    // Prevent opening if already open, and bring to front instead
    const existingWindow = openWindows.find((window) => window.id === id);
    if (existingWindow) {
      get().bringWindowToFront(id); // Bring existing to front
      console.log(`Window ${id} is already open, bringing to front.`);
      return;
    }

    let windowPosition = userProvidedPosition;
    const windowSize = userProvidedSize || {
      width: DEFAULT_WINDOW_WIDTH,
      height: DEFAULT_WINDOW_HEIGHT,
    };

    if (!windowPosition) {
      const centerX = window.innerWidth / 2 - windowSize.width / 2;
      const centerY = window.innerHeight / 2 - windowSize.height / 2;

      windowPosition = {
        x: centerX + nextDefaultPositionOffset,
        y: centerY + nextDefaultPositionOffset,
      };

      set((state) => ({
        nextDefaultPositionOffset:
          state.nextDefaultPositionOffset + OFFSET_INCREMENT,
      }));
    }

    // Increment z-index for the new window
    const newZIndex = lastZIndex + 1;
    set({ lastZIndex: newZIndex });

    const newWindow: WindowState = {
      id,
      title,
      component,
      position: windowPosition!,
      size: windowSize, // Save initial size
      state: "normal", // Initial state is normal
      zIndex: newZIndex, // Assign z-index
    };

    set((state) => ({
      openWindows: [...state.openWindows, newWindow],
    }));
  },

  closeWindow: (id) => {
    set((state) => ({
      openWindows: state.openWindows.filter((window) => window.id !== id),
    }));
    // Reset offset if all windows are closed
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

  updateWindowSize: (id, size) => {
    set((state) => ({
      openWindows: state.openWindows.map((window) =>
        window.id === id ? { ...window, size } : window
      ),
    }));
  },

  minimizeWindow: (id) => {
    // TODO: Implement animation logic in component, just update state here
    set((state) => ({
      openWindows: state.openWindows.map((window) =>
        window.id === id ? { ...window, state: "minimized" } : window
      ),
    }));
    // Optional: Send to back when minimized?
    // get().sendWindowToBack(id);
  },

  maximizeWindow: (id) => {
    set((state) => ({
      openWindows: state.openWindows.map((window) => {
        if (window.id === id) {
          // Store current size/position before maximizing
          return {
            ...window,
            state: "maximized",
            prevPosition: window.position,
            prevSize: window.size,
            position: { x: 0, y: 0 }, // Maximize to top-left (will cover entire desktop area)
            size: { width: window.innerWidth, height: window.innerHeight }, // Maximize to viewport size
          };
        }
        return window;
      }),
    }));
    get().bringWindowToFront(id); // Bring maximized window to front
  },

  restoreWindow: (id) => {
    set((state) => ({
      openWindows: state.openWindows.map((window) => {
        if (
          window.id === id &&
          window.state === "maximized" &&
          window.prevPosition &&
          window.prevSize
        ) {
          // Restore to previous size/position
          return {
            ...window,
            state: "normal",
            position: window.prevPosition,
            size: window.prevSize,
            prevPosition: undefined, // Clear previous state
            prevSize: undefined,
          };
        }
        return window;
      }),
    }));
    get().bringWindowToFront(id); // Bring restored window to front
  },

  bringWindowToFront: (id) => {
    const { openWindows, lastZIndex } = get();
    const windowToFront = openWindows.find((window) => window.id === id);

    if (!windowToFront || windowToFront.zIndex === lastZIndex) {
      return; // Already front or doesn't exist
    }

    const newZIndex = lastZIndex + 1;
    set({ lastZIndex: newZIndex });

    set((state) => ({
      openWindows: state.openWindows
        .map((window) =>
          window.id === id ? { ...window, zIndex: newZIndex } : window
        )
        .sort((a, b) => a.zIndex - b.zIndex), // Keep the array sorted by z-index
    }));
  },
  // Optional: Action to send a window to the back (e.g., when minimized)
  // sendWindowToBack: (id) => { ... }
}));

export default useWindowsStore;

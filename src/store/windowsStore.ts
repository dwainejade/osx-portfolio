import { create } from "zustand";

// Assuming these constants and types exist elsewhere
const DEFAULT_WINDOW_WIDTH = 600;
const DEFAULT_WINDOW_HEIGHT = 400;
const OFFSET_INCREMENT = 30;

interface WindowPosition {
  x: number;
  y: number;
}

interface WindowSize {
  width: number;
  height: number;
}

export type WindowStateValue = "normal" | "minimized" | "maximized";

export interface WindowState {
  id: string;
  title: string;
  component: string;
  position: { x: number; y: number };
  size: { width: number; height: number }; // Add size to state
  state: WindowStateValue; // Add display state
  prevPosition?: { x: number; y: number }; // Store position before maximize
  prevSize?: { width: number; height: number }; // Store size before maximize
  zIndex: number; // Add z-index for layering (MVP Extra Feature)
  props?: Record<string, any>; // Add props to store component-specific properties
}

interface WindowsStoreState {
  openWindows: WindowState[];
  nextDefaultPositionOffset: number;
  lastZIndex: number;
  openWindow: (
    id: string,
    title: string,
    component: string,
    initialPosition?: { x: number; y: number },
    initialSize?: { width: number; height: number },
    props?: Record<string, any>
  ) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void; // Ensure this exists
  bringWindowToFront: (id: string) => void; // Ensure this exists
  updateWindowPosition: (id: string, position: WindowPosition) => void; // Assuming exists
  updateWindowSize: (id: string, size: WindowSize) => void; // Assuming exists
}

const useWindowsStore = create<WindowsStoreState>((set, get) => ({
  openWindows: [],
  nextDefaultPositionOffset: 0,
  lastZIndex: 0, // Initialize z-index counter

  openWindow: (
    id,
    title,
    component,
    userProvidedPosition,
    userProvidedSize,
    props
  ) => {
    const { openWindows, nextDefaultPositionOffset, lastZIndex } = get();

    const existingWindow = openWindows.find((window) => window.id === id);

    // --- MODIFICATION START ---
    if (existingWindow) {
      // Check if the existing window is minimized
      if (existingWindow.state === "minimized") {
        // Restore the minimized window instead of just bringing to front
        console.log(`Window ${id} is minimized, restoring...`);
        // Call the dedicated restore function (which should also handle zIndex)
        get().restoreWindow(id);
      } else {
        // If it exists but is normal or maximized, just bring it to the front
        console.log(
          `Window ${id} is already open (${existingWindow.state}), bringing to front.`
        );
        get().bringWindowToFront(id);
      }
      return; // Stop execution, don't create a new window
    }
    // --- MODIFICATION END ---

    // --- Logic for creating a NEW window (remains the same) ---
    let windowPosition = userProvidedPosition;
    const windowSize = userProvidedSize || {
      width: DEFAULT_WINDOW_WIDTH,
      height: DEFAULT_WINDOW_HEIGHT,
    };

    if (!windowPosition) {
      // Calculate centered position with offset
      const safeInnerWidth =
        typeof window !== "undefined" ? window.innerWidth : 1024; // Fallback for SSR
      const safeInnerHeight =
        typeof window !== "undefined" ? window.innerHeight : 768; // Fallback for SSR
      const centerX = safeInnerWidth / 2 - windowSize.width / 2;
      const centerY = safeInnerHeight / 2 - windowSize.height / 2;

      windowPosition = {
        x: centerX + nextDefaultPositionOffset,
        y: centerY + nextDefaultPositionOffset,
      };

      // Update offset for the next window
      set((state) => ({
        nextDefaultPositionOffset:
          (state.nextDefaultPositionOffset + OFFSET_INCREMENT) %
          (5 * OFFSET_INCREMENT), // Cycle offset
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
      size: windowSize,
      state: "normal",
      zIndex: newZIndex,
      props, // Assign the highest z-index
    };

    set((state) => ({
      openWindows: [...state.openWindows, newWindow],
    }));
  },

  closeWindow: (id) => {
    set((state) => ({
      openWindows: state.openWindows.filter((win) => win.id !== id),
    }));
    // Optional: Reset offset if no windows are open?
    if (get().openWindows.length === 1) {
      // Checking length *after* filter means 0 left
      set({ nextDefaultPositionOffset: 0 });
    }
  },

  minimizeWindow: (id) => {
    set((state) => ({
      openWindows: state.openWindows.map((win) =>
        win.id === id ? { ...win, state: "minimized" } : win
      ),
      // Note: Minimizing usually doesn't change z-index relative to others,
      // but bringing another window to front later will.
    }));
  },

  maximizeWindow: (id) => {
    // Store pre-maximize state if needed here before changing state
    const { lastZIndex } = get();
    const newZIndex = lastZIndex + 1;
    set((state) => ({
      openWindows: state.openWindows.map((win) =>
        win.id === id
          ? {
              ...win,
              state: "maximized",
              zIndex: newZIndex, // Bring to front when maximizing
            }
          : win
      ),
      lastZIndex: newZIndex,
    }));
  },

  // --- RESTORE FUNCTION (Crucial for the logic) ---
  restoreWindow: (id) => {
    set((state) => {
      const windowToRestore = state.openWindows.find((w) => w.id === id);
      if (!windowToRestore) return state;

      // Create a new window object with state set to normal
      // and using prevPosition/prevSize if available
      const restoredWindow = {
        ...windowToRestore,
        state: "normal" as const,
        position: windowToRestore.prevPosition || windowToRestore.position,
        size: windowToRestore.prevSize || windowToRestore.size,
        // Clear prev values
        prevPosition: undefined,
        prevSize: undefined,
      };

      // Update all windows
      return {
        openWindows: state.openWindows.map((w) =>
          w.id === id ? restoredWindow : w
        ),
      };
    });

    // After restoring, bring to front
    get().bringWindowToFront(id);
  },

  // --- BRING TO FRONT FUNCTION (Used by openWindow and others) ---
  bringWindowToFront: (id) => {
    // Only bring to front if it's not already the top-most window
    const currentWindow = get().openWindows.find((win) => win.id === id);
    const { lastZIndex } = get();

    if (currentWindow && currentWindow.zIndex <= lastZIndex) {
      const newZIndex = lastZIndex + 1;
      set((state) => ({
        openWindows: state.openWindows.map((win) =>
          win.id === id ? { ...win, zIndex: newZIndex } : win
        ),
        lastZIndex: newZIndex,
      }));
    }
  },

  // --- UPDATE POSITION/SIZE (Needed by react-rnd handlers) ---
  updateWindowPosition: (id, position) => {
    set((state) => ({
      openWindows: state.openWindows.map((window) =>
        window.id === id
          ? {
              ...window,
              position,
              // Store the new position even if maximized (for restore)
              ...(window.state === "maximized"
                ? { prevPosition: position }
                : {}),
            }
          : window
      ),
    }));

    // Log for debugging
    console.log(`Position updated for window ${id}:`, position);
  },

  updateWindowSize: (id, size) => {
    set((state) => ({
      openWindows: state.openWindows.map((window) =>
        window.id === id
          ? {
              ...window,
              size,
              // Store the new size even if maximized (for restore)
              ...(window.state === "maximized" ? { prevSize: size } : {}),
            }
          : window
      ),
    }));

    // Log for debugging
    console.log(`Size updated for window ${id}:`, size);
  },
}));

export default useWindowsStore;

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

interface NavigationState {
  history: any[]; // Store navigation history (can be component states, routes, etc.)
  currentIndex: number; // Current position in history
}

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
  navigation?: NavigationState; // Add navigation state
}

interface WindowsStoreState {
  openWindows: WindowState[];
  nextDefaultPositionOffset: number;
  lastZIndex: number;

  // Window management
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
  restoreWindow: (id: string) => void;
  bringWindowToFront: (id: string) => void;
  updateWindowPosition: (id: string, position: WindowPosition) => void;
  updateWindowSize: (id: string, size: WindowSize) => void;
  updateWindowTitle: (id: string, title: string) => void;

  // Navigation functions
  navigateWindowTo: (id: string, data: any) => void;
  navigateWindowBack: (id: string) => void;
  navigateWindowForward: (id: string) => void;
  canNavigateBack: (id: string) => boolean;
  canNavigateForward: (id: string) => boolean;
  initializeWindowNavigation: (id: string, initialData?: any) => void;
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
      navigation: {
        history: [],
        currentIndex: -1,
      },
    };

    set((state) => ({
      openWindows: [...state.openWindows, newWindow],
    }));

    // Initialize window navigation if appropriate
    if (
      props &&
      (component === "markdown" ||
        component === "projects-list" ||
        component === "blog-list")
    ) {
      // We can use setTimeout to ensure the window is added to state first
      setTimeout(() => {
        get().initializeWindowNavigation(id, props);
      }, 0);
    }
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

  // --- UPDATE WINDOW TITLE ---
  updateWindowTitle: (id, title) => {
    set((state) => ({
      openWindows: state.openWindows.map((window) =>
        window.id === id
          ? {
              ...window,
              title,
            }
          : window
      ),
    }));

    console.log(`Title updated for window ${id}:`, title);
  },

  // --- NAVIGATION FUNCTIONS ---

  // Initialize window navigation state
  initializeWindowNavigation: (id, initialData) => {
    if (!initialData) return;

    set((state) => {
      const windowToUpdate = state.openWindows.find((w) => w.id === id);
      if (!windowToUpdate) return state;

      return {
        openWindows: state.openWindows.map((window) =>
          window.id === id
            ? {
                ...window,
                navigation: {
                  history: [initialData],
                  currentIndex: 0,
                },
              }
            : window
        ),
      };
    });

    console.log(`Navigation initialized for window ${id}`);
  },

  // Navigate to a new state (adds to history)
  navigateWindowTo: (id, data) => {
    set((state) => {
      const windowToUpdate = state.openWindows.find((w) => w.id === id);
      if (!windowToUpdate || !windowToUpdate.navigation) return state;

      const { navigation } = windowToUpdate;

      // Create new history array by cutting off any forward history and adding new entry
      const newHistory = [
        ...navigation.history.slice(0, navigation.currentIndex + 1),
        data,
      ];

      // Log for debugging
      console.log("Navigating to new state:", data);
      console.log("New history:", newHistory);

      // Update navigation state and props
      return {
        openWindows: state.openWindows.map((window) =>
          window.id === id
            ? {
                ...window,
                navigation: {
                  history: newHistory,
                  currentIndex: newHistory.length - 1,
                },
                props: data,
                title: data.title || window.title,
              }
            : window
        ),
      };
    });

    console.log(`Navigated to new state in window ${id}`);
  },

  // Navigate back
  navigateWindowBack: (id) => {
    set((state) => {
      const windowToUpdate = state.openWindows.find((w) => w.id === id);
      if (!windowToUpdate || !windowToUpdate.navigation) return state;

      const { navigation } = windowToUpdate;

      // Check if we can navigate back
      if (navigation.currentIndex <= 0) return state;

      // Decrement index
      const newIndex = navigation.currentIndex - 1;

      // Get the previous data
      const previousData = navigation.history[newIndex];

      // Update window props with the previous data
      return {
        openWindows: state.openWindows.map((window) =>
          window.id === id
            ? {
                ...window,
                navigation: {
                  ...navigation,
                  currentIndex: newIndex,
                },
                props: {
                  ...window.props,
                  ...previousData,
                },
                title: previousData.title || window.title,
              }
            : window
        ),
      };
    });

    console.log(`Navigated back in window ${id}`);
  }, // Updated navigation functions in windowsStore.ts

  // Navigate back
  navigateWindowBack: (id) => {
    set((state) => {
      const windowToUpdate = state.openWindows.find((w) => w.id === id);
      if (!windowToUpdate || !windowToUpdate.navigation) return state;

      const { navigation } = windowToUpdate;

      // Check if we can navigate back
      if (navigation.currentIndex <= 0) return state;

      // Decrement index
      const newIndex = navigation.currentIndex - 1;

      // Get the previous data
      const previousData = navigation.history[newIndex];

      // Log for debugging
      console.log("Navigating back to:", previousData);

      // Update window props and title
      return {
        openWindows: state.openWindows.map((window) =>
          window.id === id
            ? {
                ...window,
                navigation: {
                  ...navigation,
                  currentIndex: newIndex,
                },
                // Replace entire props object to ensure component gets new props
                props: previousData,
                title: previousData.title || window.title,
              }
            : window
        ),
      };
    });

    console.log(`Navigated back in window ${id}`);
  },

  // Navigate forward
  navigateWindowForward: (id) => {
    set((state) => {
      const windowToUpdate = state.openWindows.find((w) => w.id === id);
      if (!windowToUpdate || !windowToUpdate.navigation) return state;

      const { navigation } = windowToUpdate;

      // Check if we can navigate forward
      if (navigation.currentIndex >= navigation.history.length - 1)
        return state;

      // Increment index
      const newIndex = navigation.currentIndex + 1;

      // Get the next data
      const nextData = navigation.history[newIndex];

      // Log for debugging
      console.log("Navigating forward to:", nextData);

      // Update window props and title
      return {
        openWindows: state.openWindows.map((window) =>
          window.id === id
            ? {
                ...window,
                navigation: {
                  ...navigation,
                  currentIndex: newIndex,
                },
                // Replace entire props object to ensure component gets new props
                props: nextData,
                title: nextData.title || window.title,
              }
            : window
        ),
      };
    });

    console.log(`Navigated forward in window ${id}`);
  },

  // Check if can navigate back
  canNavigateBack: (id) => {
    const windowToCheck = get().openWindows.find((w) => w.id === id);
    if (!windowToCheck || !windowToCheck.navigation) return false;

    return windowToCheck.navigation.currentIndex > 0;
  },

  // Check if can navigate forward
  canNavigateForward: (id) => {
    const windowToCheck = get().openWindows.find((w) => w.id === id);
    if (!windowToCheck || !windowToCheck.navigation) return false;

    return (
      windowToCheck.navigation.currentIndex <
      windowToCheck.navigation.history.length - 1
    );
  },
}));

export default useWindowsStore;

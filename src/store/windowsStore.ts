// src/store/windowsStore.ts with enhanced debugging
import { create } from "zustand";

// Constants
const DEFAULT_WINDOW_WIDTH = 600;
const DEFAULT_WINDOW_HEIGHT = 400;
const OFFSET_INCREMENT = 30;

// Debug flag - set to true to enable detailed logging
const DEBUG = true;

// Debug logging utility
const debugLog = (...args: any[]) => {
  if (DEBUG) {
    console.log(`[WindowsStore]`, ...args);
  }
};

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
  history: any[];
  currentIndex: number;
}

export interface WindowState {
  id: string;
  title: string;
  component: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  state: WindowStateValue;
  prevPosition?: { x: number; y: number };
  prevSize?: { width: number; height: number };
  zIndex: number;
  props?: Record<string, any>;
  navigation?: NavigationState;
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

// Helper function to find non-overlapping positions
function findNonOverlappingPosition(
  initialPosition: WindowPosition,
  size: WindowSize,
  existingWindows: WindowState[]
): WindowPosition {
  debugLog("Finding non-overlapping position from:", initialPosition);
  
  // If no windows are open, just use the initial position
  if (existingWindows.length === 0) {
    debugLog("No existing windows, using initial position");
    return initialPosition;
  }

  let newPosition = { ...initialPosition };
  let attempts = 0;
  const MAX_ATTEMPTS = 25; // Limit attempts to prevent infinite loop
  
  // Get viewport dimensions
  const safeInnerWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
  const safeInnerHeight = typeof window !== "undefined" ? window.innerHeight : 768;
  
  debugLog("Viewport size:", { width: safeInnerWidth, height: safeInnerHeight });
  
  // Function to check if a window overlaps with another
  const checkOverlap = (posX: number, posY: number) => {
    // Define the rectangle of the new window
    const newRect = {
      left: posX,
      right: posX + size.width,
      top: posY,
      bottom: posY + size.height
    };
    
    // Check for overlap with any existing window
    for (const win of existingWindows) {
      // Skip minimized windows
      if (win.state === "minimized") continue;
      
      // Define the rectangle of the existing window
      const existingRect = {
        left: win.position.x,
        right: win.position.x + win.size.width,
        top: win.position.y,
        bottom: win.position.y + win.size.height
      };
      
      // Check for overlap (simplified - just check if centers are close enough)
      const newCenterX = (newRect.left + newRect.right) / 2;
      const newCenterY = (newRect.top + newRect.bottom) / 2;
      const existingCenterX = (existingRect.left + existingRect.right) / 2;
      const existingCenterY = (existingRect.top + existingRect.bottom) / 2;
      
      const centerTooClose = 
        Math.abs(newCenterX - existingCenterX) < 50 &&
        Math.abs(newCenterY - existingCenterY) < 50;
      
      if (centerTooClose) {
        debugLog("Overlap detected with window:", win.id, "at position:", { x: posX, y: posY });
        return true;
      }
    }
    
    return false;
  };
  
  // Try to find a non-overlapping position
  while (checkOverlap(newPosition.x, newPosition.y) && attempts < MAX_ATTEMPTS) {
    attempts++;
    
    // Apply offset with a cascading effect
    newPosition.x += OFFSET_INCREMENT;
    newPosition.y += OFFSET_INCREMENT;
    
    debugLog("Attempt", attempts, "- Checking position:", newPosition);
    
    // Ensure window stays within viewport bounds (with margin for dock)
    if (newPosition.x + size.width > safeInnerWidth - 20) {
      debugLog("Position would go off-screen right, resetting x");
      newPosition.x = 20;
    }
    
    if (newPosition.y + size.height > safeInnerHeight - 100) {
      debugLog("Position would go off-screen bottom, resetting y");
      newPosition.y = 40;
    }
  }
  
  debugLog("Final position after", attempts, "attempts:", newPosition);
  return newPosition;
}

const useWindowsStore = create<WindowsStoreState>((set, get) => ({
  openWindows: [],
  nextDefaultPositionOffset: 0,
  lastZIndex: 0,

  openWindow: (
    id,
    title,
    component,
    userProvidedPosition,
    userProvidedSize,
    props
  ) => {
    debugLog("Opening window:", { id, title, component });
    
    const { openWindows, nextDefaultPositionOffset, lastZIndex } = get();
    
    // Check if window already exists
    const existingWindow = openWindows.find((window) => window.id === id);

    if (existingWindow) {
      debugLog("Window already exists:", existingWindow);
      
      if (existingWindow.state === "minimized") {
        debugLog("Window is minimized, restoring");
        get().restoreWindow(id);
      } else {
        debugLog("Window is open, bringing to front");
        get().bringWindowToFront(id);
      }
      return;
    }

    debugLog("Creating new window");
    
    // Configure window size
    const windowSize = userProvidedSize || {
      width: DEFAULT_WINDOW_WIDTH,
      height: DEFAULT_WINDOW_HEIGHT,
    };
    
    debugLog("Window size:", windowSize);

    // Configure window position
    let windowPosition = userProvidedPosition;
    
    if (!windowPosition) {
      debugLog("No position provided, calculating position");
      
      // Get viewport dimensions
      const safeInnerWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
      const safeInnerHeight = typeof window !== "undefined" ? window.innerHeight : 768;
      
      // Start with center position
      const centerX = Math.max(0, (safeInnerWidth / 2) - (windowSize.width / 2));
      const centerY = Math.max(0, (safeInnerHeight / 2) - (windowSize.height / 2));
      
      windowPosition = { x: centerX, y: centerY };
      
      debugLog("Initial centered position:", windowPosition);
      
      // Check for position collisions and adjust if needed
      windowPosition = findNonOverlappingPosition(
        windowPosition, 
        windowSize, 
        openWindows
      );
      
      debugLog("Final position after collision detection:", windowPosition);
    } else {
      debugLog("Using provided position:", windowPosition);
    }
    
    // Increment z-index for the new window
    const newZIndex = lastZIndex + 1;
    debugLog("New z-index:", newZIndex);
    
    set({ lastZIndex: newZIndex });

    const newWindow: WindowState = {
      id,
      title,
      component,
      position: windowPosition!,
      size: windowSize,
      state: "normal",
      zIndex: newZIndex,
      props,
      navigation: {
        history: [],
        currentIndex: -1,
      },
    };
    
    debugLog("Adding new window to state:", newWindow);

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
      debugLog("Window supports navigation, initializing...");
      setTimeout(() => {
        get().initializeWindowNavigation(id, props);
      }, 0);
    }
  },

  closeWindow: (id) => {
    debugLog("Closing window:", id);
    set((state) => ({
      openWindows: state.openWindows.filter((win) => win.id !== id),
    }));
  },

  minimizeWindow: (id) => {
    debugLog("Minimizing window:", id);
    set((state) => ({
      openWindows: state.openWindows.map((win) =>
        win.id === id ? { ...win, state: "minimized" } : win
      ),
    }));
  },

  maximizeWindow: (id) => {
    debugLog("Maximizing window:", id);
    const { lastZIndex } = get();
    const newZIndex = lastZIndex + 1;
    set((state) => ({
      openWindows: state.openWindows.map((win) =>
        win.id === id
          ? {
              ...win,
              state: "maximized",
              zIndex: newZIndex,
            }
          : win
      ),
      lastZIndex: newZIndex,
    }));
  },

  restoreWindow: (id) => {
    debugLog("Restoring window:", id);
    set((state) => {
      const windowToRestore = state.openWindows.find((w) => w.id === id);
      if (!windowToRestore) {
        debugLog("Window not found for restore:", id);
        return state;
      }

      debugLog("Current window state:", windowToRestore);
      debugLog("Restore position:", windowToRestore.prevPosition || windowToRestore.position);
      debugLog("Restore size:", windowToRestore.prevSize || windowToRestore.size);

      const restoredWindow = {
        ...windowToRestore,
        state: "normal" as const,
        position: windowToRestore.prevPosition || windowToRestore.position,
        size: windowToRestore.prevSize || windowToRestore.size,
        prevPosition: undefined,
        prevSize: undefined,
      };

      return {
        openWindows: state.openWindows.map((w) =>
          w.id === id ? restoredWindow : w
        ),
      };
    });

    // After restoring, bring to front
    get().bringWindowToFront(id);
  },

  bringWindowToFront: (id) => {
    const currentWindow = get().openWindows.find((win) => win.id === id);
    const { lastZIndex } = get();

    if (!currentWindow) {
      debugLog("Window not found for bringing to front:", id);
      return;
    }

    debugLog("Current window z-index:", currentWindow.zIndex, "last z-index:", lastZIndex);

    if (currentWindow.zIndex <= lastZIndex) {
      const newZIndex = lastZIndex + 1;
      debugLog("Bringing window to front with new z-index:", newZIndex);
      
      set((state) => ({
        openWindows: state.openWindows.map((win) =>
          win.id === id ? { ...win, zIndex: newZIndex } : win
        ),
        lastZIndex: newZIndex,
      }));
    } else {
      debugLog("Window already at front, no action needed");
    }
  },

  updateWindowPosition: (id, position) => {
    debugLog("Updating window position:", id, position);
    set((state) => ({
      openWindows: state.openWindows.map((window) =>
        window.id === id
          ? {
              ...window,
              position,
              ...(window.state === "maximized"
                ? { prevPosition: position }
                : {}),
            }
          : window
      ),
    }));
  },

  updateWindowSize: (id, size) => {
    debugLog("Updating window size:", id, size);
    set((state) => ({
      openWindows: state.openWindows.map((window) =>
        window.id === id
          ? {
              ...window,
              size,
              ...(window.state === "maximized" ? { prevSize: size } : {}),
            }
          : window
      ),
    }));
  },

  updateWindowTitle: (id, title) => {
    debugLog("Updating window title:", id, title);
    set((state) => ({
      openWindows: state.openWindows.map((window) =>
        window.id === id ? { ...window, title } : window
      ),
    }));
  },

  // Navigation functions
  initializeWindowNavigation: (id, initialData) => {
    if (!initialData) {
      debugLog("No initial data for navigation, skipping initialization");
      return;
    }

    debugLog("Initializing window navigation:", id, "with data:", initialData);

    set((state) => {
      const windowToUpdate = state.openWindows.find((w) => w.id === id);
      if (!windowToUpdate) {
        debugLog("Window not found for navigation initialization:", id);
        return state;
      }

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
    
    // Log the updated state
    const updatedWindow = get().openWindows.find(w => w.id === id);
    debugLog("Navigation initialized, window state:", updatedWindow);
  },

  navigateWindowTo: (id, data) => {
    debugLog("Navigating window to new state:", id, data);
    
    set((state) => {
      const windowToUpdate = state.openWindows.find((w) => w.id === id);
      if (!windowToUpdate || !windowToUpdate.navigation) {
        debugLog("Window not found or has no navigation state:", id);
        return state;
      }

      const { navigation } = windowToUpdate;
      debugLog("Current navigation state:", navigation);

      const newHistory = [
        ...navigation.history.slice(0, navigation.currentIndex + 1),
        data,
      ];
      
      debugLog("New history:", newHistory, "new index:", newHistory.length - 1);

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
    
    // Log the updated state
    const updatedWindow = get().openWindows.find(w => w.id === id);
    debugLog("After navigation, window state:", updatedWindow);
  },

  navigateWindowBack: (id) => {
    debugLog("Attempting to navigate back:", id);
    
    set((state) => {
      const windowToUpdate = state.openWindows.find((w) => w.id === id);
      if (!windowToUpdate || !windowToUpdate.navigation) {
        debugLog("Window not found or has no navigation state:", id);
        return state;
      }

      const { navigation } = windowToUpdate;
      debugLog("Current navigation state:", navigation);
      
      if (navigation.currentIndex <= 0) {
        debugLog("Already at beginning of history, cannot go back");
        return state;
      }

      const newIndex = navigation.currentIndex - 1;
      const previousData = navigation.history[newIndex];
      
      debugLog("New index:", newIndex, "previous data:", previousData);

      return {
        openWindows: state.openWindows.map((window) =>
          window.id === id
            ? {
                ...window,
                navigation: {
                  ...navigation,
                  currentIndex: newIndex,
                },
                props: previousData,
                title: previousData.title || window.title,
              }
            : window
        ),
      };
    });
    
    // Log the updated state
    const updatedWindow = get().openWindows.find(w => w.id === id);
    debugLog("After navigate back, window state:", updatedWindow);
  },

  navigateWindowForward: (id) => {
    debugLog("Attempting to navigate forward:", id);
    
    set((state) => {
      const windowToUpdate = state.openWindows.find((w) => w.id === id);
      if (!windowToUpdate || !windowToUpdate.navigation) {
        debugLog("Window not found or has no navigation state:", id);
        return state;
      }

      const { navigation } = windowToUpdate;
      debugLog("Current navigation state:", navigation);
      
      if (navigation.currentIndex >= navigation.history.length - 1) {
        debugLog("Already at end of history, cannot go forward");
        return state;
      }

      const newIndex = navigation.currentIndex + 1;
      const nextData = navigation.history[newIndex];
      
      debugLog("New index:", newIndex, "next data:", nextData);

      return {
        openWindows: state.openWindows.map((window) =>
          window.id === id
            ? {
                ...window,
                navigation: {
                  ...navigation,
                  currentIndex: newIndex,
                },
                props: nextData,
                title: nextData.title || window.title,
              }
            : window
        ),
      };
    });
    
    // Log the updated state
    const updatedWindow = get().openWindows.find(w => w.id === id);
    debugLog("After navigate forward, window state:", updatedWindow);
  },

  canNavigateBack: (id) => {
    const windowToCheck = get().openWindows.find((w) => w.id === id);
    if (!windowToCheck || !windowToCheck.navigation) {
      debugLog("canNavigateBack: Window not found or has no navigation state:", id);
      return false;
    }
    
    const result = windowToCheck.navigation.currentIndex > 0;
    debugLog("canNavigateBack:", id, "result:", result, "current index:", windowToCheck.navigation.currentIndex);
    return result;
  },

  canNavigateForward: (id) => {
    const windowToCheck = get().openWindows.find((w) => w.id === id);
    if (!windowToCheck || !windowToCheck.navigation) {
      debugLog("canNavigateForward: Window not found or has no navigation state:", id);
      return false;
    }
    
    const result = windowToCheck.navigation.currentIndex < windowToCheck.navigation.history.length - 1;
    debugLog("canNavigateForward:", id, "result:", result, 
      "current index:", windowToCheck.navigation.currentIndex,
      "history length:", windowToCheck.navigation.history.length);
    return result;
  },
}));

export default useWindowsStore;
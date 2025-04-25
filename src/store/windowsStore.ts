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

const useWindowsStore = create<WindowsState>((set, get) => ({
  openWindows: [],

  openWindow: (id, title, component, initialPosition = { x: 100, y: 100 }) => {
    const { openWindows } = get();
    if (openWindows.find((window) => window.id === id)) {
      console.log(`Window ${id} is already open.`);
      // TODO: Bring existing window to front
      return;
    }

    const newWindow: WindowState = {
      id,
      title,
      component,
      position: initialPosition,
    };

    set((state) => ({
      openWindows: [...state.openWindows, newWindow],
    }));
  },

  closeWindow: (id) => {
    set((state) => ({
      openWindows: state.openWindows.filter((window) => window.id !== id),
    }));
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

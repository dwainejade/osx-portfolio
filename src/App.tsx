// src/App.tsx
import { AnimatePresence } from "framer-motion";
import styles from "./App.module.css";
import Dock from "./components/Dock";
import Window from "./components/Window";
import useWindowsStore from "./store/windowsStore";

function App() {
  // Get the list of open windows from the store
  // Ensure the array is sorted by zIndex before mapping
  const openWindows = useWindowsStore((state) =>
    state.openWindows.sort((a, b) => a.zIndex - b.zIndex)
  );

  // --- Add this log to inspect the state ---
  console.log("App.tsx rendering - openWindows state:", openWindows);
  // -----------------------------------------

  return (
    <div className={styles.desktop}>
      {/* Menu Bar */}

      {/* Desktop Icons */}

      <AnimatePresence>
        {/* Map over open windows and render a Window component for each */}
        {/* Filter out minimized windows from being rendered */}
        {openWindows.map((windowState) => (
          <Window
            key={windowState.id}
            id={windowState.id}
            title={windowState.title}
            component={windowState.component}
            position={windowState.position} // Pass position
            size={windowState.size} // Pass size
            currentState={windowState.state} // Pass state
            zIndex={windowState.zIndex} // Pass z-index
          />
        ))}
      </AnimatePresence>

      {openWindows.length === 0 && (
        <p className={styles.welcomeText}>Welcome to my macOS Portfolio!</p>
      )}

      <Dock />
    </div>
  );
}

export default App;

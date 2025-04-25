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

  return (
    <div className={styles.desktop}>
      {/* Menu Bar */}

      {/* Desktop Icons */}

      <AnimatePresence>
        {/* Map over open windows and render a Window component for each */}
        {openWindows.map((windowState) => (
          <Window
            key={windowState.id}
            id={windowState.id}
            title={windowState.title}
            component={windowState.component}
            initialPosition={windowState.position}
            initialSize={windowState.size} // Pass size
            currentState={windowState.state} // Pass state
            zIndex={windowState.zIndex} // Pass z-index
          />
        ))}
      </AnimatePresence>

      {openWindows.length === 0 && (
        <p className={styles.welcomeText}>
          Hi, I'm Dwaine! This site is still a work in progress. Please click
          around and have fun!
        </p>
      )}

      <Dock />
    </div>
  );
}

export default App;

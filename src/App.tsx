import { AnimatePresence } from "framer-motion";
import styles from "./App.module.css";
import Dock from "./components/Dock";
import Window from "./components/Window";
import useWindowsStore from "./store/windowsStore";

function App() {
  const openWindows = useWindowsStore((state) => state.openWindows);

  return (
    <div className={styles.desktop}>
      {/* Menu Bar */}
      {/* Desktop Icons */}
      <AnimatePresence>
        {openWindows.map((windowState) => (
          <Window
            key={windowState.id}
            id={windowState.id}
            title={windowState.title}
            component={windowState.component}
            initialPosition={windowState.position}
          />
        ))}
      </AnimatePresence>
      <Dock /> {/* Add the Dock component */}
      {/* Windows will be rendered here later */}
    </div>
  );
}

export default App;

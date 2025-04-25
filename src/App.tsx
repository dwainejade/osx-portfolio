// src/App.tsx
import styles from "./App.module.css";
import Dock from "./components/Dock"; // Import the Dock component

function App() {
  return (
    <div className={styles.desktop}>
      {/* Menu Bar will go here later */}
      {/* Desktop Icons will go here later */}
      {/* Optional: initial text */}
      <Dock /> {/* Add the Dock component */}
      {/* Windows will be rendered here later */}
    </div>
  );
}

export default App;

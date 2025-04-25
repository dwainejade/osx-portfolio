// src/App.tsx
import styles from "./App.module.css";

function App() {
  return (
    <div className={styles.desktop}>
      {/* This is where we will add other elements like the menu bar, dock, and windows */}
      <p className={styles.welcomeText}>Welcome to my macOS Portfolio!</p>{" "}
      {/* Optional: add some initial text */}
    </div>
  );
}

export default App;

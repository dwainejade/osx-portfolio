// In your App.tsx
// import Desktop from "./components/Desktop";
import Dock from "./components/Dock";
import Window from "./components/Window";
import TopMenu from "./components/TopMenu";
import useWindowsStore from "./store/windowsStore";
// import { initializeFileSystem } from "./store/fileSystemStore";
import styles from "./App.module.css";

function App() {
  // Initialize file system on first render
  // useEffect(() => {
  //   initializeFileSystem();
  // }, []);

  const openWindows = useWindowsStore((state) =>
    state.openWindows.sort((a, b) => a.zIndex - b.zIndex)
  );

  return (
    <div className={styles.mainCon}>
      <TopMenu />

      <div className={styles.desktop}>
        {/* <Desktop /> */}

        {/* Windows */}
        {openWindows.map((windowState) => (
          <Window
            key={windowState.id}
            id={windowState.id}
            title={windowState.title}
            component={windowState.component}
            initialPosition={windowState.position}
            initialSize={windowState.size}
            currentState={windowState.state}
            zIndex={windowState.zIndex}
            props={windowState.props}
          />
        ))}
      </div>

      <Dock />
    </div>
  );
}

export default App;

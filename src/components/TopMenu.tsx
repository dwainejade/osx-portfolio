// src/components/TopMenu.tsx
import React, { useState, useEffect, useRef } from "react";
import styles from "./TopMenu.module.css";
import useWindowsStore from "../store/windowsStore";

interface MenuData {
  id: string;
  label: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  label?: string;
  shortcut?: string;
  action?: () => void;
  divider?: boolean;
  submenu?: MenuItem[];
}

const TopMenu: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [timeDisplay, setTimeDisplay] = useState<string>("");
  const [dateDisplay, setDateDisplay] = useState<string>("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Get functions from the windows store
  const openWindow = useWindowsStore((state) => state.openWindow);
  const openWindows = useWindowsStore((state) => state.openWindows);
  const closeWindow = useWindowsStore((state) => state.closeWindow);
  const minimizeWindow = useWindowsStore((state) => state.minimizeWindow);
  const maximizeWindow = useWindowsStore((state) => state.maximizeWindow);
  const restoreWindow = useWindowsStore((state) => state.restoreWindow);

  // Find the active window (highest z-index)
  const activeWindow =
    openWindows.length > 0
      ? openWindows.reduce((prev, current) =>
          prev.zIndex > current.zIndex ? prev : current
        )
      : null;

  // Set up the time display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeDisplay(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      setDateDisplay(
        now.toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    };

    updateTime();
    const intervalId = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Define menu items
  const menuData: MenuData[] = [
    {
      id: "apple",
      label: "🍩", // Apple symbol
      items: [
        {
          id: "about",
          label: "About This Portfolio",
          action: () => openAboutWindow(),
        },
        { id: "divider1", divider: true },
        {
          id: "preferences",
          label: "Preferences...",
          shortcut: "⌘,",
          action: () => openPreferences(),
        },
        { id: "divider2", divider: true },
        {
          id: "quit",
          label: "Quit",
          shortcut: "⌘Q",
          action: () => console.log("Quit not implemented"),
        },
      ],
    },
    {
      id: "file",
      label: "File",
      items: [
        {
          id: "new",
          label: "New Window",
          shortcut: "⌘N",
          action: () => openNewWindow(),
        },
        {
          id: "open",
          label: "Open...",
          shortcut: "⌘O",
          action: () => console.log("Open not implemented"),
        },
        {
          id: "close",
          label: "Close",
          shortcut: "⌘W",
          action: () => closeCurrentWindow(),
        },
        { id: "divider3", divider: true },
        {
          id: "save",
          label: "Save",
          shortcut: "⌘S",
          action: () => console.log("Save not implemented"),
        },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        {
          id: "undo",
          label: "Undo",
          shortcut: "⌘Z",
          action: () => console.log("Undo not implemented"),
        },
        {
          id: "redo",
          label: "Redo",
          shortcut: "⇧⌘Z",
          action: () => console.log("Redo not implemented"),
        },
        { id: "divider4", divider: true },
        {
          id: "cut",
          label: "Cut",
          shortcut: "⌘X",
          action: () => console.log("Cut not implemented"),
        },
        {
          id: "copy",
          label: "Copy",
          shortcut: "⌘C",
          action: () => console.log("Copy not implemented"),
        },
        {
          id: "paste",
          label: "Paste",
          shortcut: "⌘V",
          action: () => console.log("Paste not implemented"),
        },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        {
          id: "portfolio",
          label: "Portfolio Sections",
          submenu: [
            {
              id: "about-me",
              label: "About Me",
              action: () => openAboutMeWindow(),
            },
            {
              id: "projects",
              label: "Projects",
              action: () => openProjectsWindow(),
            },
            { id: "blog", label: "Blog", action: () => openBlogWindow() },
          ],
        },
        { id: "divider5", divider: true },
        {
          id: "toggleFullScreen",
          label: "Toggle Full Screen",
          shortcut: "⌘F",
          action: () => toggleFullScreen(),
        },
      ],
    },
    {
      id: "window",
      label: "Window",
      items: [
        {
          id: "minimize",
          label: "Minimize",
          shortcut: "⌘M",
          action: () => minimizeCurrentWindow(),
        },
        { id: "zoom", label: "Zoom", action: () => zoomCurrentWindow() },
        { id: "divider6", divider: true },
        {
          id: "bringToFront",
          label: "Bring All to Front",
          action: () => console.log("Bring All to Front not implemented"),
        },
      ],
    },
    {
      id: "help",
      label: "Help",
      items: [
        {
          id: "portfolio-help",
          label: "Portfolio Help",
          action: () => console.log("Help not implemented"),
        },
        { id: "contact", label: "Contact", action: () => openContactWindow() },
      ],
    },
  ];

  // Menu action handlers
  const openAboutWindow = () => {
    openWindow(
      "about",
      "About This Portfolio",
      "markdown",
      { x: 100, y: 100 },
      { width: 500, height: 400 },
      {
        content:
          "# About This Portfolio\n\nThis is a macOS-inspired portfolio website built with React and TypeScript. It showcases my work using a familiar desktop interface.",
      }
    );
  };

  const openPreferences = () => {
    openWindow(
      "preferences",
      "Preferences",
      "markdown",
      { x: 150, y: 150 },
      { width: 600, height: 400 },
      { content: "# Preferences\n\nSettings and preferences would go here." }
    );
  };

  const openNewWindow = () => {
    openWindow(
      `finder-${Date.now()}`,
      "Finder",
      "markdown",
      { x: 200, y: 200 },
      { width: 700, height: 500 },
      { content: "# New Window\n\nThis is a new window." }
    );
  };

  const closeCurrentWindow = () => {
    if (activeWindow) {
      closeWindow(activeWindow.id);
    }
  };

  const minimizeCurrentWindow = () => {
    if (activeWindow) {
      minimizeWindow(activeWindow.id);
    }
  };

  const zoomCurrentWindow = () => {
    if (activeWindow) {
      if (activeWindow.state === "maximized") {
        restoreWindow(activeWindow.id);
      } else {
        maximizeWindow(activeWindow.id);
      }
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const openAboutMeWindow = () => {
    openWindow(
      "finder",
      "About Me",
      "markdown",
      { x: 100, y: 100 },
      { width: 700, height: 500 },
      { filePath: "/content/about-me.md", showTitle: true }
    );
  };

  const openProjectsWindow = () => {
    openWindow(
      "code",
      "Projects",
      "projects-list",
      { x: 150, y: 80 },
      { width: 800, height: 600 },
      { listPath: "/content/projects/index.json", showTitle: true }
    );
  };

  const openBlogWindow = () => {
    openWindow(
      "browser",
      "Blog",
      "blog-list",
      { x: 200, y: 120 },
      { width: 800, height: 600 },
      { listPath: "/content/blog/index.json", showTitle: true }
    );
  };

  const openContactWindow = () => {
    openWindow(
      "contact",
      "Contact",
      "markdown",
      { x: 250, y: 150 },
      { width: 600, height: 400 },
      { content: "# Contact\n\nThis is where contact information would go." }
    );
  };

  const handleMenuClick = (menuId: string) => {
    if (activeMenu === menuId) {
      setActiveMenu(null);
    } else {
      setActiveMenu(menuId);
    }
  };

  const handleMenuItemClick = (action?: () => void) => {
    if (action) {
      action();
    }
    setActiveMenu(null);
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.divider) {
      return <div key={item.id} className={styles.menuDivider}></div>;
    }

    return (
      <div
        key={item.id}
        className={styles.menuItem}
        onClick={() => handleMenuItemClick(item.action)}
      >
        <span className={styles.menuItemLabel}>{item.label}</span>
        {item.shortcut && (
          <span className={styles.menuItemShortcut}>{item.shortcut}</span>
        )}
        {item.submenu && <span className={styles.menuItemArrow}>▶</span>}

        {item.submenu && (
          <div className={styles.submenu}>
            {item.submenu.map((subItem) => renderMenuItem(subItem))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.topMenu} ref={menuRef}>
      <div className={styles.menuItems}>
        {/* Apple menu */}
        <div
          key="apple"
          className={`${styles.menuItem} ${
            activeMenu === "apple" ? styles.active : ""
          }`}
          onClick={() => handleMenuClick("apple")}
        >
          {menuData[0].label}
          {activeMenu === "apple" && (
            <div className={styles.menuDropdown}>
              {menuData[0].items.map((item) => renderMenuItem(item))}
            </div>
          )}
        </div>

        {/* Active window title */}
        {activeWindow && (
          <div className={styles.activeWindowTitle}>{activeWindow.title}</div>
        )}

        {/* All other menu items */}
        {menuData.slice(1).map((menu) => (
          <div
            key={menu.id}
            className={`${styles.menuItem} ${
              activeMenu === menu.id ? styles.active : ""
            }`}
            onClick={() => handleMenuClick(menu.id)}
          >
            {menu.label}

            {activeMenu === menu.id && (
              <div className={styles.menuDropdown}>
                {menu.items.map((item) => renderMenuItem(item))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.menuRight}>
        <div className={styles.statusItems}>
          {/* Add any status icons here (battery, wifi, etc.) */}
          <div className={styles.dateTime}>
            <span>{dateDisplay}</span>
            <span className={styles.time}>{timeDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopMenu;

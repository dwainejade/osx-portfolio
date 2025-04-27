// src/store/fileSystemPersistence.ts
import useFileSystemStore from "./fileSystemStore";
import { FileSystemNode, Folder, File } from "./fileSystemTypes";

// Keys for storing data in localStorage
const FILE_SYSTEM_KEY = "macos-portfolio-file-system";
const NAVIGATION_KEY = "macos-portfolio-navigation";

// Save the entire file system to localStorage
export const saveFileSystem = () => {
  const { nodes, currentFolderId, navigationHistory, historyIndex } =
    useFileSystemStore.getState();

  // Convert Date objects to strings for serialization
  const serializedNodes: Record<string, any> = {};

  Object.entries(nodes).forEach(([id, node]) => {
    serializedNodes[id] = {
      ...node,
      createdAt: node.createdAt.toISOString(),
      modifiedAt: node.modifiedAt.toISOString(),
    };
  });

  // Save file system data
  localStorage.setItem(FILE_SYSTEM_KEY, JSON.stringify(serializedNodes));

  // Save navigation state
  localStorage.setItem(
    NAVIGATION_KEY,
    JSON.stringify({
      currentFolderId,
      navigationHistory,
      historyIndex,
    })
  );
};

// Load the file system from localStorage
export const loadFileSystem = () => {
  try {
    // Load file system data
    const storedNodes = localStorage.getItem(FILE_SYSTEM_KEY);
    if (!storedNodes) return false;

    const parsedNodes = JSON.parse(storedNodes);

    // Convert string dates back to Date objects
    const deserializedNodes: Record<string, FileSystemNode> = {};

    Object.entries(parsedNodes).forEach(([id, node]) => {
      deserializedNodes[id] = {
        ...(node as any),
        createdAt: new Date(node.createdAt),
        modifiedAt: new Date(node.modifiedAt),
      };
    });

    // Load navigation state
    const navigationData = localStorage.getItem(NAVIGATION_KEY);
    let currentFolderId = "desktop";
    let navigationHistory = ["desktop"];
    let historyIndex = 0;

    if (navigationData) {
      const parsedNavigation = JSON.parse(navigationData);
      currentFolderId = parsedNavigation.currentFolderId;
      navigationHistory = parsedNavigation.navigationHistory;
      historyIndex = parsedNavigation.historyIndex;
    }

    // Update the store
    useFileSystemStore.setState({
      nodes: deserializedNodes,
      currentFolderId,
      navigationHistory,
      historyIndex,
      selectedNodeIds: [],
    });

    return true;
  } catch (error) {
    console.error("Failed to load file system:", error);
    return false;
  }
};

// Initialize the file system with default content if needed
export const initializeFileSystem = () => {
  // Try to load existing file system
  const loaded = loadFileSystem();

  // If loading failed, set up some example content
  if (!loaded) {
    const { createFolder, createFile } = useFileSystemStore.getState();

    // Create some example folders
    const projectsId = createFolder("Projects", "documents");
    const imagesId = createFolder("Images", "documents");

    // Create some example files
    createFile(
      "Welcome.txt",
      "text",
      "desktop",
      "Welcome to my macOS portfolio! Click around to explore my projects and experience."
    );

    createFile(
      "About Me.txt",
      "text",
      "documents",
      "I am a web developer with expertise in React, TypeScript, and UI design."
    );

    createFile("Portfolio.pdf", "pdf", projectsId);

    createFile(
      "Profile Picture.jpg",
      "image",
      imagesId,
      "",
      "/assets/images/profile.jpg"
    );

    // Save the initialized file system
    saveFileSystem();
  }
};

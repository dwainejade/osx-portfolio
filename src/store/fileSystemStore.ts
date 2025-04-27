// src/store/fileSystemStore.ts
import { create } from "zustand";
import {
  FileSystemNode,
  Folder,
  File,
  FileType,
  isFolder,
} from "./fileSystemTypes";

interface FileSystemState {
  // Data structure to store all nodes (both files and folders)
  nodes: Record<string, FileSystemNode>;

  // Current navigation state
  currentFolderId: string;
  selectedNodeIds: string[];
  navigationHistory: string[];
  historyIndex: number;

  // Path management
  getPath: (nodeId: string) => string[];
  getCurrentPath: () => string[];

  // CRUD operations
  createFolder: (name: string, parentId: string | null) => string;
  createFile: (
    name: string,
    type: Exclude<FileType, "folder">,
    parentId: string | null,
    content?: string,
    url?: string
  ) => string;
  renameNode: (nodeId: string, newName: string) => void;
  deleteNode: (nodeId: string) => void;
  moveNode: (nodeId: string, newParentId: string) => void;

  // Navigation actions
  navigateTo: (folderId: string) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  navigateUp: () => void;

  // Selection management
  selectNode: (nodeId: string, isMultiSelect: boolean) => void;
  deselectAll: () => void;

  // Content operations
  updateFileContent: (fileId: string, content: string) => void;
}

const useFileSystemStore = create<FileSystemState>((set, get) => {
  // Create default root folder
  const rootFolder: Folder = {
    id: "root",
    name: "Root",
    type: "folder",
    icon: "/assets/icons/folder.png",
    parentId: null,
    children: [],
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  // Create Desktop folder
  const desktopFolder: Folder = {
    id: "desktop",
    name: "Desktop",
    type: "folder",
    icon: "/assets/icons/folder.png",
    parentId: "root",
    children: [],
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  // Create Documents folder
  const documentsFolder: Folder = {
    id: "documents",
    name: "Documents",
    type: "folder",
    icon: "/assets/icons/folder.png",
    parentId: "root",
    children: [],
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  // Update root folder children
  rootFolder.children = ["desktop", "documents"];

  // Initial state
  const initialState = {
    nodes: {
      root: rootFolder,
      desktop: desktopFolder,
      documents: documentsFolder,
    },
    currentFolderId: "desktop", // Start at desktop
    selectedNodeIds: [],
    navigationHistory: ["desktop"],
    historyIndex: 0,
  };

  return {
    ...initialState,

    // Path utilities
    getPath: (nodeId) => {
      const path: string[] = [];
      const nodes = get().nodes;
      let currentId = nodeId;

      // Traverse up the tree to build the path
      while (currentId) {
        const node = nodes[currentId];
        if (!node) break;

        path.unshift(currentId);
        currentId = node.parentId || "";
      }

      return path;
    },

    getCurrentPath: () => {
      return get().getPath(get().currentFolderId);
    },

    // CRUD operations
    createFolder: (name, parentId) => {
      const now = new Date();
      const newId = `folder-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const newFolder: Folder = {
        id: newId,
        name,
        type: "folder",
        icon: "/assets/icons/folder.png",
        parentId,
        children: [],
        createdAt: now,
        modifiedAt: now,
      };

      set((state) => {
        // Create a new node entry
        const newNodes = { ...state.nodes, [newId]: newFolder };

        // Update parent's children if there's a parent
        if (parentId && isFolder(newNodes[parentId])) {
          const parent = newNodes[parentId] as Folder;
          parent.children.push(newId);
          parent.modifiedAt = now;
        }

        return { nodes: newNodes };
      });

      return newId;
    },

    createFile: (name, type, parentId, content = "", url = "") => {
      const now = new Date();
      const newId = `file-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Determine icon based on file type
      let icon = "/assets/icons/document.png";
      switch (type) {
        case "image":
          icon = "/assets/icons/image.png";
          break;
        case "code":
          icon = "/assets/icons/code.png";
          break;
        case "pdf":
          icon = "/assets/icons/pdf.png";
          break;
        case "application":
          icon = "/assets/icons/application.png";
          break;
      }

      const newFile: File = {
        id: newId,
        name,
        type,
        icon,
        parentId,
        size: content.length,
        content,
        url,
        createdAt: now,
        modifiedAt: now,
      };

      set((state) => {
        // Create a new node entry
        const newNodes = { ...state.nodes, [newId]: newFile };

        // Update parent's children if there's a parent
        if (parentId && isFolder(newNodes[parentId])) {
          const parent = newNodes[parentId] as Folder;
          parent.children.push(newId);
          parent.modifiedAt = now;
        }

        return { nodes: newNodes };
      });

      return newId;
    },

    renameNode: (nodeId, newName) => {
      set((state) => {
        if (!state.nodes[nodeId]) return state;

        const updatedNodes = { ...state.nodes };
        updatedNodes[nodeId] = {
          ...updatedNodes[nodeId],
          name: newName,
          modifiedAt: new Date(),
        };

        return { nodes: updatedNodes };
      });
    },

    deleteNode: (nodeId) => {
      set((state) => {
        const nodes = { ...state.nodes };
        const node = nodes[nodeId];

        if (!node) return state;

        // If node is a folder, recursively delete all children
        if (isFolder(node)) {
          const folderToDelete = node as Folder;
          const deleteChildren = (childrenIds: string[]) => {
            childrenIds.forEach((childId) => {
              const child = nodes[childId];
              if (isFolder(child)) {
                deleteChildren((child as Folder).children);
              }
              delete nodes[childId];
            });
          };

          deleteChildren(folderToDelete.children);
        }

        // Remove the node from its parent's children list
        if (node.parentId && isFolder(nodes[node.parentId])) {
          const parent = nodes[node.parentId] as Folder;
          parent.children = parent.children.filter((id) => id !== nodeId);
          parent.modifiedAt = new Date();
        }

        // Delete the node itself
        delete nodes[nodeId];

        // Update selectedNodeIds if the deleted node was selected
        const selectedNodeIds = state.selectedNodeIds.filter(
          (id) => id !== nodeId
        );

        // If current folder was deleted, navigate to parent
        let currentFolderId = state.currentFolderId;
        let navigationHistory = [...state.navigationHistory];
        let historyIndex = state.historyIndex;

        if (currentFolderId === nodeId) {
          const parent = node.parentId || "root";
          currentFolderId = parent;
          navigationHistory = [
            ...navigationHistory.slice(0, historyIndex + 1),
            parent,
          ];
          historyIndex = navigationHistory.length - 1;
        }

        return {
          nodes,
          selectedNodeIds,
          currentFolderId,
          navigationHistory,
          historyIndex,
        };
      });
    },

    moveNode: (nodeId, newParentId) => {
      set((state) => {
        const nodes = { ...state.nodes };
        const node = nodes[nodeId];
        const newParent = nodes[newParentId];

        if (!node || !newParent || !isFolder(newParent)) return state;

        // Cannot move a folder into itself or its descendants
        if (isFolder(node)) {
          const descendants = new Set<string>();
          const collectDescendants = (folderId: string) => {
            descendants.add(folderId);
            const folder = nodes[folderId] as Folder;
            if (folder.children) {
              folder.children.forEach((childId) => {
                if (isFolder(nodes[childId])) {
                  collectDescendants(childId);
                } else {
                  descendants.add(childId);
                }
              });
            }
          };

          collectDescendants(nodeId);
          if (descendants.has(newParentId)) return state;
        }

        // Remove from current parent
        if (node.parentId && isFolder(nodes[node.parentId])) {
          const oldParent = nodes[node.parentId] as Folder;
          oldParent.children = oldParent.children.filter((id) => id !== nodeId);
          oldParent.modifiedAt = new Date();
        }

        // Add to new parent
        const parent = nodes[newParentId] as Folder;
        parent.children.push(nodeId);
        parent.modifiedAt = new Date();

        // Update node's parent reference
        nodes[nodeId] = {
          ...nodes[nodeId],
          parentId: newParentId,
          modifiedAt: new Date(),
        };

        return { nodes };
      });
    },

    // Navigation actions
    navigateTo: (folderId) => {
      set((state) => {
        const folder = state.nodes[folderId];
        if (!folder || !isFolder(folder)) return state;

        // Add to history, truncating any forward history
        const history = [
          ...state.navigationHistory.slice(0, state.historyIndex + 1),
          folderId,
        ];

        return {
          currentFolderId: folderId,
          navigationHistory: history,
          historyIndex: history.length - 1,
          selectedNodeIds: [],
        };
      });
    },

    navigateBack: () => {
      set((state) => {
        if (state.historyIndex <= 0) return state;

        const newIndex = state.historyIndex - 1;
        const folderId = state.navigationHistory[newIndex];

        return {
          currentFolderId: folderId,
          historyIndex: newIndex,
          selectedNodeIds: [],
        };
      });
    },

    navigateForward: () => {
      set((state) => {
        if (state.historyIndex >= state.navigationHistory.length - 1)
          return state;

        const newIndex = state.historyIndex + 1;
        const folderId = state.navigationHistory[newIndex];

        return {
          currentFolderId: folderId,
          historyIndex: newIndex,
          selectedNodeIds: [],
        };
      });
    },

    navigateUp: () => {
      set((state) => {
        const currentFolder = state.nodes[state.currentFolderId];
        if (!currentFolder || !currentFolder.parentId) return state;

        const parentId = currentFolder.parentId;

        // Add to history
        const history = [
          ...state.navigationHistory.slice(0, state.historyIndex + 1),
          parentId,
        ];

        return {
          currentFolderId: parentId,
          navigationHistory: history,
          historyIndex: history.length - 1,
          selectedNodeIds: [],
        };
      });
    },

    // Selection management
    selectNode: (nodeId, isMultiSelect) => {
      set((state) => {
        if (!state.nodes[nodeId]) return state;

        let selectedNodeIds: string[];

        if (isMultiSelect) {
          // Toggle selection for multi-select
          if (state.selectedNodeIds.includes(nodeId)) {
            selectedNodeIds = state.selectedNodeIds.filter(
              (id) => id !== nodeId
            );
          } else {
            selectedNodeIds = [...state.selectedNodeIds, nodeId];
          }
        } else {
          // Replace selection for single select
          selectedNodeIds = [nodeId];
        }

        return { selectedNodeIds };
      });
    },

    deselectAll: () => {
      set({ selectedNodeIds: [] });
    },

    // Content operations
    updateFileContent: (fileId, content) => {
      set((state) => {
        const node = state.nodes[fileId];
        if (!node || isFolder(node)) return state;

        const updatedFile: File = {
          ...(node as File),
          content,
          size: content.length,
          modifiedAt: new Date(),
        };

        return {
          nodes: {
            ...state.nodes,
            [fileId]: updatedFile,
          },
        };
      });
    },
  };
});

export default useFileSystemStore;

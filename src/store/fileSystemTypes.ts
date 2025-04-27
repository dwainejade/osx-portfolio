// src/store/fileSystemTypes.ts

// Define the types of files we can have
export type FileType =
  | "folder"
  | "text"
  | "image"
  | "code"
  | "pdf"
  | "application";

// Base interface for all file system nodes
export interface FileSystemNode {
  id: string; // Unique identifier for the node
  name: string; // Display name
  type: FileType; // Type of the node
  icon: string; // Path to the icon image
  parentId: string | null; // Parent folder ID or null for root items
  createdAt: Date; // Creation timestamp
  modifiedAt: Date; // Last modified timestamp
}

// Folder-specific interface
export interface Folder extends FileSystemNode {
  type: "folder";
  children: string[]; // Array of child node IDs
}

// File-specific interface
export interface File extends FileSystemNode {
  type: Exclude<FileType, "folder">;
  size: number; // File size in bytes
  content?: string; // Optional content string (for text or code files)
  contentType?: string; // MIME type for the content
  url?: string; // Optional URL for images or other external resources
}

// Type guard to check if a node is a folder
export function isFolder(node: FileSystemNode): node is Folder {
  return node.type === "folder";
}

// Type guard to check if a node is a file
export function isFile(node: FileSystemNode): node is File {
  return node.type !== "folder";
}

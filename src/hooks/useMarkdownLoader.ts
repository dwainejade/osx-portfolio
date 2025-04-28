// src/hooks/useMarkdownLoader.ts
import { useState, useEffect } from "react";

/**
 * Custom hook to load markdown content from a file
 * @param filePath Path to the markdown file
 * @returns Object containing the loaded content, loading state, and any error
 */
export function useMarkdownLoader(filePath: string) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMarkdownFile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the markdown file
        const response = await fetch(filePath);

        if (!response.ok) {
          throw new Error(
            `Failed to load file: ${response.status} ${response.statusText}`
          );
        }

        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error(`Error loading markdown file from ${filePath}:`, err);
        setError(
          err instanceof Error ? err.message : "Failed to load markdown content"
        );
      } finally {
        setLoading(false);
      }
    };

    if (filePath) {
      loadMarkdownFile();
    } else {
      setError("No file path provided");
      setLoading(false);
    }
  }, [filePath]);

  return { content, loading, error };
}

export default useMarkdownLoader;

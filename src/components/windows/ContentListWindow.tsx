// Modified ContentListWindow.tsx to include demo button
import React, { useState, useEffect } from "react";
import useWindowsStore from "../../store/windowsStore";
import styles from "./ContentListWindow.module.css";

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  summary?: string;
  date?: string;
  tags?: string[];
  technologies?: string[];
  filePath: string;
  imageUrl?: string;
  demoUrl?: string; // Added demoUrl property
}

interface ContentListWindowProps {
  type: "projects" | "blog";
  listPath: string;
  title?: string;
}

const ContentListWindow: React.FC<ContentListWindowProps> = ({
  type,
  listPath,
  title,
}) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const openWindow = useWindowsStore((state) => state.openWindow);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(listPath);

        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.status}`);
        }

        const data = await response.json();

        // Sort blog posts by date if they have dates
        if (type === "blog") {
          const sortedItems = [...data].sort((a, b) =>
            a.date && b.date
              ? new Date(b.date).getTime() - new Date(a.date).getTime()
              : 0
          );
          setItems(sortedItems);
        } else {
          setItems(data);
        }
      } catch (err) {
        console.error(`Error loading ${type}:`, err);
        setError(`Failed to load ${type}`);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [type, listPath]);

  const handleItemClick = (item: ContentItem) => {
    console.log(item);
    openWindow(
      `${type}-${item.id}`,
      item.title,
      "markdown", // Use markdown component for all content
      { x: 150, y: 80 },
      { width: 700, height: 500 },
      { filePath: item.filePath }
    );
  };

  const handleDemoClick = (e: React.MouseEvent, demoUrl?: string) => {
    e.stopPropagation(); // Prevent triggering the parent card's onClick
    if (demoUrl) {
      window.open(demoUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading {type}...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  return (
    <div className={styles.contentListWindow}>
      <div className={styles.header}>
        <h2 className={styles.heading}>
          {title || (type === "blog" ? "Blog" : "Projects")}
        </h2>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyMessage}>No items found.</div>
      ) : (
        <div
          className={
            type === "projects" ? styles.projectsGrid : styles.blogList
          }
        >
          {items.map((item) => (
            <div
              key={item.id}
              className={
                type === "projects" ? styles.projectCard : styles.blogCard
              }
              onClick={() => handleItemClick(item)}
            >
              {item.imageUrl && type === "projects" && (
                <div className={styles.imageContainer}>
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className={styles.itemImage}
                  />
                </div>
              )}

              <div className={styles.itemContent}>
                {type === "blog" && item.date && (
                  <div className={styles.itemDate}>
                    {new Date(item.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                )}

                <h3 className={styles.itemTitle}>{item.title}</h3>

                <p className={styles.itemDescription}>
                  {type === "projects" ? item.description : item.summary}
                </p>

                <div className={styles.tagsContainer}>
                  {(type === "projects" ? item.technologies : item.tags)?.map(
                    (tag, index) => (
                      <span key={index} className={styles.tag}>
                        {tag}
                      </span>
                    )
                  )}
                </div>

                {type === "projects" ? (
                  <div className={styles.buttonContainer}>
                    <button className={styles.viewButton}>View Details</button>
                    {item.demoUrl && (
                      <button
                        className={`${styles.viewButton} ${styles.demoButton}`}
                        onClick={(e) => handleDemoClick(e, item.demoUrl)}
                      >
                        View Demo
                      </button>
                    )}
                  </div>
                ) : (
                  <button className={styles.viewButton}>Read More</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentListWindow;

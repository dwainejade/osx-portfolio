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

        // Sort data based on content type
        switch (type) {
          case "blog": // Sort blog posts by date (newest first)
          {
            const sortedItems = [...data].sort((a, b) =>
              a.date && b.date
                ? new Date(b.date).getTime() - new Date(a.date).getTime()
                : 0
            );
            setItems(sortedItems);
            break;
          }
          case "projects":
            // Projects don't need special sorting (use as-is)
            setItems(data);
            break;
          default:
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

  const renderContent = () => {
    if (items.length === 0) {
      return <div className={styles.emptyMessage}>No items found.</div>;
    }

    switch (type) {
      case "projects":
        return (
          <div className={styles.projectsGrid}>
            {items.map((item) => (
              <div
                key={item.id}
                className={styles.projectCard}
                onClick={() => handleItemClick(item)}
              >
                {item.imageUrl && (
                  <div className={styles.imageContainer}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className={styles.itemImage}
                    />
                  </div>
                )}
                <div className={styles.itemContent}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemDescription}>{item.description}</p>
                  <div className={styles.tagsContainer}>
                    {item.technologies?.map((tech, index) => (
                      <span key={index} className={styles.tag}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  <button className={styles.viewButton}>View Project</button>
                </div>
              </div>
            ))}
          </div>
        );

      case "blog":
        return (
          <div className={styles.blogList}>
            {items.map((item) => (
              <div
                key={item.id}
                className={styles.blogCard}
                onClick={() => handleItemClick(item)}
              >
                <div className={styles.itemContent}>
                  {item.date && (
                    <div className={styles.itemDate}>
                      {new Date(item.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemDescription}>{item.summary}</p>
                  <div className={styles.tagsContainer}>
                    {item.tags?.map((tag, index) => (
                      <span key={index} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className={styles.viewButton}>Read More</button>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <div className={styles.emptyMessage}>Invalid content type.</div>;
    }
  };

  return (
    <div className={styles.contentListWindow}>
      <div className={styles.header}>
        <h2 className={styles.heading}>
          {title || (type === "blog" ? "Blog" : "Projects")}
        </h2>
      </div>
      {renderContent()}
    </div>
  );
};

export default ContentListWindow;

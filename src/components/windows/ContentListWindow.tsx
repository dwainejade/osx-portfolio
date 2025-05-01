import React, { useState, useEffect } from "react";
import useWindowsStore from "../../store/windowsStore";
import styles from "./ContentListWindow.module.css";
import MarkdownWindow from "./MarkdownWindow";
import useMarkdownLoader from "../../hooks/useMarkdownLoader";

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
  selectedItemId?: string;
  filePath?: string;
  isDetail?: boolean;
}

const ContentListWindow: React.FC<ContentListWindowProps> = ({
  type,
  listPath,
  title,
  selectedItemId,
  filePath,
  isDetail,
}) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [detailsContent, setDetailsContent] = useState<string>("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const openWindow = useWindowsStore((state) => state.openWindow);
  const updateWindowTitle = useWindowsStore((state) => state.updateWindowTitle);
  const navigateWindowTo = useWindowsStore((state) => state.navigateWindowTo);

  // Get the current window ID to update its title when showing details
  const windowId = type === "projects" ? "code" : "browser";

  // Load items list
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

        // If we have a selectedItemId from props, find and select that item
        if (selectedItemId) {
          const item = data.find((i: ContentItem) => i.id === selectedItemId);
          if (item) {
            setSelectedItem(item);

            // If we're supposed to show details immediately, load the content
            if (isDetail && item.filePath) {
              loadItemContent(item);
            }
          }
        }
      } catch (err) {
        console.error(`Error loading ${type}:`, err);
        setError(`Failed to load ${type}`);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [type, listPath, selectedItemId, isDetail]);

  // Effect to handle navigation props changes
  useEffect(() => {
    // If isDetail is true and we have a filePath, we should show the detail view
    if (isDetail && filePath) {
      // If we don't have a selectedItem yet, but have a selectedItemId, find that item
      if (!selectedItem && selectedItemId && items.length > 0) {
        const item = items.find((item) => item.id === selectedItemId);
        if (item) {
          setSelectedItem(item);
        }
      }

      // Load content from filePath if not already loaded
      if (!detailsContent || filePath !== selectedItem?.filePath) {
        setDetailsLoading(true);
        fetch(filePath)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to load content: ${response.status}`);
            }
            return response.text();
          })
          .then((content) => {
            setDetailsContent(content);
            setDetailsError(null);
          })
          .catch((err) => {
            console.error(`Error loading content:`, err);
            setDetailsError(`Failed to load content: ${err.message}`);
          })
          .finally(() => {
            setDetailsLoading(false);
          });
      }
    } else {
      // If isDetail is false, ensure we're showing the list view
      if (selectedItem) {
        setSelectedItem(null);
      }
    }
  }, [isDetail, filePath, selectedItemId, items, selectedItem, detailsContent]);

  // Function to load the content for an item
  const loadItemContent = (item: ContentItem) => {
    setDetailsLoading(true);

    fetch(item.filePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.status}`);
        }
        return response.text();
      })
      .then((content) => {
        setDetailsContent(content);
        setDetailsError(null);
      })
      .catch((err) => {
        console.error(`Error loading content:`, err);
        setDetailsError(`Failed to load content: ${err.message}`);
      })
      .finally(() => {
        setDetailsLoading(false);
      });
  };

  const handleItemClick = (item: ContentItem) => {
    console.log("Item clicked:", item);

    // Update navigation history
    navigateWindowTo(windowId, {
      type,
      listPath,
      title: item.title,
      selectedItemId: item.id,
      filePath: item.filePath,
      isDetail: true,
    });

    // Update UI state
    setSelectedItem(item);
    setDetailsLoading(true);

    // Update the window title
    updateWindowTitle(windowId, item.title);

    // Load the markdown content
    loadItemContent(item);
  };

  const handleBackClick = () => {
    console.log("Back button clicked");

    // Update navigation history
    navigateWindowTo(windowId, {
      type,
      listPath,
      title: title || (type === "blog" ? "Blog" : "Projects"),
      isDetail: false,
    });

    // Update UI state
    setSelectedItem(null);

    // Reset the window title
    updateWindowTitle(
      windowId,
      title || (type === "blog" ? "Blog" : "Projects")
    );
  };

  // If loading the initial items list
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading {type}...</p>
      </div>
    );
  }

  // If there was an error loading the list
  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  // If a project is selected or isDetail is true, show details
  if (selectedItem || isDetail) {
    return (
      <div className={styles.contentDetailView}>
        <div className={styles.detailsBackButton} onClick={handleBackClick}>
          ← Back to {type === "projects" ? "Projects" : "Blog"}
        </div>

        {detailsLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading content...</p>
          </div>
        ) : detailsError ? (
          <div className={styles.errorContainer}>{detailsError}</div>
        ) : (
          <MarkdownWindow
            content={detailsContent}
            title={selectedItem ? selectedItem.title : title}
          />
        )}
      </div>
    );
  }

  // Otherwise, show the list of items
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

                <button className={styles.viewButton}>
                  {type === "projects" ? "View Project" : "Read More"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentListWindow;

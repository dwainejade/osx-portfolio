// src/components/windows/BlogWindow.tsx
import React, { useState, useEffect } from "react";
import useWindowsStore from "../../store/windowsStore";
import styles from "./BlogWindow.module.css";

interface BlogPost {
  id: string;
  title: string;
  date: string;
  summary: string;
  filePath: string;
  tags: string[];
}

const BlogWindow: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const openWindow = useWindowsStore((state) => state.openWindow);

  useEffect(() => {
    // Load the blog posts index from a JSON file in the public folder
    const loadBlogPosts = async () => {
      try {
        const response = await fetch("/content/blog/index.json");
        if (!response.ok) {
          throw new Error("Failed to load blog posts");
        }
        const data = await response.json();

        // Sort posts by date (newest first)
        const sortedPosts = data.sort(
          (a: BlogPost, b: BlogPost) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setPosts(sortedPosts);
      } catch (err) {
        console.error("Error loading blog posts:", err);
        setError("Failed to load blog posts");
      } finally {
        setLoading(false);
      }
    };

    loadBlogPosts();
  }, []);

  // Get all unique tags from posts
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

  // Filter posts by tag
  const filteredPosts =
    filter === "all"
      ? posts
      : posts.filter((post) => post.tags.includes(filter));

  const handlePostClick = (post: BlogPost) => {
    // Open a new window for the selected blog post
    openWindow(
      `blog-${post.id}`,
      post.title,
      "blog-post",
      undefined,
      { width: 700, height: 600 },
      { filePath: post.filePath }
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading blog posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.blogWindow}>
      <div className={styles.blogHeader}>
        <h2 className={styles.heading}>Blog</h2>

        <div className={styles.filterContainer}>
          <span className={styles.filterLabel}>Filter by tag:</span>
          <select
            className={styles.tagFilter}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Posts</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.blogPosts}>
        {filteredPosts.length === 0 ? (
          <p className={styles.noPosts}>
            No posts found with the selected filter.
          </p>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className={styles.postCard}
              onClick={() => handlePostClick(post)}
            >
              <div className={styles.postDate}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <h3 className={styles.postTitle}>{post.title}</h3>
              <p className={styles.postSummary}>{post.summary}</p>

              <div className={styles.postTags}>
                {post.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <button className={styles.readMoreButton}>Read More</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BlogWindow;

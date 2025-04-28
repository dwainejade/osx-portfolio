// src/components/windows/ProjectsWindow.tsx
import React, { useState, useEffect } from "react";
// import MarkdownWindow from "./MarkdownWindow";
import useWindowsStore from "../../store/windowsStore";
import styles from "./ProjectsWindow.module.css";

interface Project {
  id: string;
  title: string;
  description: string;
  filePath: string;
}

const ProjectsWindow: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const openWindow = useWindowsStore((state) => state.openWindow);

  useEffect(() => {
    // Load the projects index from a JSON file in the public folder
    const loadProjects = async () => {
      try {
        const response = await fetch("/content/projects/index.json");
        if (!response.ok) {
          throw new Error("Failed to load projects");
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        console.error("Error loading projects:", err);
        setError("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleProjectClick = (project: Project) => {
    // Open a new window for the selected project
    openWindow(
      `project-${project.id}`,
      project.title,
      "project-detail",
      undefined,
      { width: 700, height: 500 },
      { filePath: project.filePath }
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading projects...</p>
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
    <div className={styles.projectsWindow}>
      <h2 className={styles.heading}>My Projects</h2>

      <div className={styles.projectsGrid}>
        {projects.map((project) => (
          <div
            key={project.id}
            className={styles.projectCard}
            onClick={() => handleProjectClick(project)}
          >
            <h3 className={styles.projectTitle}>{project.title}</h3>
            <p className={styles.projectDescription}>{project.description}</p>
            <div className={styles.projectCardFooter}>
              <button className={styles.viewButton}>View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsWindow;

// src/components/windows/ProjectsWindow.tsx
import React from "react";
import styles from "./ProjectsWindow.module.css";

// Define project data structure
interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  projectUrl?: string;
  githubUrl?: string;
}

// Sample project data - replace with your own
const projects: Project[] = [
  {
    id: "project1",
    title: "E-commerce Platform",
    description:
      "A fully responsive e-commerce site with cart functionality, user authentication, and payment processing.",
    technologies: ["React", "Redux", "Node.js", "MongoDB", "Stripe"],
    imageUrl: "",
    projectUrl: "https://example.com/ecommerce",
    githubUrl: "https://github.com/yourusername/ecommerce",
  },
  {
    id: "project2",
    title: "Weather Dashboard",
    description:
      "Real-time weather application that displays current conditions and forecasts for any location.",
    technologies: ["React", "OpenWeather API", "Chart.js", "Tailwind CSS"],
    imageUrl: "",
    projectUrl: "https://example.com/weather",
    githubUrl: "https://github.com/yourusername/weather-app",
  },
  {
    id: "project3",
    title: "Task Management App",
    description:
      "Productivity application for managing tasks, projects, and team collaboration.",
    technologies: ["React", "TypeScript", "Firebase", "Material UI"],
    imageUrl: "",
    projectUrl: "https://example.com/tasks",
    githubUrl: "https://github.com/yourusername/task-manager",
  },
];

const ProjectsWindow: React.FC = () => {
  return (
    <div className={styles.projectsWindow}>
      <h2 className={styles.heading}>My Projects</h2>

      <div className={styles.projectsGrid}>
        {projects.map((project) => (
          <div key={project.id} className={styles.projectCard}>
            <div className={styles.projectImageContainer}>
              <img
                src={project.imageUrl}
                alt={project.title}
                className={styles.projectImage}
              />
            </div>

            <div className={styles.projectContent}>
              <h3 className={styles.projectTitle}>{project.title}</h3>

              <p className={styles.projectDescription}>{project.description}</p>

              <div className={styles.technologies}>
                {project.technologies.map((tech, index) => (
                  <span key={index} className={styles.techBadge}>
                    {tech}
                  </span>
                ))}
              </div>

              <div className={styles.projectLinks}>
                {project.projectUrl && (
                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.projectLink}
                  >
                    Live Demo
                  </a>
                )}

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.projectLink}
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsWindow;

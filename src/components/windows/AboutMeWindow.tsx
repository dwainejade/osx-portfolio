// src/components/windows/AboutMeWindow.tsx
import React from "react";
import styles from "./AboutMeWindow.module.css";

const AboutMeWindow: React.FC = () => {
  return (
    <div className={styles.aboutMeWindow}>
      <div className={styles.profileSection}>
        <div className={styles.profileImageContainer}>
          <img
            src="/assets/profile-image.jpg"
            alt="Profile"
            className={styles.profileImage}
          />
        </div>
        <div className={styles.nameTitle}>
          <h1>Your Name</h1>
          <h2>Frontend Developer</h2>
        </div>
      </div>

      <div className={styles.bioSection}>
        <h3>About Me</h3>
        <p>
          Hello! I'm a passionate frontend developer with expertise in React,
          TypeScript, and UI/UX design. I love creating beautiful, functional
          web applications that provide great user experiences.
        </p>
        <p>
          When I'm not coding, you can find me hiking, reading sci-fi novels, or
          experimenting with new recipes in the kitchen.
        </p>
      </div>

      <div className={styles.statsSection}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>5+</span>
          <span className={styles.statLabel}>Years Experience</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>20+</span>
          <span className={styles.statLabel}>Projects Completed</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>15+</span>
          <span className={styles.statLabel}>Happy Clients</span>
        </div>
      </div>
    </div>
  );
};

export default AboutMeWindow;

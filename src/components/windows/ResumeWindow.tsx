// src/components/windows/ResumeWindow.tsx
import React from "react";
import styles from "./ResumeWindow.module.css";

// Define skill types
interface Skill {
  name: string;
  level: number; // 1-5
}

interface Experience {
  company: string;
  role: string;
  period: string;
  description: string[];
}

interface Education {
  institution: string;
  degree: string;
  period: string;
}

// Sample data - replace with your own
const skills: Skill[] = [
  { name: "React", level: 5 },
  { name: "TypeScript", level: 4 },
  { name: "JavaScript", level: 5 },
  { name: "HTML/CSS", level: 5 },
  { name: "Node.js", level: 3 },
  { name: "Redux", level: 4 },
  { name: "UI/UX Design", level: 4 },
  { name: "Responsive Design", level: 5 },
  { name: "Git", level: 4 },
];

const experiences: Experience[] = [
  {
    company: "Tech Innovations Inc.",
    role: "Senior Frontend Developer",
    period: "Jan 2021 - Present",
    description: [
      "Led development of the company's flagship SaaS product using React and TypeScript",
      "Implemented state management using Redux, resulting in a 30% improvement in app performance",
      "Collaborated with designers to create responsive UI components and improve UX",
    ],
  },
  {
    company: "Digital Solutions",
    role: "Frontend Developer",
    period: "Mar 2018 - Dec 2020",
    description: [
      "Developed and maintained multiple client websites and web applications",
      "Refactored legacy code to modern React standards, improving maintainability",
      "Mentored junior developers and conducted code reviews",
    ],
  },
  {
    company: "WebCraft Agency",
    role: "Junior Web Developer",
    period: "Jun 2016 - Feb 2018",
    description: [
      "Built responsive websites for clients across various industries",
      "Collaborated with the design team to implement pixel-perfect UI",
      "Participated in client meetings to gather requirements and present solutions",
    ],
  },
];

const education: Education[] = [
  {
    institution: "University of Technology",
    degree: "BSc in Computer Science",
    period: "2012 - 2016",
  },
  {
    institution: "Frontend Masters",
    degree: "Professional Certification in Frontend Development",
    period: "2017",
  },
];

const ResumeWindow: React.FC = () => {
  return (
    <div className={styles.resumeWindow}>
      <div className={styles.sidebar}>
        <h2 className={styles.sidebarHeading}>Skills</h2>
        <div className={styles.skillsList}>
          {skills.map((skill, index) => (
            <div key={index} className={styles.skillItem}>
              <div className={styles.skillName}>{skill.name}</div>
              <div className={styles.skillLevel}>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.skillDot} ${
                      i < skill.level ? styles.active : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <h2 className={styles.sidebarHeading}>Education</h2>
        <div className={styles.educationList}>
          {education.map((edu, index) => (
            <div key={index} className={styles.educationItem}>
              <div className={styles.educationPeriod}>{edu.period}</div>
              <div className={styles.educationDegree}>{edu.degree}</div>
              <div className={styles.educationInstitution}>
                {edu.institution}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.downloadResume}>
          <a href="/resume.pdf" download className={styles.downloadButton}>
            Download Full Resume
          </a>
        </div>
      </div>

      <div className={styles.mainContent}>
        <h2 className={styles.contentHeading}>Work Experience</h2>

        <div className={styles.experienceList}>
          {experiences.map((exp, index) => (
            <div key={index} className={styles.experienceItem}>
              <div className={styles.experienceHeader}>
                <div className={styles.experienceRole}>{exp.role}</div>
                <div className={styles.experiencePeriod}>{exp.period}</div>
              </div>
              <div className={styles.experienceCompany}>{exp.company}</div>
              <ul className={styles.experienceDescription}>
                {exp.description.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumeWindow;

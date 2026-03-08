import type { SiteConfig } from "../types";

export const siteConfig: SiteConfig = {
  profile: {
    name: "Your Name",
    avatar: "/avatar-placeholder.svg",
    bio: "Student & Developer",
    navLinks: [
      { name: "Notes", path: "/", icon: "notes" },
      { name: "Repos", path: "/repos", icon: "repo" },
      { name: "Blog", path: "/blog", icon: "blog" },
      { name: "Tools", path: "/tools", icon: "tools" },
    ],
    externalLinks: [
      { name: "GitHub", url: "https://github.com", icon: "github" },
      { name: "Email", url: "mailto:your@email.com", icon: "email" },
    ],
  },
  semesters: [
    {
      id: "2024-fall",
      name: "2024 Fall",
      subjects: [
        {
          id: "cs101",
          name: "Data Structures",
          description: "Arrays, Trees, Graphs",
          url: "#",
          color: "#e07b53",
        },
        {
          id: "cs102",
          name: "Algorithms",
          description: "Sorting, Searching",
          url: "#",
          color: "#c9a227",
        },
        {
          id: "cs103",
          name: "Database Systems",
          description: "SQL, NoSQL",
          url: "#",
          color: "#7c9a4a",
        },
        {
          id: "cs104",
          name: "Operating Systems",
          description: "Processes, Memory",
          url: "#",
          color: "#5a8f7b",
        },
        {
          id: "cs105",
          name: "Computer Networks",
          description: "TCP/IP, HTTP",
          url: "#",
          color: "#6b8cae",
        },
      ],
    },
    {
      id: "2024-spring",
      name: "2024 Spring",
      subjects: [
        {
          id: "cs201",
          name: "Machine Learning",
          description: "Supervised, Unsupervised",
          url: "#",
          color: "#9c6b8a",
        },
        {
          id: "cs202",
          name: "Compiler Design",
          description: "Parsing, Code Gen",
          url: "#",
          color: "#b87c4a",
        },
        {
          id: "cs203",
          name: "Software Engineering",
          description: "Agile, Testing",
          url: "#",
          color: "#6a9c8a",
        },
      ],
    },
    {
      id: "2023-fall",
      name: "2023 Fall",
      subjects: [
        {
          id: "cs301",
          name: "Computer Graphics",
          description: "Rendering, Shaders",
          url: "#",
          color: "#8a6a9c",
        },
        {
          id: "cs302",
          name: "Artificial Intelligence",
          description: "Search, Planning",
          url: "#",
          color: "#9c8a6a",
        },
        {
          id: "cs303",
          name: "Cryptography",
          description: "Encryption, Hashing",
          url: "#",
          color: "#6a8a9c",
        },
        {
          id: "cs304",
          name: "Distributed Systems",
          description: "Consensus, Replication",
          url: "#",
          color: "#9c6a6a",
        },
      ],
    },
  ],
  repos: [
    {
      id: "repo1",
      name: "awesome-project",
      description:
        "A collection of awesome things built with modern technologies",
      url: "https://github.com/username/awesome-project",
      language: "TypeScript",
      stars: 128,
      forks: 24,
      color: "#3178c6",
    },
    {
      id: "repo2",
      name: "cli-toolkit",
      description: "Powerful CLI toolkit for developers",
      url: "https://github.com/username/cli-toolkit",
      language: "Rust",
      stars: 89,
      forks: 12,
      color: "#dea584",
    },
    {
      id: "repo3",
      name: "web-framework",
      description: "Lightweight web framework with zero dependencies",
      url: "https://github.com/username/web-framework",
      language: "JavaScript",
      stars: 256,
      forks: 45,
      color: "#f1e05a",
    },
    {
      id: "repo4",
      name: "ml-experiments",
      description: "Machine learning experiments and notebooks",
      url: "https://github.com/username/ml-experiments",
      language: "Python",
      stars: 67,
      forks: 8,
      color: "#3572A5",
    },
  ],
  tools: [
    {
      id: "marx-cards",
      name: "Marxism Flashcards",
      description:
        "Interactive flashcard tool for memorizing key concepts in Marxist principles",
      url: "#",
      icon: "cards",
      color: "#c9a227",
    },
    {
      id: "ai-quiz",
      name: "AI Quiz Generator",
      description:
        "Automatically generated practice questions for exam preparation",
      url: "#",
      icon: "quiz",
      color: "#6b8cae",
    },
    {
      id: "formula-sheet",
      name: "Formula Reference",
      description:
        "Quick reference sheet for common mathematical and physics formulas",
      url: "#",
      icon: "formula",
      color: "#7c9a4a",
    },
    {
      id: "pomodoro",
      name: "Pomodoro Timer",
      description: "Focus timer with customizable work and break intervals",
      url: "#",
      icon: "timer",
      color: "#9c6b8a",
    },
  ],
  theme: {
    defaultTheme: "system",
    warmAccent: "#e07b53",
    particleColor: "#e07b53",
  },
};

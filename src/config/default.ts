import type { SiteConfig } from "../types";

export const siteConfig: SiteConfig = {
  profile: {
    name: "Cateds",
    avatar: "/miracle.jpg",
    bio: "Glasgow College, UESTC",
    navLinks: [
      { name: "Notes", path: "/", icon: "notes" },
      { name: "Repos", path: "/repos", icon: "repo" },
      { name: "Blog", path: "/blog", icon: "blog" },
      { name: "Tools", path: "/tools", icon: "tools" },
    ],
    externalLinks: [
      { name: "GitHub", url: "https://github.com/Cateds", icon: "github" },
      // { name: "Email", url: "mailto:your@email.com", icon: "email" },
    ],
  },
  semesters: [
    {
      id: "2025-fall",
      name: "2025 Fall",
      subjects: [
        {
          id: "cs",
          name: "AI & Machine Learning",
          description: "人工智能与机器学习",
          url: "https://cateds.github.io/AI-MachineLearning.md/",
          color: "#8a7a9a",
        },
        {
          id: "ed",
          name: "Electronic Devices",
          description: "电子器件",
          url: "https://cateds.github.io/ElectronicDevice.md/",
          color: "#7a9a8a",
        },
      ],
    },
    {
      id: "2025-spring",
      name: "2025 Spring",
      subjects: [
        {
          id: "ep",
          name: "Embedded Processor",
          description: "嵌入式处理器",
          url: "https://dt5edu.github.io/EP_Lecture_Notes/",
          color: "#9a8a7a",
        },
      ],
    },
    {
      id: "2024-fall",
      name: "2024 Fall",
      subjects: [
        {
          id: "cad",
          name: "Circuit Analysis & Design",
          description: "电路分析与设计",
          url: "https://github.com/Cateds/CAD_Lecture_Notes",
          color: "#7a8a9a",
        },
      ],
    },
    {
      id: "2024-spring",
      name: "2024 Spring",
      subjects: [
        {
          id: "ms",
          name: "Microelectronic System",
          description: "微电子系统",
          url: "https://mp.weixin.qq.com/s/AYa62B2QCY9LKmJO5vs69g",
          color: "#9a7a8a",
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
      color: "#7a8a9a",
    },
    {
      id: "repo2",
      name: "cli-toolkit",
      description: "Powerful CLI toolkit for developers",
      url: "https://github.com/username/cli-toolkit",
      language: "Rust",
      stars: 89,
      forks: 12,
      color: "#9a8a7a",
    },
    {
      id: "repo3",
      name: "web-framework",
      description: "Lightweight web framework with zero dependencies",
      url: "https://github.com/username/web-framework",
      language: "JavaScript",
      stars: 256,
      forks: 45,
      color: "#8a9a7a",
    },
    {
      id: "repo4",
      name: "ml-experiments",
      description: "Machine learning experiments and notebooks",
      url: "https://github.com/username/ml-experiments",
      language: "Python",
      stars: 67,
      forks: 8,
      color: "#8a7a9a",
    },
  ],
  tools: [
    {
      id: "study-hub",
      name: "学汇 : Study Hub",
      description:
        "一个整合格院各类学习资源的平台，提供课程笔记、习题解答、复习资料等。",
      url: "https://www.study-hub.store/",
      icon: "cards",
      color: "#7a9a9a",
    },
  ],
  theme: {
    defaultTheme: "system",
    warmAccent: "#4a8a8f",
    particleColor: "#4a8a8f",
  },
  features: {
    blog: false,
    repos: false,
    tools: true,
  },
};

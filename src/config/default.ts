import type { SiteConfig } from "../types";

export const siteConfig: SiteConfig = {
  profile: {
    name: "Cateds",
    avatar: "/avatar.png",
    bio: "Glasgow College, UESTC",
    navLinks: [
      { name: "Notes", path: "/", icon: "notes" },
      { name: "Repos", path: "/repos", icon: "repo" },
      { name: "Blog", path: "/blog", icon: "blog" },
      { name: "Links", path: "/links", icon: "links" },
    ],
    externalLinks: [
      { name: "GitHub", url: "https://github.com/Cateds", icon: "github" },
      // { name: "Email", url: "mailto:your@email.com", icon: "email" },
    ],
  },
  semesters: [
    {
      id: "2026-spring",
      name: "Year.3 Term.2 - 2026 Spring",
      subjects: [
        {
          id: "dc",
          name: "Dynamics & Control",
          description: "动力学与控制",
          url: "https://cateds.github.io/Dynamics-Control.md/",
          color: "#7b7ba0",
        },
        {
          id: "pe",
          name: "Power Electronics",
          description: "电力电子",
          url: "https://cateds.github.io/PowerElectronics.md/",
          color: "#6a999b",
        },
        {
          id: "epmf",
          name: "Engineering Project Management & Finance",
          description: "工程项目管理与财务",
          url: "https://cateds.github.io/EngProjManagement-Finance.md/",
          color: "#9a7b7b",
        },
      ],
    },
    {
      id: "2025-fall",
      name: "Year.3 Term.1 - 2025 Fall",
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
      name: "Year.2 Term.2 - 2025 Spring",
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
      name: "Year.2 Term.1 - 2024 Fall",
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
      name: "Year.1 Term.2 - 2024 Spring",
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
  links: [
    {
      id: "study-hub",
      name: "学汇 : Study Hub",
      description:
        "一个整合格院各类学习资源的平台，提供课程笔记、习题解答、复习资料等。",
      url: "https://www.study-hub.store/",
      icon: "cards",
      color: "#7a9a9a",
    },
    {
      id: "ayaskt-notes",
      name: "AyaSKT 工作站",
      description:
        "格院通信工程专业的系统化课程笔记站，涵盖电磁场与波、数字信号处理、通信电路设计、通信原理与系统、人工智能与机器学习等核心课程，大一至大三全覆盖。",
      url: "https://ayaskt.github.io/",
      icon: "cards",
      color: "#6a9aba",
    },
    {
      id: "andingdrlin-blog",
      name: "Latent Note",
      description:
        "AI 与 3D 视觉方向的个人科研博客，记录 Agent 工具实践、研究方法判断、课程学习心得与尚未收束的科研感悟，关注 AI 如何真正进入工作流。",
      url: "https://andingdrlin.github.io/",
      icon: "link",
      color: "#9a6aba",
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
    links: true,
  },
};

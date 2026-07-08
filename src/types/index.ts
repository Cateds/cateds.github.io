export interface NavLink {
  name: string;
  path: string;
  icon?: string;
}

export interface ExternalLink {
  name: string;
  url: string;
  icon?: string;
}

export interface Profile {
  name: string;
  avatar?: string;
  bio?: string;
  navLinks: NavLink[];
  externalLinks: ExternalLink[];
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  url: string;
  color?: string;
}

export interface Semester {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface Repo {
  id: string;
  name: string;
  description?: string;
  url: string;
  language?: string;
  stars?: number;
  forks?: number;
  color?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  description?: string;
  date: Date;
  tags?: string[];
  content?: string;
  readingTime?: number;
}

export interface LinkItem {
  id: string;
  name: string;
  description?: string;
  url: string;
  icon?: string;
  color?: string;
}

export interface ThemeConfig {
  defaultTheme: "light" | "dark" | "system";
  warmAccent: string;
  particleColor: string;
}

export interface Features {
  blog: boolean;
  repos: boolean;
  links: boolean;
}

export interface SiteConfig {
  profile: Profile;
  semesters: Semester[];
  repos: Repo[];
  links: LinkItem[];
  theme: ThemeConfig;
  features: Features;
}

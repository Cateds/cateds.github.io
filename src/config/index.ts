import type {
  SiteConfig,
  Profile,
  Semester,
  ThemeConfig,
  Repo,
  ToolItem,
  Features,
} from "../types";
import { siteConfig as defaultConfig } from "./default";

export type { SiteConfig, Profile, Semester, ThemeConfig, Repo, ToolItem, Features };

export const siteConfig: SiteConfig = defaultConfig;

export function createConfig(config: Partial<SiteConfig>): SiteConfig {
  return {
    profile: { ...defaultConfig.profile, ...config.profile },
    semesters: config.semesters || defaultConfig.semesters,
    repos: config.repos || defaultConfig.repos,
    tools: config.tools || defaultConfig.tools,
    theme: { ...defaultConfig.theme, ...config.theme },
    features: { ...defaultConfig.features, ...config.features },
  };
}

export function updateProfile(profile: Partial<Profile>): Profile {
  return { ...defaultConfig.profile, ...profile };
}

export function addSemester(semester: Semester): Semester[] {
  return [...defaultConfig.semesters, semester];
}

export function addRepo(repo: Repo): Repo[] {
  return [...defaultConfig.repos, repo];
}

export function addTool(tool: ToolItem): ToolItem[] {
  return [...defaultConfig.tools, tool];
}

export function updateTheme(theme: Partial<ThemeConfig>): ThemeConfig {
  return { ...defaultConfig.theme, ...theme };
}

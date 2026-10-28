import type { Features, NavLink, Profile } from "../types";

/** Nav entries whose feature flag is on. Keeps sidebar and page numbering in sync. */
const gated: Record<string, keyof Features> = {
  "/blog": "blog",
  "/repos": "repos",
  "/links": "links",
};

export function visibleNav(profile: Profile, features: Features): NavLink[] {
  return profile.navLinks.filter((link) => {
    const flag = gated[link.path];
    return !flag || features[flag];
  });
}

/**
 * One-based position of a path in the visible nav, or 0 when it is not present.
 * Used for the printed section numbers, so they always match the sidebar.
 */
export function navIndex(profile: Profile, features: Features, path: string): number {
  const nav = visibleNav(profile, features);
  const index = nav.findIndex((link) =>
    link.path === "/" ? path === "/" : path.startsWith(link.path),
  );
  return index + 1;
}

export function navNumber(profile: Profile, features: Features, path: string): string {
  const index = navIndex(profile, features, path);
  return index > 0 ? String(index).padStart(2, "0") : "—";
}

import type { Profile } from "../types";
import ThemeToggle from "./ThemeToggle";
import "./Sidebar.css";

interface SidebarProps {
  profile: Profile;
  currentPath?: string;
}

const navIconMap: Record<string, JSX.Element> = {
  notes: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="18"
      height="18"
    >
      <path d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
      <path d="M8 9h8M8 13h6" />
    </svg>
  ),
  repo: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="18"
      height="18"
    >
      <path d="M3 3h18v18H3V3z" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  ),
  blog: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="18"
      height="18"
    >
      <path d="M12 19l7-7 3 3-7 7H12v-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  ),
  tools: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="18"
      height="18"
    >
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
};

const externalIconMap: Record<string, JSX.Element> = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
  email: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="18"
      height="18"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  ),
  blog: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="18"
      height="18"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
};

export default function Sidebar({ profile, currentPath = "" }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="profile-section">
          <div className="avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} />
            ) : (
              <div className="avatar-placeholder">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h1 className="profile-name">{profile.name}</h1>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        </div>

        <nav className="nav-section">
          <div className="section-label">Navigation</div>
          {profile.navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className={`nav-item ${currentPath === link.path ? "active" : ""}`}
            >
              <span className="nav-icon">
                {link.icon && navIconMap[link.icon]}
              </span>
              <span className="nav-name">{link.name}</span>
            </a>
          ))}
        </nav>

        <nav className="links-section">
          <div className="section-label">Links</div>
          {profile.externalLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              className="link-item"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="link-icon">
                {link.icon && externalIconMap[link.icon]}
              </span>
              <span className="link-name">{link.name}</span>
              <svg
                className="external-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="12"
                height="12"
              >
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

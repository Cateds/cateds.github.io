import type { Repo } from "../types";
import "./RepoCard.css";

interface RepoCardProps {
  repo: Repo;
}

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  Ruby: "#701516",
  PHP: "#4F5D95",
  C: "#555555",
  "C++": "#f34b7d",
  Shell: "#89e051",
  Markdown: "#083fa1",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

export default function RepoCard({ repo }: RepoCardProps) {
  const langColor =
    repo.color || languageColors[repo.language || ""] || "#6b6560";

  return (
    <a
      href={repo.url}
      className="repo-card"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="repo-header">
        <svg
          className="repo-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          width="18"
          height="18"
        >
          <path d="M3 3h18v18H3V3z" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <h3 className="repo-name">{repo.name}</h3>
      </div>

      {repo.description && (
        <p className="repo-description">{repo.description}</p>
      )}

      <div className="repo-footer">
        {repo.language && (
          <span className="repo-meta">
            <span className="lang-dot" style={{ backgroundColor: langColor }} />
            {repo.language}
          </span>
        )}

        {repo.stars !== undefined && (
          <span className="repo-meta">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {repo.stars}
          </span>
        )}

        {repo.forks !== undefined && (
          <span className="repo-meta">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              width="14"
              height="14"
            >
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <path d="M6 21V9a9 9 0 009 9" />
            </svg>
            {repo.forks}
          </span>
        )}
      </div>
    </a>
  );
}

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

export default function RepoCard(props: RepoCardProps) {
  const langColor = () =>
    props.repo.color ||
    languageColors[props.repo.language || ""] ||
    "#5a6e73";

  return (
    <a
      href={props.repo.url}
      class="repo-card"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="repo-header">
        <svg
          class="repo-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          width="18"
          height="18"
        >
          <path d="M3 3h18v18H3V3z" />
          <path d="M3 9h18M9 21V9" />
        </svg>
        <h3 class="repo-name">{props.repo.name}</h3>
      </div>

      {props.repo.description && (
        <p class="repo-description">{props.repo.description}</p>
      )}

      <div class="repo-footer">
        {props.repo.language && (
          <span class="repo-meta">
            <span
              class="lang-dot"
              style={{ "background-color": langColor() }}
            />
            {props.repo.language}
          </span>
        )}

        {props.repo.stars !== undefined && (
          <span class="repo-meta">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {props.repo.stars}
          </span>
        )}

        {props.repo.forks !== undefined && (
          <span class="repo-meta">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="14"
              height="14"
            >
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <path d="M6 21V9a9 9 0 009 9" />
            </svg>
            {props.repo.forks}
          </span>
        )}
      </div>
    </a>
  );
}
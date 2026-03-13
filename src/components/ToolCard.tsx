import type { JSX } from "solid-js/jsx-runtime";
import type { ToolItem } from "../types";
import "./ToolCard.css";

interface ToolCardProps {
  tool: ToolItem;
}

const iconMap: Record<string, JSX.Element> = {
  cards: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      width="24"
      height="24"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h4M7 12h6" />
    </svg>
  ),
  quiz: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      width="24"
      height="24"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </svg>
  ),
  formula: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      width="24"
      height="24"
    >
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  ),
  timer: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      width="24"
      height="24"
    >
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M9 2h6" />
    </svg>
  ),
  link: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      width="24"
      height="24"
    >
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  ),
  calculator: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      width="24"
      height="24"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <rect x="6" y="4" width="12" height="4" />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="16" cy="12" r="1" fill="currentColor" />
      <circle cx="8" cy="16" r="1" fill="currentColor" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="currentColor" />
    </svg>
  ),
};

export default function ToolCard(props: ToolCardProps) {
  return (
    <a
      href={props.tool.url}
      class="tool-card"
      style={{
        "--tool-color": props.tool.color || "var(--color-accent)",
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="tool-icon">{props.tool.icon && iconMap[props.tool.icon]}</div>

      <div class="tool-content">
        <h3 class="tool-name">{props.tool.name}</h3>
        {props.tool.description && (
          <p class="tool-description">{props.tool.description}</p>
        )}
      </div>

      <svg
        class="tool-arrow"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        width="16"
        height="16"
      >
        <path d="M7 17L17 7M17 7H7M17 7v10" />
      </svg>
    </a>
  );
}

import type { Subject } from "../types";
import "./SubjectCard.css";

interface SubjectCardProps {
  subject: Subject;
}

function getTitleDensityClass(title: string): string | undefined {
  const compactLength = title.replace(/\s+/g, "").length;

  if (compactLength >= 28) return "title-compact-strong";
  if (compactLength >= 20) return "title-compact";
  return undefined;
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(74, 138, 143, ${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function SubjectCard(props: SubjectCardProps) {
  const color = () => props.subject.color || "#6a8a9a";
  const titleDensityClass = () => getTitleDensityClass(props.subject.name);

  return (
    <a
      href={props.subject.url}
      class="subject-card"
      classList={{
        "title-compact": titleDensityClass() === "title-compact",
        "title-compact-strong": titleDensityClass() === "title-compact-strong",
      }}
      style={{
        "--subject-color": color(),
        "--subject-bg": hexToRgba(color(), 0.12),
        "--subject-border": hexToRgba(color(), 0.3),
      }}
    >
      <div class="card-content">
        <div class="card-header">
          <div class="card-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h3 class="card-title">{props.subject.name}</h3>
        </div>

        {props.subject.description && (
          <p class="card-description">{props.subject.description}</p>
        )}

        <div class="card-footer">
          <span class="card-badge">Notes</span>
          <svg
            class="card-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="16"
            height="16"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
}

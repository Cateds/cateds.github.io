import type { Subject } from "../types";
import "./SubjectCard.css";

interface SubjectCardProps {
  subject: Subject;
}

export default function SubjectCard(props: SubjectCardProps) {
  return (
    <a
      href={props.subject.url}
      class="subject-card"
      style={{
        "--subject-color": props.subject.color || "var(--color-accent)",
      }}
    >
      <div class="card-indicator" />
      <div class="card-content">
        <h3 class="card-title">{props.subject.name}</h3>
        {props.subject.description && (
          <p class="card-description">{props.subject.description}</p>
        )}
      </div>
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
    </a>
  );
}
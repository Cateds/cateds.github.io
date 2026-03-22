import { createSignal } from "solid-js";
import type { Semester } from "../types";
import SubjectCard from "./SubjectCard";
import "./SemesterDrawer.css";

interface SemesterDrawerProps {
  semester: Semester;
  defaultOpen?: boolean;
}

export default function SemesterDrawer(props: SemesterDrawerProps) {
  const [isOpen, setIsOpen] = createSignal(props.defaultOpen ?? false);

  return (
    <div classList={{ "semester-drawer": true, open: isOpen() }}>
      <button
        class="drawer-header"
        onClick={() => setIsOpen(!isOpen())}
        aria-expanded={isOpen()}
      >
        <span class="drawer-title">{props.semester.name}</span>
        <span class="drawer-meta">
          {props.semester.subjects.length} subjects
        </span>
        <svg
          class="drawer-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          width="16"
          height="16"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div class="drawer-content">
        <div class="subjects-scroll">
          {props.semester.subjects.map((subject) => (
            <SubjectCard subject={subject} />
          ))}
        </div>
      </div>
    </div>
  );
}

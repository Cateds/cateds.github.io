import { useState } from "react";
import type { Semester } from "../types";
import SubjectCard from "./SubjectCard";
import "./SemesterDrawer.css";

interface SemesterDrawerProps {
  semester: Semester;
  defaultOpen?: boolean;
}

export default function SemesterDrawer({
  semester,
  defaultOpen = false,
}: SemesterDrawerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`semester-drawer ${isOpen ? "open" : ""}`}>
      <button
        className="drawer-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="drawer-title">{semester.name}</span>
        <span className="drawer-meta">{semester.subjects.length} subjects</span>
        <svg
          className="drawer-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          width="16"
          height="16"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className="drawer-content">
        <div className="subjects-scroll">
          {semester.subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </div>
    </div>
  );
}

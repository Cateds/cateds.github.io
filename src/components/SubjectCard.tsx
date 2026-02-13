import type { Subject } from '../types'
import './SubjectCard.css'

interface SubjectCardProps {
  subject: Subject
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  return (
    <a
      href={subject.url}
      className="subject-card"
      style={{ '--subject-color': subject.color || 'var(--color-accent)' } as React.CSSProperties}
    >
      <div className="card-indicator" />
      <div className="card-content">
        <h3 className="card-title">{subject.name}</h3>
        {subject.description && (
          <p className="card-description">{subject.description}</p>
        )}
      </div>
      <svg
        className="card-arrow"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        width="16"
        height="16"
      >
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </a>
  )
}

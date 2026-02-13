import type { BlogPost } from '../types'
import './BlogCard.css'

interface BlogCardProps {
  post: BlogPost
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export default function BlogCard({ post }: BlogCardProps) {
  const readingTime = post.readingTime || (post.content ? calculateReadingTime(post.content) : 1)
  
  return (
    <article className="blog-card">
      <a href={`/blog/${post.id}`} className="blog-card-link">
        <time className="blog-date">
          {post.date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </time>
        
        <div className="blog-content">
          <h3 className="blog-title">{post.title}</h3>
          
          {post.description && (
            <p className="blog-description">{post.description}</p>
          )}
          
          <div className="blog-meta">
            {post.tags && post.tags.length > 0 && (
              <div className="blog-tags">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="blog-tag">{tag}</span>
                ))}
              </div>
            )}
            
            <span className="blog-reading-time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              {readingTime} min read
            </span>
          </div>
        </div>
      </a>
    </article>
  )
}

import type { BlogPost } from "../types";
import "./BlogCard.css";

interface BlogCardProps {
  post: BlogPost;
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export default function BlogCard(props: BlogCardProps) {
  const readingTime = () =>
    props.post.readingTime ||
    (props.post.content ? calculateReadingTime(props.post.content) : 1);

  return (
    <article class="blog-card">
      <a href={`/blog/${props.post.id}`} class="blog-card-link">
        <time class="blog-date">
          {props.post.date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>

        <div class="blog-content">
          <h3 class="blog-title">{props.post.title}</h3>

          {props.post.description && (
            <p class="blog-description">{props.post.description}</p>
          )}

          <div class="blog-meta">
            {props.post.tags && props.post.tags.length > 0 && (
              <div class="blog-tags">
                {props.post.tags.slice(0, 3).map((tag) => (
                  <span class="blog-tag">{tag}</span>
                ))}
              </div>
            )}

            <span class="blog-reading-time">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="14"
                height="14"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {readingTime()} min read
            </span>
          </div>
        </div>
      </a>
    </article>
  );
}
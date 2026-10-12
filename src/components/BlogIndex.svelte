<script lang="ts">
  import * as ToggleGroup from "$lib/components/ui/toggle-group";

  interface PostView {
    id: string;
    title: string;
    description?: string;
    date: string;
    dateLabel: string;
    tags: string[];
    minutes: number;
  }

  let { posts, tags }: { posts: PostView[]; tags: string[] } = $props();
  let active = $state("all");

  const visible = $derived(
    active === "all" || !active ? posts : posts.filter((post) => post.tags.includes(active)),
  );
</script>

{#if tags.length > 0}
  <div class="focus-in filter" style:--d={2}>
    <span class="eyebrow">Filter</span>
    <ToggleGroup.Root
      type="single"
      bind:value={active}
      size="sm"
      spacing={1}
      class="flex-wrap"
      aria-label="Filter posts by tag"
    >
      <ToggleGroup.Item value="all" class="tag">All</ToggleGroup.Item>
      {#each tags as tag (tag)}
        <ToggleGroup.Item value={tag} class="tag">{tag}</ToggleGroup.Item>
      {/each}
    </ToggleGroup.Root>
  </div>
{/if}

<ol class="posts">
  {#each visible as post, i (post.id)}
    <li class="focus-in" style:--d={Math.min(i + 3, 10)}>
      <a href={`/blog/${post.id}`} class="post">
        <time class="eyebrow" datetime={post.date}>{post.dateLabel}</time>
        <span class="post-body">
          <span class="post-title">{post.title}</span>
          {#if post.description}
            <span class="post-desc">{post.description}</span>
          {/if}
        </span>
        <span class="post-meta eyebrow">
          {post.tags.slice(0, 2).join(" · ")}
          <span>{post.minutes} min</span>
        </span>
      </a>
    </li>
  {:else}
    <li class="empty">No posts with this tag yet. Choose another tag or show all posts.</li>
  {/each}
</ol>

<style>
  .filter {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .filter :global(.tag) {
    font-size: 0.75rem;
    letter-spacing: 0.02em;
    color: var(--ink-2);
    border: 1px solid var(--line);
    border-radius: var(--radius-ui);
  }

  .filter :global(.tag[data-state="on"]) {
    color: var(--ink);
    background: var(--surface-strong);
    border-color: var(--accent);
  }

  .posts {
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid var(--line);
  }

  .posts li {
    border-bottom: 1px solid var(--line);
  }

  .post {
    display: grid;
    grid-template-columns: 8rem 1fr auto;
    gap: 1.5rem;
    align-items: baseline;
    padding: 1.5rem 0.5rem;
    transition:
      background-color 0.3s ease,
      padding 0.45s var(--ease-focus);
  }

  .post:hover {
    padding-left: 1rem;
    background: linear-gradient(90deg, var(--surface), transparent);
  }

  .post-body {
    display: grid;
    gap: 0.375rem;
  }

  .post-title {
    font-family: var(--font-display);
    font-size: clamp(1.375rem, 2.4vw, 1.875rem);
    font-weight: 600;
    line-height: 1.15;
    letter-spacing: -0.01em;
  }

  .post:hover .post-title {
    color: var(--accent);
  }

  .post-desc {
    max-width: 40rem;
    font-size: 0.9375rem;
    color: var(--ink-2);
  }

  .post-meta {
    display: grid;
    justify-items: end;
    gap: 0.25rem;
  }

  .empty {
    padding: 2rem 0;
    color: var(--ink-2);
  }

  @media (max-width: 640px) {
    .post {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .post-meta {
      justify-items: start;
      grid-auto-flow: column;
      justify-content: start;
      gap: 1rem;
    }
  }
</style>

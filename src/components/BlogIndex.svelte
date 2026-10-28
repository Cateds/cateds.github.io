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
    <span class="filter-rule" aria-hidden="true" />
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
        <span class="post-no eyebrow" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
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
    gap: 0.875rem;
    margin-bottom: 2rem;
  }

  .filter-rule {
    width: 2rem;
    height: 1px;
    background: var(--gold);
  }

  .filter :global(.tag) {
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink-2);
    background: transparent;
    border: 1px solid var(--line-strong);
    border-radius: 0;
    padding-inline: 0.45rem;
  }

  .filter :global(.tag:hover) {
    border-color: var(--ink);
    color: var(--ink);
  }

  .filter :global(.tag[data-state="on"]) {
    color: var(--block-ink);
    background: var(--block);
    border-color: var(--block);
  }

  .posts {
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid var(--line-strong);
  }

  .posts li {
    border-bottom: 1px solid var(--line);
  }

  .post {
    position: relative;
    display: grid;
    grid-template-columns: 2.25rem 7.5rem 1fr auto;
    gap: 1.5rem;
    align-items: baseline;
    padding: 1.5rem 0.5rem;
    transition:
      background-color 0.3s ease,
      padding 0.4s var(--ease-focus);
  }

  .post::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 3px;
    height: 0;
    background: var(--gold);
    transition: height 0.4s var(--ease-focus);
  }

  .post:hover {
    padding-left: 1rem;
    background-color: var(--surface);
  }

  .post:hover::before {
    height: 100%;
  }

  .post-no {
    font-size: 0.5625rem;
    color: var(--gold);
  }

  .post-body {
    display: grid;
    gap: 0.375rem;
  }

  .post-title {
    font-family: var(--font-display);
    font-size: clamp(1.375rem, 2.4vw, 1.875rem);
    font-weight: 750;
    line-height: 1.1;
    letter-spacing: -0.04em;
    text-wrap: balance;
    transition:
      color 0.2s ease,
      text-shadow 0.3s ease;
  }

  .post:hover .post-title {
    color: var(--accent);
    text-shadow:
      -0.02em -0.014em 0 var(--disp-cool),
      0.02em 0.014em 0 var(--disp-warm);
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

  @media (max-width: 760px) {
    .post {
      grid-template-columns: 2rem 1fr;
      gap: 0.35rem 0.75rem;
    }

    .post time {
      grid-column: 2;
      grid-row: 1;
    }

    .post-no {
      grid-row: 1;
    }

    .post-body {
      grid-column: 2;
    }

    .post-meta {
      grid-column: 2;
      grid-auto-flow: column;
      justify-content: start;
      justify-items: start;
      gap: 1rem;
    }
  }

  @media (max-width: 640px) {
    .filter {
      flex-wrap: wrap;
    }
  }
</style>

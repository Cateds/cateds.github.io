<script lang="ts">
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import * as Collapsible from "$lib/components/ui/collapsible";

  interface SubjectView {
    id: string;
    name: string;
    description?: string;
    url: string;
    tone: string;
  }

  interface Props {
    id: string;
    season: string;
    stage: string;
    subjects: SubjectView[];
    open?: boolean;
    delay?: number;
  }

  let { id, season, stage, subjects, open = $bindable(true), delay = 0 }: Props = $props();
  const isExternal = (url: string) => /^https?:\/\//.test(url);
</script>

<Collapsible.Root bind:open class="term" data-open={open}>
  <div class="term-head focus-in" style:--d={delay}>
    <Collapsible.Trigger class="term-trigger" aria-controls={`${id}-subjects`}>
      <span class="term-stage eyebrow">{stage}</span>
      <span class="term-season display">{season}</span>
      <span class="term-count eyebrow">
        {subjects.length}
        {subjects.length === 1 ? "course" : "courses"}
      </span>
      <ChevronDown class="term-chevron" strokeWidth={1.25} aria-hidden="true" />
    </Collapsible.Trigger>
  </div>

  <Collapsible.Content forceMount id={`${id}-subjects`} class="term-body">
    <div class="term-clip">
      <ul class="subjects" inert={!open}>
        {#each subjects as subject, i (subject.id)}
          <li class="focus-in" style:--d={delay + i + 1}>
            {#if subject.url}
              <a
                class="subject pane pane-link"
                href={subject.url}
                style={subject.tone}
                target={isExternal(subject.url) ? "_blank" : undefined}
                rel={isExternal(subject.url) ? "noopener noreferrer" : undefined}
              >
                <span class="subject-name">{subject.name}</span>
                {#if subject.description}
                  <span class="subject-cn">{subject.description}</span>
                {/if}
                <span class="subject-foot">
                  <span class="eyebrow">Read notes</span>
                  <ArrowUpRight
                    class="subject-arrow"
                    size={15}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
              </a>
            {:else}
              <div class="subject pane pending" style={subject.tone}>
                <span class="subject-name">{subject.name}</span>
                {#if subject.description}
                  <span class="subject-cn">{subject.description}</span>
                {/if}
                <span class="subject-foot">
                  <span class="eyebrow">In progress</span>
                </span>
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  </Collapsible.Content>
</Collapsible.Root>

<style>
  :global(.term) {
    display: grid;
    grid-template-columns: minmax(9rem, 12rem) 1fr;
    column-gap: clamp(1.5rem, 4vw, 4rem);
    padding-block: clamp(1.5rem, 3vw, 2.25rem);
    border-top: 1px solid var(--line);
  }

  .term-head {
    position: relative;
  }

  :global(.term-trigger) {
    position: sticky;
    top: 1.5rem;
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "stage chevron"
      "season season"
      "count count";
    width: 100%;
    gap: 0.35rem;
    padding: 0;
    text-align: left;
    color: var(--ink);
    background: none;
    border: 0;
    cursor: pointer;
    border-radius: var(--radius-ui);
  }

  .term-stage {
    grid-area: stage;
  }

  .term-season {
    grid-area: season;
    font-size: clamp(1.625rem, 2.3vw, 2.125rem);
    line-height: 1;
    white-space: nowrap;
    font-style: italic;
  }

  .term-count {
    grid-area: count;
    color: var(--accent);
  }

  :global(.term-chevron) {
    grid-area: chevron;
    width: 1rem;
    height: 1rem;
    color: var(--ink-3);
    transition: transform 0.5s var(--ease-focus);
  }

  :global(.term[data-open="false"] .term-chevron) {
    transform: rotate(-90deg);
  }

  /* Height animates via grid rows so the content can stay mounted. */
  :global(.term-body) {
    display: grid;
    grid-template-rows: 1fr;
    transition:
      grid-template-rows 0.6s var(--ease-focus),
      opacity 0.5s ease,
      filter 0.6s var(--ease-focus);
  }

  :global(.term-body[data-state="closed"]) {
    grid-template-rows: 0fr;
    opacity: 0;
    filter: blur(8px);
  }

  .term-clip {
    min-height: 0;
    overflow: clip;
    overflow-clip-margin: 8px;
  }

  .subjects {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14.5rem, 1fr));
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .subjects li {
    display: flex;
  }

  .subject {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.375rem;
    min-height: 9.5rem;
    padding: 1.125rem 1.25rem 1rem 1.375rem;
    overflow: hidden;
  }

  /* Tone mark: a thin vertical stroke carrying the course's harmonized color. */
  .subject::before {
    content: "";
    position: absolute;
    left: 0;
    top: 1.125rem;
    width: 2px;
    border-radius: 0 2px 2px 0;
    height: 1.25rem;
    background: var(--tone-line);
    transition: height 0.5s var(--ease-focus);
  }

  .subject::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(115deg, var(--tone-wash), transparent 55%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  .subject:hover::before,
  .subject:focus-visible::before {
    height: calc(100% - 2.25rem);
  }

  .subject:hover::after,
  .subject:focus-visible::after {
    opacity: 0.55;
  }

  .subject > * {
    position: relative;
    z-index: 1;
  }

  .subject-name {
    font-size: 1.0625rem;
    font-weight: 560;
    line-height: 1.3;
    letter-spacing: -0.01em;
    color: var(--ink);
    text-wrap: balance;
  }

  .subject-cn {
    font-family: var(--font-cjk-serif);
    font-size: 0.875rem;
    color: var(--tone-ink);
  }

  .subject-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 1rem;
  }

  :global(.subject-arrow) {
    color: var(--ink-3);
    transition:
      transform 0.45s var(--ease-focus),
      color 0.2s ease;
  }

  .subject:hover :global(.subject-arrow) {
    color: var(--tone-ink);
    transform: translate(2px, -2px);
  }

  /* Not published yet: same glass, dashed outline, quieter text, no tone mark. */
  .pending {
    border-style: dashed;
    border-color: var(--line-strong);
    box-shadow: inset 0 1px 0 var(--glass-edge);
  }

  .pending::before {
    background: var(--line-strong);
  }

  .pending .subject-cn {
    color: var(--ink-3);
  }

  .pending .subject-name {
    color: var(--ink-2);
  }

  @media (max-width: 980px) {
    :global(.term) {
      grid-template-columns: 1fr;
      row-gap: 1.25rem;
    }

    :global(.term-trigger) {
      position: static;
      grid-template-areas:
        "stage chevron"
        "season chevron"
        "count chevron";
    }

    .subjects {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .subject {
      min-height: 0;
    }
  }
</style>

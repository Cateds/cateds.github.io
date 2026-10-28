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
    index?: number;
    open?: boolean;
    delay?: number;
  }

  let {
    id,
    season,
    stage,
    subjects,
    index = 1,
    open = $bindable(true),
    delay = 0,
  }: Props = $props();
  const isExternal = (url: string) => /^https?:\/\//.test(url);
</script>

<Collapsible.Root bind:open class="term" data-open={open}>
  <div class="term-head focus-in" style:--d={delay} data-index={String(index).padStart(2, "0")}>
    <Collapsible.Trigger class="term-trigger" aria-controls={`${id}-subjects`}>
      <span class="term-stage eyebrow">
        <span class="term-index" aria-hidden="true">{String(index).padStart(2, "0")}</span>
        {stage}
      </span>
      <span class="term-season display">{season}</span>
      <span class="term-count eyebrow">
        <i aria-hidden="true" />
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
                <span class="subject-index eyebrow" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
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
                <span class="subject-index eyebrow" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
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
    grid-template-columns: minmax(9.5rem, 13rem) 1fr;
    column-gap: clamp(1.5rem, 4vw, 4rem);
    padding-block: clamp(1.75rem, 3.2vw, 2.5rem);
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
    gap: 0.4rem;
    padding: 0;
    text-align: left;
    color: var(--ink);
    background: none;
    border: 0;
    cursor: pointer;
    border-radius: 0;
  }

  .term-stage {
    grid-area: stage;
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
  }

  .term-index {
    color: var(--gold);
    font-size: 0.625rem;
    letter-spacing: 0.02em;
  }

  .term-season {
    grid-area: season;
    font-size: clamp(1.875rem, 2.8vw, 2.625rem);
    line-height: 0.92;
    letter-spacing: -0.05em;
    text-transform: uppercase;
    white-space: nowrap;
    transition:
      color 0.2s ease,
      text-shadow 0.3s ease;
  }

  :global(.term-trigger:hover) .term-season {
    color: var(--accent);
    text-shadow:
      -0.025em -0.018em 0 var(--disp-cool),
      0.025em 0.018em 0 var(--disp-warm);
  }

  .term-count {
    grid-area: count;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    width: fit-content;
    margin-top: 0.25rem;
    padding: 0.1875rem 0.5rem 0.1875rem 0.375rem;
    border: 1px solid var(--block);
    color: var(--block-ink);
    background: var(--block);
  }

  .term-count i {
    width: 0.3125rem;
    height: 0.3125rem;
    background: var(--gold);
  }

  :global([data-theme="dark"]) .term-count i {
    background: var(--accent-2);
  }

  :global(.term-chevron) {
    grid-area: chevron;
    width: 0.875rem;
    height: 0.875rem;
    padding: 0.375rem;
    box-sizing: content-box;
    color: var(--ink-2);
    border: 1px solid var(--line-strong);
    transition:
      transform 0.5s var(--ease-focus),
      color 0.2s ease,
      border-color 0.2s ease;
  }

  :global(.term-trigger:hover) :global(.term-chevron) {
    color: var(--ink);
    border-color: var(--ink);
  }

  :global(.term[data-open="false"] .term-chevron) {
    transform: rotate(-90deg);
  }

  /* Height animates via grid rows so the content can stay mounted. */
  :global(.term-body) {
    display: grid;
    grid-template-rows: 1fr;
    transition:
      grid-template-rows 0.5s var(--ease-focus),
      opacity 0.3s ease;
  }

  :global(.term-body[data-state="closed"]) {
    grid-template-rows: 0fr;
    opacity: 0;
  }

  .term-clip {
    min-height: 0;
    overflow: clip;
    overflow-clip-margin: 8px;
  }

  .subjects {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
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
    min-height: 10.5rem;
    padding: 1.25rem 1.375rem 1rem 1.5rem;
    overflow: hidden;
  }

  .subject.pane-link:hover,
  .subject.pane-link:focus-visible {
    background-color: color-mix(in oklab, var(--card-glass-hover) 90%, var(--tone-wash) 10%);
  }

  /* Tone bar: the course colour printed down the spine of the sheet. */
  .subject::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 4px;
    height: 100%;
    background: var(--tone-line);
    opacity: 0.7;
    transition: opacity 0.35s ease;
  }

  /* Corner fold: a small triangle of the same ink. */
  .subject::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 0;
    height: 0;
    border-top: 0.75rem solid var(--tone-line);
    border-left: 0.75rem solid transparent;
    opacity: 0.75;
    transition: opacity 0.35s ease;
    pointer-events: none;
  }

  .subject:hover::before,
  .subject:focus-visible::before {
    opacity: 1;
  }

  .subject:hover::after,
  .subject:focus-visible::after {
    opacity: 1;
  }

  .subject > * {
    position: relative;
    z-index: 1;
  }

  .subject-index {
    position: absolute;
    top: 1.125rem;
    right: 1.25rem;
    z-index: 2;
    display: inline-grid;
    place-items: center;
    min-width: 1.375rem;
    height: 1.375rem;
    padding-inline: 0.25rem;
    font-size: 0.5625rem;
    color: var(--bg);
    background: var(--tone-line);
  }

  .subject-name {
    padding-right: 2.25rem;
    font-size: 1.0625rem;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: -0.02em;
    color: var(--ink);
    text-wrap: balance;
  }

  .subject-cn {
    font-family: var(--font-cjk-serif);
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--tone-ink);
  }

  .subject-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 0.875rem;
    border-top: 1px solid var(--line);
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

  /* Not published yet: hatched paper, dashed outline, quieter text. */
  .pending {
    border-style: dashed;
    border-color: var(--line-strong);
    background-image: repeating-linear-gradient(135deg, transparent 0 6px, var(--hatch) 6px 7px);
    box-shadow: inset 0 1px 0 var(--glass-edge);
  }

  .pending::before {
    background: var(--line-strong);
  }

  .pending::after {
    border-top-color: var(--line-strong);
  }

  .pending .subject-cn {
    color: var(--ink-3);
  }

  .pending .subject-name {
    color: var(--ink-2);
  }

  .pending .subject-index {
    color: var(--bg);
    background: var(--ink-3);
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

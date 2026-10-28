<script lang="ts">
  import { onMount } from "svelte";
  import MoonStar from "@lucide/svelte/icons/moon-star";
  import Sun from "@lucide/svelte/icons/sun";
  import { Button } from "$lib/components/ui/button";

  type Theme = "light" | "dark";
  let theme = $state<Theme>("light");
  let switchTimer = 0;

  const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

  onMount(() => {
    theme = read();
    const sync = () => (theme = read());
    document.addEventListener("astro:after-swap", sync);
    return () => {
      document.removeEventListener("astro:after-swap", sync);
      window.clearTimeout(switchTimer);
      delete document.documentElement.dataset.themeSwitching;
    };
  });

  function apply(next: Theme) {
    const root = document.documentElement;
    root.dataset.theme = next;
    root.style.colorScheme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked; changing the current theme must still work.
    }
    theme = next;
  }

  // Live crossfade rather than a View Transition: a snapshot would freeze the frosted
  // glass for the length of the animation. Registered root palette colours retain
  // the fade without creating independent transitions on every DOM element.
  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.clearTimeout(switchTimer);
    if (!reduce) {
      root.dataset.themeSwitching = "";
      switchTimer = window.setTimeout(() => delete root.dataset.themeSwitching, 700);
    } else {
      delete root.dataset.themeSwitching;
    }
    apply(next);
  }

  const label = $derived(theme === "light" ? "Switch to night" : "Switch to day");
</script>

<Button
  variant="ghost"
  size="icon-sm"
  class="theme-toggle text-ink-2 hover:text-ink"
  aria-label={label}
  title={label}
  onclick={toggle}
>
  {#if theme === "light"}
    <Sun strokeWidth={1.5} />
  {:else}
    <MoonStar strokeWidth={1.5} />
  {/if}
</Button>

<style>
  :global(.theme-toggle) {
    border: 1px solid transparent;
    border-radius: 0;
    transition:
      color 0.2s ease,
      background-color 0.2s ease,
      border-color 0.2s ease,
      transform 0.35s var(--ease-focus);
  }

  :global(.theme-toggle:hover) {
    color: var(--block-ink);
    background: var(--block);
    border-color: var(--block);
    transform: rotate(-4deg);
  }

  :global(.theme-toggle:active) {
    transform: rotate(0deg) scale(0.94);
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.theme-toggle:hover) {
      transform: none;
    }
  }
</style>

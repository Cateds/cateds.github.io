<script lang="ts">
  import { onMount } from "svelte";
  import MoonStar from "@lucide/svelte/icons/moon-star";
  import Sun from "@lucide/svelte/icons/sun";
  import { Button } from "$lib/components/ui/button";

  type Theme = "light" | "dark";
  let theme = $state<Theme>("light");

  const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

  onMount(() => {
    theme = read();
    const sync = () => (theme = read());
    document.addEventListener("astro:after-swap", sync);
    return () => document.removeEventListener("astro:after-swap", sync);
  });

  function apply(next: Theme) {
    const root = document.documentElement;
    root.dataset.theme = next;
    root.style.colorScheme = next;
    localStorage.setItem("theme", next);
    theme = next;
  }

  // Live crossfade rather than a View Transition: a snapshot would freeze the frosted
  // glass for the length of the animation. Colours ease via the tokens; the sky eases
  // between day and night on its own.
  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      root.dataset.themeSwitching = "";
      window.setTimeout(() => delete root.dataset.themeSwitching, 700);
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

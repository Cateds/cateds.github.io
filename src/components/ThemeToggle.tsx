import { createSignal, onMount, Show } from "solid-js";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const [theme, setTheme] = createSignal<"light" | "dark">("light");
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme("dark");
    }
    setMounted(true);
  });

  const toggleTheme = () => {
    const newTheme = theme() === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      class="theme-toggle"
      data-theme={theme()}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme() === "light" ? "dark" : "light"} mode`}
    >
      <div class="theme-toggle-switch">
        <div class="theme-toggle-thumb">
          <Show
            when={theme() === "dark"}
            fallback={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                width="12"
                height="12"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              width="12"
              height="12"
            >
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          </Show>
        </div>
      </div>
      <span class="theme-toggle-label">
        <Show when={theme() === "dark"} fallback="Light">Dark</Show>
      </span>
    </button>
  );
}
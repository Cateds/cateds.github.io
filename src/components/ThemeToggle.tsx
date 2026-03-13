import { createSignal, onCleanup, onMount } from "solid-js";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const [theme, setTheme] = createSignal<"light" | "dark">("light");

  const syncTheme = () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    setTheme(currentTheme === "dark" ? "dark" : "light");
  };

  onMount(() => {
    syncTheme();
    document.addEventListener("astro:after-swap", syncTheme);
    window.addEventListener("themechange", syncTheme);

    onCleanup(() => {
      document.removeEventListener("astro:after-swap", syncTheme);
      window.removeEventListener("themechange", syncTheme);
    });
  });

  const toggleTheme = () => {
    const newTheme = theme() === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    window.dispatchEvent(new CustomEvent("themechange"));
  };

  return (
    <button
      class="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme() === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme() === "light" ? "dark" : "light"} mode`}
    >
      <div class="theme-toggle-switch">
        <div class="theme-toggle-thumb" />
      </div>
      <span class="theme-toggle-label">Theme</span>
    </button>
  );
}

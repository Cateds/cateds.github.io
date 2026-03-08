import { createSignal, createEffect, onCleanup } from "solid-js";
import type { Profile } from "../types";
import "./MobileLayout.css";

interface MobileLayoutProps {
  profile: Profile;
}

export default function MobileLayout(props: MobileLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  createEffect(() => {
    if (isMenuOpen()) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });

  onCleanup(() => {
    document.body.style.overflow = "";
  });

  return (
    <>
      <button
        class="mobile-menu-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen())}
        aria-label="Toggle menu"
      >
        {isMenuOpen() ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="24"
            height="24"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            width="24"
            height="24"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {isMenuOpen() && (
        <div class="mobile-overlay" onClick={() => setIsMenuOpen(false)} />
      )}
    </>
  );
}
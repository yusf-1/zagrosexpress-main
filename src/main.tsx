import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

const hasScrollableParent = (target: EventTarget | null) => {
  let el = target as HTMLElement | null;
  while (el && el !== document.body) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
    if (isScrollable) return true;
    el = el.parentElement;
  }
  return false;
};

// Prevent iOS rubber-banding only when there is no scrollable ancestor.
if (isIOS) {
  document.addEventListener('touchmove', (e) => {
    if (!hasScrollableParent(e.target)) {
      e.preventDefault();
    }
  }, { passive: false });

  // Fix for iOS keyboard resize issues
  window.visualViewport?.addEventListener('resize', () => {
    document.body.style.height = `${window.visualViewport?.height}px`;
  });
}

createRoot(document.getElementById("root")!).render(<App />);

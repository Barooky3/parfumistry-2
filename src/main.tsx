import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Polyfill requestIdleCallback for Safari/iOS which doesn't support it
// Prevents white-screen crashes on Apple devices
if (typeof window !== 'undefined' && !window.requestIdleCallback) {
  (window as any).requestIdleCallback = (cb: IdleRequestCallback, opts?: IdleRequestOptions) => {
    const start = Date.now();
    return window.setTimeout(() => {
      cb({ didTimeout: false, timeRemaining: () => Math.max(0, 50 - (Date.now() - start)) } as IdleDeadline);
    }, opts?.timeout ? Math.min(opts.timeout, 1000) : 1);
  };
  (window as any).cancelIdleCallback = (id: number) => window.clearTimeout(id);
}

createRoot(document.getElementById("root")!).render(<App />);

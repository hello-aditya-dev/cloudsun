"use client";

import { useSyncExternalStore } from "react";
import { getDemoState, subscribe, isDemoHydrated } from "@/lib/demo-store";

/**
 * Subscribe a React component to demo state changes.
 * Returns the current DemoState. Components re-render when state changes.
 *
 * On SSR and the first client render, returns the seeded default state
 * (so hydration matches). After mount, the stored state is used.
 */
export function useDemoState() {
  return useSyncExternalStore(
    subscribe,
    () => getDemoState(),
    () => getDemoState(), // server snapshot = same default
  );
}

export function useDemoHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => isDemoHydrated(),
    () => false,
  );
}

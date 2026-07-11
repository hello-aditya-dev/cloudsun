/**
 * CloudSun — Reduced motion support.
 * When the user has prefers-reduced-motion enabled, replace complex
 * transitions with short opacity changes. Keep all content and actions
 * available.
 */

export { useReducedMotion } from "motion/react";

/**
 * Returns a transition override that disables movement when
 * reduced motion is preferred. Use on motion components that
 * have translateY/scale but should fall back to opacity-only.
 */
export function getReducedTransition(reduced: boolean | null) {
  if (reduced) {
    return { duration: 0.15, ease: "easeOut" as const };
  }
  return undefined;
}

/**
 * Returns initial/animate props that skip movement when reduced.
 */
export function getRevealProps(reduced: boolean | null) {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.2 },
    };
  }
  return undefined;
}

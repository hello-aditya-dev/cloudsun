"use client";

import { MotionConfig, LazyMotion, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * MotionProvider — wraps the app in a shared Motion configuration.
 * - LazyMotion + domAnimation for smaller bundle
 * - reducedMotion="user" respects OS-level preference automatically
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: "tween", ease: [0.16, 1, 0.3, 1] }}>
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}

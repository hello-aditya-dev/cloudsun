"use client";

import { m, useReducedMotion } from "motion/react";
import { buttonTap } from "@/lib/motion/variants";
import type { ReactNode } from "react";

/**
 * MotionLink — a Link styled as a button with motion hover/tap feedback.
 * Use for primary CTAs that need premium microinteraction.
 */
export function MotionDiv({
  children,
  className,
  onClick,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}) {
  const reduced = useReducedMotion();
  if (reduced || !hover) {
    return (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    );
  }
  return (
    <m.div className={className} onClick={onClick} {...buttonTap}>
      {children}
    </m.div>
  );
}

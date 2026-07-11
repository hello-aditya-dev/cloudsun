/**
 * CloudSun — Motion timing tokens.
 * Do not scatter arbitrary durations and easing curves across files.
 * Import from here.
 */

export const motionDuration = {
  instant: 0.1,
  micro: 0.16,
  fast: 0.22,
  standard: 0.32,
  deliberate: 0.48,
  reveal: 0.65,
} as const;

export const motionEase = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  soft: [0.22, 1, 0.36, 1],
} as const;

export const motionSpring = {
  soft: {
    type: "spring" as const,
    stiffness: 260,
    damping: 30,
    mass: 0.8,
  },
  snappy: {
    type: "spring" as const,
    stiffness: 420,
    damping: 32,
    mass: 0.65,
  },
  panel: {
    type: "spring" as const,
    stiffness: 300,
    damping: 34,
    mass: 0.9,
  },
} as const;

export type MotionDuration = typeof motionDuration;
export type MotionEase = typeof motionEase;
export type MotionSpring = typeof motionSpring;

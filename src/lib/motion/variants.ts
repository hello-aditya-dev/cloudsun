/**
 * CloudSun — Reusable animation variants.
 * These are the four primary motion patterns:
 * Reveal, Reflow, Presence, Feedback.
 */

import { motionEase, motionDuration } from "./tokens";

/** Reveal — content entering the viewport */
export const revealVariants = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: motionDuration.reveal,
      ease: motionEase.out,
    },
  },
};

/** Reveal from the left (for timelines, horizontal flows) */
export const revealLeftVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: motionDuration.standard, ease: motionEase.out },
  },
};

/** Reveal with slight scale (for product panels) */
export const revealScaleVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: motionDuration.deliberate, ease: motionEase.out },
  },
};

/** Stagger container — children animate in sequence */
export const staggerContainer = (stagger: number = 0.07, delayChildren: number = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

/** Stagger child — pair with staggerContainer */
export const staggerChild = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDuration.standard, ease: motionEase.out },
  },
};

/** Hero headline mask reveal */
export const headlineReveal = {
  hidden: { y: "110%" },
  visible: {
    y: 0,
    transition: { duration: motionDuration.deliberate, ease: motionEase.out },
  },
};

/** Presence — drawer sliding from right */
export const drawerRightVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 34, mass: 0.9 },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: { duration: motionDuration.fast, ease: motionEase.inOut },
  },
};

/** Presence — modal */
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: motionDuration.standard, ease: motionEase.out },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 8,
    transition: { duration: motionDuration.micro, ease: motionEase.inOut },
  },
};

/** Presence — backdrop */
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: motionDuration.fast } },
  exit: { opacity: 0, transition: { duration: motionDuration.micro } },
};

/** Presence — dropdown / popover */
export const dropdownVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionDuration.micro, ease: motionEase.out },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: motionDuration.instant },
  },
};

/** Feedback — button tap */
export const buttonTap = {
  whileHover: { y: -1 },
  whileTap: { scale: 0.98 },
};

/** Feedback — card hover (interactive cards only) */
export const cardHover = {
  whileHover: { y: -3 },
};

/** Page transition — dashboard section change */
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: motionDuration.fast, ease: motionEase.out } },
  exit: { opacity: 0, y: -6, transition: { duration: motionDuration.micro, ease: motionEase.inOut } },
};

/** Message entrance — new message in inbox */
export const messageEntrance = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: motionDuration.standard, ease: motionEase.out },
  },
};

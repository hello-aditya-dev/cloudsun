/**
 * CloudSun — Central motion system exports.
 * Import motion primitives from here, not from scattered files.
 */

export { motionDuration, motionEase, motionSpring } from "./tokens";
export type { MotionDuration, MotionEase, MotionSpring } from "./tokens";
export {
  revealVariants,
  revealLeftVariants,
  revealScaleVariants,
  staggerContainer,
  staggerChild,
  headlineReveal,
  drawerRightVariants,
  modalVariants,
  backdropVariants,
  dropdownVariants,
  buttonTap,
  cardHover,
  pageTransition,
  messageEntrance,
} from "./variants";
export { useReducedMotion, getReducedTransition, getRevealProps } from "./reduced-motion";

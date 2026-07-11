"use client";

import { m, LazyMotion, domAnimation, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { revealVariants, revealScaleVariants, staggerContainer, staggerChild } from "@/lib/motion/variants";
import { motionDuration, motionEase } from "@/lib/motion/tokens";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "scale" | "left";
  delay?: number;
  amount?: number;
  once?: boolean;
}

/**
 * Reveal — animates content into view on scroll.
 * Uses LazyMotion + m for smaller bundle.
 */
export function Reveal({
  children,
  className,
  variant = "default",
  delay = 0,
  amount = 0.2,
  once = true,
}: RevealProps) {
  const reduced = useReducedMotion();
  const variants =
    variant === "scale" ? revealScaleVariants :
    variant === "left" ? { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { duration: motionDuration.standard, ease: motionEase.out } } } :
    revealVariants;

  if (reduced) {
    return (
      <LazyMotion features={domAnimation}>
        <m.div
          className={className}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once, amount }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </m.div>
      </LazyMotion>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={className}
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
        transition={{ delay }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

/**
 * RevealGroup — staggers children into view.
 * Wrap multiple RevealItem children.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  delayChildren = 0,
  amount = 0.15,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  amount?: number;
  once?: boolean;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <LazyMotion features={domAnimation}>
        <m.div className={className} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once, amount }} transition={{ duration: 0.2 }}>
          {children}
        </m.div>
      </LazyMotion>
    );
  }

  const containerVariants: Variants = staggerContainer(stagger, delayChildren);

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={className}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}

/**
 * RevealItem — pair with RevealGroup for staggered entrance.
 */
export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div className={className} variants={staggerChild}>
        {children}
      </m.div>
    </LazyMotion>
  );
}

/**
 * StaggerList — convenience wrapper for a list of items.
 */
export function StaggerList({
  items,
  renderItem,
  className,
  stagger = 0.06,
}: {
  items: unknown[];
  renderItem: (item: unknown, index: number) => ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{items.map((item, i) => <div key={i}>{renderItem(item, i)}</div>)}</div>;
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div className={className} variants={staggerContainer(stagger)} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
        {items.map((item, i) => (
          <m.div key={i} variants={staggerChild}>{renderItem(item, i)}</m.div>
        ))}
      </m.div>
    </LazyMotion>
  );
}

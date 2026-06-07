// src/utils/animations.ts
import { gsap } from 'gsap';

/**
 * Animates an element or array of elements in with a smooth fade and slide-up.
 */
export const fadeInUp = (
  targets: gsap.DOMTarget,
  vars?: gsap.TweenVars
) => {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      ...vars,
    }
  );
};

/**
 * Staggers a list of items (e.g., dashboard cards or table rows) as they enter.
 */
export const staggerCards = (
  targets: gsap.DOMTarget,
  vars?: gsap.TweenVars
) => {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power1.out',
      ...vars,
    }
  );
};

/**
 * Shakes an element (useful for conflict alerts) using a timeline.
 */
export const shakeElement = (targets: gsap.DOMTarget) => {
  const tl = gsap.timeline();
  tl.to(targets, { x: -6, duration: 0.05, ease: 'power1.inOut' })
    .to(targets, { x: 6, duration: 0.05, ease: 'power1.inOut' })
    .to(targets, { x: -6, duration: 0.05, ease: 'power1.inOut' })
    .to(targets, { x: 6, duration: 0.05, ease: 'power1.inOut' })
    .to(targets, { x: 0, duration: 0.05, ease: 'power1.inOut' });
  return tl;
};

/**
 * Transitions onboarding steps by sliding out the current and sliding in the next.
 */
export const slideTransition = (
  exitTarget: gsap.DOMTarget,
  enterTarget: gsap.DOMTarget,
  direction: 'next' | 'prev' = 'next',
  onComplete?: () => void
) => {
  const exitX = direction === 'next' ? -50 : 50;
  const enterX = direction === 'next' ? 50 : -50;

  const tl = gsap.timeline({ onComplete });
  
  tl.to(exitTarget, {
    opacity: 0,
    x: exitX,
    duration: 0.25,
    ease: 'power2.in',
  });

  tl.fromTo(
    enterTarget,
    { opacity: 0, x: enterX },
    {
      opacity: 1,
      x: 0,
      duration: 0.35,
      ease: 'power2.out',
    }
  );

  return tl;
};

/**
 * Animates a numerical counter (e.g. gauge scores).
 */
export const animateCounter = (
  target: { value: number },
  endValue: number,
  onUpdate: (value: number) => void,
  duration = 1.2
) => {
  return gsap.to(target, {
    value: endValue,
    duration,
    ease: 'power2.out',
    onUpdate: () => onUpdate(Math.round(target.value)),
  });
};

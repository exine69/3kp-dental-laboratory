import { useEffect, useRef } from "react";

/**
 * Hook that adds scroll-reveal animation to a ref.
 * Elements start invisible and animate in when they enter the viewport.
 *
 * @param {Object} options
 * @param {string} options.animation - CSS class for animation type: 'fade-in-up', 'fade-in-left', 'fade-in-right', 'scale-in'
 * @param {number} options.threshold - IntersectionObserver threshold (0-1)
 * @param {string} options.rootMargin - Margin around root
 */
export function useScrollReveal({
  animation = "fade-in-up",
  threshold = 0.15,
  rootMargin = "0px 0px -40px 0px",
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.classList.add(animation);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [animation, threshold, rootMargin]);

  return ref;
}

/**
 * Hook that reveals multiple children with staggered delays.
 */
export function useStaggerReveal({
  animation = "fade-in-up",
  threshold = 0.1,
  rootMargin = "0px 0px -30px 0px",
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    container.classList.add("stagger-children");

    const children = Array.from(container.children);
    children.forEach((child) => child.classList.add(animation));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          children.forEach((child) => child.classList.add("visible"));
          observer.unobserve(container);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [animation, threshold, rootMargin]);

  return ref;
}

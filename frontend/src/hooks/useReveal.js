import { useEffect, useRef, useState } from 'react';

/**
 * useReveal — tiny IntersectionObserver hook powering the scroll animations.
 * Adds `.is-visible` once the element enters the viewport (then unobserves).
 */
export default function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // SSR / old browser fallback: show immediately.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px', ...options }
    );

    observer.observe(node);
    const fallback = window.setTimeout(() => setVisible(true), 1500);
    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  return [ref, visible];
}

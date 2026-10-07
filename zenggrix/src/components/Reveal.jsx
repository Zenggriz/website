import useReveal from '../hooks/useReveal';

/**
 * Reveal — declarative scroll-in wrapper. No animation libraries, just CSS +
 * IntersectionObserver so the bundle stays tiny and 60fps-friendly.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, visible] = useReveal();

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

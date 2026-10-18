import { useEffect } from 'react';

const SITE_ORIGIN = 'https://zenggrix.com';

export default function usePageMetadata(path, { title, description }) {
  useEffect(() => {
    document.title = title;

    const setMetaContent = (selector, content) => {
      const element = document.querySelector(selector);
      if (element) element.setAttribute('content', content);
    };

    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[property="og:url"]', `${SITE_ORIGIN}${path === '/' ? '/' : path}`);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', `${SITE_ORIGIN}${path === '/' ? '/' : path}`);
  }, [path, title, description]);
}

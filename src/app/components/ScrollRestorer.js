'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ScrollRestorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.scrollPosition !== undefined) {
        // Wait for the next frame to ensure content is loaded
        requestAnimationFrame(() => {
          // Wait a bit more to ensure all content is rendered
          setTimeout(() => {
            window.scrollTo(0, event.state.scrollPosition);
          }, 100);
        });
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, searchParams]);

  return null;
} 
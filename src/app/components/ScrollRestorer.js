'use client';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ScrollRestorer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return;

    const handlePopState = (event) => {
      if (event.state?.scrollPosition !== undefined) {
        window.scrollTo(0, event.state.scrollPosition);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, searchParams]);

  return null;
} 
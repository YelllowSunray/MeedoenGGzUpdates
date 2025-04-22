'use client';

import { useEffect } from 'react';
import sessionAnalytics from '../lib/sessionAnalytics';

export default function SessionAnalyticsWrapper({ children }) {
  useEffect(() => {
    // Initialize analytics on client-side only
    sessionAnalytics.init();

    // Cleanup on unmount
    return () => {
      sessionAnalytics.endSession();
    };
  }, []);

  return children;
} 
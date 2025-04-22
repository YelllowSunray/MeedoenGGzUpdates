// Track user interactions
export const trackEvent = async (action, data = {}) => {
  try {
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        data: {
          ...data,
          userAgent: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          timestamp: new Date().toISOString()
        }
      }),
    });

    if (!response.ok) {
      console.error('Failed to track event:', action);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Common tracking actions
export const AnalyticsActions = {
  SEARCH: 'search',
  CATEGORY_CLICK: 'category_click',
  ACTIVITY_VIEW: 'activity_view',
  FILTER_APPLY: 'filter_apply',
  PAGE_VIEW: 'page_view',
  FEEDBACK_SUBMIT: 'feedback_submit'
}; 
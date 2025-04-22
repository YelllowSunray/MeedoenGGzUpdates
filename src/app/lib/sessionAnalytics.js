'use client';

// Session tracking utility
class SessionAnalytics {
  constructor() {
    this.sessionId = null;
    this.startTime = null;
    this.pageViews = [];
    this.clicks = [];
    this.userAgent = null;
    this.screenSize = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
    this.userAgent = window.navigator.userAgent;
    this.screenSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    this.isInitialized = true;

    // Record initial page view
    this.recordPageView(window.location.pathname);

    // Set up event listeners
    this.setupEventListeners();
  }

  generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  recordPageView(path) {
    if (!this.isInitialized) return;
    
    this.pageViews.push({
      path,
      timestamp: new Date()
    });
  }

  recordClick(elementId, elementType) {
    if (!this.isInitialized) return;
    
    this.clicks.push({
      elementId,
      elementType,
      timestamp: new Date()
    });
  }

  setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Record page views on navigation
    window.addEventListener('popstate', () => {
      this.recordPageView(window.location.pathname);
    });

    // Record clicks
    document.addEventListener('click', (event) => {
      const target = event.target;
      const elementId = target.id || target.className;
      const elementType = target.tagName.toLowerCase();
      this.recordClick(elementId, elementType);
    });
  }

  async endSession() {
    if (!this.isInitialized) return;

    const sessionData = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime: new Date(),
      pageViews: this.pageViews,
      clicks: this.clicks,
      userAgent: this.userAgent,
      screenSize: this.screenSize
    };

    try {
      const response = await fetch('/api/analytics/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      });

      if (!response.ok) {
        throw new Error('Failed to record session data');
      }

      this.isInitialized = false;
    } catch (error) {
      console.error('Error recording session data:', error);
    }
  }
}

// Create a singleton instance
const sessionAnalytics = new SessionAnalytics();

export default sessionAnalytics; 
/**
 * Centralized analytics hook for tracking events across GA4 and Meta Pixel.
 * 
 * Configuration:
 * - Set GA4_MEASUREMENT_ID and META_PIXEL_ID in index.html when ready
 * - Analytics are currently disabled until IDs are configured
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

type ConversionType = 'Lead' | 'Purchase' | 'CompleteRegistration' | 'ViewContent' | 'InitiateCheckout';

interface ConversionParams {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  [key: string]: any;
}

export function useAnalytics() {
  /**
   * Track a custom event
   */
  const trackEvent = (eventName: string, params?: Record<string, any>) => {
    // GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }

    // Meta Pixel - custom events
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', eventName, params);
    }

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Event:', eventName, params);
    }
  };

  /**
   * Track a conversion event (works with both GA4 and Meta Pixel)
   */
  const trackConversion = (type: ConversionType, params?: ConversionParams) => {
    // GA4 conversion
    if (typeof window !== 'undefined' && window.gtag) {
      const ga4EventMap: Record<ConversionType, string> = {
        Lead: 'generate_lead',
        Purchase: 'purchase',
        CompleteRegistration: 'sign_up',
        ViewContent: 'view_item',
        InitiateCheckout: 'begin_checkout',
      };
      window.gtag('event', ga4EventMap[type], params);
    }

    // Meta Pixel standard events
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', type, params);
    }

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Conversion:', type, params);
    }
  };

  /**
   * Track page view (usually called automatically, but can be triggered manually)
   */
  const trackPageView = (path?: string) => {
    const pagePath = path || window.location.pathname;

    // GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
      });
    }

    // Meta Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] PageView:', pagePath);
    }
  };

  /**
   * Track signup/lead capture
   */
  const trackLead = (source: string, email?: string) => {
    trackConversion('Lead', {
      content_name: source,
      content_category: 'signup',
    });
  };

  /**
   * Track program view
   */
  const trackProgramView = (programName: string) => {
    trackConversion('ViewContent', {
      content_name: programName,
      content_category: 'program',
    });
  };

  /**
   * Track checkout initiation
   */
  const trackCheckoutStart = (programName: string, value: number) => {
    trackConversion('InitiateCheckout', {
      content_name: programName,
      value,
      currency: 'USD',
    });
  };

  /**
   * Track intake form completion
   */
  const trackIntakeComplete = () => {
    trackConversion('CompleteRegistration', {
      content_name: 'intake_form',
    });
  };

  return {
    trackEvent,
    trackConversion,
    trackPageView,
    trackLead,
    trackProgramView,
    trackCheckoutStart,
    trackIntakeComplete,
  };
}

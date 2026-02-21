/**
 * Centralized analytics hook for tracking events across GA4, Meta Pixel, and TikTok Pixel.
 * 
 * Pixel IDs are stored in the database and loaded dynamically.
 * Configure them in Admin Dashboard > Settings > Analytics & Tracking Pixels
 */

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    ttq?: any;
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

// Cache for pixel IDs to avoid repeated database calls
let pixelCache: { metaId?: string; ga4Id?: string; tiktokId?: string; loaded: boolean } = {
  loaded: false,
};
let pixelLoadPromise: Promise<typeof pixelCache> | null = null;

async function loadPixelIds() {
  if (pixelCache.loaded) return pixelCache;
  if (pixelLoadPromise) return pixelLoadPromise;

  pixelLoadPromise = (async () => {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["meta_pixel_id", "ga4_measurement_id", "tiktok_pixel_id"]);

      if (data) {
        data.forEach((setting) => {
          if (setting.key === "meta_pixel_id" && setting.value) {
            pixelCache.metaId = setting.value;
          } else if (setting.key === "ga4_measurement_id" && setting.value) {
            pixelCache.ga4Id = setting.value;
          } else if (setting.key === "tiktok_pixel_id" && setting.value) {
            pixelCache.tiktokId = setting.value;
          }
        });
      }
      pixelCache.loaded = true;
    } catch (error) {
      console.error("[Analytics] Failed to load pixel IDs:", error);
    }
    pixelLoadPromise = null;
    return pixelCache;
  })();

  return pixelLoadPromise;
}

// Initialize pixels with IDs from database
async function initializePixels() {
  const { metaId, ga4Id, tiktokId } = await loadPixelIds();
  
  // Initialize Meta Pixel
  if (metaId && window.fbq) {
    window.fbq("init", metaId);
    window.fbq("track", "PageView");
  }
  
  // Initialize GA4
  if (ga4Id && window.gtag) {
    window.gtag("config", ga4Id);
  }
  
  // Initialize TikTok Pixel
  if (tiktokId && window.ttq) {
    window.ttq.load(tiktokId);
    window.ttq.page();
  }
}

export function useAnalytics() {
  const initialized = useRef(false);
  
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initializePixels();
    }
  }, []);
  
  /**
   * Track a custom event
   */
  const trackEvent = async (eventName: string, params?: Record<string, any>) => {
    const { metaId, ga4Id, tiktokId } = await loadPixelIds();
    
    // GA4
    if (ga4Id && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }

    // Meta Pixel - custom events
    if (metaId && typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', eventName, params);
    }
    
    // TikTok Pixel - custom events
    if (tiktokId && typeof window !== 'undefined' && window.ttq) {
      window.ttq.track(eventName, params);
    }

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Event:', eventName, params);
    }
  };

  /**
   * Track a conversion event (works with GA4, Meta Pixel, and TikTok Pixel)
   */
  const trackConversion = async (type: ConversionType, params?: ConversionParams) => {
    const { metaId, ga4Id, tiktokId } = await loadPixelIds();
    
    // GA4 conversion
    if (ga4Id && typeof window !== 'undefined' && window.gtag) {
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
    if (metaId && typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', type, params);
    }
    
    // TikTok Pixel standard events
    if (tiktokId && typeof window !== 'undefined' && window.ttq) {
      const ttEventMap: Record<ConversionType, string> = {
        Lead: 'SubmitForm',
        Purchase: 'CompletePayment',
        CompleteRegistration: 'CompleteRegistration',
        ViewContent: 'ViewContent',
        InitiateCheckout: 'InitiateCheckout',
      };
      window.ttq.track(ttEventMap[type], params);
    }

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Conversion:', type, params);
    }
  };

  /**
   * Track page view (usually called automatically, but can be triggered manually)
   */
  const trackPageView = async (path?: string) => {
    const pagePath = path || window.location.pathname;
    const { metaId, ga4Id, tiktokId } = await loadPixelIds();

    // GA4
    if (ga4Id && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
      });
    }

    // Meta Pixel
    if (metaId && typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
    
    // TikTok Pixel
    if (tiktokId && typeof window !== 'undefined' && window.ttq) {
      window.ttq.page();
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

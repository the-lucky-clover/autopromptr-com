/**
 * Comprehensive Telemetry Service for AutoPromptr
 * Tracks user behavior, conversions, performance, and marketing attribution
 */

import { supabase } from '@/integrations/supabase/client';

// ===== TYPE DEFINITIONS =====

export type EventCategory = 
  | 'user_action' 
  | 'system_event' 
  | 'batch_execution' 
  | 'conversion'
  | 'engagement' 
  | 'error' 
  | 'performance' 
  | 'marketing' 
  | 'feature_usage';

export type ConversionType =
  | 'sign_up'
  | 'subscription'
  | 'batch_created'
  | 'batch_executed'
  | 'prompt_library_save'
  | 'feature_enabled'
  | 'referral'
  | 'upgrade';

export type PerformanceMetricType =
  | 'page_load'
  | 'api_request'
  | 'batch_execution'
  | 'prompt_execution'
  | 'component_render'
  | 'network_latency';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface TelemetryEvent {
  id?: string;
  userId?: string;
  sessionId: string;
  eventType: string;
  eventCategory: EventCategory;
  eventData?: Record<string, unknown>;
  pageUrl?: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
}

export interface ConversionEvent {
  id?: string;
  userId?: string;
  sessionId: string;
  conversionType: ConversionType;
  conversionValue?: number;
  attributionSource?: string;
  attributionMedium?: string;
  attributionCampaign?: string;
  attributionTerm?: string;
  attributionContent?: string;
  daysToConversion?: number;
  touchesBeforeConversion?: number;
}

export interface PerformanceMetric {
  id?: string;
  userId?: string;
  sessionId?: string;
  metricType: PerformanceMetricType;
  metricName: string;
  durationMs: number;
  pageUrl?: string;
  additionalData?: Record<string, unknown>;
}

export interface ErrorEvent {
  id?: string;
  userId?: string;
  sessionId?: string;
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  severity?: ErrorSeverity;
  pageUrl?: string;
  component?: string;
  action?: string;
  browser?: string;
  os?: string;
}

// ===== SESSION MANAGEMENT =====

let currentSessionId: string | null = null;
let sessionStartTime: number | null = null;

/**
 * Initialize or retrieve the current session ID
 */
export function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = crypto.randomUUID();
    sessionStartTime = Date.now();
    initializeSession();
  }
  return currentSessionId;
}

/**
 * Initialize a new session with UTM tracking
 */
async function initializeSession() {
  const urlParams = new URLSearchParams(window.location.search);
  const utmData = {
    utmSource: urlParams.get('utm_source') || undefined,
    utmMedium: urlParams.get('utm_medium') || undefined,
    utmCampaign: urlParams.get('utm_campaign') || undefined,
    utmTerm: urlParams.get('utm_term') || undefined,
    utmContent: urlParams.get('utm_content') || undefined,
  };

  // Store UTM data in session storage for attribution
  if (utmData.utmSource) {
    sessionStorage.setItem('autopromptr_utm', JSON.stringify(utmData));
  }

  const deviceInfo = getDeviceInfo();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Track session start event
    await trackEvent({
      sessionId: getSessionId(),
      eventType: 'session_started',
      eventCategory: 'engagement',
      userId: user?.id,
      ...utmData,
      ...deviceInfo,
      pageUrl: window.location.href,
      referrer: document.referrer || undefined,
    });
  } catch (error) {
    console.error('Failed to initialize session:', error);
  }
}

/**
 * Get device and browser information
 */
function getDeviceInfo() {
  const ua = navigator.userAgent;
  
  // Detect device type
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
  const deviceType = isMobile ? (isTablet ? 'tablet' : 'mobile') : 'desktop';
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') > -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('Edge') > -1) browser = 'Edge';
  
  // Detect OS
  let os = 'Unknown';
  if (ua.indexOf('Win') > -1) os = 'Windows';
  else if (ua.indexOf('Mac') > -1) os = 'macOS';
  else if (ua.indexOf('Linux') > -1) os = 'Linux';
  else if (ua.indexOf('Android') > -1) os = 'Android';
  else if (ua.indexOf('iOS') > -1) os = 'iOS';
  
  return {
    deviceType,
    browser,
    os,
    userAgent: ua,
  };
}

/**
 * Get stored UTM parameters from session
 */
function getStoredUtmData() {
  const stored = sessionStorage.getItem('autopromptr_utm');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  return {};
}

// ===== CORE TELEMETRY FUNCTIONS =====

/**
 * Track a telemetry event
 */
export async function trackEvent(event: Partial<TelemetryEvent>): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const deviceInfo = getDeviceInfo();
    const utmData = getStoredUtmData();
    
    const fullEvent: TelemetryEvent = {
      id: crypto.randomUUID(),
      sessionId: event.sessionId || getSessionId(),
      userId: event.userId || user?.id,
      eventType: event.eventType || 'unknown',
      eventCategory: event.eventCategory || 'user_action',
      eventData: event.eventData,
      pageUrl: event.pageUrl || window.location.href,
      referrer: event.referrer || document.referrer,
      ...deviceInfo,
      ...utmData,
      ...event,
    };

    // Send to Cloudflare Worker endpoint
    const workerUrl = import.meta.env.VITE_WORKER_URL;
    if (workerUrl) {
      await fetch(`${workerUrl}/api/telemetry/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullEvent),
      });
    }

    // Fallback: log to console in development
    if (import.meta.env.DEV) {
      console.log('📊 Telemetry Event:', fullEvent);
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Track a conversion event
 */
export async function trackConversion(conversion: Partial<ConversionEvent>): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const utmData = getStoredUtmData();
    
    const fullConversion: ConversionEvent = {
      id: crypto.randomUUID(),
      sessionId: conversion.sessionId || getSessionId(),
      userId: conversion.userId || user?.id,
      conversionType: conversion.conversionType || 'batch_created',
      conversionValue: conversion.conversionValue || 0,
      attributionSource: conversion.attributionSource || utmData.utmSource,
      attributionMedium: conversion.attributionMedium || utmData.utmMedium,
      attributionCampaign: conversion.attributionCampaign || utmData.utmCampaign,
      attributionTerm: conversion.attributionTerm || utmData.utmTerm,
      attributionContent: conversion.attributionContent || utmData.utmContent,
      daysToConversion: conversion.daysToConversion,
      touchesBeforeConversion: conversion.touchesBeforeConversion,
    };

    const workerUrl = import.meta.env.VITE_WORKER_URL;
    if (workerUrl) {
      await fetch(`${workerUrl}/api/telemetry/conversion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullConversion),
      });
    }

    // Also track as a regular event
    await trackEvent({
      sessionId: fullConversion.sessionId,
      eventType: `conversion_${conversion.conversionType}`,
      eventCategory: 'conversion',
      userId: fullConversion.userId,
      eventData: {
        conversionValue: fullConversion.conversionValue,
        attributionSource: fullConversion.attributionSource,
      },
    });

    if (import.meta.env.DEV) {
      console.log('💰 Conversion Event:', fullConversion);
    }
  } catch (error) {
    console.error('Failed to track conversion:', error);
  }
}

/**
 * Track a performance metric
 */
export async function trackPerformance(metric: Partial<PerformanceMetric>): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const fullMetric: PerformanceMetric = {
      id: crypto.randomUUID(),
      sessionId: metric.sessionId || getSessionId(),
      userId: metric.userId || user?.id,
      metricType: metric.metricType || 'page_load',
      metricName: metric.metricName || 'unknown',
      durationMs: metric.durationMs || 0,
      pageUrl: metric.pageUrl || window.location.href,
      additionalData: metric.additionalData,
    };

    const workerUrl = import.meta.env.VITE_WORKER_URL;
    if (workerUrl) {
      await fetch(`${workerUrl}/api/telemetry/performance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullMetric),
      });
    }

    if (import.meta.env.DEV) {
      console.log('⚡ Performance Metric:', fullMetric);
    }
  } catch (error) {
    console.error('Failed to track performance:', error);
  }
}

/**
 * Track an error event
 */
export async function trackError(errorEvent: Partial<ErrorEvent>): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const deviceInfo = getDeviceInfo();
    
    const fullError: ErrorEvent = {
      id: crypto.randomUUID(),
      sessionId: errorEvent.sessionId || getSessionId(),
      userId: errorEvent.userId || user?.id,
      errorType: errorEvent.errorType || 'unknown',
      errorMessage: errorEvent.errorMessage || 'Unknown error',
      errorStack: errorEvent.errorStack,
      severity: errorEvent.severity || 'medium',
      pageUrl: errorEvent.pageUrl || window.location.href,
      component: errorEvent.component,
      action: errorEvent.action,
      ...deviceInfo,
    };

    const workerUrl = import.meta.env.VITE_WORKER_URL;
    if (workerUrl) {
      await fetch(`${workerUrl}/api/telemetry/error`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullError),
      });
    }

    console.error('❌ Error Event:', fullError);
  } catch (error) {
    console.error('Failed to track error:', error);
  }
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(
  featureName: string,
  featureCategory?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await trackEvent({
    sessionId: getSessionId(),
    eventType: 'feature_used',
    eventCategory: 'feature_usage',
    eventData: {
      featureName,
      featureCategory,
      ...metadata,
    },
  });
}

/**
 * Track page view
 */
export async function trackPageView(pageName?: string): Promise<void> {
  await trackEvent({
    sessionId: getSessionId(),
    eventType: 'page_view',
    eventCategory: 'engagement',
    eventData: {
      pageName: pageName || document.title,
      path: window.location.pathname,
    },
  });
}

/**
 * Track batch execution telemetry
 */
export async function trackBatchExecution(batchData: {
  batchId: string;
  platform: string;
  totalPrompts: number;
  completedPrompts: number;
  failedPrompts: number;
  skippedPrompts: number;
  totalDurationMs: number;
}): Promise<void> {
  const successRate = batchData.completedPrompts / batchData.totalPrompts;
  const errorRate = batchData.failedPrompts / batchData.totalPrompts;
  const avgPromptDurationMs = batchData.totalDurationMs / batchData.totalPrompts;

  await trackEvent({
    sessionId: getSessionId(),
    eventType: 'batch_completed',
    eventCategory: 'batch_execution',
    eventData: {
      ...batchData,
      successRate,
      errorRate,
      avgPromptDurationMs,
    },
  });

  await trackPerformance({
    metricType: 'batch_execution',
    metricName: `batch_${batchData.platform}`,
    durationMs: batchData.totalDurationMs,
    additionalData: {
      totalPrompts: batchData.totalPrompts,
      successRate,
    },
  });
}

// ===== AUTOMATIC TRACKING SETUP =====

/**
 * Initialize automatic tracking for page views and errors
 */
export function initializeTelemetry() {
  // Track initial page view
  trackPageView();

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      trackEvent({
        sessionId: getSessionId(),
        eventType: 'page_hidden',
        eventCategory: 'engagement',
      });
    } else {
      trackEvent({
        sessionId: getSessionId(),
        eventType: 'page_visible',
        eventCategory: 'engagement',
      });
    }
  });

  // Track unhandled errors
  window.addEventListener('error', (event) => {
    trackError({
      errorType: 'unhandled_error',
      errorMessage: event.message,
      errorStack: event.error?.stack,
      severity: 'high',
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    trackError({
      errorType: 'unhandled_rejection',
      errorMessage: event.reason?.message || String(event.reason),
      errorStack: event.reason?.stack,
      severity: 'high',
    });
  });

  // Track performance metrics for page load
  if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = window.performance.timing;
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        
        trackPerformance({
          metricType: 'page_load',
          metricName: 'full_page_load',
          durationMs: pageLoadTime,
          additionalData: {
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            domInteractive: timing.domInteractive - timing.navigationStart,
            dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
            tcpConnection: timing.connectEnd - timing.connectStart,
            serverResponse: timing.responseEnd - timing.requestStart,
          },
        });
      }, 0);
    });
  }

  console.log('🚀 Telemetry initialized - Session ID:', getSessionId());
}

// ===== EXPORTS =====

export default {
  initializeTelemetry,
  getSessionId,
  trackEvent,
  trackConversion,
  trackPerformance,
  trackError,
  trackFeatureUsage,
  trackPageView,
  trackBatchExecution,
};

/**
 * Swee Lah — Disqus Integration & Compatibility Service
 * Full TypeScript & JavaScript bridge for Disqus Universal Embed in React SPAs
 */

import {
  DisqusConfigContext,
  DisqusCommentEvent,
} from '../types';

export const DISQUS_SHORTNAME = 'sweelah';
export const DISQUS_FORUM_URL = 'https://sweelah.disqus.com';
export const DEFAULT_PAGE_URL = 'https://sweelah.app/talk-to-us';
export const DEFAULT_PAGE_IDENTIFIER = 'sweelah-talk-to-us';
export const DEFAULT_PAGE_TITLE = 'Swee Lah - Talk to Us & Commuter Community';
export const DISQUS_EMBED_SCRIPT_URL = 'https://sweelah.disqus.com/embed.js';
export const DISQUS_COUNT_SCRIPT_URL = '//sweelah.disqus.com/count.js';

export interface DisqusResetParams {
  url?: string;
  identifier?: string;
  title?: string;
  onNewComment?: (comment: DisqusCommentEvent) => void;
  onReady?: () => void;
}

export interface DisqusCompatibilityReport {
  isScriptLoaded: boolean;
  isDisqusAvailable: boolean;
  isConfigBound: boolean;
  isContainerPresent: boolean;
  isThirdPartyRestricted: boolean;
  shortname: string;
  forumUrl: string;
  threadIdentifier: string;
  status: 'operational' | 'initializing' | 'restricted' | 'missing_container';
  message: string;
}

let scriptLoadPromise: Promise<boolean> | null = null;

/**
 * Configure global Disqus variables so that Disqus runtime finds valid configuration
 * whether loaded synchronously or asynchronously.
 */
export function initializeDisqusGlobals(params?: {
  url?: string;
  identifier?: string;
  title?: string;
  onNewComment?: (comment: DisqusCommentEvent) => void;
  onReady?: () => void;
}): void {
  if (typeof window === 'undefined') return;

  const url = params?.url || DEFAULT_PAGE_URL;
  const identifier = params?.identifier || DEFAULT_PAGE_IDENTIFIER;
  const title = params?.title || DEFAULT_PAGE_TITLE;

  window.disqus_shortname = DISQUS_SHORTNAME;
  window.disqus_identifier = identifier;
  window.disqus_url = url;
  window.disqus_title = title;

  window.disqus_config = function (this: DisqusConfigContext) {
    this.page = this.page || {};
    this.page.url = url;
    this.page.identifier = identifier;
    this.page.title = title;

    this.callbacks = this.callbacks || {};

    if (params?.onNewComment) {
      this.callbacks.onNewComment = [
        (comment) => {
          try {
            params.onNewComment?.(comment);
            // Also notify any app-wide listeners
            window.dispatchEvent(
              new CustomEvent('sweelah_disqus_comment_event', { detail: comment })
            );
          } catch (e) {
            console.warn('[Disqus Bridge] onNewComment error:', e);
          }
        },
      ];
    }

    if (params?.onReady) {
      this.callbacks.onReady = [
        () => {
          try {
            params.onReady?.();
            window.dispatchEvent(new CustomEvent('sweelah_disqus_ready_event'));
          } catch (e) {
            console.warn('[Disqus Bridge] onReady error:', e);
          }
        },
      ];
    }
  };
}

/**
 * Ensures the Disqus embed.js script is loaded cleanly in the document.
 */
export function loadDisqusEmbedScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);

  // If already loaded and DISQUS global exists
  if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
    return Promise.resolve(true);
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise<boolean>((resolve) => {
    let script = document.getElementById('disqus-embed-script') as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = 'disqus-embed-script';
      script.src = DISQUS_EMBED_SCRIPT_URL;
      script.async = true;
      script.setAttribute('data-timestamp', Date.now().toString());

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        console.warn(
          '[Disqus Bridge] embed.js failed to load. Browser ad-block or third-party protection may be active.'
        );
        resolve(false);
      };

      (document.head || document.body).appendChild(script);
    } else {
      // Script tag exists, wait for window.DISQUS
      let retries = 0;
      const interval = setInterval(() => {
        retries++;
        if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
          clearInterval(interval);
          resolve(true);
        } else if (retries >= 30) {
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
    }
  });

  return scriptLoadPromise;
}

/**
 * Resets or mounts the Disqus thread in a single-page application environment.
 * Ensures the container element (#disqus_thread) is verified and ready.
 */
export async function resetDisqusThread(params: DisqusResetParams = {}): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const container = document.getElementById('disqus_thread');
  if (!container) {
    console.warn('[Disqus Bridge] #disqus_thread container not present in DOM yet.');
    return false;
  }

  // Pre-bind global configs
  initializeDisqusGlobals(params);

  // Ensure script is loaded
  const scriptLoaded = await loadDisqusEmbedScript();

  if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
    try {
      window.DISQUS.reset({
        reload: true,
        config: function (this: DisqusConfigContext) {
          this.page = this.page || {};
          this.page.url = params.url || DEFAULT_PAGE_URL;
          this.page.identifier = params.identifier || DEFAULT_PAGE_IDENTIFIER;
          this.page.title = params.title || DEFAULT_PAGE_TITLE;

          this.callbacks = this.callbacks || {};
          if (params.onNewComment) {
            this.callbacks.onNewComment = [params.onNewComment];
          }
          if (params.onReady) {
            this.callbacks.onReady = [params.onReady];
          }
        },
      });
      return true;
    } catch (err) {
      console.warn('[Disqus Bridge] DISQUS.reset execution error:', err);
      return false;
    }
  }

  return scriptLoaded;
}

/**
 * Refreshes or re-indexes comment counts across the page using count.js
 */
export function refreshDisqusCommentCounts(): void {
  if (typeof window === 'undefined') return;

  if (window.DISQUSWIDGETS && typeof window.DISQUSWIDGETS.getCount === 'function') {
    try {
      window.DISQUSWIDGETS.getCount({ reset: true });
    } catch (e) {
      console.warn('[Disqus Bridge] Error calling DISQUSWIDGETS.getCount:', e);
    }
  } else {
    // Check if count script tag is present
    let countScript = document.getElementById('dsq-count-scr') as HTMLScriptElement | null;
    if (!countScript) {
      countScript = document.createElement('script');
      countScript.id = 'dsq-count-scr';
      countScript.src = DISQUS_COUNT_SCRIPT_URL;
      countScript.async = true;
      (document.head || document.body).appendChild(countScript);
    }
  }
}

/**
 * Diagnoses JavaScript & TypeScript compatibility for Disqus in the current environment
 */
export function checkDisqusCompatibility(): DisqusCompatibilityReport {
  if (typeof window === 'undefined') {
    return {
      isScriptLoaded: false,
      isDisqusAvailable: false,
      isConfigBound: false,
      isContainerPresent: false,
      isThirdPartyRestricted: false,
      shortname: DISQUS_SHORTNAME,
      forumUrl: DISQUS_FORUM_URL,
      threadIdentifier: DEFAULT_PAGE_IDENTIFIER,
      status: 'initializing',
      message: 'Running in server or non-browser context',
    };
  }

  const isScriptLoaded = !!document.getElementById('disqus-embed-script');
  const isDisqusAvailable = !!(window.DISQUS && typeof window.DISQUS.reset === 'function');
  const isConfigBound = typeof window.disqus_config === 'function';
  const isContainerPresent = !!document.getElementById('disqus_thread');

  let status: DisqusCompatibilityReport['status'] = 'operational';
  let message = 'Disqus JavaScript runtime & TypeScript integration are 100% compatible and operational.';

  if (!isContainerPresent) {
    status = 'missing_container';
    message = 'Container #disqus_thread is currently unmounted from DOM.';
  } else if (!isDisqusAvailable && isScriptLoaded) {
    status = 'restricted';
    message = 'Embed script loaded but window.DISQUS not initialized. Browser tracking protection may be partitioning third-party cookies.';
  } else if (!isScriptLoaded) {
    status = 'initializing';
    message = 'Embed script not loaded yet; ready to initialize.';
  }

  return {
    isScriptLoaded,
    isDisqusAvailable,
    isConfigBound,
    isContainerPresent,
    isThirdPartyRestricted: status === 'restricted',
    shortname: DISQUS_SHORTNAME,
    forumUrl: DISQUS_FORUM_URL,
    threadIdentifier: DEFAULT_PAGE_IDENTIFIER,
    status,
    message,
  };
}

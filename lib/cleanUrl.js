// Shared URL-cleaning logic used by background, popup, and options pages.

import {
  EXACT_TRACKING_PARAMS,
  TRACKING_PREFIXES,
  SITE_RULES,
  REDIRECT_UNWRAP_RULES,
} from './rules.js';

const MAX_UNWRAP_DEPTH = 3;

function isTrackingParam(key) {
  const lower = key.toLowerCase();
  if (EXACT_TRACKING_PARAMS.has(lower)) return true;
  return TRACKING_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

function tryUnwrapRedirect(url) {
  for (const rule of REDIRECT_UNWRAP_RULES) {
    if (url.hostname !== rule.host) continue;
    if (rule.pathMustBe && url.pathname !== rule.pathMustBe) continue;

    const paramNames = Array.isArray(rule.param) ? rule.param : [rule.param];
    for (const name of paramNames) {
      const inner = url.searchParams.get(name);
      if (!inner) continue;
      try {
        const target = new URL(inner);
        if (target.protocol === 'http:' || target.protocol === 'https:') return target;
      } catch {
        // Not an absolute URL; try the next candidate param.
      }
    }
  }
  return null;
}

function removeParams(params, shouldRemove, removed) {
  for (const key of [...params.keys()]) {
    if (shouldRemove(key)) {
      removed.push(key);
      params.delete(key);
    }
  }
}

function cleanHash(hash, removed) {
  if (!hash || hash.length <= 1) return hash;
  const body = hash.slice(1);
  // Only treat the fragment as parameters if it looks like a query string;
  // plain anchors like "#install" must survive untouched.
  if (!body.includes('=')) return hash;

  const params = new URLSearchParams(body);
  removeParams(params, isTrackingParam, removed);
  const rest = params.toString();
  return rest ? `#${rest}` : '';
}

function applySiteRules(url, removed) {
  for (const rule of SITE_RULES) {
    if (!rule.host.test(url.hostname)) continue;

    if (rule.rewritePath) url.pathname = rule.rewritePath(url.pathname);

    if (rule.stripAllWhen?.test(url.pathname)) {
      removeParams(url.searchParams, () => true, removed);
      continue;
    }

    if (rule.keepOnly && (!rule.onlyOnPath || rule.onlyOnPath.test(url.pathname))) {
      const keep = new Set(rule.keepOnly);
      removeParams(url.searchParams, (key) => !keep.has(key.toLowerCase()), removed);
    }

    if (rule.strip) {
      const strip = new Set(rule.strip);
      removeParams(url.searchParams, (key) => strip.has(key.toLowerCase()), removed);
    }
  }
}

/**
 * Clean a URL string: unwraps known redirect wrappers (e.g. Facebook's l.php),
 * strips generic and site-specific tracking params, and strips tracking params
 * from a query-like hash fragment.
 *
 * @param {string} rawUrl
 * @param {{ extraParams?: string[], unwrapRedirects?: boolean }} [options]
 * @returns {{ cleaned: string, removedParams: string[], unwrapped: boolean } | null}
 */
export function cleanUrl(rawUrl, options = {}) {
  const { extraParams = [], unwrapRedirects = true } = options;
  const extraSet = new Set(extraParams.map((p) => p.toLowerCase()));

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  let unwrapped = false;
  if (unwrapRedirects) {
    for (let i = 0; i < MAX_UNWRAP_DEPTH; i += 1) {
      const inner = tryUnwrapRedirect(url);
      if (!inner) break;
      url = inner;
      unwrapped = true;
    }
  }

  const removedParams = [];

  applySiteRules(url, removedParams);
  removeParams(
    url.searchParams,
    (key) => isTrackingParam(key) || extraSet.has(key.toLowerCase()),
    removedParams,
  );

  url.hash = cleanHash(url.hash, removedParams);
  // Facebook appends a bare "#_=_" artifact; strip it outright.
  if (url.hash === '#_=_') url.hash = '';

  return {
    cleaned: url.toString(),
    removedParams,
    unwrapped,
  };
}

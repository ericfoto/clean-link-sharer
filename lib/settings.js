// Settings shared by background, popup, and options pages.
// Only the pure helpers (parse/sanitize/serialize) are used by the tests; every
// chrome.* call lives inside a function so this module can be imported by Node.

export const DEFAULT_SETTINGS = Object.freeze({
  extraParams: [],
  unwrapRedirects: true,
  autoCopy: false,
});

const EXPORT_APP_ID = 'clean-link-sharer';
const EXPORT_FORMAT_VERSION = 1;
const MAX_EXTRA_PARAMS = 500;
const MAX_PARAM_LENGTH = 100;

export async function getSettings() {
  const stored = await chrome.storage.sync.get(Object.keys(DEFAULT_SETTINGS));
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings) {
  await chrome.storage.sync.set(sanitizeSettings(settings));
}

/** "ref, s ,foo_id" -> ["ref", "s", "foo_id"] (trimmed, deduplicated, length-limited). */
export function parseExtraParams(text) {
  return normalizeParamList(String(text).split(/[,\n]/));
}

function normalizeParamList(list) {
  const seen = new Set();
  const result = [];
  for (const item of list) {
    if (typeof item !== 'string') continue;
    const param = item.trim();
    if (!param || param.length > MAX_PARAM_LENGTH) continue;
    const key = param.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(param);
    if (result.length >= MAX_EXTRA_PARAMS) break;
  }
  return result;
}

/** Coerce arbitrary input into a valid settings object; unknown keys are dropped. */
export function sanitizeSettings(input) {
  const source = input && typeof input === 'object' ? input : {};
  return {
    extraParams: Array.isArray(source.extraParams)
      ? normalizeParamList(source.extraParams)
      : DEFAULT_SETTINGS.extraParams,
    unwrapRedirects:
      typeof source.unwrapRedirects === 'boolean' ? source.unwrapRedirects : DEFAULT_SETTINGS.unwrapRedirects,
    autoCopy: typeof source.autoCopy === 'boolean' ? source.autoCopy : DEFAULT_SETTINGS.autoCopy,
  };
}

export function serializeSettings(settings) {
  return JSON.stringify(
    { app: EXPORT_APP_ID, formatVersion: EXPORT_FORMAT_VERSION, settings: sanitizeSettings(settings) },
    null,
    2,
  );
}

/** Parse an exported settings file. Throws if it isn't one of ours. */
export function parseImportedSettings(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('invalid-json');
  }
  if (!data || typeof data !== 'object' || data.app !== EXPORT_APP_ID || typeof data.settings !== 'object') {
    throw new Error('not-a-settings-file');
  }
  return sanitizeSettings(data.settings);
}

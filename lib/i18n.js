// Thin wrapper over chrome.i18n. Strings live in _locales/<lang>/messages.json.

export function t(key, substitutions) {
  return chrome.i18n.getMessage(key, substitutions) || key;
}

/** Fill elements marked with data-i18n, data-i18n-placeholder, data-i18n-title. */
export function applyI18n(root = document) {
  document.documentElement.lang = chrome.i18n.getUILanguage();

  for (const el of root.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.dataset.i18n);
  }
  for (const el of root.querySelectorAll('[data-i18n-placeholder]')) {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  }
  for (const el of root.querySelectorAll('[data-i18n-title]')) {
    el.title = t(el.dataset.i18nTitle);
  }
}

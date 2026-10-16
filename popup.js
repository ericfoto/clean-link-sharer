import { cleanUrl } from './lib/cleanUrl.js';
import { getSettings } from './lib/settings.js';
import { t, applyI18n } from './lib/i18n.js';

const output = document.getElementById('output');
const statusEl = document.getElementById('status');
const copyBtn = document.getElementById('copy-btn');
const shareBtn = document.getElementById('share-btn');
const openBtn = document.getElementById('open-btn');
const removedDetails = document.getElementById('removed-details');
const removedSummary = document.getElementById('removed-summary');
const removedList = document.getElementById('removed-list');
const unwrappedNote = document.getElementById('unwrapped-note');

let currentUrl = '';
let currentTitle = '';
let statusTimer;

function setStatus(text, { error = false, persist = false } = {}) {
  clearTimeout(statusTimer);
  statusEl.textContent = text;
  statusEl.classList.toggle('error', error);
  if (text && !persist) {
    statusTimer = setTimeout(() => {
      statusEl.textContent = '';
    }, 2500);
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    output.select();
    return document.execCommand('copy');
  }
}

async function copyCurrent(successMessage) {
  const ok = await copyText(currentUrl);
  if (ok) setStatus(successMessage);
  else setStatus(t('statusCopyFailed'), { error: true, persist: true });
}

function renderRemoved(result) {
  const count = result.removedParams.length;
  removedDetails.hidden = count === 0 && !result.unwrapped;
  if (removedDetails.hidden) return;

  removedSummary.textContent =
    count === 0 ? t('unwrappedNote') : count === 1 ? t('removedOne') : t('removedMany', [String(count)]);

  removedList.replaceChildren(
    ...result.removedParams.map((param) => {
      const li = document.createElement('li');
      li.textContent = param;
      return li;
    }),
  );
  unwrappedNote.hidden = !(result.unwrapped && count > 0);
}

function setActionsEnabled(enabled) {
  for (const button of [copyBtn, shareBtn, openBtn]) button.disabled = !enabled;
}

async function init() {
  applyI18n();
  shareBtn.hidden = typeof navigator.share !== 'function';

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const settings = await getSettings();
  const result = tab?.url ? cleanUrl(tab.url, settings) : null;

  if (!result) {
    setActionsEnabled(false);
    setStatus(t('statusNoUrl'), { error: true, persist: true });
    return;
  }

  currentUrl = result.cleaned;
  currentTitle = tab.title ?? '';
  output.value = currentUrl;
  renderRemoved(result);

  const nothingRemoved = result.removedParams.length === 0 && !result.unwrapped;
  if (settings.autoCopy) {
    await copyCurrent(t('statusAutoCopied'));
  } else if (nothingRemoved) {
    setStatus(t('statusAlreadyClean'), { persist: true });
  }
}

copyBtn.addEventListener('click', () => copyCurrent(t('statusCopied')));

shareBtn.addEventListener('click', async () => {
  try {
    await navigator.share({ url: currentUrl, title: currentTitle });
  } catch (error) {
    // AbortError just means the user closed the share sheet.
    if (error.name !== 'AbortError') setStatus(t('statusCopyFailed'), { error: true, persist: true });
  }
});

openBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: currentUrl });
});

document.getElementById('options-btn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

init();

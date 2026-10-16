import {
  getSettings,
  saveSettings,
  parseExtraParams,
  serializeSettings,
  parseImportedSettings,
} from './lib/settings.js';
import { t, applyI18n } from './lib/i18n.js';

const unwrapToggle = document.getElementById('unwrap-toggle');
const autoCopyToggle = document.getElementById('autocopy-toggle');
const extraParamsField = document.getElementById('extra-params');
const statusEl = document.getElementById('status');
const importFile = document.getElementById('import-file');

let statusTimer;
function setStatus(text, { error = false } = {}) {
  clearTimeout(statusTimer);
  statusEl.textContent = text;
  statusEl.classList.toggle('error', error);
  statusTimer = setTimeout(() => {
    statusEl.textContent = '';
  }, 2500);
}

function render(settings) {
  unwrapToggle.checked = settings.unwrapRedirects;
  autoCopyToggle.checked = settings.autoCopy;
  extraParamsField.value = settings.extraParams.join(', ');
}

function readForm() {
  return {
    unwrapRedirects: unwrapToggle.checked,
    autoCopy: autoCopyToggle.checked,
    extraParams: parseExtraParams(extraParamsField.value),
  };
}

document.getElementById('save-btn').addEventListener('click', async () => {
  const settings = readForm();
  await saveSettings(settings);
  extraParamsField.value = settings.extraParams.join(', ');
  setStatus(t('statusSaved'));
});

document.getElementById('shortcut-btn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});

document.getElementById('export-btn').addEventListener('click', () => {
  const blob = new Blob([serializeSettings(readForm())], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'clean-link-sharer-settings.json';
  link.click();
  URL.revokeObjectURL(url);
});

document.getElementById('import-btn').addEventListener('click', () => importFile.click());

importFile.addEventListener('change', async () => {
  const file = importFile.files[0];
  importFile.value = '';
  if (!file) return;

  try {
    const settings = parseImportedSettings(await file.text());
    await saveSettings(settings);
    render(settings);
    setStatus(t('statusImported'));
  } catch {
    setStatus(t('statusImportFailed'), { error: true });
  }
});

applyI18n();
getSettings().then(render);

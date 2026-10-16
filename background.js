import { cleanUrl } from './lib/cleanUrl.js';
import { getSettings } from './lib/settings.js';
import { t } from './lib/i18n.js';

const LINK_MENU_ID = 'clean-copy-link';
const PAGE_MENU_ID = 'clean-copy-page';
const COPY_COMMAND = 'copy-clean-link';

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: LINK_MENU_ID,
    title: t('menuCopyLink'),
    contexts: ['link'],
  });
  chrome.contextMenus.create({
    id: PAGE_MENU_ID,
    title: t('menuCopyPage'),
    contexts: ['page'],
  });
});

// Chrome closes offscreen documents on its own, so check for one every time.
let creatingOffscreen = null;
async function ensureOffscreenDocument() {
  if (await chrome.offscreen.hasDocument()) return;
  if (!creatingOffscreen) {
    creatingOffscreen = chrome.offscreen
      .createDocument({
        url: 'offscreen.html',
        reasons: ['CLIPBOARD'],
        justification: 'Write the cleaned link to the clipboard.',
      })
      .finally(() => {
        creatingOffscreen = null;
      });
  }
  await creatingOffscreen;
}

async function copyToClipboard(text) {
  await ensureOffscreenDocument();
  await chrome.runtime.sendMessage({ target: 'offscreen', type: 'copy-to-clipboard', text });
}

async function flashBadge(tabId, text, color) {
  if (tabId === undefined) return;
  await chrome.action.setBadgeText({ tabId, text });
  await chrome.action.setBadgeBackgroundColor({ tabId, color });
  setTimeout(() => {
    chrome.action.setBadgeText({ tabId, text: '' });
  }, 1500);
}

async function cleanAndCopy(rawUrl, tabId) {
  const result = rawUrl ? cleanUrl(rawUrl, await getSettings()) : null;
  if (!result) {
    await flashBadge(tabId, '!', '#c62828');
    return;
  }
  await copyToClipboard(result.cleaned);
  await flashBadge(tabId, '✓', '#2e7d32');
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const rawUrl = info.menuItemId === LINK_MENU_ID ? info.linkUrl : info.pageUrl;
  await cleanAndCopy(rawUrl, tab?.id);
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== COPY_COMMAND) return;
  const activeTab = tab ?? (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
  await cleanAndCopy(activeTab?.url, activeTab?.id);
});

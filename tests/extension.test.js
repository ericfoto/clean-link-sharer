import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const read = (file) => readFileSync(join(root, file), 'utf8');
const readJson = (file) => JSON.parse(read(file));

const locales = { en: readJson('_locales/en/messages.json'), sv: readJson('_locales/sv/messages.json') };
const manifest = readJson('manifest.json');

function usedMessageKeys() {
  const keys = new Set();
  for (const file of ['popup.html', 'options.html']) {
    for (const match of read(file).matchAll(/data-i18n(?:-placeholder|-title)?="([^"]+)"/g)) keys.add(match[1]);
  }
  for (const file of ['popup.js', 'options.js', 'background.js']) {
    for (const match of read(file).matchAll(/\bt\('([A-Za-z0-9_]+)'/g)) keys.add(match[1]);
  }
  for (const match of JSON.stringify(manifest).matchAll(/__MSG_([A-Za-z0-9_@]+)__/g)) keys.add(match[1]);
  return keys;
}

test('every locale defines exactly the same message keys', () => {
  assert.deepEqual(Object.keys(locales.sv).sort(), Object.keys(locales.en).sort());
});

test('every message key used by the code exists in every locale', () => {
  for (const [lang, messages] of Object.entries(locales)) {
    for (const key of usedMessageKeys()) {
      assert.ok(key in messages, `"${key}" is missing from the ${lang} locale`);
    }
  }
});

test('placeholders match between locales', () => {
  for (const [key, message] of Object.entries(locales.en)) {
    assert.deepEqual(
      Object.keys(locales.sv[key].placeholders ?? {}),
      Object.keys(message.placeholders ?? {}),
      `placeholder mismatch for "${key}"`,
    );
  }
});

test('store description fits the 132 character limit in every locale', () => {
  for (const [lang, messages] of Object.entries(locales)) {
    assert.ok(messages.extDescription.message.length <= 132, `${lang} description is too long`);
  }
});

test('manifest default_locale exists and files referenced by the manifest are present', () => {
  assert.ok(existsSync(join(root, '_locales', manifest.default_locale, 'messages.json')));

  const files = [
    manifest.background.service_worker,
    manifest.action.default_popup,
    manifest.options_ui.page,
    ...Object.values(manifest.icons),
    ...Object.values(manifest.action.default_icon),
  ];
  for (const file of files) assert.ok(existsSync(join(root, file)), `${file} is missing`);
});

test('manifest version matches package.json', () => {
  assert.equal(manifest.version, readJson('package.json').version);
});

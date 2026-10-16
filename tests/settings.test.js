import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SETTINGS,
  parseExtraParams,
  sanitizeSettings,
  serializeSettings,
  parseImportedSettings,
} from '../lib/settings.js';

test('parseExtraParams trims, splits on commas/newlines, and dedupes case-insensitively', () => {
  assert.deepEqual(parseExtraParams(' ref, s ,foo_id\nREF,,  '), ['ref', 's', 'foo_id']);
});

test('parseExtraParams drops absurdly long entries', () => {
  assert.deepEqual(parseExtraParams(`ok,${'x'.repeat(101)}`), ['ok']);
});

test('sanitizeSettings fills defaults for missing or wrong-typed fields', () => {
  assert.deepEqual(sanitizeSettings(undefined), { ...DEFAULT_SETTINGS });
  assert.deepEqual(sanitizeSettings({ extraParams: 'nope', unwrapRedirects: 'yes', autoCopy: 1 }), {
    ...DEFAULT_SETTINGS,
  });
});

test('sanitizeSettings drops unknown keys and non-string params', () => {
  const result = sanitizeSettings({ extraParams: ['a', 5, null, 'b'], evil: true, autoCopy: true });
  assert.deepEqual(result, { extraParams: ['a', 'b'], unwrapRedirects: true, autoCopy: true });
});

test('export -> import round-trips', () => {
  const settings = { extraParams: ['foo', 'bar'], unwrapRedirects: false, autoCopy: true };
  assert.deepEqual(parseImportedSettings(serializeSettings(settings)), settings);
});

test('import rejects invalid JSON and foreign files', () => {
  assert.throws(() => parseImportedSettings('{nope'), /invalid-json/);
  assert.throws(() => parseImportedSettings('{"settings":{}}'), /not-a-settings-file/);
  assert.throws(() => parseImportedSettings('[]'), /not-a-settings-file/);
});

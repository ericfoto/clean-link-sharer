import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanUrl } from '../lib/cleanUrl.js';

const clean = (url, options) => cleanUrl(url, options).cleaned;

test('returns null for input that is not a URL', () => {
  assert.equal(cleanUrl('not a url'), null);
  assert.equal(cleanUrl(''), null);
});

test('strips utm_* parameters and keeps the rest', () => {
  assert.equal(
    clean('https://example.com/article?utm_source=fb&utm_medium=social&id=42'),
    'https://example.com/article?id=42',
  );
});

test('strips click ids (fbclid, gclid, msclkid)', () => {
  assert.equal(clean('https://example.com/?fbclid=abc&gclid=def&msclkid=ghi'), 'https://example.com/');
});

test('reports which parameters were removed', () => {
  const result = cleanUrl('https://example.com/?utm_source=x&keep=1&fbclid=y');
  assert.deepEqual(result.removedParams, ['utm_source', 'fbclid']);
});

test('leaves a clean URL untouched', () => {
  const result = cleanUrl('https://example.com/path?page=2#section');
  assert.equal(result.cleaned, 'https://example.com/path?page=2#section');
  assert.deepEqual(result.removedParams, []);
});

test('keeps plain anchors in the hash', () => {
  assert.equal(clean('https://example.com/docs?utm_source=x#install'), 'https://example.com/docs#install');
});

test('strips tracking params from a query-like hash', () => {
  assert.equal(clean('https://example.com/app#utm_source=x&view=list'), 'https://example.com/app#view=list');
});

test('removes the Facebook "#_=_" artifact', () => {
  assert.equal(clean('https://example.com/#_=_'), 'https://example.com/');
});

test('strips user-defined extra params, case-insensitively', () => {
  assert.equal(
    clean('https://example.com/?Foo_Id=1&bar=2', { extraParams: ['foo_id'] }),
    'https://example.com/?bar=2',
  );
});

test('unwraps Facebook redirect links and cleans the inner URL', () => {
  const result = cleanUrl(
    'https://l.facebook.com/l.php?u=https%3A%2F%2Fexample.com%2Fpage%3Fa%3D1%26fbclid%3Dxyz&h=abc',
  );
  assert.equal(result.cleaned, 'https://example.com/page?a=1');
  assert.equal(result.unwrapped, true);
});

test('does not unwrap redirects when the option is off', () => {
  const result = cleanUrl('https://l.facebook.com/l.php?u=https%3A%2F%2Fexample.com%2F', {
    unwrapRedirects: false,
  });
  assert.equal(result.unwrapped, false);
  assert.match(result.cleaned, /^https:\/\/l\.facebook\.com\//);
});

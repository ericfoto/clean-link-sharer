import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanUrl } from '../lib/cleanUrl.js';

const clean = (url, options) => cleanUrl(url, options).cleaned;

test('conservative generic list: ref/from/tag/cid/share survive on unknown sites', () => {
  const url = 'https://example.com/compare?ref=main&from=a&tag=v1&cid=7&share=1';
  assert.equal(clean(url), url);
});

test('amazon: product links collapse to /dp/ASIN', () => {
  assert.equal(
    clean('https://www.amazon.se/Some-Product-Name/dp/B08N5WRWNW/ref=sr_1_3?crid=ABC&keywords=x&qid=1&sr=8-3&tag=aff-21'),
    'https://www.amazon.se/dp/B08N5WRWNW',
  );
  assert.equal(
    clean('https://www.amazon.com/gp/product/B08N5WRWNW?pf_rd_r=1&pd_rd_w=2&th=1&psc=1'),
    'https://www.amazon.com/dp/B08N5WRWNW',
  );
});

test('amazon: search pages keep the query but drop tracking', () => {
  assert.equal(
    clean('https://www.amazon.com/s?k=headphones&crid=1&sprefix=head&ref=nb_sb_noss'),
    'https://www.amazon.com/s?k=headphones',
  );
});

test('linkedin: strips tracking params', () => {
  assert.equal(
    clean('https://www.linkedin.com/posts/someone_hello-activity-123?utm_source=share&trackingId=abc&lipi=urn'),
    'https://www.linkedin.com/posts/someone_hello-activity-123',
  );
});

test('instagram: strips igsh/igshid', () => {
  assert.equal(clean('https://www.instagram.com/reel/Cabc123/?igsh=MXx&utm_source=ig_web'), 'https://www.instagram.com/reel/Cabc123/');
});

test('tiktok: video links lose all params', () => {
  assert.equal(
    clean('https://www.tiktok.com/@user/video/7123456789?_t=8abc&_r=1&is_from_webapp=1&q=hello'),
    'https://www.tiktok.com/@user/video/7123456789',
  );
});

test('tiktok: search keeps its query', () => {
  assert.equal(clean('https://www.tiktok.com/search?q=cats&_t=1'), 'https://www.tiktok.com/search?q=cats');
});

test('youtube: keeps v/t/list, drops si/feature/pp', () => {
  assert.equal(
    clean('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=PL1&si=abc&feature=share&pp=xyz'),
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=PL1',
  );
  assert.equal(clean('https://youtu.be/dQw4w9WgXcQ?si=abc&t=10'), 'https://youtu.be/dQw4w9WgXcQ?t=10');
});

test('spotify: drops si and context', () => {
  assert.equal(clean('https://open.spotify.com/track/abc?si=deadbeef&context=spotify%3Aalbum%3A1'), 'https://open.spotify.com/track/abc');
});

test('twitter/x: status links lose all params, other pages only the tracking ones', () => {
  assert.equal(clean('https://x.com/user/status/1234567890?s=20&t=abcdef'), 'https://x.com/user/status/1234567890');
  assert.equal(clean('https://twitter.com/search?q=cats&src=typed_query&ref_src=twsrc'), 'https://twitter.com/search?q=cats&src=typed_query');
});

test('reddit: drops share ids but keeps real params', () => {
  assert.equal(
    clean('https://www.reddit.com/r/test/comments/abc/title/?utm_source=share&utm_medium=web3x&share_id=XYZ&context=3'),
    'https://www.reddit.com/r/test/comments/abc/title/',
  );
});

test('ebay: item links lose all params', () => {
  assert.equal(
    clean('https://www.ebay.com/itm/1234567890?hash=item1&_trksid=p2&mkcid=1&campid=5'),
    'https://www.ebay.com/itm/1234567890',
  );
});

test('google search: keeps only the query', () => {
  assert.equal(
    clean('https://www.google.com/search?q=hello+world&sca_esv=1&ei=2&ved=3&sxsrf=4&oq=hello&gs_lp=5&sclient=gws'),
    'https://www.google.com/search?q=hello+world',
  );
});

test('google search: other google paths are left alone', () => {
  const url = 'https://www.google.com/maps/place/Stockholm?hl=sv';
  assert.equal(clean(url), url);
});

test('facebook redirect on /l.php unwraps', () => {
  assert.equal(
    clean('https://www.facebook.com/l.php?u=https%3A%2F%2Fexample.com%2F%3Futm_source%3Dfb&h=x'),
    'https://example.com/',
  );
});

test('google /url wrapper unwraps', () => {
  assert.equal(
    clean('https://www.google.com/url?sa=t&url=https%3A%2F%2Fexample.com%2Fa%3Fx%3D1&usg=abc'),
    'https://example.com/a?x=1',
  );
});

test('youtube /redirect wrapper unwraps', () => {
  assert.equal(
    clean('https://www.youtube.com/redirect?event=video_description&q=https%3A%2F%2Fexample.com%2F&redir_token=abc'),
    'https://example.com/',
  );
});

test('redirect wrapper with a non-http target is ignored', () => {
  const result = cleanUrl('https://l.facebook.com/l.php?u=javascript%3Aalert(1)');
  assert.equal(result.unwrapped, false);
});

test('nested redirect wrappers are followed up to a limit', () => {
  const inner = encodeURIComponent('https://example.com/final?fbclid=x');
  const middle = encodeURIComponent(`https://l.facebook.com/l.php?u=${inner}`);
  const result = cleanUrl(`https://www.google.com/url?q=${middle}`);
  assert.equal(result.cleaned, 'https://example.com/final');
});

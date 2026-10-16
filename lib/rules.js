// Data tables for URL cleaning. Keep generic entries conservative: a parameter
// listed here is stripped on EVERY site, so anything that some sites use for real
// functionality (ref, from, tag, cid, share, ...) belongs in a site rule instead.

export const EXACT_TRACKING_PARAMS = new Set([
  // Ad / click ids
  'fbclid', 'gclid', 'gclsrc', 'dclid', 'wbraid', 'gbraid', 'gad_source', 'gad_campaignid',
  'msclkid', 'twclid', 'ttclid', 'yclid', 'li_fat_id', 'igshid', 'ig_rid',
  'fb_action_ids', 'fb_action_types', 'fb_ref', 'fbadid', '__tn__',
  // Email marketing
  'mc_cid', 'mc_eid', 'mkt_tok', '_hsenc', '_hsmi', 'hsctatracking',
  'oly_enc_id', 'oly_anon_id', 'vero_id', 'vero_conv', 'elqtrackid', 'elq',
  // Misc analytics
  'epik', 's_kwcid', '_ga', '_gl', 'trk', 'trkcampaign', 'cmpid',
  'ref_src', 'ref_url', 'spm', 'scm',
]);

// Params starting with any of these prefixes are stripped on every site.
export const TRACKING_PREFIXES = ['utm_', 'pk_', 'itm_', 'piwik_', 'matomo_'];

// Per-site rules. `host` is tested against the hostname.
//   strip          params removed on matching hosts (case-insensitive)
//   keepOnly       if set (together with onlyOnPath), every param NOT listed is removed
//   onlyOnPath     regex limiting keepOnly to certain paths
//   stripAllWhen   regex on the pathname; when it matches, ALL params are removed
//   rewritePath    function (pathname) => pathname
export const SITE_RULES = [
  {
    name: 'amazon',
    host: /(^|\.)amazon\.[a-z.]{2,6}$/,
    strip: [
      'tag', 'linkcode', 'linkid', 'ref_', 'ref', 'th', 'psc', 'qid', 'sr', 'crid', 'sprefix',
      'content-id', 'dib', 'dib_tag', 'keywords_rank', 'creative', 'creativeasin',
      'camp', 'ascsubtag', 'pd_rd_i', 'pd_rd_r', 'pd_rd_w', 'pd_rd_wg', 'pf_rd_i', 'pf_rd_m',
      'pf_rd_p', 'pf_rd_r', 'pf_rd_s', 'pf_rd_t', 'social_share', 'bbn', 'rnid',
    ],
    // /Some-Title/dp/B0XXXXXXXX/ref=sr_1_1 -> /dp/B0XXXXXXXX
    rewritePath: (pathname) => {
      const product = pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})(?:[/?]|$)/i);
      if (product) return `/dp/${product[1]}`;
      return pathname.replace(/\/ref=[^/]*/g, '');
    },
    stripAllWhen: /^\/dp\/[A-Z0-9]{10}$/i,
  },
  {
    name: 'linkedin',
    host: /(^|\.)linkedin\.com$/,
    strip: [
      'trackingid', 'trk', 'trkinfo', 'originalsubdomain', 'refid', 'lipi', 'midtoken', 'midsig',
      'eid', 'otptoken', 'lici', 'licu',
    ],
  },
  {
    name: 'instagram',
    host: /(^|\.)instagram\.com$/,
    strip: ['igsh', 'igshid'],
  },
  {
    name: 'facebook',
    host: /(^|\.)(facebook\.com|fb\.com|messenger\.com)$/,
    strip: ['mibextid', '__cft__', '__tn__', 'refsrc', 'fref', 'sfnsn', 'rdid', 'share_url', 'paipv', 'eav'],
  },
  {
    name: 'tiktok',
    host: /(^|\.)tiktok\.com$/,
    stripAllWhen: /\/(video|photo)\/\d+/,
    strip: ['_t', '_r', 'is_from_webapp', 'sender_device', 'sender_web_id', 'share_app_id', 'share_link_id', 'tt_from', 'u_code', 'user_id', 'sec_user_id', 'social_sharing', 'enter_from', 'refer', 'checksum', 'share_item_id', 'sharer_language'],
  },
  {
    name: 'youtube',
    host: /(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/,
    strip: ['si', 'pp', 'feature', 'ab_channel', 'kw', 'gclid'],
  },
  {
    name: 'spotify',
    host: /(^|\.)spotify\.com$/,
    strip: ['si', 'context', 'nd', 'dlsi', 'go'],
  },
  {
    name: 'twitter',
    host: /(^|\.)(twitter\.com|x\.com)$/,
    stripAllWhen: /\/status\/\d+/,
    strip: ['s', 't', 'cxt', 'ref_src', 'ref_url'],
  },
  {
    name: 'reddit',
    host: /(^|\.)reddit\.com$/,
    strip: ['share_id', 'ref', 'ref_source', 'ref_campaign', 'correlation_id', '$deep_link', 'rdt', 'context'],
  },
  {
    name: 'ebay',
    host: /(^|\.)ebay\.[a-z.]{2,6}$/,
    stripAllWhen: /\/itm\/(?:[^/]+\/)?\d+/,
    strip: ['_trkparms', '_trksid', 'hash', 'itmmeta', 'mkcid', 'mkevt', 'mkrid', 'campid', 'customid', 'toolid', 'mkscid', 'amdata'],
  },
  {
    name: 'aliexpress',
    host: /(^|\.)aliexpress\.[a-z.]{2,6}$/,
    stripAllWhen: /\/item\/\d+\.html/,
    strip: ['algo_pvid', 'algo_exp_id', 'pdp_ext_f', 'pdp_npi', 'sourcetype', 'aff_fcid', 'aff_fsk', 'aff_platform', 'aff_trace_key', 'sk', 'terminal_id'],
  },
  {
    name: 'netflix',
    host: /(^|\.)netflix\.com$/,
    stripAllWhen: /\/title\/\d+/,
    strip: ['trackid', 'tctx', 'jbv'],
  },
  {
    name: 'apple',
    host: /(^|\.)(apple\.com|itunes\.apple\.com)$/,
    strip: ['uo', 'at', 'ct', 'itscg', 'itsct', 'ls', 'pt'],
  },
  {
    name: 'medium',
    host: /(^|\.)medium\.com$/,
    strip: ['source', 'sk', 'gi'],
  },
  {
    name: 'google-search',
    host: /(^|\.)google\.[a-z.]{2,6}$/,
    onlyOnPath: /^\/search$/,
    keepOnly: ['q', 'tbm', 'udm', 'tbs'],
  },
  {
    name: 'bing-search',
    host: /(^|\.)bing\.com$/,
    onlyOnPath: /^\/search$/,
    keepOnly: ['q'],
  },
];

// Redirect wrappers: hostname -> query param(s) holding the real destination.
// `pathMustBe` limits the unwrap to one exact path.
export const REDIRECT_UNWRAP_RULES = [
  { host: 'l.facebook.com', param: 'u' },
  { host: 'lm.facebook.com', param: 'u' },
  { host: 'l.messenger.com', param: 'u' },
  { host: 'l.instagram.com', param: 'u' },
  { host: 'www.facebook.com', param: 'u', pathMustBe: '/l.php' },
  { host: 'out.reddit.com', param: 'url' },
  { host: 'away.vk.com', param: 'to' },
  { host: 'www.google.com', param: ['q', 'url'], pathMustBe: '/url' },
  { host: 'google.com', param: ['q', 'url'], pathMustBe: '/url' },
  { host: 'www.youtube.com', param: 'q', pathMustBe: '/redirect' },
  { host: 'youtube.com', param: 'q', pathMustBe: '/redirect' },
  { host: 'duckduckgo.com', param: 'uddg', pathMustBe: '/l/' },
  { host: 'steamcommunity.com', param: 'url', pathMustBe: '/linkfilter/' },
  { host: 'slack-redir.net', param: 'url' },
  { host: 'exit.sc', param: 'url' },
  { host: 'disq.us', param: 'url', pathMustBe: '/url' },
  // Google ad click trackers
  { host: 'ad.doubleclick.net', param: 'ds_dest_url', pathMustBe: '/ddm/socialclk' },
  { host: 'adclick.g.doubleclick.net', param: 'adurl', pathMustBe: '/pcs/click' },
  { host: 'www.googleadservices.com', param: 'adurl', pathMustBe: '/pagead/aclk' },
];

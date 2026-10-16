# Clean Link Sharer

Chrome extension that strips tracking parameters (UTM tags, `fbclid`, `gclid`, `si`, …) from a link before you share it, and unwraps common redirect wrappers such as Facebook's `l.php`. Everything runs locally; no data is collected.

## Load it in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select this folder
4. Pin the extension to the toolbar

After changing any file, click the reload icon on the extension's card.

## Usage

- **Toolbar button**: shows the current tab's cleaned link with Copy / Share / Open and a list of what was removed.
- **Right-click a link**: "Copy clean link".
- **Right-click a page**: "Copy clean link to this page".
- **Alt+Shift+C**: copies a clean link to the current page straight away. Change it at `chrome://extensions/shortcuts`.
- **Settings**: extra parameters to always strip, redirect unwrapping on/off, automatic copy when the popup opens, and export/import of your settings.

The interface follows Chrome's language (English and Swedish) and your light/dark theme.

## Project layout

| Path | What it is |
| --- | --- |
| `manifest.json` | Extension manifest (MV3) |
| `background.js` | Context menus, keyboard shortcut, clipboard via offscreen document |
| `popup.*`, `options.*` | Toolbar popup and settings page |
| `lib/rules.js` | Tracking parameter lists, per-site rules, redirect-wrapper rules |
| `lib/cleanUrl.js` | The cleaning logic |
| `lib/settings.js`, `lib/i18n.js` | Settings storage/validation and translations helper |
| `_locales/` | `en` and `sv` strings |
| `tests/` | Unit tests |
| `scripts/` | Icon generator and Web Store packager |
| `store/listing.md`, `PRIVACY.md` | Store listing text and privacy policy |

## Development

Requires Node 22 or newer. No dependencies to install.

```bash
npm test            # run the unit tests
npm run icons       # regenerate icons/ (only needed if you change the design)
npm run package     # build dist/clean-link-sharer-<version>.zip for the Web Store
```

### Adding or changing a cleaning rule

- A parameter that is tracking on **every** site goes in `EXACT_TRACKING_PARAMS` in `lib/rules.js`. Keep that list conservative: names such as `ref`, `from` or `tag` are real functionality on some sites.
- A parameter that is tracking only on one site goes in that site's entry in `SITE_RULES`.
- Add a test in `tests/siteRules.test.js` with a realistic URL before and after.

## Publishing

See [store/listing.md](store/listing.md) for the listing text, permission justifications, screenshot list and a pre-submit checklist.

## License

[MIT](LICENSE)

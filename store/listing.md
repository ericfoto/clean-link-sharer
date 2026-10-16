# Chrome Web Store listing – Clean Link Sharer

Copy these into the Developer Dashboard (https://chrome.google.com/webstore/devconsole). The extension name and the short description come from `_locales/*/messages.json`, so they are filled in automatically from the uploaded package.

## Basics

- **Category:** Productivity
- **Language:** English (add Swedish as a second listing language)
- **Name:** Clean Link Sharer
- **Short description (max 132 chars):**
  - EN: Remove tracking (UTM, fbclid, gclid …) from links before you share them. One click, nothing leaves your browser.
  - SV: Ta bort spårning (UTM, fbclid, gclid …) från länkar innan du delar dem. Ett klick, och inget lämnar din webbläsare.

## Detailed description – English

Share links without the tracking junk.

Clean Link Sharer removes tracking parameters from a link before you copy or share it, so you send `https://example.com/article?id=42` instead of `https://example.com/article?id=42&utm_source=newsletter&fbclid=IwAR0…`.

HOW IT WORKS
• Click the toolbar button to see the clean version of the current page. Copy it, share it, or open it.
• Right-click any link and choose "Copy clean link".
• Press Alt+Shift+C to copy a clean link to the current page instantly (you can change the shortcut).

WHAT IT CLEANS
• Campaign and ad tracking: utm_*, fbclid, gclid, msclkid, twclid, ttclid, mc_eid and many more.
• Site-specific tracking on Amazon, YouTube, Spotify, Instagram, TikTok, LinkedIn, Reddit, X/Twitter, Facebook, eBay, AliExpress, Netflix, Apple and Google/Bing search.
• Redirect wrappers, such as links that go through Facebook, Google, YouTube or Reddit first, are unwrapped to the real destination.
• Parameters that sites need to work (for example the video ID on YouTube or the search query on Google) are kept.

YOUR CONTROL
• Add your own parameters to always remove.
• Turn redirect unwrapping on or off.
• Optionally copy the clean link automatically when you open the popup.
• Export and import your settings.
• Light and dark mode. English and Swedish.

PRIVATE BY DESIGN
Everything happens locally in your browser. The extension collects no data, has no analytics, makes no network requests, and needs no access to the content of the pages you visit.

## Detailed description – Svenska

Dela länkar utan spårningsskräp.

Clean Link Sharer tar bort spårningsparametrar från en länk innan du kopierar eller delar den, så att du skickar `https://example.com/article?id=42` i stället för `https://example.com/article?id=42&utm_source=newsletter&fbclid=IwAR0…`.

SÅ FUNGERAR DET
• Klicka på knappen i verktygsfältet för att se den rena versionen av sidan du är på. Kopiera, dela eller öppna den.
• Högerklicka på valfri länk och välj "Kopiera ren länk".
• Tryck Alt+Shift+C för att direkt kopiera en ren länk till den aktuella sidan (du kan ändra kortkommandot).

VAD SOM RENSAS
• Kampanj- och annonsspårning: utm_*, fbclid, gclid, msclkid, twclid, ttclid, mc_eid och många fler.
• Sajtspecifik spårning på Amazon, YouTube, Spotify, Instagram, TikTok, LinkedIn, Reddit, X/Twitter, Facebook, eBay, AliExpress, Netflix, Apple samt Google- och Bing-sök.
• Omdirigeringslänkar, till exempel länkar som går via Facebook, Google, YouTube eller Reddit, packas upp till den riktiga adressen.
• Parametrar som sidor behöver för att fungera (till exempel video-ID på YouTube eller söktexten på Google) behålls.

DU BESTÄMMER
• Lägg till egna parametrar som alltid ska tas bort.
• Slå av eller på uppackning av omdirigeringslänkar.
• Kopiera den rena länken automatiskt när du öppnar popupen, om du vill.
• Exportera och importera dina inställningar.
• Ljust och mörkt läge. Svenska och engelska.

PRIVAT FRÅN GRUNDEN
Allt sker lokalt i din webbläsare. Tillägget samlar inte in någon data, har ingen statistik, gör inga nätverksanrop och behöver ingen åtkomst till innehållet på sidorna du besöker.

## Privacy tab

- **Single purpose:** Removes tracking parameters from web links so the user can copy and share a clean link.
- **Permission justifications** (the dashboard asks for each one):
  - `activeTab`: Reads the URL of the current tab only when the user clicks the toolbar button or presses the keyboard shortcut, in order to clean it.
  - `contextMenus`: Adds the "Copy clean link" entries to the right-click menu on links and pages.
  - `clipboardWrite`: Copies the cleaned link to the clipboard.
  - `offscreen`: Chrome does not let the service worker access the clipboard, so the copy is performed in an offscreen document (reason: CLIPBOARD).
  - `storage`: Saves the user's settings (extra parameters, redirect unwrapping, automatic copy).
- **Remote code:** No, I am not using remote code.
- **Data usage:** Tick nothing. The extension does not collect or transmit any user data. Then tick all three certification boxes (no sale of data, no use unrelated to the single purpose, no creditworthiness/lending use).
- **Privacy policy URL:** publish `PRIVACY.md` somewhere public (GitHub Pages, a gist, your own site) and paste that URL. The dashboard requires a URL, not a file.

## Graphics

| Asset | Size | Status |
| --- | --- | --- |
| Store icon | 128×128 PNG | Ready: `icons/icon-128.png` |
| Screenshots (1–5) | 1280×800 or 640×400 | Take these yourself, see below |
| Small promo tile (optional) | 440×280 | Optional |

Suggested screenshots, taken in Chrome with the extension loaded:

1. The popup open on a page with a messy URL (for example a YouTube share link with `?si=`), with the "Removed N parameters" list expanded.
2. The right-click menu on a link showing "Copy clean link".
3. The settings page.
4. The popup in dark mode.

Tip: take the screenshot of the whole browser window at 1280×800 so the toolbar button and popup are both visible.

## Before you submit

- [ ] `npm test` passes
- [ ] `npm run package` and upload `dist/clean-link-sharer-<version>.zip`
- [ ] Load the unpacked folder once in `chrome://extensions` and try: toolbar popup, right-click on a link, right-click on a page, Alt+Shift+C, Settings page, export/import
- [ ] Privacy policy published and the URL pasted in the dashboard
- [x] Contact link added to `PRIVACY.md`
- [ ] Screenshots uploaded

## Releasing an update later

1. Make the change, run `npm test`.
2. Bump `version` in both `manifest.json` and `package.json` (a test checks they match).
3. `npm run package`, upload the new zip in the dashboard, submit for review. Users get the update automatically.

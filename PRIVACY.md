# Privacy Policy – Clean Link Sharer

*Last updated: 2026-10-16*

**Short version: Clean Link Sharer does not collect, store, or transmit any personal data. Everything happens locally in your browser.**

## What the extension does with your data

- **Links and page addresses.** When you click the toolbar button, use the keyboard shortcut, or choose "Copy clean link" in the right-click menu, the extension reads the address (URL) of the current page or the link you clicked. It removes tracking parameters from that address and copies the result to your clipboard. This processing happens entirely on your device. The address is not saved, logged, or sent anywhere.
- **Settings.** Your preferences (extra parameters to remove, redirect unwrapping, automatic copy) are stored using Chrome's `chrome.storage.sync`. If you are signed in to Chrome with sync enabled, Chrome may sync these settings between your devices through your Google account. The developer has no access to them.

## What the extension does NOT do

- No analytics, telemetry, or crash reporting.
- No advertising, no tracking, no profiling.
- No network requests of its own. The extension never contacts any server, and it does not follow or resolve links.
- No remote code. All code ships inside the extension package.
- No sale or sharing of data with third parties, because no data is collected.

## Permissions and why they are needed

| Permission | Why |
| --- | --- |
| `activeTab` | To read the address of the current tab only when you click the toolbar button or use the keyboard shortcut. |
| `contextMenus` | To add the "Copy clean link" items to the right-click menu. |
| `clipboardWrite` | To copy the cleaned link to your clipboard. |
| `offscreen` | To perform the clipboard copy from the background (Chrome does not allow service workers to access the clipboard directly). |
| `storage` | To save your settings. |

The extension requests no access to the content of the websites you visit and has no host permissions.

## Children

The extension does not collect data from anyone, including children.

## Changes to this policy

If this policy changes, the new version will be published together with the extension update and the date above will be updated.

## Contact

Questions about this policy: **https://github.com/ericfoto/clean-link-sharer** (open an issue there)

---

# Integritetspolicy – Clean Link Sharer

*Senast uppdaterad: 2026-10-16*

**Kort version: Clean Link Sharer samlar inte in, lagrar eller skickar någon personlig data. Allt sker lokalt i din webbläsare.**

## Vad tillägget gör med dina uppgifter

- **Länkar och sidadresser.** När du klickar på knappen i verktygsfältet, använder kortkommandot eller väljer "Kopiera ren länk" i högerklicksmenyn läser tillägget adressen (URL:en) till den aktuella sidan eller den länk du klickade på. Tillägget tar bort spårningsparametrar från adressen och kopierar resultatet till urklipp. Allt detta sker på din egen enhet. Adressen sparas inte, loggas inte och skickas inte någonstans.
- **Inställningar.** Dina val (extra parametrar att ta bort, uppackning av omdirigeringslänkar, automatisk kopiering) sparas med Chromes `chrome.storage.sync`. Om du är inloggad i Chrome med synkronisering aktiverad kan Chrome synkronisera inställningarna mellan dina enheter via ditt Google-konto. Utvecklaren har ingen åtkomst till dem.

## Vad tillägget inte gör

- Ingen statistik, telemetri eller felrapportering.
- Ingen reklam, ingen spårning, ingen profilering.
- Inga egna nätverksanrop. Tillägget kontaktar aldrig någon server och följer eller löser inte upp länkar.
- Ingen kod som hämtas utifrån. All kod ligger i själva tilläggspaketet.
- Ingen försäljning eller delning av data med tredje part, eftersom ingen data samlas in.

## Behörigheter och varför de behövs

| Behörighet | Varför |
| --- | --- |
| `activeTab` | För att läsa adressen till den aktuella fliken, bara när du klickar på knappen eller använder kortkommandot. |
| `contextMenus` | För att lägga till "Kopiera ren länk" i högerklicksmenyn. |
| `clipboardWrite` | För att kopiera den rena länken till urklipp. |
| `offscreen` | För att kunna kopiera till urklipp från bakgrunden (Chrome tillåter inte att bakgrundsskript når urklipp direkt). |
| `storage` | För att spara dina inställningar. |

Tillägget begär ingen åtkomst till innehållet på webbplatserna du besöker och har inga värdbehörigheter.

## Barn

Tillägget samlar inte in data från någon, inte heller från barn.

## Ändringar

Om policyn ändras publiceras den nya versionen tillsammans med en uppdatering av tillägget, och datumet ovan uppdateras.

## Kontakt

Frågor om policyn: **https://github.com/ericfoto/clean-link-sharer** (öppna ett ärende där)

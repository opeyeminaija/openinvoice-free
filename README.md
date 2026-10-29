# OpenInvoice

Free, open-source, privacy-first invoice and receipt generator for small businesses, freelancers and schools. Based on the original invoice and receipt application created by the project owner.

## Features
- A4/A5-style and thermal document templates (depending on the selected form)
- Invoice and receipt creation, item totals and document preview
- Print, PDF and PNG export (external export libraries must load)
- Business profile saved on-device, currency symbol preference, light/dark mode
- Auto-suggested invoice/receipt identifiers, saved local history, search, duplicate, delete
- JSON backup and restore, offline app shell via service worker
- No account, server, advertising or customer data upload by the app itself

## Start
Open `index.html` in a modern browser to preview, or serve this folder with any static web server. GitHub Pages works. For offline installation, access the site via HTTPS and open it online once so the service worker can cache the application shell.

**Important limitations:** The PDF/PNG, QR and barcode features rely on external CDN scripts and may not work without a network connection, unless those libraries have been cached by the browser. Print → Save as PDF is the fallback. Local history is tied to the browser/device and is not synchronized. Backup files contain personal and financial data. Document numbering is a local suggestion, not a guaranteed unique sequence across devices. Currency selection changes the displayed symbol only; it does not convert amounts. This software is not a certified accounting, fiscal, or tax compliance product.

## Usage
1. Open Settings & Backup, enter your business details and save.
2. Choose Invoice or Receipt, enter customer information and line items.
3. Preview, print, or download. Click **Save to history** to retain a local copy.
4. Open History to search, view, duplicate or delete records.
5. Export JSON backups frequently, especially before changing phones or clearing browser data.

## Privacy and security
All saved records are in localStorage on your device; no remote database is used. Third-party CDN requests are made for optional libraries and web fonts, so do not describe the app as completely network-independent. Avoid shared devices for confidential invoices. Anyone who can access your browser profile may be able to access saved records.

## Development
Static HTML, CSS and vanilla JavaScript. No build step required. Main files: `index.html`, `style.css`, `script.js` (original app), `openinvoice.js` (added local features), `sw.js` (app-shell caching).

## Contributions
See [CONTRIBUTING.md](CONTRIBUTING.md). Open an issue describing the problem and reproduction steps before a major feature change. Pull requests should include a short test plan and screenshots for UI changes.

## License
MIT — see [LICENSE](LICENSE). Third-party libraries loaded from CDNs are separately licensed by their respective authors.

# OpenInvoice — Android & GitHub Setup Guide

## 1. Publish from your Android phone
1. Extract the ZIP using your phone's Files app or ZArchiver.
2. Sign in to GitHub as `opeyeminaija`.
3. Select **New repository**, name it `openinvoice-free`, choose **Public**, and create it.
4. Select **Add file → Upload files** (on a mobile browser, enable **Desktop site** if the option is hidden).
5. Upload **all files inside** the extracted folder, not the ZIP alone. Keep `index.html` at the repository root.
6. Commit the uploaded files. Check that README and LICENSE appear.

## 2. Turn on free GitHub Pages hosting
1. Open the repository **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Select branch `main`, folder `/(root)`, then **Save**.
4. Wait for the deployment. Your expected URL will be `https://opeyeminaija.github.io/openinvoice-free/` if those names are used.
5. Open the URL and test creating, saving, printing and restoring a document.

## 3. Use OpenInvoice
1. Select **Settings & Backup** and save business details.
2. Select **Create Invoice** or **Create Receipt**.
3. Enter customer details, items, dates and amounts.
4. Generate a preview. Save to history separately, then Print or Download.
5. Use **History** to search, duplicate or delete saved documents.
6. Use **Export JSON backup** regularly. To restore, select **Import backup**. Import replaces existing local data.

## 4. Android PDF and offline usage
- In the preview select **Print**, then **Save as PDF** in the Android print dialog if direct PDF download fails.
- After first loading the site over HTTPS, some browsers offer **Add to Home screen / Install app**.
- The main app shell is cached for offline opening; external QR/barcode/PDF/image libraries are NOT bundled and may require internet.
- Keep a private copy of your backup JSON. It contains customer and transaction information.

## 5. Before applying for Codex for OSS
- Publish an accurate README, license and working demonstration.
- Test on multiple devices and fix bugs in public commits.
- Invite genuine user feedback and record improvements in GitHub issues/releases.
- Describe your actual maintenance role and usage honestly; a newly created repository alone does not establish eligibility or guarantee acceptance.

## Troubleshooting
- **Blank page:** Confirm `index.html`, `script.js`, `openinvoice.js`, and `style.css` are in the repository root.
- **Pages 404:** Verify Pages settings and allow deployment time.
- **Data disappeared:** Browser storage was cleared or a different browser/device is being used. Restore a JSON backup.
- **Download not working:** Use Print → Save as PDF while connected to the internet.
- **Offline export not working:** External library dependencies were not bundled.

# Zeta Kappa Recruitment Site v2

Pages:
- index.html
- about.html — developed scrapbook-style About Us page
- brothers.html — placeholder
- events.html — placeholder
- parents.html — placeholder
- interest.html — placeholder

The About page alternates image-left/text-right and text-left/image-right through Brotherhood, Service, Leadership, and Beyond College. Images use a polaroid-style white frame, thicker lower border, drop shadow, slight rotation, and subtle gloss.


## v4 correction
- Removed the five-photo collage from the homepage Experience section.
- Kept the homepage Experience area as a restrained translucent dark section.
- Moved the five overlapping Polaroid photos to the About Us closing section.
- The closing black panel is now semi-transparent and blurred, visibly floating over the photos behind it.


## v5 collage revision
- Enlarged all five closing Polaroids.
- Reworked them into a loose single-row composition rather than a 2x2-style cluster.
- Mixed portrait and landscape card proportions.
- Increased rotation variety so they feel tossed onto a scrapbook table and partially organized.
- Reduced the dark panel opacity slightly so the photos visibly continue underneath it.
- Positioned the panel so it covers only the middle portions of the photos, leaving large sections exposed.


## v6 wide scrapbook revision
- Expanded the About closing collage from 5 to 9 prints.
- Duplicated several existing photos intentionally as temporary placeholders.
- Spread the photographs across a field wider than the CTA panel and, on desktop, slightly wider than the viewport.
- Preserved mixed portrait/landscape proportions and irregular rotations.
- Kept the translucent CTA centered over only the middle of the scrapbook spread.


## v7 edge-intersection correction
- Repositioned the photographs around the perimeter of the translucent panel instead of behind its center.
- Six prints intersect only an edge of the black panel, leaving about half of each visible outside it.
- Three additional prints sit farther left/right and are partially obscured by neighboring Polaroids rather than by the panel.
- Kept irregular rotations and mixed portrait/landscape proportions.


## v8 horizontal spread
- Preserved the v7 perimeter-intersection composition.
- Pushed the photograph field roughly 50% farther left and right.
- Far outer Polaroids now extend beyond the central content width.
- Middle photographs bridge the gap between the outer prints and the translucent panel.
- Kept one lower-center photograph as a visual anchor so the collage still feels connected.


## v9 extra-wide scrapbook revision
- Pushed the v8 photograph composition approximately another 75% outward horizontally.
- Outer prints now sit substantially farther beside the translucent panel.
- Inner prints still bridge toward/intersect the panel so the collage remains visually connected.


## v10 open-center revision
- Pushed four of the inner/center photographs farther toward the left and right edges.
- Moved the lower-center portrait toward the lower-left edge rather than directly behind the CTA.
- Preserved a few partial intersections with the translucent panel while opening up substantially more of its center.


## v11 live Meet the Brothers demo
- Replaced the Brothers placeholder with a responsive scrapbook-style active roster.
- Reads Name, Major, Graduation Year, Position, and Photo from a published Google Sheet CSV.
- No manual refresh control; roster is fetched automatically on page load.
- Blank Position/Major/Graduation fields simply do not render.
- Missing/broken photos fall back to the chapter wordmark.
- Connect the sheet by pasting its published CSV URL into js/brothers-config.js.


## v12 normal Google Sheets share-link support
- brothers-config.js now accepts the standard Google Sheets share link instead of a published CSV URL.
- brothers.js extracts the spreadsheet ID automatically and builds the CSV export endpoint internally.
- Set the sheet to "Anyone with the link" -> Viewer.
- If the Active Brothers roster is not the first sheet tab, set BROTHERS_SHEET_GID to that tab's gid.
- Recommended for local testing: use a local HTTP server such as VS Code Live Server or `python -m http.server`; do not open the HTML via file://.


## v18 Privacy & Cookies
- Added a Privacy & Cookies link to the recruitment-site footer.
- Added privacy.html with a short plain-language explanation of preference storage used by pop-ups and possible future basic site analytics.
- The wording intentionally distinguishes preference storage from future analytics and notes that consent controls may be updated if non-essential technologies are introduced.


## v20 changes
- Renamed primary navigation labels to **About Us**, **Meet the Brothers**, and **Parents & Families**.
- Standardized browser-tab titles for the updated navigation language.
- Updated the About page hero title to **About Us** while preserving the “More than four years” message in the supporting copy.
- Fixed mobile navigation stacking so the menu sits above the blur layer and parent prompt. The parent prompt temporarily moves out of the way while the mobile menu is open and returns after it closes.

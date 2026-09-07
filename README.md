# Zeta Kappa Recruitment Site v2

Pages:
- index.html
- /about/ — developed scrapbook-style About Us page
- /brothers/ — placeholder
- /events/ — placeholder
- /parents/ — placeholder
- interest.html — placeholder

The About page alternates image-left/text-right and text-left/image-right through Brotherhood, Service, Leadership, and Beyond College. Images use a polaroid-style white frame, thicker lower border, drop shadow, slight rotation, and subtle gloss.


## v4 correction
- Removed the five-photo collage from the homepage Experience section.
- Kept the homepage Experience area as a restrained translucent dark section.
- Moved the five overlapping Polaroid photos to the About Us closing section.
- The closing black panel is now semi-transparent and blurred, visibly floating over the photos behind it.


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
- Added /privacy/ with a short plain-language explanation of preference storage used by pop-ups and possible future basic site analytics.
- The wording intentionally distinguishes preference storage from future analytics and notes that consent controls may be updated if non-essential technologies are introduced.


## v20 changes
- Renamed primary navigation labels to **About Us**, **Meet the Brothers**, and **Parents & Families**.
- Standardized browser-tab titles for the updated navigation language.
- Updated the About page hero title to **About Us** while preserving the “More than four years” message in the supporting copy.
- Fixed mobile navigation stacking so the menu sits above the blur layer and parent prompt. The parent prompt temporarily moves out of the way while the mobile menu is open and returns after it closes.


## v27 smart Interest links
See `INTEREST-LINKS.md` for query-string links that preselect Interest Level and/or How Did You Hear About Us.


## Recruitment photography refresh (v33)
17 archival/current chapter photos were added to `assets/img/`. Landing, About, Events, Interest, and Parents imagery now uses a mix of current and historical Zeta Kappa photography.

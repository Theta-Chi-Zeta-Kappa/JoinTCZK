// NORMAL GOOGLE SHEETS SHARE LINK
//
// Example:
// https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit?usp=sharing
//
// Required sharing setting:
// Anyone with the link -> Viewer
//
// v13 uses Google's Visualization endpoint through a script callback,
// avoiding the browser CORS problem that can occur with direct CSV fetches.
window.BROTHERS_SHEET_SHARE_URL = "https://docs.google.com/spreadsheets/d/1PIvHi5eBVqoRF0vohF_jwWJG3e02tyaFg_Q2JDsfM00/edit?usp=sharing";

// Usually "0" for the first tab.
// If the Active Brothers roster is on another tab, select that tab in
// Google Sheets and copy the number after gid= from the browser address.
window.BROTHERS_SHEET_GID = "0";

//
// The website expects the template layout:
// Row 4: Name | Major | Graduation Year | Position | Photo
// Row 5+: brother data

# Events Page Setup

The Events page reads the `Events` tab already imported into the same Google Sheets workbook as Active Brothers.

## Connect the workbook
Open `js/events-config.js` and paste the same normal Google Sheets share URL used by the Active Brothers page:

```js
window.EVENTS_SHEET_SHARE_URL = "YOUR NORMAL GOOGLE SHEETS SHARE LINK";
window.EVENTS_SHEET_NAME = "Events";
```

The loader targets the tab by name, so an Events `gid` is not required.

## Expected Events layout
Row 4 must contain:

Event | Date | Start Time | End Time | Location | Description | Image | Show in Past Events

Rows 5+ contain events.

- Events dated today or later appear under Upcoming.
- Events before today leave Upcoming automatically.
- A past event appears in "See what recruitment is like" only when `Show in Past Events` is `Yes`.
- `Image` may be a relative site path such as `assets/events/cookout.webp` or a public direct image URL.
- If there are no upcoming events, the page automatically shows the friendly "More events are coming soon" state.

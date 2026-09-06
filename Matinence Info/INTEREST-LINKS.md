# Smart links for the Interest page

The Interest page supports query parameters that preselect **visible form answers**. No new spreadsheet columns are created. The visitor can still change the preselected answer before submitting.

Base page:

`https://join.tczk.org/interest.html`

## Preselect Interest Level

- Just looking around: `https://join.tczk.org/interest.html?level=look#interest-form`
- More information: `https://join.tczk.org/interest.html?level=info#interest-form`
- Meet the chapter: `https://join.tczk.org/interest.html?level=meet#interest-form`
- Interested in joining: `https://join.tczk.org/interest.html?level=join#interest-form`

## Preselect How Did You Hear About Us?

- Friend / Current Brother: `https://join.tczk.org/interest.html?heard=friend#interest-form`
- Instagram: `https://join.tczk.org/interest.html?heard=instagram#interest-form`
- Facebook: `https://join.tczk.org/interest.html?heard=facebook#interest-form`
- Recruitment Event: `https://join.tczk.org/interest.html?heard=recruitment-event#interest-form`
- Campus Event: `https://join.tczk.org/interest.html?heard=campus-event#interest-form`
- ONU / Greek Life: `https://join.tczk.org/interest.html?heard=onu#interest-form`
- Alumnus: `https://join.tczk.org/interest.html?heard=alumnus#interest-form`
- QR Code / Flyer: `https://join.tczk.org/interest.html?heard=qr#interest-form`
- Other: `https://join.tczk.org/interest.html?heard=other#interest-form`

## Combine them

Parameters can be combined. For example, a QR code on a recruitment flyer that should open with “I'd like more information” selected:

`https://join.tczk.org/interest.html?level=info&heard=qr#interest-form`

An Instagram Story aimed at getting someone to meet the chapter:

`https://join.tczk.org/interest.html?level=meet&heard=instagram#interest-form`

## Important behavior

These links only prefill the existing visible form. They do not silently record the link a visitor clicked. A value reaches the Interest Submissions sheet only if the visitor submits the form, and they can change the prefilled selection first.

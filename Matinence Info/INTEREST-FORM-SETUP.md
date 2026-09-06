# Interest Form Setup

The page and validation are complete. One Google Apps Script deployment is required before submissions can reach the `Interest Submissions` tab.

## 1. Open the existing recruitment workbook
Use the same Google Sheet that already contains:
- `Active Brothers`
- `Events`
- `Interest Submissions`

The `Interest Submissions` headers should remain on row 4 in this order:

`Timestamp | First Name | Last Name | Graduation Year | Major | Email | Phone | Preferred Contact | Interest Level | Message | Heard About Us`

## 2. Add the Apps Script
In Google Sheets choose **Extensions > Apps Script**.
Delete the starter function and paste the contents of:

`apps-script/InterestForm.gs`

Save the project.

## 3. Deploy it as a Web App
Choose **Deploy > New deployment > Web app**.

Use:
- Execute as: **Me**
- Who has access: **Anyone**

Authorize the script when Google asks. Then copy the Web App URL ending in `/exec`.

This does NOT make the spreadsheet publicly editable. Visitors only call the script, which appends the approved form fields to the submission tab.

## 4. Connect the website
Open:

`js/interest-config.js`

Paste the `/exec` URL:

```js
window.INTEREST_FORM_ENDPOINT = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

Upload the changed site files to GitHub Pages.

## 5. Test
Submit a test entry from the hosted `interest.html` page. Confirm a new row appears in `Interest Submissions`.

The form requires:
- First Name
- Last Name
- Graduation Year
- at least one of Email or Phone
- Preferred Contact
- Interest Level

Major, Message, and Heard About Us are optional.

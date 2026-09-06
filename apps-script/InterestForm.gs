/**
 * Theta Chi Zeta Kappa recruitment interest form receiver.
 *
 * SETUP:
 * 1. Open the Google Sheet that contains Active Brothers, Events, and Interest Submissions.
 * 2. Extensions > Apps Script.
 * 3. Replace the default code with this file.
 * 4. Deploy > New deployment > Web app.
 * 5. Execute as: Me.
 * 6. Who has access: Anyone.
 * 7. Copy the /exec URL into js/interest-config.js.
 *
 * The spreadsheet itself does NOT need to be publicly editable.
 */

const INTEREST_SHEET_NAME = 'Interest Submissions';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    if (!e || !e.parameter) return textResponse('Missing submission.');

    // Honeypot. Humans never see this field.
    if (clean(e.parameter.website, 200)) return textResponse('OK');

    const firstName = clean(e.parameter.firstName, 60);
    const lastName = clean(e.parameter.lastName, 60);
    const graduationYear = clean(e.parameter.graduationYear, 4);
    const major = clean(e.parameter.major, 100);
    const email = clean(e.parameter.email, 120);
    const phone = clean(e.parameter.phone, 30);
    const preferredContact = clean(e.parameter.preferredContact, 20);
    const interestLevel = clean(e.parameter.interestLevel, 80);
    const message = clean(e.parameter.message, 1000);
    const heardAboutUs = clean(e.parameter.heardAboutUs, 80);

    if (!firstName || !lastName || !graduationYear || (!email && !phone) || !preferredContact || !interestLevel) {
      return textResponse('Missing required fields.');
    }

    const allowedContact = ['Email', 'Text', 'Call'];
    if (!allowedContact.includes(preferredContact)) return textResponse('Invalid contact preference.');
    if (preferredContact === 'Email' && !email) return textResponse('Email is required for email contact.');
    if ((preferredContact === 'Text' || preferredContact === 'Call') && !phone) return textResponse('Phone is required for phone contact.');

    const allowedLevels = [
      'Just looking around',
      "I'd like more information",
      "I'd like to meet the chapter",
      "I'm interested in joining"
    ];
    if (!allowedLevels.includes(interestLevel)) return textResponse('Invalid interest level.');

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(INTEREST_SHEET_NAME);
    if (!sheet) throw new Error(`Sheet not found: ${INTEREST_SHEET_NAME}`);

    // Matches the imported sheet exactly:
    // Timestamp | First Name | Last Name | Graduation Year | Major | Email | Phone |
    // Preferred Contact | Interest Level | Message | Heard About Us
    sheet.appendRow([
      new Date(), firstName, lastName, graduationYear, major, email, phone,
      preferredContact, interestLevel, message, heardAboutUs
    ]);

    return textResponse('OK');
  } catch (err) {
    console.error(err);
    return textResponse('Submission error.');
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function textResponse(message) {
  return ContentService.createTextOutput(message).setMimeType(ContentService.MimeType.TEXT);
}

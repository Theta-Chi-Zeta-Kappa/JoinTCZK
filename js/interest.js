(() => {
  const form = document.getElementById('interestForm');
  if (!form) return;

  const email = document.getElementById('interestEmail');
  const phone = document.getElementById('interestPhone');
  const contactError = document.getElementById('contactError');
  const preferredError = document.getElementById('preferredError');
  const preferredRadios = [...form.querySelectorAll('input[name="preferredContact"]')];
  const submitButton = form.querySelector('.submit-button');
  const status = document.getElementById('formStatus');
  const successPanel = document.getElementById('successPanel');
  const sourceInput = document.getElementById('interestSource');

  const params = new URLSearchParams(location.search);
  const source = params.get('source');
  if (sourceInput && source) sourceInput.value = source.slice(0, 100);

  // Smart interest links can preselect visible form answers without adding
  // any extra columns to the Google Sheet. Examples:
  //   /interest/?level=meet#interest-form
  //   /interest/?heard=instagram#interest-form
  //   /interest/?level=info&heard=qr#interest-form
  const levelMap = {
    look: 'Just looking around',
    info: "I'd like more information",
    meet: "I'd like to meet the chapter",
    join: "I'm interested in joining"
  };
  const heardMap = {
    friend: 'Friend / Current Brother',
    instagram: 'Instagram',
    facebook: 'Facebook',
    'recruitment-event': 'Recruitment Event',
    'campus-event': 'Campus Event',
    onu: 'ONU / Greek Life',
    alumnus: 'Alumnus',
    qr: 'QR Code / Flyer',
    other: 'Other'
  };

  const requestedLevel = (params.get('level') || '').trim().toLowerCase();
  const levelValue = levelMap[requestedLevel];
  if (levelValue) {
    const levelRadio = [...form.querySelectorAll('input[name="interestLevel"]')]
      .find(radio => radio.value === levelValue);
    if (levelRadio) levelRadio.checked = true;
  }

  const requestedHeard = (params.get('heard') || '').trim().toLowerCase();
  const heardValue = heardMap[requestedHeard];
  const heardSelect = form.querySelector('select[name="heardAboutUs"]');
  if (heardSelect && heardValue) heardSelect.value = heardValue;

  function updatePreferredChoices() {
    const hasEmail = email.value.trim() !== '';
    const hasPhone = phone.value.trim() !== '';

    preferredRadios.forEach(radio => {
      const needsEmail = radio.value === 'Email';
      const needsPhone = radio.value === 'Text' || radio.value === 'Call';
      radio.disabled = (needsEmail && !hasEmail) || (needsPhone && !hasPhone);
      if (radio.disabled && radio.checked) radio.checked = false;
    });

    const enabled = preferredRadios.filter(r => !r.disabled);
    if (enabled.length === 1 && !preferredRadios.some(r => r.checked)) enabled[0].checked = true;

    if (hasEmail || hasPhone) contactError.hidden = true;
  }

  email.addEventListener('input', updatePreferredChoices);
  phone.addEventListener('input', updatePreferredChoices);
  updatePreferredChoices();

  function validate() {
    let valid = form.checkValidity();
    const hasEmail = email.value.trim() !== '';
    const hasPhone = phone.value.trim() !== '';
    const preferred = preferredRadios.find(r => r.checked && !r.disabled);

    contactError.hidden = hasEmail || hasPhone;
    preferredError.hidden = Boolean(preferred);
    if (!hasEmail && !hasPhone) valid = false;
    if (!preferred) valid = false;

    if (!valid) {
      form.reportValidity();
      const firstInvalid = form.querySelector(':invalid');
      (firstInvalid || (!hasEmail && email) || preferredRadios[0])?.focus({ preventScroll: true });
      document.getElementById('interest-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return valid;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    status.textContent = '';
    status.className = 'form-status';

    if (!validate()) return;

    const endpoint = (window.INTEREST_FORM_ENDPOINT || '').trim();
    if (!endpoint) {
      status.textContent = 'The form is ready, but the Google Sheets submission endpoint has not been connected yet.';
      status.classList.add('error');
      return;
    }

    form.action = endpoint;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    status.textContent = 'Sending your information...';
    status.classList.add('info');

    // Native form submission to a hidden iframe avoids cross-origin fetch/CORS
    // issues with Google Apps Script while keeping the visitor on this page.
    HTMLFormElement.prototype.submit.call(form);

    window.setTimeout(() => {
      form.hidden = true;
      successPanel.hidden = false;
      successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      form.reset();
      updatePreferredChoices();
      submitButton.disabled = false;
      submitButton.textContent = 'Send My Information';
    }, 950);
  });
})();

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

function setMenuState(open) {
  if (!menuButton || !nav) return;

  nav.classList.toggle('open', open);
  menuButton.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.classList.toggle('mobile-nav-open', open);
}

menuButton?.addEventListener('click', () => {
  setMenuState(!nav.classList.contains('open'));
});

nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenuState(false));
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setMenuState(false);
});

document.addEventListener('click', event => {
  if (!nav?.classList.contains('open')) return;
  if (nav.contains(event.target) || menuButton?.contains(event.target)) return;
  setMenuState(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 800) setMenuState(false);
});

const parentPopout = document.getElementById('parent-popout');
const parentClose = document.querySelector('.parent-close');
const notNow = document.querySelector('.not-now');
const dontShowAgain = document.getElementById('parent-dont-show');
const parentPromptCookie = 'tczk_parent_prompt_hidden';

function getCookie(name) {
  return document.cookie.split('; ').some(row => row === `${name}=1`);
}

function savePermanentPreference() {
  if (!dontShowAgain?.checked) return;
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${parentPromptCookie}=1; Max-Age=31536000; Path=/; Domain=.tczk.org; SameSite=Lax${secure}`;
}

function hideParentPrompt() {
  savePermanentPreference();
  parentPopout?.classList.remove('visible');
  // If "Don't show again" is not checked, suppress only for this browser tab/session.
  if (!dontShowAgain?.checked) {
    try { sessionStorage.setItem('zk-parent-prompt-dismissed', '1'); } catch (_) {}
  }
}

let dismissed = getCookie(parentPromptCookie);
if (!dismissed) {
  try { dismissed = sessionStorage.getItem('zk-parent-prompt-dismissed') === '1'; } catch (_) {}
}

if (!dismissed) {
  window.setTimeout(() => parentPopout?.classList.add('visible'), 700);
}

parentClose?.addEventListener('click', hideParentPrompt);
notNow?.addEventListener('click', hideParentPrompt);


// Contact email buttons: keep normal mailto behavior on touch/mobile devices,
// but provide a reliable copy-to-clipboard fallback on desktop browsers where
// mailto protocol handling is often not configured.
const contactEmailButtons = document.querySelectorAll('.contact-email-button[data-email]');
const desktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)');

async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Copy command failed');
}

contactEmailButtons.forEach(button => {
  button.addEventListener('click', async event => {
    // Phones/tablets retain the native mail app behavior.
    if (!desktopPointer.matches) return;

    event.preventDefault();

    const email = button.dataset.email;
    const originalLabel = button.dataset.label || button.textContent.trim();

    try {
      await copyTextToClipboard(email);
      button.textContent = 'Email copied!';
      button.setAttribute('title', `${email} copied to clipboard`);
    } catch (_) {
      // If clipboard access is unavailable, expose the address directly.
      button.textContent = email;
      button.setAttribute('title', 'Copy this email address');
    }

    window.setTimeout(() => {
      button.textContent = originalLabel;
      button.removeAttribute('title');
    }, 2200);
  });
});

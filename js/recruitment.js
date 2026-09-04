const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

menuButton?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const parentPopout = document.getElementById('parent-popout');
const parentClose = document.querySelector('.parent-close');
const notNow = document.querySelector('.not-now');

function hideParentPrompt() {
  parentPopout?.classList.remove('visible');
  try {
    sessionStorage.setItem('zk-parent-prompt-dismissed', '1');
  } catch (_) {}
}

let dismissed = false;
try {
  dismissed = sessionStorage.getItem('zk-parent-prompt-dismissed') === '1';
} catch (_) {}

if (!dismissed) {
  window.setTimeout(() => parentPopout?.classList.add('visible'), 700);
}

parentClose?.addEventListener('click', hideParentPrompt);
notNow?.addEventListener('click', hideParentPrompt);

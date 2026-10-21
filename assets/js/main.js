// Site behaviour. Every feature degrades to plain HTML without JavaScript:
// navigation is real links, the contents box is a <details>, share links are
// ordinary URLs. Only search and copy-link need script.
import { initSearch } from './search.js';
import { initToc } from './toc.js';

const root = document.documentElement;

// Theme ----------------------------------------------------------------------
// The saved choice is applied in <head> before paint; this only handles the
// toggle. With no saved choice the OS preference applies (pure CSS).
function currentTheme() {
  if (root.dataset.theme) return root.dataset.theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function initTheme() {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;
  const label = () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', `Switch to ${next} theme`);
  };
  label();
  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
    label();
  });
}

// Mobile menu ----------------------------------------------------------------
function initMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const panel = document.getElementById('mobile-nav');
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
    if (open) panel.querySelector('a')?.focus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  // Close if the viewport grows past the breakpoint where the panel is hidden.
  window.matchMedia('(min-width: 64em)').addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

// Copy link ------------------------------------------------------------------
function initCopyLink() {
  document.querySelectorAll('[data-copy-link]').forEach((button) => {
    if (!navigator.clipboard) return;
    const wrap = button.closest('[data-copy-wrap]');
    if (wrap) wrap.hidden = false;
    const status = button.closest('.share')?.querySelector('.share__status');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copyLink);
        button.setAttribute('data-copied', '');
        if (status) status.textContent = 'Link copied';
        setTimeout(() => {
          button.removeAttribute('data-copied');
          if (status) status.textContent = '';
        }, 2400);
      } catch (e) {
        if (status) status.textContent = 'Couldn’t copy — select the address bar instead';
      }
    });
  });
}

initTheme();
initMenu();
initSearch();
initToc();
initCopyLink();

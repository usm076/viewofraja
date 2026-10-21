// Contents rail: marks the section currently being read. Purely a reading
// aid — the links work without it.
export function initToc() {
  const nav = document.querySelector('.article-rail .toc');
  if (!nav) return;

  const pairs = [];
  nav.querySelectorAll('a[href^="#"]').forEach((a) => {
    const target = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    if (target) pairs.push([target, a]);
  });
  if (!pairs.length) return;

  let current = null;
  let queued = false;

  const update = () => {
    queued = false;
    // The active section is the last heading above the top third of the viewport.
    const line = window.innerHeight * 0.3;
    let active = null;
    for (const [heading, link] of pairs) {
      if (heading.getBoundingClientRect().top < line) active = link;
      else break;
    }
    if (active === current) return;
    current?.removeAttribute('aria-current');
    active?.setAttribute('aria-current', 'true');
    current = active;
  };

  window.addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

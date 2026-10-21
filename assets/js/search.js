// Client-side search over /index.json. The site has a few dozen articles, so
// a small weighted scorer beats shipping a search library: titles count most,
// then topics, then the summary, then body text. Every query word must match
// somewhere for an article to appear.

const MAX_RESULTS = 12;
let index = null;
let loading = null;

function normalise(s) {
  return (s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
}

function load(url) {
  if (index) return Promise.resolve(index);
  if (!loading) {
    loading = fetch(url)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((docs) => {
        index = docs.map((d) => ({
          ...d,
          _title: normalise(d.title),
          _topics: normalise([d.category, ...(d.tags || [])].join(' ')),
          _summary: normalise(d.summary),
          _content: normalise(d.content),
        }));
        return index;
      })
      .catch((e) => { loading = null; throw e; });
  }
  return loading;
}

function score(doc, terms) {
  let total = 0;
  for (const t of terms) {
    let s = 0;
    if (doc._title.includes(t)) s += doc._title.split(/\W+/).includes(t) ? 12 : 8;
    if (doc._topics.includes(t)) s += 5;
    if (doc._summary.includes(t)) s += 3;
    if (doc._content.includes(t)) s += 1;
    if (!s) return 0;
    total += s;
  }
  return total + (doc.section === 'Articles' ? 0.5 : 0);
}

function escapeHTML(s) {
  return (s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// One pass over the raw text with all terms, escaping as we go, so a term can
// never match inside markup added for an earlier one.
function highlight(text, terms) {
  const usable = terms.filter((t) => t.length > 1).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!usable.length) return escapeHTML(text);
  const re = new RegExp(`(${usable.join('|')})`, 'gi');
  return (text || '').split(re).map((part, i) => (i % 2 ? `<mark>${escapeHTML(part)}</mark>` : escapeHTML(part))).join('');
}

export function initSearch() {
  const dialog = document.getElementById('search-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') {
    document.querySelectorAll('[data-search-open]').forEach((b) => { b.hidden = true; });
    return;
  }

  const input = dialog.querySelector('#search-input');
  const list = dialog.querySelector('#search-results');
  const status = dialog.querySelector('[data-search-status]');
  const hint = dialog.querySelector('[data-search-hint]');
  let lastTrigger = null;
  let selected = -1;

  const select = (i) => {
    const items = [...list.querySelectorAll('a')];
    items.forEach((a, n) => a.setAttribute('aria-selected', String(n === i)));
    selected = i;
    if (items[i]) {
      input.setAttribute('aria-activedescendant', items[i].id);
      items[i].scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };

  const render = async () => {
    const query = input.value.trim();
    const terms = normalise(query).split(/\s+/).filter(Boolean);
    hint.hidden = terms.length > 0;
    if (!terms.length) {
      list.innerHTML = '';
      status.textContent = '';
      input.setAttribute('aria-expanded', 'false');
      return;
    }
    let docs;
    try {
      docs = await load(dialog.dataset.index);
    } catch (e) {
      status.textContent = 'Search is unavailable right now. Please try again in a moment.';
      return;
    }
    if (input.value.trim() !== query) return; // a newer query is already running

    const results = docs
      .map((d) => ({ d, s: score(d, terms) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, MAX_RESULTS);

    list.innerHTML = results.map(({ d }, i) => `
      <li role="presentation"><a id="search-result-${i}" role="option" aria-selected="false" href="${escapeHTML(d.permalink)}">
        ${d.category ? `<span class="kicker">${escapeHTML(d.category)}</span>` : ''}
        <span class="search-results__title">${highlight(d.title, terms)}</span>
        ${d.summary ? `<span class="search-results__summary">${highlight(d.summary, terms)}</span>` : ''}
      </a></li>`).join('');

    input.setAttribute('aria-expanded', String(results.length > 0));
    status.textContent = results.length
      ? `${results.length === MAX_RESULTS ? 'Top ' : ''}${results.length} result${results.length === 1 ? '' : 's'} for “${query}”`
      : `No articles match “${query}”. Try a broader word, such as “savings” or “bitcoin”.`;
    select(results.length ? 0 : -1);
  };

  let timer;
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(render, 80); });

  input.addEventListener('keydown', (e) => {
    const count = list.querySelectorAll('a').length;
    if (e.key === 'ArrowDown' && count) { e.preventDefault(); select((selected + 1) % count); }
    else if (e.key === 'ArrowUp' && count) { e.preventDefault(); select((selected - 1 + count) % count); }
    // A search input swallows the first Escape to clear itself; close instead.
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Enter') {
      const a = list.querySelectorAll('a')[selected];
      if (a) { e.preventDefault(); window.location.href = a.href; }
    }
  });

  const open = (trigger) => {
    lastTrigger = trigger || document.activeElement;
    dialog.showModal();
    input.focus();
    input.select();
    load(dialog.dataset.index).catch(() => {});
  };
  const close = () => dialog.close();

  dialog.addEventListener('close', () => { lastTrigger?.focus?.(); });
  // Click on the backdrop closes the dialog.
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  dialog.querySelector('[data-search-close]').addEventListener('click', close);

  document.querySelectorAll('[data-search-open]').forEach((b) => b.addEventListener('click', () => open(b)));

  document.addEventListener('keydown', (e) => {
    if (dialog.open) return;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
    if ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      open();
    }
  });
}

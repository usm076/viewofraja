# Finance with Raja — financewithraja.com

Personal finance guides and analysis, built with [Hugo](https://gohugo.io) and
deployed to GitHub Pages. Articles are Markdown files in `content/posts/`,
edited by hand or through [Pages CMS](https://app.pagescms.org) (see
[EDITOR-GUIDE.md](EDITOR-GUIDE.md)).

There is no theme and no Node toolchain: every template, style and script is in
this repository, and Hugo alone builds the site.

## Local development

Requires **Hugo extended 0.150.0** (the version CI uses — `brew install hugo`
on macOS, or a release from GitHub).

```sh
hugo server            # http://localhost:1313, live reload, includes drafts with -D
hugo --gc --minify     # production build into public/
```

`hugo server` sets the base URL to localhost automatically. If you serve a
built `public/` folder some other way, build with
`--baseURL http://localhost:PORT/` — the site canonicalises URLs, so a normal
build points every asset at financewithraja.com.

## Deployment

Pushing to `main` runs `.github/workflows/hugo.yml`, which builds with Hugo and
publishes to GitHub Pages. It also runs daily at 05:00 UTC so future-dated
(scheduled) articles go live on their date. **Settings → Pages → Source must
stay on "GitHub Actions"** (see the outage note at the end of the editor guide).

## How the site is put together

```
config/_default/
  hugo.toml        site config: URLs, taxonomies, outputs, module mounts
  params.toml      brand, homepage composition, article options, author identity
  menus.en.toml    primary navigation and footer links
  languages.en.toml
content/           Markdown: posts/, about, contact, calculators, legal pages
data/categories.yaml   one-line descriptions shown on category pages
layouts/
  baseof.html      page shell
  home.html        front page (composed from articles; see [home] in params)
  posts/page.html  article
  page.html        standalone pages (About, Contact, Calculators…)
  section.html     /posts/ archive    term.html  one category/tag
  taxonomy.html    /categories/, /tags/          404.html
  home.json        search index (/index.json)    rss.xml  sitemap.xml  robots.txt
  _partials/       header, footer, story teasers, SEO (meta, social cards, schema)
  _markup/         Markdown render hooks: headings, links, images, tables,
                   calculations, quotes/callouts
  _shortcodes/     calculators, ad-break, credit-card, button
assets/
  css/             design system — tokens.css first, then base, layout,
                   components, article, home, pages (bundled in that order)
  js/              main.js (theme, menu, copy link) + search.js + toc.js;
                   calculators.js loads only on pages with a calculator
  fonts/           TTFs used to draw social cards at build time
  img/             brand mark, wordmark, social card template
static/            served as-is: favicons, fonts, ads.txt, CNAME, CMS uploads (images/)
```

### Design system

All colours, type sizes, spacing and layout widths are CSS custom properties in
`assets/css/tokens.css`, with a dark theme that follows the reader's OS and a
toggle that remembers their choice. Components use those tokens only — change a
token, not a component, to restyle the site.

Typefaces are self-hosted: **Newsreader** (headlines) and **IBM Plex Sans**
(body and interface), subset to Latin, SIL Open Font License.

### SEO behaviour worth knowing

- Article URLs are `/posts/<slug>/`, from each post's `slug`. Never change a
  published slug; if one must change, add the old path under `aliases:` in the
  post's front matter (GitHub Pages can't send real 301s, so Hugo emits a
  canonical + instant-refresh page instead).
- Tag and category archives are `noindex, follow` and left out of the sitemap,
  on Search Console evidence (`layouts/_partials/seo/robots.html`).
- Each article gets a social card generated from its headline at build time,
  unless it has a `featured_image`.
- Structured data: Organization (every page), WebSite (home), Article +
  BreadcrumbList (articles), Person (About). The author identity comes from
  `[author]` in `params.toml` — keep it factual.

### Search

`/index.json` lists every article and page. `assets/js/search.js` fetches it
the first time someone opens search (button, `/`, or Ctrl/⌘-K) and scores
results in the browser. No external service.

### Ads

Google AdSense Auto ads, loaded in `layouts/_partials/head/ads.html`. The
publisher ID is `adsenseClient` in `params.toml` and must match `static/ads.txt`.

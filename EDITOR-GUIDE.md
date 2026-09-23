# Publishing Guide — financewithraja.com

Everything you need to write, edit and publish articles. You never need to
install anything; it all happens in your web browser.

---

## One-time setup

1. Create a free account at **github.com** if you don't already have one.
   You will never need to use this site — it only stores the articles. Tell
   the site owner your username so they can give you access.
2. Go to **app.pagescms.org** and click **Sign in with GitHub**.
3. Approve the access request, then choose the **viewofraja** site.

You now have the editor. Bookmark app.pagescms.org — this is the only address
you need from here on.

---

## Writing a new article

1. Open **app.pagescms.org** and click **Articles** in the left sidebar.
2. Click **Add an entry** (top right).
3. Fill in the form:

| Field | What to put |
|---|---|
| **Headline** | The title readers and Google see. Aim for 50–60 characters so Google doesn't cut it off. |
| **Web address** | A short version of the headline in lowercase with dashes instead of spaces — for example `best-credit-cards-2026`. |
| **Publish date** | Today's date, or a future date to schedule it (see below). |
| **Last updated** | Leave empty for new articles. |
| **Search summary** | The grey text under the headline in Google results. 120–160 characters. Write it as a reason to click. |
| **Categories** | Pick 1–3 from the list. |
| **Tags** | The specific topics covered, e.g. `Bitcoin ETF`, `emergency fund`. Add one per box. |
| **Author** | Leave as is. |
| **Draft** | Leave ticked while you are still writing. |
| **Article** | The article itself. |

4. Write the article in the big **Article** box. Use the toolbar for bold,
   italics, headings, bullet lists and links — exactly like a word processor.
5. Click **Save**.

### How to structure an article

Look at any existing article for the pattern. In short:

- Open with 2–3 short paragraphs saying what the reader will get.
- Break the article into sections with **Heading 2**.
- Use **Heading 3** for sub-points inside a section.
- Use bullet lists and bold for figures and key numbers — readers skim.
- Close with a short summary or a "what to do next" section.

Headings are not decoration: they build the contents box that appears on every
article, and Google reads them. Use them in order — don't jump from Heading 2
to Heading 4.

---

## Publishing

An article is invisible to the public while **Draft** is ticked. To publish:

1. Untick **Draft**.
2. Click **Save**.
3. Wait about **two minutes**, then check the live site.

That's it. There is no separate "deploy" step.

### Scheduling an article for later

Set the **Publish date** to a future date and untick **Draft**. The article
stays hidden and appears by itself on that date. The site checks once a day,
early morning UK time, so allow until mid-morning on the day.

---

## Editing an article that is already live

1. Click **Articles**, find it in the list, click it.
2. Make your changes.
3. Set **Last updated** to today — this tells readers and Google the article
   has been refreshed, which helps older articles keep ranking.
4. Click **Save**.

---

## Four rules worth following

**1. Never change the Web address of a published article.**
It is the article's permanent link. Changing it breaks every link pointing at
it and throws away its Google ranking. Change the headline freely — just leave
the web address alone.

**2. Don't invent new categories.**
The category list is deliberately fixed. Adding a new one creates a nearly
empty page that makes the whole site look thinner to Google. If you genuinely
need a new category, ask the site owner to add it.

**3. Reuse existing tag wording.**
`emergency fund`, `Emergency Fund` and `emergency-funds` become three separate
things. Before adding a tag, check how existing articles have worded it.

**4. Write the summary for a stranger.**
The search summary is often the only thing someone reads before deciding
whether to click. Say what they'll learn, not what the article "covers".

---

## If something goes wrong

**I saved but the site hasn't changed.**
Give it three minutes and refresh. Still nothing? Check that **Draft** is
unticked and the publish date isn't in the future. If both look right, the
automatic publishing step may have failed — contact the site owner, who gets
an email when this happens.

**The editor won't let me save.**
A required field is empty, or the web address has characters it doesn't
accept. Web addresses can only contain lowercase letters, numbers and dashes.

**I deleted something by mistake.**
Nothing is ever really lost — every version is kept automatically. Contact the
site owner and it can be restored.

---

## Contact

Site owner: _________________________

Add the email here before handover.

---

## If the whole site shows "404 — File not found"

This happened on 23 September 2026 and took the entire site down. It is not
caused by anything you write, and nothing you publish can break the site this
way — so do not go looking for a bad article.

**Cause.** GitHub Pages can publish a site in two different ways, and this repo
must use one of them:

- **GitHub Actions** — correct. Hugo turns the Markdown into a website and
  publishes that.
- **Deploy from a branch** — wrong. It publishes the raw repository, which has
  no `index.html` at the top level, so every address returns 404.

If someone opens the repository **Settings → Pages** and switches the source to
*Deploy from a branch*, the site goes blank within a minute or two.

**Fix.** In the repository, go to **Settings → Pages → Build and deployment →
Source** and set it back to **GitHub Actions**. Then open the **Actions** tab,
pick *Deploy Hugo site to Pages*, and click **Run workflow**. The site returns
in one to two minutes.

**So don't:** change anything under Settings → Pages. Writing and publishing
articles through app.pagescms.org never requires touching that screen.

---

## The Author field

New articles default to **Raja**. Leave it that way unless a different real
person actually wrote the piece.

This matters more here than on an ordinary blog. Personal finance is what
Google calls YMYL — "Your Money or Your Life" — content, and it is judged
against the strictest standards for who is behind the advice. Every article
tells Google, in machine-readable form, that Raja wrote it and links to his
page on /about/.

Never put a made-up name or a job title nobody holds in this field. Google's
reviewers check whether authors are real people, and an invented author or
qualification puts the site's AdSense approval at risk.

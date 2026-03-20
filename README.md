# Neural Overflow Digest

> *Where bits meet consciousness*

A retro BBS-style e-zine by **HeX**. Pure static HTML — no frameworks, no build step. Read issues directly in your browser.

## Live Site

Coming soon on Netlify.

## Adding a New Issue

1. Write your issue as a plain `.txt` file
2. Name it: `issue-{NNN}-{slug}_{LANG}.txt` (e.g., `issue-001-freedom_ES.txt`)
3. Drop it in `issues/`
4. Add an entry to `issues/index.json`
5. `git push` — Netlify auto-deploys

## Issue Naming

- `NNN` = 3-digit zero-padded number
- `slug` = one-word codename (lowercase)
- `LANG` = `EN` or `ES`

## Local Development

The site uses `fetch()` to load issues, so you need a local server (opening `index.html` directly as `file://` won't work).

**Python (built-in on macOS):**
```bash
cd neural-overflow-digest
python3 -m http.server 8000
# Open http://localhost:8000
```

**Node.js (if installed):**
```bash
npx serve .
# Open http://localhost:3000
```

**PHP (if installed):**
```bash
php -S localhost:8000
```

To test mobile layout, open Chrome DevTools (`Cmd+Option+I`) → toggle device toolbar (`Cmd+Shift+M`).

## Stack

- HTML + CSS + vanilla JS
- Zero dependencies
- Hosted on Netlify (free tier)

## License

MIT

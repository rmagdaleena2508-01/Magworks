# Magworks — Magdaleena's portfolio

A dark, single-page portfolio for an AI engineer. Static site — no build step,
just `index.html` + `contact.html` + `assets/` (HTML, CSS, and vanilla JS).

**Live:** https://rmagdaleena2508-01.github.io/Magworks/
**vercel:** https://magworks.vercel.app/

## Run locally

```bash
python3 -m http.server 5180
# → http://localhost:5180
```

Or open `index.html` directly in a browser.

## Sections

Hero banner (seamless looping pixel-art clip) → profile (rotating title, live
view counter, avatar toggle) → About → Contact → Projects → Tech Stack
(hover-to-play sounds) → GitHub activity → Highlights (testimonials) →
Achievements → "Still Scrolling?" CTA → footer quote.

## Notes

- **Contact form** (`contact.html`) delivers to email via Web3Forms.
- **View counter** is a real cross-visitor count via CounterAPI.
- **Theme** defaults to dark; toggle in the nav (with a soft click sound).
- Content lives in the data arrays near the bottom of `index.html`
  (`PROJECTS`, `STACK`, `TESTIMONIALS`, `CHANNELS`).

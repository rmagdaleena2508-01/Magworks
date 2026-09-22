# Magworks — Magdaleena's Portfolio

A dark, single-page portfolio for an AI / frontend engineer. It is a **static site with no build step** — just plain HTML, CSS, and vanilla JavaScript plus a few files in `assets/`. Everything server-like (contact form, view counter, GitHub graph) is handled by free third-party APIs called from the browser.

- **Live (GitHub Pages):** https://rmagdaleena2508-01.github.io/Magworks/
- **Live (Vercel):** https://magworks.vercel.app/

---

## Run locally

```bash
python3 -m http.server 5180
# → http://localhost:5180
```

Or open `index.html` directly in a browser.

---

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — hero, profile, about, projects, tech stack, GitHub activity, highlights, achievements, CTA, footer |
| `writing.html` | Blog / writing list (technical notes + tips for college and internships) |
| `contact.html` | Contact form (message box + prompt chips) that delivers straight to email |

The site content lives in data arrays near the bottom of `index.html` (`PROJECTS`, `STACK`, `TESTIMONIALS`, `CHANNELS`, `ICONS`), so updating a project, skill, or testimonial is a one-line change.

---

## What we changed (and why)

The portfolio started as a plain static page. Over the course of development it grew into a polished, interactive site. The main changes:

### Layout & design
- **Design language** modeled on a clean "dashboard/blueprint" style — a centered 800px column framed by dashed rules, an editorial serif for headings (Instrument Serif) paired with Inter for body text.
- **Hero banner** — a pixel-art Golden Gate Bridge clip, muted and auto-looping. *Why:* a static banner felt flat; the loop was re-encoded (crossfade) so it repeats seamlessly, the Sora watermark was removed, and it's centered/contained so it scales cleanly on phones without cropping.

### Projects section
- Turned the project grid into a **horizontal snap-scroll of vertical (portrait) cards**. *Why:* it shows more work in less vertical space and feels more app-like.
- Each card uses a **project screenshot on a gradient**, with images scaled to fill the card and an even gradient border around them for a framed look.
- Projects: CubeSight, CSI SRMIST VDP, Financial Advisory Agents, ProblemBase — each with a one-line summary, live/repo links, and tech tags.

### Profile & interactions
- **Rotating job title** (AI Frontend Engineer / Software Engineer / Multi-Agent Systems Builder) with per-role dwell timing.
- **Avatar toggle** — a small day/night circle that swaps between an illustration and a real photo.
- **Live view counter** next to the name.

### Theme toggle
- Rebuilt the light/dark toggle to use the **View Transitions API** for a smooth single-corner circular reveal that fills the page (GPU-composited, no latency), with a sun/moon icon morph. *Why:* the plain instant flip felt abrupt; the reveal is smooth and works across all pages. Falls back to an instant toggle where unsupported or when reduced-motion is set. The site **always opens in dark mode** by default.

### Sound design
- Subtle **sound effects**: a xylophone note on each tech-stack pill (hover on desktop, tap on mobile), a soft "pop" on the theme toggle, and a knock on the avatar toggle.
- *Why the rewrites:* sounds are synthesized live with the **Web Audio API** for near-zero latency. To keep them audible on iOS even with the ring/silent switch on, a short silent looping media element flips the audio session to "playback" on first touch.

### Motion & effects
- **Mobile navigation — paper fold.** *What:* the mobile menu (the ☰ button) opens and closes with a vertical "paper-fold" animation instead of an abrupt show/hide. *Where:* the `.mnav` panel and its links in the injected `mnavStyle` block plus a small JS controller in each page's script (`index.html`, `contact.html`, `writing.html`). *How:* the panel is a `rotateX(-90deg → 0)` fold from a top `transform-origin` with `perspective` on the header; the links unfold in a staggered sequence. Open folds top→bottom (ascending `transition-delay`); close folds bottom→top (a `.closing` class with reversed delays). Height is driven to the exact `scrollHeight` in JS so there is no max-height overshoot. The menu itself is a **grey-black liquid-glass** surface (translucent background + `backdrop-filter: blur() saturate()`, hairline border, inset highlight).
- **Progressive scroll blur.** *What:* content blurs gradually as it passes behind the fixed nav at the top edge, on both laptop and mobile. *Where:* the `.scroll-blur` fixed overlay at the top of `<body>` in each page, styled in the same `<style>` block. *How:* the overlay stacks six layers, every layer a full-width `backdrop-filter: blur()` with an increasing blur (1 → 28px) and a `mask-image` linear-gradient that reveals a progressively smaller band toward the top edge — the overlapping masked layers add up to a smooth progressive (graduated) blur rather than a single hard blur.
- **Always land on the hero.** *What:* every visit and reload starts at the top (hero), regardless of where a previous visitor scrolled. *Where:* the inline script in `index.html`'s `<head>`. *How:* `history.scrollRestoration = 'manual'` disables the browser's scroll restore, and `scrollTo(0,0)` is forced on `DOMContentLoaded`, `load`, and `pageshow` (the last covers the back/forward bfcache).

### Content sections
- **Tech Stack** — filterable pills (All / Frontend / Backend / AI & Agents / Tools) with brand icons; a few icons are inlined as SVG (`currentColor`) so they stay visible in both themes.
- **GitHub Activity** — a real contribution heatmap rendered client-side using GitHub's exact green scale.
- **Highlights** — an auto-scrolling testimonial marquee; clicking the arrows stops it and snaps one card centered, then auto-resumes after a few seconds. Each card links to the person's LinkedIn to let visitors verify it.
- **Writing** page added for technical posts.
- **Contact** page with a two-box form (purpose + details) that delivers to email.

### Reliability fixes
- **View counter** was migrated off a deprecated service (it was showing `NaN` on mobile) to a single shared cross-device counter, with a guard so it never renders `NaN`.
- **Mobile banner** hardened for reliable muted inline autoplay (no play-button overlay).

---

## Frameworks, tools & libraries — by part

This is a **no-framework** site by design (fast, zero build, easy to host anywhere). The "stack" is mostly the browser platform plus a few external APIs.

### Frontend (the page itself)
| Part | What's used |
|------|-------------|
| Markup / styling | Plain **HTML** + **CSS** (CSS custom properties for theming, dashed-grid layout, responsive at phone width) |
| Behavior | **Vanilla JavaScript** (no React/Vue/framework) |
| Fonts | **Google Fonts** — Instrument Serif (display), Inter (body), JetBrains Mono (labels/numbers) |
| Icons | Inline **SVG** (Lucide-style sun/moon, brand marks) + **Simple Icons** CDN for tech logos |
| Theme transition | **View Transitions API** (native browser) for the circular reveal |
| Mobile nav fold | CSS **3D transforms** (`rotateX` + `perspective`) with staggered `transition-delay`; small vanilla-JS controller for the fold-close and exact height |
| Progressive blur | Stacked **`backdrop-filter: blur()`** layers with `mask-image` gradients (top edge, under the nav) |
| Scroll-to-hero | Native **`history.scrollRestoration`** + `scrollTo` on load/`pageshow` |
| Sound | **Web Audio API** (native) — sounds synthesized live |
| Hero banner | Pre-rendered looping **MP4** in `assets/` |

### "Backend" (there is no server — external APIs called from the browser)
| Feature | Service |
|---------|---------|
| Contact form delivery | **Web3Forms** |
| Live view counter | **Abacus** (shared cross-device counter) |
| GitHub contribution data | **GitHub contributions API** |

### Tooling (used during development, not shipped)
| Tool | Used for |
|------|----------|
| **ImageMagick** | Cutting out / rounding image corners, resizing, optimizing thumbnails |
| **ffmpeg** | Re-encoding the hero banner into a seamless muted loop, removing the watermark |
| **Git / GitHub** | Version control and hosting |

### Deployment
- **GitHub** repository → served by **GitHub Pages** and **Vercel** (Vercel auto-deploys on every push).
- The site is fully static, so both hosts serve the same files. All links are relative, so it works at both the GitHub Pages subpath and the Vercel root.

---

## Editing content

Open `index.html` and edit the data arrays near the bottom:

- `PROJECTS` — project cards (title, one-liner, tags, image, gradient, live/repo links)
- `STACK` — tech-stack pills grouped by category
- `TESTIMONIALS` — highlight cards (name, role, quote, LinkedIn)
- `CHANNELS` — contact/social links
- `ICONS` — inline SVG icons for techs whose logo needs to stay theme-visible

Assets (avatar, project thumbnails, banner) live in `assets/`.

> **Note:** the Web3Forms access key and the contact email are intentionally public — Web3Forms keys are meant to live in client-side code and only route mail to the configured address.

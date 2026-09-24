# Magworks — Magdaleena's Portfolio

A dark, single-page portfolio for an AI / frontend engineer. It is a **static site with no build step** — just plain HTML, CSS, and vanilla JavaScript plus a few files in `assets/`. Everything server-like (contact form, GitHub graph) is handled by free third-party APIs called from the browser.

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
- **Job title** — a single, clear title ("Software Engineer") under the name.
- **Avatar** — one illustrated profile image (the old photo-swap toggle and the extra photo were removed to keep it simple).
- **"Now" strip** — one short line under the profile that says what Magdaleena is doing right now (interning, building, learning). It is meant to be edited about once a month.

### Theme toggle
- Rebuilt the light/dark toggle to use the **View Transitions API** for a smooth single-corner circular reveal that fills the page (GPU-composited, no latency), with a sun/moon icon morph. *Why:* the plain instant flip felt abrupt; the reveal is smooth and works across all pages. Falls back to an instant toggle where unsupported or when reduced-motion is set. The site **always opens in dark mode** by default.

### Sound design
- A soft "pop" plays on the theme toggle, made live with the **Web Audio API**. (The tech-stack pills used to play a note too — that was swapped for a helpful tooltip instead, see below.)

### Motion & effects
- **Mobile navigation — paper fold.** *What:* the mobile menu (the ☰ button) opens and closes with a vertical "paper-fold" animation instead of an abrupt show/hide. *Where:* the `.mnav` panel and its links in the injected `mnavStyle` block plus a small JS controller in each page's script (`index.html`, `contact.html`, `writing.html`). *How:* the panel is a `rotateX(-90deg → 0)` fold from a top `transform-origin` with `perspective` on the header; the links unfold in a staggered sequence. Open folds top→bottom (ascending `transition-delay`); close folds bottom→top (a `.closing` class with reversed delays). Height is driven to the exact `scrollHeight` in JS so there is no max-height overshoot. The menu itself is a **grey-black liquid-glass** surface (translucent background + `backdrop-filter: blur() saturate()`, hairline border, inset highlight).
- **Progressive scroll blur.** *What:* content blurs gradually as it passes behind the fixed nav at the top edge, on both laptop and mobile. *Where:* the `.scroll-blur` fixed overlay at the top of `<body>` in each page, styled in the same `<style>` block. *How:* the overlay stacks six layers, every layer a full-width `backdrop-filter: blur()` with an increasing blur (1 → 28px) and a `mask-image` linear-gradient that reveals a progressively smaller band toward the top edge — the overlapping masked layers add up to a smooth progressive (graduated) blur rather than a single hard blur.
- **Always land on the hero.** *What:* every visit and reload starts at the top (hero), regardless of where a previous visitor scrolled. *Where:* the inline script in `index.html`'s `<head>`. *How:* `history.scrollRestoration = 'manual'` disables the browser's scroll restore, and `scrollTo(0,0)` is forced on `DOMContentLoaded`, `load`, and `pageshow` (the last covers the back/forward bfcache).

### What makes it interactive (in plain words)

The page used to just sit there. We added small things that answer back when you move, scroll, or type — so it feels alive without being noisy or playing sound. Here is each one, why we added it, how it works, and the idea behind it.

- **A gentle intro instead of a hard cut.** *Why:* jumping straight to the hero image the moment the page opened felt abrupt. *How:* the page opens on a plain black screen. A first line, in the site's serif font, **types itself out** in two beats at a human pace — it writes "Welcome", pauses, then finishes "…to my corner of the internet!" — then fades and lifts up. A second line rises from the bottom into the same spot with a short, friendly note. Then the hero is uncovered with a pixelated top-to-bottom reveal **chosen by device**: on a **laptop**, a **glass** reveal (a `backdrop-filter: blur()` sheet plus a drawn smoked-glass tile canvas, so you see the hero through blurred glass tiles); on a **phone**, a plain **black** pixel dissolve. Both clear top-first, each block/tile fading over a soft window on a slow **GSAP** `sine.inOut` tween (~2.9s, easy on the eyes), and the covering frame is drawn **synchronously before** the black backdrop is handed off, so the hero never flashes first. *No-blink typing:* every character of line 1 is laid out (hidden) up front, so the browser fixes the line wrap once; typing only flips characters visible, so the line never reflows or re-wraps — the "internet" word no longer blinks as it moves to a second line on mobile. *Skip still shows the transition:* the "skip intro" button (and any key) jumps past the text but **still plays the dissolve** before the hero, rather than cutting straight to it. The intro plays on every load/reload, and it is turned off entirely for people who ask for less motion. *Idea we followed:* ease people in, but never trap them behind it.
- **A "Now" line under the photo.** *Why:* it shows the person is busy and real right now, not frozen in time. *How:* it is one line of text in the page that you edit by hand every month. A tiny green dot next to it gently blinks. *Idea we followed:* small, honest, and easy to keep fresh.
- **Tech pills that explain themselves.** *Why:* a logo alone does not tell you how much someone really used a tool. *How:* on a laptop you **hover** a tool; on a phone you **tap** it (the little hint under the heading changes to say which). A card pops up naming the real projects on this page that use that tool, with a tiny bar for "used in 2 of 4 projects." It is one shared card that is positioned by code so it **always stays inside the screen** — it never runs off the left or right edge, and if there is no room above the pill it flips below. We build the card from the true project list, so it can never lie or brag. *Idea we followed:* reward you with real information, not a sound — and never let it spill off the screen.
- **A cursor spotlight.** *Why:* it makes the page feel warm and alive as you move the mouse. *How:* a soft round glow follows the pointer. It only turns on for real mouse users, and it turns off for phones and for people who ask for less motion. *Idea we followed:* nice to have, never in the way.
- **Cards that tilt and buttons that lean.** *Why:* a small lean toward your mouse makes flat things feel like real objects you can touch. *How:* when the pointer is over a project card, the card tips a few degrees toward it; buttons drift a few pixels toward the pointer, then spring back when you leave. *Idea we followed:* gentle motion, quick to settle, never dizzying.
- **A scroll bar at the very top.** *Why:* it shows how far down the page you are, like a progress bar in a video. *How:* a thin colored line at the top grows wider as you scroll. *Idea we followed:* give people a sense of place.
- **The menu knows where you are (sliding underline).** *Why:* it helps you keep track of which part you are reading, and a line that slides feels smoother than one that blinks on and off. *How:* there is just **one** small blue line under the menu. It is redrawn on every scroll frame, so it **follows your scroll in real time** — as you scroll from one section toward the next, the line slides (and resizes) continuously between the two names and lands exactly under the new one, with no delay or catch-up. The menu order also follows the page order (Home, Contact, Projects, Stack, Writing), so the line always moves in the same direction you are scrolling. On the Contact and Writing pages there is nothing to scroll-track, so the line rests under the page you are on and glides to any menu item you hover, then slides back when you move away. *Idea we followed:* the page should quietly point at itself, with soft motion instead of a snap.
- **A command box (press ⌘K or Ctrl+K).** *Why:* fast people like to jump around with the keyboard, and it makes the site feel like a real tool an engineer built. *How:* press ⌘K (or click the ⌘K button) and a search box opens. Type a few letters to find a section, a page, a link, or "theme," then press Enter to go. Arrow keys move the choice, Esc closes it. *Idea we followed:* one quick door to everything.

**The big design rules behind all of this:** feedback should be *quiet* (never loud or sudden), *honest* (the tooltip only shows true facts), *kind to everyone* (it all turns off for phones and for people who want less motion), and *fast* (nothing lags while you scroll). We removed things that were just for show — the sound on the pills, the photo-swap toggle, and the visitor counter — and kept only the parts that help you or tell you something true.

### Content sections
- **Tech Stack** — filterable pills (All / Frontend / Backend / AI & Agents / Tools) with brand icons; a few icons are inlined as SVG (`currentColor`) so they stay visible in both themes. **Hover a pill (laptop) or tap it (phone) to show a tooltip** with the tech's category and which real projects on the page use it (built from the live `PROJECTS` data, so it is always accurate). The tooltip is a single shared element positioned in JS and clamped to the viewport, so it never overflows the screen edge.
- **GitHub Activity** — a real contribution heatmap rendered client-side using GitHub's exact green scale.
- **Highlights** — an auto-scrolling testimonial marquee; clicking the arrows stops it and snaps one card centered, then auto-resumes after a few seconds. Each card links to the person's LinkedIn to let visitors verify it.
- **Writing** page added for technical posts.
- **Contact** page with a two-box form (purpose + details) that delivers to email.

### Reliability fixes
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
| Command palette (⌘K) | Plain JS overlay — fuzzy substring filter over a list of sections, pages, links, and the theme action; full keyboard control |
| Scroll progress + active nav | `scroll` listener (rAF-throttled) driving a `scaleX` progress bar and one underline positioned per frame — it interpolates `width` + `translateX` between links over a band around each section boundary, so it tracks the scroll continuously with no easing lag. Nav order matches the page's section order. On contact/writing the underline sits under the current page and follows hover |
| Cursor spotlight / tilt / magnetic | `pointermove` + `requestAnimationFrame`, gated to fine-pointer, non-reduced-motion devices |
| Tech tooltips | One shared `position:fixed` card, built from the live `PROJECTS` data; hover on fine pointers, tap-toggle on touch; positioned + clamped to the viewport in JS |
| Sound | **Web Audio API** (native) — a soft pop on the theme toggle |
| Intro animation | **GSAP** (CDN) — character-index typewriter (human pace, no blink) for the two-beat line, slide-in second line, then a pixelated top-to-bottom reveal chosen by device — **glass** on laptop (`backdrop-filter: blur()` + drawn smoked-glass tile canvas), plain **black** dissolve on phones — per-block soft fade, slow `sine.inOut` ~2.9s; covering frame pre-drawn to avoid a hero flash; line-1 height reserved to avoid a mobile typing reflow; plays every load, key/button skip, off for reduced-motion |
| Hero banner | Pre-rendered looping **MP4** in `assets/` |

### "Backend" (there is no server — external APIs called from the browser)
| Feature | Service |
|---------|---------|
| Contact form delivery | **Web3Forms** |
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

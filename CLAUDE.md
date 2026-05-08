# Portfolio — Brooklyn Gibbs

This folder is the home for Brooklyn's personal portfolio website and the projects/case studies it will showcase. The portfolio is positioning her toward a **Creative Director** role, with a focus on social media direction for brands, companies, and (dream target) music artists.

---

## About Brooklyn

- **Based:** Redmond, WA
- **Email:** brooklyngibbs22@gmail.com
- **LinkedIn:** linkedin.com/in/brooklyn-gibbs-6672b0170
- **Education:** B.S. Computer Science, Indiana University (2023)

### Background (one-line version)
Product-minded technologist — Fortune 100 data engineer (Capital One), CEO/co-founder of a consumer mobile gaming startup (Whimbitz), and founder of an 8,000+ subscriber independent media brand (Offline Crush).

### Career Goal: Creative Director
The portfolio exists to land Creative Director work, especially:
- Social media direction for brands, companies, and music artists
- Music rollout strategy / visual identity for artists
- Moodboarding, graphic direction, trend forecasting, and "why" analysis behind cultural moments

### Self-described strengths
- Aesthetics, moodboards, creativity
- Trend prediction — calling trends *before* they land, and articulating *why* they're about to land
- Translating cultural feeling into visual identity
- Cross-functional execution: she can both *design* the vision and *ship* the product (CS background, ships iOS/Android herself)

### Why this combination matters
Her edge isn't "designer who codes" or "engineer with taste" — it's that she's run a real product end-to-end (Whimbitz), built a real audience from zero (Offline Crush, TikTok), and has the technical chops to actually ship anything she pitches. The portfolio should make this hybrid legible to non-technical creative leadership.

---

## Goal of this folder

1. Build a portfolio **website** as the central hub.
2. Build out individual project pages / case studies that link back to it.
3. Treat each existing project (Offline Crush, Whimbitz, TikTok) as a structured case study, not a screenshot dump — show the *strategy*, the *aesthetic decisions*, and the *results*.

The audience reading this site is: creative directors, brand leads, music industry creative teams, recruiters at agencies. Optimize for that audience — not for engineers.

---

## Projects to feature

### 1. Offline Crush — Substack (Nov 2024 – Present)
- **What:** Independent newsletter on internet culture and the indie web.
- **Stats (as of 2026-05-04):** 8,000+ Substack subscribers, 9,000+ followers, zero paid acquisition. Two distinct growth inflections: Sep 2025 (music discovery essay went viral — 22k likes) and Apr 2026 (started a recurring graphic-carousel series of niche-website lists, also driving the parallel TikTok case study).
- **Themes:** intersection of digital culture, personal identity, psychological impact of living "split" between offline and online; the "whimsy movement" — making digital spaces feel magical, cozy, intentional as a counter to doomscrolling and optimization culture.
- **Voice:** informal, often lowercase, highly aesthetic. Mixes traditional essays with Spotify playlists, screenshots, and "fragment" diaries (e.g., moving back home, work burnout).
- **Brand colors:** neon pink `#f92e80`, electric blue `#1f26ce`. (No third brand color — earlier drafts mentioned a purple, but Brooklyn confirmed purple isn't part of the brand. Pink + blue + neutrals only.)
- **Typography:** medieval pixel font as a signature
- **Role on portfolio:** This is the centerpiece of her *personal* brand. The portfolio site itself should feel like a natural extension of Offline Crush's visual world.

### 2. Whimbitz — Mobile gaming app (Nov 2024 – Present)
- **What:** TikTok-style app for AI-generated mini-games (Wordle/Candy Crush/Block Blast genre).
- **Status:** Shipped on iOS (SwiftUI) and Android (Kotlin). Currently in product-market-fit stage; growth phase + ads in progress.
- **Open strategic question:** whether to pivot toward an education app.
- **Aesthetic:** sleek, modern, dark colors with a chartreuse/electric-green highlight accent `#d4ff00`.
- **Characters / brand mascots:**
  - **Whimbleton** — main mascot, **chartreuse**, runs the arcade-style games account.
  - **Professor Whim** — **blue**, runs educational games (lives in the open pivot question).
  - **Lady Whimberly** — **pink**, runs "go girl games" / girl-coded games.
- **Role on portfolio:** demonstrates end-to-end product ownership — strategy, UX, native mobile shipping, brand world-building, and growth ops.

### 3. TikTok — Carousel case study (started ~mid-April 2026)
- **What:** Self-directed TikTok experiment treating SMM as a learning project.
- **Format:** carousels of original graphics — listicles of cool websites (writing tools, music discovery, whimsical "fall into" sites, etc.).
- **Stats as of 2026-04-27:** ~10 days in, 6 posts, 530 followers, 24k likes.
- **Goal:** treat it like a real case study — keep posting, document the playbook, learn the SMM tooling, and turn the run into a portfolio artifact.
- **Role on portfolio:** proves she can execute the *exact* skill set a Creative Director hiring manager wants to see — concept, graphic design, hook writing, trend instinct, and measurable traction.

### 4. Resume
`Product_Manager_Resume.pdf` lives in this folder. Treat it as a source of truth for dates, titles, and bullet phrasing, but the portfolio should *not* read like a resume — it should read like a creative practice.

---

## Visual / brand direction for the portfolio site

**Model: Bleed (bleed.com/work) + Tammy Taabassum (taamannae.dev) — restrained, editorial, text-forward — anchored in *clean minimalist 90s nostalgia*.**

The "90s nostalgia" frame is load-bearing and pulls in a specific direction: faded-paper / early-OS / CRT-grey palette (not warm cream, not pure white), and pixel-bitmap typography as a signature accent. **NOT** maximalist 90s (no Geocities, animated GIFs, neon-on-black). The reference register is closer to early Mac OS desktops, MS-DOS startup screens, NEC PC-98, and contemporary indie-web sites that nod to that era through restraint.

**Shell and case study pages share one aesthetic.** Earlier drafts had each case study leaning into its project's brand world (Offline Crush in pink/blue/blackletter, Whimbitz in chartreuse on dark, TikTok TBD). Brooklyn revised this on **2026-05-06**: the portfolio's design language is now **consistent across all pages** — restrained, white background, editorial, Laurel-coded — and the project *assets themselves* (Substack carousels, app screenshots, mascot illustrations, etc.) provide the visual variety. The portfolio is the frame; the work is the art.

What this means in practice:

- **Shell (home, about, contact, work index):** quiet, monochrome, strong typography, list-not-gallery, no hero animation. Think Bleed/Laurel: projects as a typographic list with title / role / short description / link. Aggressive whitespace.
- **Case study pages:** *same* white background and typographic system as the shell. Project-specific brand colors (Offline Crush pink/blue, Whimbitz chartreuse, etc.) appear only via project *content* — accent moments, screenshots, palette swatches as displayed artifacts — not as page chrome.
- **Bridge moment (kept):** hover states on the home page's work-list can briefly hint at the project's color (e.g., hovering "Offline Crush" flashes the row title into pink). That's the only place project colors break into shell chrome — a tiny preview, not a takeover.
- **Portrait status: paused.** The optimized hero portrait lives at `assets/images/brooklyn-hero.jpg`. It was briefly the magazine-spread hero, then Brooklyn pulled it back to a text-only hero so her pixel-font name could be the unbullied focal point. The image is intentionally kept in the repo — likely to return once we decide the right placement (possibly an About section, possibly a different layout). Don't delete `assets/images/brooklyn-hero.jpg` and don't reintroduce the portrait into the hero without checking.

Why one consistent aesthetic: Brooklyn's reference points are designer-portfolio canon (Laurel Schwulst, Bleed, Tammy Taabassum), where consistency across pages reads as a *house style* — exactly what a Creative Director audience evaluates. Loud-on-loud reads "personal blog"; even page-by-page-shifting registers can read as "skin-deep design choices." A consistent quiet shell that lets project assets pop is the strongest version.

### Brand tokens (canonical)

These are Brooklyn's confirmed brand colors. Mirrored as CSS custom properties in `styles.css`; this section is the source of truth — if the CSS and this disagree, this wins.

| Token | Hex | Project | Notes |
|---|---|---|---|
| Offline Crush pink | `#f92e80` | Offline Crush | neon, vivid magenta-pink |
| Offline Crush blue | `#1f26ce` | Offline Crush | electric royal blue |
| Whimbitz green | `#d4ff00` | Whimbitz | electric chartreuse / Whimbleton's color |
| TikTok / internet.siren | reuses Offline Blue `#1f26ce` | TikTok case study | internet.siren extends the Offline Crush brand to TikTok, so the home-page hover for the TikTok row uses Offline Blue instead of a separate accent |

**Hard nos:**
- No "generic dev portfolio" templates.
- No default Tailwind gradients, stock hero illustrations, or Inter-on-white.
- No framework bloat — see "Tech & hosting" below.

When building UI here, the `frontend-design` skill is the right tool to reach for.

---

## Tech & hosting

- **Stack:** hand-rolled HTML + CSS + minimal vanilla JS. No framework, no build step, no npm.
- **Asset pattern:** raw originals (untouched files like `profile_pic.JPG`) live at the repo root or in a clearly-marked source folder; web-optimized derivatives live under `assets/images/` with descriptive names (e.g., `brooklyn-hero.jpg`). Don't reference originals directly from HTML. Use `sips` (built into macOS) to resize/compress: `sips -Z 1400 -s format jpeg -s formatOptions 75 input.JPG --out output.jpg` lands a 3024×4032 photo around ~270KB.
- **Why:** matches the indie-web sensibility and Bleed-style restraint; lets the design breathe; means the GitHub repo itself is presentable to anyone who pokes at it.
- **Hosting:** GitHub Pages, ideally as the user site (`<username>.github.io`) so the URL stays clean.
- **Escape hatch:** if hand-rolled starts to feel cramped (e.g., once we have many case studies), Astro is the agreed migration path. Don't migrate preemptively.

## Working preferences (initial — update as we learn)

- Brooklyn ships things herself; she's comfortable with code and with going hands-on.
- She values *taste-driven* implementation — when a design decision has a "feels right" answer, take it seriously, don't default to convention.
- When discussing trends or aesthetic moves, go a layer deeper than the surface — explain *why* something is resonating culturally, not just *what* is trending.
- Reference points she's pulled toward: `taamannae.dev`, `bleed.com/work`. Anchor design decisions to that register.
- **Typography stack on the shell:** DotGothic16 (pixel — *brand mark only*, used for her name in the hero), Instrument Serif (editorial — tagline, project titles, about), Inter (UI — metadata, footer, body). Each typeface has one lane. Don't expand pixel font usage beyond the brand mark without checking — over-using DotGothic16 tips the design into "video-gamey" territory and breaks the editorial restraint.

---

## Open decisions (to revisit)

- GitHub username + final repo name.
- Whether project case studies live as long-form pages on the site or link out to existing surfaces (Substack, App Store, TikTok). Current lean: do both — host rich case studies *here* framed for a Creative Director audience, then link out to live artifacts.
- Whimbitz pivot question (arcade vs. education) — may affect how that case study is framed.
- Custom domain (vs. just using the github.io URL).

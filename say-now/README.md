# Say Now mood board

This is the portfolio's Say Now page, reached from the existing **say now branding** card on the homepage. It carries the approved Version 12 design: Space Grotesk, white background and dots, no gradient, cumulative category titles, smooth zoom/pan, and photo notes. The world now opens with small photos and small category titles. Zoom moves through real spatial scale: photos grow to a capped viewing size while the canvas continues opening out. Panning has no collection boundary, and reset returns to the three main covers. Full-resolution images load when needed.

- `index.html` supplies the page, navigation, controls and photo detail view.
- `board.css` supplies its styling. The board fills the viewport below the title, with zoom controls at the bottom and a labeled reset control that restores the overview. Photo notes scroll within the board when they need more room.
- `board.js` loads the collection and handles navigation, zoom and notes. Camera easing is quick and has no overshoot, with responsive zoom steps and a short glide after dragging. The current view is saved in browser local storage; no server state is needed.
- `camera.mjs` defines spatial magnification, its inverse for pinch gestures, and separate capped growth for overview covers and supporting photos.
- `spacing.mjs` reserves permanent positions for every photo and title, including the hidden layers, when the board opens or its dimensions change. It builds compact neighborhoods around the strongest actual overlaps, with crossover images seeking the neighbors they share. Pan and zoom only move the camera; revealing images never rearranges the collection. Titles reserve space only on the side they occupy, sized for the zoom at which they first appear. This lets deeper titles remain small without forcing large empty spaces into the overview.
- `relationships.mjs` derives overlap from the existing category memberships, parent hierarchy and image themes. Shared specific categories or motifs get a small gap; separate subcategories within a shared parent get more room; images with no shared membership stay farther apart. Legacy placement groups and loose `related` links do not establish an overlap. A category's `crossovers` field does not automatically assign every image to both categories.
- `collection.json` is the active source for images, exact notes, categories, crossovers and placement.
- `collection.mjs` validates the complete collection before loading or refreshing it and limits editing controls to loopback preview hosts.
- `thumbnails/` holds small, independently cached images for the world. The original JPGs are used when a photo opens.

The page runs as an ordinary static site, including GitHub Pages. No build or preview runtime is required. Serve the project root with a local HTTP server when developing so the JSON and JavaScript module can load.

The three cover photos start at a 90px long edge on desktop and 72px on phones. Supporting photos begin around 32–56px in world space. Zoom enlarges cover photos to at most 1.8 times their starting size and supporting photos to at most 3.2 times; positions keep expanding with spatial magnification. Main titles use 14–16px type and subcategories 10.5–12px. Supporting layers reveal from zoom 2.2 and 3.5, with progressively smaller titles appearing from 2.7 through 6.9. The maximum depth is 24, leaving room for future layers. Main title clicks focus their area at zoom 2.2. Saved camera state uses a new version so older, larger layouts do not reopen at an unsuitable position.

Run `node --test say-now/spacing.test.mjs` from the project root to check category overlaps, relationship-based photo gaps on desktop and phone, title clearance, stable world positions through zoom and rotated corners.

## Local reorganize button

The **reorganize** control appears only on `localhost`, `127.0.0.1`, or IPv6 loopback. It is absent from the public portfolio. After adding images or changing their saved categories and themes, click it to fetch the entire current collection and rebuild all neighborhoods. This uses the declared overlaps; it does not analyze image pixels, invent categories, or rewrite quotes. When the collection is unchanged, it reports that the images are already organized instead of shuffling them. Result notices appear only after clicking and fade away after three seconds; clicking again restarts the notice. Errors stay for six seconds, and an in-progress check stays visible until it finishes.

**Undo** restores the previous collection, arrangement, and view in the current tab. It does not alter the source files or publish anything. A failed refresh leaves the previous board intact. Run `node --test say-now/collection.test.mjs say-now/spacing.test.mjs` to check validation, local-only visibility rules, and placement.

## Adding photos

The smaller categories now include **Surreal hats** (five references), **Mirrors & glass** (two), **Botanical people** (five), **Bows & ribbon** (five), **Wearable lighting** (two), **Tea** (two), and **Floral patterns** (three). Images can belong to multiple categories while appearing only once. Mirrors & glass and Botanical people sit within Alice; Wearable lighting sits within Surreal hats; Tea sits within British culture; Floral patterns sits within Florals. Surreal hats and Bows & ribbon now belong to the main **Surreal styling** area; Wearable lighting reaches that area through Surreal hats. The lampshade people are its overview cover, and Carousel is a direct styling reference. Crossovers with Florals and British culture still depend on shared images. These seven titles emerge at deeper zoom levels, after the existing source categories. `labelDepth` controls their small type independently of containment. The three main categories each have one overview cover.

1. Place the original image in this folder and optionally a smaller thumbnail in `thumbnails/`.
2. Add an item to `collection.json` with a unique `id`, `name`, relative `src`, optional relative `thumbnail`, image `w` and `h`, `group`, unused `slot`, `size`, `angle`, `tier` and `themes`. Assign only supported themes: they control spatial proximity. The old group and slot are starting hints, not permission to cluster unrelated images. The board uses the original when no thumbnail is supplied.
3. Notes are verbatim quotes only: copy the user's exact original wording into `note` and set `noteAuthor` to `user`. The page displays it as a quotation without an introductory label or assistant commentary. Never paraphrase, write “you identified…” / “you said…”, or invent first-person copy. If no original quote is available, leave `note` empty and omit `noteAuthor`; the page displays **No note** so the user can add it later. Optional `source.url` links to the original reference; `description` provides image alt text.
4. Use `related` IDs and category `refs`/`themes` to connect the image. An image has one placement group and can belong to multiple themes. Supporting images usually use tier 1 or 2; each main category keeps its single `coverRef` in the overview.
5. Run `python3 design-previews/say-now/review_collection.py` from the project root to check references, memberships and missing source images. Check the affected category on desktop and phone. The page reads the updated JSON directly; there is no embedded image/data block to regenerate.

Every category must either be a main area (`kind: "main"`, a `coverRef`, no parents) or have a real `parents` path to a main area. A `crossovers` link is not a substitute for a parent. The collection validator rejects disconnected subcategories, missing main covers, and parent cycles.

Category labels retain their own stable anchors. Preserve parent relationships and reveal thresholds unless the user asks to reorganize. The complete “reorganize the world” workflow is in `../design-previews/say-now/README.md`.

Saved visual versions remain in `../design-previews/say-now/`. The pre-integration portfolio page, styles and script are in `../design-previews/say-now/portfolio-original/`.

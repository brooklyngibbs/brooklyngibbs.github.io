# Say Now mood board

This is the portfolio's Say Now page, reached from the existing **say now branding** card on the homepage. It carries the approved Version 12 design: Space Grotesk, white background and dots, no gradient, cumulative category titles, smooth zoom/pan, and photo notes. Photos now start at a larger, fixed size; zoom reveals more references and opens up space without enlarging them. Full-resolution images load when needed.

- `index.html` supplies the page, navigation, controls and photo detail view.
- `board.css` supplies its styling. The board fills the viewport below the title, with zoom controls at the bottom and a labeled reset control that restores the overview. Photo notes scroll within the board when they need more room.
- `board.js` loads the collection and handles navigation, zoom and notes. Camera easing is quick and has no overshoot, with responsive zoom steps and a short glide after dragging. The current view is saved in browser local storage; no server state is needed.
- `spacing.mjs` reserves permanent positions for every photo and title, including the hidden layers, when the board opens or its dimensions change. It builds compact neighborhoods around the strongest actual overlaps, with crossover images seeking the neighbors they share. Pan and zoom only move the camera; revealing images never rearranges the collection. Titles reserve space only on the side they occupy.
- `relationships.mjs` derives overlap from the existing category memberships, parent hierarchy and image themes. Shared specific categories or motifs get a small gap; separate subcategories within a shared parent get more room; images with no shared membership stay farther apart. Legacy placement groups and loose `related` links do not establish an overlap. A category's `crossovers` field does not automatically assign every image to both categories.
- `collection.json` is the active source for images, exact notes, categories, crossovers and placement.
- `thumbnails/` holds small, independently cached images for the world. The original JPGs are used when a photo opens.

The page runs as an ordinary static site, including GitHub Pages. No build or preview runtime is required. Serve the project root with a local HTTP server when developing so the JSON and JavaScript module can load.

Run `node --test say-now/spacing.test.mjs` from the project root to check category overlaps, relationship-based photo gaps on desktop and phone, title clearance, stable world positions through zoom and rotated corners.

## Adding photos

1. Place the original image in this folder and optionally a smaller thumbnail in `thumbnails/`.
2. Add an item to `collection.json` with a unique `id`, `name`, relative `src`, optional relative `thumbnail`, image `w` and `h`, `group`, unused `slot`, `size`, `angle`, `tier` and `themes`. Assign only supported themes: they control spatial proximity. The old group and slot are starting hints, not permission to cluster unrelated images. The board uses the original when no thumbnail is supplied.
3. Use only the user's original wording in `note` and set `noteAuthor` to `user`. Never write notes from the assistant's point of view, paraphrase the user, or invent first-person copy. If no original note is available, leave `note` empty and omit `noteAuthor`; the page displays **No note** so the user can add it later. Assistant summaries must not appear as notes. Optional `source.url` links to the original reference; `description` provides image alt text.
4. Use `related` IDs and category `refs`/`themes` to connect the image. An image has one placement group and can belong to multiple themes. Supporting images usually use tier 1 or 2; each main category keeps its single `coverRef` in the overview.
5. Run `python3 design-previews/say-now/review_collection.py` from the project root to check references, memberships and missing source images. Check the affected category on desktop and phone. The page reads the updated JSON directly; there is no embedded image/data block to regenerate.

Category labels retain their own stable anchors. Preserve parent relationships and reveal thresholds unless the user asks to reorganize. The complete “reorganize the world” workflow is in `../design-previews/say-now/README.md`.

Saved visual versions remain in `../design-previews/say-now/`. The pre-integration portfolio page, styles and script are in `../design-previews/say-now/portfolio-original/`.

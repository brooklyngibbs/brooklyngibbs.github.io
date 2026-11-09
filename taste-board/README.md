# Personal taste board

Brooklyn’s evolving personal taste board: **127 imported Pinterest references**, exact quoted notes, 23 provisional starting paths and 76 categories. Seven additional references await accessible source links. The portfolio home links to the board, and Say Now is archived separately.

## Organization

Every new batch triggers a review of the **entire collection**, including older paths. Follow `AGENTS.md` and record evidence, decisions and open questions in `organization-review.json`. These are working interpretations, not a final definition of Brooklyn’s taste. Assess repeated references across batches together with emphatic notes and personal memories. Evidence counts overlap; they are not taste scores. An isolated explicit favorite still matters. A new reference can start an independent path; no umbrella theme is required. Split, merge, promote, rename or move branches when the evidence supports it.

The opening uses covers for the independent themes. Make-believe sits beside Medieval fantasy, Starlit screens beside Space age, and Odd romance beside Holidays. Frogs & ponds, Giant women, Titles & lettering, Color & shimmer, Retro tech and the Muppets are separate entrances. Small independent paths such as graffiti use quieter labels and covers until there is a convincing connection. Starlit screens opens onto Late-night TV. Space age starts with the Tomorrowland poster, and Peanuts opens through the family holiday tradition.

Make-believe → Alice in Wonderland → Wonderland flowers demonstrates the deeper structure. Alice opens on the first zoom layer within Make-believe. Wonderland flowers, Bread-and-butterflies, and Caterpillar smoke each open directly from Alice. Childhood books, The Wizard of Oz and Worlds made real extend Make-believe. Medieval fantasy branches into Knights & armor, Wizards and Medieval pixels; Knights then branches into Girl knights and Nervous knights. Odd romance leads through Valentines into Mad science. Holidays now separates Christmas from Halloween, with Vintage monsters beneath Halloween and a Valentine crossover. The Muppets has a costume branch; Kermit’s swamp scene connects to Frogs & ponds. Space age adds Retro futures, while Meet the Robinsons remains directly beneath Space age. Blue & pink links the fairytale pictures without changing their primary placement. Primary paths organize navigation; crossovers preserve shared details such as hearts, colors, stars and medieval pixels.

The opening fits one cover per independent theme, with the strongest recurring interests carrying more visual weight. Supporting pictures reveal at deeper zoom. Reset returns to the opening layer.

`layers.mjs` uses unique references and the category’s recorded `presentation` emphasis to choose representative image size and reveal depth. Independent themes appear first. Recurrence and explicit personal significance can bring a smaller group forward while preserving its primary ancestry and secondary overlaps. Supporting pictures and more specific labels fade in as zoom increases, then remain visible until zooming back out. Supporting images have a modest size difference from covers so they are recognizable at their reveal scale. The largest opening images ease toward a size limit so the detail can take focus. Photos switch from thumbnails to the original image or poster when display size and pixel density call for it.

## Discovery and placement

Each image has a `discovery.parent` and a short `discovery.via` describing its connection. Roots have a visible cover and `parent: null`. Routes describe exploration, not upload chronology. Clicking a photo opens its exact note, breadcrumb, immediate branches and other references. Clicking a category or **Explore this branch** moves the camera toward the next visible group. Breadcrumbs lead back. Local removal repairs routes using **Earlier in this branch**, without inventing a new visual explanation.

`revealCategory` determines the primary spatial neighborhood. Additional memberships provide crossovers but do not pull a whole subject cluster into a color theme. Same-subject pictures have 2 world units of clearance around their protected bounds, other shared specific categories or direct discovery connections 4, related branches 8 and unrelated pictures 22. Entire starting regions reserve 30 units on desktop or 22 on phones. A category cover and its same-subject references pack together. Below-photo captions sort toward the bottom of a subject cluster so they do not open gaps between its pictures. Detail titles grow with their images and reserve a compact footprint. Smaller neighborhoods pack together beside their parent cover. The layout repacks when the collection changes and stays stable during zoom.

Same-subject pictures preserve tight spacing while their detail images grow. Star Trek remains one compact cluster, including its blue/sky crossover references; Luck & clovers remains a single two-picture cluster. Distinct subjects retain wider separation. Forward-only shelf filling keeps a trailing caption at the edge of its group instead of between its pictures.

The layout packs a small primary category, places its children inside its region, then places the complete starting regions. Related entrances can meet at their facing edges while their branches extend outward. Rows center on the covers visible in the opening layer. Photos load when their layer is revealed and they enter the viewport. Capacity tests cover 1,000 images across many categories and in one category.

The header’s **connections** checkbox toggles an optional line overlay, off initially and remembered separately from notes and camera state. Solid lines connect different discovery branches; dotted lines connect pictures to the representative of a shared secondary category. Pictures in the same primary subject have no lines between them, including after hidden endpoints are summarized. Only declared memberships produce overlap lines, with specific categories taking priority over their broad parents. A deeper overlap can appear through its nearest revealed discovery ancestor. The actual endpoint appears when that photo is revealed. Panning never substitutes another endpoint. Hovering or keyboard-focusing a photo/title emphasizes its links and lists the overlapping themes. On touch screens, tapping a category keeps its links emphasized. Lines share the camera transform, never rearrange photos, and disappear in the notes view. The sparse graph uses one spoke per membership rather than connecting every pair of pictures.

## Whole-board review with every new batch

[Brooklyn’s project brief](PROJECT.md) records the goal and the intended Reorganize workflow.

The current board is the complete working collection for layout decisions. Every new batch triggers a fresh assessment of all active images and exact notes: subjects, recurring colors and forms, media, mood, memories, emphasis and possible shared meanings. Reconsider category names and levels, primary discovery routes, secondary overlaps, representative images, spatial neighborhoods and which themes should appear larger and earlier as Brooklyn develops her brand. Strengthen themes supported by recurring evidence, split or merge where useful, and keep a new independent path when no convincing connection exists. Record both decisions and uncertainty in `organization-review.json`, including all reviewed IDs. Preserve snapshots, sources, quotes, local removals and note edits, then validate the full collection and inspect overview, browsing and close-detail scales.

The eventual product flow is adding Pinterest references from the site, followed by collection-wide analysis and a new explorable organization. That import-and-analysis integration is not implemented by the local Reorganize button. Today Brooklyn sends links and notes in chat; curation is written into the collection and Reorganize reloads it. Future integration should preserve the same evidence record and reversible revisions instead of silently presenting a hypothesis as a fact about Brooklyn's taste.

## Notes, imports and local controls

Brooklyn supplies Pinterest links in chat; the assistant imports actual media and sorts it. Preserve source URLs and exact user wording with `noteAuthor: "user"`. Missing notes display **No note**. Analysis, attribution corrections and category interpretations never go into a personal note. `import-source.json` records the original URLs and distinguishes imported from pending references. `pending-imports.json` retains the seven inaccessible TV/color URLs and their exact notes, including two requested GIFs; no placeholder or substitute media is displayed. Animated references retain their original GIFs, with still posters on the world and under reduced motion.

Loopback previews expose **remove image**, **edit note**, **Undo**, **Removed (N)** and **Reorganize**. Reorganize reloads the curated source and applies new organization without losing local edits. It does not analyze pixels. Its temporary message reports when the images are already organized. There are no manual add-image or sorting controls.

Curation is stored in IndexedDB (`brooklyn-taste-board`, `drafts/personal-links`) per browser and origin. Public pages omit the editor and ignore local drafts. Camera state lives separately in `taste-board-world-v3`; a new organization or geometry revision resets its overview without deleting notes or removals. Work stays local until a push is requested. Snapshots are saved before substantial changes; the latest is `design-previews/taste-board/before-route-audit-2026-11-09/`.

## Files and checks

- `collection.json`, `organization-review.json`, `import-source.json`, `pending-imports.json`: current references, review evidence and source provenance.
- `board.js`, `board.css`, `camera.mjs`, `layers.mjs`: world, controls, zoom, presentation emphasis and layered reveal.
- `relationships.mjs`, `spacing.mjs`: semantic neighborhoods and stable packing.
- `connections.mjs`: sparse discovery/overlap graph and progressive line endpoints.
- `collection.mjs`, `discovery.mjs`: validation and discovery routes.
- `drafts.mjs`, `editor.js`: local edits, removal and recovery.
- `images/`, `thumbnails/`: source media and optimized world images.

Serve the repository root and open `/taste-board/` (currently `http://127.0.0.1:8781/taste-board/`). Run `node --test taste-board/*.test.mjs`, syntax-check changed modules, and inspect the overview, deeper branches and notes in the browser. Tests cover assets, notes, routes, removed covers/parents, an empty board, desktop/phone layout, stable zoom, independent starting paths and 1,000-image capacity.

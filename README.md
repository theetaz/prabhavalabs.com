# ප්‍රභව Labs — prabhavalabs.com

Portfolio / studio site for Prabhava Labs open-source projects.

**Stack:** Astro 5 · React islands · Tailwind CSS v4 · Motion (framer-motion) · Lenis · Cloudflare Workers static assets.

## Commands

```sh
npm run dev      # dev server on http://localhost:4321
npm run build    # static build to ./dist
npm run deploy   # build + wrangler deploy to Cloudflare
```

## Adding a project

Drop a markdown file into `src/content/projects/`:

```md
---
title: 'My Tool'
tagline: 'One-line hook'
description: 'A couple of sentences for the card.'
tags: ['TypeScript', 'CLI']
repo: 'https://github.com/prabhavalabs/my-tool'
status: 'active'        # active | incubating | archived
featured: false          # true = big showcase section
order: 4                 # sort position in the grid
video: ''                # optional: URL of a generated background video
---
```

The projects grid and featured showcase pick it up automatically at build time.

## Interactive 3D scenes

Backgrounds are live three.js scenes, not videos:

- `HeroGlobe.tsx` — dotted globe with arcs from the visitor's IP location
  (ipwho.is) to Colombo; drag to spin
- `ParticleWave.tsx` — showcase section; pointer sends ripples through a
  particle terrain
- `ConstellationField.tsx` — philosophy section; drifting node network with
  pointer parallax
- `Starfield.tsx` — lightweight canvas-2D parallax stars on sub-page headers

All 3D scenes lazy-load client-side only, cap devicePixelRatio at 2, pause
when scrolled off screen, and respect `prefers-reduced-motion`. Card images
in `public/images/` were generated with `gemini-3.1-flash-image` via
`tools/generate-assets.mjs`; retired video assets live in `archive/`
(not deployed).

## Pages & adding content

- `/` — landing with the interactive three.js globe hero (`HeroGlobe.tsx`,
  arcs animate from the visitor's IP location to Colombo)
- `/projects` + `/projects/<slug>` — one page per markdown file in
  `src/content/projects/`; the body below the frontmatter is the story page
- `/blog` + `/blog/<slug>` — engineering blog from `src/content/blog/`

**Add a project:** copy a file in `src/content/projects/`, edit the
frontmatter (title, tagline, description, tags, repo, status, order,
featured) and write the story in markdown. It appears in the grid, gets a
detail page, and `featured: true` promotes it to the landing showcase.

**Add a blog post:** drop a markdown file in `src/content/blog/` with
title / description / date / tags. `draft: true` hides it.

---
title: 'prabhavalabs.com: a static-first Astro site with one WebGL island'
description: 'The stack behind this site: pre-rendered Astro pages served from the Cloudflare edge, a lazily loaded three.js globe as the only heavy island, and AI-generated media that cost about six dollars in total.'
date: 2026-07-18
tags: ['astro', 'three.js', 'cloudflare']
---

This site had three hard requirements: it had to load fast from any
region, run on a hosting budget close to zero, and carry an agency-grade
visual identity. The requirements pull against each other. The visual
identity wants WebGL and video, and both are expensive to serve and to
produce. The stack below is the resolution of that conflict.

## Static pages, hydration by island

The base is [Astro](https://astro.build). Every page is pre-rendered HTML
served from Cloudflare's edge, and interactivity is opt-in per component:

```text
Hero (three.js globe)  → client-side island, lazy-loaded
Project cards          → hydrate when scrolled into view
Article pages          → zero JavaScript at all
```

three.js is the heaviest dependency in the project, so the globe island
loads only on the landing page and only in the browser. The headline and
copy around it stay server-rendered for search engines, and article pages
ship no JavaScript at all, so the landing page's interactivity costs
nothing anywhere else on the site.

## The globe

The hero renders a GitHub-style dotted globe: countries sampled into hex
points, with arcs animating from major cities to Colombo. One additional
arc is computed per visitor. An IP geolocation lookup resolves the
visitor's city, an arc fires from that city back to the origin, and a
small "signal received" badge confirms it. The lookup adds nothing
functional; it exists to state the site's premise concretely: one
developer in Sri Lanka shipping to users everywhere else.

## Generating and encoding media

Background videos were generated with Veo 3.1 and images with Gemini; the
entire asset set cost about six dollars. Generated media comes out 3 to 5
times heavier than it needs to be, so ffmpeg re-encodes every file to AV1
with an H.264 fallback before it ships.

## Moving forward

Two decisions did most of the work here. Restricting hydration to islands
means the visual identity costs bandwidth only on the one page that uses
it, and re-encoding generated media reclaims most of its size before it
reaches a visitor. The result is an expressive site whose full media set
cost six dollars to produce.

This post is the overview. The globe and the encoding pipeline each
warrant their own write-up, and those will follow.

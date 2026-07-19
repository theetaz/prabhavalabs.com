---
title: 'Building this site: Astro islands, a three.js globe, and a $6 asset budget'
description: 'A walkthrough of the stack behind prabhavalabs.com — static-first Astro on Cloudflare, an interactive WebGL globe, and AI-generated video that cost less than a coffee.'
date: 2026-07-18
tags: ['astro', 'three.js', 'cloudflare']
---

This site had three hard requirements: it had to be fast enough to feel
instant from anywhere, cheap enough to run on pocket change, and expressive
enough to carry an agency-grade visual identity. Here's how those constraints
shaped the stack.

## Static-first, islands second

The base is [Astro](https://astro.build) — every page is pre-rendered HTML
served from Cloudflare's edge. Interactivity is opt-in per component:

```text
Hero (three.js globe)  → client-side island, lazy-loaded
Project cards          → hydrate when scrolled into view
Article pages          → zero JavaScript at all
```

The globe is the expensive part — three.js is a heavy dependency — so it
loads only on the landing page, only in the browser, while the headline and
copy stay server-rendered for search engines.

## The globe

The hero renders a GitHub-style dotted globe: countries sampled into hex
points, arcs animating from major cities to Colombo — and one special arc
that starts wherever *you* are. A quick IP geolocation lookup finds the
visitor's city, fires an arc to the origin, and drops a small "signal
received" badge. It's a gimmick, but it's an honest one: this site is about
one developer in Sri Lanka shipping things to everywhere.

## Media on a budget

Background videos were generated with Veo 3.1 and images with Gemini — the
entire asset set cost about six dollars. Everything gets re-encoded with
ffmpeg (AV1 with an H.264 fallback) because generated media comes out 3–5×
heavier than it needs to be.

More detailed write-ups on each piece will follow — this is the overview
commit.

---
title: 'GeoPop'
tagline: 'who lives near this coordinate, in milliseconds'
description: 'A self-hosted population and geocoding API in Rust and PostGIS. Ask it any coordinate on Earth and get population, nearest places, country, and disaster exposure back in under 50ms.'
tags: ['Rust', 'PostGIS', 'Geospatial', 'Open data']
repo: 'https://github.com/prabhavalabs/geopop'
status: 'active'
featured: false
order: 4
---

## The itch

"How many people live near this point?" sounds like a solved problem. The
data exists: WorldPop publishes a 1km population grid for the whole planet.
But it ships as raster files, not as something you can query from an app.
GeoPop turns that grid, plus GeoNames and Natural Earth, into a fast API you
run yourself.

## How it works

A Rust server sits on PostGIS holding 175 million grid cells at 1km
resolution. The trick that makes single lookups take about 2ms: the grid is
regular, so the server computes an integer cell id straight from the
coordinate and does a plain B-tree lookup instead of a spatial query.

Around that core there is reverse geocoding against 4.8M GeoNames places,
fuzzy city autocomplete with typo tolerance, land or sea detection, country
lookup, batch queries for up to 1,000 points, and an analyse endpoint built
for disaster work: give it an epicentre, even one in the ocean, and it
expands its search radius until it finds people.

## The data problem

Building the database from scratch means downloading roughly 723 MB and
waiting 30 to 45 minutes for ingestion. So there is a companion repo,
[prabhavalabs/geopop-data](https://github.com/prabhavalabs/geopop-data),
with pre-built dumps: one script and a ~1.1 GB download instead of the full
pipeline.

## Status

Active and MIT licensed. The longer story, including why Postgres JIT had to
be switched off, is in [the case study](/blog/geopop-story).

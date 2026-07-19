---
title: '175 million rows, two milliseconds, one Postgres table'
description: 'GeoPop answers "how many people live around this coordinate?" for any point on Earth. The interesting part is everything I had to avoid doing to keep it under 50ms.'
date: 2026-07-19
tags: ['case-study', 'geopop', 'postgis']
lang: 'en'
---

Some questions sound trivial until you try to answer them with software.
"How many people live within 10km of this coordinate?" is one of them. If a
cyclone is heading for a stretch of coast, or an earthquake epicentre lands
somewhere in the Indian Ocean, that question is the first thing anyone
building a dashboard wants to ask. The data to answer it exists and is
free: WorldPop publishes a population grid covering the whole planet at 1km
resolution. What does not exist, at least not without an invoice attached,
is an API that lets you ask.

So I built [GeoPop](https://github.com/prabhavalabs/geopop): a self-hosted
population and geocoding API written in Rust on top of PostGIS. You send it
a coordinate, it sends back population estimates, the nearest named places,
the country, whether the point is on land or in the sea, and a few other
things. Typical responses come back in under 50ms.

## The lookup that refuses to be spatial

The obvious design is: store 175 million grid cells as geometries, index
them spatially, and answer point queries with a spatial containment check.
That works, and it is slower than it needs to be.

The WorldPop grid is regular. Every cell is 30 arc-seconds on a side, laid
out in a perfectly predictable lattice. Which means you do not need PostGIS
to find the cell a coordinate falls in; you can compute its position with
arithmetic. GeoPop assigns every cell an integer id derived from its grid
position, and the Rust side computes the same id from the incoming
coordinate. What reaches Postgres is not a spatial query at all. It is a
B-tree lookup on an integer key, against a table of 175 million rows, and
it takes about 2ms.

The spatial machinery is still there for the queries that genuinely need
it. Radius queries generate the candidate cells with generate_series and
filter them. Reverse geocoding uses a GiST index over 4.8 million GeoNames
places for nearest-neighbour search. Land or sea checks run ST_Contains
against Natural Earth country polygons. The point is narrower: the hottest
query in the system never touches any of that.

One tuning note that surprised me enough to end up in the config: Postgres
JIT compilation, which is supposed to make queries faster, added roughly
700ms of overhead on the first query. For an API chasing consistent sub-50ms
responses, that is a disaster wearing an optimisation costume. GeoPop ships
with JIT disabled.

## Teaching autocomplete that London is not a village

The endpoint that took the most fiddling is fuzzy city search. The goal was
autocomplete in the style of Google Places: type "lonon" with a typo and
still get London. The mechanism is a pg_trgm GIN index over 5 million
populated places, with prefix matching for short queries and trigram
similarity for longer ones.

Matching turned out to be the easy half. Ranking is where it gets fun,
because GeoNames contains more than 40 places literally named "Londo", all
with a recorded population of zero. Pure string similarity would happily
rank one of them above London, England. GeoPop ranks results by match
quality plus a population boost, so typing "londo" surfaces the city of
nine million rather than a hamlet that happens to spell better. There is
also a min_population filter for clients who want a cleaner autocomplete
without hamlets at all.

## The endpoint for points where nobody lives

My favourite endpoint takes only a coordinate and no radius. It exists
because disaster epicentres are rude about where they land: in the ocean,
in deserts, on mountains. A fixed-radius query around a point 150km
offshore returns zero population and zero useful information.

The analyse endpoint instead detects whether the point is on land,
identifies the country (or the nearest one, if the point is at sea), finds
the nearest named place with its distance and compass bearing, and then
expands its search radius in 5km steps, up to 1000km, until it actually
finds people. The search radius it reports is itself informative: a small
number means a populated area, a big one means the middle of nowhere. The
cost is honest too. On land it resolves in about 10ms; a point in the open
ocean can take up to about 3 seconds while the radius grows.

## The database is the hard part to ship

The unglamorous problem with a project like this is that cloning the repo
gets you nothing useful. The value lives in the database, and building it
means downloading about 723 MB from WorldPop, plus GeoNames and Natural
Earth, then running an ingestion pipeline for 30 to 45 minutes. Fine on a
laptop. Annoying on every fresh VPS, and a real barrier for anyone who just
wants to try the thing.

So the data pipeline became its own repo: prabhavalabs/geopop-data holds
pre-built dumps of the finished tables. Around 175 million population
cells, 258 countries, and 5.2 million places, restorable with one script,
psql, and pg_restore. A ~1.1 GB download replaces the entire pipeline. The
main repo keeps the full ingestion scripts for anyone who wants to build
from the raw sources, and ships an idempotent migration file so redeploys
against an existing database stay boring.

## What it does not do

The numbers are estimates. WorldPop's grid is a model output, not a census,
and GeoPop reports it at face value.

City search results include a bounding box so a map can frame the selected
city, but that box is synthesised by scaling from population. Real polygon
boundaries from OSM admin areas are a planned follow-up; until then the
bbox is a placeholder that behaves reasonably and lies a little.

And the radius caps are real: 10km for population grid queries, 500km for
exposure. They keep the latency table honest, but if you want continental
scale aggregation, this is not your tool.

GeoPop is MIT licensed. If you have Docker and a spare 5 GB of disk, `make
setup` builds the whole thing, and the geopop-data shortcut gets you to a
working API without the wait.

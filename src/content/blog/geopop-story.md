---
title: 'GeoPop: population lookups over 175 million rows without a spatial query'
description: 'How GeoPop answers point population queries in about 2ms by replacing spatial containment checks with integer arithmetic, and why the pre-built database dump matters as much as the code.'
date: 2026-07-19
tags: ['case-study', 'geopop', 'postgis']
lang: 'en'
---

"How many people live within 10km of this coordinate?" is the first
question behind most disaster dashboards. When a cyclone approaches a
coastline or an earthquake epicentre lands in the Indian Ocean, population
exposure is the number everyone needs first. The data to answer it is free:
WorldPop publishes a population grid covering the planet at 1km resolution.
What has not existed without a commercial invoice is an API for querying
it. [GeoPop](https://github.com/prabhavalabs/geopop) is a self-hosted
population and geocoding API written in Rust on top of PostGIS. It accepts
a coordinate and returns population estimates, the nearest named places,
the country, and whether the point is on land or at sea. Typical responses
return in under 50ms.

## The point lookup as integer arithmetic

The obvious design stores 175 million grid cells as geometries, indexes
them spatially, and answers point queries with a containment check. That
works, and it is slower than the problem requires.

The WorldPop grid is regular: every cell is 30 arc-seconds on a side, laid
out in a predictable lattice. Finding the cell that contains a coordinate
therefore needs no spatial index; the cell's position is computable with
arithmetic. GeoPop assigns every cell an integer id derived from its grid
position, and the Rust layer computes the same id from the incoming
coordinate. What reaches Postgres is not a spatial query. It is a B-tree
lookup on an integer key against a table of 175 million rows, and it
completes in about 2ms.

The spatial machinery remains for the queries that need it. Radius queries
generate candidate cell ids with generate_series and filter them. Reverse
geocoding runs nearest-neighbour search against a GiST index over 4.8
million GeoNames places. Land-or-sea checks run ST_Contains against
Natural Earth country polygons. The point of the design is that the
hottest query in the system touches none of that.

One tuning result was surprising enough to end up in the shipped
configuration: Postgres JIT compilation added roughly 700ms of overhead to
the first query. For an API targeting consistent sub-50ms responses, that
overhead is disqualifying, so GeoPop ships with JIT disabled.

## Ranking fuzzy city search

The endpoint that required the most iteration is fuzzy city search, with
the goal of Google Places style autocomplete: a query of "lonon" should
still return London. Matching uses a pg_trgm GIN index over 5 million
populated places, with prefix matching for short queries and trigram
similarity for longer ones.

Matching was the easier half. GeoNames contains more than 40 places named
"Londo", all with a recorded population of zero, and pure string
similarity will rank one of them above London, England. GeoPop ranks
results by match quality plus a population boost, so a query of "londo"
returns the city of nine million ahead of a closer string match with no
inhabitants. A min_population filter is available for clients that want
small places excluded from autocomplete entirely.

## The analyse endpoint

One endpoint takes only a coordinate, with no radius parameter. It exists
because disaster epicentres frequently land where nobody lives: in the
ocean, in deserts, on mountains. A fixed-radius query around a point 150km
offshore returns zero population and no useful information.

The analyse endpoint instead detects whether the point is on land,
identifies the country (or the nearest country if the point is at sea),
finds the nearest named place with its distance and compass bearing, and
then expands its search radius in 5km steps, up to 1000km, until it finds
population. The reported search radius is itself a signal: a small value
indicates a populated area, a large one a remote location. The latency
cost scales the same way. A point on land resolves in about 10ms; a point
in the open ocean can take up to about 3 seconds while the radius grows.

## Shipping the database, not just the code

Cloning the repository produces nothing useful on its own, because the
value of the system is the database. Building it means downloading about
723 MB from WorldPop plus the GeoNames and Natural Earth datasets, then
running an ingestion pipeline for 30 to 45 minutes. That is tolerable on a
development machine and a real barrier on every fresh VPS.

The data pipeline therefore became its own repository:
prabhavalabs/geopop-data holds pre-built dumps of the finished tables,
covering about 175 million population cells, 258 countries, and 5.2
million places, restorable with one script over psql and pg_restore. A
roughly 1.1 GB download replaces the entire pipeline. The main repository
keeps the full ingestion scripts for building from raw sources and ships
an idempotent migration file so redeploys against an existing database are
uneventful.

## Limitations

The numbers are estimates: WorldPop's grid is a model output, not a
census, and GeoPop reports it at face value. City search results include a
bounding box so a map can frame the selected city, but that box is
synthesised by scaling from population; real polygon boundaries from OSM
admin areas are a planned follow-up. The radius caps are firm at 10km for
population grid queries and 500km for exposure queries. They keep latency
predictable, and they make the tool unsuitable for continental-scale
aggregation.

## Moving forward

The general lesson is that regular grids do not need spatial indexes for
point lookups, and that claimed optimisations such as JIT need measuring
against the actual latency target before shipping. The hot path remains a
2ms B-tree lookup. GeoPop is MIT licensed; with Docker and about 5 GB of
disk, `make setup` builds the full system, and the geopop-data dumps
provide a working API without the ingestion wait. The next planned work is
replacing synthesised bounding boxes with OSM admin polygons.

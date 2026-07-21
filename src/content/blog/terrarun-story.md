---
title: 'TerraRun: quantifying route similarity for a territory game'
description: 'How TerraRun turns GPS traces into claimable polygons and challenges into geometry: Douglas-Peucker simplification, directed Hausdorff distance, an 85% buffer-coverage rule, and why every threshold is configurable.'
date: 2026-07-19
tags: ['case-study', 'terrarun', 'geospatial']
lang: 'en'
---

Running apps frame competition as competition against your own history:
pace, distance, streaks. That motivation decays once beating last month's
numbers stops being a reason to train.
[TerraRun](https://github.com/prabhavalabs/terrarun) replaces it with a
territorial mechanic: run a closed loop and the enclosed area becomes your
territory on a shared map. To take a territory from another runner, you
must re-run their route. The game rule fits in one sentence. Implementing
it requires a numerical answer to a question GPS never answers cleanly:
how much of a route counts as the same route?

## From trace to polygon

The input is a GPS trace, a sequence of noisy points scattered around the
path actually run. Before a trace can become a territory it passes three
checks.

First, closure. The start and end points must fall within 50 meters of
each other, because an open curve does not enclose an area. Second,
simplification. The trace runs through Douglas-Peucker, which discards
points that do not change the shape, so a 10 km run does not store a
ten-thousand-vertex polygon in the database. Third, size and overlap
constraints on the resulting polygon:

- Minimum area of 500 square meters, so trivially small loops around a
  single object cannot produce a claim.
- Maximum area of 50 square kilometers, so a single run around a city's
  ring road cannot claim the city.
- At most 25% overlap with existing territories, so claims are mostly new
  ground rather than incremental erosion of a neighbor's polygon.

## Measuring route similarity

Claiming is the simpler half of the game. The challenge mechanic requires
comparing two traces that will never be identical, even when the same
person runs the same sidewalk on consecutive days. TerraRun evaluates a
challenge with two independent tests.

The first is similarity, measured by directed Hausdorff distance: for
every point on the challenger's trace, take the distance to the nearest
point on the original route, and require the worst of those distances to
stay small. A small maximum means the challenger followed the route; a
large one means a corner was cut.

The second is coverage. The original route is inflated into a buffer
corridor, and at least 85% of the challenger's points must fall inside it.
The buffer absorbs ordinary GPS jitter and small detours; the 85%
threshold prevents a partial run from counting as a takeover.

The 85% figure is a first estimate, not a measured value. It sits in an
environment variable, like the other thresholds, so it can be corrected
against real traces once real runners produce them.

## Anti-cheat scope

The current anti-cheat handles the inexpensive cases. A speed cap,
45 km/h by default, rejects traces recorded from a vehicle. Minimum point
counts reject traces that look drawn rather than recorded.

It does not detect GPS spoofing. A fake-location app defeats every check
currently in the code. The planned mitigation is map matching through
Valhalla: snapping traces to the real network of roads and paths, which
both cleans up noise and makes a fabricated straight line through a row
of buildings stand out. That work is on the roadmap and not yet
implemented.

## Real-time map updates

A territory map is only useful if changes propagate without a refresh.
The backend publishes events such as territory_claimed and
territory_transferred through Redis pub/sub, and a WebSocket hub pushes
them to every open map client. The map endpoint is public and requires no
login, a deliberate choice: the live map is the game's main discovery
surface.

Spatial queries run in two layers. PostGIS holds the durable geometry and
performs the polygon operations. An in-memory R-tree sits in front of it
for bounding-box lookups, so panning the map does not cost a database
round trip per frame. The R-tree can be rebuilt from PostGIS at any time,
which keeps the fast path disposable and the database authoritative.

## Progression formulas

Progression is two formulas. A claim earns 100 XP plus one point per 100
square meters, so larger territories pay more without making area the
only variable. Level is the square root of XP divided by 100, floored,
plus one. The square root shapes the curve: early levels arrive quickly,
later levels stretch out, and repeated claims of the same small park do
not reach high levels.

Every one of these values, along with the closure threshold, the overlap
cap, and the coverage requirement, is a default awaiting data. Tuning a
game economy with zero players is guessing, so the guesses are labeled as
such and kept configurable.

## Status and moving forward

TerraRun today is a Go 1.23 backend, a React 19 frontend with MapLibre
maps, and a docker-compose file for Postgres and Redis. One make command
sets the project up and another starts it. It runs locally and on no
public server; the code arrived in a single push in April, which reflects
its status as a prototype rather than a live game.

The next step is Valhalla map matching, because it improves geometry
quality and anti-cheat coverage in one change. Until then, the config
file doubles as the roadmap: each variable in it is a threshold that real
usage data has not yet validated.

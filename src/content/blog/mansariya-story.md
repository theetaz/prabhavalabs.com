---
title: 'Mansariya: crowdsourced bus tracking for a fleet with no GPS hardware'
description: 'How Mansariya turns passenger phone traces into verified bus positions with map matching, route inference, and DBSCAN clustering, covering a 65,000-vehicle fleet from a $9 per month server.'
date: 2026-07-19
tags: ['case-study', 'mansariya', 'geospatial']
lang: 'en'
---

Sri Lanka has no live transit data. There is no GTFS feed for the
country, the National Transport Commission publishes its more than 1,000
bus routes as PDFs, and Google Maps renders the route line a bus is
supposed to follow with no information about actual vehicles. The
standard fix, GPS units on the fleet, does not fit the fleet's
structure: over 65,000 vehicles split between the state-run SLTB and
thousands of small private operators, many of whom own a single bus. No
party exists that could fund, install, and maintain hardware at that
scale. [Mansariya](https://github.com/prabhavalabs/mansariya) uses the
sensors already on board: the passengers' phones.

## The contribution model

A rider taps "I'm on a bus" and the app posts the phone's location every
five seconds for the duration of the ride. That is the entire
contribution. In return, other users on the same route see the inferred
bus position move across their map, live, and the roles reverse on their
next ride.

A raw GPS trace from one phone does not identify a road, a route, or a
vehicle on its own. The backend infers those in stages.

## The inference pipeline

Ingestion is minimal by design. The phone POSTs a batch of positions,
the server appends it to a Redis Stream, and the request completes. All
processing runs asynchronously off the stream, so a spike in
contributors does not slow the ingestion path.

The first stage snaps each trace to the road network using Valhalla's
map-matching engine, self-hosted. A commercial per-request map-matching
API was ruled out because its cost scales with exactly the usage the
project hopes to attract, which does not fit the project's economics.
The matched trace is then compared against all 1,000+ route polylines
through an R-tree spatial index to infer which route the phone is
riding.

Clustering resolves phones into vehicles. Several devices moving
together along the same route are treated as one bus: DBSCAN groups the
co-moving devices into a virtual vehicle and fuses their readings into a
single position. One contributor yields a usable position, a second
improves accuracy, and at three the position is marked verified. The
fused position is published through Redis Pub/Sub to WebSocket
connections, and every open map in the app updates.

The whole backend runs as a single Go binary backed by PostgreSQL with
PostGIS on a Hetzner server that costs about $9 a month. Map tiles come
from OpenFreeMap rendered with MapLibre, so the recurring map cost is
zero and there is no metered API key with a quota to exceed.

## Privacy as a structural property

The system's input is the continuous location of commuters, so the
privacy design has to hold against the server operator as well as
against third parties. Mansariya is built so that the operator cannot
reconstruct an individual's travel history, as a property of the
architecture rather than a policy. There are no user accounts and no
login. The device identifier rotates every 24 hours, so contributions
from different days cannot be linked to each other. Raw GPS data is
discarded within ten minutes of arrival, and only aggregated, anonymous
data persists. Storing personal traces is available strictly as an
opt-in. This removes the trust question instead of answering it: the
data required to identify anyone is deleted before it could be misused.

The client is React Native on the bare workflow, Android first, since
Android is the dominant platform among bus riders in Sri Lanka. Route
names, stop names, and every UI string exist in Sinhala, Tamil, and
English, and all 1,000+ routes are cached for offline browsing.

## The cold-start problem

Crowdsourced coverage starts at zero. The map shows live positions only
where someone is currently riding with the app open, and on launch day
that is nobody. Two mitigations lower the threshold. A single
contributor produces a usable position, so one rider is enough to make a
route useful, and offline route browsing with trilingual search gives
the app value before any live data exists. Adoption itself is not an
engineering problem, and the code does not solve it.

Other open items are narrower. ETA estimates depend on historical speed
data that has to accumulate before the estimates mean much. iOS support
is deferred. The clustering accuracy has not yet been validated against
dense Colombo traffic, where two buses queued closely on the same route
could register as co-moving devices.

## Status and moving forward

The MVP is under active development, built test-first, because a spatial
inference pipeline produces plausible-looking wrong output when
untested. The design principle that holds throughout is to size the
system to its economics: self-hosted map matching, free map tiles, and a
single binary keep the total infrastructure cost at about $9 a month.

If the crowdsourcing model produces coverage, Sri Lanka gets live
transit data for the price of one small server. If it does not, the
cost of finding out is bounded at $9 a month, and the results will be
documented publicly either way.

---
title: 'Why Goyama starts with a schema instead of an app'
description: 'I am building an agricultural platform for Sri Lanka, and the first deliverable is not an app. It is a knowledge corpus where every field knows where it came from.'
date: 2026-07-19
tags: ['case-study', 'goyama', 'open-data']
lang: 'en'
---

Ask the internet how to grow brinjal and you will get an answer. It will be
a confident answer, probably written for an Indian or American audience,
and it will be wrong for a farmer in Nuwara Eliya in a way it is not wrong
for a farmer in Hambantota. Sri Lanka has 46 agro-ecological zones packed
into an island you can drive across in a day. It has wet, intermediate, and
dry zones, two cultivation seasons (Maha and Yala) tied to two different
monsoons, and rice varieties like BG, BW, and AT lines that no global crop
database has heard of. Advice that ignores all of this is not advice. It is
noise with a planting date.

Here is the frustrating part: the real knowledge exists. Sri Lanka's
Department of Agriculture and its research institutes have published
decades of genuinely good material on crops, varieties, diseases, and
remedies. But it lives scattered across PDFs, old websites, and bulletins,
usually in one language at a time, and none of it is structured. You cannot
query it. You cannot build an app on it. You can only read it, if you know
where to look and happen to read the language it was written in.

[Goyama](https://github.com/prabhavalabs/goyama) is my attempt to fix the
substrate before building anything on top of it.

## Data first, code second

The founding decision, and the one that shapes everything else, is that
Goyama's core asset is not an app. It is a structured, trilingual corpus of
Sri Lankan agriculture: crops, varieties, diseases, pests, remedies,
cultivation calendars, agro-ecological zone polygons, and market context.
The plan is to gather it by crawling public sources, extract it into a
strict schema, have agronomists review it, and release it under open
licences. The apps for farmers come after, and they are deliberately thin:
nothing is hardcoded, content lives in the corpus, the apps render it.

Building a corpus before a product is slow, and I know how that sounds.
But the alternative is what most agri apps do: hardcode a few crop guides,
ship, and let the content rot. If the knowledge layer is the product, it
has to be built like one.

## Provenance on every field

The part of the schema I care most about is provenance. Every published
record carries a canonical identity (slug, scientific name, and local
names in Sinhala, Tamil, and English), and every individual field carries
its own source URL, the quote it was extracted from, an extraction
confidence score, the reviewer, and a review timestamp. History is
append-only with a public changelog.

That level of bookkeeping is tedious, and for most datasets it would be
overkill. For this one it is not optional. Some of these records will say
things like "apply this chemical at this dosage" to people who will act on
them. So there is a hard gate in the pipeline: chemical dosages,
pre-harvest intervals, and disease-remedy pairs never publish without an
agronomist's review. A crawler can propose; only a human can approve. This
is the least automatable part of the whole project and the least
negotiable.

Licensing gets the same explicitness. Code is MIT, corpus content is
CC-BY-SA 4.0, geodata is ODbL, and third-party media is linked, never
redistributed. Since the whole premise is building on public work by the
Department of Agriculture and institutes like HORDI and HARTI, every
extracted field links back to its source.

## Location as the index

The other structural decision: every recommendation is bound to a location.
Not a country or a province, but the actual agro-ecological envelope a
farm sits in. Which is why the first working endpoint in the repo is not a
crop guide. It is a geo lookup. Send it any Sri Lanka coordinate and it
resolves the district, the DS division, and the agro-ecological zone with
its rainfall and dominant soil groups. A coordinate in Kandy comes back as
zone WM3: wet zone, mid country, around 2100mm of rain.

Everything else keys off that envelope. A cultivation calendar or a variety
recommendation without an AEZ attached is exactly the generic advice the
project exists to replace.

The second working endpoint is daily market prices from Dambulla's
Dedicated Economic Centre, imported from HARTI bulletins. Prices are the
thing farmers check most often, and unlike the corpus they are useful from
day one, which makes them a good early deliverable while the knowledge
pipeline matures.

## Boring stack, locked on purpose

The tech decisions are locked and deliberately unadventurous: Go with chi,
pgx, and sqlc for the API; Postgres with PostGIS for the geospatial core
and pgvector for later; Vite and React for the web apps; Expo for mobile;
MapLibre with self-hosted vector tiles for maps; Python for the ingestion
pipelines. Every choice optimises for a solo developer maintaining this
for years, not for interesting architecture. The interesting part of
Goyama is the data. The code should stay out of its way.

## Where it honestly stands

The corpus version number is v0.0, and I chose that number to keep myself
honest. The schema and ingestion pipeline are in progress. The repo today
is planning documents, the domain model, the two endpoints above, and a
set of directories marked "coming soon". The dev fixtures ship simplified
polygons, not real boundaries. There is no disease scanner yet, no
marketplace, no mobile app. Those are all specified in the docs, which is
a different thing from existing.

What Goyama needs most right now is not code. It is eyes on the review
queue: agronomists, extension officers, researchers, and anyone who can
spot a wrong dosage or a mistranslated variety name. If that is you, the
contributing guide and GitHub Discussions are open.

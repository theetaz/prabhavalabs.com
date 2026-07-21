---
title: 'Goyama: building the agricultural knowledge corpus before the app'
description: 'Why an agricultural platform for Sri Lanka starts with a provenance-tracked trilingual corpus instead of an app, and how location and human review are built into the schema.'
date: 2026-07-19
tags: ['case-study', 'goyama', 'open-data']
lang: 'en'
---

Agricultural advice is location-sensitive in ways generic content ignores.
Sri Lanka packs 46 agro-ecological zones into an island that can be crossed
in a day, spans wet, intermediate, and dry zones, runs two cultivation
seasons (Maha and Yala) tied to two different monsoons, and grows rice
varieties such as the BG, BW, and AT lines that no global crop database
covers. Guidance written for an Indian or American audience is wrong for a
farmer in Nuwara Eliya in ways it is not wrong for a farmer in Hambantota.
[Goyama](https://github.com/prabhavalabs/goyama) is an agricultural
platform for Sri Lanka whose first deliverable is not an app but the data
layer such an app would need.

## Motivation

The knowledge to do better exists. Sri Lanka's Department of Agriculture
and its research institutes have published decades of solid material on
crops, varieties, diseases, and remedies. The problem is its form: the
material is scattered across PDFs, old websites, and bulletins, usually in
one language at a time, and none of it is structured. It cannot be
queried, and no application can be built on it. Access requires knowing
where to look and reading the language a given document happens to use.

## The corpus is the product

The founding decision, which shapes everything downstream, is that
Goyama's core asset is a structured, trilingual corpus of Sri Lankan
agriculture: crops, varieties, diseases, pests, remedies, cultivation
calendars, agro-ecological zone polygons, and market context. The pipeline
crawls public sources, extracts content into a strict schema, routes it
through agronomist review, and releases it under open licences. The farmer
apps come after and are deliberately thin: no content is hardcoded, the
corpus holds it, and the apps render it.

The trade-off is speed. Building a corpus before a product is slower than
the common alternative of hardcoding a few crop guides and shipping, but
hardcoded content is not maintained and degrades. If the knowledge layer
is the product, it has to be engineered as one.

## Provenance on every field

The most consequential part of the schema is provenance. Every published
record carries a canonical identity: a slug, the scientific name, and
local names in Sinhala, Tamil, and English. Every individual field carries
its own source URL, the quote it was extracted from, an extraction
confidence score, the reviewer, and a review timestamp. History is
append-only with a public changelog.

That bookkeeping would be excessive for most datasets. Here it is
required, because some records state chemical dosages that people will
act on. The pipeline enforces a hard gate: chemical dosages, pre-harvest
intervals, and disease-remedy pairs never publish without an agronomist's
review. A crawler can propose a record; only a human can approve it. This
is the least automatable step in the project and the least negotiable.

Licensing is equally explicit. Code is MIT, corpus content is CC-BY-SA
4.0, geodata is ODbL, and third-party media is linked rather than
redistributed. Since the project builds on public work by the Department
of Agriculture and institutes such as HORDI and HARTI, every extracted
field links back to its source.

## Location as the index

The second structural decision binds every recommendation to a location,
and not at country or province granularity but at the agro-ecological
envelope a farm sits in. The first working endpoint in the repository is
therefore a geo lookup rather than a crop guide. It accepts any Sri Lanka
coordinate and resolves the district, the DS division, and the
agro-ecological zone with its rainfall and dominant soil groups. A
coordinate in Kandy resolves to zone WM3: wet zone, mid country, around
2100mm of rain. Cultivation calendars and variety recommendations key off
that envelope; a recommendation without an AEZ attached is the generic
advice the project exists to replace.

The second working endpoint serves daily market prices from Dambulla's
Dedicated Economic Centre, imported from HARTI bulletins. Prices are the
data farmers check most often, and unlike the corpus they are useful from
day one, which makes them a practical early deliverable while the
knowledge pipeline matures.

## A stack chosen for long maintenance

The technical choices are locked and deliberately conventional: Go with
chi, pgx, and sqlc for the API; Postgres with PostGIS for the geospatial
core and pgvector reserved for later; Vite and React for the web apps;
Expo for mobile; MapLibre with self-hosted vector tiles for maps; Python
for the ingestion pipelines. Each choice optimises for one developer
maintaining the system for years. The differentiating asset is the data,
and the code is kept simple enough not to compete with it for attention.

## Status

The corpus is at v0.0, and the version number is accurate: the corpus is
effectively empty. The schema and ingestion pipeline are in progress. The
repository today contains planning documents, the domain model, the two
endpoints described above, and directories marked "coming soon". The dev
fixtures ship simplified polygons, not real boundaries. There is no
disease scanner, no marketplace, and no mobile app; those are specified in
the documentation, which is not the same as existing.

## Moving forward

The near-term work is filling the schema: running the crawlers, extracting
records, and moving them through review. The binding constraint is review
capacity rather than code. The project needs agronomists, extension
officers, researchers, and anyone able to spot a wrong dosage or a
mistranslated variety name in the review queue. The contributing guide and
GitHub Discussions are open.

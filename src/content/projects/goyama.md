---
title: 'Goyama'
tagline: 'an open knowledge base for Sri Lankan farming'
description: 'A structured, trilingual corpus of Sri Lankan agriculture with per-field provenance, plus the apps to put it in farmers'' hands. Early days: the schema and first API endpoints exist, the corpus is v0.0.'
tags: ['Go', 'PostGIS', 'Open data', 'Sri Lanka']
repo: 'https://github.com/prabhavalabs/goyama'
status: 'incubating'
featured: false
order: 5
image: '/images/projects/goyama.jpg'
---

## The itch

Generic farming advice is nearly useless in Sri Lanka. The island has 46
agro-ecological zones, two cultivation seasons, and local varieties that no
global crop database has heard of. The real knowledge exists, in decades of
Department of Agriculture and research institute publications, but it is
scattered across PDFs and websites, mostly in one language at a time, and
none of it is queryable.

## The plan

Data first, code second. Goyama's core asset is a structured knowledge
corpus of Sri Lankan agriculture: crops, varieties, diseases, remedies,
cultivation calendars, and market context, extracted from public sources
into a strict schema. Every field carries provenance (source URL, quote,
extraction confidence, reviewer) and nothing involving chemical dosages
publishes without an agronomist's sign-off. The corpus is released under
open licences; the web and mobile apps are built on top of it, with every
recommendation bound to the user's actual location.

## What exists today

The corpus is at v0.0, which is an honest way of saying "schema and
pipeline in progress". Two API endpoints run: a geo lookup that resolves
any Sri Lanka coordinate into its district, DS division, and
agro-ecological zone, and daily market prices from the Dambulla Dedicated
Economic Centre. Several directories in the repo say "coming soon", and
they mean it.

## Status

Incubating. Contributors welcome, agronomists especially. More on why the
first deliverable is a schema rather than an app in
[the case study](/blog/goyama-story).

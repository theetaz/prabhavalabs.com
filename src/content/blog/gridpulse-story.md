---
title: 'GridPulse: an outage map that works during the outage'
description: 'How GridPulse merges official CEB outage data with anonymous neighbour reports on one offline-first map, and why the design starts from a phone on a failing connection.'
date: 2026-07-19
tags: ['case-study', 'gridpulse', 'pwa']
lang: 'en'
---

An outage tracker has an awkward operating constraint: it is needed most at
the exact moment the infrastructure around it is degrading. During a power
cut in Sri Lanka the home router is down, the local mobile network is
strained, and the user's phone is the one working screen, running on a
battery they would rather not drain. The information needed at that moment
mostly exists. The Ceylon Electricity Board publishes outage data, and
neighbours know precisely what is happening on their street, which is how
people distinguish a grid fault from their own tripped main. The two
sources never meet, and neither is convenient from a phone during an
outage. GridPulse puts both on one map, designed from that failure case
outward.

## Merging official and community reports

GridPulse reads official outages from the publicly available CEB Care
endpoints and displays them beside reports submitted by people currently
affected. The map draws each source as a toggleable layer, and the home
screen reduces the data to a direct answer: whether the power is out at
your location, and how many neighbours are affected.

The main data problem is duplication. If a user reports a cut that CEB has
already announced, a naive design renders two markers for one event and the
map degrades into noise as reports accumulate. GridPulse merges an official
announcement and its matching community reports into a single outage
record backed by two kinds of evidence. The project is not affiliated with
or endorsed by CEB; it reads what CEB publishes and adds the street-level
picture CEB cannot see.

## Anonymous reporting as a participation requirement

Filing a report takes two taps: pick the location, optionally add a note,
submit. There is no account. On first launch the app assigns a random
pseudonym, such as "Brave Peacock", and that is the only identity attached
to anything the user reports. The app collects no email address, no phone
number, and no tracking data.

The decision came from participation economics rather than a privacy
position. Crowd data is only as good as the crowd, and the crowd only
forms when contributing costs nothing; a user sitting in a dark house will
not complete an email verification flow to report the obvious. The
trade-off is stated plainly: nothing prevents a wrong or bad-faith report.
The official CEB layer provides a verified baseline, and merged records
give each report more context than it would carry alone, but the community
layer runs on good faith. I accepted that risk rather than add friction,
because a fully verified map that nobody reports into carries no
information.

## Offline as the primary state

GridPulse is a PWA that treats connectivity as optional. After the first
visit, the app shell, the map tiles for the user's area, and the last
known set of outages are cached on the device, so the app opens and
renders with no connection at all. A report filed offline enters a local
queue and syncs automatically when the connection returns. The interface
follows the same constraint: large touch targets, one-handed layouts, and
a dark mode intended to be read in an unlit room.

## Resolving location without GPS

GPS is optional. When it is disabled, or when a user is checking on family
in another town, a type-ahead search covers every populated place in the
country, and a saved home location removes the need to search repeatedly.
The geocoding and population data behind that search come from GeoPop,
another Prabhava Labs project: a self-hosted Sri Lanka geocoder. A free
app therefore does not depend on a paid geocoding API to resolve place
names.

## Localization down to the name

The app runs in English, Sinhala, and Tamil, with every label and message
translated. The name is localized as well: in Sinhala the app is කරන්ට්
කට්, literally "current cut", which is the term the event goes by in daily
speech, and the Tamil name, கரன்ட் கட், is the same phrase. The name
follows the vernacular term for the event rather than the brand.

Beyond the live view, a stats page reports island-wide totals, active
outages and people affected, today compared with yesterday, the worst-hit
areas at the moment, and a per-area drilldown with peak-hour history. Once
outage data is flowing through the system, the marginal cost of
aggregating it is low, and the aggregate view turns individual outages
into a pattern.

## Status

GridPulse is live at
[gridpulse-cyr.pages.dev](https://gridpulse-cyr.pages.dev), with source at
[github.com/prabhavalabs/gridpulse](https://github.com/prabhavalabs/gridpulse)
under MIT.

Two known risks remain. The integration depends on publicly available CEB
Care endpoints rather than an official API, so it can break whenever CEB
changes something on their side; the only available mitigation is adapting
quickly. The community layer also has a standard cold-start problem:
reports make the map useful, and a useful map attracts reporters, but that
loop has to be started by early users reporting into a quiet map.

## Moving forward

Two design conclusions carry beyond this project. Building the client for
its worst network case produced a better client in every case, and for
crowd-sourced data, removing contribution friction matters more than
verifying contributors. The design is not specific to Sri Lanka: the MIT
license allows forking the project, swapping the official data source, and
pointing it at another country's grid.

---
title: 'GridPulse'
tagline: 'is the power out at your place'
description: 'A live map of every power cut in Sri Lanka, combining official CEB outages with anonymous neighbour reports. Works in English, Sinhala, and Tamil, and keeps working when the connection dies.'
tags: ['TypeScript', 'PWA', 'Maps', 'Crowdsourcing']
repo: 'https://github.com/prabhavalabs/gridpulse'
link: 'https://gridpulse-cyr.pages.dev'
status: 'active'
featured: false
order: 3
image: '/images/projects/gridpulse.jpg'
---

## The itch

When the power goes out in Sri Lanka, everyone runs the same loop: refresh
the CEB Care site, text a cousin two streets over, argue about whether it is
a planned cut or a breakdown. The official data exists and the neighbourhood
knowledge exists, but nothing puts them on one screen, and nothing is
pleasant to use on a phone in the dark. GridPulse is that one screen.

## How it works

A live map shows official CEB outages next to anonymous reports from people
nearby, and when both describe the same cut they get merged into a single
story so the map stays free of duplicate pins. Reporting takes two taps and
you never create an account; the app assigns you a random pseudonym like
"Brave Peacock" and that is all anyone sees. Because a power cut hits
exactly when your connection is at its worst, GridPulse installs as a PWA,
caches the map tiles for your area, and queues any report you file offline
until the network comes back.

It speaks English, Sinhala, and Tamil. The Sinhala name is කරන්ට් කට්, the
phrase people actually use, rather than a translation of the brand. City
search and geocoding run on GeoPop, another Prabhava Labs project.

## Status

Live at [gridpulse-cyr.pages.dev](https://gridpulse-cyr.pages.dev), MIT
licensed. The design story is in [the case study](/blog/gridpulse-story).

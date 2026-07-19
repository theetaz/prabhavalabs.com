---
title: 'Mansariya'
tagline: 'bus tracking with no hardware on buses'
description: 'Crowdsourced real-time bus tracking for Sri Lanka. Passenger phones are the GPS units; the server clusters co-moving riders into buses and broadcasts positions live over WebSocket.'
tags: ['Go', 'React Native', 'PostGIS', 'Crowdsourcing']
repo: 'https://github.com/prabhavalabs/mansariya'
status: 'active'
featured: false
order: 10
image: '/images/projects/mansariya.jpg'
---

## The itch

Sri Lanka runs on buses: over a thousand routes, more than 65,000 vehicles across the SLTB and thousands of private operators, and no live data about any of them. There is no GTFS feed. The National Transport Commission publishes routes as PDFs. Google Maps draws a static line and shrugs. Fitting GPS hardware to that fleet is never going to happen, so Mansariya asks a different question: what if the passengers are the hardware?

## How it works

Ride a bus with the app open and your phone quietly contributes a GPS point every five seconds. The server snaps the trace to roads with a self-hosted Valhalla instance, matches it against 1,000+ route polylines through an R-tree spatial index, then runs DBSCAN so that several co-moving phones on the same route collapse into one virtual bus. The fused position streams out over WebSocket to everyone waiting at a stop. A single contributor already produces a usable position; with three, it counts as verified.

Privacy is built into the data model rather than the settings page. There are no accounts, device identifiers rotate every 24 hours, and raw GPS traces are discarded within ten minutes, so even I cannot reconstruct where anyone went.

## The frugal part

The backend is one Go binary on a $9 per month Hetzner box. MapLibre with OpenFreeMap keeps the map bill at exactly zero, and the app speaks Sinhala, Tamil and English.

## Status

MVP in development, Android first. How the pipeline actually works is in [the case study](/blog/mansariya-story).

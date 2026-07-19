---
title: 'Tracking 65,000 buses that have no GPS'
description: 'Sri Lanka has more than a thousand bus routes and zero live tracking data. Mansariya turns passenger phones into the sensor network nobody was going to install.'
date: 2026-07-19
tags: ['case-study', 'mansariya', 'geospatial']
lang: 'en'
---

Standing at a bus stop in Sri Lanka is an act of faith. The route exists, the bus exists, and the relationship between the two is unknowable. There is no GTFS feed for the country. The National Transport Commission publishes its 1,000+ routes as PDFs. Google Maps will show you the line a bus is supposed to follow and nothing about where any actual bus is.

The obvious fix, GPS units on buses, dies on arithmetic. The fleet is over 65,000 vehicles, split between the state SLTB and thousands of small private operators, many of whom own a single bus. Nobody is going to fund, install and maintain hardware across that. Every "smart transit" pitch for Sri Lanka quietly assumes this problem away.

[Mansariya](https://github.com/prabhavalabs/mansariya) refuses the hardware entirely. The passengers already carry GPS units. They call them phones.

## One tap, and you become a sensor

The contract with the rider is simple: tap "I'm on a bus" and your phone starts posting its location every five seconds. That is the entire ask. In exchange, everyone else on that route sees the bus you are sitting in move across their map in real time, and you see theirs when the roles flip.

The interesting engineering is everything between the phone and the map. A raw GPS trace from a moving bus is noisy and tells you nothing by itself: which road, which route, which bus? The backend answers those in stages.

Ingestion comes first, and it is deliberately dumb. The phone POSTs a batch, the server writes it to a Redis Stream, and the request is done. All the expensive thinking happens asynchronously off the stream, so a spike in contributors never slows down the ingestion path.

Then the trace gets snapped to actual roads by Valhalla's map-matching engine, self-hosted, because a per-request commercial map-matching API would sink the project's economics on day one. The matched trace is compared against all 1,000+ route polylines through an R-tree spatial index to infer which route this phone is riding.

The step I find most satisfying is clustering. Several phones moving together along the same route are, almost certainly, one bus. DBSCAN groups those co-moving devices into a single virtual vehicle, and their readings get fused into one position. One contributor already yields a usable position. A second improves the accuracy, and at three the position is marked verified. The fused result goes out through Redis Pub/Sub to WebSocket connections, and every open map in the app updates.

All of that runs as a single Go binary, backed by PostgreSQL with PostGIS, on a Hetzner box that costs about $9 a month. The map tiles come from OpenFreeMap rendered with MapLibre, so the recurring map bill is zero dollars, with no Google key waiting to blow through a quota.

## The privacy design came first

A system whose input is "the continuous location of commuters" deserves suspicion, so Mansariya is built so that even the server operator, meaning me, cannot reconstruct an individual's travel history. This is structural rather than promised. There are no user accounts and no login. The device identifier rotates every 24 hours, so yesterday's contributor and today's cannot be linked. Raw GPS data is discarded within ten minutes of arrival, and only aggregated, anonymous data persists. If you want your traces stored, that is opt-in.

I like this design because it removes the trust question instead of answering it. You do not have to believe I am a nice person. The data needed to betray you is deleted before I could be tempted.

The app itself is React Native on the bare workflow, Android first because that is what rides the bus in Sri Lanka, and fully trilingual: route names, stop names and every UI string exist in Sinhala, Tamil and English, with all 1,000+ routes cached for offline browsing.

## The honest problem: an empty map

Crowdsourcing has a cold start built in. The map is only as alive as the number of people riding with the app open, and on day one that number is zero. The mitigations are real but partial: a single contributor is enough for a usable position, so the threshold for a route becoming useful is exactly one generous rider, and offline route browsing plus trilingual search give the app some value before any live dot appears. But I will not pretend the adoption curve is an engineering problem. It is a convincing-people problem, and code does not solve those.

There are smaller honest gaps too. ETA estimates lean on historical speed data that has to accumulate before it means much. iOS support is deferred. And the pipeline's accuracy claims need to survive contact with Colombo traffic, where "co-moving devices" might occasionally mean two buses stuck nose to tail in the same jam.

The MVP is under active development, built test-first because a spatial inference pipeline is exactly the kind of code that lies to you when untested. If the crowdsourcing bet works, Sri Lanka gets live transit data for the price of one small server. If it does not, the failure will at least be cheap, publicly documented, and running on $9 a month.

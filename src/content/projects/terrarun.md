---
title: 'TerraRun'
tagline: 'run a loop, own the land inside it'
description: 'A territorial fitness game: run a closed GPS route and the polygon inside becomes your territory. Rivals take it back by re-running your route with 85% coverage.'
tags: ['Go', 'PostGIS', 'React', 'Geospatial']
repo: 'https://github.com/prabhavalabs/terrarun'
status: 'incubating'
featured: false
order: 6
---

## The itch

Running apps are very good at telling you what you did: pace, distance, a
medal for beating your own time. What they never give you is a reason to go
out when you do not feel like it. TerraRun borrows one from childhood games:
land. Run a loop and the ground inside it becomes your territory on a shared
map. If somebody wants it, they have to put on shoes and go run it.

## How it works

Your GPS trace has to close (start and end within 50 meters of each other),
gets simplified with Douglas-Peucker, and becomes a polygon after area and
overlap checks. Territories range from 500 square meters up to 50 square
kilometers, and a new claim can overlap existing turf by at most 25%.

Taking someone's territory means re-running their route with at least 85%
coverage, with similarity measured by Hausdorff distance against a buffer
zone around the original trace. A configurable speed cap of 45 km/h keeps
cars off the leaderboard. The map updates live over WebSocket backed by
Redis pub/sub, with an in-memory R-tree for fast viewport queries and
PostGIS as the source of truth.

## Status

An early prototype: Go backend, React frontend, everything runs locally with
one make command. There is no public server yet, and map matching through
Valhalla is still on the to-do list. Every game-balance number is an
environment variable, because I will not know the right values until real
runners argue about them. The geometry story is in the
[case study](/blog/terrarun-story).

---
title: 'How much of a route counts as the same route?'
description: 'TerraRun lets runners steal territory by re-running each other. That single game rule dragged me into Hausdorff distances, buffer zones, and a config file full of guesses.'
date: 2026-07-19
tags: ['case-study', 'terrarun', 'geospatial']
lang: 'en'
---

Every running app I have tried eventually turns into a spreadsheet about
myself. Pace, distance, heart rate, a streak counter quietly judging me. It
works until it does not, because at some point competing with last month's
you stops being a reason to leave the house. What did work on me as a kid
was territory. Any game where you could point at a patch of ground and say
"mine" had my full attention.

[TerraRun](https://github.com/prabhavalabs/terrarun) is that instinct with
GPS attached. Run a closed loop and the area inside it becomes your
territory on a shared map. Someone else wants it, they have to go run your
route. That is the whole game, and it sounds simple right up until you try
to write it down as code.

## A run becomes a shape

The raw material is a GPS trace: a long list of noisy points that wobble
around wherever you actually ran. Before it can be a territory it has to
pass a few tests. The trace must close, meaning start and end within 50
meters of each other, because an open curve does not enclose anything.
Then it gets simplified with Douglas-Peucker, which throws away the points
that do not change the shape, so a 10 km run does not become a
ten-thousand-vertex polygon in the database.

The resulting polygon has its own rules. It has to be at least 500 square
meters, so you cannot claim a lamppost by jogging around it. It can be at
most 50 square kilometers, which is my way of saying "no, you cannot own
the city by running its ring road." And it can overlap existing territories
by at most 25%, so claims stay mostly about new ground instead of endless
nibbling at the edges of someone else's.

## The stealing problem

Claiming was the easy half. The interesting question is the challenge: to
take my territory, you must run "my route." But GPS will never hand you two
identical traces, not even from the same person on the same sidewalk on
consecutive days. So the game needs a mathematical answer to a very human
question: how much of a route counts as the same route?

TerraRun answers it twice. First, similarity: directed Hausdorff distance,
which asks, of every point on the challenger's run, how far is the worst
one from my original route? A small answer means you genuinely followed the
route; a big answer means you cut a corner through the park. Second,
coverage: the original route gets inflated into a buffer corridor, and at
least 85% of the challenger's trace has to fall inside it. The buffer
absorbs ordinary GPS jitter and the odd swerve around a dog, while the 85%
threshold stops anyone from running half the loop and calling it a
takeover.

Why 85 and not 90? I do not have a principled answer. It felt strict enough
to be fair and loose enough to be winnable, and it lives in an environment
variable precisely because I expect real runners to prove me wrong.

## Cheating, the easy kind

The anti-cheat is honest about its own ambitions. There is a speed cap,
45 km/h by default, which catches the obvious case of someone claiming a
neighborhood from the passenger seat of a car. There are minimum point
thresholds so a trace has to look like an actual recording rather than four
corners drawn by hand.

What this does not catch is GPS spoofing, and I am not going to pretend
otherwise. A determined cheater with a fake-location app beats every check
I currently have. The plan for that is map matching through Valhalla:
snapping traces to the real network of roads and paths, which both cleans
up noise and makes a fabricated straight line through a row of houses stand
out immediately. It is on the roadmap and not in the code, which is a
sentence that describes a lot of this project.

## Keeping the map alive

A territory game is only fun if the map feels inhabited, so changes have to
show up without anyone refreshing. The backend publishes events like
territory_claimed and territory_transferred through Redis pub/sub, and a
WebSocket hub pushes them to every open map. The map endpoint itself is
public with no login, because watching turf change hands is the best
advertisement the game has.

Spatial queries run twice, on purpose. PostGIS holds the durable geometry
and does the heavyweight polygon math. An in-memory R-tree sits in front of
it for bounding-box lookups, so panning the map does not mean a database
round trip per frame. The R-tree can be rebuilt from PostGIS at any time,
which keeps the fast path disposable and the slow path authoritative.

## Numbers I made up

Progression is two small formulas. A claim earns 100 XP plus one point per
100 square meters, so bigger territory pays more without making area the
only thing that matters. Your level is the square root of XP over 100,
floored, plus one. The square root is doing the real work there: early
levels come quickly, later ones stretch out, and nobody hits level 50 by
grinding the same park.

I want to be clear about the epistemics of all these numbers. The closure
threshold, the overlap cap, the coverage requirement, the XP curve: every
one is a first guess wearing a default value. They are all configurable
because tuning a game economy from a position of zero players would be
astrology.

## Where it stands

TerraRun today is a Go 1.23 backend, a React 19 frontend with MapLibre
maps, and a docker-compose file for Postgres and Redis. One make command
sets it up, another starts everything. It runs on my machine and on no
public server, and the code arrived in one big push in April, which tells
you it is a prototype that escaped my laptop rather than a live game.

The next real step is Valhalla map matching, because it upgrades both the
geometry and the anti-cheat at once. Until then, the config file is the
most honest roadmap I have: every variable in it is a question I have not
answered yet.

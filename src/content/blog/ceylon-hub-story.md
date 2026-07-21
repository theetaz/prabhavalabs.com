---
title: 'Ceylon Hub: a country-scale open-data map with no tile server'
description: 'The rendering stack behind Ceylon Hub: MapLibre, deck.gl, and PMTiles serving the boundaries, cities, postal codes, and demographics of Sri Lanka as static files, and an honest account of the data pipeline that does not exist yet.'
date: 2026-07-19
tags: ['case-study', 'ceylon-hub', 'gis']
lang: 'en'
---

Answering a basic statistical question about Sri Lanka, such as how the
population is distributed across divisional secretariats or which postal
codes cover which towns, currently requires five separate sources: the
Department of Census and Statistics for demographics, GADM for
administrative boundaries, WorldPop for population rasters, the
Humanitarian Data Exchange for aid-sector datasets, and OpenStreetMap
for roads and places. Each source is real and useful. None of them
interoperate, and none of them provides an interactive map.
[Ceylon Hub](https://github.com/prabhavalabs/ceylon-hub) is a single web
app intended to put the country's provinces, districts, divisional
secretariats, cities, postal codes, and demographics on one map, in 2D
and 3D. The governing constraint: every data source and every dependency
stays open, and the whole system runs without a paid API.

## How the constraint selects the stack

MapLibre GL renders the base map. It is the open fork of Mapbox GL from
before the license change, it renders vector tiles well, and it requires
no access token. The token question matters for a long-lived side
project: a Mapbox or Google Maps dependency ties cost to traffic, so a
traffic spike becomes a billing event. With MapLibre on
OpenStreetMap-derived tiles, traffic has no effect on cost.

deck.gl handles the data layers. Country-wide population distribution
means rendering a very large number of points or polygons, and deck.gl
moves that work to the GPU. three.js sits alongside it for a separate
job: presentation scenes and custom 3D representations rather than bulk
data rendering.

The application frame is React 19, Vite, TypeScript, shadcn/ui, and
Tailwind v4. The charting library is undecided between ECharts and
Recharts, and that decision waits until there is real data to chart.

## Removing the tile server with PMTiles

Vector tiles normally imply a tile server: a running process that serves
tile requests on demand. PMTiles packs an entire tileset into one static
file, and clients fetch only the byte ranges they need over ordinary
HTTP. That format choice changes the operating model of the project. The
map data becomes a file to upload rather than a service to run. The app
and its tiles deploy to Cloudflare Pages with one command, and there is
no process to monitor or patch and no per-request cost. For a solo
project intended to stay online for years, an architecture with nothing
running is the cheapest one to keep alive.

## Status: the data pipeline does not exist yet

Ceylon Hub today is scaffolding. The stack described above is chosen,
wired, and deployed at
[ceylon-hub.pages.dev](https://ceylon-hub.pages.dev), and the data
sources are identified. Identified is not ingested. The planned pipeline
is Python with GeoPandas, converting GADM boundaries, census tables,
WorldPop rasters, HDX datasets, and Copernicus or SRTM elevation into
clean layers and PMTiles archives.

Most of the project's difficulty is in that pipeline, and the rendering
stack was built first. Government statistics arrive as spreadsheets
formatted for printing. Boundary datasets disagree with each other about
where lines run. Place names need to exist in Sinhala, Tamil, and
English and be joinable across sources that romanize them differently.
This is data-cleaning work: slow, manual, and full of judgment calls
that no library makes automatically.

## Moving forward

The current state is a deployed app, a rendering stack sized for the
planned data volumes, and a backlog that is mostly data work. Commit
activity will not track progress evenly from here, because the visible
work (rendering, deployment) is done and the remaining work is slower.

One conclusion already holds: choosing a static-file tile format
converted what is normally the project's largest operational burden into
zero running services. What exists is MIT licensed, and the constraint
stands for what comes next: when the population layers land, they will
be built from open sources, served as static files, and require no API
key.

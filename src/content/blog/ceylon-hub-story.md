---
title: 'Can you map a whole country without an API key?'
description: 'Ceylon Hub is an attempt to put all of Sri Lanka, boundaries, cities, postal codes and demographics, on one interactive map using only open data and static hosting.'
date: 2026-07-19
tags: ['case-study', 'ceylon-hub', 'gis']
lang: 'en'
---

Try to answer a simple question about Sri Lanka with data. How is the population distributed across divisional secretariats? Which postal codes cover which towns? You will end up with a browser full of tabs: the Department of Census and Statistics for demographics, GADM for administrative boundaries, WorldPop for population rasters, the Humanitarian Data Exchange for everything the aid sector has mapped, OpenStreetMap for roads and places. Each source is real and useful. None of them talk to each other, and not one of them gives you a map you would enjoy looking at.

[Ceylon Hub](https://github.com/prabhavalabs/ceylon-hub) is my attempt to fix the looking-at part: a single interactive web app where Sri Lanka's provinces, districts, divisional secretariats, cities, postal codes and demographics live on one fast map, in 2D and 3D. The constraint that shapes every technical choice: every data source and every dependency stays open, and the whole thing should run without a single paid API.

## The constraint does the designing

Once you commit to "no closed dependencies, no metered services," most decisions make themselves.

The base map had to be MapLibre GL. It is the open fork of Mapbox GL from before the license change, renders vector tiles beautifully, and asks for no token. This matters more than it sounds. A hobby GIS project with a Mapbox or Google Maps dependency has a billing time bomb attached: one link shared in the wrong group chat and the free tier evaporates. With MapLibre on OpenStreetMap-derived tiles, popularity is not a financial event.

For data layers on top of the map, deck.gl. When the plan includes country-wide population distribution, you are eventually rendering a very large number of points or polygons, and deck.gl pushes that work onto the GPU. Alongside it sits three.js for a different job: not data plumbing but presentation, the cinematic scenes and custom 3D representations that make people actually want to explore a dataset instead of dutifully squinting at a choropleth.

The frontend around all this is unexciting on purpose: React 19, Vite, TypeScript, shadcn/ui and Tailwind v4. The charting library is genuinely undecided, ECharts and Recharts are both still in the running, and I have made peace with leaving that choice until there is real data to chart.

## PMTiles, or the tile server that is not there

My favourite decision in the stack is the one that removes a server. Vector tiles normally imply a tile server: something running, awake at 3 a.m., serving little squares of geometry on demand. PMTiles collapses the entire tileset into one static file, and clients fetch just the byte ranges they need over ordinary HTTP.

That single format choice changes the economics of the whole project. The map data becomes a file you upload, not a service you operate. The app plus tiles deploys to Cloudflare Pages with one command, and there is nothing to monitor, patch or pay for by the request. For a solo project meant to live a long time, "nothing is running" is the most durable architecture there is.

## The part I have not done yet

Here is where honesty is due: Ceylon Hub today is early-stage scaffolding. The stack described above is chosen, wired and deployed at [ceylon-hub.pages.dev](https://ceylon-hub.pages.dev), and the data sources are identified. But identified is not ingested. The planned pipeline is Python with GeoPandas, taking GADM boundaries, census tables, WorldPop rasters, HDX datasets and Copernicus or SRTM elevation, and turning them into clean layers and PMTiles archives.

That pipeline is where the real difficulty lives, and I say this with full awareness that I built the pretty part first. Government statistics come as spreadsheets designed for printing. Boundary datasets disagree with each other about where lines are. Names need to exist in Sinhala, Tamil and English and be joinable across sources that romanize them differently. None of that is hard the way shaders are hard; it is hard the way cleaning is hard, hours of it, with judgment calls that no library makes for you.

So the current status is a skeleton with excellent bones and no flesh: a deployed app, a rendering stack that can handle what is coming, and a to-do list that is mostly data work. If the repo goes quiet for stretches, it is because the interesting-looking commits are done and the important ones are slow.

What exists is open under MIT, and the constraint stands: when the population layers land, they will be built from open sources, served as static files, and owe nobody an API key.

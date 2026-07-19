---
title: 'Ceylon Hub'
tagline: 'all of Sri Lanka, on one open map'
description: 'An interactive GIS web app for exploring Sri Lanka: provinces, districts, divisional secretariats, cities, postal codes and demographics on fast 2D and 3D maps, built entirely on open data.'
tags: ['TypeScript', 'React', 'MapLibre', 'GIS']
repo: 'https://github.com/prabhavalabs/ceylon-hub'
link: 'https://ceylon-hub.pages.dev'
status: 'incubating'
featured: false
order: 11
---

## The itch

Sri Lanka's geographic and statistical data exists, but it is scattered: census figures in one government portal, administrative boundaries in GADM, population rasters at WorldPop, humanitarian datasets on HDX, roads and places in OpenStreetMap. There is no single place where you can just look at the country. Ceylon Hub wants to be that place, with every data source and every dependency open.

## How it is built

React 19 with Vite and TypeScript, with MapLibre GL for the map so there is no Mapbox token to babysit and no bill that scales with curiosity. deck.gl handles layered geospatial visualization, and three.js is there for the datasets that deserve a proper 3D scene. The clever part of the hosting story is PMTiles: vector tiles packed into static files, which means the whole app deploys to Cloudflare Pages with no tile server running anywhere. A Python and GeoPandas pipeline for processing the source data is planned.

## Status

Early scaffolding, honestly. The stack is chosen and deployed, and the actual data work, which is the hard part, is still ahead. Why I picked this particular pile of tools is in [the case study](/blog/ceylon-hub-story).

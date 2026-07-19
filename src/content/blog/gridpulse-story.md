---
title: 'An outage tracker has to work during the outage'
description: 'GridPulse maps every power cut in Sri Lanka by fusing official CEB data with anonymous neighbour reports. The whole design falls out of one constraint: a phone, in the dark, on a bad connection.'
date: 2026-07-19
tags: ['case-study', 'gridpulse', 'pwa']
lang: 'en'
---

A power cut in Sri Lanka comes with a ritual. You refresh the CEB Care site
to see if your area made the list. You text a cousin two streets over,
because whether they have power tells you if the problem is the grid or
your own tripped main. Then you settle in with the real question, the one
nothing answers: when is it coming back?

The frustrating part is that the information mostly exists. The Ceylon
Electricity Board publishes outage data. Your neighbours know exactly what
is happening on your street. But the official feed and the neighbourhood
knowledge never meet, and neither is friendly to a phone in a dark room.
GridPulse exists to put both on one map.

## Two feeds, one story

GridPulse reads official outages from the publicly available CEB Care
endpoints and shows them beside reports submitted by people who are
actually sitting in the dark. The map draws both as layers you can toggle,
and the home screen boils it all down to a plain-language answer: is the
power out at your location, and how many neighbours are affected.

The interesting problem is duplication. If you report a cut that CEB has
already announced, a naive app shows two markers for one event and the map
slowly turns into noise. GridPulse merges the two into a single story, one
outage backed by two kinds of evidence. The obligatory note: the project is
not affiliated with or endorsed by CEB. It reads what CEB makes public and
adds what CEB cannot see, which is what the street actually looks like.

## Anonymity as a conversion decision

Reporting a cut takes two taps. Pick where it is, optionally add a note,
submit. You never create an account. On first launch the app hands you a
random pseudonym, something like "Brave Peacock", and that is the only
identity attached to anything you report.

This was less a privacy stance than an admission about human behaviour.
Crowd data is only as good as the crowd, and a crowd only forms when
contributing costs nothing. Nobody sitting in a dark house is going to
complete an email verification flow to announce the obvious. So the app
asks for nothing: no email, no phone number, no tracking.

The trade-off is real. Nothing stops a wrong or mischievous report. The
official CEB layer acts as ballast, and merged stories give a report more
context than it would have alone, but the community layer ultimately runs
on good faith. I chose to accept that rather than add friction, because a
perfectly verified map with no reports on it helps nobody.

## Built for the failure case

Here is the awkward constraint at the heart of the project: an outage
tracker is most needed at the exact moment the infrastructure around it is
failing. The router is down. The mobile network in the area is strained.
Your phone is the one screen left, and you would rather not drain it.

So GridPulse is a PWA that treats connectivity as a nice-to-have. Once you
have opened it once, the app shell, the map tiles for your area, and your
last known set of outages are cached on the device. A report filed while
offline goes into a queue and syncs on its own when the connection returns.
The interface follows the same logic: big touch targets, one-handed
layouts, readable in dark mode, nothing precious.

## Where exactly is "here"

GPS is optional. If it is off, or you are checking on family in another
town, a type-ahead search covers every populated place in the country, and
you can save a home location so the app stops asking where you live. The
geocoding and population data behind that search come from GeoPop, another
Prabhava Labs project: a self-hosted Sri Lanka geocoder, which means a free
app does not have to lean on a paid geocoding API to know where Kurunegala
is.

## The name is the localization

The app runs in English, Sinhala, and Tamil, with every label and message
translated. The detail I care most about is the name. In Sinhala the app is
not called "GridPulse". It is කරන්ට් කට්, literally "current cut", because
that is simply what the event is called in daily speech. The Tamil name,
கரன்ட் கட், is the same phrase. Localizing the name to the vernacular
instead of protecting the brand felt more honest than the reverse.

Beyond the live view there is a stats page: island-wide totals, active
outages and people affected, today against yesterday, the worst-hit areas
right now, and a per-area drilldown with peak-hour history. A single outage
is an annoyance; the pattern of outages is information, and once the data
is flowing, surfacing the pattern is nearly free.

## Where it stands

GridPulse is live at
[gridpulse-cyr.pages.dev](https://gridpulse-cyr.pages.dev), with source at
[github.com/prabhavalabs/gridpulse](https://github.com/prabhavalabs/gridpulse)
under MIT.

The honest caveats. It depends on publicly available CEB Care endpoints
rather than an official API, so that integration can break whenever CEB
changes something on their side, and there is nothing I can do about that
except adapt quickly. And the community layer has the standard cold-start
problem: reports make the map useful, a useful map attracts reporters, and
that loop has to be started by people generous enough to report into a
quiet map.

Sri Lanka is not the only country with this ritual. The license lets you
fork it, swap the official data source, and point it at your own grid.

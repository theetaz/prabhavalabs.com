---
title: 'Attendly'
tagline: 'a tuition class, run from one door'
description: 'Attendance, billing, and notifications for a 100+ student tuition class: a Go + SQLite backend, a React admin portal, and an offline-capable mobile door check-in app with QR scanning.'
tags: ['Go', 'SQLite', 'Expo', 'React']
repo: 'https://github.com/prabhavalabs/attendly'
link: 'https://attendly.prabhavalabs.com'
status: 'active'
featured: false
order: 2
image: '/images/projects/attendly.jpg'
---

## The itch

This one started with a stranger's problem. A Reddit user running a small
tuition class described how they still marked attendance on paper: no
system, no history, disputes about payments with no records to settle them.
The class was too small to justify commercial school software and too real
to keep running on memory.

Attendly is the answer built properly: an open-source system a single
teacher can self-host for the cost of a small VPS.

## How it works

A Go backend with embedded SQLite carries all the business logic: students,
lecturers, timetables, role-based access, scheduled jobs, and PDF
generation. Queries run in microseconds because the database lives inside
the process. A React admin portal handles the office work: rosters,
attendance heatmaps, invoices, defaulter tracking.

The piece that makes it real is the door check-in app: an Expo mobile app
built for the person standing at the classroom door. Students scan a QR
card or get looked up by name, and the app keeps working when the
connection dies, syncing once it returns.

## Status

Actively developed and running in production for a real class. The full
story, including screenshots of the whole system, is in
[the case study](/blog/attendly-story).

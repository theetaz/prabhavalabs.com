---
title: 'Prabhava Labs: publishing the decision record with the code'
description: 'The publishing model behind this studio: every open-source release ships with the reasoning that produced it, including the approaches that were rejected.'
date: 2026-07-19
tags: ['meta', 'open-source']
---

An open-source README documents what a tool does. The reasoning that
produced the tool, what was tried first, which designs were rejected and
why, usually never gets published. For anyone evaluating the code or
extending it, that reasoning is often more useful than the feature list,
and it is the part that disappears.

Prabhava Labs is a publishing model built to keep that context attached to
my own work. Every project on [the shelf](/projects) ships three
artifacts:

- **The code.** MIT licensed, on GitHub, with no restrictions beyond the
  license.
- **The story.** Why the project was built, what it replaced, and where
  the design ran into trouble.
- **The decisions.** Engineering write-ups on this blog when a problem
  justifies a longer treatment.

## What the blog covers

Posts here are working notes rather than announcements: performance
investigations, API design decisions and the alternatives considered,
infrastructure choices for running services cheaply on edge platforms,
and post-mortems when a design did not work. When something failed, the
write-up says so and states why.

New posts appear in the [index](/blog), which is RSS friendly, and each
repository is public on GitHub as it develops.

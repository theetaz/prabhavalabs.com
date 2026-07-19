---
title: 'MendLog'
tagline: 'speak the repair, skip the form'
description: 'A voice-first field journal for industrial machine repair technicians. Speak the job in Sinhala or English; MendLog transcribes it, structures it, and makes past repairs searchable.'
tags: ['React Native', 'Supabase', 'Voice', 'OpenAI']
repo: 'https://github.com/prabhavalabs/MendLog'
status: 'incubating'
featured: false
order: 13
image: '/images/projects/mendlog.jpg'
---

## The itch

Industrial repair technicians fix several machines a day, and after each job comes a paper form: root cause, corrective action, idle time, parts used. On a busy day the form gets skipped, and most days are busy. The knowledge of how a fault was actually diagnosed and fixed leaves the building with whoever fixed it.

## The idea

Replace the form with a voice memo and a few photos. The technician speaks in Sinhala or English, and MendLog transcribes the memo, extracts the structured fields, and files the job. Past jobs become semantically searchable by text, photo or error code, so the next person facing a similar fault can pull up prior diagnoses instead of starting from zero.

The stack is React Native with Expo on the front, Android first because that is what technicians carry, and Supabase underneath: Postgres, auth, storage, and pgvector for the semantic search. OpenAI handles transcription and structured extraction. Mid-range phones and patchy connectivity are the design targets, so memory efficiency and offline tolerance are treated as features, not afterthoughts.

## Status

Early development, and I mean early: the plan exists and nothing is wired up yet. The honest scope is in [the case study](/blog/mendlog-story).

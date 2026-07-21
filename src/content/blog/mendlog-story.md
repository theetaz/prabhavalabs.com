---
title: 'MendLog: voice capture as the primary interface for repair records'
description: 'The design behind MendLog: Sinhala and English voice memos transcribed into structured repair records with semantic retrieval over pgvector. Nothing is wired up yet, and this post says so.'
date: 2026-07-19
tags: ['case-study', 'mendlog', 'voice']
lang: 'en'
---

Machine repair generates records that rarely get written. The form that
should capture root cause, corrective action, idle time, and parts used
is filled in later, from memory, or not at all, because the next machine
is already down. The organization then repairs the same faults
repeatedly while the diagnostic knowledge stays in the heads of whoever
was on shift. [MendLog](https://github.com/prabhavalabs/MendLog) is a
bet that the medium is the problem: forty years of skipped paper forms
suggest the form itself does not survive a workshop, and speech does.
The technician records a voice memo in Sinhala or English, takes a few
photos, and moves on. MendLog transcribes the memo, extracts the
structured fields the form would have collected, and files the job.

## Retrieval is the other half

A repair archive is useful only if it can be queried. Jobs are
semantically searchable by text, photo, or error code through pgvector.
The target case is concrete: a technician facing a fault code on an
unfamiliar machine should be able to retrieve how a colleague diagnosed
the same fault months earlier. That query is the point at which the
captured records pay back the cost of capturing them.

## Stack

The stack is chosen for the deployment environment rather than for a
demo. React Native with Expo, Android first, because the target device
is a mid-range Android phone; that constraint makes memory efficiency
and offline tolerance design requirements rather than optimizations.
Supabase provides Postgres, auth, storage, and the vector search in one
service, which is the right amount of backend for a solo project at this
stage. OpenAI handles transcription and structured extraction;
transcription quality on spoken Sinhala is unverified, and I intend to
test it before trusting it.

## Status

MendLog is in early development and nothing is wired up yet. The
repository contains a README, a license, and a plan; no pipeline runs.
Every paragraph above describes intent, and it is better to state that
plainly than to write around it.

The next milestone is the decisive one: record a memo on a low-cost
Android phone and get a correctly structured job record out the other
end, in both languages. That result either validates the core bet or
ends the project, and either outcome will be documented.

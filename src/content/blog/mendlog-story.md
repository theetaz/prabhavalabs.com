---
title: 'The repair happened, the record did not'
description: 'MendLog wants to replace the paper form technicians skip with a voice memo they will actually make. It is early enough that nothing is wired up yet, and this post says so.'
date: 2026-07-19
tags: ['case-study', 'mendlog', 'voice']
lang: 'en'
---

A machine repair technician's day produces two things: fixed machines and paperwork about the fixing. Only one of those is optional in practice. The form that should capture root cause, corrective action, idle time and parts used gets filled in later, or from memory, or not at all, because the next machine is already down. The result is an organisation that repairs the same faults over and over while the knowledge of past diagnoses sits in the heads of whoever happened to be on shift.

[MendLog](https://github.com/prabhavalabs/MendLog) is a bet that the fix is changing the medium, since forty years of paper forms suggest the form itself is the problem. Talking is the one documentation method that survives a workshop. So instead of a form, the technician records a voice memo in Sinhala or English, snaps a few photos, and moves on. MendLog transcribes the memo, extracts the structured fields the form wanted anyway, and files the job.

The second half of the bet is retrieval. A filing cabinet of past repairs is only useful if you can interrogate it, so jobs are semantically searchable by text, photo or error code through pgvector. The technician staring at a fault code on an unfamiliar machine should be able to surface how a colleague diagnosed the same fault months earlier, which is the moment all that captured knowledge pays for itself.

The stack is chosen for the environment rather than the demo. React Native with Expo, Android first, because the target device is a mid-range Android phone, and that constraint makes memory efficiency and offline tolerance design requirements rather than optimizations. Supabase covers Postgres, auth, storage and the vector search in one place, which is about the right amount of backend for a solo project at this stage. OpenAI does the transcription and structured extraction, and doing justice to spoken Sinhala is exactly the kind of thing I intend to test before trusting.

Now the honest part, and the reason this post is short: MendLog is in early development and nothing is wired up yet. There is a README, a license, a plan, and conviction. No pipeline runs. Every paragraph above describes intent, and I would rather say that plainly than write around it.

The next milestone is unglamorous and decisive: record a memo on a cheap Android phone, get a correctly structured job out the other end, in both languages. If that works, MendLog is real. If it does not, at least the failure will be documented, which is more than the paper forms manage.

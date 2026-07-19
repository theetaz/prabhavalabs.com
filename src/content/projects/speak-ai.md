---
title: 'SpeakEasy AI'
tagline: 'spoken English practice with a patient AI'
description: 'A voice conversation partner for English learners: real-time WebRTC calls with an AI tutor that quietly logs your grammar and vocabulary slips, then shows you the corrections after you hang up.'
tags: ['TypeScript', 'React Native', 'LiveKit', 'Voice AI']
repo: 'https://github.com/prabhavalabs/speak-ai'
status: 'incubating'
featured: false
order: 7
---

## The itch

You can read and watch English all day and still freeze when you have to
speak it. Speaking needs a partner, and human partners have limits: tutors
cost money per hour, and friends are patient exactly once. SpeakEasy is a
conversation partner that is always free at 11pm and has never once
laughed at anyone's accent.

## How it works

The Expo mobile app joins a LiveKit room over WebRTC, and an AI agent gets
dispatched into the same room. From there it is a live voice loop: your
speech goes through Deepgram for transcription, GPT-4.1 decides what to
say, and Cartesia turns the reply into a voice. The agent reads your
profile from the room metadata, so an A2 beginner and a C1 speaker get
noticeably different conversation partners.

The part I care most about is what the tutor does not do. It does not
interrupt. While you talk, the model silently files grammar errors,
pronunciation flags, and vocabulary suggestions through function tool
calls. When the session ends, the transcript and all that feedback land in
Supabase, and you get a review screen with the corrections. Mid-sentence
correction kills fluency; this keeps the conversation moving and saves the
red ink for later.

## Status

A working prototype from early 2026, quiet since. LiveKit is self-hosted
via Docker, the database is Supabase with row-level security, and running
it takes three terminals and a dev build, since LiveKit's native modules
rule out Expo Go. The full pipeline story is in the
[case study](/blog/speak-ai-story).

---
title: 'VoiceMind'
tagline: 'voice memos that turn into readable text'
description: 'Voice memos with live transcription while you speak, a second more careful transcription pass afterwards, word-level highlighted playback, and an automatic summary of every note.'
tags: ['TypeScript', 'React Native', 'LiveKit', 'Self-hosted']
repo: 'https://github.com/prabhavalabs/voice-mind'
status: 'incubating'
featured: false
order: 8
image: '/images/projects/voice-mind.jpg'
---

## The itch

Voice memos are the fastest way to capture a thought and the worst way to
find one again. Every recording app produces a graveyard of audio files
named by timestamp that nobody ever listens back to. The fix is obvious
once you say it out loud: memos should become text you can read, search,
and skim.

## How it works

While you record, audio streams over a self-hosted LiveKit server to a
transcription agent, and Deepgram Nova-2 puts your words on screen as you
say them. After you stop, OpenAI Whisper re-transcribes the whole
recording with full context, so the version that gets kept is the careful
one, not the fast one. GPT-4o-mini then writes a summary, and playback
highlights each word as the audio reaches it, thanks to word-level
timestamps.

The whole backend is self-hosted: Supabase and LiveKit both run on a VPS
behind Caddy. Voice notes are about as personal as data gets, and I would
rather they live on a machine I control at a fixed monthly cost.

## Status

An early prototype from February 2026. The mobile app works through Expo
dev builds (LiveKit's native modules rule out Expo Go), while the web and
desktop apps in the monorepo are labeled phase 2 and phase 3, which is a
polite way of saying they are folders. The reasoning behind the two
transcription passes is in the [case study](/blog/voice-mind-story).

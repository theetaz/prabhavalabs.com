---
title: 'VoiceMind: two transcription passes for every voice memo'
description: 'Why VoiceMind streams audio to Deepgram Nova-2 while you record and re-transcribes the whole memo with Whisper afterwards: the live pass is feedback, the batch pass is the record.'
date: 2026-07-19
tags: ['case-study', 'voice-mind', 'transcription']
lang: 'en'
---

Voice memos have a retrieval problem. Capture takes seconds, which is why
they accumulate: a parking spot, a partial idea, a reminder. Retrieval
means scrubbing through audio files named by date, replaying your own
voice to locate one sentence. Audio works as a capture format and fails
as a storage format.
[VoiceMind](https://github.com/prabhavalabs/voice-mind) converts memos to
text automatically, with a summary per memo, so retrieval is reading
rather than listening. The design decision this post covers is that every
memo is transcribed twice, deliberately, by two different systems.

## The streaming pass

During recording, the audio does not sit in a local file. It streams over
LiveKit to a transcription agent, and Deepgram Nova-2 returns words in
real time, so the transcript assembles on screen while the user is still
speaking.

The purpose of this pass is not the text it produces. It is operational
feedback: the visible transcript confirms that the system is receiving
audio, the connection is up, and the memo will exist after recording
ends. The alternative is recording into a silent interface with no
confirmation until afterwards. The cost of streaming is accuracy: a model
that must respond within milliseconds commits to words before the rest of
the sentence arrives, and the output shows it.

## The batch pass

The second pass exists to fix that. Once recording stops, OpenAI Whisper
re-transcribes the entire audio in one operation. Unlike the streaming
model, Whisper sees the whole memo with context on both sides of every
word and has no latency budget. The stored transcript, the one that gets
searched and read later, comes from this pass.

The two passes split the job cleanly: Deepgram serves the recording
experience, Whisper produces the record. The batch pass also emits
word-level timestamps, which drive playback: when a memo is replayed,
each word highlights as the audio reaches it, keeping the reader's
position and the audio position aligned.

Once a reliable transcript exists, summarization costs little.
GPT-4o-mini writes a short summary of every memo, and the per-call cost
is low enough that it runs on everything, including seven-second parking
notes.

## Why a memo app runs a WebRTC stack

The unusual part of the architecture is LiveKit: real-time media
infrastructure of the kind deployed for video calls, inside an app that
records solo audio notes. Record-then-upload would have been a fraction
of the complexity.

Record-then-upload cannot produce the streaming pass. Rendering words
while the user speaks requires audio flowing to a server while the
microphone is still open, which is a streaming media problem regardless
of app size. LiveKit's costs extend beyond the server itself: its native
modules rule out Expo Go, so development requires dev builds through
Xcode or Android Studio, and the deployment needs TURN configured for
phones on restrictive networks. That complexity pays for one feature, and
I judged the feature to be the product.

## Self-hosting both halves

The other deliberate choice is that nothing runs on a managed cloud.
Supabase and LiveKit are both self-hosted on a VPS, with Docker Compose
underneath and Caddy in front handling TLS.

Voice memos justify this more than most data: they are unfiltered
thinking out loud, among the most personal datasets a person produces,
and keeping them on a controlled machine at a fixed monthly cost was the
requirement. The operational cost is documented in the repository itself:
the docs folder contains six separate setup guides covering the VPS,
Supabase, LiveKit, the database schema, edge functions, and the mobile
build. A side project that needs six guides to stand up is not free to
operate, whatever the bill says.

One boundary needs stating. The audio still leaves the VPS for the AI
steps, since Deepgram, Whisper, and GPT-4o-mini are all external APIs.
Self-hosting controls where memos are stored, not every hop they take in
processing.

## Status and moving forward

VoiceMind is an early prototype from February 2026, and the repository
has not changed since. The monorepo reflects its actual state: apps/mobile
is a working Expo app, while apps/web (Next.js, phase 2) and apps/desktop
(Tauri, phase 3) are scaffolding without implementations.

The two-pass design is the part that carries forward into any future
version. The passes answer different questions: the streaming pass
answers "is this working?" during recording, and the batch pass answers
"what did I say?" for every read afterwards. Paying for transcription
twice is the correct trade because no single system answers both. If work
resumes, the first target is the web app, since reading and searching
notes is the part of the product a phone screen serves worst.

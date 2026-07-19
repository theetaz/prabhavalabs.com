---
title: 'Transcribe everything twice'
description: 'VoiceMind shows your words on screen while you record a memo, then quietly redoes the entire transcription after you stop. Both passes exist for different reasons.'
date: 2026-07-19
tags: ['case-study', 'voice-mind', 'transcription']
lang: 'en'
---

Voice memos have a retrieval problem. Recording one takes three seconds
and zero thought, which is exactly why they pile up: a parking spot, half
an app idea, something to tell someone later. Then two weeks pass and you
are scrubbing through audio files named by date, listening to your own
voice at 2x, looking for one sentence you can no longer place. Audio is a
brilliant capture format and a terrible storage format.

[VoiceMind](https://github.com/prabhavalabs/voice-mind) is my answer:
voice memos that turn into text automatically, with a summary on top, so
finding a thought means reading instead of listening. The design decision
worth writing about is in the title. Every memo gets transcribed twice, on
purpose, by two different systems.

## Pass one: fast

While you record, the audio does not sit in a file on your phone. It
streams over LiveKit to a transcription agent, and Deepgram Nova-2 sends
words back in real time, so the transcript assembles itself on screen
while you are still talking.

The live pass is not really about the text it produces. It is feedback.
Watching your words appear as you say them tells you the system heard you,
the connection is up, and the memo will actually exist afterwards.
Recording into a silent interface and hoping is the old anxiety this
replaces. The price of a streaming transcription is accuracy: a model that
must answer within milliseconds commits to words before hearing how the
sentence ends, and it shows.

## Pass two: careful

That is why the second pass exists. Once the recording stops, OpenAI
Whisper re-transcribes the entire audio in one go. Unlike the streaming
model, Whisper sees the whole memo with full context on both sides of
every word, and it has no deadline. The transcript that gets kept, the one
you search and read later, comes from this pass.

So the two passes split the job cleanly: Deepgram is the experience while
you record, Whisper is the record itself. Nobody rereads a live caption
after the talk ends, and nobody wants their permanent notes taken by the
fastest writer in the room.

The careful pass also carries word-level timestamps, which pay for
themselves in playback. When you replay a memo, each word highlights as
the audio reaches it, karaoke style, so your eyes and ears stay in the
same place. And once a reliable transcript exists, summarization is
almost free: GPT-4o-mini writes a short summary of every memo, and it is
cheap enough that running it on everything, including the
seven-second parking notes, costs effectively nothing.

## Why a memo app owns a WebRTC stack

The strange-sounding part of this architecture is LiveKit. It is
real-time media infrastructure, the kind of machinery you deploy for
video calls, sitting inside an app whose job is recording solo audio
notes. Record-then-upload would have been a fraction of the complexity.

But record-then-upload cannot do the live pass. Words appearing while you
speak requires audio flowing to a server while the microphone is still
hot, and that is a streaming problem whether I like it or not. LiveKit
brings costs beyond the server itself: its native modules mean Expo Go
does not work, so development requires proper dev builds through Xcode or
Android Studio, and the infrastructure needs TURN configured for phones on
unfriendly networks. I paid that complexity for one feature. I still
think the feature is the product.

## Self-hosting both halves

The other deliberate choice is that nothing here runs on a managed cloud.
Supabase and LiveKit are both self-hosted on a VPS, with Docker Compose
underneath and Caddy in front handling TLS.

Voice memos earn that treatment more than most data. They are unfiltered
thinking out loud, which is about as personal as a dataset gets, and I
would rather they sit on a machine I control at a fixed monthly cost than
in someone else's bucket. The honest cost is operations: the repo's docs
folder contains six separate setup guides covering the VPS, Supabase,
LiveKit, the database schema, edge functions, and the mobile build. When
a side project needs six guides to stand up, self-hosting has stopped
being free in any sense except the billing one.

There is also a boundary worth admitting: the audio still leaves the VPS
for the AI steps, since Deepgram, Whisper, and GPT-4o-mini are all
external APIs. Self-hosting protects where memos live, not every hop they
take along the way.

## Where it stands

VoiceMind is an early prototype from February 2026, and the repo has been
quiet since. The monorepo is honest about its ambitions in a way I find
funny now: apps/mobile is a working Expo app, while apps/web (Next.js,
phase 2) and apps/desktop (Tauri, phase 3) are folders containing mostly
intention.

The two-pass idea is the part I would keep in any future version. Paying
for transcription twice sounds wasteful until you notice the passes answer
different questions: "is this working?" during the recording, and "what
did I say?" forever after. If the project moves again, the first job is
the web app, because reading and searching your notes is exactly the part
a phone screen is worst at.

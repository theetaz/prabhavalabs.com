---
title: 'SpeakEasy AI: deferred correction in a real-time voice tutor'
description: 'The architecture of a WebRTC voice partner for English learners: a LiveKit agent pipeline over Deepgram, GPT-4.1, and Cartesia, and why corrections are recorded silently and delivered after the session ends.'
date: 2026-07-19
tags: ['case-study', 'speak-ai', 'voice-ai']
lang: 'en'
---

Learners of English as a second language have abundant input: video,
books, and subtitles are effectively unlimited and mostly free. Speaking
practice is the constrained side. Tutors charge by the hour, language
exchange partners expect reciprocity, and practicing badly in front of a
person carries a social cost that reading never does.
[SpeakEasy AI](https://github.com/prabhavalabs/speak-ai) addresses this
with a real-time voice conversation partner: an AI that adapts to the
learner's level and, by design, delivers corrections after the
conversation rather than during it.

## Architecture

The app is an Expo React Native client, but the conversation itself runs
in a LiveKit room over WebRTC. Starting a conversation writes a session
record to Supabase, fetches a room token from an edge function, and joins
the room. LiveKit then dispatches the agent, a Node.js process built on
the LiveKit Agents SDK, into the same room. From there the session is a
pipeline: user speech goes to Deepgram for transcription, the text goes
to GPT-4.1, and the reply returns through Cartesia's text-to-speech.

WebRTC is more infrastructure than recording clips and posting them to an
API, and the reason for accepting it is latency. Response time determines
whether the exchange functions as a conversation or as an exchange of
voice messages, and streaming audio in both directions through a media
server is what keeps the round trip short enough for the former.

## Level-aware prompting

Onboarding collects four fields: native language, English level, learning
goals, and preferred topics. The profile is stored in Supabase, and when
the agent joins a room it reads the profile from the participant metadata
and builds its system prompt around it. Levels follow CEFR: the prompt
for an A2 learner produces short sentences and patient rephrasing, while
a C1 speaker gets discussion pitched at colleague level.

This adaptation carries most of the product's value. A partner pitched at
the wrong level fails in both directions: too simple provides no
practice, and too difficult reproduces the freezing-up the app exists to
remove.

## Deferred correction

The central design decision is that the agent never corrects the learner
aloud during the conversation.

It records the errors instead. While the user talks, the LLM makes silent
function tool calls: this sentence contained a grammar error, that word
was probably mispronounced, here is a more natural phrasing for the
intended meaning. The tool calls accumulate while the conversation
continues uninterrupted. When the session ends, the agent saves the full
transcript and all recorded feedback to Supabase, and the app presents a
post-conversation review of the corrections and suggestions.

Experienced human tutors work the same way, and for the same reason:
correction mid-sentence shifts the learner from forming thoughts to
monitoring correctness, which is a different skill from fluency. The
trade-off is real. Feedback arrives minutes after the mistake rather than
seconds, and a learner can repeat the same error several times in a
session before seeing it flagged. I consider the trade favorable for a
fluency-focused tool.

One limitation belongs in this section. The agent judges pronunciation
through the transcription layer: the LLM never hears the audio, only what
Deepgram produced from it. A flagged pronunciation issue is therefore an
inference from a garbled transcript, which catches large errors but is
not phonetic analysis. Grammar and vocabulary feedback operate on text
directly and rest on firmer ground.

## Deployment and access control

LiveKit runs self-hosted in Docker with Redis, on development keys that
the README instructs replacing before any production use. Supabase
provides auth, the database, and the token edge function. Every table has
row-level security, so users can read only their own transcripts and
feedback. The agent writes with a service role key, since it files
feedback into accounts that are not its own.

The development setup is heavy and worth stating plainly. LiveKit's
native modules rule out Expo Go, so development requires a dev build
through Xcode or Android Studio, and a working session needs three
processes running (LiveKit, the agent, Expo) plus Supabase alongside.

## Status

SpeakEasy came together in February 2026 and the repository has not
changed since. The full loop works as designed: onboard, converse, end
the session, read the corrections. What remains untested is everything
that only appears at scale, starting with cost. Each minute of
conversation touches three paid APIs (Deepgram, OpenAI, Cartesia), a
structure that is workable for one person practicing and unresolved for
anything larger.

## Moving forward

Two components would survive into any future version unchanged: the
room-per-conversation model and the silent tool call design for deferred
feedback. The open problem is per-minute economics, and it is not
addressable from the architecture side; the pipeline already does the
minimum work per minute that the product requires.

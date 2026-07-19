---
title: 'The tutor that holds its tongue'
description: 'SpeakEasy AI is a real-time voice partner for English learners. The hard part was not making it talk. It was making it shut up about your mistakes until you finish.'
date: 2026-07-19
tags: ['case-study', 'speak-ai', 'voice-ai']
lang: 'en'
---

There is a strange asymmetry in learning English as a second language. The
input side is solved: videos, books, and subtitles are endless and mostly
free. The output side is not. Speaking needs a partner who will let you
stumble through sentences at your own speed, and every available option
has a catch. Tutors charge by the hour. Language exchange partners want
something back. Friends are supportive for about one conversation. And
underneath all of it sits the real blocker, which is that being bad at
something out loud, in front of a person, is embarrassing in a way that
being bad at reading never is.

[SpeakEasy AI](https://github.com/prabhavalabs/speak-ai) is my attempt at
a partner without the catch: an AI you have an actual voice conversation
with, that knows your level, and that never gets tired or amused.

## A phone call with a pipeline on the other end

The app is an Expo React Native client, but the conversation itself
happens in a LiveKit room over WebRTC. When you tap "Start Conversation,"
the app writes a session record to Supabase, fetches a room token from an
edge function, and joins. LiveKit then dispatches the agent, a Node.js
process built on the LiveKit Agents SDK, into the same room, and you are
effectively on a call with a pipeline: your speech goes to Deepgram for
transcription, the text goes to GPT-4.1, and the reply comes back through
Cartesia's text-to-speech as a voice.

Why drag WebRTC into this instead of recording clips and posting them to
an API? Latency, mostly. A conversation is only a conversation if the
response comes back before you have mentally left. Streaming audio both
ways through a media server is more machinery than a request-response
loop, but it is the difference between talking with someone and
exchanging voicemails.

## It knows who it is talking to

Onboarding asks four things: your native language, your English level,
your goals, and the topics you want to talk about. That profile lives in
Supabase, and when the agent joins a room it reads the user's profile from
the participant metadata and builds the system prompt around it. The
levels follow CEFR, so the prompt for an A2 learner produces short
sentences and patient rephrasing, while a C1 speaker gets something closer
to an opinionated colleague.

This sounds like a small feature and is arguably the whole product. A
conversation partner pitched at the wrong level is useless in both
directions: too simple is boring, too hard is the exact freezing-up
experience the app exists to avoid.

## The best feature is restraint

Here is the design decision I would defend in a fight. During the
conversation, the AI never corrects you out loud.

It notices, though. While you talk, the LLM makes silent function tool
calls: this sentence had a grammar slip, that word was probably
mispronounced, here is a more natural phrase for what they were reaching
for. The tools write it all down and the conversation just keeps going.
When you end the session, the agent saves the full transcript plus every
piece of that feedback to Supabase, and the app shows you a
post-conversation review with the corrections and suggestions.

Good human tutors already work this way. If someone corrects you
mid-sentence, you stop forming thoughts in English and start performing
correctness, which is a different and mostly useless skill. Fluency comes
from continuing. The trade-off is real, though: feedback arrives minutes
after the mistake instead of seconds, and you might repeat an error five
times in a session before anyone tells you. I think the trade is worth it.

An honest limitation lives here too. The agent judges pronunciation
through the transcription layer: the LLM never hears your audio, it only
sees what Deepgram made of it. So a "pronunciation issue" is really an
inference from a garbled transcript, which catches the big stumbles but is
nothing like phonetic analysis. Grammar and vocabulary feedback, which
operate on text anyway, sit on much firmer ground.

## Self-hosting the loud part

LiveKit runs self-hosted in Docker with Redis, on dev keys that the README
tells you very plainly to replace before production. Supabase handles
auth, the database, and the token edge function. Every table has row-level
security, so users can only read their own transcripts and feedback; the
agent writes with a service role key, since it needs to file feedback into
accounts that are not its own.

The cost of all this honesty about infrastructure is a heavy development
setup. LiveKit's native modules mean Expo Go will not work, so you need a
proper dev build through Xcode or Android Studio. A working session takes
three terminals (LiveKit, agent, Expo) plus Supabase running on the side.
Nothing about that is elegant. All of it is at least understood.

## Where it stands

SpeakEasy came together in February 2026 and the repo has been quiet
since. The full loop works as designed: onboard, talk, hang up, read your
corrections. What is untested is everything that only shows up at scale,
starting with the bill. Each minute of conversation touches three paid
APIs (Deepgram, OpenAI, Cartesia), which is a fine cost structure for one
person practicing and an open question for anything more.

If I pick it back up, the parts I would keep without hesitation are the
room-per-conversation model and the silent tools. The per-minute
economics are the thing standing between prototype and product, and no
amount of architecture fixes that from the code side.

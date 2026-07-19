---
title: 'Building Vidura: YouTube refused to talk to my server, and other adventures'
description: 'The full story of building a Sinhala subtitle app for YouTube: blocked IPs, a residential proxy, one giant LLM call, and why the UI admits what it does not know.'
date: 2026-07-19
tags: ['case-study', 'vidura', 'llm']
lang: 'en'
translationOf: 'building-vidura-si'
---

The best math lecture I ever watched was a 40 minute YouTube video in
English. My cousin, who is smarter than me, could not finish it. Not because
of the math. Because of the English. Watching him rewind the same 30 seconds
three times to parse a sentence made something click for me: the language
barrier on educational YouTube is not an information problem, it is an
endurance problem. You can survive it for one video. Nobody survives it for a
whole course.

YouTube's answer is auto-translated captions, and for Sinhala they are
genuinely bad. Words translated one at a time, grammar from nowhere,
technical terms mangled into poetry. Paid dubbing services skip Sinhala
entirely. So I built [Vidura](https://vidura.prabhavalabs.com): a PWA where
you paste a YouTube link and get the video back with synced Sinhala
subtitles that read like something a person would say, plus an AI chat that
has actually read the transcript.

<img src="/images/blog/vidura/watch.png" alt="Vidura's watch page: a YouTube video with Sinhala subtitles overlaid, provenance badges above the transcript" />

This post is the story of the two problems that nearly killed it, and the
slightly unglamorous engineering that saved it.

## Problem one: YouTube does not talk to servers

My first version was almost insulting in its simplicity. The server takes a
video ID, fetches the caption track, translates it, done. It worked on my
laptop on the first try. I deployed it to my VPS, pasted a link, and got
nothing. Then I got nothing again, with error codes.

Here is the thing nobody tells you until you are inside it: YouTube treats
requests from datacenter IP ranges as bots, because they usually are. My
cheap VPS lives in exactly such a range. The same request that sailed
through from my home connection got a bot check from the server. No caption
track for you.

<img src="/images/blog/vidura/diagram-transcript.svg" alt="Diagram: direct requests from the VPS get blocked, yt-dlp through a residential proxy reaches the caption track, Gemini audio transcription is the fallback" />

I tried the polite options first. Rotating user agents, backing off, cookie
jars. None of it mattered, and honestly it should not: from YouTube's side,
my server looks identical to a scraper farm. The fix that finally held was
boring and it costs money: route yt-dlp through a paid residential proxy.
The request now exits through an IP that belongs to some household ISP, and
YouTube serves the caption track like nothing ever happened.

Why fight so hard for the official captions instead of just transcribing
the audio? Timestamps. YouTube's own caption track is accurate to the frame.
Audio transcription, which Vidura does fall back to when there is no proxy
or no captions, lands within about three seconds. Three seconds is the
difference between subtitles and a karaoke machine that is slightly haunted.

That fallback created a design decision I am weirdly proud of: every video
in Vidura wears a provenance badge. It tells you whether the timestamps came
from YouTube captions or from audio transcription, shows a computed sync
score, and names the model that translated it. When the data is second rate,
the UI says so. More apps should admit things.

## Problem two: translation that does not sound like a robot

The obvious way to translate a caption track is line by line. Loop over the
cues, send each one to a model, write down the answers. I built that first,
and the output was fascinating garbage. Each line was defensible on its own.
Read together, the word "function" became three different Sinhala words in
one lecture, sentences snapped in half at cue boundaries, and pronouns
pointed at people who were never introduced.

The problem is context. A caption cue is not a sentence, it is wherever the
speaker happened to pause. Translating cues independently means translating
with amnesia.

<img src="/images/blog/vidura/diagram-translate.svg" alt="Diagram: translating caption lines independently causes drift; Vidura sends the entire transcript in one structured-output call" />

So Vidura does the opposite: one structured-output call with the entire
transcript, plus the video title and description for grounding. The model
sees the whole lecture before it translates a single line, which is how a
human translator would work. Terminology stays consistent from minute 2 to
minute 40, and sentences flow across cue boundaries because the model knows
where the thought actually ends.

Two guardrails make this safe. The core prompt is immutable, so a user's
custom tone settings cannot accidentally break the output format. And an
alignment gate checks the result against the source cues; a translation
that drifts from its timestamps gets caught before anyone sees it.

This is also where [OpenRouter](https://openrouter.ai) earned its place.
Whole-transcript calls are large, and a 40 minute lecture is a lot of
tokens. Through OpenRouter I can point the same code at DeepSeek when I
want the price of a translation to round to zero, or at GPT when a video
deserves the fancy treatment, without touching the integration. Switching
models is a settings change, not a deploy. When you are one person paying
for your own infrastructure, that flexibility is the difference between an
experiment you keep running and one you quietly turn off.

<img src="/images/blog/vidura/library.png" alt="Vidura's library page showing processed videos with their sync scores" />

## The parts that came free

Once the transcript pipeline was honest and the translation was readable,
the rest of the app fell out of the same data. The chat assistant is
grounded in the transcripts of everything you have watched, so answers cite
the exact video and timestamp. Notes pin to the moment you took them.
Subtitle rendering got the full VLC treatment: size, colour, background,
position, all respected in fullscreen.

<img src="/images/blog/vidura/chat.png" alt="Vidura's chat assistant answering a question with citations into the video library" />

Everything is self-hosted. Your library, your notes, and your chat history
live on your own server, which for me is the same cheap VPS that YouTube
refuses to speak to directly. There is a pleasing symmetry in that.

## What I would tell past me

Buy the proxy on day one. I spent more evenings on polite workarounds than
the proxy costs in a year.

Send the model everything. My instinct was to keep LLM calls small and
cheap, and it produced worse translations at higher total cost than one
well-grounded large call.

Let the UI admit uncertainty. The provenance badges started as a debugging
aid and became the feature users mention most. People do not need perfect
data, they need to know which data to trust.

Vidura is open source under the [Prabhava Labs](https://github.com/prabhavalabs/vidura)
organisation. If you know someone learning from English YouTube through
sheer stubbornness, send them a link.

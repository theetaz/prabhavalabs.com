---
title: 'Two weeks with LangGraph: what a streaming agent scaffold taught me'
description: 'Lang Stream was a short, contained experiment: make an AI agent search the web and stream its answer as it reads. The repo is archived; the lessons were the product.'
date: 2026-07-19
tags: ['case-study', 'lang-stream', 'agents']
lang: 'en'
---

There are two ways an AI agent can answer you. The common one is the black box: you ask, a spinner spins, and eventually a finished essay arrives. The other is the one that interested me: the agent searches the web while you watch and the answer streams in token by token as information is retrieved, so reading it feels like watching a researcher think and write in real time.

In late 2025 I gave myself a contained window to understand the second mode properly, and [Lang Stream](https://github.com/prabhavalabs/lang-stream-ai-agent) is what came out: a full-stack agent application with a LangGraph brain, a FastAPI backend, a Next.js frontend, and the whole thing containerized so it starts with one command. The repo's first commit is from late October 2025 and its last from early November, which tells you what kind of project this was. It was a study, not a product, and I want to write about it honestly as one.

## Why these pieces

LangGraph was the reason the project existed. Chain-style agent frameworks make the happy path easy and everything else opaque; LangGraph instead has you define the agent as an explicit graph of states and transitions. Structured reasoning stops being something the model hopefully does and becomes something you can draw. For an agent that interleaves searching, reading and writing, that explicitness is the whole game: you can see exactly where a search result enters the flow and where generation resumes.

FastAPI earned its spot for one dominant reason: streaming is native to it. An async Python framework hands you token-level streaming over HTTP without ceremony, and it sits in the same language as the agent itself, so there is no serialization boundary between the graph and the endpoint. The API surface I ended up with is almost comically small, a single POST to `/api/v1/agent` with a query, and the response streams back as the agent works.

The rest of the stack is deliberately boring. PostgreSQL 16 for persistence. Redis 7 doing double duty as cache and message broker. Next.js 15 with shadcn/ui on the front, because I did not want to spend my two weeks hand-rolling accessible components. Every service runs in Docker on a shared network, data survives restarts in named volumes, and `docker-compose up --build` brings up all four containers with hot reloading on both the Python and TypeScript sides. Getting that developer loop right took real effort and was worth it: the scaffold rebuilds itself around you while you experiment, which is exactly what you want from a study project.

## What a scaffold is and is not

I keep calling Lang Stream a scaffold, and I mean that precisely. The README is setup instructions almost top to bottom: environment variables, ports, how to run the tests, how to add a shadcn component. That is not an accident or a gap I forgot to fill. The project's job was to hold the architecture still so I could poke at the interesting part, which was the agent graph and the streaming path.

It would be dishonest to dress it up as more. There is one real endpoint. The frontend is a chat surface, not an application. The test suite exists, pytest with a focus on the auth module, but coverage reflects a two week project. Nobody should deploy this as-is, and the README never claims otherwise.

What I actually took from it, and the reason I consider the experiment successful, splits in two. First, mechanics: I now know concretely how a LangGraph agent hands tokens to an async endpoint, where Redis fits when responses are being produced and consumed at different speeds, and how to keep a mixed Python and TypeScript stack pleasant inside Docker. Second, and more useful: streaming is a user experience decision that reaches all the way down into architecture. You cannot bolt it on at the end. Every layer, from the graph to the HTTP framework to the frontend rendering, has to be built to pass partial results through, and choosing tools that fight you on that (blocking frameworks, request-response-only clients) quietly forecloses the design.

## Archived, on purpose

The repo went quiet on November 9, 2025, and I have archived it rather than letting it fake aliveness on my profile. I am suspicious of the habit, mine included, of keeping every experiment nominally active. This one did its job in two weeks. Later projects, including the LLM plumbing in Vidura, were built by a person who had already made his streaming mistakes here, cheaply.

The code stays public under MIT as a working reference. If you need to see LangGraph, FastAPI, Next.js, Postgres and Redis wired into one deployable unit with the streaming path intact, it is one `docker-compose up` away, frozen at exactly the moment it stopped needing to exist.

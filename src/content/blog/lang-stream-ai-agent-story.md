---
title: 'Lang Stream: a two-week study of token streaming through a LangGraph stack'
description: 'What a contained LangGraph, FastAPI, and Next.js experiment established about streaming agent responses end to end, why the repo is archived, and what carried forward into later projects.'
date: 2026-07-19
tags: ['case-study', 'lang-stream', 'agents']
lang: 'en'
---

Most agent applications return a completed answer: the request runs to
completion, then the full response arrives at once. The alternative
interleaves retrieval and generation, streaming tokens to the client
while the agent is still searching and reading. In late 2025 I ran a
contained experiment to understand the streaming mode end to end, and
[Lang Stream](https://github.com/prabhavalabs/lang-stream-ai-agent) is
the result: a full-stack agent application with a LangGraph agent, a
FastAPI backend, and a Next.js frontend, containerized to start with one
command. The first commit is from late October 2025 and the last from
early November 2025. It was a study, not a product, and this writeup
treats it as one.

## Component choices

LangGraph was the reason the project existed. Chain-style agent
frameworks make the default path simple and everything else opaque.
LangGraph instead defines the agent as an explicit graph of states and
transitions, so the control flow is inspectable: where a search result
enters the flow and where generation resumes are visible in the graph
definition rather than implicit in framework behavior. For an agent that
interleaves searching, reading, and writing, that explicitness is the
property that matters.

FastAPI was chosen for one dominant property: streaming is native to
it. An async Python framework provides token-level streaming over HTTP
directly, and it runs in the same language as the agent, so no
serialization boundary sits between the graph and the endpoint. The
resulting API surface is a single POST to `/api/v1/agent` with a query,
and the response streams back as the agent works.

The rest of the stack is standard by intent. PostgreSQL 16 for
persistence. Redis 7 as both cache and message broker. Next.js 15 with
shadcn/ui on the frontend, chosen to avoid hand-building accessible
components inside a two-week window. Every service runs in Docker on a
shared network with named volumes for persistent data, and
`docker-compose up --build` starts all four containers with hot
reloading on both the Python and TypeScript sides. Getting that
development loop right took real effort and paid for itself: the
environment rebuilds around code changes while the experiment is
running, which is the property a study project needs most.

## Scope, stated precisely

Lang Stream is a scaffold. The README is setup instructions almost top
to bottom: environment variables, ports, how to run the tests, how to
add a shadcn component. That reflects the project's actual job, which
was to hold the architecture fixed so the agent graph and the streaming
path could be studied in isolation.

The limits are explicit. There is one real endpoint. The frontend is a
chat surface, not an application. The test suite is pytest, concentrated
on the auth module, with coverage consistent with a two-week project.
The README does not present the system as deployable, and it is not.

## What the experiment established

The results split into two categories. The first is mechanics: how a
LangGraph agent hands tokens to an async endpoint, where Redis belongs
when responses are produced and consumed at different rates, and how to
keep a mixed Python and TypeScript stack workable inside Docker.

The second is architectural, and more useful: streaming is a user
experience decision with consequences at every layer, and it cannot be
added at the end. The graph, the HTTP framework, and the frontend
rendering all have to pass partial results through, and choosing a
component that blocks (a synchronous framework, a request-response-only
client) forecloses the design before any streaming code is written.

## Archived, deliberately

The repo's last commit is from November 9, 2025, and the repository is
archived rather than left nominally active on my profile. The experiment
completed its purpose in two weeks. The LLM and streaming plumbing in
Vidura was built afterward on top of what this project established, at
far lower cost than learning the same lessons in a production system.

The code remains public under MIT as a working reference: LangGraph,
FastAPI, Next.js, PostgreSQL, and Redis wired into one deployable unit
with the streaming path intact, reproducible with a single
`docker-compose up`.

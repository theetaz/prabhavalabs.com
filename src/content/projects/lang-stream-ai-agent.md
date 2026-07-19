---
title: 'Lang Stream'
tagline: 'a research agent that answers while it reads'
description: 'A LangGraph agent that searches the web in real time and streams its answer token by token as information arrives. FastAPI backend, Next.js frontend, one docker-compose up.'
tags: ['Python', 'LangGraph', 'FastAPI', 'Next.js']
repo: 'https://github.com/prabhavalabs/lang-stream-ai-agent'
status: 'archived'
featured: false
order: 12
image: '/images/projects/lang-stream-ai-agent.jpg'
---

## The itch

Most agent demos take your question, go silent for a minute, and return a wall of text. I wanted to understand the other mode: an agent that searches the web while you watch and streams its answer token by token as information is retrieved, closer to watching a person research and write than to submitting a form. Lang Stream was the scaffold I built to learn how that fits together end to end.

## How it works

LangGraph orchestrates the agent's reasoning inside a FastAPI backend, which suits the job because streaming responses are native to it. The frontend is Next.js 15 with shadcn/ui. PostgreSQL persists state, Redis covers caching and message brokering, and the whole four-service stack comes up from a single docker-compose command with hot reloading on both sides. The API surface is deliberately tiny: POST a query to /api/v1/agent and read the stream.

## Status

Archived. I built it over about two weeks in late 2025, got what I came for, and moved on. The code stays up under MIT as a working reference for wiring LangGraph, FastAPI and Next.js into one deployable unit. The honest post-mortem is in [the case study](/blog/lang-stream-ai-agent-story).

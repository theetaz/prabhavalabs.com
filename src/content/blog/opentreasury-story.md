---
title: 'Postgres keeps the money, the blockchain keeps the receipts'
description: 'OpenTreasury is an open-source platform for verifiable public spending. Its central design decision is refusing to let the blockchain be the database.'
date: 2026-07-19
tags: ['case-study', 'opentreasury', 'public-finance']
lang: 'en'
---

Most public-finance "transparency" is a summary. A ministry publishes
totals, on its own schedule, in whatever format it prefers, and if you want
to check that those numbers match what actually happened, you can't. There
is no mechanism. You are allowed to read; you are not allowed to verify.

OpenTreasury is my attempt to build the missing mechanism as open-source
software. It connects to the finance systems governments already run,
normalizes their transactions into one standard treasury model, and
publishes proofs that institutions, auditors, and ordinary citizens can all
check independently. It is a big, unglamorous piece of infrastructure, and
almost every interesting thing about it comes from one early decision.

## The blockchain is not the database

Every sketch of a project like this starts in the same place: put the
transactions on a blockchain. I understand the appeal, and I think it is
wrong. Treasury data is full of things that must never be public. It
changes shape constantly as reconciliation runs. And an operational finance
system needs a store that behaves like a database, with migrations,
reporting views, and rules enforced before anything is persisted.

So OpenTreasury splits the job. PostgreSQL is the system of record, full
stop: canonical transactions, the double-entry core with commitments,
reconciliation state, audit metadata. Hyperledger Fabric plays a much
narrower role as the public traceability layer. It records finalized
events, reversals, corrections, document hashes, and balance proofs. The
payloads live in Postgres; the chain holds evidence that those payloads
have not been quietly rewritten. A ledger that only stores proofs sounds
less impressive than a ledger that stores everything, but it is the version
that survives contact with real requirements like redaction and privacy.

## Mistakes are part of the vocabulary

Real treasuries reverse transactions and correct errors. A transparency
system that treats immutability as infallibility would collide with reality
in its first month, and the workaround would probably be to stop publishing.
OpenTreasury instead makes reversal events and correction events first-class
citizens of the ledger. When a transaction gets walked back, the walk-back
is anchored too. The record of being wrong is exactly as tamper-evident as
the record of being right, which is what an auditor actually wants from a
system like this.

## Two organizations, one anchor

The ledger gateway batches events into Merkle trees and anchors the roots on
a Fabric network where the chaincode must be endorsed by two organizations:
the treasury and the audit body. Neither can rewrite history alone. That
multi-organization requirement is the whole reason Fabric is there; a chain
run entirely by the institution being watched proves nothing.

Verification does not require trusting the platform either. The first
release ships independent verifiers for the CLI, the browser, and mobile,
with the mobile check running on the device itself. Checking a balance
proof is something you can do from a phone, without asking the treasury's
servers to vouch for the treasury.

## Boring ingestion, on purpose

The first connector does not do a slick live integration. It reads files
and maps them through YAML profiles. That is deliberate. Government finance
systems are diverse and often old, and the one integration surface you can
realistically count on is an export file. Connector services quarantine
each source system's quirks, so the core API never learns what the source
looked like; it only accepts data that passes the treasury lifecycle rules.
The cost is latency. File-based ingestion is batch by nature, and a batch
pipeline will never show you a payment the second it clears. For a
transparency platform, I consider that an acceptable trade.

## Policy as code, identity as a solved problem

Who may see what, what may be published, and what must be redacted before
export: those decisions live in Open Policy Agent policies rather than in
if-statements scattered through service code. The project treats public
export decisions as security-sensitive, and putting them in policy modules
makes them reviewable and testable on their own. Identity runs on Keycloak
instead of anything homegrown, which is the correct amount of ambition for
a solo developer touching government authentication.

There is also an MCP server that exposes the anonymous public tier to AI
assistants. "Ask a question about the budget" is increasingly how people
will want to consume this data, and the public API tier already draws the
privacy line, so an MCP wrapper falls out almost for free.

## Where it stands

v0.1.0 is feature complete, and the five core capabilities work end to end:
the double-entry financial core with commitments and reconciliation,
identity with policy-based authorization, file-based ingestion, Merkle
anchoring with independent verification, and the public APIs including the
MCP server. The stack runs locally with one command and deploys to
Kubernetes via Helm. Container images are signed, with attested SBOMs.
There is a white paper, a deployment guide written for a government IT
team, and an onboarding playbook that begins with a chart-of-accounts
mapping workshop, which tells you who this project is really for.

Now the honest part. The code was never going to be the hard part. Getting
a treasury to adopt a system whose entire purpose is making it harder to
quietly amend the books is institutional work that no repository can do. A
Fabric network spanning two real organizations is also a genuine
operational commitment, not a docker-compose afterthought. And "feature
complete at v0.1.0" means the system does what its blueprint says, not
that it has survived a real fiscal year under a real treasury's load.

The source is at
[github.com/prabhavalabs/opentreasury](https://github.com/prabhavalabs/opentreasury),
Apache 2.0. If the problem interests you, start with the white paper;
contributions follow a tests-first workflow, and decisions that constrain
future contributors get recorded as ADRs.

---
title: 'OpenTreasury: verifiable public spending without an on-chain database'
description: 'How OpenTreasury splits responsibility between PostgreSQL and Hyperledger Fabric: Postgres holds the treasury records, the chain holds Merkle proofs that those records have not been rewritten.'
date: 2026-07-19
tags: ['case-study', 'opentreasury', 'public-finance']
lang: 'en'
---

Public spending data is usually published as summaries: totals, released on
the ministry's schedule, in the ministry's preferred format. A citizen or
auditor who wants to confirm that the published numbers match the underlying
transactions has no mechanism for doing so. OpenTreasury is an open-source
platform built to supply that mechanism. It connects to the finance systems
governments already run, normalizes their transactions into one standard
treasury model, and publishes cryptographic proofs that institutions,
auditors, and citizens can check independently.

## Motivation

The default sketch for a system like this puts the transactions themselves
on a blockchain. Three properties of treasury data ruled that out:

- **Confidentiality.** Treasury records contain data that must never be
  public, and an on-chain record cannot be redacted after the fact.
- **Mutability.** The data changes shape constantly as reconciliation runs.
- **Operational requirements.** A working finance system needs migrations,
  reporting views, and validation rules enforced before anything persists.
  Those are database properties, not ledger properties.

The architecture that follows from these constraints splits the job in two.

## Postgres holds the records, Fabric holds the proofs

PostgreSQL is the system of record: canonical transactions, the
double-entry core with commitments, reconciliation state, and audit
metadata. Hyperledger Fabric has a much narrower role as the public
traceability layer. It records finalized events, reversals, corrections,
document hashes, and balance proofs. The payloads stay in Postgres; the
chain holds evidence that those payloads have not been rewritten. A ledger
that stores only proofs is compatible with redaction and privacy
requirements. A ledger that stores everything is not.

The same split handles errors. Real treasuries reverse transactions and
correct mistakes, and a transparency system that equates immutability with
infallibility would fail in its first month of operation, most likely by
being switched off. OpenTreasury makes reversal events and correction
events first-class entries in the ledger, anchored the same way as the
originals. The record of an error is exactly as tamper-evident as the
record of a correct entry, which is what an audit requires.

## Anchoring and independent verification

The ledger gateway batches events into Merkle trees and anchors the roots
on a Fabric network where the chaincode requires endorsement from two
organizations: the treasury and the audit body. Neither can rewrite history
alone. A chain operated solely by the institution being monitored proves
nothing, so the multi-organization endorsement policy is the reason Fabric
is in the stack at all.

Verification does not depend on trusting the platform. The first release
ships independent verifiers for the CLI, the browser, and mobile, and the
mobile verifier runs its check on the device itself. A balance proof can be
validated from a phone without asking the treasury's servers to vouch for
the treasury.

## Ingestion, policy, and identity

The first connector reads export files and maps them through YAML profiles
rather than integrating with source systems live. Government finance
systems are diverse and often old, and an export file is the one
integration surface that can be counted on across all of them. Connector
services isolate each source system's format, so the core API never learns
what the source looked like; it accepts only data that passes the treasury
lifecycle rules. The cost is latency. File-based ingestion is batch by
nature and will not surface a payment the moment it clears. For a
transparency platform, that trade is acceptable.

Decisions about who may see what, what may be published, and what must be
redacted before export live in Open Policy Agent policies rather than in
conditionals spread through service code. Public-export decisions are
security-sensitive, and policy modules make them reviewable and testable in
isolation. Identity runs on Keycloak rather than a custom implementation.
An MCP server exposes the anonymous public tier to AI assistants; because
the public API tier already enforces the privacy boundary, the MCP wrapper
adds little new surface.

## Status

v0.1.0 is feature complete, and the five core capabilities work end to
end: the double-entry financial core with commitments and reconciliation,
identity with policy-based authorization, file-based ingestion, Merkle
anchoring with independent verification, and the public APIs including the
MCP server. The stack runs locally with one command and deploys to
Kubernetes via Helm. Container images are signed and carry attested SBOMs.
Documentation includes a white paper, a deployment guide written for a
government IT team, and an onboarding playbook that begins with a
chart-of-accounts mapping workshop, which reflects the intended audience.

Three caveats define the distance to production. Adoption is institutional
work: convincing a treasury to run a system designed to make quiet
amendments harder is not something a repository can accomplish. A Fabric
network spanning two real organizations is an operational commitment, not
a docker-compose exercise. And feature complete at v0.1.0 means the system
matches its blueprint, not that it has processed a real fiscal year under a
real treasury's load.

## Moving forward

The design lesson from this build is to keep the blockchain's role exactly
as narrow as the trust problem demands: anchor proofs, not data. Every
requirement that looked like an argument against using a chain, from
redaction to reconciliation, turned out to be an argument for keeping the
chain out of the data path.

The source is at
[github.com/prabhavalabs/opentreasury](https://github.com/prabhavalabs/opentreasury),
Apache 2.0. The white paper is the recommended starting point.
Contributions follow a tests-first workflow, and decisions that constrain
future contributors are recorded as ADRs.

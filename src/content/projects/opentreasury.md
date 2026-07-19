---
title: 'OpenTreasury'
tagline: 'public spending anyone can verify'
description: 'An open-source public-finance transparency and treasury platform. PostgreSQL stays the system of record while Hyperledger Fabric anchors tamper-evident proofs that auditors and citizens can verify independently.'
tags: ['Go', 'PostgreSQL', 'Hyperledger Fabric', 'Kubernetes']
repo: 'https://github.com/prabhavalabs/opentreasury'
status: 'active'
featured: false
order: 2
image: '/images/projects/opentreasury.jpg'
---

## The itch

Public money moves through finance systems the public never sees. What comes
out the other end is a summary, published on the government's schedule, and
there is no way for an outsider to check that it matches what actually
happened. OpenTreasury is my attempt at infrastructure for that gap: an
open-source treasury platform where institutions, auditors, and citizens all
point at the same verifiable record.

## How it works

The design rule is that the blockchain is not the database. PostgreSQL stays
the operational system of record: canonical transactions, double-entry rules,
commitments, reconciliation state. Hyperledger Fabric gets a much narrower
job as the public traceability layer: finalized events, reversals,
corrections, document hashes, and balance proofs. A ledger gateway batches
these into Merkle anchors that both a treasury organization and an audit
organization must endorse, and anyone can verify an anchor independently
from a CLI, a browser, or a phone.

Around that core: file-based connectors map exports from existing government
systems through YAML profiles, Open Policy Agent decides what gets published
or redacted, Keycloak handles identity, and an MCP server serves the
anonymous public tier to AI assistants.

## Status

v0.1.0 is feature complete and under active development. The whole stack
runs locally with one command and deploys to Kubernetes via Helm, with
signed container images and attested SBOMs. The repo includes a full white
paper, and the reasoning behind the architecture is in
[the case study](/blog/opentreasury-story).

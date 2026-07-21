---
title: 'OpenPay: a crypto-to-rupee settlement rail on nine Go services'
description: 'Why a solo payment platform for Sri Lanka runs as nine Go microservices over NATS JetStream, keeps every amount in decimal arithmetic, and signs merchant traffic and webhooks with two different schemes.'
date: 2026-07-19
tags: ['case-study', 'open-pay', 'go']
lang: 'en'
---

A merchant in Colombo can put up a website and find customers anywhere,
then hit a wall when money should change hands. Card processing from
Sri Lanka is difficult, and crypto, which would route around it, has no
local off-ramp: a customer may be willing to pay in USDT, but the
merchant needs rupees in a bank account, because rent is priced in
rupees. [OpenPay](https://github.com/prabhavalabs/open-pay) is the
missing rail: accept 50+ cryptocurrencies at checkout and settle the
merchant in LKR. Crypto's irreversibility, usually treated as a defect,
is an asset here. Once a payment reaches finality there is no chargeback,
which removes a fraud category that small merchants are poorly equipped
to fight.

## Service decomposition

The architecture decision most likely to draw questions: OpenPay is nine
Go microservices, each with its own PostgreSQL database, connected
through NATS JetStream. Gateway, payment, merchant, settlement, webhook,
exchange, subscription, notification, admin. For a solo project that
scale of decomposition needs justification.

The justification is that a payment platform is several programs with
incompatible requirements that happen to cooperate. Webhook delivery
needs retries with exponential backoff and can lag by minutes without
consequence. The exchange rate service needs data fresh to within a few
seconds. Settlement is a ledger and must never double-count. In a single
process, the loosest of those requirements sets the standard for all of
them. Separated, each service can be exactly as strict as its own job
demands, and the database-per-service rule prevents any service from
reading another one's tables directly.

The event bus carries the coordination. When a payment confirms, the
payment service publishes the fact to JetStream and its involvement ends.
Settlement, webhooks, and notifications each consume the event at their
own pace. If the webhook service is down for an hour, the events wait in
the stream until it returns.

## Correctness constraints

Money in OpenPay never touches a float. Every amount is a
shopspring/decimal from the moment it enters the system, because binary
floating point cannot represent 0.1, and a payment platform that is off
by a satoshi is off. On the query side, no SQL string is concatenated by
hand: sqlc generates typed Go from written queries, so an injection bug
or a misspelled column fails at compile time instead of in production.

Authentication splits into two schemes because the audiences differ.
Merchant API requests are signed with HMAC-SHA256 using derived keys,
with a five minute timestamp window so a captured request cannot be
replayed later. Webhooks in the other direction are signed with ED25519,
and the asymmetry is deliberate: a merchant verifies deliveries with a
public key, so no shared secret sits on their server waiting to leak.
API secrets are bcrypt-hashed at rest and shown exactly once at creation.
Deletes are soft, so the audit trail survives every operation, and
customer PII stays on the merchant's servers rather than OpenPay's.

None of this makes the system secure on its own. It makes specific
categories of mistake hard to type.

## The provider layer

Converting crypto to LKR requires an exchange, and depending on exactly
one exchange is a structural failure point. OpenPay puts the provider
behind an interface with Bybit, Binance Pay, and KuCoin implementations.
If one delists a coin, changes its API, or exits the region, the fix is
configuration rather than a rewrite.

Subscriptions follow the same hedging logic with two modes: off-chain
recurring billing, which works today, and on-chain billing through smart
contracts for merchants who want that trust model. The on-chain mode is a
planned phase, with Solidity and Hardhat scaffolding already in the
repository.

## Process

The build ran as fifteen explicit phases, each on its own feature branch,
each feature starting with a failing test. On a solo project the test
suite is the only reviewer available, and it proved its worth when
refactoring the money package with ten services depending on it. GitHub
Actions runs gosec, govulncheck, and trivy on every change, which is the
closest a one-person payment platform gets to a security team.

## Status

Twelve of the fifteen phases are complete. That covers the full payment
flow, both dashboards, checkout, subscriptions, notifications, and the
Go SDK. Still open: the smart contracts, the WooCommerce plugin, and the
hardening phase.

The README says production-grade, and that is the standard the
engineering aims at, but the precise claim matters: what exists is a
complete, tested platform running under Docker Compose, not a licensed
financial institution with years of operational history. A payment
platform earns trust in production over time, and this one has not
started that clock.

## Moving forward

The next phase is the WooCommerce plugin, because a payment rail with no
installation path has no users. After that comes hardening, which in
practice means adversarial testing of the settlement math before anyone
else attempts it.

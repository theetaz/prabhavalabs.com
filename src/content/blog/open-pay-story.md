---
title: 'Money must not float: building a crypto-to-rupee payment rail'
description: 'Why a solo payment processor for Sri Lanka ended up as nine Go services, two signature schemes, and a hard rule against floating-point arithmetic anywhere near an amount.'
date: 2026-07-19
tags: ['case-study', 'open-pay', 'go']
lang: 'en'
---

Here is a gap that has bothered me for a while. A merchant in Colombo can put up a website, find customers anywhere in the world, and then hit a wall at the exact moment money should change hands. Card processing from Sri Lanka is painful, and crypto, which would route around all of it, has no local off-ramp. A customer might happily pay in USDT. The merchant does not want USDT. The merchant wants rupees in a bank account, because rent is priced in rupees.

[OpenPay](https://github.com/prabhavalabs/open-pay) is my attempt to build that missing rail: accept 50+ cryptocurrencies at checkout, settle the merchant in LKR. Crypto's irreversibility, usually cited as a bug, is genuinely useful here. Once a payment reaches finality there is no chargeback, which removes an entire class of fraud that small merchants are badly equipped to fight.

## Nine services for one person

The architecture decision people will question first: OpenPay is nine Go microservices, each with its own PostgreSQL database, connected through NATS JetStream. Gateway, payment, merchant, settlement, webhook, exchange, subscription, notification, admin. For a solo project that sounds like cosplay, and I thought hard about whether it was.

The argument that convinced me is that a payment platform is not one program. It is several programs with wildly different failure modes that happen to cooperate. Webhook delivery needs retries with exponential backoff and can lag by minutes without hurting anyone. The exchange rate service needs to be fresh every few seconds. Settlement is a ledger and must never, under any circumstance, double-count. Squashing those into one process means the sloppiest requirement infects the strictest one. Splitting them means each service can be as paranoid as its own job demands, and the database-per-service rule keeps any service from quietly reaching into another one's tables at 2 a.m.

The event bus carries the coordination. When a payment confirms, the payment service publishes the fact to JetStream and stops caring. Settlement, webhooks and notifications each consume it at their own pace. If the webhook service is down for an hour, the events wait for it.

## Where the paranoia lives

Money in OpenPay never touches a float. Every amount is a shopspring/decimal from the moment it enters the system, because binary floating point cannot represent 0.1 and a payment platform that is off by a satoshi is off. In the same spirit, no SQL string is ever concatenated by hand: sqlc generates typed Go from written queries, so an injection bug or a misspelled column fails at compile time instead of in production.

Authentication splits into layers because the audiences differ. Merchant API requests are signed with HMAC-SHA256 using derived keys, with a five minute timestamp window so a captured request cannot be replayed on Tuesday. Webhooks going the other direction are signed with ED25519, and the asymmetry is the point: a merchant verifies deliveries with a public key, so there is no shared secret sitting on their server waiting to leak. API secrets are bcrypt-hashed at rest and shown exactly once at creation. Deletes are soft, so the audit trail survives everything, and customer PII stays on the merchant's servers rather than mine.

None of this makes the system secure by itself. It makes whole categories of mistakes hard to type.

## The provider layer, or how not to marry an exchange

Actually converting crypto to LKR requires an exchange, and depending on exactly one exchange is how projects die. OpenPay abstracts the provider behind an interface with Bybit, Binance Pay and KuCoin implementations. If one delists a coin, changes an API or exits the region, that is a configuration problem rather than a rewrite.

Subscriptions get two modes for a similar reason: off-chain recurring billing that works today, and on-chain billing via smart contracts for people who want the trust model, which is a planned phase with Solidity and Hardhat scaffolding already in the repo.

## Process as a survival tactic

I ran the build as fifteen explicit phases, each one a feature branch, each feature starting with a failing test. TDD on a solo project sounds like ceremony until you are ten services deep and need to refactor the money package; the tests are the only reviewer I have. GitHub Actions runs gosec, govulncheck and trivy on every change, which is as close to a security team as a one person payment platform gets.

Twelve of the fifteen phases are done. That covers the full payment flow, both dashboards, checkout, subscriptions, notifications and the Go SDK. Still open: the smart contracts, the WooCommerce plugin, and the phase I am most respectful of, hardening and polish.

## What I will not claim

The README says production-grade, and that is the standard the engineering aims at, but I want to be precise about what exists: a complete, tested platform running under Docker Compose, not a licensed financial institution with years of uptime. The remaining phases are unglamorous and matter. A payment platform earns trust in production, slowly, and this one has not started that clock yet.

Next up is the WooCommerce plugin, because a payment rail nobody can install is a diagram. After that, hardening, which mostly means trying to break my own settlement math before anyone else gets the chance.

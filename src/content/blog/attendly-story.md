---
title: 'A stranger on Reddit had no attendance system, so I built one'
description: 'The full story of Attendly: why a tuition class of 100+ students runs on Go and an embedded SQLite file, and why the door check-in app assumes the internet is already broken.'
date: 2026-07-20
tags: ['case-study', 'attendly', 'golang']
lang: 'en'
---

Some projects start with your own itch. This one started with somebody
else's. A Reddit user described running a small tuition class and marking
attendance on paper, when they marked it at all. No history, no way to
settle a payment dispute, the whole operation held together by memory and
goodwill. Commercial school software wants a school: per-student pricing,
sales calls, features for a principal's office that a one-teacher class
will never open.

The gap annoyed me enough to build into it. Attendly is a complete
management system for a tuition class, sized honestly for one: attendance,
students, lecturers, timetables, billing, and notifications, open source
and self-hosted on whatever cheap VPS you already have.

<img src="/images/blog/attendly/admin-dashboard.png" alt="Attendly admin dashboard with attendance and revenue summaries" />

## One binary, one file, one hundred students

The backend is Go with SQLite embedded in the process. No database server,
no connection pool, no second container to babysit. The whole persistent
state of the class, students, sessions, invoices, payments, lives in one
file on one disk that gets backed up like any other file.

On paper this sounds like a toy. In practice it is the opposite: for a
hundred-and-something students, queries return in microseconds because
there is no network between the application and its data. The demo seed
for the screenshots in this post creates 172 students, four classes, and
just under two thousand attendance records; every admin page loads before
you finish blinking. The lesson I keep relearning: most systems are
smaller than their architecture.

The Go process also carries everything that would traditionally sprawl
into services: role-based access control, scheduled jobs for invoice
generation, PDF receipts, and the notification pipeline. It deploys as a
single Docker container behind nginx, with GitHub Actions SSHing in on
every merge to main.

<img src="/images/blog/attendly/admin-students.png" alt="Student roster with per-student attendance and billing status" />

## The door is the real interface

The admin portal is where the office work happens, but the system lives or
dies at the classroom door on a Saturday morning, when eighty students
arrive in twenty minutes.

That flow got its own app: an Expo mobile client whose whole job is
check-in. Students flash a QR card at the camera, or the person at the
door searches a name. Present or late, one tap. The roster and counts
update live as students stream in.

<img src="/images/blog/attendly/mobile-session.png" alt="Door check-in screen with QR scanning, manual lookup, and recent check-ins" />

The design constraint that shaped it: the door cannot depend on the
internet. Classroom wifi dies, mobile data hiccups, and a queue of
students will not wait for a spinner. So the check-in app is offline
first. Marks queue locally when the connection drops, a Sync now button
shows exactly what state you are in, and the API reconciles everything
once the network returns. The offline path is not an edge case in the
code; it is the main path that sometimes happens to sync instantly.

<img src="/images/blog/attendly/admin-attendance.png" alt="Attendance overview in the admin portal" />

## Billing, because attendance is half the dispute

The Reddit story that started this was really about money. Attendance
arguments in a tuition class are usually payment arguments wearing a
disguise: who attended which month, who paid for it, who is three months
behind. So billing is not a bolt-on. Sessions feed invoices, invoices
track payments and partial payments, and the defaulter view answers the
awkward question before it becomes an awkward conversation. Receipts
render as PDFs from the same Go process.

<img src="/images/blog/attendly/admin-billing.png" alt="Billing view with paid, partial, and unpaid invoices" />

## Open source, and actually runnable

The whole system is now public under
[Prabhava Labs](https://github.com/prabhavalabs/attendly), MIT licensed.
Before the release I audited the tree and the full git history with
gitleaks: the only finding was a fabricated token in a PDF test fixture,
which is the kind of false positive you frame and hang on the wall.

Running it yourself is deliberately boring: `make up`, `make backend`,
`make seed`, and a demo seeder that fills the system with realistic fake
students so you can explore every screen before trusting it with real
ones. The admin portal runs at
[attendly.prabhavalabs.com](https://attendly.prabhavalabs.com) and the
mobile app builds with Expo for Android, or runs as a PWA.

If you know a teacher still marking attendance on paper, this one is for
them. It only exists because a stranger mentioned they had that problem.

---
title: "How to Verify the Output of AI Coding Agents"
date: 2026-04-30
draft: true
author: "John Young"
description: "Seed: per-task verification when the diff is written by an AI agent."
keywords: ["AI coding agents", "code review", "verification"]
---

## Premise

When an agent writes diffs faster than you can review them, throughput is bounded by the reviewer. Code review when the author is an AI isn't the same as code review when the author is a human — this post should make the difference concrete.

## Angles

- Two failure modes: rubber-stamping vs. re-doing the work.
- Spec match vs. code correctness — Goodhart's law in microcosm.
- The agent's tests as a tell for what it thought the task meant.
- Self-grading is a tautology — "are you sure?" isn't verification.
- Unsolicited changes as the silent failure mode.
- Calibrating review depth to blast radius.

---
title: "What AI Agents Are Actually Good For (And When to Skip Them)"
date: 2026-04-27
draft: true
author: "John Young"
description: ""
keywords: ["AI agents", "AI coding agents", "when to use AI agents", "agent use cases", "Claude Code"]
---

Seed: what are agents *actually* good for? Cut through the hype — frame it around the kinds of work where agents reliably outperform a human-in-the-loop workflow vs. where they don't. Possible angles: bounded vs. unbounded tasks, reversibility, verification cost, cases where the agent's speed compounds (parallelization, breadth-first exploration) vs. cases where a single careful pass beats it.

Optimizing tool selection...Agentic AI is exceptionally great at work where the goal is clear, the steps are discoverable, and progress can be checked along the way.

It shines at:

- **Exploration across messy systems**: reading codebases, docs, logs, configs, tickets, and past changes to build a working mental model.
- **Multi-step execution**: taking a goal like “add this feature,” “fix this bug,” or “migrate this pattern” and breaking it into search, edit, test, and verify loops.
- **Repetitive but judgment-heavy work**: refactors, test updates, dependency cleanup, documentation alignment, API usage changes, and consistency passes.
- **Glue work**: connecting tools, scripts, APIs, files, tests, CI output, browser behavior, and deployment details.
- **First-pass implementation**: turning a well-scoped product or engineering request into working code quickly, especially when the surrounding patterns are already present.
- **Debugging with feedback loops**: inspecting errors, forming hypotheses, changing code, rerunning tests, and narrowing the failure.
- **Research-to-action tasks**: reading unfamiliar documentation or source code, then applying it directly in a project.
- **Drafting and synthesis**: converting scattered notes, code behavior, or investigation results into clear explanations, specs, PR summaries, or runbooks.

The short version: agentic AI is best at **bounded, verifiable work that requires sustained attention across many small steps**. It is less magical at vague goals, hidden business context, taste-heavy decisions, or tasks where there is no reliable way to tell whether the result is correct.
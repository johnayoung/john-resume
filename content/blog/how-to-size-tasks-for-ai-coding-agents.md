---
title: "How to Size Tasks for AI Coding Agents"
date: 2026-04-27
draft: false
author: "John Young"
description: "The real constraint is context, not lines of code. Six heuristics for sizing tasks so AI coding agents ship clean code on the first try, grounded in PR sizing and context-rot research."
keywords: ["AI coding agents", "task sizing", "context engineering", "context rot", "PR sizing", "Claude Code"]
---

Getting task scope right is the difference between an agent that ships clean code on the first try and one that spirals into corrections, context exhaustion, and wasted tokens. Most people size tasks by gut feel — "that seems about right" — but the actual constraint is measurable, and the research on what makes a reviewable unit of work is well-established.

---

## The Real Constraint: Context, Not Lines of Code

People instinctively think about task size in terms of lines of code or number of files changed. Those are secondary proxies. The actual limiter is how much context the agent must consume — reading files, exploring the codebase, running commands, processing outputs — before it can do the work.

This matters because model performance degrades as context fills. Chroma's research report on context rot, which measured 18 LLMs, found that models do not attend to their context uniformly — performance grows increasingly unreliable as input length grows ([Chroma: Context Rot — Hong et al., 2025](https://research.trychroma.com/context-rot), cited via [Factory.ai: The Context Window Problem](https://factory.ai/news/context-window-problem)). This isn't a cliff; it's a slope. Instructions from early in the conversation get progressively less likely to be followed as the window fills.

Anthropic's own engineering team reinforces this: even as context windows get larger, treating context as a precious, finite resource will remain central to building reliable agents. Bigger windows don't eliminate the problem — they just move the degradation curve further out ([Anthropic: Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)).

**The sizing question is therefore: can this task be completed before the agent's reasoning quality degrades?**

---

## Heuristic 1: One Coherent Thing Per Session

The Claude Code documentation calls this out directly: the most effective context management strategy is to do one thing per session. Their example: instead of "build the notification feature," break it into "add the notifications database table" and start a fresh context for each step ([Developer Toolkit: Context Windows](https://developertoolkit.ai/en/shared-workflows/context-management/context-windows/)).

The key word is "coherent." This doesn't mean "one tiny thing" — it means one thing with a single logical boundary that can be verified in isolation. A migration. An endpoint. A service method with its tests. Not artificially small, but naturally scoped.

The Claude Code docs also describe the antipattern to watch for — the "kitchen sink session" — where you start with one task, ask something unrelated, then go back to the first task. Context fills with irrelevant information and quality drops ([Claude Code Docs: Best Practices](https://code.claude.com/docs/en/best-practices)).

---

## Heuristic 2: The One-Sentence Diff Test

The Claude Code docs offer a useful litmus test for whether a task needs a plan or can be executed directly: "If you could describe the diff in one sentence, skip the plan" ([Claude Code Docs: Best Practices](https://code.claude.com/docs/en/best-practices)).

Flip this into a sizing tool: if you *can't* describe the expected diff in one sentence, the task is either too big or needs decomposition. "Add a nullable `phone_number` column to the users table with an up and down migration" is one sentence — that's a well-sized task. "Add phone number support across the full stack" is not one sentence — that's multiple tasks.

---

## Heuristic 3: Count Files Read, Not Files Changed

> **Author's judgment.** This is my own inference, not a direct claim from any source. The reasoning chain follows from sourced premises.

Most people estimate task complexity by how many files will change. But the bigger cost is how many files the agent needs to *read* to understand enough context to make those changes safely.

The underlying mechanics are real: each file read, grep, and bash execution consumes context and, depending on the tool, counts as a separate API call. If the agent reads 20 files to understand the codebase before writing a single line, that's significant context burn before the real work begins ([Claude Code Guides: Rate Limits](https://claudecodeguides.com/claude-code-api-error-rate-limit-reached/)).

**Practical implication:** If a task requires the agent to understand too much of the system to make a safe change, it's either too big or you haven't provided enough upfront context (relevant files, reference implementations, architectural notes) to shrink the exploration phase. This is where a well-written task spec pays for itself — you're effectively pre-loading the context the agent would otherwise have to discover on its own.

---

## Heuristic 4: Independent Verifiability

A well-sized task produces output that can be verified without needing the *next* task to be done first. You should be able to run tests, lint, or hit an endpoint to confirm the task worked in isolation.

This maps directly to milestones. Each one should be a checkpoint where you can say "this works" or "this doesn't" before moving on. If you can't verify a task independently, it's either too small (a fragment of a meaningful change) or too entangled with other work (and should be restructured).

Google Cloud's best practices for AI coding assistants recommend creating a set of tests that will determine if the generated code works based on your requirements — essentially making verification part of the task definition, not an afterthought ([Google Cloud: Five Best Practices for AI Coding Assistants](https://cloud.google.com/blog/topics/developers-practitioners/five-best-practices-for-using-ai-coding-assistants)).

---

## Heuristic 5: Layer Boundaries Are Natural Decomposition Points

> **Author's judgment.** Derived from the "one coherent thing" principle above, not stated directly in any source.

If a task requires changes across multiple architectural layers simultaneously — a new database column *and* a new API endpoint *and* new frontend UI *and* updated docs — that's not one task. Each layer boundary is a natural split point because each layer can typically be verified independently.

The example from the companion guide ([The Anatomy of a Perfect AI Agent Task](/blog/anatomy-of-a-perfect-ai-agent-task/)) splits work this way:

1. **Migration** — Add the column, verify migrate up/down.
2. **Model + generated code** — Update the struct and queries, verify no diff.
3. **Service + validation** — Add business logic, unit test it.
4. **Handler + integration** — Wire up the endpoint, integration test the full flow.

Each milestone is independently verifiable and produces a clean commit. If step 3 fails, you don't lose the work from steps 1 and 2.

This isn't a universal law — sometimes a change is so small that splitting it across layers would create more overhead than it saves. But for anything non-trivial, layer boundaries are the most reliable seams for decomposition.

---

## Heuristic 6: Don't Over-Decompose

> **Author's judgment.** The specific framing is my own, though it's consistent with the general principle of matching effort to task complexity found in multiple sources.

There's a floor to useful task size. If a task is so trivial that you could do it faster manually than writing the task spec, starting a session, and reviewing the output — it's too granular. "Add a column to the struct" as a standalone task doesn't give the agent any meaningful opportunity to verify its work and you're paying the overhead of a fresh context for something trivial.

The MindStudio guide on session limits makes a similar point about effort levels: max effort on a trivial task wastes context, while low effort on a complex refactor produces incomplete output. Match the investment to the task ([MindStudio: Claude Session Limits](https://www.mindstudio.ai/blog/how-to-manage-claude-session-limits)).

Bundle trivial changes with the next logical step. "Add the column to the struct *and* update the queries *and* regenerate the generated code" is a natural unit — it's still one coherent thing (the model layer), but it has enough substance for the agent to verify.

---

## The Practical Sweet Spot

> **Note: The specific numbers below are my translation of PR sizing research into AI agent task heuristics.** The underlying research is well-established; the mapping to "files read" and "files changed" is my own approximation for a typical Go codebase and will vary by language and architecture.

### What the research says about reviewable units of work

The PR sizing research is extensive and converges on consistent numbers:

- Google's engineering research found that review quality drops significantly for PRs exceeding 200 lines of changed code, and review time increases non-linearly with size. They recommend keeping PRs under 200 lines ([EM Tools: Pull Request Size](https://www.em-tools.io/engineering-metrics/pull-request-size)).
- An analysis of 50,000+ pull requests across 200+ teams found that PRs with 200–400 lines changed have 40% fewer defects than larger PRs, PRs over 1,000 lines have 70% lower defect detection rates, and each additional 100 lines increases review time by 25 minutes ([Propel: Impact of PR Size on Code Review Quality](https://www.propelcode.ai/blog/pr-size-impact-code-review-quality-data-study)).
- Graphite's analysis found that 50-line changes are reviewed and merged roughly 40% faster than 250-line changes and are 15% less likely to be reverted ([Graphite: The Ideal PR is 50 Lines Long](https://graphite.com/blog/the-ideal-pr-is-50-lines-long)).
- High-performing teams typically enforce a soft limit of 400 lines and a hard limit of 600 lines, above which the PR must be split ([EM Tools](https://www.em-tools.io/engineering-metrics/pull-request-size), [Augment Code: Code Review Best Practices](https://www.augmentcode.com/guides/code-review-best-practices-that-scale)).

### My translation for AI agent tasks

Given a ~200 LOC target for the diff:

- **Files changed: ~2–5.** In a typical Go project following a layered architecture, a 200-line change across a model file, service method, handler, test file, and a migration lands in this range. This will vary by language — a React project with smaller component files might touch more files for fewer total lines.
- **Files read: roughly 2× the files changed.** To make a safe change to 3 files, the agent typically needs to read those 3 files plus their interfaces, dependencies, and test fixtures. This is a rough multiplier, not a researched number.
- **Review time: under 5 minutes.** A 200-line diff at a reasonable reading pace takes about 5 minutes to review, which aligns with the research showing that review effectiveness drops sharply beyond the first hour, with most value extracted in the first pass.

These are approximations. The underlying principle is more durable than the specific numbers: **size your tasks so the output maps to a single, reviewable pull request that a human can understand quickly.**

---

## Sizing Decision Flowchart

When deciding if a task is the right size, ask these questions in order:

**Can you describe the expected diff in one sentence?**
If no → the task needs decomposition.

**Can the result be verified independently?**
If no → you've either scoped too small (a fragment) or too entangled (restructure it).

**Does it cross multiple architectural layers?**
If yes → split along layer boundaries unless the total change is trivial.

**Does the agent need to read more than ~10 files to understand enough context?**
If yes → either the task is too broad, or you need to provide more upfront context in the task spec to reduce exploration. *(Note: the "~10 files" number is author's judgment, not a researched threshold.)*

**Could you do it faster manually than writing the task spec?**
If yes → bundle it with the next logical step.

---

## References

### Research and Data

1. [Chroma: Context Rot — Hong et al., 2025](https://research.trychroma.com/context-rot) — Measured 18 LLMs and found performance degrades non-uniformly as context length grows. Cited via Factory.ai.
2. [Google's PR Sizing Research](https://www.em-tools.io/engineering-metrics/pull-request-size) — Review quality drops significantly above 200 LOC; recommends keeping PRs under 200 lines.
3. [Propel: Impact of PR Size on Code Review Quality](https://www.propelcode.ai/blog/pr-size-impact-code-review-quality-data-study) — Analysis of 50,000+ PRs: 200–400 line PRs have 40% fewer defects; each additional 100 lines adds ~25 minutes of review time.
4. [Graphite: The Ideal PR is 50 Lines Long](https://graphite.com/blog/the-ideal-pr-is-50-lines-long) — 50-line changes are merged 40% faster and 15% less likely to be reverted than 250-line changes.

### Practitioner Guidance

5. [Anthropic: Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — Context is a finite resource regardless of window size; compaction and just-in-time retrieval over pre-loading.
6. [Claude Code Docs: Best Practices](https://code.claude.com/docs/en/best-practices) — One thing per session, the "kitchen sink" antipattern, and the one-sentence diff test.
7. [Factory.ai: The Context Window Problem](https://factory.ai/news/context-window-problem) — Enterprise codebases exceed context windows; context must be curated like CPU time or memory.
8. [Google Cloud: Five Best Practices for AI Coding Assistants](https://cloud.google.com/blog/topics/developers-practitioners/five-best-practices-for-using-ai-coding-assistants) — Test-driven verification as part of task definition.
9. [MindStudio: Claude Session Limits](https://www.mindstudio.ai/blog/how-to-manage-claude-session-limits) — Match effort level to task complexity; sub-agents for work that exceeds a single session.
10. [Augment Code: Code Review Best Practices](https://www.augmentcode.com/guides/code-review-best-practices-that-scale) — Sub-400 LOC PRs and sub-six-hour completion times as scaling benchmarks.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"Count files read, not files changed"** — Inferred from context window mechanics and API call patterns.
- **"Layer boundaries are natural decomposition points"** — Derived from the "one coherent thing per session" principle.
- **"Don't over-decompose"** / the minimum viable task size — Derived from the principle of matching effort to complexity.
- **"2–5 files changed / 2× files read"** — My approximation for Go codebases based on the ~200 LOC PR sizing research. Will vary by language and architecture.
- **"~10 files" exploration threshold** — A rough heuristic for when a task requires too much context discovery. Not a researched number.

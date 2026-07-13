---
title: "The State of AI Coding Agent Engineering"
description: "Capability is accelerating; the field trial measured developers slower. Where the constraint on AI coding agents moved: verification, review capacity, ownership."
date: 2026-07-01
type: report
layout: single
kicker: "Field report"
meta: "The synthesis behind 11 essays and 114 primary sources · read time ~25 min"
draft: false
keywords:
  - "AI coding agents"
  - "agentic engineering"
  - "AI code review"
  - "engineering leadership AI"
  - "state of AI agents"
---

Frontier agents get more capable on a schedule you can graph: the length of task a model can finish at 50% reliability — measured in the human time the task takes — has been [doubling roughly every seven months since 2019](https://arxiv.org/abs/2503.14499) ([Kwa, West, Becker et al., METR](https://arxiv.org/abs/2503.14499)), and METR's updated methodology estimates the recent trend is faster still: a [131-day doubling since 2023, 89 days since 2024](https://metr.org/blog/2026-1-29-time-horizon-1-1/). And yet, in the one controlled field trial that measured delivered output, experienced developers were [**19% slower** with AI on code they knew well](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) — while believing they'd been sped up by 20%. That trial is an early-2025 snapshot, and METR [says so itself](https://metr.org/blog/2026-02-24-uplift-update/); the durable finding is the perception gap. Capability went up. Delivered throughput went down. Gut feel inverted from the stopwatch — and both numbers are real.

That gap is where this report lives. The cost of building software didn't disappear when generation got cheap — it **moved downstream**, into the work that was always expensive and is now the bottleneck: deciding what to delegate, budgeting the context an agent reads, proving output you didn't write, containing what it's allowed to touch, absorbing its diffs through a review pool that didn't grow, and owning the code for the years after it merges. Even Google's 2025 DORA report now frames it this way: [*"AI doesn't fix a team; it amplifies what's already there."*](https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report)

The SME move follows directly: **stop optimizing generation, and start engineering the system around it.** This report is the argument for that, built from the strongest primary evidence across six pillars — the synthesis behind eleven essays and a [verified index of 114 sources](/research/).

## The six pillars, in one argument

1. **Task Design & Decomposition** — Sizing an agent's work is a verification-cost problem, not a line-count problem; oversight belongs on the rare irreversible action, not the average one.
2. **Agent Runtime** — More context is not free reliability. Instruction-following [degrades to 68% at 500 instructions](https://arxiv.org/abs/2507.11538), and models [don't read a long window uniformly](https://www.trychroma.com/research/context-rot).
3. **Evals & Verification** — Generation outran verification. A green build isn't trust when [45.4% of flagged agent PRs describe changes the code never made](https://arxiv.org/abs/2601.04886) and [every major agent benchmark can be gamed to a near-perfect score](https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont).
4. **Production Operations** — Safety comes from constraining what an agent can *reach*, not watching what it does — and you can't cap a cost you can't attribute to a task.
5. **Team & Process** — Reviewer-hours are the real ceiling on how many agents you can run, and the burden lands on the seniors you can least afford to lose. *(Read this one in full below.)*
6. **Architecture Decisions** — Split to many agents for context isolation, not speed; and build-vs-buy is now a five-year ownership call, because [60% of a system's lifecycle cost is maintenance](https://www.oreilly.com/library/view/97-things-every/9780596805425/ch34.html).

---

## Pillar 5 — Team & Process: reviewer-hours are the real ceiling

Here's one pillar in full, so you can judge the rest.

You didn't hit a correctness wall when you gave your team five agents — you hit a reviewer-throughput wall. The thing that decides how many agents your team can actually run is not agent output quality; it's how much your reviewers can absorb before the queue backs up and people start rubber-stamping. That number is finite, it's measurable, and most teams have never once looked at it.

The number is already in your telemetry. Across two years of data on 22,000 developers, [Faros AI found median time in review up **441.5%**, with unreviewed merges up 31.3%](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways). Review time doesn't rise 441% because the code got worse — it rises because more of it arrives at a pool that didn't grow. And the load isn't uniform, which is what makes it dangerous: across 33,707 agent-authored PRs, researchers found a [two-regime reality — 28.3% merge instantly while the rest fail at iterative refinement](https://arxiv.org/abs/2601.00753), creating what they call a hidden [*"attention tax"* on maintainers](https://arxiv.org/abs/2601.00753). When agent output climbs against a fixed reviewer denominator, [the review queue becomes the binding constraint on the whole delivery pipeline](https://arxiv.org/html/2606.13175v1) ([Monperrus](https://arxiv.org/html/2606.13175v1)).

The reflexive fix — bolt on a review agent — makes it worse if you measure it wrong. Studied across thousands of real PRs, [CRA-only PRs merged at 45.20%, **23 points below** human-reviewed PRs (68.37%)](https://arxiv.org/abs/2604.03196) ([Chowdhury et al.](https://arxiv.org/abs/2604.03196)), because most of their comments weren't the signal a reviewer needed. And the cost concentrates on your best people: Faros describes senior engineers becoming the verification layer — [*"reconstructing intent from generated code, thin specs, incomplete Jira tickets, and edge cases nobody wrote down"*](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden) — a burden that [*"does not get measured in PR throughput dashboards, which is precisely why the cost is invisible until it isn't,"*](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden) priced at $150,000–$300,000 per senior engineer who burns out and leaves.

The judgment: **budget review as a finite, protected resource, and split the delegable half from the half that can't move.** Line-by-line inspection is mechanical — delegate it to agents. Deciding what "correct" means for the product, and owning what shipped, is [judgment that relocates rather than automates](https://blakecrosley.com/blog/agents-supersede-the-reviewer) — it stays human, and named. Do the reviewer-hours math *before* you approve agent number seven, because past the crossover every added agent produces queue depth, not throughput. (The long version is [Review Capacity Is the Real Ceiling on Your Agents](/blog/review-capacity-agent-throughput/).)

That's the shape of every pillar: a measurable constraint, the strongest evidence for where it bites, and what to actually do about it.

---

{{< report-gate >}}

The [research index](/research/) stays free and public — 114 verified primary sources, every row a verbatim figure or quote, grouped by these same six pillars. That's the evidence appendix. The report above is the synthesis: the argument the evidence adds up to, and the judgment I'd want if I were putting agents into production on a real team.

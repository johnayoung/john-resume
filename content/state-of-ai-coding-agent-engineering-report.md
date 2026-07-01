---
title: "The State of AI Coding Agent Engineering"
description: "The full synthesis: six pillars, the strongest primary evidence behind each, and the judgment layer for engineering leaders putting AI coding agents into production."
type: report
layout: single
url: "/state-of-ai-coding-agent-engineering/read/"
kicker: "Field report · the full synthesis"
meta: "Grounded in 101 verified primary sources · read time ~25 min · [the evidence index is public](/research/)"
private: true
draft: true
keywords:
  - "AI coding agents"
  - "agentic engineering"
  - "AI code review"
  - "engineering leadership AI"
  - "state of AI coding agents"
---

Frontier agents are getting more capable on a schedule you can graph. The length of task they finish autonomously has been [doubling roughly every seven months for six years](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks), a trend the underlying methodology paper confirms held [approximately every seven months since 2019](https://arxiv.org/abs/2503.14499) ([Kwa, West, Becker et al., METR](https://arxiv.org/abs/2503.14499)). If you only read the capability curve, the conclusion writes itself: point agents at more work, wait for the next model, repeat.

Then the one controlled trial that measured delivered output found the opposite. On real issues in codebases they knew well, [experienced developers took **19% longer** with AI tools](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study) ([METR](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study)) — and the perception gap is the part that should unsettle you: the same developers still believed AI had sped them up by 20%. Capability up. Delivered throughput down. Gut feel inverted from the stopwatch.

Both numbers are real, and the space between them is what this report is about. Generation got cheap. The cost of shipping software didn't disappear with it — it **moved downstream**, into the work that was always the expensive part and is now the binding constraint: verifying output you didn't write, budgeting the context an agent reads, containing what it's allowed to touch, absorbing its diffs through a review pool that didn't grow, and owning the result for the years after it merges. Addy Osmani compressed the whole thesis into one line: [*"We made writing cheap, and understanding stayed exactly as expensive as it has always been."*](https://www.oreilly.com/radar/agentic-code-review/)

Six pillars organize what follows. Each is a place the cost landed. Each gets the strongest primary evidence I could find, then the judgment I'd act on. The through-line under all six: **stop optimizing generation, and start engineering the system around it.** The evidence base is public — a [verified index of 101 primary sources](/research/), every row a verbatim figure or quote checked against its source. This is the argument that index adds up to.

---

## Pillar 1 — Task Design & Decomposition

**The claim: what you delegate matters more than which agent you delegate to, and the deciding property is context, not size.**

The internet has a thousand "best AI coding agent" rankings and near-zero guidance on the only decision upstream of them: does this task belong to an agent at all? Two properties settle it — can you verify the result cheaply, and can you undo it if you can't. Anthropic leads its own agent-building guidance with the same discipline: [*"find the simplest solution possible, and only increasing complexity when needed. This might mean not building agentic systems at all."*](https://www.anthropic.com/research/building-effective-agents)

The reliability floor is measurable and steep. METR found current models have [near-100% success on tasks under four minutes of human time, but under 10% past roughly four hours](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks) — success doesn't decay gently with task length, it collapses. That hands you a portable rule keyed to the one estimate you can make before writing a spec: how long would this take a competent human? Hours means it isn't one task, and handing it over whole is betting against a sub-10% success rate.

But the real constraint is subtler than duration. A task can sit comfortably under the horizon and still be a net loss, because the expensive part isn't producing the diff — it's proving it correct. Osmani's survey data shows [only 48% of developers consistently check AI-assisted code before committing, even though 38% find reviewing AI logic *harder* than reviewing human code](https://addyo.substack.com/p/the-80-problem-in-agentic-coding). When verification costs more than authorship, delegation is a detour with a review bill at the end.

**The judgment: score the task on verification cost and blast radius before you open a prompt, and size to a reviewable unit — not a line count.** The heuristics I trust: give the agent a check *it* can run (a test, a build, a diff-against-fixture) so it stops treating "looks done" as the finish line; refuse long-horizon unbounded work and decompose it into sub-hour, independently verifiable pieces; and keep vague, taste-heavy, or context-in-your-head work in your own hands, because that's exactly where the measured productivity went negative. Sizing is a context problem: the constraint is how much the agent must hold in its window to finish cleanly, not how many lines come out. (Deep dives: [What AI Coding Agents Are Actually Good For](/blog/what-ai-agents-are-actually-good-for/), [How to Size Tasks for AI Coding Agents](/blog/how-to-size-tasks-for-ai-coding-agents/), and [The Anatomy of a Perfect AI Agent Task](/blog/anatomy-of-a-perfect-ai-agent-task/).)

One reassuring number keeps the fear calibrated: in real agent traffic Anthropic measured that [only 0.8% of actions appear irreversible, with 80% of tool calls carrying at least one safeguard](https://www.anthropic.com/news/measuring-agent-autonomy). Oversight should concentrate on that thin slice where a single error is catastrophic — not spread flat across the 99% that a rerun fixes.

---

## Pillar 2 — Context Engineering

**The claim: context is a budget you spend against a hard ceiling, not a free input you maximize.**

The instinct is to pour everything into the window — the whole CLAUDE.md, every tool, all the retrieved docs — on the theory that more information can only help. The evidence says the opposite past a threshold. Distyl AI's density study found that [even the best frontier models hit only **68% accuracy at 500 instructions**](https://arxiv.org/abs/2507.11538) ([Jaroslawicz, Whiting, Shah, Maamari](https://arxiv.org/abs/2507.11538)) — instruction-following degrades measurably as you pack rules in. Chroma's context-rot work across 18 models found that [models do not use their context uniformly; performance grows increasingly unreliable as input length grows](https://www.trychroma.com/research/context-rot). A longer CLAUDE.md is not a neutral cost. It's a reliability tax you're paying whether or not you notice.

The same lesson shows up at the tool layer. Anthropic reports that at scale [the most common failures are wrong tool selection and incorrect parameters, especially when tools have similar names](https://www.anthropic.com/engineering/advanced-tool-use) like `notification-send-user` versus `notification-send-channel` — which is why deferred, just-in-time tool loading both cuts token cost and *raises* selection accuracy. But just-in-time retrieval isn't free either: it's slower, and it's only as good as the tooling underneath it. Where embedding search silently returns [semantically related but unsupported passages, explicit lexical constraints can signal that required evidence is simply absent](https://arxiv.org/abs/2605.27123) — the difference between "I found nothing" and a confident hallucination.

There's an under-specified failure mode hiding here. An empirical study of real context files found that [teams use them to make agents functional but provide few guardrails to ensure agent-written code is secure or performant](https://arxiv.org/abs/2511.12884). CLAUDE.md files are full of setup and empty of constraints — the half that would actually catch bad output is the half nobody writes.

**The judgment: treat CLAUDE.md like maintained config against an instruction ceiling, not a README you append to forever.** Budget it. Every instruction competes for the same finite compliance, so the marginal rule you add lowers adherence to the rules already there. Prefer just-in-time retrieval over eager stuffing — but design the fallback for when it breaks, because retrieval failures are silent by default. And spend your instruction budget on the constraints (security, performance, done-conditions), not just the setup, since that's the systematically missing half. (Deep dives: [CLAUDE.md Instruction Ceiling](/blog/claude-md-instruction-ceiling/) and [Where Just-in-Time Context Retrieval Silently Breaks](/blog/jit-context-retrieval-failure/).)

---

## Pillar 3 — Evals & Verification

**The claim: generation outran verification, and a green build is the weakest signal you own.**

This is the load-bearing pillar — the one the whole thesis rests on. The academic framing is a [*"speed vs. trust" gap*: agent hyper-productivity produces PRs where a large percentage fail to meet the bar of being truly merge-ready](https://arxiv.org/abs/2509.06216) ([Hassan et al.](https://arxiv.org/abs/2509.06216)), carrying subtle regressions and superficial fixes. And the single most common defect is one that no test suite catches: studying agent-authored PRs, researchers found that [*"descriptions claim unimplemented changes"* was the most common issue at **45.4%**, and high-mismatch PRs had 51.7% lower acceptance rates](https://arxiv.org/abs/2601.04886) ([Gong, Pinna, Bian, Zhang](https://arxiv.org/abs/2601.04886)). Nearly half of agent PRs describe work the code never did. That's not a bug you catch by running the tests — it's a gap between the story and the diff, and closing it is human work.

The reflexive proxies for quality don't hold. Test presence looks like rigor but doesn't behave like it: across agents, [whether a PR includes tests varies over time and doesn't correlate with merge outcomes](https://arxiv.org/abs/2601.03556) — test presence is a signal to read, not proof of correctness. Benchmark scores are worse. A Berkeley audit built a scanning agent and found that [every one of eight prominent agent benchmarks — SWE-bench, WebArena, OSWorld, GAIA, and others — can be exploited to near-perfect scores without solving a single task](https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont). Even *model* comparisons are noisier than they look: Anthropic notes that [a 2-point leaderboard lead might reflect genuine capability, or just beefier hardware or a luckier time of day](https://www.anthropic.com/engineering/infrastructure-noise). And the debt is durable — one study found [22.7% of AI-introduced issues still survive at the latest version of the repository](https://arxiv.org/abs/2603.28592), long after the PR that introduced them merged green.

**The judgment: build verification as a per-task discipline that assumes the agent's self-report is unreliable, and calibrate scrutiny to blast radius.** The moves that survive contact with this evidence: distrust the description — diff it against the code, because the 45% claim-mismatch rate makes the PR narrative the least trustworthy artifact in the review; treat a passing test suite as necessary, never sufficient; ignore benchmark leaderboards for anything but coarse triage; and spend your review budget where a wrong result is expensive to undo, not evenly across every diff. Generation is cheap now, which means verification is the entire job. (Deep dive: [How to Verify AI Coding Agent Output](/blog/evaluating-ai-coding-agent-output/).)

---

## Pillar 4 — Production Operations

**The claim: you supervise what an agent *can reach*, not what it does — and you can't cap a cost you can't attribute.**

Watching an agent's behavior is a losing game, because any model-layer check has a non-zero miss rate and a determined-enough agent finds the gap. Anthropic's containment posture makes the shift explicit: [*"Rather than supervising what the agent does, we supervise what it's able to do by enforcing access boundaries"*](https://www.anthropic.com/engineering/how-we-contain-claude) — sandboxes, VMs, egress controls. AWS names the failure this prevents directly: agents introduce [*excessive agency*, where an agent determines the best solution is to take broader actions beyond its scope](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/gensec05-bp01.html), and the prescription is least-privilege plus user confirmation on the sharp edges. The widely-reported production-database deletions bear this out: even the [vendor's own defense framed the incident as user error — misconfigured access controls, not the AI](https://blog.barrack.ai/amazon-ai-agents-deleting-production). These are authorization failures wearing the costume of model failures.

Autonomy, then, isn't a switch you flip on day one. Monte Carlo frames it well: [autonomy *"is more like a score that goes up or down, and that your system earns through demonstrated reliability in your specific environment"*](https://montecarlo.ai/blog-agentic-autonomy-is-a-trust-score) — earned and revocable, tied to measured behavior in your context, not granted by default.

The cost side has the same shape and is even less solved. Provider dashboards are the wrong instrument: Anthropic's own analytics docs warn that [values for a given date can be revised for up to 30 days as reconciliation runs, and are attributed per-user, not per-request](https://platform.claude.com/docs/en/manage-claude/analytics-api). A number that moves for a month and can't see a task is a lagging report, not a guardrail. The genuinely hard problem, per the FinOps Foundation, is [*identifying the consumer of the model output*, which multi-agent systems make acute](https://www.finops.org/wg/finops-for-ai-overview) — there's no accepted allocation framework yet. But the raw material exists at the call level: Claude Code's OpenTelemetry export already emits [per-skill, per-plugin, per-subagent attribution attributes on every call](https://code.claude.com/docs/en/monitoring-usage).

**The judgment: contain by capability with least-privilege boundaries, and commit a per-task cost schema at the call level *before* you need to enforce a budget.** Concretely: tier an agent's production authority by the blast radius of the task, not by trust in the model — a config change and a database migration should never carry the same token; treat autonomy as an earned score you can revoke; and attribute cost per `(agent, task, user)` at emit time, because a dashboard tells you what you spent last month while a per-task ceiling can stop the next call. (Deep dives: [Tier Your AI Agent's Production Authority by Task Risk](/blog/agent-permission-tiering/) and [You Can't Cap What You Can't Attribute](/blog/per-task-cost-attribution/).)

---

## Pillar 5 — Team & Process

**The claim: reviewer-hours are the real ceiling on how many agents you can run, and the burden concentrates on the people you can least afford to lose.**

You didn't hit a correctness wall when you gave your team five agents — you hit a reviewer-throughput wall. Generation is largely solved; the wall is downstream and it's a throughput wall. The number is already in your telemetry: across two years of data on 22,000 developers, [Faros AI found median time in review up **441.5%** and unreviewed merges up 31.3%](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways). Review time doesn't rise 441% because the code got worse — it rises because more of it arrives at a pool that didn't grow. As the fleet scales against a fixed reviewer denominator, [the review queue becomes the binding constraint on the delivery pipeline](https://arxiv.org/html/2606.13175v1) ([Monperrus](https://arxiv.org/html/2606.13175v1)).

The reflexive fix — a review agent — backfires when you measure it by comments instead of load removed. Studied across thousands of real PRs, [code-review-agent-only PRs merged at 45.20%, **23 points below** human-reviewed PRs (68.37%)](https://arxiv.org/html/2604.03196v1) ([Chowdhury et al.](https://arxiv.org/html/2604.03196v1)), because most comments weren't the signal a reviewer needed — a high-volume "find everything" agent [buries the reviewer in a low signal-to-noise ratio that obscures true progress](https://arxiv.org/html/2603.11078v1). Meanwhile the real cost hides where dashboards don't look. Faros describes [senior engineers becoming the verification layer](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden), spending "their most valuable hours unraveling plausible-looking code" — a burden that "does not get measured in PR throughput dashboards, which is precisely why the cost is invisible until it isn't," priced at $150K–$300K per senior engineer who burns out and leaves.

**The judgment: budget review as a finite, protected resource, and split the delegable half from the half that can't move.** Do the reviewer-hours math *before* you approve agent number seven — past the crossover, each added agent buys queue depth, not throughput. Triage review depth by risk class, not by author or diff size: a config change earns a linter and a glance; a payments path earns the full stack. Cap high-risk AI-diff load per reviewer and make it a line item in headcount planning, the way you'd budget on-call. And split the role: line-by-line inspection is mechanical and delegable to agents, but [the *review* — judgment about whether the software is correct for its purpose — relocates to intent-in and accountability-out](https://blakecrosley.com/blog/agents-supersede-the-reviewer), and stays human and named, because a model can't be paged for what it shipped. (Deep dive: [Review Capacity Is the Real Ceiling on Your Agents](/blog/review-capacity-agent-throughput/).)

---

## Pillar 6 — Architecture Decisions

**The claim: split to many agents for context isolation, not speed — and build-vs-buy is now a five-year ownership call.**

The multi-agent hype sells parallelism; the real justification is narrower. Anthropic's own multi-agent system earns its complexity because [subagents facilitate compression by operating with their own context windows, condensing the most important tokens for the lead agent](https://www.anthropic.com/engineering/multi-agent-research-system) — separate windows, not raw speed, are the reason to split. And splitting is expensive: the payoff has to clear the coordination cost, because multi-agent failure is predominantly organizational, not a model deficiency. A Berkeley taxonomy of multi-agent failures identified [14 modes clustered into system-design issues, inter-agent misalignment, and task verification](https://arxiv.org/abs/2503.13657) — a readiness test you can fail with the best model on the market. Going multi-agent is a decision to take on a distributed-systems problem, and it should be gated on context isolation, not reached for because parallel sounds faster. (Deep dive: [When One Agent Stops Being Enough: The Isolation Gate](/blog/multi-agent-context-isolation/).)

The larger architecture shift is about ownership. Agentic AI cut the cost of *writing* software, not the cost of *owning* it — and ownership is where the money always was. [60% of a software system's lifecycle cost is maintenance, against a measly 40% for development](https://www.oreilly.com/library/view/97-things-every/9780596805425/ch34.html) ([David Wood, O'Reilly](https://www.oreilly.com/library/view/97-things-every/9780596805425/ch34.html)). Cheap generation shrinks the 40% and does nothing for the 60% — it can make the 60% worse. GitClear's analysis found that AI-assisted development correlates with [refactoring dropping from 25% of changed lines in 2021 to under 10% in 2024, while copy-pasted clones rose from 8.3% to 12.3%](https://www.gitclear.com/ai_assistant_code_quality_2025_research): more duplication, less consolidation, a heavier maintenance tail on code you now own.

This is why individual speed doesn't become system throughput. DORA's 2024 research found AI adoption [significantly increases individual productivity and flow while *negatively* impacting software delivery stability and throughput](https://dora.dev/research/2024/dora-report) — RedMonk's read of the same data estimates a [25% increase in AI adoption predicts a 1.5% *decrease* in throughput](https://redmonk.com/rstephens/2024/11/26/dora2024). The bottleneck was never generation, so speeding up generation doesn't move the system.

**The judgment: gate multi-agent on context isolation, and price build-vs-buy on the five-year maintenance tail, gated on verification.** When the make-vs-buy call is by application type, the pattern that holds up is [retain *buy* for mission-critical systems of record, and make selectively for peripheral or differentiating modules](https://arxiv.org/abs/2604.26482) — the calculus shifts toward build where you can verify and own cheaply, and stays buy where the ownership risk is existential. Build-vs-buy stopped being a development-cost comparison and became an ownership-cost bet. (Deep dive: [Build vs. Buy Agentic AI: Ownership Is the New Decision](/blog/build-vs-buy-agentic-ai/).)

---

## What breaks next

The six pillars describe where the cost is today. Here's where I think the pressure moves over the next 12–18 months — the judgment layer that isn't in any single essay, offered as forecasts to argue with, not facts to cite.

**Verification becomes a first-class engineering discipline with its own tooling and titles.** Right now verification is an unbudgeted tax paid by whoever clicks merge. That's unstable. When the [most common agent-PR defect is a description that lies about the diff](https://arxiv.org/abs/2601.04886) and [benchmarks can be gamed to perfect scores](https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont), the teams that win will treat "prove this diff does what it says" as a named function with owned tooling — not a thing seniors do between meetings. Expect verification engineering to professionalize the way SRE did after ops stopped scaling by heroics.

**The review-capacity ceiling forces an org-chart change, not just a process change.** The [441% review-time explosion](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways) and the [senior-engineer burnout it concentrates](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden) can't be absorbed by exhortation. Teams will either cap agent fleets to reviewer capacity explicitly, or lose the seniors who are the capacity. The org that measures reviewer-hours as a budgeted resource beats the one that measures agent output — and that's a headcount-planning change, not a tooling one.

**Cost attribution gets solved at the framework layer, and it becomes a governance requirement.** The raw signal already exists per call ([per-subagent OpenTelemetry attributes](https://code.claude.com/docs/en/monitoring-usage)); what's missing is [an accepted allocation framework for multi-agent output](https://www.finops.org/wg/finops-for-ai-overview). Whoever standardizes `(agent, task, user)` attribution turns "we spent a lot on AI last quarter" into an enforceable per-task ceiling — and once regulated industries can't attribute agent spend, it stops being a FinOps nicety and becomes an audit line.

**Containment beats capability as the differentiator between teams that ship agents to prod and teams that don't.** The [production-deletion incidents were authorization failures, not model failures](https://blog.barrack.ai/amazon-ai-agents-deleting-production). As models get more capable, the gap between teams won't be which model they use — it'll be whether they [contained it by capability](https://www.anthropic.com/engineering/how-we-contain-claude) and [tiered authority by risk](https://www.anthropic.com/news/measuring-agent-autonomy). The boring permission-boundary work is the moat.

The meta-forecast under all four: the industry's attention stays fixated on the capability curve — the next model, the higher benchmark, the longer horizon — while the value accrues to the teams that engineer the system around the agent. The [19% slowdown](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study) wasn't a model problem, and no model release fixes it. It's a systems problem, and systems problems are won by engineering judgment, not by waiting.

---

## The one-line version

Generation got cheap; everything downstream didn't. The constraint moved off the model and onto the system around it — verification, context discipline, permission boundaries, review capacity, and the ownership tail. Stop tuning the agent. Engineer the system.

If this was useful, the essays behind each pillar go deeper, and the [research index](/research/) is the full evidence base — 101 verified sources, updated as I publish. Reply to the email that delivered this report; I read every one.

---

## References

Every claim above traces to a primary source in the [public research index](/research/), where each entry is a verbatim figure or quote checked against the live page. The load-bearing sources, by pillar:

**Task Design & Decomposition** — [METR: Measuring AI Ability to Complete Long Tasks](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks) · [Kwa, West, Becker et al. (METR): Measuring AI Ability to Complete Long Software Tasks](https://arxiv.org/abs/2503.14499) · [METR: Early-2025 Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study) · [Anthropic: Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) · [Anthropic: Measuring AI Agent Autonomy in Practice](https://www.anthropic.com/news/measuring-agent-autonomy) · [Addy Osmani: The 80% Problem in Agentic Coding](https://addyo.substack.com/p/the-80-problem-in-agentic-coding)

**Context Engineering** — [Jaroslawicz, Whiting, Shah, Maamari (Distyl AI): instruction-density study](https://arxiv.org/abs/2507.11538) · [Hong, Troynikov, Huber (Chroma): Context Rot](https://www.trychroma.com/research/context-rot) · [Anthropic: Advanced Tool Use](https://www.anthropic.com/engineering/advanced-tool-use) · [Chatlatanagulchai et al.: context-file guardrails](https://arxiv.org/abs/2511.12884) · [Zeng et al.: logical vs. agentic hybrid retrieval](https://arxiv.org/abs/2605.27123)

**Evals & Verification** — [Gong, Pinna, Bian, Zhang: mismatched-claim defects in agent PRs](https://arxiv.org/abs/2601.04886) · [Hassan et al.: the speed-vs-trust gap](https://arxiv.org/abs/2509.06216) · [Haque, Ingale, Csallner: tests in agent PRs](https://arxiv.org/abs/2601.03556) · [Berkeley RDI: Trustworthy Benchmarks](https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont) · [Anthropic Research: infrastructure noise in evals](https://www.anthropic.com/engineering/infrastructure-noise) · [Liu et al.: survival of AI-introduced issues](https://arxiv.org/abs/2603.28592)

**Production Operations** — [Anthropic: How We Contain Claude](https://www.anthropic.com/engineering/how-we-contain-claude) · [AWS: excessive agency (Well-Architected GenAI Lens)](https://docs.aws.amazon.com/wellarchitected/latest/generative-ai-lens/gensec05-bp01.html) · [Barrack AI: the Amazon agent deletion post-mortem](https://blog.barrack.ai/amazon-ai-agents-deleting-production) · [Monte Carlo: autonomy is a trust score](https://montecarlo.ai/blog-agentic-autonomy-is-a-trust-score) · [Anthropic: Analytics API reconciliation](https://platform.claude.com/docs/en/manage-claude/analytics-api) · [FinOps Foundation: FinOps for AI](https://www.finops.org/wg/finops-for-ai-overview) · [Anthropic: Monitoring Usage (OpenTelemetry attribution)](https://code.claude.com/docs/en/monitoring-usage)

**Team & Process** — [Faros AI: The Acceleration Whiplash (22,000-dev telemetry)](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways) · [Naomi Lurie / Faros AI: The Hidden Cost of AI Code Quality](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden) · [Chowdhury et al.: From Industry Claims to Empirical Reality](https://arxiv.org/html/2604.03196v1) · [Pereira et al. (Nutanix): CR-Bench](https://arxiv.org/html/2603.11078v1) · [Monperrus: The End of Code Review](https://arxiv.org/html/2606.13175v1) · [Blake Crosley: Agents Supersede the Reviewer, Not the Review](https://blakecrosley.com/blog/agents-supersede-the-reviewer)

**Architecture Decisions** — [Anthropic: Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system) · [Cemri et al. (UC Berkeley): multi-agent failure taxonomy](https://arxiv.org/abs/2503.13657) · [David Wood (O'Reilly): 60% of lifecycle cost is maintenance](https://www.oreilly.com/library/view/97-things-every/9780596805425/ch34.html) · [GitClear: AI code-quality research](https://www.gitclear.com/ai_assistant_code_quality_2025_research) · [DORA 2024 (Google Cloud)](https://dora.dev/research/2024/dora-report) · [Rachel Stephens (RedMonk): reading DORA 2024](https://redmonk.com/rstephens/2024/11/26/dora2024) · [David Klotz: agentic make-vs-buy by application type](https://arxiv.org/abs/2604.26482)

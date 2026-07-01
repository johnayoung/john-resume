---
title: "Review Capacity Is the Real Ceiling on Your Agents"
date: 2026-06-08
draft: false
author: "John Young"
description: "The ceiling on how many AI coding agents your team can run is reviewer-hours, not agent output — and that number is already in your telemetry. Here's how to size it."
keywords: ["review capacity AI coding agents", "reviewer throughput", "AI code review", "code review bottleneck", "review load per reviewer"]
---

You didn't hit a correctness wall when you gave your team five agents — you hit a reviewer-throughput wall. And the peer-reviewed data says the review bots you bolted on to fix it dropped your merge rate by 23 points instead of raising it. The thing that decides how many agents your team can actually run is not agent output quality; it's how much your reviewers can absorb before the queue backs up and people start rubber-stamping. That number is finite, it's measurable, and most teams have never once looked at it.

One concrete scenario runs through every section below: a six-person reviewer pool absorbing the output of a growing agent fleet. The peer-reviewed corpus gives us the exact shape — one team reporting 30 pull requests per day across 6 reviewers ([Baltes, Cheong, Treude: "An Endless Stream of AI Slop"](https://arxiv.org/html/2603.27249v2)). The artifact that carries the argument is the *ratio*: agents-in-flight over reviewer-hours-available — the same six-reviewer team under a different microscope each time.

---

## Your Agents Don't Hit a Correctness Wall — They Hit a Reviewer-Throughput Wall You Can Already Measure

People instinctively debug the agent. More context, better prompts, a tighter task spec — all aimed at the code the agent produces. But the generation problem is largely solved; the wall you actually hit is downstream, and it's a throughput wall, not a correctness wall. As Codacy puts it, "The bottleneck has moved from writing code to deciding whether code is safe to merge" ([Codacy: AI Is Breaking Code Review](https://blog.codacy.com/ai-breaking-code-review-how-engineering-teams-survive-pr-bottleneck)). Generation stopped being scarce; deciding whether the generated code should merge is exactly as expensive as it always was.

The number that proves this is already in your telemetry. Across two years of data on 22,000 developers, the Faros AI Engineering Report 2026 found that median time in review is up 441.5%, and pull requests merged with no review at all — human or agentic — are up 31.3% (Faros telemetry — vendor research, commercial interest; [Faros: The Acceleration Whiplash](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways)). That is the six-reviewer team in aggregate: raw agent output climbing while the same six people stay the fixed denominator. Review time doesn't rise 441.5% because the code got worse — it rises because more of it is arriving at a pool that didn't grow.

The tell is that agent-assisted output and shippable throughput move in opposite directions. Codacy reports CircleCI's 2026 data showing feature-branch throughput up 59% year over year while, for the median team, main-branch throughput fell nearly 7% and main-branch success rates dropped to 70.8% ([Codacy](https://blog.codacy.com/ai-breaking-code-review-how-engineering-teams-survive-pr-bottleneck)). More code enters the pipeline; less of it reaches production. The bottleneck moved — as Developers Digest frames it — "from generation to review queues, CI capacity, flaky environments, branch policy, cost ceilings, and the human attention needed to decide what should actually merge" ([Developers Digest: AI Coding Agents Move the Bottleneck to Review Queues](https://www.developersdigest.tech/blog/ai-coding-agents-review-queues)).

The asymmetry underneath all of this is the durable part. Addy Osmani lands it in one line:

> "We made writing cheap, and understanding stayed exactly as expensive as it has always been."
> — [Addy Osmani / O'Reilly Radar: Agentic Code Review](https://www.oreilly.com/radar/agentic-code-review/)

So stop tuning the agent and go read your review dashboard. The ceiling on how many agents you can run is reviewer-hours, and the 441.5% is telling you where that ceiling already is.

---

## Do the Reviewer-Capacity Math Before You Approve Agent Number Seven

Adding an agent feels like adding output. It isn't — it's adding a queue. Every PR an agent opens is a claim on reviewer-hours you have not yet spent, and if the sum of those claims exceeds the hours your reviewers actually have, the surplus doesn't ship. It waits. Before you approve agent number seven, do the arithmetic that nobody does: reviewer-hours the new PRs will consume, against reviewer-hours you have.

The six-reviewer team makes the crossover concrete. Hold the denominator fixed — six reviewers, eighteen focused review-hours a day — and watch per-PR attention fall as the fleet grows:

| Fleet output | PRs/day | Reviewer-hours | Attention per PR |
| ------------ | ------- | -------------- | ---------------- |
| Current | 30 | 18 | ~36 min |
| + agent #7 | 35 | 18 | ~31 min |
| + two more agents | higher | 18 | under 27 min |

The numbers come from the corpus. At 30 PRs per day ([Baltes et al.](https://arxiv.org/html/2603.27249v2)) — five per reviewer — and, generously, three focused review-hours each before meetings and their own work eat the rest, that's roughly 36 minutes of genuine attention per PR. Agent number seven pushes output to 35 PRs against the same eighteen review-hours, and per-PR attention drops to about 31 minutes. Two more agents and you're under 27. At some crossover the attention-per-PR falls below the floor where a reviewer can actually reason about the change, and past that point every added agent produces queue depth, not shippable output.

That crossover is not a metaphor. Monperrus, who argues the case as hard as anyone, names it directly: "the review queue becomes the binding constraint on their delivery pipeline" ([Martin Monperrus: The End of Code Review](https://arxiv.org/html/2606.13175v1)). Blake Crosley states the mechanism in one sentence — "An agent-assisted developer produces more pull requests per day than human review capacity can absorb" ([Blake Crosley: Agents Supersede the Reviewer, Not the Review](https://blakecrosley.com/blog/agents-supersede-the-reviewer)). The absorption rate is the fixed quantity. The agent count is the variable you keep turning up against it.

The sizing question is therefore: **does the reviewer-hours math clear before you add the agent, or are you buying queue depth and calling it throughput?** This is the same discipline as sizing the tasks in the first place — a well-sized diff maps to a reviewable unit, so upstream sizing is what keeps the per-PR review cost inside the budget ([How to Size Tasks for AI Coding Agents](/blog/how-to-size-tasks-for-ai-coding-agents/)). Compute the denominator first. If the sum exceeds capacity, agent number seven is not an output gain — it's a deferral.

---

## Measure Your Review Agents by the Load They Remove, Not the Comments They Post

The reflexive fix for a review queue is a review agent, and the reflexive way to measure it is comment count and merge rate. Both are wrong, and the empirical data says so bluntly. Rip merge rate and comment volume off the review-agent dashboard and track one thing instead: reviewer-load removed.

**When you see a review agent's comment volume climb while its accepted-comment ratio falls, treat it as adding load, not removing it.** The accepted-comment ratio is the honest signal — an issue can be considered accepted when a later commit addresses it. Comment count is not; past a threshold, reviewers stop reading. Watch the two together: rising volume plus falling acceptance is a review agent that is now part of the queue it was supposed to drain.

The merge-rate data is the part that should stop you. Chowdhury et al., studying code review agents across thousands of real PRs, found that "CRA-only reviewed PRs achieve a 45.20% merge rate, 23.17 percentage points lower than human-only PRs (68.37%)" ([Chowdhury et al.: From Industry Claims to Empirical Reality](https://arxiv.org/html/2604.03196v1)). High-volume review agents didn't raise the merge rate — they lowered it by 23 points, which is the exact gap the opening line named. And the reason is noise: in the same study, "60.2% of closed CRA-only PRs fall into the 0–30% signal range" ([Chowdhury et al.](https://arxiv.org/html/2604.03196v1)). Most of the comments were not the signal a reviewer needed.

Two independent lines confirm that comment volume stops mapping to value once it crosses a noise threshold. The Nutanix CR-Bench study finds that "code review agents can exhibit a low signal-to-noise ratio when designed to identify all hidden issues, obscuring true progress and developer productivity" ([Pereira et al. / Nutanix: CR-Bench](https://arxiv.org/html/2603.11078v1)) — a "find everything" agent buries the reviewer. And CodeRabbit, whose commercial interest points the other way, admits the same measurement failure:

> "Precision metrics degrade because even high-quality comments may be ignored simply due to volume."
> — [David Loker / CodeRabbit: How to evaluate AI code review tools](https://www.coderabbit.ai/blog/framework-for-evaluating-ai-code-review-tools) (vendor source)

Once reviewers skim and bulk-dismiss, as Loker notes, you are "no longer measuring how a tool performs in practice, but how reviewers cope with noise." Load removed — did the reviewer spend fewer minutes, not read more comments — is the only number that tracks whether the review agent bought you capacity or spent it.

---

## Triage Review Depth by Risk Class, Not by Author or Diff Size

Uniform review depth is what exhausts the pool. If every incoming diff earns the same scrutiny — the config bump and the payments change reviewed with identical rigor — you are spending your scarcest resource flat across work that carries wildly different blast radius. The fix is to route by risk class before a human touches the diff.

**Bad:** Every PR goes into the same review queue at the same depth. A reviewer reads the config change as carefully as the payments path because the process doesn't distinguish them — so either the config change wastes senior attention, or the payments change gets the same shallow pass everything else gets. Depth is set by whoever is next in the queue, not by what the diff can break.

**Good:** Tier the diff by blast radius on the way in. Osmani states the rule and the two ends of it exactly:

> "Tier by risk, not by author. A config change earns a linter and a glance. A payments path earns the full stack: types, tests, two different AI reviewers, a human who owns that system, and a security pass."
> — [Addy Osmani: Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/)

Same pool, wildly different draw on it — sorted by what the change actually touches rather than who wrote it. The config change spends near-zero reviewer-hours; the payments path spends the full stack.

Risk class is the first axis; diff size is the second. A large diff inside a low-risk boundary is still cheap to review; a small diff on a payments path is not. Keep each agent's output inside a reviewable unit and the risk-tier draws stay predictable — which is the whole point of sizing the task to comprehension capacity upstream ([How to Size Tasks for AI Coding Agents](/blog/how-to-size-tasks-for-ai-coding-agents/)). Triage by risk first, size second, and the six reviewers stop burning full-stack attention on config bumps.

---

## Cap High-Risk AI-Diff Load Per Reviewer and Budget Review as a Finite, Protected Resource

Unbudgeted review load is invisible to your throughput dashboards, and invisible load shows up later as senior-engineer attrition. The capacity math from earlier gives you a per-team number; the move here is a per-person budget you then protect, because the denominator in that ratio erodes silently through burnout long before anyone charts it. Treat review as a finite, protected resource with a hard ceiling, not an elastic one that stretches until someone quits.

Run this checklist:

1. Set a per-reviewer cap on high-risk AI diffs per week. Name the number. Once a reviewer is at the cap, the next high-risk diff waits or reroutes — it does not silently land on them.
2. Assign a named human owner per high-risk system. The payments path has one person accountable for it, not "the queue."
3. Make the review budget a line item in headcount planning, the same way you'd budget on-call. Reviewer-hours are capacity you're spending, so account for them explicitly.
4. Watch accepted-comment ratio and reviewer-hours-per-PR, not merge count — the same instrument from the measurement section, applied to humans.
5. Price the overflow. Faros puts the replacement cost of a senior engineer at "$150,000 to $300,000 in 2026, including recruiting, ramp time, and lost institutional knowledge" ([Naomi Lurie / Faros AI: The hidden cost of AI code quality](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden), vendor research). Unbudgeted overflow is paid in that currency.

The reason the cap has to be explicit is that the cost hides. Faros is direct that this burden "does not get measured in PR throughput dashboards, which is precisely why the cost is invisible until it isn't" ([Lurie / Faros AI](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden)). It concentrates on exactly the people you can least afford to lose: the Faros telemetry describes "the engineers with the deepest knowledge of the system spending their most valuable hours unraveling plausible-looking code" ([Faros: The Acceleration Whiplash](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways)). The peer-reviewed corpus frames the same dynamic as externalization — one developer's productivity gain becomes the reviewing team's uncounted burden: "The development time has been shortened but the team now needs to spend more time to review. Doesn't look like any benefit" ([Baltes et al.](https://arxiv.org/html/2603.27249v2)).

A large share of that senior burden is the tax of reconstructing intent the agent threw away — reviewers "reconstructing intent from generated code, thin specs, incomplete Jira tickets, and edge cases nobody wrote down" ([Lurie / Faros AI](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden)). That tax is pre-payable upstream: a task spec that states the goal, constraints, and done conditions hands the reviewer the intent instead of making them excavate it ([The Anatomy of a Perfect AI Agent Task](/blog/anatomy-of-a-perfect-ai-agent-task/)). Cap the high-risk load per reviewer, budget it as protected headcount, and the six-reviewer denominator stops quietly shrinking.

---

## Delegate the Inspection, Keep the Judgment

The extreme version of the queue diagnosis is "automate review entirely" — and it gets the diagnosis right and the prescription dangerously wrong. Monperrus argues the wall is real, then reaches a conclusion that drops the one thing that can't be delegated: he documents how, in practice, "reviews of agent-generated code become rubber-stamps: the human approves because the code looks correct, because the tests pass, and because the cognitive cost of genuine scrutiny is prohibitive" ([Monperrus](https://arxiv.org/html/2606.13175v1)). That rubber-stamp is not review; it's review's absence wearing review's badge. The move is to split the role in two before you delegate any of it.

**When a review task is mechanical pattern-matching — style, obvious defects, convention drift, line-by-line diff inspection — delegate it to the agents.** That is the reviewer *role*, and it's automatable. **When a task requires deciding what "correct" means for the product, or being the person accountable for what shipped, it stays human — always, and named.** That is the *review*, and it does not delegate. Crosley draws the line precisely:

> "The reviewer role is being automated. The review, understood as judgment about whether the software is correct for its purpose, is relocating to where the agent cannot follow."
> — [Blake Crosley: Agents Supersede the Reviewer, Not the Review](https://blakecrosley.com/blog/agents-supersede-the-reviewer)

The judgment doesn't evaporate when you automate the checkpoint — it relocates to both ends. It moves to intent specification on the way in ("specifying intent precisely enough that the agents have something true to verify against") and to accountability on the way out ("owning the consequences when the shipped result meets the spec but misses the point") ([Crosley](https://blakecrosley.com/blog/agents-supersede-the-reviewer)). And accountability is irreducibly human because, as Osmani puts it, "A model cannot be paged and cannot be held responsible for what it shipped, so whoever clicks merge owns it" ([Addy Osmani: Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/)).

This is what actually raises the agent count the six reviewers can sustain. Their job stops being "inspect every diff" — the agents do line-by-line inspection at machine speed — and becomes "define intent on the way in, own the merge on the way out." Line-by-line inspection was the part that scaled linearly with agent output and blew the capacity budget. Intent and accountability scale with the number of *systems*, not the number of *diffs*. Delegate the inspection, keep the judgment, and the ratio finally moves in your favor.

---

## Size Your Review Capacity in Six Questions

Before you scale the agent fleet, run this table top to bottom. Each row converts one section's rule into a yes/no gate, paired with the concrete signal that it's being violated. If you can't answer yes, that's where your review pipeline breaks before the agents do — it's the six-reviewer scenario's scorecard.

| # | The gate | The signal it's being violated |
| - | -------- | ------------------------------ |
| 1 | Are you measuring reviewer-hours, or still tuning agent output quality? | Review time climbing while you keep optimizing the agent. |
| 2 | Did you do the reviewer-hours math before the last agent you added? | Queue depth up, shippable throughput flat. |
| 3 | Do you measure review agents by load removed, not comments posted? | Comment volume up, accepted-comment ratio down. |
| 4 | Do you triage review depth by risk class before a human looks? | Same rigor on a config change and a payments path. |
| 5 | Is there a per-reviewer cap on high-risk AI diffs? | Senior engineers quietly absorbing overflow; attrition risk invisible on dashboards. |
| 6 | Have you split delegable inspection from non-delegable judgment? | Nobody named as the human who owns each high-risk merge. |

The pattern across all six rows: the ceiling on how many agents you can run is a reviewer-capacity number, and every failing row is a place you're spending that capacity without counting it. Agents make code cheaper to produce. They do not make it cheaper to understand — and understanding is the resource you're actually rationing.

---

## References

### Research and Data

1. [Chowdhury, Banik, Ferdous, Shamim: From Industry Claims to Empirical Reality — An Empirical Study of Code Review Agents in Pull Requests](https://arxiv.org/html/2604.03196v1) — CRA-only PRs merge at 45.20% vs 68.37% for human-only (23.17 points lower); 60.2% of closed CRA-only PRs fall in the 0–30% signal range. Backs the measurement section.
2. [Pereira, Sinha, Ghosh, Dutta (Nutanix): CR-Bench — Evaluating the Real-World Utility of AI Code Review Agents](https://arxiv.org/html/2603.11078v1) — "Find everything" review agents exhibit low signal-to-noise ratio, obscuring true progress. Second independent primary for load-removed over comment-count.
3. [Baltes, Cheong, Treude: "An Endless Stream of AI Slop" — How Developers Discuss the Burden of AI-Assisted Software Development](https://arxiv.org/html/2603.27249v2) — 30 PRs/day across 6 reviewers; review burden externalized onto the team. Anchors the six-reviewer scenario and the capacity arithmetic.
4. [Martin Monperrus: The End of Code Review — Coding Agents Supersede Human Inspection](https://arxiv.org/html/2606.13175v1) — "The review queue becomes the binding constraint"; documents the rubber-stamp failure mode. Backs the queue diagnosis; steel-manned foil for the replace-humans prescription.
5. [Faros Research: Ten Takeaways from the AI Engineering Report 2026 — The Acceleration Whiplash](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways) — Median time in review up 441.5%; unreviewed merges up 31.3% (22,000-developer telemetry, vendor research). Backs the measurable-wall and senior-burden sections.
6. [Naomi Lurie / Faros AI: The Hidden Cost of AI Code Quality — Why Senior Engineers Are Paying the Price](https://www.faros.ai/blog/ai-code-quality-senior-engineer-review-burden) — Senior replacement cost $150K–$300K in 2026; burden "does not get measured in PR throughput dashboards" (vendor research). Backs budgeting review as protected headcount.

### Practitioner Guidance

7. [Codacy: AI Is Breaking Code Review — How Engineering Teams Survive the PR Bottleneck](https://blog.codacy.com/ai-breaking-code-review-how-engineering-teams-survive-pr-bottleneck) — Bottleneck moved from writing to merge-safety; CircleCI 2026 feature +59% vs main −7%, main-branch success 70.8%. Backs the throughput-not-correctness framing.
8. [Addy Osmani / O'Reilly Radar: Agentic Code Review](https://www.oreilly.com/radar/agentic-code-review/) — "We made writing cheap, and understanding stayed exactly as expensive as it has always been." The asymmetry that makes review the ceiling.
9. [Addy Osmani: Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/) — "Tier by risk, not by author"; config change earns a glance, payments path earns the full stack; whoever clicks merge owns it. Backs risk-triage and human-accountability.
10. [Blake Crosley: Agents Supersede the Reviewer, Not the Review](https://blakecrosley.com/blog/agents-supersede-the-reviewer) — Output outruns absorption; the reviewer role automates while the review relocates to intent-in and accountability-out. Backs the capacity wall and the inspection/judgment split.
11. [David Loker / CodeRabbit: How to Evaluate AI Code Review Tools — A Practical Framework](https://www.coderabbit.ai/blog/framework-for-evaluating-ai-code-review-tools) — Precision metrics degrade as comments are ignored due to volume; you end up measuring how reviewers cope with noise (vendor source). Backs the measurement rule.
12. [Developers Digest: AI Coding Agents Move the Bottleneck to Review Queues](https://www.developersdigest.tech/blog/ai-coding-agents-review-queues) — Bottleneck relocation from generation to review queues, CI, and human merge attention. Supporting framing for the first section.

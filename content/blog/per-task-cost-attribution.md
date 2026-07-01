---
title: "You Can't Cap What You Can't Attribute: Per-Task Cost"
date: 2026-06-29
draft: true
author: "John Young"
description: "A cost dashboard is a lagging report, not a guardrail. Per-task cost attribution is the schema that makes an agent budget ceiling enforceable before the next call."
keywords: ["AI agent cost attribution", "agent budget guardrails", "per-session ceiling", "LLM FinOps", "prompt.id"]
---

A billing dashboard is the last place you want to discover a runaway agent — by the time the number is right the money is spent, and on Anthropic's own analytics that number can keep moving for thirty days. The dashboard is a reconciled report of what already happened; the control you actually need has to fire one API call earlier than that.

---

## Distrust the Dashboard — the Aggregate Number Is a Lagging Indicator, Not a Control

Stop reading the cost dashboard as a guardrail. It is a reconciled report, and on Anthropic's Enterprise Analytics the numbers for a given day keep moving for a month as reconciliation catches up:

> "Values for a given date can be revised for up to 30 days as late events arrive and reconciliation runs. For invoicing-grade totals, query dates at least 30 days in the past."
> — [Anthropic: Analytics APIs](https://platform.claude.com/docs/en/manage-claude/analytics-api)

Thirty days is the *invoicing-grade* horizon, not the operational one. A number that is only trustworthy after a month is a report you close your books against — it is not a signal you throttle spend on. The provider's own reporting layer is built for reconciliation, which means it is a lagging indicator by construction, and a lagging indicator can only ever tell you about damage that already landed.

The granularity is wrong too. Anthropic's cost endpoints report "per-user and organization-level token usage and cost over time (usage-based Enterprise plans)" ([Anthropic: Analytics APIs](https://platform.claude.com/docs/en/manage-claude/analytics-api)) — per user and per org, never per request. So even once the number stops moving, it cannot tell you *which task* burned the money.

The failure mode this produces is well-documented, and it is not subtle. A $38k AWS Bedrock bill from a single prompt-caching miss failed silently because the account's alerts were never a control in the first place:

> "Budget alerts are not a kill switch. Credits are not protection."
> — [Hacker News: $38k AWS Bedrock bill caused by a simple prompt caching miss](https://news.ycombinator.com/item?id=47933355)

That is the take in one line. An alert fires after the invoice; a kill switch fires before the next call. Your actual control has to live upstream of the number, because the number is the thing that arrives too late. Everything that follows is about building the object that upstream control keys on — the task.

---

## Commit the (Agent, Task, User, Team) Dimensions on Every Call — as a Schema, Before You Ship

Decide your attribution dimensions at design time and stamp them on every agent call. A tag you bolt on downstream lives on the wrong object and never reaches the API call — this is the structural failure that makes cloud FinOps tooling useless on LLM spend:

> "Tags exist in AWS/GCP/Azure. They don't propagate to OpenAI/Anthropic API calls. The tag lives on the EC2 instance making the API call, not on the API call itself."
> — [Ravi Kanani, LeanOps Technologies: FinOps for AI Workloads in 2026](https://leanopstech.com/blog/finops-for-ai-2026/)

The tag on the EC2 instance can't see inside the token bill. Attribution has to be a schema on the call, decided before you ship — because you cannot retroactively stamp a dimension onto calls that already went out untagged.

The good news is that the schema is a configuration decision, not a build. The dimensions you need already exist as telemetry attributes you can emit today. When you see a dimension you want to attribute on, map it to the attribute that already carries it:

- **The "what" — which agent, skill, or plugin spent.** Emit `agent.name`, `skill.name`, and `plugin.name`. Anthropic's monitoring describes exactly this: "Attributing spend to specific skills, plugins, or subagent types via the `skill.name`, `plugin.name`, and `agent.name` attributes" ([Anthropic: Monitoring](https://code.claude.com/docs/en/monitoring-usage)).
- **The "who" — which person or team.** Emit `user.email`: "When authenticated via OAuth, `user.email` is included in telemetry attributes" ([Anthropic: Monitoring](https://code.claude.com/docs/en/monitoring-usage)). Team rolls up from there.
- **The "which task" — the unit spend actually maps to.** Emit `prompt.id` (the next section is entirely about why this one is the load-bearing dimension).

Each row is a dimension mapped to an attribute you can already emit — so committing the schema is a decision, not an engineering project. The one cost to respect is cardinality: every custom dimension becomes a label on every metric series, so pick the dimensions a ceiling will actually key on and stop. A well-specified task with a defined "done" — the kind the [anatomy of a perfect agent task](/blog/anatomy-of-a-perfect-ai-agent-task/) argues for — is what makes these dimensions worth stamping. A bounded task is the thing a per-session ceiling can later be scoped to. Get the schema right here and every section after this one has an object to attach to.

---

## Attribute to the Prompt, Not the User — the Task Is the Unit That Maps to Spend

Make the prompt your attribution key, not the user. One prompt fans out into many billed calls, and user granularity hides which task caused the spend — so the key you attribute on has to be the task itself. Anthropic gives you exactly that key: `prompt.id`.

Take one concrete agent run. A developer submits a single prompt — "add phone number support to user registration" — and that one prompt does not make one API call. It expands. Anthropic's own correlation key is what ties the expansion back together:

> "To trace all activity triggered by a single prompt, filter your events by a specific `prompt.id` value. This returns the user_prompt event, any api_request events, and any tool_result events that occurred while processing that prompt."
> — [Anthropic: Monitoring](https://code.claude.com/docs/en/monitoring-usage)

Read that fanout carefully, because it is the whole argument. One `prompt.id` returns *one* `user_prompt` event, *many* `api_request` events, and *many* `tool_result` events. The task is one; the billed calls are many. If you attribute at the user level, all of that collapses into a single "this developer spent $4 today" number that cannot tell you the $4 came from one runaway task rather than forty healthy ones. Attribute on `prompt.id` and the task is the row — the fanout stays underneath its own key.

This is the part the FinOps field agrees is the actual hard problem — not measuring spend, but mapping it back to who caused it:

> "More acute are the challenges of identifying the consumer of the model output, which is especially difficult when the consumers of the same model can be different interfaces/functional modules in the same user application"
> — [FinOps Foundation: FinOps for AI Overview](https://www.finops.org/wg/finops-for-ai-overview/)

The consumer of the model output is the task, not the person. `prompt.id` is the dimension that names it. Carry that key — one prompt, its `prompt.id`, and the call fanout underneath — through the rest of this post; it is the object every remaining move operates on.

---

## Expect Per-Task Cost to Keep Climbing — Autonomy Compounds Calls per Task

Budget for per-task cost to rise over time, not hold flat. The same `prompt.id` fanout you just attributed is a moving target: the longer an agent runs autonomously, the more child calls pile up under one prompt. And the length of task an agent can run autonomously is not holding still — it is doubling.

METR measured the trend directly across six years of frontier models:

> "The length of tasks (measured by how long they take human professionals) that generalist frontier model agents can complete autonomously with 50% reliability has been doubling approximately every 7 months for the last 6 years."
> — [METR: Measuring AI Ability to Complete Long Tasks](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)

The primary paper puts the same result more precisely: "frontier AI time horizon has been doubling approximately every seven months since 2019, though the trend may have accelerated in 2024" ([Kwa, West, Becker, et al. (METR): Measuring AI Ability to Complete Long Software Tasks](https://arxiv.org/abs/2503.14499)). Every doubling of autonomous run length is more hours of agent working unsupervised, and every extra hour is more `api_request` and `tool_result` events under the same `prompt.id`. The per-task number climbs because the task itself runs longer.

This is also where task sizing feeds back in. The loop that inflates the bill is the same loop that overruns the context window — an under-scoped task is what sends the agent into more exploration, more retries, more calls per prompt. Sizing the task so its diff fits in one sentence, as the [task-sizing heuristics](/blog/how-to-size-tasks-for-ai-coding-agents/) argue, is the upstream lever on per-task cost variance; a well-sized task has a smaller, more predictable fanout by construction.

And the cost driver is exactly this fanout, not model price:

> "AI cost also scales differently than cloud cost. It moves with prompt size, fanout, retries, and agentic loops."
> — [Scott Castle, CloudZero: Anthropic Shipped An Enterprise Analytics API. We Shipped the Claude Adapter Today.](https://www.cloudzero.com/blog/anthropic-analytics-api-adapter/)

Prompt size, fanout, retries, agentic loops — every one of those is a multiplier on calls-per-task, and every one of them trends up as autonomy grows. So a budget you set against last quarter's per-task cost is already stale. Whatever ceiling you set has to assume the worst case grows, not holds.

---

## Stop Relying on the Provider's Account Cap — It Caps the Wrong Granularity

Don't let the provider's account-level or key-level cap be your guardrail. It can't tell one runaway session from a hundred healthy ones sharing the same key, so it only fires after the aggregate is already blown — which is after real damage. The problem is not that the cap is weak; it is that it is aimed at the wrong object.

**Bad — the account cap as your guardrail.** You set a $10k/month cap on the API key. One task enters a retry loop and burns $4k in three days. The key's aggregate is still under $10k, so nothing fires; the other ninety-nine well-behaved sessions on that key are subsidizing the runaway's silence. You find out on the reconciled dashboard, thirty days later.

**Good — a cap scoped to the object that actually runs away.** The runaway is a *session*, so the ceiling has to be per session, not per key. The provider cap literally cannot make that distinction:

> "Provider-level controls operate at the API key or account level, not the individual session level. They cannot distinguish a single runaway session from many well-behaved sessions using the same key."
> — [Logan Kelly, Waxell: The $400M AI FinOps Gap](https://www.waxell.ai/blog/ai-agent-finops-cost-enforcement)

That is the wrong-granularity problem stated exactly. An account cap sums across every session, so a single blast-radius task is invisible until it moves the whole account's total — by which point the money is spent. This is not a tooling gap you can wait out, either. The field has no accepted framework for the harder case:

> "Lack of generally accepted frameworks for cost allocation across multi-agent workloads"
> — [FinOps Foundation: FinOps for AI Overview](https://www.finops.org/wg/finops-for-ai-overview/)

No standard framework, no provider control at the session level — which means the enforcement move is yours to build, at the granularity the provider skips. The next two sections are that build.

---

## Enforce by Terminating Before the Next Call — Not Alerting After the Invoice

Put a budget check that fails the request *before it is admitted* into the call path. The same `prompt.id` task now hits a pre-admission gate: the check reads current spend and kills the session before the next API call, rather than reporting it after the invoice. This is the difference between a guardrail and a smoke detector.

The mechanism already exists as a proxy pattern. LiteLLM validates spend before admitting the request:

```
Request  →  budget check (reads current spend from the authoritative store)
             │
             ├─ under budget  →  request admitted, call proceeds
             │
             └─ over budget   →  request FAILS, no call is made
```

The docs describe it as a hard, pre-admission gate: "every budgeted request validates spend against the authoritative database before being admitted (covering key, team, user, organization, end-user, tag, and per-window budgets)" ([LiteLLM: Budgets, Rate Limits](https://docs.litellm.ai/docs/proxy/users)). The termination is not a warning — it is a failed request: "After the key crosses it's `max_budget`, requests fail" ([LiteLLM: Budgets, Rate Limits](https://docs.litellm.ai/docs/proxy/users)).

Note the dimensions the check covers — key, team, user, tag — the same schema you committed two sections ago. The pre-admission check is exactly what that schema was for; without the dimensions stamped on the call, there is nothing for the check to key on. The check terminates the `prompt.id` task before its next child call fires, instead of a dashboard reporting the task after all its child calls already fired.

Practitioners are explicit that this cut-off — not optimization — is the thing they actually need:

> "I needed visibility + limits per agent/task, and the ability to cut it off, not just optimize it."
> — [Hacker News: Ask HN: How are you keeping AI coding agents from burning money?](https://news.ycombinator.com/item?id=47559293)

Visibility plus limits *plus the ability to cut it off*. Compaction and smaller models shave cost per step, but they do not stop an agent that is retrying when it shouldn't. Only a pre-admission check does — because it is the one control that gets to say "no" before the money is spent.

---

## Set the Ceiling per Session — an Unbounded Loop Is Unbounded Spend

Scope the ceiling to the session: a dollar cap and an iteration cap, both keyed on the session id. An agentic loop makes unbounded calls by default, and only a per-session bound turns "unbounded" into a known worst case. The pre-admission check from the last section needs something to check *against* — that something is a per-session ceiling.

The default state of an agent loop is the problem:

> "When agents run agentic loops, they can make unbounded LLM calls, causing unexpected costs."
> — [LiteLLM: Agent Iteration Budgets](https://docs.litellm.ai/docs/a2a_iteration_budgets)

Unbounded is the default. You make it bounded with two counters, both scoped to the session your `prompt.id` task runs in:

```yaml
# Per-session ceiling — both caps key on the session id
max_iterations:        50      # hard cap on LLM calls per session
max_budget_per_session: 5.00   # dollar cap per session (x-litellm-trace-id)

# On breach: the incrementing counter crosses the cap and the
# next request is refused — the session dies, it does not warn.
```

LiteLLM exposes exactly these two: **Max Iterations**, a "Hard cap on the number of LLM calls per session," and **Max Budget Per Session**, a "Dollar cap per session (identified by `x-litellm-trace-id`)" ([LiteLLM: Agent Iteration Budgets](https://docs.litellm.ai/docs/a2a_iteration_budgets)). The session id is both the attribution key and the enforcement key — the same identity that ties the `prompt.id` fanout together is what the counters increment on. That is why attribution had to come first: you cannot scope a ceiling to a task you never named.

Two caps, not one, is deliberate. The iteration cap catches a tight loop that makes many cheap calls; the dollar cap catches a few expensive ones. Together they turn "this task could cost anything" into "this task cannot cost more than $5.00 or fifty calls, whichever it hits first" — a bounded, verifiable worst case per task, which is exactly what a per-task budget was supposed to buy you.

---

## The Line You Actually Draw: Attribution Is Table Stakes, Enforcement Is the Decision

Treat attribution as the non-negotiable prerequisite and enforcement as the explicit org decision. Attribution tells you what happened; it does not stop anything. The field names this split exactly:

> "Consumption dimensions tell you what was used, not who in your business used it. Allocation is the work of mapping that usage back to teams, budgets, and cost centers."
> — [Scott Castle, CloudZero: Anthropic Shipped An Enterprise Analytics API. We Shipped the Claude Adapter Today.](https://www.cloudzero.com/blog/anthropic-analytics-api-adapter/)

Consumption data is table stakes; allocation — and then enforcement on top of it — is the work. So walk each layer and confirm you have *both* the dimension and the ceiling, not just the dimension:

1. **Distrust the dashboard.** Confirm your control lives upstream of the reconciled number, not in it.
2. **Commit the (agent, task, user, team) dimensions as a schema.** Confirm they're stamped on the call before you ship, not bolted on downstream.
3. **Attribute to the prompt, not the user.** Confirm `prompt.id` is your per-task key, so you can name which task to stop.
4. **Expect per-task cost to climb.** Confirm your ceiling assumes the worst case grows, because autonomy trends up.
5. **Don't rely on the provider's account cap.** Confirm your enforcement is scoped below the account, at the session.
6. **Terminate before the next call.** Confirm the budget check fails the request pre-admission, not post-invoice.
7. **Set the ceiling per session.** Confirm both a dollar cap and an iteration cap key on the session id.

The compression, one row per layer above — the attribution move you must have, and the enforcement move that is the actual decision:

| Layer | The attribution move | The enforcement move |
|---|---|---|
| Distrust the dashboard | The number is a report, not a signal | Control lives upstream of the invoice |
| Commit the dimensions as a schema | Stamp (agent, task, user, team) at design time | Schema is what a ceiling later keys on |
| Attribute to the prompt, not the user | `prompt.id` is the per-task key | The task is the thing you cap |
| Expect per-task cost to climb | Attribute per task so you see the climb | Ceiling must assume the worst case grows |
| Provider's account cap | Account granularity hides the task | Wrong granularity to enforce on |
| Terminate before the next call | You know which task to stop | Fail the request before admission |
| Set the ceiling per session | Session id is the attribution key | Per-session dollar + iteration cap |

Read the table left to right and the thesis falls out: every enforcement move on the right is impossible without the attribution move on its left. You can't cap what you can't attribute. Attribution is the prerequisite you must have; the ceiling is the decision you have to actually make — and shipping agents without making it is shipping unbounded spend and calling it a dashboard.

---

## References

### Research and Data

1. [Anthropic: Analytics APIs](https://platform.claude.com/docs/en/manage-claude/analytics-api) — Cost values are revised for up to 30 days and reported per-user/per-org, never per-request; the dashboard is a lagging, reconciled report by construction.
2. [METR: Measuring AI Ability to Complete Long Tasks](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/) — Autonomous task length has doubled roughly every 7 months for 6 years, so per-task run length (and call fanout) keeps climbing.
3. [Kwa, West, Becker, et al. (METR): Measuring AI Ability to Complete Long Software Tasks](https://arxiv.org/abs/2503.14499) — Primary paper: frontier AI time horizon doubling approximately every seven months since 2019.
4. [FinOps Foundation: FinOps for AI Overview](https://www.finops.org/wg/finops-for-ai-overview/) — Identifying the consumer of the model output is the hard allocation problem; no accepted framework exists for multi-agent cost allocation.

### Practitioner Guidance

5. [Anthropic: Monitoring](https://code.claude.com/docs/en/monitoring-usage) — The `agent.name`/`skill.name`/`plugin.name`/`user.email` attribution attributes and the `prompt.id` correlation key that ties one prompt's call fanout together.
6. [LiteLLM: Budgets, Rate Limits](https://docs.litellm.ai/docs/proxy/users) — Budget checks validate spend before a request is admitted; over-budget requests fail rather than warn.
7. [LiteLLM: Agent Iteration Budgets](https://docs.litellm.ai/docs/a2a_iteration_budgets) — Agentic loops make unbounded calls by default; Max Iterations and Max Budget Per Session cap them per session id.
8. [Scott Castle, CloudZero: Anthropic Shipped An Enterprise Analytics API. We Shipped the Claude Adapter Today.](https://www.cloudzero.com/blog/anthropic-analytics-api-adapter/) — AI cost moves with prompt size, fanout, retries, and agentic loops; consumption tells you what was used, allocation is the work.
9. [Ravi Kanani, LeanOps Technologies: FinOps for AI Workloads in 2026](https://leanopstech.com/blog/finops-for-ai-2026/) — Cloud tags don't propagate to the API call; attribution must be a schema on the call itself.
10. [Logan Kelly, Waxell: The $400M AI FinOps Gap](https://www.waxell.ai/blog/ai-agent-finops-cost-enforcement) — Provider controls operate at the key/account level and can't isolate a single runaway session.
11. [Hacker News: $38k AWS Bedrock bill caused by a simple prompt caching miss](https://news.ycombinator.com/item?id=47933355) — Budget alerts are not a kill switch; a silent overrun with no hard cap.
12. [Hacker News: Ask HN: How are you keeping AI coding agents from burning money?](https://news.ycombinator.com/item?id=47559293) — Practitioner demand for per-agent/per-task limits and the ability to cut it off, not just optimize.

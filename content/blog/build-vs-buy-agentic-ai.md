---
title: "Build vs. Buy Agentic AI: Ownership Is the New Decision"
date: 2026-05-11
draft: false
pillar: architecture-decisions
author: "John Young"
description: "Agentic AI cut the cost of building software, not owning it. Build-vs-buy is now a five-year ownership call — priced on the maintenance tail, gated on verification."
keywords: ["build vs buy agentic AI", "ownership cost", "maintenance tail", "verification gate", "differentiation"]
---

Agentic AI slashed the cost of building software and left the cost of owning it exactly where it was — so the build-vs-buy call is no longer "can we afford to build this?" but "can we afford to own this for the next five years?" The first version got cheap; the five-year maintenance tail behind it did not, and that tail is where most of the money and most of the risk actually live.

---

## Agentic AI Cut the Cost of Building, Not the Cost of Owning

Price the decision on what you'll own for five years, not on what it costs to ship the first version. The demo that an agent scaffolds in an afternoon is the cheapest moment in the software's whole life — everything after it is the part you're actually signing up for.

The distinction is not rhetorical. It is the explicit thesis of the current build-vs-buy literature:

> *"AI has dramatically reduced the cost of creating software, but it hasn't eliminated the cost of owning software."*
> — [Matt Paige (HatchWorks): The Build vs Buy Framework in the Age of AI](https://hatchworks.com/blog/gen-ai/build-vs-buy-framework/)

AI makes custom software cheaper. It does not make custom software free — it moves the bill from the build line, where everyone was looking, to the ownership line, where almost nobody is. The buy option was never priced on how hard the thing was to write; it was priced on the vendor absorbing every patch, migration, and compliance change for the life of the product. Cheapening the *build* changes one input to a decision whose dominant term was always ownership.

So the build-vs-buy question isn't about capability anymore — an agent can plausibly build almost anything you'd have bought. It's about which maintenance tail you'd rather own. That reframe runs through every gate below.

---

## Stop Asking "Can We Afford to Build It?" — Ask "Can We Afford to Own It?"

Before you greenlight a build, multiply the first-build estimate by the maintenance tail — because most of a system's lifecycle cost lands after the first version ships, and most of *that* is new work, not warranty repair.

Take the concrete decision this whole post is about: a mid-size regulated company deciding whether to build an internal claims-triage workflow tool — the agentic thing that reads an inbound claim, applies the firm's triage rules, and routes it — versus buy the SaaS equivalent. Suppose an agent-augmented team estimates the first working version at three months. Run the O'Reilly 60/60 numbers on that estimate.

> *"Fully 60% of the life cycle costs of software systems come from maintenance, with a relatively measly 40% coming from development."*
> — [David Wood (O'Reilly): The 60/60 Rule](https://www.oreilly.com/library/view/97-things-every/9780596805425/ch34.html)

If the three-month first build is the 40%, the maintenance that follows is roughly 1.5x that again over the system's life — and it does not stop. The second 60 is the part that surprises the people who budgeted only the first:

> *"During maintenance, 60% of the costs on average relate to user-generated enhancements (changing requirements), 23% to migration activities, and 17% to bug fixes."*
> — [David Wood (O'Reilly): The 60/60 Rule](https://www.oreilly.com/library/view/97-things-every/9780596805425/ch34.html)

Read that breakdown carefully, because it kills the intuition that "the code works, so we're mostly done." Only 17% of maintenance is fixing what's broken. The other 83% is the claims-triage tool absorbing changing requirements — new claim types, a new regulator rule, a payer format that changed — and migrating onto infrastructure that moves underneath it. That work exists whether or not the code was clean, and it is the work an agent cannot pre-pay for you. The sizing question for the claims-triage decision is therefore: **not "can we build the first version cheaply?" but "do we want to staff the second 60% of its lifecycle for the next five years?"**

---

## Treat AI-Built Code as Maintenance Debt Until Proven Otherwise

Assume AI-generated code carries above-baseline churn and duplication, and budget the review-and-refactor tax before you ship it, not after. The maintenance tail from the last section didn't just stay heavy in the agentic era — the evidence says AI-assisted code makes it heavier, which is exactly backwards from the "cheaper to build" story.

The measurable signature is duplication crowding out reuse. GitClear's analysis of changed lines across large enterprise repositories found the trend inverting:

> *"the percentage of changed code lines (associated with refactoring) sunk from 25% of changed lines in 2021, to less than 10% in 2024, while lines classified as 'copy/pasted' (cloned) rose from 8.3% to 12.3%"*
> — [GitClear: AI Copilot Code Quality — 2025 Look Back at 12 Months of Data](https://www.gitclear.com/ai_assistant_code_quality_2025_research)

Refactoring more than halved as a share of changes while cloning climbed — the maintenance signature of a codebase that grows by pasting, not by consolidating. Duplicated logic is exactly the kind of thing that turns the O'Reilly "changing requirements" 60% into a multi-file hunt: change the triage rule once and you find you've shipped it in four places.

### Duplication and Reuse Have Inverted

When you see AI raise your line count, check your clone rate before you celebrate velocity. More lines from an agent is the headline number; the clone rate is the one that predicts your maintenance bill — volume up, reuse down. On the claims-triage build, that is the difference between one triage-rules module and the same rule copy-pasted across every route handler the agent touched.

### Individual Speed Is Not System Throughput

Don't read a copilot's individual speedup as a delivery win; measure stability and throughput, which move the other way. The DORA 2024 research is blunt about the split:

> *"AI adoption significantly increases individual productivity, flow, and job satisfaction. However, it also negatively impacts software delivery stability and throughput"*
> — [DORA (Google Cloud): Accelerate State of DevOps Report 2024](https://dora.dev/research/2024/dora-report/)

The magnitudes make it a rule you can apply, not just a caution. When you see AI adoption rise on a team, expect delivery to move the wrong way:

- **When AI adoption rises ~25%, expect throughput to fall ~1.5%** — [Rachel Stephens (RedMonk): DORA Report 2024 — A Look at Throughput and Stability](https://redmonk.com/rstephens/2024/11/26/dora2024/).
- **When AI adoption rises ~25%, expect delivery stability to fall ~7.2%** — the larger of the two moves, and stability is the one that costs you at 2 a.m. ([RedMonk](https://redmonk.com/rstephens/2024/11/26/dora2024/)).

Neither number is catastrophic on its own. Together they say the thing you have to internalize before you build: the individual keystroke got faster, and the system got slightly worse at shipping and staying up. Budget the review-and-refactor tax on the claims-triage code up front, because the velocity you feel at the keyboard is not the throughput you'll measure at delivery.

---

## Differentiation Is Necessary but Not Sufficient — Add the Verification Gate

> **Author's judgment.** The gate below — build only when the requirement is *both* genuinely differentiating *and* cheaply, continuously verifiable — is my synthesis, not a claim any single source states. It follows from three sourced premises: Fowler's strategic/utility split (differentiation is what earns a build at all), the O'Reilly/GitClear/DORA maintenance-tail evidence (ownership is where you pay, and AI-built code pays more), and the MIT NANDA base rate later in this post (unverified internal builds mostly fail).

Start with differentiation, because it's the classic gate and it's necessary. Martin Fowler's strategic/utility split is the cleanest statement of it:

> *"for a strategic function you don't want the same software as your competitors because that would cripple your ability to differentiate."*
> — [Martin Fowler: Utility Vs Strategic Dichotomy](https://martinfowler.com/bliki/UtilityVsStrategicDichotomy.html)

Now classify the claims-triage tool on that axis, and notice it splits — the tool is not one thing:

**Utility (buy or rent it):** the queue plumbing, the message bus, the retry logic, the model-hosting runtime. Every competitor has the same need and would happily run the same software. Owning it differentiates you from no one and adds maintenance tail for nothing.

**Strategic (candidate to build):** the triage *rules* — the business logic that decides how *your* firm scores and routes *your* claims. That is the part competitors can't hand you, and the part Fowler says you don't want to share.

But differentiation alone doesn't earn a build, and this is where the classic framework is now incomplete. In the agentic era the build got cheap enough that "it's strategic" will greenlight far too many projects — and the maintenance-tail and duplication evidence above says most of them will quietly rot. Fowler himself flags that the line moves:

> *"This is not a static dichotomy. Business activities that are strategic can become a utility as time passes."*
> — [Martin Fowler: Utility Vs Strategic Dichotomy](https://martinfowler.com/bliki/UtilityVsStrategicDichotomy.html)

So differentiation is the entry gate, not the decision. The second gate — can you verify it cheaply and continuously? — is the one the next section makes concrete. Something scoped small enough to test in isolation is the operational meaning of "continuously verifiable" (see [how to size tasks for AI coding agents](/blog/how-to-size-tasks-for-ai-coding-agents/)).

---

## Build When It's Business-Specific AND You Can Verify It Cheaply and Continuously

Build only where the requirement is genuinely yours AND tests, logs, or metrics can confirm it's still correct on every change. If you can't verify it continuously, buying is cheaper than owning it blind — because "owning it blind" is just the maintenance tail with no early-warning system attached.

Run the two-part gate as a checklist against the claims-triage rules — the strategic slice the last section isolated:

1. **Is it genuinely business-specific?** The triage rules encode how your firm decides claims. Joel Spolsky's rule applies directly: *"If it's a core business function — do it yourself, no matter what."* ([Joel Spolsky: In Defense of Not-Invented-Here Syndrome](https://www.joelonsoftware.com/2001/10/14/in-defense-of-not-invented-here-syndrome/)). Pass.
2. **Can you write an acceptance test for "correct"?** Each triage rule maps to observable outcomes — this claim class routes here, that one escalates. If you can express "done" as assertions, you can build it. (Pass.)
3. **Can that test run on every change, cheaply?** The rules become a test suite the agent — and CI — re-runs on every edit. A rule regression fails a build, not a customer. (Pass.)
4. **Would you catch a silent regression within a day?** If the answer is "only when a claim is misrouted in production," you have differentiation without verification — do not build it. (For the rules: pass, via the suite. For an unobservable ML scoring black box: this is where a candidate fails.)

All four clear for the triage rules, and only the triage rules — the surrounding platform does not, which the next section handles. This is why the build case is newly plausible at all: agents make bounded, verifiable work cheap to attempt. Simon Willison names the unlock precisely:

> *"it's not about getting work done faster, it's about being able to ship projects that I wouldn't have been able to justify spending time on at all."*
> — [Simon Willison: Here's how I use LLMs to help me write code](https://simonwillison.net/2025/Mar/11/using-llms-for-code/)

That is the opportunity and the trap in one line. Agents let you justify builds you'd have skipped — which is genuinely good when the thing is verifiable, and a slow-motion maintenance disaster when it isn't. The verification gate is what separates the two. The concrete mechanism for it — acceptance criteria plus verification commands the agent runs itself — is exactly what a [well-formed agent task spec](/blog/anatomy-of-a-perfect-ai-agent-task/) already encodes.

---

## Buy When Reliability, Uptime, and Compliance Are the Actual Product

When the deliverable is really audit trails, uptime, and regulatory documentation, buy it — you're signing up to own a multi-year compliance surface, not a feature. The claims-triage tool lives in a regulated shop, so the *platform* the rules sit in is not more business logic. It's a regulatory obligation wearing a software costume. Same tool, two slices, opposite verdicts:

| Slice of the tool | Klotz category | The real deliverable | Verdict |
|---|---|---|---|
| Triage **rules** | Differentiating custom application (high specificity) | Your firm's business logic | Make |
| The **platform** (model lifecycle, sandboxing, audit-evidence capture) | Regulated standard application | Audit trails, uptime, regulatory evidence | Buy |

Klotz's arXiv taxonomy names exactly this category and gives the verdict:

> *"Mission-critical systems of record: Retain Buy as the primary option. Consider Make selectively for peripheral modules, extensions, or integration layers where the core system's integrity is not at risk."*
> — [David Klotz (arXiv): The Buy-or-Build Decision, Revisited](https://arxiv.org/html/2604.26482v1)

The triage *rules* are Klotz's "differentiating custom application" — high specificity, Make. The *platform* around them — model lifecycle management, sandboxing, audit-evidence capture, the regulatory surface — is a "regulated standard application," where compliance is the product and Buy is the answer. You build the rules and buy the compliance chassis they run in.

The cost model shows why you don't want to own the chassis. GitLab's build economics for a regulated agentic platform:

> *"For a team of roughly 200 developers, an internal build typically costs around $1.4M in year one, requires 2–3 dedicated FTEs to maintain, and takes 12–18 months to reach a first real use case."*
> — [Bryan Ross (GitLab): The real cost of build vs. buy for agentic AI in regulated industries](https://about.gitlab.com/the-source/ai/the-real-cost-of-build-vs-buy-for-agentic-ai-in-regulated-industries/)

(GitLab sells the bought alternative, so treat the dollar figure as directional, not gospel.) Even directionally, the 12–18 months is the tell: that is time your differentiating triage rules are *not* shipping because your engineers are building an audit-log system a vendor already sells. Ross names the opportunity cost exactly — *"Every engineer building the platform is an engineer not modernizing a legacy pipeline, remediating security debt, or accelerating a critical delivery program"* ([Bryan Ross (GitLab)](https://about.gitlab.com/the-source/ai/the-real-cost-of-build-vs-buy-for-agentic-ai-in-regulated-industries/)). Buy the chassis. Spend the engineers on the rules.

---

## Run the Base Rate Before You Build — Naive Internal Builds Mostly Fail

Before you trust "agentic AI makes this easy to build," price in the base rate — internal builds succeed about a third as often as bought tools, so demand a verification story that beats it. The demo that convinced you is not evidence about the tail; it's evidence about the easiest 40%.

The base rate is stark. MIT's NANDA research, reported by Fortune, splits outcomes by approach:

> *"Purchasing AI tools from specialized vendors and building partnerships succeed about 67% of the time, while internal builds succeed only one-third as often."*
> — [Sheryl Estrada (Fortune / MIT NANDA): MIT report — 95% of generative AI pilots at companies are failing](https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/)

One-third as often. Stress-test the claims-triage build against that number: if bought tools land 67% of the time and the naive internal build lands around a third of that, your build has to clear a bar the market default clears twice as easily. The verification gate from two sections back is precisely the thing that can move you above the base rate — it's the difference between "we built it" and "we can tell, on every change, whether it still works."

And the reason "cheap to build" isn't "likely to survive contact with your codebase" is that the productivity story inverts on exactly the systems you'd own. METR measured it:

> *"When developers are allowed to use AI tools, they take 19% longer to complete issues—a significant slowdown that goes against developer beliefs and expert forecasts."*
> — [METR: Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)

Slower, on work developers were sure got faster. Simon Willison pinpoints why it matters for a build-vs-buy call:

> *"The factor that stands out most to me is that these developers were all working in repositories they have a deep understanding of already, presumably on non-trivial issues since any trivial issues are likely to have been resolved in the past."*
> — [Simon Willison: Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://simonwillison.net/2025/Jul/12/ai-open-source-productivity/)

That is the claims-triage tool a year after you ship it — a mature codebase your team knows deeply, full of non-trivial issues. The AI edge that made the first build feel cheap is smallest exactly there. Which is the whole argument, closed: the demo is cheap, the tail is expensive, and the tail is where you actually live.

---

## Decide with the Ownership-Cost Flowchart

Walk any candidate through the gates in order — ownership cost, differentiation, continuous verification, compliance-as-product, base rate — and build only what clears all five. The order matters: cheap gates that eliminate candidates come first, so you don't run the expensive analysis on things you were never going to build. Run the claims-triage decision through it end to end.

```
BUILD-vs-BUY: the ownership-cost flowchart
───────────────────────────────────────────

1. OWNERSHIP COST — Multiply the first-build estimate by the maintenance tail.
   (~1.5x lifecycle beyond the build; 83% of it is new work, not bug-fixing.)
   Would you staff the second 60% for five years?
      NO  → BUY. Stop.
      YES → ↓
                                    [claims-triage: yes, IF it's the rules only]

2. DIFFERENTIATION — Is this the strategic slice competitors can't hand you?
      NO (it's utility: queues, runtime, plumbing) → BUY / RENT that layer. Stop.
      YES → ↓
                       [triage RULES: strategic → continue │ PLATFORM: utility → buy]

3. CONTINUOUS VERIFICATION — Can a test/log/metric confirm it's still correct
   on EVERY change, cheaply — and would you catch a silent regression within a day?
      NO  → BUY. Differentiation without verification is owning it blind. Stop.
      YES → ↓
                                    [triage rules: yes, via a rules test suite]

4. COMPLIANCE-AS-PRODUCT — Is the real deliverable audit trails, uptime,
   regulatory evidence (a "regulated standard application")?
      YES → BUY the platform; Make only peripheral, low-risk modules. 
      NO  → ↓
                       [triage PLATFORM: yes → BUY │ triage RULES: no → continue]

5. BASE RATE — Naive internal builds succeed ~1/3 as often as bought tools,
   and AI's edge fades on codebases you own and know.
   Does your verification story (gate 3) beat that base rate?
      NO  → BUY. Your build is below the market default. Stop.
      YES → BUILD it.
                                    [triage rules: verifiable → BUILD]

───────────────────────────────────────────
VERDICT: Build the strategic, continuously-verifiable triage RULES.
         Buy the regulated PLATFORM they run in.
```

The claims-triage decision resolves the same way every published gate predicted it would. The rules clear ownership cost (verifiable, so the tail is bounded), differentiation (they're your business logic), continuous verification (a rules suite), compliance-as-product (they're not the compliance surface — the platform is), and the base rate (the verification story beats one-third). The platform fails at differentiation and compliance and gets bought. That is the answer agentic AI actually changed: not "build more," but "build the small strategic core you can verify, and buy the expensive tail you'd only own blind."

---

## References

### Research and Data

1. [GitClear: AI Copilot Code Quality — 2025 Look Back at 12 Months of Data](https://www.gitclear.com/ai_assistant_code_quality_2025_research) — Refactoring fell from 25% of changed lines (2021) to under 10% (2024) while cloned lines rose 8.3%→12.3%; backs the AI-code-as-maintenance-debt and duplication-inversion sections.
2. [Rachel Stephens (RedMonk): DORA Report 2024 — A Look at Throughput and Stability](https://redmonk.com/rstephens/2024/11/26/dora2024/) — Verbatim magnitudes: +25% AI adoption → throughput −1.5%, stability −7.2%; backs "individual speed is not system throughput."
3. [DORA (Google Cloud): Accelerate State of DevOps Report 2024](https://dora.dev/research/2024/dora-report/) — AI adoption raises individual productivity but hurts delivery stability and throughput; backs the same section.
4. [Sheryl Estrada (Fortune / MIT NANDA): MIT report — 95% of generative AI pilots at companies are failing](https://fortune.com/2025/08/18/mit-report-95-percent-generative-ai-pilots-at-companies-failing-cfo/) — Bought tools/partnerships succeed ~67% of the time; internal builds succeed one-third as often. Backs the base-rate section.
5. [METR: Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) — AI made experienced devs 19% slower on their own repos; backs "cheap to build ≠ likely to survive your codebase."
6. [David Klotz (arXiv): The Buy-or-Build Decision, Revisited](https://arxiv.org/html/2604.26482v1) — Taxonomy placing regulated and mission-critical systems in the Buy column; backs "buy when compliance is the product."

### Practitioner Guidance

7. [Matt Paige (HatchWorks): The Build vs Buy Framework in the Age of AI](https://hatchworks.com/blog/gen-ai/build-vs-buy-framework/) — States the build-cheap / own-expensive thesis verbatim; backs the opening reframe.
8. [David Wood (O'Reilly): The 60/60 Rule](https://www.oreilly.com/library/view/97-things-every/9780596805425/ch34.html) — 60% of lifecycle cost is maintenance, and 60% of that is changing-requirements enhancement (17% is bug fixes); backs "can we afford to own it?"
9. [Martin Fowler: Utility Vs Strategic Dichotomy](https://martinfowler.com/bliki/UtilityVsStrategicDichotomy.html) — Strategic functions must not run the same software as competitors, and the classification shifts over time; backs the differentiation gate.
10. [Joel Spolsky: In Defense of Not-Invented-Here Syndrome](https://www.joelonsoftware.com/2001/10/14/in-defense-of-not-invented-here-syndrome/) — Do your core business function in-house no matter what; backs "build when it's business-specific."
11. [Simon Willison: Here's how I use LLMs to help me write code](https://simonwillison.net/2025/Mar/11/using-llms-for-code/) — LLMs unlock projects you couldn't justify before; backs the marginal-build unlock behind the verification gate.
12. [Simon Willison: Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://simonwillison.net/2025/Jul/12/ai-open-source-productivity/) — The slowdown lands hardest in repositories developers already know deeply; backs the base-rate section.
13. [Bryan Ross (GitLab): The real cost of build vs. buy for agentic AI in regulated industries](https://about.gitlab.com/the-source/ai/the-real-cost-of-build-vs-buy-for-agentic-ai-in-regulated-industries/) — ~$1.4M year-one build, 2–3 FTEs, 12–18 months, plus the opportunity-cost framing; backs "buy the regulated platform." Vendor-authored; dollar figures treated directionally.
14. [Pat Brans (CIO.com): Your next big AI decision isn't build vs. buy — It's how to combine the two](https://www.cio.com/article/4097339/your-next-big-ai-decision-isnt-build-vs-buy-its-how-to-combine-the-two.html) — The hybrid "combine the two" reframe; context for why this post gates on verification rather than restating the hybrid consensus.
15. [Digital Applied Team: Build vs Buy — The 2026 Case for Custom AI Tools](https://www.digitalapplied.com/blog/build-vs-buy-ai-custom-tools-vs-branded-saas-2026) — Reframes the 2026 question around vendor lock-in; context for the differentiation-and-verification lens this post takes instead.

### Author's Judgment (not directly sourced)

The following claim is my own synthesis. It follows logically from the sourced material above, but no source states it directly:

- **"The two-part verification gate"** (build only when the requirement is both differentiating *and* cheaply, continuously verifiable) — follows from Fowler's strategic/utility split (differentiation earns a build), the O'Reilly/GitClear/DORA maintenance-tail evidence (ownership is where you pay, and AI-built code pays more), and the MIT NANDA base rate (unverified internal builds mostly fail). No single source states the combined gate.

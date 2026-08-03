---
title: "Task Decomposition for AI Coding Agents: Draw the Graph First"
date: 2026-08-03
draft: false
pillar: task-design
author: "John Young"
description: "Across 20,574 agent sessions, the top failure was violating a stated constraint. Draw the task graph before the prompt: nodes, owned files, and contracts."
keywords: ["task decomposition for AI coding agents", "AI coding agents", "multi-agent coordination", "task graph", "agent file ownership"]
tldr:
  - "Decompose AI agent work by drawing the task graph before you write the prompt — nodes with owned files, owned contracts, and a validated handoff at each edge — so every constraint becomes something the harness can enforce instead of a sentence the agent might ignore."
  - "The largest study of coding-agent failures found the top failure symptom — violating a constraint the developer had already explicitly stated, not misreading a vague one — in 38.33% of episodes, with underspecified instructions a separate and far smaller cause at 15.36% in the same paper."
  - "Splitting a task into subtasks doesn't help by itself — a decomposition fixed at design time with no runtime branching can cost more in retries than not decomposing at all — and the payoff only shows up with a validated handoff at each edge, where a failed subtask's bad output never reaches the next one."
  - "Give every node in the graph two owned things, not one — a file glob it exclusively writes and a named contract it owns or may only read — because agents on interdependent code overwrite each other's work even when the merge looks clean, and giving them a messaging channel to coordinate produced no statistically significant improvement."
---
{{< eli5 hint="no background needed · 10 min" audience="for readers outside AI engineering" >}}
This is about why AI coding assistants keep breaking rules you already gave them — and why the fix is changing where the rule lives, not repeating it more clearly.

## The big idea

Picture hiring several contractors to renovate a house at the same time — one on plumbing, one on wiring, one building an addition. If the only place the rules exist is things you said out loud ("don't touch the load-bearing wall," "check with me before changing where the wiring runs"), those rules are just words floating around a busy job site, competing with everything else going on that day. Sooner or later someone breaks one — not out of carelessness, but because a spoken rule has nothing actually stopping it from being broken. The fix isn't saying it more clearly. It's handing each contractor a written work order before anyone picks up a tool: exactly which rooms they're allowed into, and exactly which shared decisions — like where the wiring runs — are frozen, and whose call it is to change them. That's the whole argument here: stop putting the rules for an AI coding assistant only in what you say to it, and start putting them into a map of jobs the system itself can enforce.

## It isn't confused — it's ignoring a rule you already gave it

A large study looked at more than 20,000 real sessions where people asked AI coding assistants to do work, and sorted what went wrong into categories. (Sessions can land in more than one category, so the shares don't need to add up to 100%.) The single most common problem, showing up in a bit over a third of the sessions with issues, was the assistant doing something it had explicitly been told not to do. When researchers dug into why, they found that in roughly three out of four of those cases, the rule had been stated plainly — the assistant just didn't follow it. Only a small slice, around 15%, traced back to instructions that were genuinely vague or missing something. A second, separate study, done a different way, on different assistants, landed on almost the same split. Two different research teams, two different datasets, nearly the same answer.

That's the opposite of the usual instinct. When an assistant goes off-script, the reflex is to rewrite the request more carefully. But if the rule was already there in plain words and got broken anyway, sharpening the wording is aimed at a problem that mostly isn't the one you have. It isn't free to get this wrong, either: most of these incidents don't wreck anything, but nearly all of them still need a person to notice and clean up the mess. And a bad session doesn't reset the odds for the next one — it makes the next session more likely to also go wrong.

The reason a stated rule doesn't hold is that it lives only as a sentence — never checked, never enforced by anything, just hoped for. A sentence in a request is one line competing for attention with everything else the assistant is juggling for that task, easy to lose the way one sticky note gets lost on a crowded corkboard. A rule built into something the assistant literally cannot do — a locked door, a check it can't pass — doesn't have that problem. It either holds, or the work visibly fails.

## Splitting a job into steps only helps if you check the work before passing it on

Splitting a big task into smaller steps sounds like it should obviously help. A real experiment tested this directly, on two coding workloads, and found something that cuts against the usual assumption: splitting a task into fixed steps ahead of time, with no way to check work between them, cost *more* to fix when something went wrong than not splitting the task at all.

Picture a renovation broken into stages — foundation, framing, plumbing — where nobody inspects a stage before the next crew builds on top of it. If the foundation crew makes a bad call, framing and plumbing get built on top of that mistake anyway, and now all three stages have to be redone. That's what a fixed sequence of steps does: a failure early on drags everything built after it back down with it.

What actually worked, in the same experiment, was adding an inspection at each handoff — a step's output only moves to the next step once it's confirmed good. With that checkpoint at every stage, the cost of redoing failed work dropped to less than half of what the plain, un-split version cost. The difference is entirely the checkpoint. A to-do list of steps typed into a request does nothing on its own, because nothing stops bad work at step two from quietly reaching steps three and four.

One more piece of this can't be handed to the assistant: figuring out where the seams should go. When researchers tested how well AI systems could break real tasks into the right steps on their own, they got it right only about a third of the time. Deciding where to cut a job into pieces is still a person's job, not something you can delegate to the assistant.

## Each job needs its own files — and its own say over shared decisions

Splitting the work into pieces still isn't enough by itself. A separate study put two AI coding assistants to work on connected parts of the same project and simply watched what happened. Working together, they succeeded about 30% less often than the same assistants did working the same kind of task alone. For two of the systems tested, teaming up roughly cut their success rate in half. This wasn't a rare edge case: more than three out of four tasks in that study only had a correct solution if the two assistants had agreed, in advance, on something neither of them had actually been told.

Back to the renovation. Two contractors can divide the house perfectly — one takes the kitchen, one takes the bathroom, no overlap, nobody's tools ever cross — and the renovation can still fail, because the plumber assumed a wall stays put and the kitchen crew moved it. No two workers touched the same board. The plan just doesn't agree with itself anymore. The researchers draw exactly this line: agreeing on who touches what is one problem, and agreeing on what everyone is actually building is a separate, harder problem. A job can be split cleanly by files and still be wrong, because nobody owns the shared decisions.

So a job needs two things, not one: files it alone is allowed to touch, and a say over which shared design decisions belong to it versus which ones it can only read and not change. One widely used AI coding tool already ships a feature that keeps separate assistant sessions from editing the same files by accident — but the tool doesn't decide who owns which files; a person still makes that call.

This next part is worth being honest about: no study directly tested whether handing out both kinds of ownership actually fixes the problem. It's the author's own conclusion, built from three things lining up — assistants colliding when nobody owns anything, a tool that isolates files but doesn't assign them, and real teams tracing their collisions back to assumptions nobody wrote down — rather than a result any single experiment measured.

## Letting the assistants talk to each other doesn't fix it

The obvious next idea is to let the two assistants message each other while they work. The same study tested that directly and found it made no meaningful difference to how often they actually succeeded together. A team building these systems in production reported the same thing from real use, and named why: an action one assistant takes carries a decision baked into it, and when two assistants act on conflicting decisions, you get conflicting results — even though neither one did anything unreasonable in the moment.

Back to the renovation: the electrician radios over that she's running a new circuit through the hallway wall. The framing crew says sounds good, and builds the wall around it. Then the electrician decides that circuit is easier to run somewhere else, and never sends another message. Nobody lied, nobody made an unreasonable call, and the wall is now built wrong. A conversation records what everyone said they'd do. It doesn't lock in what actually gets built. Naming who owns each shared decision ahead of time does that. A chat channel doesn't.

## This costs more upfront, and it needs an owner

None of this is free. In the same experiment that measured the payoff of checkpoints, running the checkpointed version cost roughly three times as much on the very first attempt as doing the whole job as one task. You're trading a more expensive first attempt for cheaper fixes later, and that trade is only worth it if the work actually fails sometimes. The researchers said plainly that their test scenarios had a low real failure rate to begin with. If a task reliably succeeds on the first try, splitting it up and adding checkpoints only adds cost with nothing to show for it.

It's tempting to justify the upfront cost with the old idea that catching problems early is always cheaper than catching them late. A separate look at more than 170 real software projects found no evidence for that idea — fixing things later wasn't consistently or substantially more expensive. So that's not the actual justification. The real justification is the failure rates from earlier: the roughly one-in-three sessions where a rule that had already been stated still got broken. Measure your own failure rate before building any of this. A task that lands on the first try doesn't need a map.

Last: someone has to actually draw this map. Every account of how this works — researchers, practitioners, and the companies building these tools — agrees a person draws it, and not one of them says whose job that's supposed to be. That's arguably the real gap here: not a missing tool, an unassigned responsibility. This conclusion is the author's own, drawn from noticing that gap across several separate sources rather than a finding any one of them states outright. His answer: whoever is accountable for a feature should own the map for that feature's assistant work, decided before any assistant starts — the same way a workplace assigns someone to be responsible if something breaks, rather than sorting it out after the fact.

## What this means for you

If an AI coding assistant breaks a rule, don't just rewrite the instructions — ask whether that rule could instead become something the system enforces: a file it can't touch, a shared decision it can't quietly change, a check that fails loudly if it's wrong. Before splitting a big task into pieces for one or more assistants, draw a small map first: which job touches which files, which shared decisions each job owns versus only reads, and what "done" looks like for each piece — decided by a person, before any assistant opens a file. Only bother with this once you've actually seen the work fail sometimes; if a task reliably works in one try, skip it. And someone needs to be named as the owner of that map, or it never gets drawn until after something has already gone wrong.

---

**The technical terms, in plain words**
- Coding agent = an AI assistant that can write, edit, and run code on its own, not just chat with you.
- Prompt = the instructions you give the assistant, in words.
- Constraint violation = the assistant doing exactly the thing it was told not to do.
- Instruction-following failure = the technical name for a stated rule getting ignored anyway.
- Underspecification = a request that was vague or missing details the assistant needed.
- Task decomposition = splitting one big job into smaller pieces.
- Task graph = the map of those smaller jobs, showing which ones depend on which.
- Node = one piece of that map — one small job.
- Static decomposition = splitting work into fixed steps ahead of time, with no checkpoint between them.
- Validated handoff (runtime-structured decomposition) = a checkpoint that stops a failed step's output from moving on to the next step.
- File glob / owned files = the specific set of files one job is allowed to touch.
- Contract = a shared agreement about the shape of something (like a piece of data) that more than one job depends on.
- Spatial vs. semantic coordination = agreeing on who edits which files (spatial) versus agreeing on what those changes actually mean (semantic).
- Retry cost / tokens = how much extra computing effort it takes to redo work after it fails; tokens are the units that effort is measured in.
- Monolithic = treating the whole job as one task instead of splitting it up.

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}

Across 20,574 real coding-agent sessions, the most common failure was not the agent misreading a vague request — it was the agent violating a constraint the developer had already stated ([Tang et al.: How Coding Agents Fail Their Users](https://arxiv.org/html/2605.29442v1)). That finding moves the fix somewhere uncomfortable. If the rule was in the prompt and the agent broke it anyway, sharpening the prompt is aimed at the wrong thing, and the real question is where the rule should live instead.

---

## Your Agent Violates Constraints You Already Stated

When an agent goes off-script, the reflex is to reopen the prompt and sharpen the wording. The largest observational study of how coding agents fail suggests the wording was usually fine.

Tang et al. annotated misalignment episodes across 20,574 coding-agent sessions and sorted them into seven recurring symptoms. The most prevalent symptom is not misunderstanding. It is S3, Developer Constraint Violation — defined as violating an explicit developer constraint — carried by 38.33% of episodes. The taxonomy allows multi-label assignment, so those seven shares deliberately do not sum to 100. An episode can be both a constraint violation and a misread intent ([Tang et al.: How Coding Agents Fail Their Users](https://arxiv.org/html/2605.29442v1)).

The cause profile underneath it is the part that should change your behavior:

> "73.68% of S3 episodes are attributed to C6 (Instruction-Following Failure)"
> — [Tang et al.: How Coding Agents Fail Their Users](https://arxiv.org/html/2605.29442v1)

A second team reached the same place from a different direction. Hasan and Biswas mined the GitHub issue trackers of 13 foundational code models for confirmed safety failures, and their top category matches to within two points:

> "The top threats, namely Constraint Violations (40.4%), Destructive Operations (24.5%), Authorization Bypasses (18.3%), and Deception (15.7%), dominate real-world failures."
> — [Hasan and Biswas: What Breaks When LLMs Code?](https://arxiv.org/html/2605.30777v1)

Two datasets, two methods, one answer. And the failures are not exotic — Hasan and Biswas note they arise during benign, goal-directed use, which means the ordinary Tuesday-afternoon session is the sample.

|  | Tang et al. | Hasan and Biswas |
|---|---|---|
| **Sample** | 20,574 agent sessions across 1,639 repositories, IDE and CLI | 16,586 GitHub issues screened down to 547 confirmed safety failures |
| **Method** | Annotated misalignment episodes, seven multi-label symptoms | Real-world failures sorted into threat categories |
| **Top category** | Developer Constraint Violation — 38.33% of episodes | Constraint Violations — 40.4% of failures |

The bill lands on you rather than on the system. In Tang et al.'s data, 90.50% of episodes impose effort and trust costs rather than irreversible system damage, yet 91.49% of visible resolutions still require explicit user correction — you are the error handler. Worse, the failures compound instead of resetting: a session containing misalignment raises the probability of misalignment in the next session to 0.519 against 0.336 otherwise.

**The move is therefore: stop encoding constraints as sentences and start encoding them as things the harness can refuse — a file the agent may not write, a contract it may not change, a check that fails loudly.**

### Underspecification Is the Smaller Problem

"Write clearer requirements" is the natural next thought, and it quietly absorbs more of the problem than it has earned. The same paper carries a separate cause taxonomy. Its ambiguity category — C1, Underspecified Instruction, covering instructions that are ambiguous, underspecified, or inconsistent — accounts for 15.36% ([Tang et al.: How Coding Agents Fail Their Users](https://arxiv.org/html/2605.29442v1)). Set that against the 73.68% of constraint violations attributed to instruction-following failure and the ranking is clear enough to plan around.

The problem is not that you failed to say it. It is that saying it was never load-bearing.

That does not make specification worthless — it relocates it. A specification that only exists as prose in a context window [competes for attention with everything else in that window](/blog/claude-md-instruction-ceiling/). A specification expressed as structure does not compete; it either holds or it [fails a check](/blog/agent-harness-audit/).

---

## Put the Decomposition Outside the Prompt

Splitting an epic into subtasks is not the win. Where the split lives decides whether the split pays for itself, and the naive form loses to doing nothing.

IBM researchers benchmarked decomposition against a monolithic run on two agentic coding workloads, and the result cuts against the usual assumption:

> "Our results show that decomposition alone does not necessarily reduce retry cost. In the Kubernetes root cause analysis workload, the static decomposition baseline produced a retry cost of 1,632 +/- 145 tokens versus 904 +/- 17 tokens for the monolithic baseline because failures forced reruns of downstream subtasks."
> — [Asthana et al.: Runtime-Structured Task Decomposition](https://arxiv.org/html/2605.15425v1)

Their static baseline is a decomposition whose structure "must be known and fixed at design time," run with fixed subtasks and no runtime branching — a hardcoded pipeline, not a list of steps pasted into a prompt. The mechanism of the loss is stated plainly: "fixed sequential execution must rerun all downstream subtasks from the point of failure." A subtask list typed into your prompt has neither runtime branching nor a validated handoff. That is my reason for moving it out, not the paper's finding.

What turned the result around was structure with gates at each edge. In the runtime-structured configuration, "a failed subtask's output is not written to the State Manager and is never visible to downstream subtasks." Retry cost on the same workload fell to 436 ± 132 tokens ([Asthana et al.: Runtime-Structured Task Decomposition](https://arxiv.org/html/2605.15425v1)).

Take an ordinary epic — "Add tenant-scoped rate limiting to the public API" — and cut it at its layer boundaries:

```text {title="Add tenant-scoped rate limiting to the public API"}
n1  schema      migrations/0042_tenant_rate_limits.sql    depends: —
n2  middleware  internal/middleware/ratelimit.go          depends: n1
n3  admin-ui    web/admin/src/settings/RateLimits.tsx     depends: n1, n2
n4  docs        docs/api/rate-limits.md                   depends: n2
```

n2 is where this epic actually fails. Deciding what counts as a tenant on a partly unauthenticated route is a judgment call, and the agent will make one. Inside a pipeline with no branching, that failure takes n3 and n4 down with it. That is three nodes of blast radius for one bad decision, plus whatever the admin screen already wrote against the wrong policy shape. With a validated handoff on n2's output, the rerun is one node, because nothing downstream ever saw the bad result.

Do not expect the agent to draw these seams for you. Gao's benchmark over 2,209 real skills found that "task decomposition quality is the primary bottleneck: standard LLM decomposition reaches only 34.2% category recall at the step level" ([Xueping Gao: Compositional Skill Routing for LLM Agents](https://arxiv.org/abs/2606.18051)). Granularity is the hard part, and it is the part models are worst at. Where to cut is a sizing question — [how to size tasks for AI coding agents](/blog/how-to-size-tasks-for-ai-coding-agents/) argues layer boundaries are the most reliable seams. Each of n1 through n4 sits inside one layer. What goes *inside* a node once you have it is a separate craft, covered in [the anatomy of a perfect AI agent task](/blog/anatomy-of-a-perfect-ai-agent-task/).

---

## Give Every Node Owned Files and Owned Contracts

> **Author's judgment.** The prescription in this section — that assigning each node a file glob and an interface contract fixes the collision — is my inference, not a measured result. It follows from three sourced premises: CooperBench's agents worked without assigned ownership and overwrote each other, the Claude Code worktrees documentation ships file isolation but no guidance on who owns what, and Cognition names the root cause as assumptions never prescribed upfront. No benchmark I found has tested an assigned-ownership arm.

CooperBench put two coding agents on interdependent features in the same repository and measured what happens. Agents working together achieved on average 30% lower success rates than the same agents doing both tasks individually. The GPT-5 and Claude Sonnet 4.5 configurations landed at only 25% success under two-agent cooperation — roughly half the rate of a single agent ([Khatua et al.: CooperBench](https://arxiv.org/html/2601.13295v2)). The collision is not an edge case: in that dataset, 77.3% of tasks have conflicting ground-truth solutions.

> "agents often hold incorrect expectations about their partner's plans, observations and duplicate work despite warnings and overwrite changes they believe will merge cleanly"
> — [Khatua et al.: CooperBench](https://arxiv.org/html/2601.13295v2)

"Merge cleanly" is the footgun in that sentence. A textually clean merge is not a correct merge, and the paper separates the two problems precisely:

> "Merge conflicts are fundamentally a *spatial* coordination problem: agents must agree on who edits which lines... However, task success requires *semantic* coordination: understanding *what* to implement, not just *where*."
> — [Khatua et al.: CooperBench](https://arxiv.org/html/2601.13295v2)

So each node needs two edges, not one. The file glob is the spatial edge and stops overwrites. The named contract is the semantic edge and stops the merge that succeeds while losing the meaning. n2 renaming a field on `RateLimitPolicy` while n3 renders a form against the old shape produces zero conflicts and one broken screen.

The spatial half already ships as product. Claude Code's worktrees isolate parallel sessions at the filesystem level, and the docs are explicit about the division of labor: "Worktrees are one of several ways to run Claude in parallel. They isolate file edits, while subagents and agent teams coordinate the work itself" ([Claude Docs: Run Parallel Sessions with Worktrees](https://code.claude.com/docs/en/worktrees)). The page documents creation, cleanup, base branches, and subagent isolation — and says nothing about how a human decides which session owns which files. The enforcement mechanism is shipped. The decision it enforces is yours.

The semantic half is where ambiguity actually attaches. Hamel Husain's framing is that the model often is not the problem at all: "A really common way that the model is not the problem is query disambiguation. The LLM doesn't have a chance because the user is asking a very ambiguous question and isn't providing enough context." The article's worked example is an agent asked to clean up the authentication service. It cannot know whether it may alter the public API, introduce a dependency, modify the database schema, or change existing error behavior ([Arize: Hamel Husain Explains Why AI Evals Fail](https://arize.com/blog/rise-of-the-ai-engineer-why-ai-evals-fail-before-the-evaluation-begins/)). Those four questions are contract questions, and a node that names its contracts has answered them before the agent starts.

**Bad:** "Agent B: build the admin screen for tenant rate limits."

**Good:** "Agent B: build the admin screen for tenant rate limits. You write `web/admin/src/settings/**` and `internal/admin/ratelimit_handler.go`, nothing else. `RateLimitPolicy` in `internal/ratelimit/policy.go` is owned by the middleware node — read it, do not change it. If the screen needs a field that does not exist on it, stop and report rather than adding one."

Assigned globs are worth checking rather than assuming, because two nodes that both look reasonable can still overlap on a shared package:

```bash {title="Check the globs are actually disjoint"}
# Any path that appears in both node globs is an unassigned collision.
comm -12 \
  <(git ls-files 'internal/middleware/*' 'internal/ratelimit/*' | sort) \
  <(git ls-files 'web/admin/src/settings/*' 'internal/admin/*' | sort)
```

The check passes when it prints nothing. When it prints a path, you have found the file two agents will both edit. You resolve it by assigning it, not by hoping.

Whether you then run these nodes in parallel is a separate decision, and the case for keeping writes single-threaded lives in [multi-agent context isolation](/blog/multi-agent-context-isolation/). The graph exists either way. One agent working n1 through n4 in sequence still needs to know that `RateLimitPolicy` belongs to n2.

---

## A Chat Channel Is Not a Coordination Structure

The obvious escape hatch is to let the agents talk to each other. CooperBench handed them exactly that — a messaging tool — and the number that matters did not move.

> "none of the models effectively leverage communication tool to achieve higher cooperation success. The difference between 'with comm' and 'no comm' settings is not statistically significant."
> — [Khatua et al.: CooperBench](https://arxiv.org/html/2601.13295v2)

Cognition reached the same conclusion from production experience, and named the mechanism: "Actions carry implicit decisions, and conflicting decisions carry bad results." Their post-mortem on subagent collisions is that "the actions subagent 1 took and the actions subagent 2 took were based on conflicting assumptions not prescribed upfront" ([Walden Yan: Don't Build Multi-Agents](https://cognition.com/blog/dont-build-multi-agents)). Prescribed upfront is the operative phrase. A chat channel is where assumptions get announced, not where they get prescribed.

Watch what that looks like on the rate-limiting epic. n2 messages that it will add a `Burst` field to `RateLimitPolicy`. n3 says great, and builds a form input for it. n2 then decides burst is really a per-tenant column and drops the struct field. Nothing in that exchange was a lie, both agents behaved reasonably, and the screen ships bound to a field that no longer exists. The transcript records agreement; the repository records a break.

The practical version is a set of transcript signals and the move each one calls for:

| Signal in the transcript | What it means | What to do |
|---|---|---|
| "I'll let the other agent handle the migration" | Ownership was negotiated at runtime, not assigned | Put `migrations/*` in exactly one node's glob and rerun |
| "Assuming `RateLimitPolicy` already has `Burst`" | A contract was inferred instead of read | Name the contract's owner; make the consumer stop on a missing field |
| "I'll add a small helper in `policy.go` to unblock myself" | A node is writing outside its glob | Fail the node on the glob check, not in review |
| Both agents restate the same acceptance criterion | The work was never actually divided | Merge the two nodes into one |
| "Let me know if you change the response shape" | A contract change is being announced instead of forbidden | Freeze the contract for the run; changes become their own node |

---

## Price the Graph Before You Commit to It

Structure is not free, and the paper that measured its upside also printed its bill. In the same IBM experiments, the runtime-structured configuration cost 2,716 ± 424 tokens on its baseline run against 904 ± 17 for the monolithic one ([Asthana et al.: Runtime-Structured Task Decomposition](https://arxiv.org/html/2605.15425v1)). That 904 is the same number as the monolithic retry cost quoted earlier, and not by coincidence: when the whole job is one unit, retrying it means running all of it again. You buy cheap retries with an expensive first attempt. That trade only pays at a failure rate high enough to cash it in — and the authors say so themselves:

> "Both use cases are controlled scenarios at temperature 0 with low natural failure rates (0–2%), so retry cost is measured under simulated failure."
> — [Asthana et al.: Runtime-Structured Task Decomposition](https://arxiv.org/html/2605.15425v1)

The three configurations, priced by retry cost on the same root cause analysis workload:

| Configuration | Retry cost |
|---|---|
| **Monolithic** — no decomposition | 904 ± 17 tokens |
| **Static decomposition** — fixed at design time, no runtime branching | 1,632 ± 145 tokens |
| **Runtime-structured** — validated handoff at each edge | 436 ± 132 tokens |

The tempting way to justify the upfront cost is the old cost-of-delay curve, and it does not survive contact with data. Menzies et al. examined 171 software projects from 2006 to 2014 looking for exactly that effect:

> "We found no evidence for the delayed issue effect; i.e. the effort to resolve issues in a later phase was not consistently or substantially greater than when issues were resolved soon after their introduction."
> — [Menzies et al.: Are Delayed Issues Harder to Resolve?](https://arxiv.org/abs/1609.04886)

So argue from the agent failure base rates instead — the 38.33% and the 40.4% from the first section. Those are the numbers that justify this work, not folklore about the cost of fixing things later.

Run these six checks before you build the graph:

1. **Measure your own failure rate first.** Run the epic once as a single task and count the attempts it took. A workflow that lands on the first try does not need a graph.
2. **Count the depth of the longest dependency chain, not the number of nodes.** Depth is what sets the rerun blast radius when a middle node fails.
3. **Confirm each node is [independently verifiable](/blog/evaluating-ai-coding-agent-output/).** If you cannot check n2 without n3 existing, you have drawn a seam that is not a seam.
4. **Check the expected diff per node against the [reviewable ceiling](/blog/review-capacity-agent-throughput/).** A node whose diff blows past ~200 LOC is two nodes wearing a trench coat — see the [sizing flowchart](/blog/how-to-size-tasks-for-ai-coding-agents/#sizing-decision-flowchart).
5. **Refuse to cut where the pieces need constant back-and-forth.** Anthropic's guidance names the failure directly: "Planning, implementation, and testing of the same feature share too much context," and "Components requiring constant back-and-forth belong in the same agent" ([Anthropic: Building Multi-Agent Systems](https://www.claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them)).
6. **Stop when the spec grows longer than the diff.** Birgitta Böckeler watched a spec-driven tool turn a small bug into four user stories with sixteen acceptance criteria — a sledgehammer for a nut ([Birgitta Böckeler: Understanding Spec-Driven Development](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)).

Priced this way, the rate-limiting epic earns its graph: three layers, a chain of depth three, four independently verifiable nodes, and a middleware node whose tenant-identification decision you have already watched an agent get wrong. Change the epic to "add a nullable column and document it" and the same arithmetic says run it monolithic and skip all of this.

---

## Name Who Owns the Task Graph

Every source I read that describes this artifact describes it as hand-authored, and none of them names the hand. That is the actual gap — not a missing tool, an unassigned job.

Microsoft's Daniel Epstein names the failure mode from practice, in an argument rather than a study — the post reports no measurements at all:

> "No backlog: There is no structured list of what needs to be built, in what order, with what dependencies. Work gets discovered during implementation, not planned before it."
> — [Daniel Epstein: Agentic-Agile](https://developer.microsoft.com/blog/agentic-agile-why-agent-development-needs-agile-not-just-prompts/)

The measurement side agrees by omission. The IBM paper that made structured decomposition pay lists this among its own limitations: "Decomposition policies are developer-authored and may not generalize to automatically derived graphs" ([Asthana et al.: Runtime-Structured Task Decomposition](https://arxiv.org/html/2605.15425v1)). The structure that produced a 73.2% retry-cost reduction over the static baseline came out of a person's head. Nothing in the result suggests a model would have drawn it — and Gao's 34.2% step-level recall suggests it would have drawn it badly.

Kent Beck's framing is the one to hand your leadership, because it says the skill is appreciating rather than depreciating:

> "Augmented coding deprecates formerly leveraged skills such as language expertise. Augmented coding amplifies vision, strategy, task breakdown, and feedback loops."
> — [Kent Beck: Vibe Coding — More Experiments, More Care](https://www.oreilly.com/CodingwithAI/)

Anthropic's own 2026 trends report puts it on the list of where engineering value moves: "In 2026, the value of an engineer's contributions shifts to system architecture design, agent coordination, quality evaluation, and strategic problem decomposition" ([Anthropic: 2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report)). That is a vendor describing a market it sells into, so weigh it as a position rather than as evidence. It still lines up with the two independent studies above.

Stack the four together and the last column never gets filled in:

| Source | What it says the work requires | Who it says owns the work |
|---|---|---|
| **Epstein** — practitioner argument, no measurements | A structured list of what needs to be built, in what order, with what dependencies | Not named |
| **Asthana et al.** — measured, 73.2% retry-cost reduction | Decomposition policies that are developer-authored | "developer," with no role and no name |
| **Beck** — conference framing | Task breakdown as an amplified skill | Not named |
| **Anthropic** — vendor position | Strategic problem decomposition | "an engineer," a category rather than an owner |

Put a name against the graph the way you put one against the on-call rotation. The engineer accountable for the design review of a feature owns that feature's graph, and owns it before any agent starts. The graph is the design review, expressed in a form the runtime can enforce.

---

## Convert One Epic, End to End

> **Author's judgment.** The ordering of the seven checks below is my synthesis of the six sections above, not a procedure any single source publishes. Each gate traces back to a sourced claim; the sequence is mine.

The epic arrives as one sentence, and its shape is the problem. "Add tenant-scoped rate limiting to the public API" sits in the same category as GitHub's example of specification failure: "A vague prompt like 'add photo sharing to my app' forces the model to guess at potentially thousands of unstated requirements" ([Den Delimarsky: Spec-Driven Development with AI](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)). Run it through the gates in order and stop at the first one you cannot answer.

**Is every constraint you care about expressed as something other than a sentence in the prompt?**
If no → you are relying on instruction-following, which is where the 38.33% lands. Convert each constraint into an owned file, a frozen contract, or a check.

**Does the split live in structure with a validated handoff at each edge?**
If no → a fixed pipeline reruns everything downstream of a failure and can cost more than not splitting at all. Add the gate before you add the nodes.

**Does every node have a file glob it exclusively writes?**
If no → run the disjointness check and assign the overlap. Unassigned files are where agents overwrite changes they believe will merge cleanly.

**Does every node name the contract it owns and the contracts it may only read?**
If no → you have solved the spatial problem and left the semantic one open. `RateLimitPolicy` needs exactly one owner.

**Are you expecting the agents to negotiate any of this at runtime?**
If yes → move it into the node definitions. A messaging channel produced no significant improvement in cooperation success.

**Does your observed failure rate justify the upfront cost?**
If no → run it monolithic. Structure is a purchase, and cheap retries are the only thing it buys.

**Whose name is on this graph?**
If nobody's → assign it before the first agent starts, or the graph gets discovered during implementation instead of planned before it.

The finished artifact for this epic fits in a table, and every column is a gate above:

| Node | Writes | Contract | Done when |
|---|---|---|---|
| **n1 schema** | `migrations/0042_tenant_rate_limits.sql` | Owns the `tenant_rate_limits` table shape | `migrate up` then `migrate down` runs clean against a seeded database |
| **n2 middleware** | `internal/middleware/ratelimit.go`, `internal/ratelimit/policy.go` | Owns `RateLimitPolicy`; may not touch the migration | `go test ./internal/middleware/... ./internal/ratelimit/...` passes and request 101 in a 100/min window returns 429 |
| **n3 admin-ui** | `web/admin/src/settings/**`, `internal/admin/ratelimit_handler.go` | Reads `RateLimitPolicy`, may not change it | `GET /admin/api/rate-limits` returns every tenant's policy and the screen renders it |
| **n4 docs** | `docs/api/rate-limits.md` | Owns nothing in code | The documented 429 body matches the middleware's response fixture byte for byte |

That table is the whole argument in one place. Four bounded, verifiable nodes, each with a glob nobody else writes, a contract with exactly one owner, and a done condition a machine can evaluate — drawn by a named human before a single agent opened a file.

I package these gates as [agent-engineering-toolkit: decompose-epic](https://github.com/johnayoung/agent-engineering-toolkit) — a skill that walks the seven questions, plus a standalone script that checks the finished graph against your repository: overlapping globs, contracts with two owners, dependency cycles, and any "done" that is still prose. The first thing I pointed it at was the repo this site is built from, and it failed the graph I had just written by hand — two nodes claimed the same script. That is the failure this whole post is about, and I did not catch it by reading.

---

## References

### Research and Data

1. [Tang et al.: How Coding Agents Fail Their Users](https://arxiv.org/html/2605.29442v1) — Across 20,574 real coding-agent sessions from 1,639 repositories, the most prevalent misalignment symptom is violating an explicit developer constraint (38.33%, multi-label taxonomy), with 73.68% of those episodes attributed to instruction-following failure and underspecification a distant 15.36%. Backs the opening section and its H3.
2. [Hasan and Biswas: What Breaks When LLMs Code?](https://arxiv.org/html/2605.30777v1) — 547 confirmed real-world failures mined from the GitHub issue trackers of 13 foundational code models put constraint violations at 40.4%, the top category, arising during benign goal-directed use. Independent corroboration of the constraint-violation finding by a different dataset and method.
3. [Asthana et al.: Runtime-Structured Task Decomposition](https://arxiv.org/html/2605.15425v1) — A decomposition fixed at design time with no runtime branching cost more in retries (1,632 ± 145 tokens) than not decomposing at all (904 ± 17), while schema-validated handoffs cut retry cost to 436 ± 132 at a higher baseline cost of 2,716 ± 424. Backs the structure section, the pricing section, and the developer-authored limitation.
4. [Khatua et al.: CooperBench](https://arxiv.org/html/2601.13295v2) — Two agents on interdependent features in one repository score 30% lower on average than the same agents working alone, 77.3% of tasks have conflicting ground-truth solutions, and adding a messaging tool produced no statistically significant improvement in cooperation success. Backs the ownership section and the chat-channel section.
5. [Xueping Gao: Compositional Skill Routing for LLM Agents](https://arxiv.org/abs/2606.18051) — Standard LLM decomposition reaches only 34.2% category recall at the step level across 2,209 real skills, making decomposition quality the primary bottleneck. Backs the claim that granularity is not something to delegate to the model.
6. [Menzies et al.: Are Delayed Issues Harder to Resolve?](https://arxiv.org/abs/1609.04886) — Across 171 software projects from 2006 to 2014, no evidence was found for the delayed issue effect. Used to keep the pricing argument on measured agent failure rates instead of cost-of-delay folklore.

### Practitioner Guidance

7. [Claude Docs: Run Parallel Sessions with Worktrees](https://code.claude.com/docs/en/worktrees) — Worktrees isolate file edits between parallel Claude Code sessions, while subagents and agent teams coordinate the work itself. The page ships the enforcement mechanism and no guidance on who owns which files, which is the decision this post covers.
8. [Walden Yan: Don't Build Multi-Agents](https://cognition.com/blog/dont-build-multi-agents) — Actions carry implicit decisions, and subagent collisions trace to conflicting assumptions that were never prescribed upfront. Backs the argument that runtime negotiation cannot substitute for assigned ownership.
9. [Anthropic: Building Multi-Agent Systems](https://www.claude.com/blog/building-multi-agent-systems-when-and-how-to-use-them) — Planning, implementation, and testing of one feature share too much context to split, and components requiring constant back-and-forth belong in the same agent. Backs the "where not to cut" check in the pricing list.
10. [Daniel Epstein: Agentic-Agile](https://developer.microsoft.com/blog/agentic-agile-why-agent-development-needs-agile-not-just-prompts/) — Prompt-driven agent development at scale produces no structured list of what needs to be built, in what order, with what dependencies. Practitioner framing only; the post reports no measurements.
11. [Kent Beck: Vibe Coding — More Experiments, More Care](https://www.oreilly.com/CodingwithAI/) — Augmented coding deprecates language expertise and amplifies vision, strategy, task breakdown, and feedback loops. Backs task breakdown as an appreciating rather than depreciating skill.
12. [Anthropic: 2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report) — Anthropic's position is that engineering value in 2026 shifts to system architecture design, agent coordination, quality evaluation, and strategic problem decomposition. Vendor-authored; cited as a position, not as independent evidence.
13. [Arize: Hamel Husain Explains Why AI Evals Fail](https://arize.com/blog/rise-of-the-ai-engineer-why-ai-evals-fail-before-the-evaluation-begins/) — Failures often trace to query disambiguation rather than model quality, illustrated by an agent asked to clean up an authentication service without knowing whether it may change the public API, dependencies, schema, or error behavior. Backs the contract-boundary half of the ownership section.
14. [Den Delimarsky: Spec-Driven Development with AI](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/) — A vague prompt forces the model to guess at potentially thousands of unstated requirements. Frames the epic-shaped input in the closing walkthrough.
15. [Birgitta Böckeler: Understanding Spec-Driven Development](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) — Spec-driven tooling applied to a small bug produced four user stories and sixteen acceptance criteria, a sledgehammer for a nut. Backs the over-specification stop condition.
16. [agent-engineering-toolkit: decompose-epic](https://github.com/johnayoung/agent-engineering-toolkit) — The seven gates above as a runnable skill, plus `check-task-graph.sh`, which validates a task graph against a real repository: disjoint write globs, exactly one owner per contract, acyclic edges, mechanical acceptance predicates, and a named owner. A one-node graph gets the monolithic verdict rather than a decomposition.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"Assigned file globs and interface contracts fix the collision"** — CooperBench diagnoses collision under no assigned ownership, the worktrees docs ship file isolation without an ownership decision, and Cognition names unprescribed assumptions as the root cause. No study tested an assigned-ownership arm; the cure is my inference from those three premises.
- **"The seven checks, in this order"** — The closing gate sequence is a synthesis of the six preceding sections. Each gate traces to a sourced claim; the ordering is mine.

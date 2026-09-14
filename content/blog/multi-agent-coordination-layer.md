---
title: "Coordination Is an Architecture Layer, Not a Prompt Instruction"
date: 2026-09-14
draft: false
pillar: architecture-decisions
author: "John Young"
description: "When a multi-agent pilot breaks, the postmortem blames the model. The failure data says coordination logic buried in each agent's prompt is the real defect."
keywords: ["multi-agent coordination architecture", "multi-agent systems", "agent handoff contract", "agent orchestration", "architecture decisions"]
tldr:
  - "When a multi-agent pilot breaks, the postmortem blames the model, but the failure data says the real defect is coordination logic (who verifies what, who hands off to whom, what counts as done) with nowhere to live but each agent's prompt."
  - "Naming an agent \"the coordinator\" in its prompt is a measured null result, tested across 1,902 runs; it creates no hub and no reliability gain, while moving the same rule into a shared record both agents write recovers real performance on the same underlying model."
  - "Treat coordination as its own layer, a handoff contract, a sidecar, or a swappable manager component, decided before you ship a second agent; it's a real trade of latency and components for inspectability, and even the best interventions still leave completion rates low."
---
{{< eli5 hint="no background needed · 9 min" audience="for readers outside AI engineering" >}}
This is about why teams of AI coding assistants that pass work to each other keep breaking, and what the research says is actually causing it.

## The big idea

An "agent" here just means a computer program that uses an AI model to do a job mostly on its own, like planning a piece of work, writing code, or checking someone else's work. When people connect several of these agents into a small team, one plans, one builds, one reviews, the team often fails, and the instinct is to blame the AI itself as not being smart enough. The research says that's usually the wrong suspect. Picture three coworkers on a relay project, each keeping their own private notebook of "how we're supposed to hand this off to the next person," written on different days, with nobody ever comparing notes. That's what happens inside a lot of these AI teams: the rules for handing off work get copied, slightly differently, into each agent's own separate set of instructions instead of living in one shared place everyone can read. The fix isn't a smarter AI. It's giving those handoff rules a single, shared home.

## The rules end up scattered by accident, not on purpose

Take a three-agent setup: one agent plans a feature, one implements it, one reviews it. They're working on one piece of code, a fix for retrying failed webhook deliveries. There's a simple rule everyone needs to follow: the reviewer shouldn't mark the work "done" until the implementer's tests have actually run. In practice, that rule often lives in three places at once, written into each agent's own private instructions by whoever set that agent up, on whatever afternoon they did it, each with a slightly different idea of what "done" actually means.

Nobody decided to do it that way on purpose. It's what happens when there's no dedicated place for coordination rules to live: the logic settles into the only place anyone thought to write it down, which is each agent's own instructions. The real cost isn't that instructions are a bad place to put rules. It's that a rule split across three separate files has no single owner, no version history, and no test. Change the handoff rule and you have to edit three files by hand, and there's no single, reviewable change to look at. A rule that only works if all three copies agree with each other is a risk that can break the whole pipeline at once. Leaving coordination scattered in each agent's instructions isn't a neutral choice. It's an architecture decision made by not making one.

## Giving coordination its own address makes it diagnosable

The fix researchers propose isn't a new piece of software. It's a naming decision: treat "who checks what," "who hands off to whom," and "what counts as finished" as one thing, with one written specification, kept separate from what each individual agent does.

Once coordination is its own named, separate thing, you can actually point at it and diagnose what's going wrong with it. Researchers who studied this describe several distinct ways a team's coordination setup can fail: agents can reinforce each other's shared mistake instead of catching it; one central agent's error can spread downstream to the others with nothing catching it; a group discussion can collapse too quickly onto one, possibly wrong, answer; or an early mistake in a step-by-step pipeline can carry forward uncaught. These are only tellable apart from each other if the coordination logic exists somewhere you can look at directly. When it's buried inside separate instructions, every one of these failure patterns looks the same from the outside, and gets blamed on "which tool we used" or "how the instructions were worded" instead. Researchers are also clear this doesn't require buying some heavy new platform. The idea works whichever existing toolkit you're already using. It's a way of thinking about the problem, not a new piece of infrastructure.

## Most failures are organizational, not "the AI wasn't smart enough"

One study reviewed more than 1,600 real recorded runs of AI agent teams and found failure rates between 41% and 87%, depending on the setup. But those failures cluster around organizational design and coordination problems, not the underlying AI's reasoning ability. This isn't a claim that the model doesn't matter at all; it's that, in the failures researchers actually examined, the cause traced back to how the team was organized far more often than to the AI being too weak.

Here's a concrete version of that: the reviewer agent reads the implementer's own summary, sees the words "tests pass," and closes the task out, without ever actually running the tests itself. That's not a reasoning failure. It's that nothing in the handoff ever required proof. A stronger AI model in the reviewer's seat doesn't fix a setup where nothing forces anyone to show their work.

One caveat worth being honest about: matching specific examples like this one onto the research's official failure categories, and adding up several separate percentages into one combined figure, is the author's own reading and arithmetic, not a single number the underlying study states directly. The bigger point still holds either way: none of the well-measured failure types was simply "the model wasn't smart enough."

## Slapping a label on someone doesn't create coordination

The cheapest possible fix is adding one sentence to one agent's instructions: "you are the coordinator, keep the other two aligned." Nothing else changes. This has actually been tested directly, across nearly 1,900 runs of AI coding teams, with a smaller follow-up test repeating the result: naming one agent "coordinator" builds no actual communication hub and produces no reliable improvement. It's like pinning a badge reading "team captain" on someone's shirt without giving them a whistle, a meeting room, or any actual way to direct the others. The label sits in that one agent's instructions; it doesn't change how the team actually talks to each other.

What did change the outcome was structure, not wording. The same research found that giving agents a shared file to read and write, instead of passing messages back and forth one-to-one, cut the amount of communication needed by roughly 42% once the team grew to eight agents. A shared, structural change moved the numbers. A one-line label typed into a private instruction file did not.

## A real shared record recovers real performance, but not all of it

When researchers moved the fix out of individual agents' instructions and into the actual coordination design, using the exact same underlying AI model, performance measurably improved. Writing clearer, more specific descriptions of each agent's role was worth roughly a 9% jump in success rate. Adding an actual verification checkpoint, a rule requiring evidence before a task can be marked finished, was worth roughly 16%.

The concrete version of that fix isn't a sterner instruction to the reviewer. It's a rule written into the shared record itself: a task can't move to "done" unless there's a list of verification steps, that list isn't empty, and every one of those steps actually succeeded. The reviewer can't talk its way around that rule, because the rule isn't addressed to the reviewer. It's a property of the shared record both agents have to write into.

Here's the caveat the researchers themselves insist on keeping: even with this fix, not every kind of failure went away, and overall task completion rates stayed low. A roughly 16% improvement on a system that was failing most of the time still leaves a system that fails often. This is a real, usable fix, not a complete solution. Getting to something reliably durable likely takes more changes than just this one, combining better coordination design with improvements to the models themselves.

## This has a real cost, and it's not fully measured yet

A shared coordination record can take a few different shapes: a written contract file that every agent reads and writes into; a small helper process attached to each agent that handles the coordination chatter (an idea borrowed from a pattern used in web infrastructure, roughly like routing conversations through a dedicated translator instead of everyone talking directly); or a separate, swappable "manager" piece, already built into some existing toolkits, whose only job is deciding which agent goes next.

Whichever shape you pick, there's a real, honest cost: extra delay, and an extra moving part to maintain. In one internal test, even a fairly simple two-agent setup showed noticeable overhead once coordination was centralized, and the team running that test was upfront that no version of this fix eliminates the overhead entirely. It's also worth noting that some proposed standards for how AI agents should talk to each other are described by their own creators as design intent, not proof they already work well; several pieces are still listed as open, unfinished work on those projects' own roadmaps.

## What this means for you

Before connecting a second AI agent to a first one, decide up front where each coordination rule will live, in one shared record both agents read and write, not copied separately into each agent's private instructions. When something in the pipeline breaks, check whether it's a design or verification problem before assuming you need a "smarter" AI model; the research suggests that's usually where the real problem is. And go in expecting a real but partial improvement: a properly separated coordination layer measurably helps, and it also costs something in complexity and delay. That balance, plus the specific checklist of steps for deciding where rules should live, reflects the author's own synthesis of the research rather than a procedure any single study hands you directly.

---

**The technical terms, in plain words**
- Agent = a computer program that uses an AI model to do a task mostly on its own, such as planning, writing code, or checking work.
- Multi-agent system = several of these AI agents working together on pieces of the same problem, handing work to each other like a small team.
- Prompt = the written instructions given to an AI agent that shape how it behaves.
- Coordination layer = the set of rules for how agents hand work to each other, kept as its own separate, shared thing instead of copied into each agent's private instructions.
- Handoff = the moment one agent passes a task or piece of work to another.
- Orchestrator = a central agent or component whose job is directing which other agent acts next.
- Verification = actually checking that work is correct, such as running the tests, rather than just trusting a summary that says it's done.
- Failure taxonomy / failure category = a set of labeled buckets researchers sorted real observed failures into, so people can tell what's actually going wrong instead of guessing.
- Sidecar = a small helper program attached to each agent that handles coordination on its behalf, borrowed from a pattern used in web infrastructure.
- Manager component = a separate, swappable piece of software whose only job is deciding which agent should act next.
- Schema = the agreed-on shape or format a shared record must follow, so every agent reading or writing it means the same thing by each field.
- Protocol = an agreed-on standard format for how different agents communicate with each other.

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}

When a multi-agent pilot breaks, the postmortem almost always blames the model, and the controlled studies say that is the wrong suspect. The coordination logic between agents (who verifies what, who hands off to whom, what counts as done) is the load-bearing layer. Across 1,600-plus annotated traces, the failures cluster in organizational design rather than individual-agent capability ([Cemri et al.: Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657)). The practical problem: logic buried in each agent's prompt cannot be reconfigured, tested, or swapped the moment it turns out to be the broken thing.

---

## Coordination Logic Has Nowhere Else to Live but Your Prompts

Take a three-agent coding pipeline that has already cleared the earlier gates: a planner, an implementer, and a reviewer working one feature, `webhook-retry`. The team decided it needed context isolation ([the isolation gate](/blog/multi-agent-context-isolation/)), then decided which edges were worth their review cost ([the topology you can review](/blog/agent-architecture-review-capacity/)). Now the narrower question: where does the rule "the reviewer does not mark a task done until the implementer's tests have actually run" physically live?

In most pilots it lives in three places at once, in prose, in `planner.md`, `implementer.md`, and `reviewer.md`. Each was written on a different afternoon by a different person with a slightly different idea of what "done" means. Nobody chose that. It is what happens when the framework or protocol underneath the agents has no dedicated home for coordination. The logic settles into the only writable surface left. The systematic audit of eighteen agent communication protocols found exactly this pattern at the protocol layer:

> When semantic mechanisms are absent from the protocol itself, developers must reintroduce them through prompts, orchestration logic, wrappers, or task-specific adapters. Such workarounds may be practical in the short term, but they also accumulate hidden complexity and reduce interoperability.
> — [Yuan et al.: Beyond Message Passing](https://arxiv.org/abs/2604.02369)

The cost of that default is not that prompts are a bad place to put instructions. It is that a rule split across three prompts has no single owner, no version, and no test. Changing the handoff protocol means three prompt edits in three files that never show up as one reviewable diff. A rule that only holds when all three copies agree is a footgun with the blast radius of the whole pipeline. The paper's framing is sharper than "technical debt": the cost lands later, on whoever has to change the thing.

**Prompt-resident coordination is not a neutral starting point. It is an architecture decision you made by not making it.**

---

## Coordination Is a Configurable Layer, Separable from Agent Logic

The alternative is not a new framework. It is a naming decision: handoff rules, verification criteria, and retry triggers are one layer with one spec, separable from agent logic.

> We argue that coordination should be treated as a configurable architectural layer, separable from agent logic and from information access, enabling architectural reasoning rather than only engineering productivity.
> — [Nechepurenko and Shuvalov: Coordination as an Architectural Layer](https://arxiv.org/abs/2605.03310)

Separating the layer buys you analysis, not just tidiness. The same paper claims that "when the coordination layer is named and isolated, four classes of properties move from implicit-in-code to explicit-in-spec." It then names the specific error pathways each configuration tends to produce:

| Signature | What goes wrong (the paper's own gloss) |
|---|---|
| Error-amplifying | "peer exchange reinforces a shared misconception" |
| Authority-cascading | "an orchestrator's mistake propagates through delegated subtasks that downstream verification cannot catch" |
| Drift-collapsing | "consensus loops collapse diverse views to a single anchor" |
| Upstream-fragile | "sequential pipelines carry early errors downstream" |

Those are diagnosable categories only if the layer exists as a thing you can point at. When it is implicit, the authors note, "these signatures are confounded with prompt details and framework idiosyncrasies." That is the precise reason prompt-resident coordination resists debugging: every symptom has at least two plausible causes and no way to isolate either.

The paper answers the objection that this means adopting some heavyweight orchestration platform. The specification "can be implemented atop AutoGen, CrewAI, LangGraph, AWS Strands, or Microsoft Foundry without modification," because **"the novelty is conceptual, not infrastructural"** ([Nechepurenko and Shuvalov: Coordination as an Architectural Layer](https://arxiv.org/abs/2605.03310)). You are not buying a runtime. You are deciding that coordination gets a spec.

The coordination question is therefore: if you changed the handoff protocol tomorrow, how many files would you edit, and could you tell whether it worked?

---

## Check the Failure Category Before You Buy a Bigger Model

When the `webhook-retry` pipeline produces a broken feature, the reflex is to [reach for a stronger model](/blog/coding-agent-leaderboard-noise/) on one of the three agents. Classify the failure first, because the measured taxonomy says the reflex is usually aimed at the wrong layer. The MAST study annotated 1,642 execution traces across seven state-of-the-art open-source multi-agent systems, with inter-annotator agreement of kappa = 0.88. It reports a 41% to 86.7% failure rate across those frameworks ([Cemri et al.: Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657)).

> Consistent with organization theories, our findings indicate that many MAS failures arise from the challenges in organizational design and agent coordination rather than the limitations of individual agents.
> — [Cemri et al.: Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657)

Run a concrete failure through that taxonomy. The reviewer agent reads the implementer's summary for `webhook-retry`, sees the words "tests pass," and closes the task without ever running `pnpm test webhook.controller.spec.ts`. That is not a reasoning failure. It maps onto the paper's third category: "failures involving inadequate verification processes that fail to detect or correct errors, or premature termination of tasks." Its three failure modes are reported in Figure 1 at 6.20%, 8.20%, and 9.10% of annotated traces, 23.5% between them. A bigger reviewer model does not fix a pipeline where nothing in the handoff ever required evidence.

| Symptom on the pipeline | MAST category | The fix it points at |
|---|---|---|
| Reviewer closes `webhook-retry` without running the spec | FC3, Task Verification | An evidence requirement on the handoff |
| Implementer edits `src/webhooks/retry.ts`, which the planner assigned to nobody | FC1, System Design Issues | Explicit file ownership in the task record |
| Planner means "retry with backoff", implementer ships "retry once" | FC2, Inter-Agent Misalignment | One stated objective both agents read from |

The three category names are the paper's; mapping these particular symptoms onto them is my own reading. The 23.5% is my sum of the three per-mode figures, not a number the paper states as a category total. The durable point survives either way: none of the taxonomy's three buckets is "the model was not smart enough."

---

## Naming an Agent "Coordinator" Doesn't Create Coordination

The cheapest possible fix is a role label, and it has now been measured directly. Add one line to the reviewer's prompt and change nothing else:

```text {title="reviewer.md: the change that does nothing"}
+ You are the coordinator for this task. Keep the other two agents aligned.
```

The `webhook-retry` pipeline's handoff reliability after that edit is the same as before it. That is not a hunch. An instrument covering 1,902 runs of multi-agent AI coding teams evaluated each run with a fixed test suite. Its configurations varied team size, team structure, and file policy, and it reports the null result plainly:

> Naming one agent as coordinator creates no communication hub and provides no reliable improvement in success.
> — [Destefanis and Aste: When Agents Coordinate](https://arxiv.org/abs/2608.16801)

A 244-run sealed-environment replication reproduced the coordinator finding ([Destefanis and Aste: When Agents Coordinate](https://arxiv.org/abs/2608.16801)). The label [adds a string to a context window](/blog/claude-md-context-hierarchy/); it does not build a hub.

What did move the measurements was structure. The same study found that shared files can replace repeated one-to-one communication, cutting output tokens by about 42% at eight agents on message-heavy work. That is the whole thesis in miniature. A shared artifact the agents read and write changed both the interaction topology and the context burn; a prompt-level title changed neither. If the reviewer is going to behave like a coordinator, something outside the reviewer has to make coordination the only available path.

---

## The Fix That Recovers Performance Lives in the Design

Move the fix out of the model and into the coordination design and the same underlying model recovers real performance. The MAST authors ran intervention studies on ChatDev holding the user prompt and the LLM constant at GPT-4o. Improving agent role specifications alone yielded a +9.4% success-rate increase. Adding a high-level task objective verification step yielded a +15.6% improvement in task success on ProgramDev ([Cemri et al.: Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657)).

> MAS failure is not merely a function of challenges in the underlying model; a well-designed MAS can result in performance gain when using the same underlying model.
> — [Cemri et al.: Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657)

Applied to `webhook-retry`, the verification intervention is not a sterner instruction in `reviewer.md`. It is a guard on the state transition itself, held in the shared task record rather than in any agent's prompt:

```text {title="promotion guards on the webhook-retry task record"}
verifying -> done   requires  verification[] non-empty
                              every recorded command exited 0
                              files_changed subset of ownership.files

waiting   -> done   requires  approval_gates.external_action.status == approved
```

The reviewer cannot talk its way past that, because the rule is not addressed to the reviewer. It is a property of the record that both agents write into. That makes "done" bounded, verifiable work instead of [a judgment call the reviewer makes about itself](/blog/evaluating-ai-coding-agent-output/). Same models, different architecture.

The caveat is load-bearing and comes from the authors:

> Although first step interventions lead to performance gains, not all failure modes are resolved, and task completion rates still remain low, indicating that more substantial improvements are needed.
> — [Cemri et al.: Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657)

Read that as a floor, not a ceiling. A +15.6% recovery on a system that was failing most of the time still leaves a system that fails often. Separating the coordination layer buys you a fix you can apply, measure, and revert. It does not buy a reliable pipeline: the paper concludes that durable reliability likely needs combinatorial changes spanning system organization and model-level improvements.

---

## What a Separated Coordination Layer Looks Like

The layer is a file before it is a philosophy. For the three-agent pipeline, it is one record that the planner, implementer, and reviewer all read and write. It carries the handoff fields the prompts used to carry separately:

```json {title="contracts/webhook-retry.json"}
{
  "task": "webhook-retry",
  "objective": "Retry failed webhook deliveries with exponential backoff",
  "ownership": {
    "agent": "implementer",
    "files": ["src/webhooks/webhook.controller.ts", "src/webhooks/retry.ts"],
    "lease_expires": "2026-09-14T18:40:00Z"
  },
  "state": "verifying",
  "timestamp": "2026-09-14T18:12:04Z",
  "observations": ["controller currently swallows 5xx from the handler"],
  "mutations": ["added backoff schedule to webhook.controller.ts"],
  "verification": [
    { "command": "pnpm test webhook.controller.spec.ts", "result": "8 passed" },
    { "command": "pnpm lint src/webhooks", "result": "passed" }
  ],
  "approval_gates": {
    "external_action": {
      "destination": "production deployment",
      "status": "waiting_for_approval",
      "prepared": true
    }
  },
  "open_risks": ["backoff ceiling not covered by a test"],
  "next_action": "reviewer reads verification, then promotes state to done"
}
```

The schema is adapted from Kate Johnson's field-tested handoff contract, including the verification-evidence and approval-gate examples above, which are hers verbatim. Her five states are `reading` ("gathering evidence, no edits yet"), `editing` ("changing owned files"), `verifying` ("running tests or checking the live flow"), `waiting` ("blocked on approval or an external system"), and `done` ("objective met and evidence recorded"). The setup cost is lower than the word "layer" implies:

> The contract does not need a new service. A JSON file, a database row, or a session handoff can carry the same fields: objective and ownership, state and timestamp, observations and mutations, approval gates, verification evidence, monitor cursor, open risks and next action. These fields turn parallel agents into a coordinated team.
> — [Kate Johnson: A Small Handoff Contract for Multiple Coding Agents](https://dev.to/kgjohnson/a-small-handoff-contract-for-multiple-coding-agents-4538)

A contract file is only load-bearing if it can fail a build the way any other interface does; [coordination-contract-lint](https://github.com/johnayoung/agent-engineering-toolkit) checks a JSON handoff contract against this exact schema, including the promotion guards, and exits non-zero the moment one is missing.

A contract file is one of three shapes this layer takes. The second is a sidecar. Fleming et al. borrow the pattern wholesale from service meshes. Multi-agent systems, they argue, need "a similar evolution, but one that operates at the semantic level rather than the packet level":

> Inspired by the Service Mesh pattern (e.g., Istio/Envoy), this model attaches a lightweight CFN process to every single agent instance (usually on localhost).
> — [Fleming et al.: Scaling Multi-agent Systems](https://arxiv.org/abs/2604.03430)

Their measured result is the strongest argument against direct prompt-to-prompt handoffs that I have found. On HotPotQA, a single-agent baseline scored 92, direct multi-agent communication dropped it to 80.1, and the middleware recovered 91.5. On MuSiQue the same shape held: 87.5 baseline against 72.7 direct and 86.1 with middleware. The authors summarize this as improving performance by more than 10% on both datasets over direct agent-to-agent communication ([Fleming et al.: Scaling Multi-agent Systems](https://arxiv.org/abs/2604.03430)). Multi-agent handoffs cost accuracy; a real coordination layer is what buys most of it back.

The third shape is a swappable manager component, which the shipping frameworks already give you. In AutoGen, "the order of turns is maintained by a Group Chat Manager agent, which selects the next agent to speak upon receiving a message." That manager is a distinct `GroupChatManager` class, configurable with either a round-robin algorithm or an LLM-based selector ([AutoGen Docs: Group Chat](https://microsoft.github.io/autogen/stable//user-guide/core-user-guide/design-patterns/group-chat.html)). CrewAI makes the same separation a one-line configuration: "to assign a process to a crew, specify the process type upon crew creation to set the execution strategy." The hierarchical process requires its own `manager_llm` or `manager_agent` ([CrewAI Docs: Processes](https://docs.crewai.com/en/concepts/processes)). In both cases the coordination strategy is a component you swap without touching an agent definition.

| Shape | Where the logic lives | What it costs you |
|---|---|---|
| Handoff contract | A JSON file, DB row, or session object every agent reads and writes | You own the schema, the leases, and the stale-claim rules |
| Sidecar | A process attached to each agent instance, usually on localhost | An extra runtime component per agent instance |
| Swappable manager | A framework component such as `GroupChatManager` or a CrewAI process type | You inherit that framework's coordination model |

Whether you adopt a shipping protocol or build the contract yourself is the same [build-versus-buy call](/blog/build-vs-buy-agentic-ai/) you would make for any other layer. The adopt-side candidate is A2A, designed around an explicit opacity principle: "allow agents to collaborate without needing to share internal memory, proprietary logic, or specific tool implementations, enhancing security and protecting intellectual property" ([A2A Project: Agent2Agent Protocol](https://github.com/a2aproject/A2A)). Treat that as design intent rather than maturity evidence. The repository's own roadmap still lists authorization schemes in the agent card, dynamic capability negotiation, mid-task UX negotiation, and streaming reliability as open work.

Whichever shape you pick, budget the overhead honestly, because it is real and largely unmeasured. Microsoft's ISE team reported that consolidating intent detection into a coordinator still showed notable overhead in smoke testing, even for simple two-agent cases. Their close is worth quoting to anyone selling a pattern catalog: "Work is ongoing, and no single solution eliminates the architectural overhead" ([Lily Jia: Orchestration Patterns for Multi-Agent Systems](https://devblogs.microsoft.com/ise/coordinator-patterns-multi-agent-systems/)). A coordination layer is a trade, latency and components against inspectability and repairability. It is a trade worth making, and it is still a trade.

---

## Decide Where the Logic Lives Before You Ship a Second Agent

> **Author's judgment.** The checklist below is my own synthesis, not a procedure any source prescribes. It follows from three sourced premises: absent a protocol-level home, coordination logic gets reintroduced through prompts and wrappers (Yuan et al.); the measured failure taxonomy is dominated by design, misalignment, and verification defects rather than model capability (Cemri et al.); and role labels applied at the prompt level produce no reliable improvement (Destefanis and Aste).

Run this before the second agent exists. The scattered-prompt default from the top of this post is cheap to prevent and expensive to unwind.

1. **Write down where each coordination rule will live.** For `webhook-retry` that is four rows: [who owns which files](/blog/task-decomposition-for-ai-coding-agents/), which state transitions are legal, what evidence promotes a task to `done`, and who approves an external action. If the answer to any row is "the prompt," that row is the first one to revisit.
2. **Grep your agent prompts for coordination verbs.** Search `planner.md`, `implementer.md`, and `reviewer.md` for "hand off", "when finished", "then tell", and "wait for". Every hit is coordination logic sitting in a file that no other agent can read.
3. **Move each hit into one artifact all the agents read and write.** A JSON file is enough. The point is single ownership, not infrastructure.
4. **Give the layer a test.** Validate the contract against its schema in CI and fail the build on a missing `verification` array, the way you would lint any other interface.
5. **Classify the next failure before you change the model.** Design, misalignment, or verification. Only the residue after those three is a model problem.
6. **Budget the overhead out loud.** Name the latency and the extra component in the same document where you claim the reliability win.

If you have not yet decided which agents should talk to each other at all, that decision comes first. [The topology you can review is the topology you can run](/blog/agent-architecture-review-capacity/).

---

## Where Each Coordination Decision Lives

| The check | What it catches |
|---|---|
| **Where the rules live today** | Coordination that defaulted into three prompt files because nothing else could hold it |
| **Name the layer** | Failure signatures confounded with prompt details and framework quirks |
| **Classify the failure category** | Model upgrades aimed at design, misalignment, and verification defects |
| **Ignore role labels** | The free fix that measurably does nothing to handoff reliability |
| **Move the fix into the design** | Real recovery from the same model, plus the honest ceiling on what it recovers |
| **Pick a shape and budget its overhead** | Contract, sidecar, or manager, and the latency cost nobody eliminates |

---

## References

### Research and Data

1. [Cemri et al.: Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657) — Across 1,642 annotated traces from seven open-source multi-agent systems, failure rates run 41% to 86.7% and cluster in organizational design and coordination rather than individual-agent capability. Backs the failure-category section, the MAST taxonomy mapping, and the +9.4%/+15.6% intervention results with the authors' own hedge.
2. [Destefanis and Aste: When Agents Coordinate](https://arxiv.org/abs/2608.16801) — Across 1,902 instrumented runs plus a 244-run sealed replication, naming one agent as coordinator creates no communication hub and no reliable improvement in success. Also the source for shared files cutting output tokens by about 42% at eight agents.
3. [Nechepurenko and Shuvalov: Coordination as an Architectural Layer](https://arxiv.org/abs/2605.03310) — Argues coordination should be a configurable architectural layer separable from agent logic, which moves four classes of properties from implicit-in-code to explicit-in-spec. Backs the definitional section and the four error-pathway signatures.
4. [Fleming et al.: Scaling Multi-agent Systems](https://arxiv.org/abs/2604.03430) — Service-mesh-style middleware attached to every agent instance improves performance by more than 10% over direct agent-to-agent communication on HotPotQA and MuSiQue. Backs the sidecar shape, the Istio/Envoy analogy, and the accuracy cost of direct handoffs.
5. [Yuan et al.: Beyond Message Passing](https://arxiv.org/abs/2604.02369) — A systematic audit of 18 agent communication protocols finds semantic mechanisms largely absent, so developers reintroduce them through prompts, wrappers, and orchestration logic at the cost of hidden complexity. Backs the opening section's default-into-prompts claim.

### Practitioner Guidance

6. [Kate Johnson: A Small Handoff Contract for Multiple Coding Agents](https://dev.to/kgjohnson/a-small-handoff-contract-for-multiple-coding-agents-4538) — A storage-agnostic handoff contract (objective and ownership, a five-state machine, observations versus mutations, verification evidence, approval gates) needs no new service to coordinate parallel agents. Source of the contract schema and the verification and approval-gate examples.
7. [AutoGen Docs: Group Chat](https://microsoft.github.io/autogen/stable//user-guide/core-user-guide/design-patterns/group-chat.html) — Turn order is maintained by a separate Group Chat Manager agent that selects the next speaker, implemented as its own class and configurable round-robin or LLM-selected. Shipping example of an externalized manager component.
8. [CrewAI Docs: Processes](https://docs.crewai.com/en/concepts/processes) — Coordination strategy is assigned at crew creation as a process type, with the hierarchical process requiring its own manager LLM or manager agent. Shipping example of swappable crew-level coordination.
9. [A2A Project: Agent2Agent Protocol](https://github.com/a2aproject/A2A) — The protocol's opacity principle lets agents collaborate without sharing internal memory, proprietary logic, or tool implementations. Cited as design intent only; the repository's roadmap still lists authorization, capability negotiation, and streaming reliability as open.
10. [Lily Jia: Orchestration Patterns for Multi-Agent Systems](https://devblogs.microsoft.com/ise/coordinator-patterns-multi-agent-systems/) — Coordinator framework choice is independent of domain agent implementation, but smoke testing showed notable overhead even for two agents and no single solution eliminates it. Backs the overhead-budget caveat.
11. [agent-engineering-toolkit: coordination-contract-lint](https://github.com/johnayoung/agent-engineering-toolkit) — Validates a JSON handoff contract against this post's schema and done-state promotion guards, exiting non-zero on a malformed or incomplete contract so coordination logic is testable in CI instead of buried in a prompt.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"Prompt-resident coordination is an architecture decision made by omission."** Follows from Yuan et al.'s finding that absent semantic mechanisms get reintroduced through prompts and wrappers, combined with Nechepurenko and Shuvalov's argument that the layer exists whether or not it is named.
- **The symptom-to-MAST-category mapping.** The three category names are Cemri et al.'s; assigning the pipeline's three symptoms to them is my own reading of the category definitions.
- **Task Verification at 23.5%.** My sum of the three per-mode prevalences reported in Cemri et al.'s Figure 1 (6.20%, 8.20%, 9.10%). The paper states per-mode figures, not a category total.
- **The pre-second-agent checklist.** Derived from the three sourced premises named in the section's callout; no source prescribes this procedure.
- **"A coordination layer is a trade, not a free win."** Derived from Lily Jia's unresolved-overhead disclosure combined with Cemri et al.'s hedge that interventions leave completion rates low.

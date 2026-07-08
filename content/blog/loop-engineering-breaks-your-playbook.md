---
title: "Loop Engineering Breaks Your Single-Shot Context Playbook"
date: 2026-07-06
draft: false
pillar: context-engineering
author: "John Young"
description: "A loop was always the agent primitive. The CLAUDE.md budget and JIT retrieval you tuned for one invocation don't fail louder in a loop — they fail quieter."
keywords: ["loop engineering", "context engineering", "agentic loops", "unattended coding agents", "context rot"]
tldr:
  - "A loop was always the agent primitive — gather, act, verify, repeat — so \"loop engineering\" isn't a new discipline; it's your single-invocation habits run many times, unattended, and the breakage lives in those habits, not in the one line of loop syntax."
  - "The CLAUDE.md budget and just-in-time retrieval you scoped to one context window now re-pay on every iteration: context accumulates and rots each turn, and the model conditions on its own earlier mistakes — so a bad call at iteration 12 gets read as established fact and built on for thirty turns while the terminal shows steady, confident progress."
  - "A clean one-shot demo is the weakest evidence you have, because a loop is a different reliability regime — single-shot accuracy doesn't predict loop reliability — so before running unattended, add the two things a single prompt never needed, an explicit stop (max-iterations, no-progress, spend cap) and externalized state (a progress file), then re-check every single-shot assumption for turn fifty."
---
{{< eli5 hint="no background needed · 7 min" >}}
There's a new buzzword for setting an AI coding helper loose to work by itself. This is about why that job is trickier than it looks — and why the tricks you learned for handing it one task at a time quietly stop working.

## The big idea

Picture a capable helper who forgets everything the moment they finish a task. Hand them one job, they do it, they check it, and then their memory wipes clean. To keep going, they start fresh and read only what's been written down.

For a while, people used these helpers one job at a time: you give a task, you check the result. The new buzzword — call it "running the helper on its own" — just means you stop standing over their shoulder pressing "go" between tasks. You leave a note, walk away for the evening, and let them work task after task all night.

Nothing about the helper changed. What changed is that every shortcut you picked up while handing over one task at a time now has to survive being repeated fifty times in a row, unattended — and some of them don't.

## It isn't a new skill — it's the same helper, run many times

The helper doing a task, checking its work, and going again was always the basic idea. The buzzword is new; the thing it names isn't. So the smart move is to treat this as *moving your existing habits over*, not learning something from scratch — which tells you exactly where things break: not in the setup (that part's easy), but in every assumption you made back when the helper did one task and then forgot it.

One thing worth keeping straight: this is one helper doing round after round, reading its own trail of work. That's a different situation from a whole crowd of helpers working side by side, which has its own separate headaches.

Why care now? The length of job these helpers can finish on their own — and get right about *half* the time — has been roughly doubling every seven months for years. Note the "half the time": that's how far they can stretch, not a promise the work is safe to ship. But the runs are getting longer, so a bad assumption that barely stung on the first round gets expensive by the fiftieth.

## Your instructions file costs you on every round, and it gets buried

Most people leave the helper a standing note of rules and preferences. When the helper does a single task, that note is a one-time cost: it reads it once. But in an all-night run, it re-reads the *whole* note at the start of every round — and every round piles its own paperwork on top.

Here's the catch, and it's measured, not guessed: as a helper's working space fills up with paper, it uses that paper less and less reliably. So a rule that was easy to spot at 9 p.m. can be buried under the night's own output by 3 a.m. And it's not just whether the rule is technically written down somewhere — how the note is laid out matters more than the fact that it's present. The fix is to trim the note for how it will read deep into the night, and move the rules that truly matter up to the top.

For a sense of how big an always-there block can get: one company found that just the *list of tools* their helper could reach for was eating an enormous amount of space before they trimmed it. That was the tool list, not anyone's instructions note — but it's the same shape of problem: a block that rides along on every single round whether that round needs it or not.

## A clean demo is the weakest evidence you have

When someone shows you one flawless run, that's actually the *worst* thing to judge reliability on. And here's the careful part, because it's easy to get wrong:

The point is **not** that smarter helpers get dumb when they work in a loop. On the test that measured this, smarter helpers actually kept going correctly for *more* rounds than weaker ones. The real finding is narrower and harder to wriggle out of: how well a helper does on a *single* task tells you almost nothing about how many tasks it can string together. And the reason the string snaps is specific — the helper starts treating its *own* earlier mistakes as if they were established fact, and builds on them.

Keep the fine print, because the honest version is more useful than the scary one. This came from a controlled counting test, not a real coding run. Letting the helper think things through first reduces the effect. And, oddly, *bigger* helpers fall into this one particular trap more, not less — but that's a narrow point about this specific trap, not "bigger is worse in general."

Here's how it plays out. Around round 12, the helper misreads how a piece of the code works, makes a wrong edit, and saves it. Every round after that starts fresh, reads the code as it now stands, and finds that wrong edit sitting there looking like the truth. So it doesn't fix the mistake — it builds on it. By 3 a.m. it has spent thirty rounds making everything line up with a decision it never should have made, and the screen showed steady, confident progress the entire time. One bad call stops being a single slip you could catch; it becomes every round that reads it.

(The author is careful here: that a run like this fails *more quietly* than a demo — not just more often — is his own reasoning from the findings above, not something a study measured directly.)

## A single job comes with an ending and a memory; an all-night run doesn't

Handing over one task quietly gave you two free things: a natural finish line, and a memory that lasted exactly as long as the task. When the task was done, it was done, and the helper's memory cleared on its own. An all-night run inherits neither. So before you walk away, you have to build both yourself.

- **A stopping rule.** A hard cap on how many rounds it can run, a check that quits if a round changed nothing, and a spending limit that kills the run. Left alone, the loop has no reason to ever stop.
- **A written record on disk.** Since the helper forgets between rounds, keep the run's progress in a file it re-reads each round. The helper forgets; the written record doesn't.

One caveat so you don't over-learn the "forgets everything" picture: on newer helpers, the memory wipe is gentler than it sounds — they can automatically sum up earlier work when they're about to run out of room. But the habit holds no matter what: write the progress file either way, because it's what survives when the memory resets.

## What this means for you

If you're going to leave one of these helpers working on its own, don't just write it a better set of instructions and hope. Walk through every assumption you built back when it did one task at a time, and ask whether it still holds on round fifty: Did you trim the instructions for how they'll read hours in? Have you planned for the helper building on its own 2 a.m. mistake, not just the clean demo you were shown? Is there a hard stop and a written progress file?

The old way of working wasn't wrong — it was just built for one task at a time. Doing this well is simply redoing that thinking for the way you're actually using the helper now.

---

**The technical terms, in plain words**
- Loop engineering / agentic loop = setting the helper to do its cycle — do a task, check it, go again — by itself, instead of you pressing "go" each round
- Agent = a computer helper that can use tools and take steps on its own toward a goal
- CLAUDE.md = the standing note of rules and preferences you leave for the helper
- Context window = the helper's working space for one round — what it can see and hold at once
- Context rot = as that working space fills up, the helper uses it less and less reliably
- Tokens = units of text the helper reads; more text means more space used up
- Self-conditioning = the helper treating its own earlier mistakes as if they were correct, and repeating the pattern
- Externalized state / progress file = keeping the run's memory in a file on disk, since the helper forgets between rounds
- Compaction = the helper automatically summarizing earlier work when it's about to run out of room
- Stopping conditions = rules that end a run: a max number of rounds, a "nothing changed" check, a spending cap

**The full version, with the research and sources:** [Loop Engineering Breaks Your Single-Shot Context Playbook](/blog/loop-engineering-breaks-your-playbook/)
{{< /eli5 >}}

An agent was "just an LLM using tools based on environmental feedback in a loop" a year and a half before anyone sold you "loop engineering" ([Anthropic: Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)). The term is new; the primitive isn't — and neither is the trap. The CLAUDE.md budget and just-in-time retrieval you spent last quarter tuning for a single invocation don't fail louder when the unit of work becomes many. They fail quieter, and pointing more autonomy at the same bloated context makes it worse, not better.

---

## Stop Shopping for a New Skill — "Loop Engineering" Is the Agent Primitive You Already Had, Run Many Times

Before you buy loop engineering as a greenfield discipline, look at what the loop actually is: the thing an agent already was. Anthropic's definition has not moved since December 2024 — agents "are typically just LLMs using tools based on environmental feedback in a loop" ([Anthropic: Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)). Simon Willison was calling the design of that loop "a critical new skill to develop" nine months before the label caught on. His working definition is the same one: an LLM agent is "something that runs tools in a loop to achieve a goal" ([Simon Willison: Designing agentic loops](https://simonwillison.net/2025/Sep/30/designing-agentic-loops/)). The Claude Agent SDK draws the identical cycle as four steps — "gather context -> take action -> verify work -> repeat" ([Anthropic: Building agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)).

So when Addy Osmani defines the new term — "Loop engineering is replacing yourself as the person who prompts the agent. You design the system that does it instead" ([Addy Osmani: Loop Engineering](https://addyosmani.com/blog/loop-engineering/)) — read it as a shift in *who runs the loop*, not the arrival of a new mechanism. The primitive is the same gather/act/verify cycle you have been driving by hand; loop engineering is the decision to stop pressing enter between turns.

The concrete version of "stop pressing enter" is the artifact this whole post keeps returning to: the unattended overnight loop.

```bash {title="The Ralph Loop"}
# The Ralph loop — a fresh context every iteration, state on disk.
while :; do cat PROMPT.md | agent; done
```

You point it at a `PROMPT.md`, walk away in the evening, and read what it built in the morning — the technique Geoffrey Huntley popularized as "Ralph" ([Geoffrey Huntley: Ralph Wiggum as a "software engineer"](https://ghuntley.com/ralph/)). Nothing in that line is new. It is your single-invocation agent, wrapped in `while :; do ... done` and handed the keys.

The frame is therefore a migration, not a blank slate: **treat loop engineering as your single-invocation habits run many times, not a discipline you learn from zero.** That reframe tells you where the breakage lives. It is not in the loop syntax — that is one line. It is in every assumption you baked into the playbook when the unit of work was one invocation and the context window reset the moment the task finished. A loop keeps the seat warm.

This axis is worth naming precisely, because it is easy to confuse with the other one. A loop is one agent iterating sequentially — the same context lineage, turn after turn. Running many agents in parallel is a different problem with different failure modes, the isolation and hand-off concerns I covered in [multi-agent context isolation](/blog/multi-agent-context-isolation/). Loop engineering lives on the sequential axis: not more agents, more iterations of one. Why it matters now is measurable — the length of tasks agents can complete autonomously "with 50% reliability has been doubling approximately every 7 months for the last 6 years" ([METR: Measuring AI Ability to Complete Long Tasks](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)). The loops are getting longer, so an assumption that was merely wrong on turn one gets expensive by turn fifty.

---

## Audit Your CLAUDE.md as a Per-Iteration Tax, Not a One-Time Cost — In a Loop It Rides Every Turn and Rots

Re-read every "just in case" line in your CLAUDE.md as a charge you re-pay on every iteration, not a fee you settle once. In a single invocation, a bloated instruction file is a fixed cost. The agent loads it, and either the rule near the bottom gets followed or it falls past the [instruction ceiling](/blog/claude-md-instruction-ceiling/) and gets dropped — silently, once. In a loop, that same file reloads every turn, and each turn stacks its own output on top of it.

> An agent running in a loop generates more and more data that could be relevant for the next turn of inference, and this information must be cyclically refined.
> — [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

*Refined* is the operative word — the context does not refine itself. Left alone it grows by default, because "each invocation requires a full inference pass, and intermediate results pile up in context whether they're useful or not" ([Anthropic: Introducing advanced tool use on the Claude Developer Platform](https://www.anthropic.com/engineering/advanced-tool-use)). The scale that always-on context can reach is easy to underestimate: Anthropic reports having "seen tool definitions consume 134K tokens before optimization" ([Anthropic: Advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use)). That figure is tool definitions, not your CLAUDE.md — but it is the same shape of problem, an always-on block riding every inference pass whether or not this turn needs it.

Here is the audit, applied line by line to the file your overnight loop is pointed at:

- **When a line is architecture the agent can read from the repo** → cut it. It is context burn re-paid every iteration for something a `grep` would surface on demand.
- **When a line is a "just in case" preference no real failure ever earned** → cut it. In one invocation it was one distractor; across fifty iterations it is fifty.
- **When a line is a genuine constraint that must hold** → keep it, phrase it as a runnable check, and move it as high in the file as it will go, because position decays.
- **When a line is a hard safety boundary** → it does not belong in an advisory file at all; a loop with no human at the keyboard is exactly the run where "the agent usually respects this" is not good enough.

The reliability cost of skipping that audit is measured, not asserted. Chroma's study across 18 models and 194,480 calls found that "models do not use their context uniformly; instead, their performance grows increasingly unreliable as input length grows" ([Chroma: Context Rot](https://www.trychroma.com/research/context-rot)). This is not a lone vendor's marketing line — Chroma coined *context rot*, and Anthropic documents the same finding on its own product surface: "As token count grows, accuracy and recall degrade, a phenomenon known as context rot" ([Anthropic: Context windows](https://docs.anthropic.com/en/docs/build-with-claude/context-windows)). **A single invocation pays context rot once; a loop pays it on every turn, and the bill compounds with the output the loop keeps adding.**

### Presentation Over Presence: Cut for How the File Reads on Turn 50, Not Whether It's Present on Turn 1

The instinct when a loop misbehaves is to add a line — spell out the rule the agent missed. That optimizes for presence: the rule is now technically in the file. But presence is the wrong target. Chroma's sharper finding is that "whether relevant information is present in a model's context is not all that matters; what matters more is how that information is presented" ([Chroma: Context Rot](https://www.trychroma.com/research/context-rot)). On turn one, a 300-line CLAUDE.md and a 60-line one both technically contain your rule. By turn fifty, with the loop's own output layered on top, the 60-line file is the one where the rule is still legible. Cut and order for how the file reads deep into the run, not for whether the rule is present at the start.

---

## Read a Clean One-Shot Demo as the Weakest Evidence You Have — a Loop Is a Different Reliability Regime

> **Author's judgment.** That a loop fails *quieter* than the demo — not just more often — is my inference, not a measured result. It follows from two sourced premises: models self-condition on their own prior errors (Sinha et al.), and autonomous runs carry "the potential for compounding errors" (Anthropic). The clean first turn is the least informative data point you have about the fiftieth.

A flawless single run is the worst evidence you can bring to a decision about autonomy, because per-step reliability is a different quantity from single-turn reliability, and the gap is measured.

> the per-step accuracy of models degrades as the number of steps increases. This is not just due to long-context limitations — curiously, we observe a self-conditioning effect — models become more likely to make mistakes when the context contains their errors from prior turns.
> — [Sinha et al.: The Illusion of Diminishing Returns](https://arxiv.org/abs/2509.09677)

Their sharpest data point cuts directly against extrapolating from a clean demo: "larger models can correctly execute significantly more turns even when small models have near-perfect single-turn accuracy." Single-turn accuracy does not predict how many turns a model survives.

Carry that result with its caveats, because the honest version is more useful than the scary one. It was measured on a synthetic running-sum task, not a literal tool loop; the same authors find "thinking mitigates self-conditioning"; and, counterintuitively, larger models are *more* prone to self-conditioning, not less. **So the claim is not "big models get dumb in loops." It is narrower and harder to dodge: single-shot accuracy doesn't predict loop reliability, and the mechanism that breaks the extrapolation is the model reading its own earlier mistakes as ground truth.**

Here is that mechanism on the running artifact. The overnight loop makes a bad call at iteration 12 — say it edits `auth.go` against a misread of the token-refresh flow and commits it. Every iteration after 12 opens a fresh context, reads the repo as it now stands, and finds that wrong `auth.go` sitting there as established fact. The loop is no longer debugging its mistake; it is building on it. By 3 a.m. it has spent thirty iterations making the codebase consistent with a decision it never should have made — and the terminal shows steady, confident progress the whole time. That is the compounding-errors path Anthropic warns about ([Anthropic: Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)), running unattended. The blast radius of one bad call is no longer a single turn you can catch; it is every turn that reads the commit.

```text
# One bad call compounding — each fresh context reads it as fact, not mistake.
iter 12    misreads the token-refresh flow, edits auth.go, and commits it
iter 13    fresh context reads the wrong auth.go as established fact
  ...      builds on the bad commit instead of debugging it
+30 iters  3 a.m.: the repo is consistent with a call it never should have
           made — and the terminal showed steady, confident progress throughout
```

This is why the demo lies by omission. Geoffrey Huntley, who popularized the overnight loop, is blunt about its nondeterminism: Ralph goes off track, and you can wake up to a broken codebase that doesn't compile unless you build in [programmatic verification](/blog/evaluating-ai-coding-agent-output/) rather than letting the model grade its own work ([Geoffrey Huntley: Ralph Wiggum as a "software engineer"](https://ghuntley.com/ralph/)). The demo you were shown is the run that shipped clean on the first try and got kept. The runs that went off track do not get recorded — which is precisely why a clean one-shot demo is the weakest evidence in the room.

---

## Budget the Two Fields a Single Prompt Never Had: An Explicit Stop and Externalized State

A single prompt has two things a loop does not: a natural end, and a memory that lasts exactly as long as the task. The task finished, the window cleared, and "done" handled both. A loop inherits neither for free — so before you walk away, write a stop spec and a state file.

Start with the stop. Anthropic's baseline is that "the task often terminates upon completion, but it's also common to include stopping conditions (such as a maximum number of iterations) to maintain control" ([Anthropic: Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents)). The field guide that covers this most concretely names three, and an unattended loop needs all of them:

1. **Max iteration count** — a hard ceiling on turns, full stop. Your `while :; do ... done` has no upper bound; give it one.
2. **No-progress detection** — if a pass produces no measurable change against the check, halt instead of grinding.
3. **A token or dollar budget** — a hard spend ceiling that ends the run ([Truong Phung: The Agentic Loop / Loop Engineering: A Practical Field Guide](https://dev.to/truongpx396/the-agentic-loop-a-practical-field-guide-mnc)).

The hardened version of the running artifact is only a few lines longer, and every added line is a brake:

```bash
# The overnight loop, with the two fields a single prompt never needed.
for i in $(seq 1 "$MAX_ITERS"); do          # (1) max-iteration ceiling
  cat PROMPT.md progress.txt | agent        # externalized state, reloaded each turn
  ./run_checks.sh || true                   # the verification the model doesn't self-grade
  git add -A
  git commit -m "iter $i" || break          # (2) nothing to commit -> no progress -> stop
done
# (3) the spend ceiling lives on the wrapper: a wall-clock or token budget that kills the run.
```

The cap makes the run bounded; the failed commit makes each pass verifiable — nothing changed against the check, so the loop stops instead of grinding on. That is what turns an open-ended loop into bounded, verifiable work.

Then the state. Anthropic's harness work names it exactly: "the core challenge of long-running agents is that they must work in discrete sessions, and each new session begins with no memory of what came before" ([Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). Their conclusion is the one that breaks the single-prompt playbook: "even a frontier coding model like Opus 4.5... will fall short of building a production-quality web app if it's only given a high-level prompt." The fix is not a better prompt; it is state on disk — Anthropic reconstructs it "with the claude-progress.txt file alongside the git history," and the field guide reduces it to a line worth taping to your monitor: "the agent forgets; the repo doesn't" ([Truong Phung](https://dev.to/truongpx396/the-agentic-loop-a-practical-field-guide-mnc)).

Carry one version caveat so you don't over-learn the memoryless framing. On newer models the strict "no memory of what came before" is softer than it sounds. Server-side compaction and the Agent SDK's "compact feature automatically summarizes previous messages when the context limit approaches" ([Anthropic: Building agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)) both blunt the hard session boundary. The mechanism is version-dependent; the discipline is not. Externalized state is what survives a window reset regardless of how gracefully your model compacts, so write the `progress.txt` either way.

State also changes what retrieval means, and this is where the loop reopens a problem you thought you had scoped. Just-in-time retrieval, in a single invocation, is one agent resolving pointers at runtime — and it has its own quiet failure modes ([where JIT retrieval silently breaks](/blog/jit-context-retrieval-failure/)). A loop adds a second retrieval axis with no single-shot analog: pulling the right slice of *its own past sessions* back into a fresh window. Anthropic's managed-agent architecture makes that axis explicit: the session is "a context object that lives outside Claude's context window." A `getEvents()` interface "allows the brain to interrogate context by selecting positional slices of the event stream" to pick up where it last stopped ([Anthropic: Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents)). That is cross-iteration retrieval, and it is its own discipline. Keep the run's progress log separate from your durable skills and rules, because they answer different questions: what did *this run* do, versus what should *every run* know.

---

## Before You Press Go, Run Each Single-Shot Assumption Through Its Loop-Equivalent Check

Do not scale autonomy on a playbook you have not re-derived for many invocations. Every assumption in the table below was safe when the unit of work was one invocation; each one changes when the unit becomes many. Before the overnight loop runs unattended, walk each row and confirm you have an answer — this is the migration made into a checklist.

| Single-shot assumption | What changes across many invocations | Check before you walk away |
| --- | --- | --- |
| Loop engineering is a new skill to learn | It is the gather/act/verify primitive you already ran, now unattended | Are you migrating your single-invocation habits, or starting from a blank slate you don't need? |
| CLAUDE.md is a one-time cost paid at load | It reloads every turn and stacks the loop's own output on top, so context rot compounds | Did you cut the file for how it reads on turn 50, and move every real constraint above the fold? |
| A clean demo predicts reliability | Per-step accuracy decays and the model conditions on its own earlier mistakes, quietly | Have you budgeted for the run that builds on a 2 a.m. error in `auth.go`, not the one you were shown? |
| "Done" ends the task and the window clears it | Nothing terminates the loop and nothing survives the reset | Is there a max-iteration cap, no-progress detection, a spend ceiling, and a `progress.txt`? |

The through-line is one sentence. **A loop is many invocations, not one — so the question before you press go is not "is my prompt good?" but "does every assumption I tuned for a single invocation still hold on turn fifty?"** The single-invocation playbook was not wrong; it was scoped. Loop engineering is what you get when you re-derive it for the unit of work you actually shipped — and the reader who runs that migration keeps the overnight wins instead of the overnight surprises.

I write one long-form piece at a time on context engineering and agent reliability. If re-deriving the playbook every time the unit of work changes isn't how you want to spend the quarter, [subscribe](/subscribe/) and the next one lands in your inbox.

---

## References

### Research and Data

1. [Chroma: Context Rot — How Increasing Input Tokens Impacts LLM Performance (Hong, Troynikov, Huber)](https://www.trychroma.com/research/context-rot) — Across 18 models and 194,480 calls, performance grows increasingly unreliable as input length grows, and presentation matters more than presence. Backs the per-iteration rot and "presentation over presence" sections.
2. [Sinha, Arun, Goel, Staab, Geiping: The Illusion of Diminishing Returns — Measuring Long Horizon Execution in LLMs](https://arxiv.org/abs/2509.09677) — Per-step accuracy decays and models self-condition on their own prior errors; larger models are more prone and thinking mitigates it. Measured on a synthetic running-sum task. Backs "a loop is a different reliability regime."
3. [METR: Measuring AI Ability to Complete Long Tasks](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/) — Task length agents complete autonomously with 50% reliability has been doubling roughly every 7 months. The "why now" for taking loops seriously.

### Practitioner Guidance

4. [Anthropic: Building Effective AI Agents](https://www.anthropic.com/research/building-effective-agents) — An agent is "just LLMs using tools ... in a loop"; the compounding-errors warning; stopping conditions such as a maximum number of iterations. Backs loop-as-primitive and the stop spec.
5. [Simon Willison: Designing agentic loops](https://simonwillison.net/2025/Sep/30/designing-agentic-loops/) — Designing the loop is "a critical new skill," and an agent "runs tools in a loop to achieve a goal" — the term's lineage predating its coinage. Backs loop-as-primitive.
6. [Addy Osmani: Loop Engineering](https://addyosmani.com/blog/loop-engineering/) — Defines loop engineering as replacing yourself as the person who prompts the agent. The term the post reframes.
7. [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — A looping agent generates more and more data that must be cyclically refined; names context rot and attributes it to Chroma. Backs "the context accumulates every turn."
8. [Anthropic: Context windows](https://docs.anthropic.com/en/docs/build-with-claude/context-windows) — Accuracy and recall degrade as token count grows (context rot), so curation matters as much as capacity. Official-docs corroboration.
9. [Anthropic: Introducing advanced tool use on the Claude Developer Platform](https://www.anthropic.com/engineering/advanced-tool-use) — Intermediate results pile up in context whether useful or not; tool definitions have consumed 134K tokens before optimization. The 134K figure is tool definitions, used only as an analog for always-on bloat.
10. [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) — Long-running agents work in discrete sessions with no memory of what came before; a high-level prompt alone fails; state reconstructed from a claude-progress.txt file alongside git history. Backs externalized state.
11. [Anthropic: Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents) — The session is a context object that lives outside the context window; getEvents() selects positional slices of the event stream. Backs cross-iteration retrieval as its own discipline.
12. [Anthropic: Building agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk) — The gather/act/verify/repeat cycle and the compact feature that summarizes previous messages as the window fills. Backs loop-as-primitive and the compaction caveat.
13. [Geoffrey Huntley: Ralph Wiggum as a "software engineer"](https://ghuntley.com/ralph/) — The unattended overnight loop with a fresh context each iteration and state in files; verify success programmatically rather than trusting the model to self-assess. The running artifact and the honest failure mode.
14. [Truong Phung (DEV Community): The Agentic Loop / Loop Engineering: A Practical Field Guide](https://dev.to/truongpx396/the-agentic-loop-a-practical-field-guide-mnc) — The three hard stops (max iterations, no-progress detection, spend budget) and disk-backed state: "the agent forgets; the repo doesn't." Backs the stop-and-state section.

### Author's Judgment (not directly sourced)

The following claim is my own synthesis. It follows logically from the sourced material above, but no source states it directly:

- **"A loop fails quieter than the demo, not just more often"** — Inferred from Sinha et al.'s self-conditioning result (the model reads its own earlier errors as ground truth) and Anthropic's compounding-errors warning. Neither source states the "less visibly" framing; that is my inference.

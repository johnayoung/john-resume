---
title: "What AI Coding Agents Are Actually Good For (And When to Skip)"
metaTitle: "What AI Coding Agents Are Actually Good For"
date: 2026-05-04
draft: false
pillar: architecture-decisions
author: "John Young"
description: "The internet ranks AI coding agents endlessly and never answers the only question that matters: can you verify the output, and can you undo it if you can't?"
keywords: ["AI coding agents", "verification cost", "agent reliability", "blast radius", "when to use AI agents"]
---

The internet has a thousand "best AI coding agent" rankings and zero answers to the only question that matters before you open a prompt: can you verify the output, and can you undo it if you can't? Which tool you pick barely moves the outcome — what moves it is whether the task you're about to delegate has a cheap correctness check and a working undo, because those two properties are what separate the work agents ship clean from the work they quietly break.

---

## Ask Two Questions Before You Write the Prompt: Can You Verify It, and Can You Undo It?

Score the task before you reach for the agent, not the agent before you reach for the task. The tool listicles rank context windows and token efficiency; none of them name the two axes that actually decide whether delegation pays off — how expensive it is to check the result, and how expensive it is to reverse a wrong one. If either axis is bad, the task stays in your hands, no matter which agent tops this quarter's benchmark.

This is the same discipline Anthropic leads with in its own agent-building guidance: start with the simplest thing that works, and add autonomy only when the task earns it.

> "When building applications with LLMs, we recommend finding the simplest solution possible, and only increasing complexity when needed. This might mean not building agentic systems at all."
> — [Anthropic: Building effective agents](https://www.anthropic.com/research/building-effective-agents)

"Not building agentic systems at all" is the option the rankings never present, because a ranking exists to sell you a tool. Those two axes are the reader's whole apparatus for the rest of this post: every section that follows is one lens on where a task lands.

Hold one incident in mind as the case study, because the later sections dissect it from every angle. A user asked an agent to "clean up old branches." It listed the remote branches, pattern-matched what looked old, and issued a delete that would have destroyed history ([Anthropic: How we built Claude Code auto mode](https://www.anthropic.com/engineering/claude-code-auto-mode)). Vague goal, no cheap correctness check, irreversible blast radius — one command that fails both axes at once. Keep it in view.

---

## Hand Agents Bounded, Verifiable Work With a Tight Feedback Loop — That's Where They Fly

Delegate the tasks that arrive with a pass/fail check the agent can run without you. That closed loop — write code, run the check, read the result, iterate — is the exact mechanism agents exploit, and coding is the archetypal domain where it exists, because a test suite turns "looks done" into "the check passed."

Sean Goedecke, a staff engineer, describes where agents win for him now:

> "I now use LLMs to produce entire PRs in areas I'm familiar with"
> — [Sean Goedecke: How I use LLMs as a staff engineer in 2026](https://www.seangoedecke.com/how-i-use-llms-in-2026/)

Entire PRs, in areas he already knows — the two qualifiers are the whole point. In a familiar area he can write the verifying check cheaply and read the diff fast, and on bug investigation he reports the agent is "able to correctly diagnose 80% of issues on its own" ([Sean Goedecke: How I use LLMs as a staff engineer in 2026](https://www.seangoedecke.com/how-i-use-llms-in-2026/)). The agent flies because the feedback loop is tight and the correctness signal is cheap, not because the model is magic.

The enabler is the test suite. Simon Willison makes the dependency explicit: the closed loop is only as good as the check that closes it.

> "If your project has a robust, comprehensive and stable test suite agentic coding tools can _fly_ with it."
> — [Simon Willison: Vibe engineering](https://simonwillison.net/2025/Oct/7/vibe-engineering/)

This is not marketing enthusiasm — it is a mechanical claim about verifiability. Anthropic scopes it precisely: "Code solutions are verifiable through automated tests; Agents can iterate on solutions using test results as feedback" ([Anthropic: Building effective agents](https://www.anthropic.com/research/building-effective-agents)). The test result is the feedback. No test, no loop, no flight. Once a task passes this go/no-go bar, the next move is writing the spec well — the [anatomy of a perfect AI agent task](/blog/anatomy-of-a-perfect-ai-agent-task/) covers the elements that make a bounded task land on the first try.

### Give the Agent the Verification Command — Don't Be the Verification Command Yourself

The failure mode inside the fit case is subtle: you hand over bounded work but keep the correctness check in your own head, so every mistake waits for you to notice it. The move is to externalize the check into something the agent can run.

**Bad:** "Add E.164 validation to `UserService.ValidatePhone`, then tell me when it's done." (Done how? You are now the loop — you read the diff, you decide if it's right, and the agent's confidence is your only signal.)

**Good:** "Add E.164 validation to `UserService.ValidatePhone`. Run `go test ./internal/user/... -run TestValidatePhone` and show me the output before declaring it done." (Now the check runs itself and the agent can't call "looks done" the finish line.)

The Claude Code docs draw the line at the evidence:

> "Have Claude show evidence rather than asserting success: the test output, the command it ran and what it returned, or a screenshot of the result."
> — [Claude Code Docs: Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)

Evidence over assertion. If the task has no runnable check, you haven't given the agent bounded work — you've given yourself an unreviewed diff.

---

## Refuse Long-Horizon, Unbounded Tasks — Agent Reliability Falls Off a Measurable Cliff

Estimate how long the task would take a competent human before you delegate it — because agent success does not decay gently with task length, it collapses. METR measured exactly where. The success rate is near-total on the short tasks and near-zero on the long ones:

> "current models have almost 100% success rate on tasks taking humans less than 4 minutes, but succeed <10% of the time on tasks taking more than around 4 hours"
> — [METR: Measuring AI Ability to Complete Long Tasks](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)

That is the cliff, and it hands you a portable rule keyed to human time — the one estimate you can make before writing a line of spec:

| Human estimate | Agent success | Move |
| --- | --- | --- |
| Under ~4 minutes | almost 100% | Hand it over; agents are near-perfect here. |
| Minutes-to-an-hour band | on the downslope | Delegate, but keep the verification check tight. |
| Over a few hours | <10% | Don't delegate it whole. Decompose into sub-hour, independently verifiable pieces, or keep it yourself. |

The reason the rule works long-term is that the horizon is moving, but slowly and predictably. METR's methodology paper puts a number on the trend: "frontier AI time horizon has been doubling approximately every seven months since 2019" ([Kwa, West, Becker et al. (METR): Measuring AI Ability to Complete Long Software Tasks](https://arxiv.org/abs/2503.14499)). Doubling every seven months means the four-hour ceiling rises over time — but on any given day it is a hard, measurable ceiling, and a multi-hour slog sits well past it. Decomposing a too-big task is its own skill; [how to size tasks for AI coding agents](/blog/how-to-size-tasks-for-ai-coding-agents/) walks the seams. The point here is upstream of sizing: if the human estimate says "hours," the task is not one task, and handing it over whole is betting against a <10% success rate.

---

## When Verification Costs More Than Writing the Code, Do It Yourself

Compare the cost of checking the agent's output against the cost of writing it yourself — and when checking wins, write the code. This is the axis the reliability cliff misses. A task can sit comfortably under the four-hour horizon and still be a net loss, because the expensive part is not producing the diff, it is proving the diff is correct.

The proving is the constraint now, not the typing. Addy Osmani frames the shift in one line:

> "AI writes faster. Humans still have to prove it works."
> — [Addy Osmani: Code Review in the Age of AI](https://addyo.substack.com/p/code-review-in-the-age-of-ai)

And the review bill, when it comes due, is heavier than the writing it replaced. Osmani cites survey data that both halves of the problem are real — most developers skip the check, and those who do the check find it harder than reviewing human code:

> "only 48% of developers consistently check AI-assisted code before committing it, even though 38% find that reviewing AI-generated logic actually requires more effort than reviewing human-written code."
> — [Addy Osmani: The 80% Problem in Agentic Coding](https://addyo.substack.com/p/the-80-problem-in-agentic-coding)

The trap hides in that 38%. Reviewing AI logic costs *more* per line, so a task where you'd have to reconstruct the full context to verify the output is a task where verification can quietly exceed authorship. Osmani names where the cost concentrates: "AI gets you 80% to an MVP; the last 20% requires patience, learning deeply or hiring engineers" ([Addy Osmani: The 80% Problem in Agentic Coding](https://addyo.substack.com/p/the-80-problem-in-agentic-coding)). That last mile is verification-heavy by nature, and it is where the agent's speed advantage inverts into a review tax.

Run "clean up old branches" through this axis alone and it fails before you consider anything else. There is no cheap check that the branches the agent pattern-matched are the disposable ones — confirming that costs more attention than deleting the right branches by hand. When the verification is harder than the work, delegating it is not a shortcut. It is a detour with a review bill at the end.

---

## Skip Agents When the Goal Is Vague, Taste-Heavy, or the Context Lives in Your Head

If you can't write a verifiable "done," don't hand the task to an agent — that is where measured productivity goes negative, not just flat. The failure is not that the agent works slowly on ambiguous goals. It is that it works confidently in the wrong direction, and you pay to discover it.

METR's field study is the hard evidence, and it is counterintuitive enough to sit with. On real, high-context open-source work:

> "When developers are allowed to use AI tools, they take 19% longer to complete issues"
> — [METR: Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)

Nineteen percent *longer* — on their own repos, where the context lived in their heads and nowhere the agent could read it. And the perception gap is the part that should scare you: the same developers "still believed AI had sped them up by 20%" after the study, having expected 24% going in ([METR: Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)). Gut feel said faster; the stopwatch said slower — so the skip decision has to be made by rule, not by feel. Skip the agent when the task is any of these:

- **A judgment-writing task** — ADRs, design docs, Slack messages. Goedecke is blunt: "I still don't use LLMs to write Slack messages, ADRs, issues and so forth" ([Sean Goedecke: How I use LLMs as a staff engineer in 2026](https://www.seangoedecke.com/how-i-use-llms-in-2026/)).
- **A taste-heavy change** — look-and-feel UI, tone, the "core idea" of a change that only reads right when a human wrote it.
- **A vague cleanup** — "clean this up," "make it better," anything where "done" is in your head and not on the page.
- **Business logic whose *why* only you hold** — where the correct behavior depends on context that was never written down.

The line under all four is maintenance. Goedecke's own boundary: "LLMs excel at writing code that works that doesn't have to be maintained" ([Sean Goedecke: How I use LLMs as a staff engineer](https://www.seangoedecke.com/how-i-use-llms/)) — and it's "rare that I let Copilot produce business logic for me" ([Sean Goedecke: How I use LLMs as a staff engineer](https://www.seangoedecke.com/how-i-use-llms/)). Throwaway and verifiable, yes. Load-bearing and judgment-bound, no.

"Clean up old branches" is the checklist's first two items fused into one instruction. It is a vague cleanup *and* a taste call about what counts as "old," with the real intent — probably "delete my merged local branches" — living entirely in the user's head. The agent had to guess "old," and it guessed destructively. A goal you can't verify is a goal the agent will complete in a direction you didn't mean.

---

## Size the Blast Radius: Never Delegate an Irreversible Action You Can't Cheaply Catch

Before you delegate, ask what a wrong result you *don't* catch actually costs — and gate any irreversible, hard-to-detect action behind your own hands, however verifiable the task looks. This is the standalone axis, orthogonal to the other three. A task can be short, cheap to verify, and clearly specified and still fail here, because the question is not "will the agent get it right" but "what happens the one time it doesn't."

The reassuring part is that irreversible actions are rare. Anthropic's analysis of real agent traffic puts a number on it:

> "80% of tool calls come from agents that appear to have at least one kind of safeguard (like restricted permissions or human approval requirements), 73% appear to have a human in the loop in some way, and only 0.8% of actions appear to be irreversible"
> — [Anthropic: Measuring AI agent autonomy in practice](https://www.anthropic.com/news/measuring-agent-autonomy)

Zero point eight percent. But rarity is exactly why the axis needs its own gate — the base rate lulls you, and Anthropic is direct about the asymmetry: "while these higher-risk actions are rare as a share of overall traffic, the consequences of a single error can still be significant" ([Anthropic: Measuring AI agent autonomy in practice](https://www.anthropic.com/news/measuring-agent-autonomy)). One irreversible mistake in a thousand safe actions is not a 0.1% problem if the one mistake destroys production data.

"Clean up old branches" is this axis's home, the worked example the whole taxonomy points at. The agent's delete would force-push away history — precisely the destructive-action class Anthropic names: "Cause irreversible loss by force-pushing over history, mass-deleting cloud storage, or sending internal data externally" ([Anthropic: How we built Claude Code auto mode](https://www.anthropic.com/engineering/claude-code-auto-mode)). That is why the incident fails even a reader who fixes every other axis: suppose the goal were crisp and the check were cheap — the action is still irreversible and destructive, and a wrong result you don't catch in the moment is gone. So the blast-radius gate overrides the other three: when the undo is expensive or impossible, the answer is your own hands, no matter how clean the task scored elsewhere.

---

## Run the Task Through Both Axes Before You Open a Prompt

Score every candidate task on verification cost and reversibility first; only the cheap-to-verify, easy-to-undo quadrant goes to an agent unsupervised. The five sections above collapse into one ordered pass — run a task through the gates in sequence, and the first failure is your answer.

```text
                THE GO / NO-GO PASS
                run before you write the prompt

1. Is there a check the agent can run itself?        (bounded, verifiable work)
   test suite / build / lint / diff-against-fixture
      NO  ─────────────────────────────►  KEEP IT. No closed loop, no delegation.
      YES ▼

2. How long would this take a competent human?       (the reliability cliff)
      > a few hours ──────────────────►  DECOMPOSE into sub-hour verifiable pieces,
                                          or keep it. Success is <10% past 4 hours.
      ≤ a few hours ▼

3. Would checking the output cost more than           (the verification tax)
   writing it yourself?
      YES ─────────────────────────────►  WRITE IT. Review harder than authorship
                                          is a net loss, not a shortcut.
      NO  ▼

4. Can you state "done" as something verifiable?      (vague / taste / hidden context)
   not taste, not judgment, not context-in-your-head
      NO  ─────────────────────────────►  KEEP IT. Measured productivity goes
                                          negative on high-context work (19% slower).
      YES ▼

5. If a wrong result slips through uncaught,           (size the blast radius)
   is the action reversible AND cheap to detect?
      NO  ─────────────────────────────►  YOUR HANDS. Irreversible + hard-to-catch
                                          overrides every gate above.
      YES ▼

   ►  DELEGATE unsupervised. Cheap-to-verify, easy-to-undo quadrant.
```

The pass is packaged as a runnable gate script and Claude Code skill in my [agent-engineering-toolkit](https://github.com/johnayoung/agent-engineering-toolkit), so you can score a task in the terminal before you open the prompt.

Now run "clean up old branches" back through it, because a decision tool that only passes easy cases is worthless. Gate 1: there is no cheap check that the pattern-matched branches are the disposable ones — it stumbles immediately. Even granting a check, gate 4: "old" is a taste call with the real intent in the user's head — it fails again. And gate 5: the delete force-pushes away history — irreversible, hard to catch, straight to your hands. The incident that opened this post fails three gates independently, and any one of them would have caught it before the prompt was ever written.

That is the whole apparatus. Not "which agent is best" — the question the rankings answer and the reader never asked — but "does this task belong to an agent at all." And the honest coda is that even a task that clears all five gates still earns a look at the diff. Goedecke, who is bullish on agents, still reports: "For difficult tasks, I'll often reject five or six (or more!) agent attempts before accepting one as good enough to work with, or giving up and making the change by hand" ([Sean Goedecke: How I use LLMs as a staff engineer in 2026](https://www.seangoedecke.com/how-i-use-llms-in-2026/)). The gates decide what you delegate. Judgment still decides what you accept.

---

## References

### Research and Data

1. [METR: Measuring AI Ability to Complete Long Tasks](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/) — The reliability cliff: near-100% success under 4 minutes, <10% past ~4 hours; ~7-month doubling of the task horizon.
2. [Kwa, West, Becker et al. (METR): Measuring AI Ability to Complete Long Software Tasks](https://arxiv.org/abs/2503.14499) — The peer-reviewable backbone for the horizon trend: doubling approximately every seven months since 2019.
3. [METR: Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) — On real high-context repos, developers took 19% longer with AI while believing they were 20% faster.
4. [Addy Osmani: The 80% Problem in Agentic Coding](https://addyo.substack.com/p/the-80-problem-in-agentic-coding) — 48% don't consistently check AI code; 38% find reviewing it harder than human code; the last-20% tax.
5. [Anthropic: Measuring AI agent autonomy in practice](https://www.anthropic.com/news/measuring-agent-autonomy) — Only 0.8% of real agent actions are irreversible, but the consequences of a single error can still be significant.

### Practitioner Guidance

6. [Anthropic: Building effective agents](https://www.anthropic.com/research/building-effective-agents) — Start simple, up to and including not building agentic systems at all; code is verifiable through automated tests.
7. [Simon Willison: Vibe engineering](https://simonwillison.net/2025/Oct/7/vibe-engineering/) — A strong, stable test suite is what lets agentic coding tools fly.
8. [Claude Code Docs: Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) — Give the agent a check it can run; have it show evidence rather than assert success.
9. [Sean Goedecke: How I use LLMs as a staff engineer in 2026](https://www.seangoedecke.com/how-i-use-llms-in-2026/) — Entire PRs in familiar areas, 80% of bugs diagnosed, but ADRs stay human and hard tasks get five or six rejected attempts.
10. [Sean Goedecke: How I use LLMs as a staff engineer](https://www.seangoedecke.com/how-i-use-llms/) — Agents excel at code that doesn't have to be maintained; rarely for business logic.
11. [Addy Osmani: Code Review in the Age of AI](https://addyo.substack.com/p/code-review-in-the-age-of-ai) — AI writes faster, but a human still has to prove it works; review is the moved bottleneck.
12. [Anthropic: How we built Claude Code auto mode](https://www.anthropic.com/engineering/claude-code-auto-mode) — The "clean up old branches" incident and the destructive-action taxonomy (force-push, mass-delete, exfiltrate).
13. [agent-engineering-toolkit: agent-task-go-no-go](https://github.com/johnayoung/agent-engineering-toolkit) — The five-gate go/no-go pass as an interactive script and Claude Code skill; the first failing gate is the verdict. Exit codes distinguish delegate, no-go, and input error, and each verdict cites the measurement behind it.

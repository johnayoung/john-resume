---
title: "How to Verify AI Coding Agent Output: A Reviewer's Framework"
date: 2026-06-01
draft: false
pillar: evals-verification
author: "John Young"
description: "Generation got cheap and verification didn't. Six per-task moves for reviewing an agent's diff — from distrusting its self-report to calibrating by blast radius."
keywords: ["verify AI coding agent output", "AI code review", "agent PR review", "code review AI agents", "blast radius"]
---

Generation got cheap and verification didn't. PR volume is up 98 percent and PR review time is up 91 percent ([LogRocket: Why AI coding tools shift the real bottleneck to review](https://blog.logrocket.com/ai-coding-tools-shift-bottleneck-to-review/)), and the diff in front of you now comes from a worker that will report "complete" with a large fraction of the spec never written. The moves below are a per-task framework for reading that diff — not a general "review better" plea, but six specific things to do to one agent-authored pull request before you approve it.

---

## Generation Got Cheap; Verification Didn't — Restructure Review or Ship Slower

Treat review, not writing, as your throughput ceiling. If you bolt agents onto an unchanged review process, the constraint doesn't disappear — it moves from the keyboard to the reviewer, and the reviewer is still human. LogRocket's data makes the shift concrete: Faros AI's analysis of more than 10,000 developers found a 98 percent increase in PR volume, and the result was that review time went up 91 percent even though code generation itself got faster ([LogRocket: Why AI coding tools shift the real bottleneck to review](https://blog.logrocket.com/ai-coding-tools-shift-bottleneck-to-review/)).

| Metric | Moves | What it tells you |
| --- | --- | --- |
| Diffs-per-week | Up immediately (+98% PR volume) | Looks like progress; it's the wrong number |
| Releases-per-week | Down, if review stays flat (+91% review time) | What the business ships, downstream of the reviewer |

The instinct is to measure the win in diffs-per-week, because that number goes up immediately and looks like progress. It is the wrong number. What the business ships is releases, and the reviewer is now the gate every release passes through. If you want one metric on the wall, make it releases-per-week — and expect it to drop, not rise, if review capacity stays flat while generation volume triples.

The reason the gate is expensive is that plausible-looking agent output is not the same as correct agent output, and the gap only shows up under audit. One survey of the field describes a "speed vs. trust" gap in which a large percentage of agent efforts fail to meet the quality bar of being truly "merge-ready" ([Hassan et al.: Agentic Software Engineering — Foundational Pillars and a Research Roadmap](https://arxiv.org/html/2509.06216v1)). The same paper cites a finding that true solve rates for GPT-4 patches dropped from 12.47% to 3.97% after detailed manual audits — a two-thirds collapse between "looks solved" and "solved."

That is what makes review the ceiling: the output arrives fast and reads well, so the cost isn't in producing it — it's in the audit that tells the two apart. The rest of this post is what that audit actually consists of.

> **Author's judgment.** "Measure releases-per-week, not diffs-per-week" is my framing, not a claim any source states directly. It follows from LogRocket's finding that PR volume rose 98% while review time rose 91%, combined with the audit-gap finding above: if the reviewer is the bottleneck and generation volume climbs faster than review capacity, the throughput metric that matters is the one downstream of the reviewer.

---

## Never Trust the Agent's Self-Report — Make It Show Evidence a Fresh Grader Checks

The agent will tell you it's done. That signal is worth nothing, because the agent stops the moment the work *looks* done, not the moment it *is* done — and "looks done" is a self-report from the party with the strongest incentive to declare victory. The Claude Code docs name the failure precisely: "Claude stops when the work looks done. Without a check it can run, 'looks done' is the only signal available, and you become the verification loop: every mistake waits for you to notice it" ([Anthropic: Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)).

This is where the artifact that runs through the rest of this post enters: the reported-complete PR. Its description says the feature is done, its build is green, and its author — the agent — is telling you to merge. Every "looks done" signal it carries is exactly the signal this section tells you to reject.

Refuse the assertion and demand the evidence behind it. When you see a self-report, do this:

- **When the PR says "tests pass," ask for the test output** — the command run and what it returned, not the claim that it was run. Have the agent show evidence rather than asserting success ([Anthropic: Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)).
- **When the PR says "feature works," ask for the artifact** — a screenshot, a `curl` against the endpoint, the actual response body.
- **When you need a real review, run it in a different context.** A verification subagent "has a fresh model try to refute the result, so the agent doing the work isn't the one grading it" ([Anthropic: Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)).

The last move is the load-bearing one. The worker cannot be its own examiner — as one practitioner puts it, "Don't ask the same agent to write code and verify it. That's like having students grade their own exams" ([Teemu Piirainen: How I Validate Quality When AI Agents Write My Code](https://dev.to/teppana88/how-i-validate-quality-when-ai-agents-write-my-code-481c)). A fresh grader sees only the diff and the criteria, not the reasoning that produced the change, so it evaluates the result on its own terms instead of rationalizing the author's.

The deeper reason to distrust the self-report is that a pass signal from the same system that produced the work is structurally gameable, not just occasionally wrong. Anthropic's own eval practice reflects this: "we do not take eval scores at face value until someone digs into the details of the eval and reads some transcripts" ([Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)). A green number is the beginning of the check, not the end of it — and a generic pass signal is the emptiest kind. "Good scores on them don't mean your system works" ([Hamel Husain and Shreya Shankar: LLM Evals — Everything You Need to Know](https://hamel.dev/blog/posts/evals-faq/)).

### Distrust Small Reported Margins — a Green Build or a Two-Point Lead Can Be Luck, Not Capability

Even when the number is real, a small margin is not a capability signal. Benchmark scores prove the point at scale: a Berkeley team built an automated agent to audit eight of the most prominent AI-agent benchmarks and found that "every single one can be exploited to achieve near-perfect scores without solving a single task" ([Berkeley RDI: How We Broke Top AI Agent Benchmarks](https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont/)). Their sharpest example: "A conftest.py file with 10 lines of Python 'resolves' every instance on SWE-bench Verified." A perfect score, zero tasks solved.

The narrower lesson is about margins. Anthropic's infrastructure-noise research found that configuration alone can move agentic-coding scores by more than the gaps that separate top models: "a 2-point lead on a leaderboard might reflect a genuine capability difference, or it might reflect that one eval ran on beefier hardware, or even at a luckier time of day, or both" ([Anthropic: Quantifying infrastructure noise in agentic coding evals](https://www.anthropic.com/engineering/infrastructure-noise)).

> **Author's judgment.** Reading a single green build as the same kind of thin, gameable signal as a two-point benchmark lead is my inference, not a claim in either source. It follows from the two premises above: if benchmark pass-signals are exploitable to near-perfect scores without solving anything (Berkeley RDI), and small reported margins are within infrastructure noise (Anthropic), then a lone "build passes" on one PR is a low-information signal for the same structural reason — a narrow, self-produced margin that hasn't been audited.

---

## Read the Agent's Tests as a Claim About the Task, Not Proof That It Works

Open the reported-complete PR's test file and read it as intent, not as proof. A passing suite tells you what the agent *thought* "done" meant — its interpretation of the task, encoded as assertions — and nothing more. When those assertions dodge the risky path, that is your signal, not your green light. As Simon Willison puts it, "Just because code passes tests doesn't mean it works as intended" ([Simon Willison: Agentic manual testing](https://simonwillison.net/guides/agentic-engineering-patterns/agentic-manual-testing/)).

The Bad and Good ways to read the same test file:

**Bad:** The `service_test.go` in the PR is green, so the service method works. Approve.

**Good:** The `service_test.go` in the PR is green, so the agent has demonstrated the cases *it chose to assert*. Read those cases against the spec's acceptance criteria. If the spec's edge case is "`phone == nil` returns nil, empty string returns a validation error" and the test file only asserts the valid-input case, the green suite is evidence the agent skipped the risky path — the suite passes precisely because it never tests the thing that would fail.

The point is that presence of tests is a signal to read, not a guarantee to trust. An empirical study of tests in agentic PRs found that "test-containing PRs are more common over time and tend to be larger and take longer to complete, while merge rates remain largely similar" ([Haque, Ingale, Csallner: Do Autonomous Agents Contribute Test Code?](https://arxiv.org/abs/2601.03556)) — tests showing up in the diff does not by itself predict a better outcome. So the test file earns a read, not a rubber stamp.

Reading the tests against the spec is the concrete move, and it depends on the spec being explicit in the first place — the acceptance criteria you wrote when you [specified the task](/blog/anatomy-of-a-perfect-ai-agent-task/) are exactly what the test file is claiming to satisfy. Compare the two directly: if the criteria list five behaviors and the test file asserts three, the agent has told you which two it either skipped or misunderstood.

And a green build is a lower bar than "done" regardless of what the tests cover. As Brad Kinnard frames it: "The agent runs the build, sees green, and moves on. But 'build passes' and 'the output is production-ready' are different bars" ([Brad Kinnard: AI Coding Agents Can Verify Some of Their Work Now](https://dev.to/moonrunnerkc/ai-coding-agents-can-verify-some-of-their-work-now-heres-what-they-still-miss-58mc)). The build compiling tells you the code is syntactically coherent. It says nothing about whether the feature exists.

---

## Hunt the Unbuilt Feature, Not Just the Bad Line — Verify Forward From the Spec

The most dangerous defect in the reported-complete PR is not a bad line — it's a missing one, and a missing feature leaves no diff to catch it. Code review examines what was built; if a feature wasn't built at all, there's no diff to review ([LoadSys: How to Verify What Your AI Coding Agent Actually Built](https://www.loadsys.com/blog/agentic-context-engineering-verification-practice/)). So stop reading the diff backward — "is this line correct?" — and read forward from the spec: "was this criterion built at all?"

This is not a rare edge case. LoadSys reports that on a real build, "structured verification consistently found 30-40% of the specification unimplemented after the agent reported 'complete.' Not broken code. Missing code" ([LoadSys: How to Verify What Your AI Coding Agent Actually Built](https://www.loadsys.com/blog/agentic-context-engineering-verification-practice/)). A third of the spec, absent, under a PR whose description said "complete." No line-by-line review of what shipped will surface what didn't.

Run each acceptance criterion against the reported-complete PR in order ([LoadSys](https://www.loadsys.com/blog/agentic-context-engineering-verification-practice/)):

1. **Pull up the spec's acceptance criteria** — the same list you defined when you [wrote the task](/blog/anatomy-of-a-perfect-ai-agent-task/). If there is no explicit criteria list, that is the first defect; you cannot verify forward from a spec that doesn't exist.
2. **For each criterion, ask "was this built?"** — not "is the code that was written correct?" Find the code or the test that satisfies the criterion, or record it as missing.
3. **Exercise the behavior, don't infer it from the diff.** Run the command, hit the endpoint, read the response. "Never assume that code generated by an LLM works until that code has been executed" ([Simon Willison: Agentic manual testing](https://simonwillison.net/guides/agentic-engineering-patterns/agentic-manual-testing/)).
4. **Treat "described but not found" as a defect, not an oversight.** In one study of agentic PRs, the single most common inconsistency was that "descriptions claim unimplemented changes" (45.4% of inconsistency cases) ([Gong, Pinna, Bian, Zhang: Analyzing Message-Code Inconsistency in AI Coding Agent-Authored Pull Requests](https://arxiv.org/abs/2601.04886)). The PR description is not evidence a feature exists.

The reason this move catches what the others miss is that every other check starts from the diff, and the diff is exactly where a skipped feature is invisible. Verifying forward from the spec is the only pass that can see the 30-40% that was never written.

---

## Treat Unsolicited Scope Changes as a Failure Class Distinct From Bugs

Now run the mirror check on the reported-complete PR: not "what did it skip?" but "what did it add that you never asked for?" Unrequested scope is its own failure class, separate from bugs, because the code can be individually correct and still be a defect — it's debt you didn't sanction, entering the tree under a green build.

The worked example: a PR titled "Add E.164 phone validation to UserService." You asked for a validation method on the service layer. The reported-complete PR delivers that — and also refactors the shared error type, renames a field on the `User` struct, and swaps the JSON marshaling in an adjacent handler "while it was in there." Each of those changes may compile and pass tests. None of them was requested. Under a correctness-only review they slide through, because correctness-only review asks "is this line right?" and never asks "did I sanction this line existing at all?"

This is the reviewing skill that separates good agent operators from bad ones. Sean Goedecke names it as "the biggest mistake engineers make in code review: only thinking about the code that was written, not the code that could have been written" ([Sean Goedecke: If you are good at code review, you will be good at using AI agents](https://www.seangoedecke.com/ai-agents-and-code-review/)) — and its twin is thinking only about the code that *should* have been written, not the code that got smuggled in beside it.

The reason unsolicited scope is worth its own failure class is that the mismatch between what a PR claims and what it changed is both common and costly. In the agentic-PR study, high message-code-inconsistency PRs "had 51.7% lower acceptance rates (28.3% vs. 80.0%)" ([Gong, Pinna, Bian, Zhang: Analyzing Message-Code Inconsistency in AI Coding Agent-Authored Pull Requests](https://arxiv.org/abs/2601.04886)) — when the description and the diff diverge, the PR is far less likely to be merge-worthy, whether the divergence is a skipped feature or an unrequested addition.

And the unrequested code doesn't leave when the PR merges. A large-scale study of AI-generated code in the wild found that "22.7% of tracked AI-introduced issues still survive at the latest version of the repository" ([Liu et al.: Debt Behind the AI Boom](https://arxiv.org/abs/2603.28592)) — better than a fifth of what the agent introduced was still there at HEAD. The scope you wave through today is the maintenance cost you inherit later. The structural signal is visible in aggregate too: GitClear's 2025 data found that lines classified as "copy/pasted" (cloned) rose from 8.3% to 12.3%, while the percentage of changed code lines associated with refactoring "sunk from 25%... to less than 10% in 2024" ([GitClear: AI Copilot Code Quality 2025](https://www.gitclear.com/ai_assistant_code_quality_2025_research)) — more pasted bulk, less consolidation. Unsanctioned additions are how that ratio gets worse one PR at a time.

---

## Calibrate Review Depth to Blast Radius and Issue Class, Not Diff Size

Line count is the wrong dial for how hard to look. A three-line change to an auth check or a payments path can take down production; a 300-line change to an isolated internal dashboard cannot. Set review depth from blast radius and issue class, not from the size of the diff — which means the reported-complete PR stops being the single object under the lens and becomes one input to a policy over all your PRs.

The issue class is not evenly distributed, which is why it belongs on the dial. CodeRabbit's analysis of 470 open-source pull requests found that AI-authored code concentrated its failures in specific categories: "The bots created more logic and correctness errors (1.75x), more code quality and maintainability errors (1.64x), more security findings (1.57x), and more performance issues (1.42x)" ([Thomas Claburn, The Register: State of AI vs. Human Code Generation Report](https://www.theregister.com/2025/12/17/ai_code_bugs/)). Logic and security are the hot zones. A change that touches them earns depth the raw line count would never justify.

When you see these signals, set depth accordingly:

| When the diff touches... | Blast radius | Review depth |
| --- | --- | --- |
| Auth, payments, permissions, data deletion | High — a bug is a security or money incident | Deep: verify forward from spec, run the code, adversarial fresh-context review |
| Core business logic, shared libraries | High — the 1.75x logic-error zone | Deep: read tests as claims, exercise the risky path |
| Internal tooling, dashboards, isolated features | Low — a bug is an annoyance | Shallow: skim the diff, trust the build, spot-check |
| Generated code, formatting, config | Low, but check *what* config | Shallow — unless it's a secret, a feature flag, or an infra setting |

What sets the blast radius in the first place is how the task was scoped — a task confined to one layer has a smaller radius than one that reaches across auth, data, and UI at once, which is the whole argument of the [companion post on sizing tasks](/blog/how-to-size-tasks-for-ai-coding-agents/). Size the task well and you shrink the radius before the agent writes a line; then this move just reads the radius the scoping already set.

And the depth you spend should be spent on the outcome, not the agent's process. "It's often better to grade what the agent produced, not the path it took" ([Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)). A deep review of a high-blast-radius change means running the code and checking the result against the spec — not admiring how the agent got there.

---

## The Per-Task Verification Checklist

Run every agent diff through the six moves above, in order, before you approve it. Each move is earned by the one before it: you distrust the self-report *because* the bottleneck moved to you; you hunt the unbuilt feature *because* the self-report and the tests can't reveal it. The table is the compression of the whole framework — one row per move.

| # | Move | What you actually do |
| --- | --- | --- |
| 1 | **Bottleneck moved** | Budget review as your throughput ceiling; measure releases-per-week, not diffs-per-week. |
| 2 | **Self-report is worthless** | Refuse "looks done." Demand the command, output, or screenshot, and let a fresh grader check it. |
| 3 | **Tests are a claim** | Read the test file as the agent's interpretation of the task; distrust green, compare assertions to the spec. |
| 4 | **Verify forward from spec** | Walk each acceptance criterion and ask "was this built?" — hunt the 30-40% that leaves no diff. |
| 5 | **Scope diff** | Flag anything added beyond the ask as its own failure class; unrequested code is surviving debt. |
| 6 | **Blast radius, not size** | Set depth by issue class and blast radius — deep on auth/payments/logic, shallow on isolated low-risk. |

The through-line across all six is one artifact: the reported-complete PR. Its green build is the self-report you reject (move 2), its test file is the claim you read (move 3), its spec is what you verify forward from (move 4), its additions are the scope you flag (move 5), and what it touches sets how hard you look (move 6). "Complete" is where the review starts, not where it ends.

---

## References

### Research and Data

1. [LogRocket (Ikeh Akinyemi): Why AI coding tools shift the real bottleneck to review](https://blog.logrocket.com/ai-coding-tools-shift-bottleneck-to-review/) — Faros AI data: PR volume up 98%, review time up 91%; adopting agents without restructuring review yields slower releases.
2. [Hassan et al.: Agentic Software Engineering — Foundational Pillars and a Research Roadmap](https://arxiv.org/html/2509.06216v1) — The "speed vs. trust" gap; true GPT-4 solve rates fell from 12.47% to 3.97% after manual audits.
3. [Berkeley RDI (Wang, Mang, Cheung, Sen, Song): How We Broke Top AI Agent Benchmarks](https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont/) — All eight audited benchmarks exploitable to near-perfect scores without solving a task; the 10-line conftest.py exploit.
4. [Anthropic (Gian Segato): Quantifying infrastructure noise in agentic coding evals](https://www.anthropic.com/engineering/infrastructure-noise) — Configuration alone moves scores more than the margins between top models; small reported leads are noise.
5. [Haque, Ingale, Csallner: Do Autonomous Agents Contribute Test Code?](https://arxiv.org/abs/2601.03556) — Test-containing agentic PRs are more common over time but merge rates remain largely similar; test presence is a signal, not a guarantee.
6. [Gong, Pinna, Bian, Zhang: Analyzing Message-Code Inconsistency in AI Coding Agent-Authored Pull Requests](https://arxiv.org/abs/2601.04886) — "Descriptions claim unimplemented changes" was the most common inconsistency (45.4%); high-MCI PRs had 51.7% lower acceptance rates.
7. [Liu et al.: Debt Behind the AI Boom — A Large-Scale Empirical Study of AI-Generated Code in the Wild](https://arxiv.org/abs/2603.28592) — 22.7% of tracked AI-introduced issues still survive at the latest repository version.
8. [GitClear: AI Copilot Code Quality 2025 Research](https://www.gitclear.com/ai_assistant_code_quality_2025_research) — Cloned lines rose from 8.3% to 12.3%; refactoring-associated changes sank from 25% to under 10% in 2024.
9. [Thomas Claburn, The Register: State of AI vs. Human Code Generation Report](https://www.theregister.com/2025/12/17/ai_code_bugs/) — Across 470 PRs, AI code produced 1.75x logic errors, 1.64x maintainability errors, 1.57x security findings, 1.42x performance issues.

### Practitioner Guidance

10. [Anthropic: Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) — Claude stops when work "looks done"; show evidence not assertion; a fresh model grades so the worker isn't its own examiner.
11. [Anthropic (Grace, Hadfield, Olivares, De Jonghe): Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) — Do not take scores at face value until someone reads transcripts; grade what the agent produced, not the path it took.
12. [Teemu Piirainen: How I Validate Quality When AI Agents Write My Code](https://dev.to/teppana88/how-i-validate-quality-when-ai-agents-write-my-code-481c) — Don't let the same agent write and verify; that's students grading their own exams.
13. [Simon Willison: Agentic manual testing](https://simonwillison.net/guides/agentic-engineering-patterns/agentic-manual-testing/) — Passing tests don't mean code works as intended; never assume LLM code works until it's been executed.
14. [Brad Kinnard: AI Coding Agents Can Verify Some of Their Work Now. Here's What They Still Miss.](https://dev.to/moonrunnerkc/ai-coding-agents-can-verify-some-of-their-work-now-heres-what-they-still-miss-58mc) — "Build passes" and "production-ready" are different bars.
15. [LoadSys (Lee Forkenbrock): How to Verify What Your AI Coding Agent Actually Built](https://www.loadsys.com/blog/agentic-context-engineering-verification-practice/) — Structured verification found 30-40% of the spec unimplemented after "complete"; verify forward from the spec because missing features leave no diff.
16. [Sean Goedecke: If you are good at code review, you will be good at using AI agents](https://www.seangoedecke.com/ai-agents-and-code-review/) — The biggest review mistake is thinking only about the code that was written, not the code that could have been written.
17. [Hamel Husain and Shreya Shankar: LLM Evals — Everything You Need to Know](https://hamel.dev/blog/posts/evals-faq/) — Good scores on generic metrics don't mean your system works.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"Measure releases-per-week, not diffs-per-week"** — Follows from LogRocket's 98%/91% volume-vs-review-time finding and the audit-gap collapse (12.47% to 3.97%): if the reviewer is the bottleneck, the throughput metric that matters is the one downstream of the reviewer.
- **"A single green build is a thin, gameable signal"** — Derived from Berkeley RDI (benchmark pass-signals exploitable without solving tasks) and Anthropic infrastructure noise (small reported margins are within noise); a lone unaudited "build passes" is low-information for the same structural reason.

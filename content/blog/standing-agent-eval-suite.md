---
title: "Diff Review Can't See Your Agent Regress. A Standing Suite Can."
date: 2026-10-05
draft: false
pillar: evals-verification
author: "John Young"
description: "Per-diff review checks one PR, not whether your coding agent still works. How to run AI agent regression testing as a standing eval suite: triggers, tiers, owners."
keywords: [ai agent regression testing, agent evals, continuous evaluation, regression suite, eval ownership]
tldr:
  - "Per-diff review only proves one PR looked right; it can't answer whether your coding agent still does everything it did last quarter, and the vendor and model-alias changes that break it hardest often produce no diff to review at all."
  - "The fix is a standing suite triggered on every agent-system change (prompts, harness, model alias) plus a nightly cron for the vendor-side changes you'll never see, with capability and regression run as separate suites so a new capability gain can't hide a lost regression behind one blended number."
  - "No eval suite predicts failures in advance, so every miss has to run through an intake process that turns it into a new regression case, and that case needs a named owner or it gets quietly loosened away the next time someone \"fixes\" a flake."
---
{{< eli5 hint="no background needed · 10 min" audience="for readers outside AI engineering" >}}
This is about why approving every individual update to an AI coding assistant can still leave you blind to the assistant quietly getting worse overall, and what a team should run instead.

## The big idea

Imagine a restaurant where a manager tastes each dish the moment a cook plates it, to check that specific plate looks right. That tells you today's dish was made correctly. It tells you nothing about whether the kitchen could still make every dish on the menu as well as it did last month, especially if the oven's temperature has quietly drifted or a supplier swapped an ingredient without telling anyone. To know that, someone has to periodically cook through the whole menu and taste everything, on a schedule, whether or not anyone changed a recipe that week.

Reviewing each update to a coding AI is the first kind of check. It tells a team that one change looked fine to the person who read it. It does not tell them whether the AI still does everything it used to do. That second question needs a different kind of check: a standing test suite that runs on its own schedule and checks the whole system, not just the latest change.

## One change at a time isn't the same as the whole system

A real example from the research: under the exact same model name, the share of code one AI produced that could run without any edits dropped from about half the time to about one in ten, over just a few months. Nobody edited any code to cause that; the likely cause was that a newer version of the AI started tacking extra text onto its answers. Nobody could have caught that by reviewing individual updates, because there was no update to review. The problem was easy to miss precisely because the generated code sits inside a larger pipeline, and an AI coding assistant is exactly that kind of pipeline.

Ordinary software ran into the same wall before AI entered the picture. At one point, more than 80% of the pushes to one of Google's production systems caused bugs that affected real users and had to be undone. The fix wasn't reading each change more carefully. It was requiring tests that run constantly, on every change. That cut emergency fixes in half within a year. AI systems make the gap worse, because they can change behavior with no code change at all for a person to even look at.

## Trigger the check on every kind of change, not just swapping the AI model

Most teams only think to rerun their checks when they switch to a different AI model. But there are at least four kinds of change that can shift behavior: editing the instructions file the AI reads, changing its toolset, the AI company quietly pointing a "latest version" label at something new, and the AI company changing something on their own servers that a customer never sees at all. The last two never produce anything for a reviewer to look at, the same way a drifting oven temperature never shows up as a memo on anyone's desk.

A real incident backs this up: during a stretch in 2025, a server-side problem at an AI provider affected a meaningful share of requests, and the company's own checks at the time didn't catch the degradation users were already reporting. The fix is running two kinds of checks side by side: ones that fire automatically the moment specific files (like the instructions file or the toolset) change, and a separate check that runs every night against the live system regardless of whether anything visibly changed, because that nightly run is the only thing that will ever catch the vendor-side kind of problem.

## Keep two separate scorecards, not one blended number

Suppose the AI gains a new ability, say, writing database updates, and the team adds tests for that new ability. The overall pass rate can rise at the very moment something else quietly breaks, because a single blended number lets a new win hide a lost ability. The source gives a concrete bad-versus-good comparison: saying "the score went from 81% to 84%, ship it" hides the fact that one older, already-working test started failing the same week. The better version reports two separate numbers: how the new, still-developing ability is progressing (expected to start weak and climb, that's normal), and whether everything the AI already could do still works (expected to stay at or near 100%, because any drop there means something broke).

A test for a new ability should only graduate into the "must still work" pile once it passes reliably across repeated tries, not the first week it happens to pass. And a "must still work" scorecard sitting at 100% isn't pointless, but it also isn't telling you the AI is getting better, only that it hasn't visibly broken yet. Those are different pieces of information, and the source is explicit that conflating them is the mistake.

## Not every check needs to run constantly, cost and stakes should decide the schedule

Running every test on every single change is possible but expensive. The fix is tiering: cheap, simple, yes-or-no checks run on every change, because they cost almost nothing. Slow, expensive checks that need the AI to actually attempt a full task against a real system run overnight or just before a release. Tests that always pass no matter what get made harder or retired, because an always-passing test is paying money for zero information. And tests that fail for unrelated, random reasons (flaky tests) lose people's trust fast; Google found that once a test's random-failure rate crept toward just 1%, people stopped believing its results and started ignoring them, and on bad days more than 50 changes slipped past ignored test failures.

The dollar amounts matter too: one full run of a well-known AI coding benchmark, at a modest per-task cost, could run into the thousands of dollars. That's expensive enough that these runs rarely happen more than once, which is also why AI test results are rarely reported with any sense of how much they'd vary from one run to the next.

## When something slips through, turn it into a permanent test, but don't expect that to predict the next new failure

One illustrative incident: the AI reported that a database change's tests passed, but the "undo" step for that change had never been written, and no existing test had ever checked for an undo step, so the AI's self-report was technically accurate. No test written in advance would have caught it.

A real study of one company's AI system over eight weeks found a precise version of this limit: looking back at 15 incidents, the team's safety checks had caught exactly none of them ahead of time, but once added as permanent tests after the fact, caught 87% of repeats. In 12 of the 15, the root cause was something nobody had thought to check for at all. Most silent failures were ultimately caught by a person actually reading the output, not by any automated test. This is one company's data, so the exact percentages won't hold everywhere, but the shape of the finding is the real point, and the author sums it up as: these checks are built to catch failures you've already had, not to predict new ones. That's why the recommendation is to keep a human regularly looking at real output, on top of running tests.

The practical version: decide in advance what counts as an incident worth turning into a permanent test (something user-visible that shipped broken, any kind of data loss, a human having to manually intervene or revert, a task that ran way over its time or budget, or the AI claiming success when it wasn't true). Then for each one: reproduce it, shrink it to the smallest version that still shows the problem, add it as a permanent check, note which incident it came from, and confirm the check actually fails on the old broken version and passes once it's fixed.

## The test suite itself needs an owner, or it quietly rots

In one illustrative example, a test started occasionally failing for an unrelated reason (a database connection timing out), and whoever fixed that flakiness also deleted the exact part of the check that would have caught the real earlier bug. The fix was approved as a routine flake fix. Nobody who actually understood what that check was protecting saw the change, because nobody specifically owned it.

The fix is splitting ownership on purpose: whoever runs the testing infrastructure owns the plumbing, but whoever owns a piece of real behavior, like database migrations, owns the test for that behavior and decides what "correct" means inside it. And every change to the tests themselves should go through the same kind of review as a change to a database's structure: proposed and reviewed openly, never edited quietly. Even well-funded measurement efforts drift over time as cases get added, removed, and updated, which is a reminder that a test suite isn't a one-time setup, it's something that needs ongoing care like a living document.

## Build it early, while the requirements are still fresh

Early on, what a feature is supposed to do is written down somewhere recent, so writing a test for it takes an afternoon. Wait six months, and writing the same test means digging through old changes to work out what the AI was ever actually supposed to do. One real team started late, after their AI assistant was already widely used, and still managed to build a working test system, it just took about a quarter of work. So later is harder, not impossible, and the source is careful that this is about difficulty rising, not some fixed law that costs always compound; some teams reasonably wait to build this until they're at a bigger scale. Other guidance is stricter, naming "wait until after you ship to add any tests at all" as a mistake to avoid outright.

## What this means for you

If you're responsible for a coding AI (or anything similar) in production, approving each change as it comes in is necessary but not sufficient. You also need a separate, standing set of tests that runs on its own schedule, checks the whole system (not just the latest diff), keeps "is it still doing what it used to do" separate from "is it getting better at new things," is priced and scheduled by how expensive and how risky each test is, grows from real incidents rather than only from guesses made in advance, and has a specific person responsible for each part of it. Build that system early, because it only gets harder to build the longer you wait.

---

**The technical terms, in plain words**
- diff / diff review = reviewing one specific proposed change before it's accepted, like proofreading one memo rather than auditing the whole department.
- coding agent = an AI system that writes and modifies code on its own, not just suggests a line.
- regression suite / regression eval = a set of tests checking that things the system already could do still work; should stay near-perfect.
- capability suite / capability eval = a set of tests checking new, still-developing abilities; expected to start weak and improve over time.
- pass rate = the percentage of tests that succeeded.
- CLAUDE.md = a plain-text instructions file the AI reads to learn a team's preferences and rules.
- harness = the surrounding toolset and setup the AI runs inside (which tools it can call, how it's wired up), separate from the AI model itself.
- model alias / snapshot = a label (like "latest") that points to a specific version of an AI model; the label can silently start pointing to a newer version.
- CI/CD = automated systems that run checks every time code changes, before and after it's merged.
- path-filtered check = a test that only runs automatically when specific files change.
- nightly cron = a check that runs automatically every night on a fixed schedule, regardless of whether anything changed.
- saturated eval = a test that always passes and so has stopped providing useful information.
- flaky test = a test that sometimes fails for reasons unrelated to any real problem, eroding trust in its results.
- trials = how many times a test is repeated, used to tell a real failure from random noise.
- intake = the process of turning a real incident or failure into a new permanent test.
- postmortem / incident = a formal review of something that went wrong, done to learn from it and prevent repeats.
- suite version = a version number for the whole set of tests, so results from different points in time can be compared fairly.
- LLM-as-judge = using one AI to grade the output of another AI, instead of a fixed yes/no rule.
- self-report = the AI's own claim about whether it succeeded, which can be technically true while still missing the real problem.
- golden baseline / golden set = the reference answer or expected result a test compares the AI's output against.

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}

Every PR to your coding agent last quarter passed review, and none of those reviews could have caught what Chen, Zaharia, and Zou measured. Under the same model name, GPT-4's directly executable code rate fell from 52% to 10% between March and June 2023, with no diff to review ([Chen, Zaharia, Zou: How is ChatGPT's behavior changing over time?](https://arxiv.org/abs/2307.09009)). The likely cause was mundane (the June version added non-code text to its generations). The authors also name why it hurts: a formatting shift like that is hard to detect when generated code sits inside a larger software pipeline. Your coding agent is that pipeline, and per-diff review was never built to see it move.

---

## Diff Review Checks the PR, Not the System

A quarter of green reviews is evidence that each change looked right to the person who read it. It is not evidence that the agent still does everything it did in June. The [per-diff reviewer's framework](/blog/evaluating-ai-coding-agent-output/) is deliberately scoped to one diff, because the next question needs a different instrument. Anthropic names that instrument. A regression eval asks, "Does the agent still handle all the tasks it used to?" and should hold a nearly 100% pass rate ([Anthropic Engineering: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)).

Here is one quarter of change log for one team's coding agent. It recurs through the rest of the post.

> **Author's judgment.** This change log is an illustrative composite, not one real team's history. CL-2, CL-3, and CL-4 are modeled on sourced events, cited in the trigger section; the other entries are typical of the agent-system changes the sources describe.

```text {title="Q3 change log, one team's coding agent (illustrative)"}
CL-1  Jul 08  CLAUDE.md: add "prefer the repo's test helpers in tests/helpers/"  review: approved
CL-2  Jul 22  harness: add a code-search subagent to the agent's tools          review: approved
CL-3  Aug 05  config: model alias silently resolves to a newer snapshot        review: none, no diff
CL-4  Aug 19  vendor: serving-side change at the model provider                review: none, no diff
CL-5  Sep 02  capability: the agent now writes database migrations             review: approved
CL-6  Sep 16  incident: PR #2214 reported "tests pass"; rollback never written  review: approved
CL-7  Sep 23  evals: loosen the golden baseline on a flaky migration case      review: approved
```

Read it the way the reviewers did and nothing is wrong. CL-1 is reasonable context engineering, CL-2 adds a tool, CL-5 ships a feature, and CL-7 fixes a flaky test. CL-3 and CL-4 never produced a diff, so review on them was trivially green. CL-6 is the only entry that looks like a failure, and it shipped through review too; a reviewer caught the missing rollback days later. **The question none of those reviews could answer is therefore: does the agent still handle everything it handled last month?**

Google hit the same wall with ordinary software. At one point, more than 80% of Google Web Server production pushes contained user-affecting bugs that had to be rolled back. The fix was not a sharper reading of each change. It was a policy that all new code changes include tests and that those tests run continuously. Within a year, emergency pushes dropped by half ([Software Engineering at Google: Testing Overview](https://abseil.io/resources/swe-book/html/ch11.html)).

Learned systems widen the gap. Sculley and colleagues argued that unit and end-to-end tests are valuable, "but in the face of a changing world such tests are not sufficient to provide evidence that a system is working as intended" ([Sculley et al.: Hidden Technical Debt in Machine Learning Systems](https://proceedings.neurips.cc/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf)). Google's ML Test Score separates a system that worked at launch from one that keeps working. It awards full credit for a test only when a system runs it automatically on a repeated basis ([Breck et al.: The ML Test Score](https://research.google.com/pubs/archive/aad9f93b86b7addfea4c419b9100c6cdd26cacea.pdf)). OpenAI's cookbook on multi-agent systems compresses the split:

> The core lesson is simple: agent-level evals tell us which local behaviors look risky, while macro evals tell us what those risks become at system scale.
> — [OpenAI Cookbook: Macro Evals for Agentic Systems](https://developers.openai.com/cookbook/examples/partners/macro_evals_for_agentic_systems/macro_evals_for_agentic_systems)

Per-diff review is the agent-level eval of your engineering process. The rest of this post builds the system-level one.

---

## Trigger on Changes Nobody Diffs

The standard advice is to rerun your evals when you swap models, which covers one row of the change log out of seven. Wire the suite to every change to the agent system: prompt and CLAUDE.md, harness and tools, model alias or version. Then add a scheduled run for the vendor-side changes you will never see a diff for. OpenAI's guidance is to "Set up continuous evaluation (CE) to run evals on every change" ([OpenAI: Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)). Anthropic puts automated evals in CI/CD, "running on each agent change and model upgrade as the first line of defense against quality problems" ([Anthropic Engineering: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)).

| Change type | Why it moves behavior | Trigger mechanism | Log entry |
| --- | --- | --- | --- |
| CLAUDE.md or prompt edit | Context files raise inference cost by over 20% with no general success gain ([Gloaguen et al.](https://arxiv.org/abs/2602.11988)) | Path-filtered CI on `CLAUDE.md`, `.claude/**` | CL-1 |
| Harness or tool change | One added search subagent flipped a model ranking ([Zhang et al.](https://arxiv.org/abs/2605.23950)) | Path-filtered CI on `harness/**` | CL-2 |
| Model alias resolution | A `-latest` alias updates whenever the vendor publishes a new version ([OpenRouter](https://openrouter.ai/blog/tutorials/ai-agent-regression-testing-after-a-prompt-or-model-change/)) | Pin check: fail when the resolved snapshot differs from the last green run | CL-3 |
| Vendor serving change | No diff exists on your side at all ([Anthropic postmortem](https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues)) | Nightly cron against the live endpoint | CL-4 |

CL-1 looks like documentation, but it is [configuration that changes behavior](/blog/claude-md-instruction-ceiling/). Gloaguen and colleagues found that "providing context files does not generally improve task success rates, while increasing inference cost by over 20% on average" ([Gloaguen et al.: Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988)). The old ML-systems rule applies: configurations "should undergo a full code review and be checked into a repository" ([Sculley et al.: Hidden Technical Debt in Machine Learning Systems](https://proceedings.neurips.cc/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf)). Review is half of it; the other half is a test run. One Google team found that running temporary environments on presubmit "prevented 95% of broken servers from bad configuration" ([Software Engineering at Google: Continuous Integration](https://abseil.io/resources/swe-book/html/ch23.html)).

CL-2 is a [harness change](/blog/agent-harness-audit/), and one tool can be a model-upgrade-sized event. Zhang and colleagues report that adding the WarpGrep search subagent on identical infrastructure "adds 2.1 to 2.2 points across models, comparable to a routine model upgrade and sufficient to flip the MiniMax 2.5 vs Claude Opus 4.6 ordering" ([Zhang et al.: Stop Comparing LLM Agents Without Disclosing the Harness](https://arxiv.org/abs/2605.23950)). The broader harness-versus-model variance numbers live in the [leaderboard noise post](/blog/coding-agent-leaderboard-noise/).

CL-3 and CL-4 matter most, because nothing in your repository changes. An alias like OpenRouter's `~anthropic/claude-fable-latest` "updates whenever the author publishes a new version" ([OpenRouter: AI Agent Regression Testing After a Prompt or Model Change](https://openrouter.ai/blog/tutorials/ai-agent-regression-testing-after-a-prompt-or-model-change/)). Serving changes leave you nothing to pin at all. In the August to early September 2025 incidents Anthropic's postmortem describes, 16% of Sonnet 4 requests were affected in the worst hour. Approximately 30% of Claude Code users who made requests during the period had at least one message routed to the wrong server type ([Anthropic Engineering: A postmortem of three recent issues](https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues)).

> These issues exposed critical gaps that we should have identified earlier. The evaluations we ran simply didn't capture the degradation users were reporting...
> — [Anthropic Engineering: A postmortem of three recent issues](https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues)

Their remedy is the last row of the table: run evaluations "continuously on true production systems." The wiring:

- **Path-filter the agent's own files.** Trigger the per-change tier on `CLAUDE.md`, `.claude/**`, `harness/**`, and the model config, not only on application code.
- **Pin the alias and check it.** Record the concrete snapshot every green run used, and fail CI when the alias resolves to something new.
- **Schedule a nightly run.** The cron is the only trigger CL-4 will ever fire.
- **Keep both.** Autonoma's Tom Piaggio names the failure on each side. Path-filtered only, "a silent model swap goes unnoticed"; nightly only, a bad prompt edit sits "for up to 24 hours before anyone finds out" ([Autonoma: Agent Regression Testing](https://getautonoma.com/blog/agent-regression-testing)).

---

## Run Capability and Regression as Two Suites

CL-5 is where a single pass rate starts lying. The agent now writes database migrations, the team adds migration cases, and the headline number rises while something else quietly breaks. Keep two suites with opposite targets. Capability evals "should start at a low pass rate, targeting tasks the agent struggles with," while regression evals should have "a nearly 100% pass rate" ([Anthropic Engineering: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)).

The numbers below are illustrative, for the week CL-5 merged:

**Bad:** "Agent eval pass rate went from 81% to 84% after CL-5. Migrations work now. Ship it."

**Good:** "Capability, migrations: 3/12 to 5/12, still climbing. Regression: 150/150 to 149/150, with `reg/handler-error-mapping-422` failing since CL-5. Block on the regression case; the migration gain ships with it, not instead of it."

The blended number averages a new win against a lost behavior, and a lost behavior is the one thing a regression suite exists to refuse. Capability at 5/12 says the migration work is real and unfinished, which is the normal state of a capability suite. Regression at 149/150 says the change cost the agent something it already had.

Cases move between the suites on purpose:

> After an agent is launched and optimized, capability evals with high pass rates can 'graduate' to become a regression suite that is run continuously to catch any drift.
> — [Anthropic Engineering: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

Note the "can" and the "after." A migration case graduates once it passes reliably across trials, not the first week it goes green. Anthropic is explicit about what a regression suite at 100% buys you: "An eval at 100% tracks regressions but provides no signal for improvement" ([Anthropic Engineering: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)). Traffic also runs the other way. The macro-evals cookbook recommends that teams "promote the clearest lower-level eval failures into a regression suite" ([OpenAI Cookbook: Macro Evals for Agentic Systems](https://developers.openai.com/cookbook/examples/partners/macro_evals_for_agentic_systems/macro_evals_for_agentic_systems)), which is the intake path two sections down.

---

## Tier Each Eval by Cost and Stakes

Running every eval on every change is a footgun with a bill attached. Give each eval its own cadence from three inputs: what it costs to run, whether it is saturated, and what a miss costs.

> Weigh the cost and how saturated the eval is against the business value of catching the error.
> — [Hamel Husain, Shreya Shankar: Q: How often should I run my evals?](https://hamel.dev/blog/posts/evals-faq/how-often-should-i-run-my-evals.html)

Their example table spans the range. A cheap code assertion runs "on every change b/c its incredibly cheap," and a mid-cost judge runs "somewhat frequently (e.g. nightly)." An expensive high-stakes judge runs "prior to each release," and a saturated one is retired or run every two weeks. For the per-change tier they are blunter: "Favor assertions or other deterministic checks over LLM-as-judge evaluators" ([Hamel Husain, Shreya Shankar: Q: How are evaluations used differently in CI/CD vs. monitoring production?](https://hamel.dev/blog/posts/evals-faq/how-are-evaluations-used-differently-in-cicd-vs-monitoring-production.html)). Google's CI chapter draws the same split: "CI should optimize quicker, more reliable tests on presubmit and slower, less deterministic tests on post-submit" ([Software Engineering at Google: Continuous Integration](https://abseil.io/resources/swe-book/html/ch23.html)).

Here is the change-log team's suite as a manifest, each eval declaring its inputs and resulting tier, plus the CI wiring that reads it:

```yaml {title="evals.yaml"}
suite_version: 2026.09.3
evals:
  - id: reg/handler-error-mapping-422
    suite: regression
    kind: code_assertion          # deterministic, no model call
    cost_per_run_usd: 0.02
    trials: 1
    stakes: high
    pass_rate_30d: 1.00
    owner: payments-api
    tier: per_change

  - id: reg/repo-wide-agent-run
    suite: regression
    kind: agent_run               # full task, real repo, live model endpoint
    cost_per_run_usd: 3.80
    trials: 5
    stakes: high
    pass_rate_30d: 0.98
    owner: eval-platform
    tier: nightly                 # the run that catches CL-4

  - id: cap/migrations/reversible-migration
    suite: capability
    kind: agent_run
    cost_per_run_usd: 4.10
    trials: 5
    stakes: high
    pass_rate_30d: 0.42
    owner: data-platform
    tier: nightly

  - id: reg/pr-description-tone-judge
    suite: regression
    kind: llm_judge
    cost_per_run_usd: 0.60
    trials: 3
    stakes: low
    pass_rate_30d: 1.00
    saturated: true               # harden first, then retire
    owner: devex
    tier: harden_then_retire
```

```yaml {title=".github/workflows/agent-evals.yml (excerpt)"}
on:
  pull_request:
    paths: ["CLAUDE.md", ".claude/**", "harness/**", "agent.config.yaml", "evals/**"]
  schedule:
    - cron: "0 3 * * *"
jobs:
  per-change:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./scripts/run-evals.sh --tier per_change
  nightly:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./scripts/run-evals.sh --tier nightly --record-suite-version
```

The path filter from the trigger section fires only the cheap tier, so CL-1 and CL-2 pay cents per PR. Multi-trial agent runs wait for the cron, and the nightly `reg/repo-wide-agent-run` against the live endpoint is what catches CL-4, the change no PR ever touched. Where the checker runs and why an LLM judge stays off the blocking gate are covered in the [done-criteria post](/blog/agent-done-criteria-predicates/).

If you want the tiering done for you, [eval-cadence](https://github.com/johnayoung/agent-engineering-toolkit) reads a manifest like this one. It prices every eval's full run against your daily budget, flags evals that are unowned, flaky, saturated or in the wrong tier, and writes the workflow above from the manifest.

Saturated evals get one more step before retiring: "you should first try to make the eval more difficult so its not saturated to begin with" ([Hamel Husain, Shreya Shankar: Q: How often should I run my evals?](https://hamel.dev/blog/posts/evals-faq/how-often-should-i-run-my-evals.html)). Flaky evals get no grace period. Google's testing chapter warns that "As you approach 1% flakiness, the tests begin to lose value" ([Software Engineering at Google: Testing Overview](https://abseil.io/resources/swe-book/html/ch11.html)). One Google team with flaky presubmits saw, on some days, more than 50 code changes bypass and ignore the test results ([Software Engineering at Google: Continuous Integration](https://abseil.io/resources/swe-book/html/ch23.html)). Multi-trial agent runs are noisy by construction, which is one more reason they belong in the nightly tier rather than on the PR.

### Price the Full Run Before You Schedule It

Put [a dollar figure](/blog/per-task-cost-attribution/) on one full multi-trial run, and let that number decide its tier instead of habit. Kapoor and colleagues priced one. SWE-Agent's authors set a cost limit of USD 4 per task, so the full benchmark "could cost over USD 8,000 for a single evaluation run" ([Kapoor et al.: AI Agents That Matter](https://arxiv.org/abs/2407.01502)). The consequence is the part that should worry you:

> The high cost makes it infeasible to run evaluations multiple times, and perhaps as a result, agent evaluations are rarely accompanied by error bars.
> — [Kapoor et al.: AI Agents That Matter](https://arxiv.org/abs/2407.01502)

The same group's Holistic Agent Leaderboard cost about $40,000 in total. It skipped one model on one benchmark because the team estimated that run alone at about $20,000 ([Kapoor et al.: Holistic Agent Leaderboard](https://arxiv.org/abs/2510.11977)). Your suite is smaller, but the arithmetic has the same shape.

| When you see | It means | Do this |
| --- | --- | --- |
| One full multi-trial run costs more than a day of eval budget | It cannot run per change | Tier it nightly or pre-release; keep deterministic checks on the PR |
| A pass rate from a single trial | You cannot tell a regression from noise | Set `trials` in the manifest, or stop early with sequential testing, which AgentAssay reports cuts trials by 78% ([Bhardwaj: AgentAssay](https://arxiv.org/abs/2603.02601)) |
| An expensive judge sitting at 100% | You are paying for zero information | Harden it; if it stays saturated, retire it or run it biweekly |
| A cheap deterministic check stuck in the nightly tier | You are delaying a signal you could have per PR | Promote it to `per_change` |

---

## Route Every Failure Through Intake

CL-6 is what a miss looks like. The agent reported "tests pass" on PR #2214, `Add refund_reason column to payments`, and the migration's rollback step was never written. No test exercised `migrate down`, so the [self-report](/blog/agent-done-criteria-predicates/) was technically true. No case written in advance would have flagged it, and that is not a gap you close by writing more cases up front.

Wei Wu's eight-week study of one production agent runtime makes the limit precise. Of 22 incidents with full root-cause postmortems, the team audited 15 retrospectively. Ex-ante prevention was 0 of 15 (0%), and ex-post regression blocking was 13 of 15 (87%). In 12 of 15 (80%), the root cause of the miss was "a dimension the audit had never conceived." Roughly 70% of silent failures were caught by human user-view observation of system output, "not by unit tests, health checks, or governance audits" ([Wei Wu: When Errors Become Narratives](https://arxiv.org/abs/2606.14589)). One runtime, so the frequencies don't generalize, but the shape does. In Wu's own phrase, **"audits are regression engines, not prediction engines."** The suite blocks failures you already had and predicts none of the new ones. So keep humans watching output (Wu's team made it a weekly 30-minute observation ritual, no coding allowed), and run every miss through intake.

> Unless we have some formalized process of learning from these incidents in place, they may recur ad infinitum.
> — [Google SRE Book: Postmortem Culture: Learning from Failure](https://sre.google/sre-book/postmortem-culture/)

The SRE book adds the step most teams skip: "define postmortem criteria before an incident occurs so that everyone knows when a postmortem is necessary." Adapted from its trigger list, set these now:

- **User-visible degradation.** An agent PR shipped a defect that a reviewer or user found after merge. CL-6 qualifies.
- **Data loss of any kind.** A migration, deletion, or overwrite the agent wrote or ran incorrectly.
- **Human intervention.** Someone reverted an agent PR or took a task back by hand.
- **Resolution time over threshold.** An agent task ran past its time or token budget.
- **Monitoring failure.** The agent's self-report said done and a human found otherwise. The SRE list notes this usually implies manual incident discovery, which is exactly how CL-6 surfaced.

Then convert each triggered incident into a case:

1. **Reproduce it from the trace.** The [trace schema post](/blog/agent-observability-trace-schema/) covers which fields make a run replayable.
2. **Minimize it.** Shrink to the smallest repo state and task that still produce the failure.
3. **Add it as a regression case** with a deterministic check: `reg/migrations/rollback-present` asserts every `up` migration has a `down` and that `migrate down` exits 0.
4. **Link the incident.** Put `incident: INC-0916` in the case metadata, so the next person to touch the case knows why it exists.
5. **Prove it bites.** Confirm the case fails on the pre-fix agent and passes on the fix before you merge it.

Anthropic says to "look at your bug tracker and support queue" and convert user-reported failures into test cases ([Anthropic Engineering: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)). Husain and Shankar say to "Always analyze after incidents, user complaint spikes, or metric drift" ([Hamel Husain, Shreya Shankar: Q: How often should I re-run error analysis?](https://hamel.dev/blog/posts/evals-faq/how-often-should-i-re-run-error-analysis-on-my-production-system.html)), then "add representative examples to your CI dataset. This mitigates regressions on new issues" ([Hamel Husain, Shreya Shankar: Q: How are evaluations used differently in CI/CD vs. monitoring production?](https://hamel.dev/blog/posts/evals-faq/how-are-evaluations-used-differently-in-cicd-vs-monitoring-production.html)). The practice predates LLMs. In Shankar's interview study, ML engineers "reported processes to analyze live failure modes and update the validation datasets." One described every failed prediction landing in a queue that three people worked through once a week ([Shankar et al.: Operationalizing Machine Learning](https://arxiv.org/abs/2209.09125)). OpenAI's improvement-loop cookbook calls it a flywheel: "Traces show what happened, feedback explains what mattered, evals make those expectations reusable" ([OpenAI Cookbook: Build an Agent Improvement Loop with Traces, Evals, and Codex](https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop)).

Without intake, incident reports are noise you can't attribute. Anthropic's postmortem admits that even as reports climbed, "we lacked a clear way to connect these to each of our recent changes" ([Anthropic Engineering: A postmortem of three recent issues](https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues)). A versioned suite with linked incidents is that connection.

---

## Name an Owner and Version the Suite

CL-7 is the suite regressing, not the agent. A week after CL-6 became `reg/migrations/rollback-present`, the case started flaking (the test database occasionally timed out on `migrate down`), and someone fixed it:

```diff {title="evals/regression/migrations/rollback-present.yaml (CL-7)"}
 id: reg/migrations/rollback-present
 incident: INC-0916
-check: every up has a down, and `migrate down` exits 0
+check: every up has a down
 trials: 3
-pass_threshold: 3/3
+pass_threshold: 2/3
```

The PR was approved as a flake fix. It also deleted the half of the check that would have caught PR #2214. Nobody who owned the migration behavior saw it, because nobody owned it.

Split ownership on purpose. Anthropic's version: "What proved most effective was establishing dedicated evals teams to own the core infrastructure, while domain experts and product teams contribute most eval tasks" ([Anthropic Engineering: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)). Shankar's interviews found that higher-stakes ML applications "created separate teams to manage the dynamic evaluation process." So did the opposite failure: "every engineer working on a particular model had a cloned version of the main evaluation notebook, with a few changes" ([Shankar et al.: Operationalizing Machine Learning](https://arxiv.org/abs/2209.09125)). The platform function owns the harness; the team that owns migrations owns `reg/migrations/rollback-present` and the definition of correct inside it. Then review every suite change the way Autonoma's practitioners do:

> The teams that keep this running treat the golden set the way they'd treat a schema migration: reviewed in a pull request, not edited silently.
> — [Autonoma: Agent Regression Testing](https://getautonoma.com/blog/agent-regression-testing)

| When a PR | Route it to | Record |
| --- | --- | --- |
| Edits a golden baseline or expected output | The case owner | Old and new baseline against the last 30 days of runs |
| Loosens a threshold or drops part of a check | The case owner and the linked incident's owner | Why the stricter check was wrong, not merely flaky |
| Changes a rubric or judge prompt | The behavior owner | A re-grade of a sample under the new rubric |
| Adds or removes cases | The case owner and the harness owner | A `suite_version` bump |
| Produces any eval run | Nobody; it is automatic | `suite_version` in the run output, so results compare like to like |

The suite drifts even where measurement is the whole job. METR's Time Horizon 1.1 grew from 170 to 228 tasks (73 added, 15 removed, 53 updated). METR found the trend "somewhat sensitive to task composition" ([METR: Time Horizon 1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/)). Criteria drift too: "users need criteria to grade outputs, but grading outputs helps users define criteria" ([Shankar et al.: Who Validates the Validators?](https://arxiv.org/abs/2404.12272)). That study is about individual graders, so extending it to a suite is an analogy. It still explains why Husain describes strong teams that "treat evaluation criteria as living documents" ([Hamel Husain: A Field Guide to Rapidly Improving AI Products](https://hamel.dev/blog/posts/field-guide/)). The ML Test Score names the golden-file version of the problem: such tests are hard to maintain over time without blindly updating the golden file ([Breck et al.: The ML Test Score](https://research.google.com/pubs/archive/aad9f93b86b7addfea4c419b9100c6cdd26cacea.pdf)). CL-7 is a blind update with a PR attached.

Tian Pan supplies the gate: "Make 'who reviewed the evals?' a release-gate question," and "Version the eval set and tie it to a date" ([Tian Pan: The Eval Suite That Became the Spec Nobody Agreed To](https://tianpan.co/blog/2026/05/17/eval-suite-became-spec-nobody-agreed-to)). Owning the suite also means owning where it lives. OpenAI's hosted Evals platform becomes read-only for existing users on October 31, 2026, and is scheduled to shut down on November 30, 2026 ([OpenAI: Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)).

---

## Start While Requirements Still Map to Cases

The cheapest time to build the suite is while product requirements still translate directly into test cases.

> Evals get harder to build the longer you wait. Early on, product requirements naturally translate into test cases. Wait too long and you're reverse-engineering success criteria from a live system.
> — [Anthropic Engineering: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)

Harder is not impossible. Anthropic's own late-start example is the Bolt AI team, which "started building evals later, after they already had a widely used agent." It still needed a quarter: "In 3 months, they built an eval system" ([Anthropic Engineering: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)). The same post concedes that some teams reasonably add evals only once they reach scale. So the claim here is about difficulty, not a compounding-cost law. OpenAI is less forgiving, listing "waiting until you ship before implementing any evals" under its vibe-based-evals anti-pattern ([OpenAI: Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices)).

The practical argument is about memory. Today, the team that added migration support can write `cap/migrations/reversible-migration` in an afternoon, because the requirement is still in a ticket. In six months, the same case means reading old PRs to work out whether the agent was ever supposed to write the `down` step. If you have no suite yet, build the first one from your own agent's real failures. The [leaderboard noise post](/blog/coding-agent-leaderboard-noise/) covers sizing it and the task, trial, and outcome vocabulary. Everything above is what keeps that first suite standing.

---

## The Standing Suite, Compressed

> **Author's judgment.** The "failure if skipped" column is my synthesis. Each cell follows from the sourced premises in its section, but no source states the row as written.

Use this as the charter for your suite: one row per section, the decision it forces, and what the change log looked like without it.

| Question | The move | Failure if skipped | Change-log entry |
| --- | --- | --- | --- |
| **Does the agent still work?** | Read per-diff review as evidence about one PR; answer the system question with a standing regression suite | A quarter of green reviews over a regressed agent | All seven |
| **When does it run?** | Path-filter agent config and harness, pin-check the alias, add a nightly cron | Changes with no diff land unseen | CL-1 to CL-4 |
| **What is in it?** | Capability suite climbs, regression suite holds; graduate cases deliberately | A blended rate hides a lost behavior behind a new win | CL-5 |
| **How often does each eval run?** | Tier by cost, saturation, and stakes; price the full run first | Either the bill kills the suite or the expensive runs never happen | CL-4, caught nightly |
| **How does it grow?** | Triggers set in advance; reproduce, minimize, add, link | The same failure recurs with nothing tying it to a change | CL-6 |
| **Who keeps it honest?** | Platform owns the harness, behavior owners own cases; review suite edits like schema migrations | The suite loosens quietly and a green run means less | CL-7 |
| **When do you start?** | Build it while requirements still map to cases | You reverse-engineer what correct meant from a live system | Your own system |

---

## References

### Research and Data

1. [Chen, Zaharia, Zou: How is ChatGPT's behavior changing over time?](https://arxiv.org/abs/2307.09009) — GPT-4's directly executable code rate fell from 52% in March to 10% in June 2023 under the same model name. Backs the hook and the vendor-change trigger.
2. [Sculley et al.: Hidden Technical Debt in Machine Learning Systems](https://proceedings.neurips.cc/paper/2015/file/86df7dcfd896fcaf2674f757a2463eba-Paper.pdf) — Component and end-to-end tests are not sufficient evidence a system works in a changing world, and configuration deserves full code review. Backs the system-level framing and the config trigger.
3. [Breck et al.: The ML Test Score](https://research.google.com/pubs/archive/aad9f93b86b7addfea4c419b9100c6cdd26cacea.pdf) — Full credit for a production ML test requires running it automatically on a repeated basis, and golden files decay through blind updates. Backs the system framing and the CL-7 drift rule.
4. [Gloaguen et al.: Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988) — Context files do not generally improve task success but raise inference cost by over 20% on average. Backs treating CLAUDE.md edits as eval triggers.
5. [Zhang et al.: Stop Comparing LLM Agents Without Disclosing the Harness](https://arxiv.org/abs/2605.23950) — Adding one search subagent moved scores 2.1 to 2.2 points and flipped a model ordering. Backs the harness-change trigger.
6. [Kapoor et al.: AI Agents That Matter](https://arxiv.org/abs/2407.01502) — At USD 4 per task, one full SWE-Agent benchmark run could cost over USD 8,000, so agent evals rarely carry error bars. Backs pricing the full run.
7. [Kapoor et al.: Holistic Agent Leaderboard](https://arxiv.org/abs/2510.11977) — The study cost about $40,000 in total and skipped one model-benchmark pair estimated at about $20,000. Supporting cost evidence.
8. [Bhardwaj: AgentAssay](https://arxiv.org/abs/2603.02601) — Sequential probability ratio testing reduced regression-test trials by 78% in this single-author preprint. Backs early stopping for multi-trial runs.
9. [Wei Wu: When Errors Become Narratives](https://arxiv.org/abs/2606.14589) — In one production agent runtime, an audit of 15 incidents showed 0% ex-ante prevention and 87% regression blocking, and about 70% of silent failures were caught by humans watching output. Backs the intake section.
10. [Shankar et al.: Operationalizing Machine Learning](https://arxiv.org/abs/2209.09125) — ML engineers fed live failures back into validation sets, and high-stakes teams created separate groups to own dynamic evaluation. Backs intake and ownership.
11. [Shankar et al.: Who Validates the Validators?](https://arxiv.org/abs/2404.12272) — Graders need criteria to grade outputs, but grading outputs reshapes the criteria. Backs criteria drift, by analogy to suites.
12. [METR: Time Horizon 1.1](https://metr.org/blog/2026-1-29-time-horizon-1-1/) — METR's suite went from 170 to 228 tasks (73 added, 15 removed, 53 updated), and the trend proved sensitive to task composition. Backs suite drift.

### Practitioner Guidance

13. [Anthropic Engineering: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) — Capability evals start low, regression evals hold near 100%, and high-pass capability evals can graduate into a continuously run regression suite. Also backs triggers, intake, ownership, and timing.
14. [Anthropic Engineering: A postmortem of three recent issues](https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues) — Serving-side bugs degraded Claude's responses and the evaluations Anthropic ran did not capture it. Backs the vendor-change trigger and intake.
15. [OpenAI: Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices) — Set up continuous evaluation to run evals on every change, and do not wait until you ship. Also the Evals platform shutdown dates.
16. [OpenAI Cookbook: Macro Evals for Agentic Systems](https://developers.openai.com/cookbook/examples/partners/macro_evals_for_agentic_systems/macro_evals_for_agentic_systems) — Agent-level evals show local risk; macro evals show what it becomes at system scale. Also backs promoting failures into a regression suite.
17. [OpenAI Cookbook: Build an Agent Improvement Loop with Traces, Evals, and Codex](https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop) — Traces, feedback, and evals form a loop that makes expectations reusable. Backs the intake flywheel.
18. [OpenRouter: AI Agent Regression Testing After a Prompt or Model Change](https://openrouter.ai/blog/tutorials/ai-agent-regression-testing-after-a-prompt-or-model-change/) — A "-latest" alias silently updates whenever the vendor publishes a new version. Backs the alias pin check.
19. [Autonoma: Agent Regression Testing](https://getautonoma.com/blog/agent-regression-testing) — Path-filtered and nightly runs each miss what the other catches, and golden sets should be reviewed like schema migrations. Backs triggers and suite review.
20. [Hamel Husain, Shreya Shankar: Q: How often should I run my evals?](https://hamel.dev/blog/posts/evals-faq/how-often-should-i-run-my-evals.html) — Weigh cost and saturation against the business value of catching the error, and harden a saturated eval before retiring it. Backs the tiering section.
21. [Hamel Husain, Shreya Shankar: Q: How are evaluations used differently in CI/CD vs. monitoring production?](https://hamel.dev/blog/posts/evals-faq/how-are-evaluations-used-differently-in-cicd-vs-monitoring-production.html) — CI suites favor deterministic checks, and new production failure patterns feed back into the CI dataset. Backs tiers and intake.
22. [Hamel Husain, Shreya Shankar: Q: How often should I re-run error analysis?](https://hamel.dev/blog/posts/evals-faq/how-often-should-i-re-run-error-analysis-on-my-production-system.html) — Always analyze after incidents, user complaint spikes, or metric drift. Backs intake triggers.
23. [Hamel Husain: A Field Guide to Rapidly Improving AI Products](https://hamel.dev/blog/posts/field-guide/) — Strong teams treat evaluation criteria as living documents. Backs criteria drift.
24. [Google SRE Book: Postmortem Culture: Learning from Failure](https://sre.google/sre-book/postmortem-culture/) — Without a formal process for learning from incidents, they recur; define postmortem criteria before the incident. Backs the intake triggers.
25. [Software Engineering at Google: Testing Overview](https://abseil.io/resources/swe-book/html/ch11.html) — Requiring tests on every change, run continuously, halved Google Web Server emergency pushes within a year. Also backs the 1% flakiness threshold.
26. [Software Engineering at Google: Continuous Integration](https://abseil.io/resources/swe-book/html/ch23.html) — Presubmit environment checks prevented 95% of broken servers from bad configuration, and fast reliable tests belong on presubmit. Backs triggers and tiers.
27. [Tian Pan: The Eval Suite That Became the Spec Nobody Agreed To](https://tianpan.co/blog/2026/05/17/eval-suite-became-spec-nobody-agreed-to) — Make "who reviewed the evals?" a release-gate question and version the eval set. Practitioner argument backing the ownership rule.
28. [agent-engineering-toolkit: eval-cadence](https://github.com/johnayoung/agent-engineering-toolkit) — A script that tiers each eval in an evals.yaml manifest by cost, saturation, and stakes against your own daily budget. It fails on unowned, flaky, or mis-tiered evals and emits the CI trigger config plus a one-page suite charter.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"The Q3 change log":** an illustrative composite; CL-2, CL-3, and CL-4 are modeled on the WarpGrep harness flip, OpenRouter's alias behavior, and Anthropic's September 2025 postmortem.
- **"Failure if skipped" in the compression table:** each cell follows from the sourced premises in its section (Google's GWS story, Anthropic's two-suite definitions, Husain and Shankar's cadence tradeoff, Wu's regression-engine finding, Autonoma and the ML Test Score on baseline review).

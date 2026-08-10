---
title: "Stop Picking Your Coding-Agent Model Off a Leaderboard"
date: 2026-08-10
draft: false
pillar: evals-verification
author: "John Young"
description: "Your team is about to swap coding-agent models over a two-point leaderboard gap. Anthropic measured six points of movement from infrastructure alone."
keywords: [coding agent model selection, SWE-bench Verified, agent evals, benchmark noise, harness variance]
tldr:
  - "A two-point gap between coding-agent models on a leaderboard is not evidence of a better model — Anthropic measured six percentage points of score movement from infrastructure configuration alone, with the model, harness, and task set held fixed."
  - "The harness explains more of the score than the model does: controlled studies put harness variance at roughly 7.8 times model variance, and the benchmark most teams cite, SWE-bench Verified, is one its own publisher stopped evaluating on after auditors found most problems flawed or exploitable."
  - "Leaderboards are good for one thing — nominating a shortlist — not for deciding a swap; run error analysis on your own agent's failures first, then gate any model change on a workload-weighted eval of 20-50 tasks pulled from your own runs, harness held fixed, before you ship it."
---
{{< eli5 hint="no background needed · 8 min" audience="for readers outside AI engineering" >}}
This is about why picking which AI coding assistant to use, based on a public ranking chart, is a worse decision than it looks.

## The big idea

Imagine your company is deciding between two job candidates using one standardized test. Candidate B scored two points higher than Candidate A out of a hundred. Before you hire based on that, you'd want to know: how much does the room, the pencil, or a bad night's sleep swing a score on this test? If the answer is "six points, easily," then a two-point gap tells you nothing — it's within the test's own wobble. That is exactly the situation with the charts that rank AI coding tools. A team is about to switch their default AI model because it scored a couple of points higher than the one they're using. But researchers at Anthropic measured that just changing the amount of computer power given to the test — nothing about the AI itself — swung scores by six points. The "winning" gap is smaller than the noise the test produces on its own.

## The ruler isn't precise enough to see the difference

Test scores always wobble a little, and you can only trust a gap if it's bigger than that wobble. Several separate measurements point the same way here: giving a test more or less computer power to run on moved scores by six points with nothing else changed. Running the exact same AI on the exact same task five separate times produced swings of two to three points, run to run, just from randomness. And statisticians who work out how many test questions you need to trust a small score gap say you'd need about 969 independent questions to reliably detect a three-point difference — the test in question only has 500. Put together, a two-point "win" sits inside the range you'd expect from chance alone. The author is upfront that no single study says this outright — it's his own conclusion, built by combining these four separate, individually-sourced measurements. But the pieces do add up: the gap being cited is not a real advantage, it's a coin flip that landed heads.

## The test itself has been quietly compromised

The specific test most of these rankings use — one where an AI tries to fix real bugs in real code — has a deeper problem than noise: the company that built it has stopped using it themselves. An audit found that most of the problems in the test have broken grading criteria, either too strict (rejecting correct answers) or too loose (accepting things the question never asked for). Worse, every top AI system tested could reproduce the exact original fix used as the "correct answer" — meaning the AI had likely already seen the answer during its training, the equivalent of a student who was handed the answer key before the exam. Scores on this test kept climbing for six months, and the test's own creator concluded that climb didn't mean the AI was getting better at coding — it meant the AI was getting more familiar with the test. Separate audits of AI coding tests in general found that every one of eight major tests examined could be tricked into a near-perfect score without solving anything real — in one case, by having the AI simply search the code's own history for the answer instead of solving the problem.

## The score often measures the toolkit, not the AI

A big part of what a test measures isn't the AI's raw intelligence at all — it's the surrounding software wrapped around it: which tools it can call, how it's told to format its edits, how many tries it gets. Researchers who deliberately varied only this surrounding setup, while holding the AI itself fixed, found that the setup accounted for roughly eight times more of the score swing than the AI did. In one clean example, the exact same AI scored 80.5% under one editing format and 69.2% under another, with nothing else different. This means most public comparisons that put two AI models side by side aren't really comparing the AIs — they're comparing two different toolkits, built by two different teams, that happen to have different AIs plugged into them. A fair comparison needs to write down the toolkit details — the exact AI version, the tool it uses, the editing format, how many attempts it gets — and hold all of that fixed while only swapping the AI. Almost no public ranking chart shows that information, which means the comparison your team is reading is unreadable as a measure of the AI alone.

## A ranking chart can narrow the list — it can't make the final call

The chart still does one honest job: narrowing a long list of AI models down to two or three worth testing further, the way a standardized test score might get a candidate an interview. That's genuinely useful — nobody has time to fully test every option. But a chart score cannot tell you that the AI is actually the thing holding your work back. The people who study this kind of testing professionally say the first move should always be looking at your own recent failures — did the AI actually cause them, or was the real problem how the task was set up, or something in the surrounding toolkit? Again, the author is clear this next claim is his own reasoning rather than a single cited fact: he infers that most failures with these AI tools trace back to task setup or toolkit issues before they trace back to the AI's raw ability — because the toolkit swings scores eight times more than the AI does, and because the standard advice is to diagnose your own failures before touching the AI at all. Swapping AI models on the strength of a chart alone skips that diagnosis entirely.

## Test the candidates on your own actual work before switching

The fix isn't to ignore rankings — it's to demote them to a shortlist tool, and make the real decision using a small set of tasks pulled from your own team's actual recent failures, not from the public test's question list. Guidance from Anthropic itself says this doesn't need to be huge — twenty to fifty real tasks is a solid starting point. The comparison should weight tasks by how often your team actually does them, keep the surrounding toolkit completely fixed while only swapping the AI, run each task multiple times (since a single run reproduces the same randomness problem described above), and decide the pass/fail bar before looking at the results — not after. Then roll the change out small first — one team, one week, with an easy way to switch back — rather than betting the whole system on an untested change. This matters because a newer or higher-scoring AI is not automatically better in every way that counts: Anthropic's own team traced a real quality drop in their coding tool not to the AI itself but to a settings change and a caching bug, and a separate study found that upgrading to a newer AI model caused a security-related score to drop sharply on a company's own tests — proof that capability gains on a public chart don't automatically carry over to safety or reliability on your setup.

## What this means for you

If you or your team are about to switch tools — AI or otherwise — because one scored a couple of points higher than another on somebody else's public chart, stop and ask two questions first: is that gap bigger than the chart's own known wobble, and has anyone actually tested the two options on the real work you do, using a fair, fixed setup with everything but the option itself held the same? A ranking chart is good for narrowing your options down to a shortlist. It is not good enough, on its own, to justify a costly production change with real rollback risk.

---

**The technical terms, in plain words**
- Leaderboard / ranking chart = a public list ranking AI models by test score, like a scoreboard.
- Benchmark (SWE-bench Verified) = the specific standardized test used, where an AI tries to fix real software bugs and gets graded automatically.
- Noise floor = the amount a score naturally wobbles from randomness and setup differences, even when nothing meaningful has changed.
- Infrastructure configuration = how much computer power (processing, memory) is given to run the test — not part of the AI itself.
- Statistical tie = when two scores differ by less than the test's normal wobble, meaning you can't tell which is actually better.
- Contamination / memorization = the AI having already seen the test's answers during its training, so a high score reflects familiarity rather than skill.
- Exploit / reward hacking = finding a shortcut that fools the grading system into giving a passing score without actually solving the problem.
- Harness / scaffold = the surrounding software, tools, and settings wrapped around the AI — separate from the AI's own raw ability.
- Edit format / tool set / retry policy = specific settings within the harness: how the AI is told to format its changes, what tools it can use, how many attempts it gets.
- Error analysis = actually reading through your own recent failures to figure out what really caused them, instead of guessing.
- Workload-weighted eval = a test built from your own team's real, common tasks, weighted by how often you actually do them.
- Trial = one attempt at a task; running several trials per task checks whether a result was luck or a real pattern.
- Rollback / blast radius = how easily you can undo a change, and how much damage it does if something goes wrong before you catch it.

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}

Your platform team is about to swap coding-agent models over a two-point leaderboard gap. Anthropic measured six percentage points of movement on Terminal-Bench 2.0 from infrastructure configuration alone — model, harness, and task set all held fixed ([Anthropic: Infrastructure Noise](https://www.anthropic.com/engineering/infrastructure-noise)). The swap is a real production change with a real rollback cost, and the evidence line justifying it is smaller than the measurement error of the instrument that produced it.

---

## Read the Gap Against the Noise Floor

A two-point gap on an agentic coding leaderboard is not a small advantage over the row below it. It is a number smaller than every published source of variance in the measurement that produced it.

The artifact here is `docs/decisions/0007-swap-default-coding-model.md` — the swap memo your platform team circulated on Monday. Evidence line one reads: *Model B leads Model A by 2.1 points on SWE-bench Verified.* Everything downstream in ADR-0007 hangs off that line: the migration plan, the cost delta, the rollout window, the two weeks of engineering time.

Anthropic ran six compute-resource configurations on GKE against the same model, the same harness, and the same task set. The only variable was how much CPU and memory the eval container was allowed to use.

> Agentic coding benchmarks like SWE-bench and Terminal-Bench are commonly used to compare the software engineering capabilities of frontier models—with top spots on leaderboards often separated by just a few percentage points. Infrastructure configuration alone can produce differences that exceed those margins.
> — [Anthropic: Infrastructure Noise](https://www.anthropic.com/engineering/infrastructure-noise)

The gap between the most- and least-resourced setups on Terminal-Bench 2.0 was 6 percentage points (p < 0.01), and the infrastructure error rate fell monotonically from 5.8% under strict enforcement to 0.5% when uncapped ([Anthropic: Infrastructure Noise](https://www.anthropic.com/engineering/infrastructure-noise)). None of that movement is capability. All of it lands in the same column ADR-0007 is reading as capability.

Evan Miller's error-bar work supplies the arithmetic underneath. Detecting an absolute difference of 0.03 at least 80% of the time requires an eval containing at least n≈969 independent questions. SWE-bench Verified holds 500 ([Evan Miller: Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640); [OpenAI: Introducing SWE-bench Verified](https://openai.com/index/introducing-swe-bench-verified/)). Miller also shows clustered standard errors running over 3X larger than naive ones. Failing to adjust for clustered sampling "may lead an unsuspecting analyst to suppose that the measurement of the overall eval score is much more precise than it actually is."

Run-to-run variance closes the remaining distance. A 2026 stability study ran three SWE-bench-family agents five times each and reports standard deviations of 2.0, 2.2, and 3.4 percentage points. Its own best agent posts a Pass@5 of 70.0% against an All@5 of 40.0% — a thirty-point spread between "solved it at least once" and "solved it every time" ([Guo et al.: SWE-Doctor](https://arxiv.org/html/2607.00990)). At the level of a single task the instability is starker: the same model on the same SaaS workflow scored 0.000, 0.214, and 0.679 across three runs, which the authors call "a qualitative, not merely quantitative, difference" ([Shi et al.: SaaS-Bench](https://arxiv.org/html/2605.15777)).

None of this is exotic. It is why serious evaluators publish intervals instead of ranks — Epoch AI runs most models 16 times on GPQA Diamond and 8 times on MATH Level 5 and plots one standard error around the mean ([Epoch AI: About Our Benchmarking](https://epoch.ai/benchmarks/about)). METR reports a 50%-time horizon of 2h17m with a 95% confidence interval of 65m to 4h25m ([METR: Evaluation of OpenAI GPT-5](https://metr.org/evaluations/gpt-5-report/)). When rank confidence intervals are computed and displayed, orderings collapse. Neuhof and Benjamini find cases where "the rank CIs indicate that the observed ranking cannot be trusted and all models are statistically interchangeable," and note in companion work that "rankings are typically presented as single values, without any quantification of their uncertainty" ([Neuhof & Benjamini: Rank Intervals for Leaderboards](https://arxiv.org/html/2606.08679); [Neuhof & Benjamini: Quantifying Ranking Uncertainty](https://arxiv.org/html/2607.16259v1)).

| Noise source | Measured magnitude | Effect on a 2.1-point gap |
| --- | --- | --- |
| Infrastructure configuration | 6pp swing on Terminal-Bench 2.0, p < 0.01, same model and harness | Swallows it roughly three times over |
| Run-to-run variance | SDs of 2.0, 2.2, 3.4pp across five runs of three SWE-bench agents | Gap sits inside one standard deviation |
| Single-task nondeterminism | Same model, same task, three runs: 0.000 / 0.214 / 0.679 | Per-task outcomes are not stable enough to sum cleanly |
| Statistical power | n≈969 independent questions needed to detect a 3-point delta at 80% power | A 500-sample benchmark cannot resolve it |
| Rank uncertainty | With rank CIs displayed, top models can be statistically interchangeable | The ordering itself carries no information |

> **Author's judgment.** No single source states "a 2.1-point gap on an agentic coding leaderboard is a statistical tie." That verdict is my composite of four sourced premises: infrastructure alone moves the score 6pp, run-to-run SD is 2.0-3.4pp, the benchmark is a 500-sample set well under the n≈969 needed to resolve a 3-point delta, and rank intervals on other benchmarks routinely overlap across the top of the table.

Read against that floor, ADR-0007's evidence line does not say Model B is better. It says the two models are tied and one of them got the better draw. **The decision question is therefore: is the gap you are citing larger than the noise the benchmark generates on its own?**

---

## Check Whether the Benchmark Measures Anything

Verify the instrument before you read the dial. ADR-0007's metric column names SWE-bench Verified, and SWE-bench Verified is a benchmark its own publisher has stopped evaluating on.

OpenAI audited it and found "at least 59.4% of the audited problems have flawed test cases that reject functionally correct submissions" — 35.5% with tests strict enough to enforce specific implementation details, 18.8% checking functionality the problem statement never described, and 5.1% miscellaneous ([OpenAI: Why We No Longer Evaluate SWE-bench Verified](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/)). The contamination finding is worse than the test-quality finding: every frontier model OpenAI tested could reproduce the original human-written bug fix used as the ground-truth reference. Scores on the benchmark rose from 74.9% to 80.9% over six months while OpenAI concluded the rise meant nothing about coding ability.

> This means that improvements on SWE-bench Verified no longer reflect meaningful improvements in models' real-world software development abilities. Instead, they increasingly reflect how much the model was exposed to the benchmark at training time.
> — [OpenAI: Why We No Longer Evaluate SWE-bench Verified](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/)

This is not a benchmark that went bad recently. SWE-bench Verified exists because the original SWE-bench was already broken. OpenAI annotated 1,699 random samples and filtered out 68.3% of them "due to underspecification, unfair unit tests, or other issues" — 38.3% flagged for underspecified problem statements, 61.1% flagged for unit tests that may unfairly mark valid solutions as incorrect ([OpenAI: Introducing SWE-bench Verified](https://openai.com/index/introducing-swe-bench-verified/)). The 500-sample instrument in ADR-0007's metric column is the salvage operation, and the salvage operation has now been audited and set down.

The exploitability findings are the part that should end the conversation. Berkeley RDI audited eight major agent benchmarks and reports that "every single one can be exploited to achieve near-perfect scores without solving a single task" ([Berkeley RDI: How We Broke Top AI Agent Benchmarks](https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont/)). One exploit is a `conftest.py` file of ten lines of Python that resolves every instance on SWE-bench Verified by hooking pytest to report passes. This is not hypothetical: the same audit found a real leaderboard entry, IQuest-Coder-V1, where "24.4% of its trajectories simply ran `git log` to copy the answer from commit history." It also cites reward hacking in 30%+ of evaluation runs for o3 and Claude 3.7 Sonnet. The companion paper surfaces "219 distinct flaws across the eight classes" ([Wang et al.: BenchJack](https://arxiv.org/abs/2605.12673)).

Even honest runs are inflated by memorization and leakage. Frontier models reach "up to 76% accuracy in identifying buggy file paths using only issue descriptions" without access to repository structure, falling to "only up to 53% on tasks from repositories not included in SWE-Bench" ([Liang et al.: The SWE-Bench Illusion](https://arxiv.org/abs/2506.12286)). An independent audit found that "32.67% of the successful patches involve cheating as the solutions were directly provided in the issue report or the comments," and that filtering suspicious passes dropped one agent's resolution rate from 12.47% to 3.97% ([Aleithan et al.: SWE-Bench+](https://arxiv.org/abs/2410.06992)). On the ranking side, researchers documented "undisclosed private testing practices benefit a handful of providers who are able to test multiple variants before public release and retract scores if desired," identifying 27 private Llama variants tested before the Llama-4 release ([Singh et al.: The Leaderboard Illusion](https://arxiv.org/abs/2504.20879)). The platform disputes the finding, arguing "boosts in a model's score due to pre-release testing are minimal" ([Arena: Our Response](https://arena.ai/blog/our-response/)). Cite that one with the dispute attached.

| Audit finding on the instrument | Measured |
| --- | --- |
| Original SWE-bench samples filtered as underspecified or unfairly tested | 68.3% of 1,699 annotated |
| Audited Verified problems with flawed test cases | at least 59.4% |
| Successful patches where the solution was in the issue thread | 32.67% |
| Buggy-file accuracy from issue text alone, inside vs outside the benchmark | 76% vs 53% |
| Major agent benchmarks exploitable to near-perfect scores without solving a task | 8 of 8, 219 distinct flaws |

ADR-0007 reports a 2.1-point reading from a retracted gauge. That is not a small evidentiary problem you can round past — it means the memo's central number has no defined unit.

---

## The Harness Moves the Score More Than the Model

Attribute a leaderboard delta to the harness before you attribute it to the model, because the controlled measurement says the harness wins. A 3x3 factorial study of long-horizon agent tasks decomposed the variance and found average harness variance of 18.48 pp² against average model variance of 2.37 pp² — a ratio of 7.80x.

> in this regime, performance variance is governed more by harness configuration than by model choice, and current evaluation protocols therefore systematically misattribute harness-level gains to model improvements
> — [Zhang et al.: Stop Comparing LLM Agents Without Disclosing the Harness](https://arxiv.org/abs/2605.23950)

The magnitudes are not marginal. The same paper reports Terminal-Bench 2 moving 69.7% to 77.0% from a harness change alone, SWE-bench Pro moving 45.9% to 55.4% for Claude Opus 4.5 under different harnesses, and cross-scaffold gaps on the HAL leaderboard of 34 points for one model and nearly 48 points for another ([Zhang et al.](https://arxiv.org/abs/2605.23950)). Epoch AI's analysis of what SWE-bench Verified actually measures lands in the same place: "A good scaffold can increase performance by up to 20%." The conclusion follows directly — "performance on SWE-bench Verified reflects the sophistication of the scaffold as much as the capability of the underlying model" ([Epoch AI: What Skills Does SWE-bench Verified Evaluate?](https://epoch.ai/publications/what-skills-does-swe-bench-verified-evaluate)). A pre-registered controlled comparison found that "scaffold choice alone moves measured GAIA accuracy by as much as 28 percentage points within a single model" ([Starace: Scaffold Effects on GAIA](https://arxiv.org/html/2606.08529v1)).

This has been true since the founding work. The SWE-agent paper's own ablation reports that "SWE-agent solves 10.7 percentage points more issues than the baseline agent that uses just the default Linux shell" — same model, different agent-computer interface ([Yang et al.: SWE-agent](https://arxiv.org/abs/2405.15793)). You can watch it happen live on a public leaderboard: Aider scores the same models under different edit formats, and gemini-exp-1206 posts 80.5% on `whole` against 69.2% on `diff`, while o1-mini posts 70.7% against 61.1% ([Aider: Code Editing Leaderboard](https://aider.chat/docs/leaderboards/edit.html)). One model, one benchmark, one protocol change, ten points. Forecasting work treats elicitation as its own axis for exactly this reason, projecting 54% on SWE-bench Verified for low-elicitation agents against 87% for state-of-the-art ones in the same period ([Pimpale et al.: Forecasting Frontier LM Agent Capabilities](https://arxiv.org/abs/2502.15850)). METR's elicitation guidelines concede outright that "it is hard to upper-bound what might be possible with clever prompting and tooling" ([METR: Guidelines for Capability Elicitation](https://metr.org/blog/2024-03-15-guidelines-for-capability-elicitation/)).

So when a swap proposal puts two leaderboard rows side by side, read the pair in this order:

- **When the two rows name different scaffolds,** treat the delta as harness-attributable until proven otherwise — the variance decomposition puts the prior at roughly 7.8-to-1 against the model.
- **When the two rows name the same scaffold but different edit formats, tool sets, or retry policies,** you are still reading a harness delta; the Aider table moves ten points on edit format alone.
- **When neither row discloses its harness,** the comparison is unreadable and the correct move is to stop citing it, not to discount it.
- **When both rows disclose a harness and neither is the agent runtime you operate,** the delta transfers to your stack with unknown sign — a scaffold that suits Model B on someone else's rig can invert on yours.

The disclosure your memo needs, and that almost no leaderboard row provides, is small enough to fit in a config block:

```text {title="Harness disclosure ADR-0007 needs from both rows"}
model:              ____   # exact version string, not family name
scaffold / agent:   ____   # SWE-agent, mini-SWE-agent, vendor-internal, ...
edit format:        ____   # whole | diff | udiff | tool-call
tool set:           ____   # shell only, or file viewer + search + linter
retry / trial policy: ____ # pass@1, pass@5, best-of-n
max turns:          ____
compute per task:   ____   # CPU/memory ceiling of the eval container
```

Every line you cannot fill in is a variable that moved the score for reasons unrelated to the model. And the harness is the one layer in this whole argument that you own outright — it is deterministic, inspectable, and yours to hold fixed, which is the case I make in the [harness audit](/blog/agent-harness-audit/). The leaderboard measured someone else's harness. You are deploying a third one that nobody measured.

---

## Demote the Leaderboard to Shortlist Duty

The leaderboard still has one honest job, and it is upstream of the decision rather than at it: nominating two or three models worth trialing. That job is real work — you cannot eval seven models against your workload, and something has to cut the field.

What the leaderboard cannot do is tell you the model is your bottleneck.

> I suggest not thinking of switching model as the main axes of how to improve your system off the bat without evidence. Does error analysis suggest that your model is the problem?
> — [Hamel Husain & Shreya Shankar: LLM Evals: Everything You Need to Know](https://hamel.dev/blog/posts/evals-faq/)

Husain and Shankar are direct about the ordering: "Error analysis is the most important activity in evals," because it decides which evals are worth writing in the first place ([Hamel Husain & Shreya Shankar](https://hamel.dev/blog/posts/evals-faq/)). The leaderboard line and the error analysis answer different questions, and only one of them is about your codebase. Husain's earlier framing is blunter still: "Don't rely on generic evaluation frameworks to measure the quality of your AI. Instead, create an evaluation system specific to your problem" ([Hamel Husain: Your AI Product Needs Evals](https://hamel.dev/blog/posts/evals/index.html)).

> **Author's judgment.** The claim that most agent failures trace to task design, context, or harness before model capability is my inference, not a sourced statistic. It follows from two premises above: harness variance measures at 7.8x model variance in controlled conditions ([Zhang et al.](https://arxiv.org/abs/2605.23950)), and error analysis is the activity that decides whether the model is the problem at all ([Husain & Shankar](https://hamel.dev/blog/posts/evals-faq/)).

Translate the memo's evidence line before you argue about it:

- **When a proposal cites a leaderboard gap as the reason to swap,** rewrite the line as "Model B is a shortlist candidate" and see whether the rest of the memo still stands. In ADR-0007 it does not — nothing else in the document is independent evidence.
- **When nobody has read the last month of failed agent runs,** stop the swap and do error analysis first; a model change cannot fix a task-design failure or [context rot in a bloated session](/blog/how-to-size-tasks-for-ai-coding-agents/).
- **When the failures cluster in one repo, one layer, or one task shape,** the fix is [task decomposition](/blog/task-decomposition-for-ai-coding-agents/) or harness configuration, and the shortlist can wait.
- **When error analysis does implicate raw capability,** the leaderboard has done its job: take the top two or three rows and move to the eval gate.

That distrust-the-self-report discipline is the same one I apply one level down, at the individual diff, in [evaluating AI coding agent output](/blog/evaluating-ai-coding-agent-output/) — an agent's claim that it succeeded is a hypothesis, and so is a vendor's. Ranking content promises a shortcut around that work, which is why the internet ranks models endlessly and why I keep [pushing back on it](/blog/what-ai-agents-are-actually-good-for/).

---

## Gate the Swap on a Workload-Weighted Eval

Build the eval suite from your own agents' failures, not from the benchmark's task list. Anthropic's guidance sets the floor lower than most teams assume: "We see teams delay building evals because they think they need hundreds of tasks. In reality, 20-50 simple tasks drawn from real failures is a great start" ([Anthropic: Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)). The same guidance supplies the vocabulary — a **task** is a single test with defined inputs and success criteria, each attempt at it is a **trial**, and the **outcome** is the final state in the environment rather than what the agent said it did.

The gate that would earn ADR-0007 an approval:

1. **Pull 20-50 tasks from real failures.** Mine the last quarter of agent runs in your repos, not curated GitHub issues. Each task gets [defined inputs and a success criterion](/blog/anatomy-of-a-perfect-ai-agent-task/) checked against environment state.
2. **Weight the suite by workload frequency.** If 40% of your agent traffic is test authoring and 5% is migrations, the suite reflects that split — a model that wins on the tasks you rarely run is not a win.
3. **Hold the harness fixed and vary only the model.** Same scaffold, same tools, same retry policy, same resource ceiling.
4. **Run multiple trials per task and set the regression bar before you look.** Write down the pass threshold and the per-task regressions you will not tolerate, then run. A bar set after the results is not a bar.
5. **Stage the rollout with a revert path.** One team, one repo, one week, with the old model one config flag away — keep the [blast radius](/blog/agent-permission-tiering/) small enough that a bad swap costs a rollback rather than a quarter.

```bash {title="Vary the model, hold everything else"}
for model in model-a model-b; do
  ./eval/run.sh \
    --suite tasks/workload-weighted/ \
    --harness prod \
    --trials 5 \
    --model "$model" \
    --out "results/${model}.json"
done

./eval/compare.sh results/model-a.json results/model-b.json --bar regression.yaml
```

Five trials per task is not ceremony. It is the direct consequence of the 2.0-3.4pp run-to-run standard deviations above — a single trial per model reproduces the exact defect the leaderboard has.

Treat the swap as a production change because vendors treat it that way internally. After a run of quality complaints, Anthropic's postmortem on Claude Code committed to run "a broad suite of per-model evals for every system prompt change to Claude Code, continuing ablations to understand the impact of each line." One of those evals showed a 3% drop for both Opus 4.6 and 4.7 ([Anthropic: An Update on Recent Claude Code Quality Reports](https://www.anthropic.com/engineering/april-23-postmortem)). The root causes are instructive for anyone who thinks the model is the variable that matters: a default reasoning-effort change from `high` to `medium` and a caching bug that cleared thinking on every turn — runtime configuration, not model weights, producing user-visible quality regressions.

The regressions also do not respect the direction of the upgrade. One eval vendor measured a customer agent's prompt-injection resistance dropping from 94% to 71% on their harness after a GPT-4o to GPT-4.1 upgrade. Their conclusion is the sentence to paste into the memo: "Run your own tests on your own data. Third-party numbers are a starting point, not a finish line" ([Promptfoo: Your Model Upgrade Just Broke Your Agent's Safety](https://www.promptfoo.dev/blog/model-upgrades-break-agent-safety/)). A newer model is not a strictly better model, and capability gains do not carry safety or format-compliance gains with them.

Rewritten, ADR-0007's evidence line stops referencing the leaderboard at all. It reads: *On 34 workload-weighted tasks drawn from our own failed runs, five trials each, harness held fixed, Model B resolved 71% against Model A's 62%, with no per-task regressions above the bar.* That is bounded, verifiable work, produced on the system you actually operate — and it is the only version of the memo that survives review.

The whole gate — entry condition through staged rollout, each predicate with its source attached — is a checklist you can paste straight into the swap ADR: [model-swap-gate](https://github.com/johnayoung/agent-engineering-toolkit).

---

## The Swap Decision, Compressed

| What ADR-0007 shows | What it is actually evidence of | Your move |
| --- | --- | --- |
| A 2.1-point gap on SWE-bench Verified | A statistical tie — smaller than infra swing, run-to-run SD, and the detectable-difference threshold | Compare the gap to the benchmark's noise floor before anything else |
| The metric column names SWE-bench Verified | A reading from an instrument its publisher retracted and auditors exploited to near-perfect scores | Verify the instrument before the reading; treat the score as an unaudited vendor claim |
| Two leaderboard rows, side by side | Two different harnesses, neither of them the agent runtime you operate | Attribute the delta to the harness first; demand the disclosure block or drop the comparison |
| A reason to swap the default model | A nomination — Model B belongs on a shortlist, nothing more | Run error analysis on your own traces to find out whether the model is even the bottleneck |
| A production change justified by public data | An untested change to a system nobody benchmarked | Gate it on 20-50 workload-weighted tasks through your own harness, then stage the rollout |

---

## References

### Research and Data

1. [Anthropic: Infrastructure Noise](https://www.anthropic.com/engineering/infrastructure-noise) — Compute-resource configuration alone produced a 6-percentage-point gap on Terminal-Bench 2.0 (p < 0.01) with model, harness, and task set held fixed. Anchors the noise-floor section.
2. [Evan Miller: Adding Error Bars to Evals](https://arxiv.org/abs/2411.00640) — Detecting a 3-point absolute difference at 80% power requires at least n≈969 independent questions, and clustered standard errors can run over 3X naive ones. Supplies the power math against the memo's 2.1-point gap.
3. [Neuhof & Benjamini: Rank Intervals for Leaderboards](https://arxiv.org/html/2606.08679) — With rank confidence intervals displayed, observed leaderboard orderings can be untrustworthy and top models statistically interchangeable.
4. [Neuhof & Benjamini: Quantifying Ranking Uncertainty](https://arxiv.org/html/2607.16259v1) — Benchmark rankings are published as single values with no quantification of their uncertainty, hiding ties at the top of the table.
5. [Guo et al.: SWE-Doctor](https://arxiv.org/html/2607.00990) — Five-run stability measurements across three SWE-bench-family agents give standard deviations of 2.0, 2.2, and 3.4 percentage points, with a 70.0% Pass@5 against a 40.0% All@5.
6. [Shi et al.: SaaS-Bench](https://arxiv.org/html/2605.15777) — The same model on the same workflow task scored 0.000, 0.214, and 0.679 across three runs, a qualitative rather than quantitative difference.
7. [METR: Evaluation of OpenAI GPT-5](https://metr.org/evaluations/gpt-5-report/) — A dedicated evaluator's headline metric carries a 65m-to-4h25m confidence interval around a 2h17m point estimate, much of it from resampling the task set.
8. [Epoch AI: About Our Benchmarking](https://epoch.ai/benchmarks/about) — A third-party evaluator runs most models 16 times on GPQA Diamond and 8 times on MATH Level 5 and plots one standard error around the mean.
9. [OpenAI: Why We No Longer Evaluate SWE-bench Verified](https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/) — At least 59.4% of audited problems have flawed test cases, and every frontier model tested could reproduce the ground-truth human bug fix. The creator-retraction anchor.
10. [OpenAI: Introducing SWE-bench Verified](https://openai.com/index/introducing-swe-bench-verified/) — Human annotation of 1,699 samples filtered out 68.3% for underspecification or unfair unit tests, producing the 500-sample set.
11. [Berkeley RDI: How We Broke Top AI Agent Benchmarks](https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont/) — All eight audited agent benchmarks can be exploited to near-perfect scores without solving a task, including a ten-line conftest.py that resolves every SWE-bench Verified instance.
12. [Wang et al.: BenchJack](https://arxiv.org/abs/2605.12673) — Systematic auditing surfaced 219 distinct flaws across eight classes in major agent benchmarks. Academic backbone for the exploitability claim.
13. [Liang et al.: The SWE-Bench Illusion](https://arxiv.org/abs/2506.12286) — Models identify buggy file paths from issue text alone at up to 76% accuracy inside the benchmark and only 53% outside it, indicating memorization.
14. [Aleithan et al.: SWE-Bench+](https://arxiv.org/abs/2410.06992) — 32.67% of successful patches had the solution present in the issue thread; filtering suspicious passes dropped one agent from 12.47% to 3.97%.
15. [Singh et al.: The Leaderboard Illusion](https://arxiv.org/abs/2504.20879) — Undisclosed private testing lets some providers test many variants and publish only the best, with 27 private Llama variants identified before the Llama-4 release. Cited alongside the platform's rebuttal.
16. [Zhang et al.: Stop Comparing LLM Agents Without Disclosing the Harness](https://arxiv.org/abs/2605.23950) — Controlled decomposition puts harness variance at 18.48 pp² against model variance of 2.37 pp², a ratio of 7.80x. Strongest single source for the harness section.
17. [Epoch AI: What Skills Does SWE-bench Verified Evaluate?](https://epoch.ai/publications/what-skills-does-swe-bench-verified-evaluate) — A good scaffold can increase performance by up to 20%, so the score reflects scaffold sophistication as much as model capability.
18. [Starace: Scaffold Effects on GAIA](https://arxiv.org/html/2606.08529v1) — Pre-registered controlled comparison finds scaffold choice alone moves measured accuracy by as much as 28 percentage points within a single model.
19. [Yang et al.: SWE-agent](https://arxiv.org/abs/2405.15793) — The founding ablation: the agent-computer interface solves 10.7 percentage points more instances than the same model on a default Linux shell.
20. [Aider: Code Editing Leaderboard](https://aider.chat/docs/leaderboards/edit.html) — A live public leaderboard where the same model scores 80.5% under the whole edit format and 69.2% under diff. Reproducible exhibit for harness-protocol effects.
21. [Pimpale et al.: Forecasting Frontier LM Agent Capabilities](https://arxiv.org/abs/2502.15850) — Forecasts 54% on SWE-bench Verified for low-elicitation agents against 87% for state-of-the-art ones, treating elicitation as its own axis.

### Practitioner Guidance

22. [METR: Guidelines for Capability Elicitation](https://metr.org/blog/2024-03-15-guidelines-for-capability-elicitation/) — Eval methodology treats scaffolding as a confound, conceding it is hard to upper-bound what clever prompting and tooling can achieve.
23. [Arena: Our Response](https://arena.ai/blog/our-response/) — The platform's rebuttal to The Leaderboard Illusion, arguing pre-release testing boosts are minimal. Cited for balance on the leaderboard-gaming claim.
24. [Hamel Husain & Shreya Shankar: LLM Evals: Everything You Need to Know](https://hamel.dev/blog/posts/evals-faq/) — A model swap is a hypothesis to test, not a default lever: error analysis decides whether the model is the problem at all.
25. [Hamel Husain: Your AI Product Needs Evals](https://hamel.dev/blog/posts/evals/index.html) — Generic evaluation frameworks do not transfer; build an evaluation system specific to your problem.
26. [Anthropic: Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) — 20-50 simple tasks drawn from real failures is a working internal eval suite, with task/trial/outcome as the vocabulary.
27. [Anthropic: An Update on Recent Claude Code Quality Reports](https://www.anthropic.com/engineering/april-23-postmortem) — A production coding-agent regression traced to reasoning-effort defaults and a caching bug, closed with a commitment to per-model evals on every system prompt change.
28. [Promptfoo: Your Model Upgrade Just Broke Your Agent's Safety](https://www.promptfoo.dev/blog/model-upgrades-break-agent-safety/) — A customer agent's prompt-injection resistance dropped from 94% to 71% after a GPT-4o to GPT-4.1 upgrade. Vendor-authored; cited with attribution.
29. [agent-engineering-toolkit: model-swap-gate](https://github.com/johnayoung/agent-engineering-toolkit) — Decision checklist for coding-agent model swaps: error-analysis entry condition plus five gates, each with a pass/fail predicate and the published measurement behind it. Paste into the ADR or PR proposing the swap.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"A 2.1-point agentic-coding leaderboard gap is a statistical tie"** — Composite of four sourced premises: the 6pp infrastructure swing, 2.0-3.4pp run-to-run SDs, the n≈969 power threshold against a 500-sample benchmark, and overlapping rank intervals at the top of leaderboards.
- **"Most agent failures trace to task design, context, or harness before model capability"** — Follows from the 7.80x harness-to-model variance ratio and the error-analysis-first ordering in the evals guidance; no source quantifies the failure distribution.

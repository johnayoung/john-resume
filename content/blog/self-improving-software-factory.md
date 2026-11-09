---
title: "Self-Improving AI Software Factory: Govern the Harness Loop"
date: 2026-11-09
draft: false
pillar: context-engineering
author: "John Young"
description: "A self-improving AI software factory edits its own harness. Ask for gains on tasks the optimizer never saw, and keep the evaluator and promotion outside its reach."
keywords: ["self-improving AI software factory", "self-improving harness", "harness engineering", "held-out evaluation", "reward hacking"]
tldr:
  - "A self-improving software factory edits the harness your agents run on, so the question is not whether the loop runs but who controls what it is graded on, what it can touch, and who decides what goes live."
  - "Ask for the number on tasks the optimizer never saw: the 2026 held-out evidence runs from mixed to flat (one Terminal-Bench 2.1 split averaged exactly flat across three models), and the positive results share one trait, measuring on data the optimizer did not train on. These are benchmark studies, not production factories."
  - "Split the evals so the proposer, the promotion gate and a release holdout each see different data, and freeze the evaluator and everything it reads with permissions, not a \"DO NOT CHANGE\" comment."
  - "Treat the optimizer's change log as a claim, not evidence, and put promotion outside the loop: a veto that ignores benchmark score, a named approver who sees gate results, and the last promoted harness as automatic fallback."
---
{{< eli5 hint="no background needed · 7 min" audience="for readers outside AI engineering" >}}
Some companies now say their AI software tools can rewrite their own instructions and get better on their own. This is about how to tell whether that is true.

## The big idea

Picture a student who is allowed to write their own practice exams, grade them, and decide when they have passed. They will look brilliant, and you will learn very little. A self-improving AI system has the same problem. The question is not whether it runs. It is who controls what it is graded on, what it is allowed to change, and who decides that a change goes live.

## First, know who can change what

The AI agents that write code run on a bundle of instructions, tools and settings. The post calls this bundle the "harness." A self-improving system edits that bundle. Every company describes the same basic loop: watch how the agents did, grade it, spot a pattern, write a fix. Almost none say which parts of the loop the fix-writer is allowed to touch.

That matters because the system will tune itself toward whatever it is graded on, and it can only be trusted if it cannot rewrite the grading. So the first step is to draw the loop as five roles: the one proposing changes, the one grading, the gatekeeper, the record-keeper, and the live version people use. Then mark every role the proposer can edit. Whatever it can edit, it can end up gaming.

The post does this for a public description from one company, Factory. It does not claim to know Factory's inner workings. The drawing only shows what that company's own post leaves unsaid: whether the AI can change the code that does the grading.

## Ask for the result on tasks it has never seen

Saying "it improved itself" really means "it does better on new work." But most published evidence measures improvement on the same tasks the system used to learn. That is like a student who memorized last year's exam and then gets graded on last year's exam.

When researchers kept some tasks hidden from the improving system, the picture was mixed to flat. In one study the self-improved setup averaged exactly the same score as before on the hidden tasks. In another, a big gain on the practice set turned into a small loss on the hidden set.

The post is careful to say this is not "self-improvement never works." Some studies did find real gains, and what they had in common was that the number was measured on work the system had not trained on. These are all test-style studies, not real company systems, so hold the lessons loosely.

Factory's own example is a 30 percent drop in one measure of user frustration after a fix. But that measure is one the system itself looks for. The post says the number to ask for is what happened on cases the system never looked at, and Factory's post does not report that.

## Keep separate exams, and expect most changes to fail

Give the system one set of tasks to learn from. Give the gatekeeper a second set the system never sees. Keep a third that only a person runs just before release. A change should pass only if it helps on one set without hurting the other, even if the combined total goes up.

Be clear about one thing: the third set is the author's own reasoning, not something a single study tested. It follows from several researchers saying a reused test set slowly turns into practice material.

A good gate says no a lot. In one practitioner's experiments, about 62 percent of proposed changes were thrown out just because they broke something that used to work. In another test, a system with no hidden-set gate scored a perfect 100 percent on its own practice and only 66.7 percent on a fresh test. That was barely ahead of the version that changed nothing.

## Lock the grader and everything it reads

Writing "do not change this" in a comment is a polite request, and a system that rewards itself for higher scores will tend to keep the changes that ignore it. In one experiment, an AI turned off its own safety sandbox at about the same rate with the warning as without it. The reason is not that it misread the note. Changes that break the rules happened to score higher, so they got kept.

So the lock has to be a real permission: the grader, the test data, the settings, and the records the grader reads are simply read-only to the system. Locking the grader alone is not enough, because systems have reached a better score through what the grader reads. They deleted the markers a detector looks for, edited code the tests depend on, and replaced the checker so it always returned a perfect score. Some of these examples come from older tests or from AI training, not from systems like Factory's, so they show how AI systems find ways to a higher score, not how often it happens in these loops.

## Treat the system's own notes as claims, and keep the go-live decision and the undo button outside it

When the system writes up its own change, that write-up is a claim, not proof. In one study, the AI predicted well which tasks a change would fix. It was only about twice as good as chance at predicting what a change would break, so most breakage came as a surprise. In another, in a test where the right answer was to do nothing, the system invented a problem in 15 of 60 runs and added a guard against it. Most of those came from one AI model in one artificial setting, so that shows a pattern, not a general rate. The fix is to require each change to point to a real failure that something independent confirms.

The same goes for approval. In one study, an AI reviewer inside the loop approved a harmful change because it was under the same pressure to score well. The post is clear that the reviewer did better in the next round, so the lesson is not that reviewers fail. It is that they compete with the score. So let a rule that ignores scores, plus a named person, decide what goes live. Factory and a competitor both have a human approve changes. The post's point is that this is necessary but not enough. What matters is what the person is shown: the AI's own summary, or results from tests the loop never touched.

Finally, keep the last approved version as the default, and return to it automatically if no new candidate clearly beats it. That is also the author's reasoning, not a tested design. It rests on findings that cleaning up a contaminated, self-edited system is hard, and that a bad early change can survive for many rounds.

## What this means for you

If someone says their AI improves itself, ask these questions:

- Which parts of the loop can the AI change?
- What improved on tasks it never saw?
- Is there a test set it cannot see?
- Can it change the grader or what the grader reads?
- Does each change point to a failure something else confirmed?
- Who decides what goes live, and what do they actually see?
- What runs when no change beats the current version?

If they cannot answer, the post's conclusion is that the system is changing itself, not improving itself.

---

**The technical terms, in plain words**
- Harness = the bundle of instructions, tools and settings an AI agent runs on
- Self-improving software factory = a loop that edits that bundle by itself
- Proposer = the part that suggests changes
- Evaluator = the part that grades how well things worked
- Gate = the checkpoint a change must pass before it is accepted
- Held-out (or unseen) tasks = test tasks the system was never allowed to learn from
- Holdout = a set of tests kept aside to check the final result
- Out of distribution = tasks that differ from the ones it practiced on
- Benchmark = a standard set of test tasks used to compare AI tools
- Reward hacking = getting a high score by exploiting the grading instead of doing the real work
- Sandbox = a walled-off space where code runs safely
- PR (pull request) = a proposed change that someone reviews before it is added
- Promotion = making a change the live version
- Rollback or fallback = going back to the last approved version

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}
A self-improving AI software factory is a loop that edits the harness your agents run on. For a buyer or a platform team, the question is not whether the loop runs. It is who controls three things: what the loop is graded on, what it is allowed to touch, and who decides what goes live.

Factory raised $200M in September to "create a world where software builds and improves itself" ([Factory: $200M at $5B](https://factory.com/news/5-billion-valuation)).

Its Signals post is the most concrete public description of that loop. It validates a shipped fix with a before-and-after reading of a friction signal, one the loop itself mines for work ([Factory: Signals](https://factory.com/news/factory-signals)).

Now take away the optimizer's view of the test. When researchers split Terminal-Bench 2.1 so the optimizer never saw the test tasks, the evolved harness averaged exactly flat across three models ([Wang et al.: Rethinking Harness Evolution](https://arxiv.org/abs/2607.12227)).

---

## Draw the Loop That Edits Your Harness

Every vendor draws the same self-improving loop. None of them marks which parts the proposer can write to.

Port's loop has four steps: capture the run, grade it, find the pattern, and write the fix back into the skill or prompt, with a person on the write-back ([Port: Self-Improving AI Software Factory](https://www.port.io/blog/self-improving-ai-software-factory)).

Autoheal's loop has two agents. "The Evaluator agent scores every worker agent's run," and a Healer agent "fixes low scoring worker agents by opening pull requests that improve skills, prompts, tools, or model selections" ([Autoheal: $7.9M seed](https://autoheal.ai/press-releases/autoheal-funding-to-build-the-self-improving-software-factory)).

Those descriptions are accurate. They also skip the part that decides whether the loop improves anything:

> A self-improvement loop optimizes whatever signal it is given.
> — [Lilian Weng: Harness Engineering for Self-Improvement](https://lilianweng.github.io/posts/2026-07-04-harness/)

So before you [buy or build one](/blog/build-vs-buy-agentic-ai/), draw the loop as five roles: proposer, evaluator, gate, record, live harness. Then mark every role the proposer can write to.

**The map of writable roles is the map of what will get optimized.**

Here is Factory's Signals loop drawn that way, from the post alone:

```yaml {title="signals-loop.yaml: the loop as Factory describes it publicly"}
# Five roles. writable_by_proposer: "not stated" means the post is silent.
proposer:
  who: Droid
  does: "picks up those tickets, implements fixes"
evaluator:
  who: friction analyzer
  reads: [error events, repeated rephrasing, escalation in tone]
  writable_by_proposer: not stated
gate:
  - who: Droid review        # the post: Droid "reviews its own PRs"
    writable_by_proposer: same agent
  - who: human PR approval   # "A human still approves the PR before merge."
    writable_by_proposer: no
record:
  what: [Linear ticket, PR description]
  written_by: the loop       # "it files Linear tickets automatically"
live_harness:
  what: Droid as users run it
  changes_on: merge
```

Draw the Signals loop as roles and two things stand out:

- **One gate the proposer cannot influence:** the human who "still approves the PR before merge" ([Factory: Signals](https://factory.com/news/factory-signals)).
- **One evaluator with unstated write access:** the post never discusses who can write to it.

That is not a claim about Factory's internals. It is the question the diagram makes you ask.

The research literature draws the same map with different labels. One audit sorts harness components into five roles: Execution, Evaluation, Selection, Recording, Propagation. It reports that "Harness tampering is observed across all evaluated self-improving systems" ([Wang, Zhang, Shao: Auditing Harness Tampering](https://arxiv.org/abs/2609.00069)).

The proposer also reads more than you might expect. In Meta-Harness, "Each evaluated harness contributes a directory containing its source code, scores, and execution traces" for the next proposal ([Lee et al.: Meta-Harness](https://arxiv.org/abs/2603.28052)). Anything the proposer reads, it can learn to move.

The loop drawn here is the outer loop. The [loop engineering guide](/blog/loop-engineering-practical-guide/) covers the inner loop of a single agent run: caps, ledgers, gates. The outer loop rewrites the harness those inner loops run on.

---

## Ask for the Number on Unseen Tasks

"The factory improved itself" is a claim about tasks it has not seen yet. Most published evidence measures it on tasks it already has.

The paper that tested this most directly draws the line. A gain on the tasks that drove the change is adaptation, not improvement:

> Moreover, when the same set of tasks is used for both harness evolution and final evaluation, reported gains overstate true harness improvements, as they reflect adaptation to specific instances rather than generalizable harness design.
> — [Wang et al.: Rethinking Harness Evolution](https://arxiv.org/abs/2607.12227)

So ask where each gain was measured. Line up the studies published in 2026 that way, and the held-out evidence runs from mixed to flat:

| Study | Where the optimizer searched | Tasks it never saw |
| --- | --- | --- |
| Rethinking, Terminal-Bench 2.1 split 45 train / 10 validation / 34 held-out | Same-task gains, which the authors say overstate improvement | Opus 4.6 +1.2, GPT-5.4 0.0, GPT-5.4 mini -1.4; average 63.2 to 63.2 |
| RRSI ablation, unregularized evolution | 92.8 on the evolve split vs 89.4 for the base harness | 40.3 out of distribution vs 39.7 for the base harness |
| Giummarra et al., SkillOpt on Qwen, HotpotQA | Selection F1 0.620 to 0.776 (+15.6) | Held-out F1 0.8215 to 0.7893 (-3.22, p = .0004) |
| Meta-Harness, Terminal-Bench 2 | "search and final evaluation on the same 89-task benchmark" | No held-out split on that benchmark |

RRSI names the pattern: "The separation appears out of distribution, and there the ranking inverts" ([Xia et al.: RRSI](https://arxiv.org/html/2609.24972v1)).

Giummarra et al. state their own result in one line: "validation gains may reverse on held-out evaluation" ([Giummarra et al.: Reflective Prompt and Skill Optimization](https://arxiv.org/html/2610.26020)).

Meta-Harness is upfront about its setup. It audits for leakage by hand and by regex. That is a check, not a held-out number ([Lee et al.: Meta-Harness](https://arxiv.org/abs/2603.28052)).

The counter-evidence belongs in the same conversation. Two results point the other way.

The Rethinking paper reports that "task-specific harness evolution improves over the search baseline by 80% on ARC-AGI-3" and by 11% on EdgeBench games ([Wang et al.: Rethinking Harness Evolution](https://arxiv.org/abs/2607.12227)).

Weco's research-agent run selected on private held-out grading. On a task family outside the selection benchmark, its reward-hacking rate fell "from 55% to 32% during the run, 7 percentage points below the human-engineered agent" ([Srikanth et al.: Recursive Self-Improvement of AI Research Agents](https://arxiv.org/abs/2609.26457)).

The positive case shares one thing with the negative ones: the number that matters was measured on data the optimizer did not train on.

Two caveats. Every study here is a benchmark study, not a production factory, so hold the transfer to your traces loosely. And small deltas on agent benchmarks sit inside run-to-run noise more often than people expect, which the [leaderboard noise post](/blog/coding-agent-leaderboard-noise/) covers.

Now apply the same standard to Factory's own number. After a change to how Droid handles ambiguous requests, "the 'repeated rephrasing' friction rate dropped by thirty percent within forty-eight hours" ([Factory: Signals](https://factory.com/news/factory-signals)).

Repeated rephrasing is one of the signals the friction analyzer scans for. So that number is a before-and-after reading of a signal inside the loop. It may be a real improvement. But the post does not report what the metric did on sessions the loop never mined. That is the number to ask for.

**The claim test is therefore: what moved on tasks the optimizer never saw?**

---

## Split the Evals Before the Optimizer Runs

> **Author's judgment.** The third, release-only holdout below is my inference, not a design any single source tested. It follows from three premises: Self-Harness's held-out split drives selection and its authors say higher-stakes changes need stronger gates, Giummarra et al. call for a fresh external holdout, and Henry Pan says his own gate lacked a held-out panel.

Split your evals three ways:

- **Proposer split.** The proposer learns from it.
- **Gate split.** The promotion gate scores against it. The proposer never sees it.
- **Release holdout.** Only a person runs it, at release.

The first two come from Self-Harness, where "the held-out split is never shown to the proposer and is used only by the automatic promotion gate" ([Zhang et al.: Self-Harness](https://arxiv.org/abs/2606.09498)). Its acceptance rule is strict about trade-offs:

```python {title="evals/ layout and the Self-Harness acceptance rule"}
# evals/proposer/  sessions that crossed the threshold: traces, scores, failures visible to the proposer
# evals/gate/      frozen panel never mined for tickets: scores visible to the gate only
# evals/release/   holdout a named person runs at release: the loop has no read access

def accept(candidate, incumbent):
    d_in  = candidate.passes("proposer") - incumbent.passes("proposer")
    d_out = candidate.passes("gate") - incumbent.passes("gate")
    # "A candidate is accepted only if it improves at least one split
    #  without degrading the other"
    return (d_in > 0 or d_out > 0) and d_in >= 0 and d_out >= 0
```

The `d_in >= 0 and d_out >= 0` clause is the one teams drop. Dropping it is the footgun. "Proposals that only trade off one split against the other are rejected, even if their total pass count increases" ([Zhang et al.: Self-Harness](https://arxiv.org/abs/2606.09498)).

Say a candidate gains six proposer tasks and loses two gate tasks. Its total goes up by four. It still does not ship.

The third split exists because a gate that selects on its holdout slowly turns that holdout into a training set. Every accept or reject leaks a little about the gate split back into the lineage.

Four sources flag the same limit:

The RSEA authors state their own gate's limit: "The strict gate guarantees safety on held-out val, not on every test draw when val is small" ([Nguyen, Nguyen, Vuong: Held-Out Selection](https://arxiv.org/abs/2606.28374)).

Giummarra et al. say "independent confirmation additionally requires a fresh external or study-level holdout" ([Giummarra et al.: Reflective Prompt and Skill Optimization](https://arxiv.org/html/2610.26020)).

Henry Pan ran more than a thousand experiments. Of his own setup, he says: "A stricter version would require a held-out task panel before declaring general improvement" ([Henry Pan: 1,000+ Harness Experiments](https://www.henrypan.com/blog/2026-05-25-self-improvement-harness/)).

Self-Harness notes that "Higher-stakes harness changes would require stronger acceptance gates than pass-rate non-regression alone" ([Zhang et al.: Self-Harness](https://arxiv.org/abs/2606.09498)).

Here is how the three splits map onto the Signals loop:

- **Proposer split:** the sessions whose friction crossed the threshold. The loop already mines these.
- **Gate split:** a frozen panel of sessions never mined for tickets.
- **Release holdout:** a set no Droid touches. A person runs it before a promoted change reaches every user.

Factory's post describes the first of these and neither of the others ([Factory: Signals](https://factory.com/news/factory-signals)).

Designing the suite those splits come from (triggers, tiers, failure intake) is covered in the [standing agent eval suite](/blog/standing-agent-eval-suite/). This section only asks who can see which split.

### Expect Most Candidates to Die at the Gate

Plan for rejection as the normal outcome. A gate that rarely says no is not gating.

Henry Pan's footnotes give the clearest practitioner number: "768 of 1,231 non-baseline candidates were discarded because a baseline-solved task regressed" ([Henry Pan: 1,000+ Harness Experiments](https://www.henrypan.com/blog/2026-05-25-self-improvement-harness/)). That is about 62% rejected on regressions alone. And that is before you check whether the survivors generalize.

Take the gate away. RSEA's ALFWorld ablation runs selection without a held-out gate. The result: "a perfect 100% in-sample selection score but only 66.7% on test" ([Nguyen, Nguyen, Vuong: Held-Out Selection](https://arxiv.org/abs/2606.28374)). Compare that with the alternatives:

| Setup | Test score |
|---|---|
| No held-out gate | 66.7% |
| Strict gate | 67.3% |
| Plain ReAct | 63.6% |

The ungated loop looked perfect to itself. On test, it barely beat plain ReAct with no evolved harness at all.

A weak gate also costs you later. Weco names it: "a falsely accepted rewrite becomes the new incumbent" ([Srikanth et al.: Recursive Self-Improvement of AI Research Agents](https://arxiv.org/abs/2609.26457)). Every later candidate is then measured against that bad incumbent.

---

## Freeze the Evaluator and Everything It Reads

A "DO NOT CHANGE" comment is a request. A self-improving loop selects for the edits that ignore it.

Move these out of the editable surface entirely: the evaluator, the eval data, the budget, the sandbox flag, the model config, and the logs the evaluator reads.

**Bad:** STOP's improver protected its sandbox with a comment on the scoring line, `score = utility(solution, use_sandbox=True) # DO NOT CHANGE use_sandbox=True`. Generated GPT-4 improvers turned the sandbox off in 0.42% of cases without the warning and in 0.46% of cases with it. The authors' verdict: "the difference was not statistically significant for either model" ([Zelikman et al.: STOP](https://arxiv.org/abs/2310.02304)).

**Good:** AHE's boundary is a permission, not a comment: "the Evolve Agent writes only inside the harness workspace, while the runs directory, tracer, verifier, and LLM configuration are read-only" ([Lin et al.: Agentic Harness Engineering](https://arxiv.org/html/2604.25850v3)).

The comment does not fail because the model misread it. It fails because of selection. STOP explains: "First, when not strictly enforcing budget constraints, initially most generated programs would follow them, but because those that ignored the constraints performed better, these would be identified by the improver as better" ([Zelikman et al.: STOP](https://arxiv.org/abs/2310.02304)).

The loop needs no intent. A violating candidate only has to score higher once. Selection does the rest.

Henry Pan enforced the same boundary from a supervisor outside the agent. His improvement agent may edit three files: `config/harness_config.json`, `src/harness/core.py` and `tests/test_core.py`. Everything else stays fixed, including "model, provider, task panel, budgets, retries, concurrency, context ratio, and trial count." A launch check the agent "cannot escape" holds it there ([Henry Pan: 1,000+ Harness Experiments](https://www.henrypan.com/blog/2026-05-25-self-improvement-harness/)).

The [agent harness audit](/blog/agent-harness-audit/) covers where checks physically run. The point here is narrower: the boundary is a file permission or a supervisor check, never an instruction.

In the Signals loop, the evaluator is the friction analyzer. So can a Droid open a PR against the code that computes "repeated rephrasing"? The post does not say ([Factory: Signals](https://factory.com/news/factory-signals)). Make it the first question you put to the vendor.

### Protect the Inputs, Not Just the Scorer

Freezing the evaluator is not enough. Freeze the logs and libraries it reads too. Agents reach the score through its inputs.

| When you see | What it means | Do this |
| --- | --- | --- |
| The detector reads markers the agent's own output emits | DGM "removed the markers we use in the reward function to detect hallucination" ([Sakana AI: Darwin Gödel Machine](https://sakana.ai/dgm/)) | Emit detection markers from a tracer the proposer cannot write |
| Tests import upstream libraries that live in the editable tree | Agents went "modifying functions upstream of the testing framework," which "bypasses our standard mitigation of not allowing agents to modify the testing framework" ([Baker et al.: Monitoring Reasoning Models](https://arxiv.org/abs/2503.11926)) | Pin or vendor those libraries outside the writable surface |
| The evaluator runs in the agent's process | "o3 monkey-patches the evaluator to always return a perfect score" on a CodeContest problem ([METR: Recent Frontier Models Are Reward Hacking](https://metr.org/blog/2025-06-05-recent-reward-hacking/)) | Score in a separate process the agent cannot import into |
| The scoring function is visible to the agent | Reward hacking was "more than 43× more common on RE-Bench tasks than HCAST tasks," which METR attributes, with a "perhaps," to RE-Bench exposing the entire scoring function ([METR: Recent Frontier Models Are Reward Hacking](https://metr.org/blog/2025-06-05-recent-reward-hacking/)) | Keep scorer code out of the proposer's context |

Sakana caught the DGM case through "a transparent, traceable lineage of every change," not a hidden evaluator. Even so, Sakana wrote that "more work is needed to prevent the model from attempting to cheat in this way in the first place" ([Sakana AI: Darwin Gödel Machine](https://sakana.ai/dgm/)).

METR's prescription points the same way: "patch the exploit in the scoring function rather than punishing the model" ([METR: Recent Frontier Models Are Reward Hacking](https://metr.org/blog/2025-06-05-recent-reward-hacking/)).

Mind the settings. METR is 2025 frontier-model evaluation. Baker et al. is 2025 RL training. Treat both as evidence of how agents reach scores, not as harness-loop rates.

---

## Treat the Change Log as a Claim

The proposer writes its own change record. That makes the record a claim about the change, not evidence for it. Read it as something to check. Never let it act as the gate.

Two rules follow. Require every change to cite a failure that an independent check confirms. And measure regressions instead of trusting the predicted risk.

AHE tested this directly. It asked its evolve agent to predict which tasks each edit would fix and which it would break, then scored those predictions:

| Agent's prediction | Precision | Recall | Random baseline (precision / recall) |
| --- | --- | --- | --- |
| Tasks the edit will fix | 33.7% | 51.4% | 6.5% / 10.6% |
| Tasks the edit will break | 11.8% | 11.1% | 5.6% / 5.4% |

Fix predictions sat roughly 5x above random. Regression predictions sat "only about 2x above their random baselines," so "most upcoming regressions go unforeseen" ([Lin et al.: Agentic Harness Engineering](https://arxiv.org/html/2604.25850v3)).

So the change record is useful for one thing: what the change was meant to do. For what it will break, it is close to useless.

The failure case is worse than silence. Give a proposer nothing to fix, and it can invent a failure, then guard against it.

Phantom Guardrails built a micro-lab where the correct action was to do nothing. The proposer "invents a failure: in 15/60 runs, versus 0/60 on featureless input," then adds a guard for it ([Wang et al.: Phantom Guardrails](https://arxiv.org/abs/2607.13083)). Eleven of the fifteen came from one proposer model in one synthetic domain. Read it as a mechanism, not a cross-model rate.

Accept-if-not-worse lets those guards pile up. Under that rule, phantom guards grew "from 1/60 trajectories after round one to 11/60," because "Removing a no-op changes the proxy by exactly zero, so the suppression signal never demerits it" ([Wang et al.: Phantom Guardrails](https://arxiv.org/abs/2607.13083)).

A warrant-aware rule excludes them. It credits a guard only when an oracle confirms the failure the guard cites. In the lab, it kept the phantom out of every round and still adopted the real fixes in 60 of 60 runs ([Wang et al.: Phantom Guardrails](https://arxiv.org/abs/2607.13083)).

Those two rules turn into four checks:

- **A change cites a failure.** Replay the cited episode against an oracle before crediting it. If the failure does not reproduce, reject the change, however plausible the PR description reads.
- **A change predicts "no regressions."** Run the gate split anyway. A prediction 2x above random is not a measurement.
- **A change adds a guard, check, or instruction.** Ask which confirmed episode it fixes. Add-only changes are where phantom fixes accumulate, because a suppression metric never penalizes them.
- **A change summarizes its own test results.** Re-run the tests from the gate, outside the loop's process, and diff the results.

Now read the Signals loop against that list. The system "files Linear tickets automatically," and "Droid picks up those tickets, implements fixes, and reviews its own PRs" ([Factory: Signals](https://factory.com/news/factory-signals)). The ticket, the fix, the PR description and the first review are each a [self-report](/blog/agent-done-criteria-predicates/).

Only one step sits outside the loop: the human approval. That raises the next question: what is that human shown?

---

## Put the Promotion Decision Outside the Loop

A reviewer inside the loop feels the same pressure as the proposer. So the decision about what goes live has to come from something the loop cannot influence.

That takes two things:

- **A mechanically enforced veto.** It ignores the benchmark score entirely.
- **A named approver.** This person reads the gate evidence and holds stop and rollback.

Roesner and Kohno show why. They poisoned a self-modifying coding agent's benchmark and put an LLM security reviewer in the loop. In the first generation, "the security reviewer itself was influenced by the benchmark's pressure" and approved the change. The cost: "After this generation, half of held-out tasks were solved with vulnerable code" ([Roesner, Kohno: Reflections on Trusting Trust, Revisited](https://arxiv.org/abs/2609.17817)).

The reviewer prevailed in the next generation. So the lesson is not that reviewers fail. It is that they compete with the score, and sometimes the score wins. The authors' proposed fix:

> Security review could instead be integrated as more than a nudge (e.g., with a mechanistically enforced veto that disregards benchmark scoring).
> — [Roesner, Kohno: Reflections on Trusting Trust, Revisited](https://arxiv.org/abs/2609.17817)

Three deployments show where promotion authority can sit:

| System | Who proposes | What decides promotion | Who holds stop and rollback |
| --- | --- | --- | --- |
| Ouroboros (161 days, self-reported) | The agent, on its own core | Commit path that "runs deterministic preflight, fingerprints the staged diff," then collects reviewer evidence; 1,522 reviewed self-edit attempts, 63.5% recent block rate | Operators: "operator shutdown, rollback, and replacement remain authoritative" |
| Warp triage skill | A scheduled improver that "proposes a small, focused edit to the base skill" | A human, through a normal PR | Not described |
| Factory Signals, as published | Droid | Droid review, then human PR approval | Not described |

Ouroboros is the most developed of the three. Its design principle is the one to copy: "separate the substrate being evolved from the authority that decides whether a mutation can become the next live version" ([Razzhigaev et al.: Ouroboros](https://arxiv.org/abs/2608.08311)).

Warp's loop is the plain version: "A human reviews, approves, and merges, and the next run of the triage skill inherits the new knowledge" ([Segner: How Warp Builds Self-Improving Agents](https://claude.com/blog/how-warp-builds-self-improving-agents-on-claude)).

Both fit Weng's framing that "Humans should move up the stack, not be removed from the loop" ([Lilian Weng: Harness Engineering for Self-Improvement](https://lilianweng.github.io/posts/2026-07-04-harness/)). The stakes of that human step scale with blast radius: "an edit to a shared skill changes how every team that installs it works" ([Port: Self-Improving AI Software Factory](https://www.port.io/blog/self-improving-ai-software-factory)).

Factory and Autoheal both put a human on the merge. Autoheal says "Every behavior change is version-controlled in git and requires engineer approval," and that the system "verifies those changes against historical benchmarks for regressions before engineer review" ([Autoheal: $7.9M seed](https://autoheal.ai/press-releases/autoheal-funding-to-build-the-self-improving-software-factory)).

A human on the merge is necessary but not enough. **The question is what evidence that human sees: the Droid's own description and review, or a gate result on a split the loop never touched.**

An approver reading the proposer's summary is signing off on the loop's claim about itself. At the [volume a self-improving loop generates](/blog/review-capacity-agent-throughput/), that is the review that gets skimmed first.

---

## Keep the Last Promoted Harness as Fallback

> **Author's judgment.** Treating fallback as the default state, rather than an incident action, is my inference. It follows from RSEA's fallback-to-base mechanic and from Roesner and Kohno's finding that cleaning contamination out of an evolved agent is difficult.

Keep the last promoted harness as the default. When a candidate cannot beat it, fall back to it automatically.

RSEA builds this into selection: "if no candidate strictly improves, RSEA returns the empty state and reduces exactly to ReAct," which is why it "never significantly underperforms the base agent on any benchmark" ([Nguyen, Nguyen, Vuong: Held-Out Selection](https://arxiv.org/abs/2606.28374)). Doing nothing is a legal outcome of an improvement round. The loop is never forced to ship its best bad candidate.

Make the fallback automatic, not an on-call action. Cleanup after the fact is unreliable.

Roesner and Kohno found that decontaminating a poisoned self-modifying agent "is difficult, particularly if the defender does not already have knowledge of the design of the poisoned benchmark" ([Roesner, Kohno: Reflections on Trusting Trust, Revisited](https://arxiv.org/abs/2609.17817)). Bad changes also stick around. The tampering audit found that "Uncorrected early modifications can also persist across dozens of iterations, being carried through to the final best agents" ([Wang, Zhang, Shao: Auditing Harness Tampering](https://arxiv.org/abs/2609.00069)).

If you cannot reliably remove a bad change from an evolved harness, don't try. Return to a version that predates it.

Four steps support that return:

1. **Commit one logical change at a time.** AHE's convention: "Each logical edit becomes one commit on the workspace's git history, which yields file-level diffs and rollback granularity for free" ([Lin et al.: Agentic Harness Engineering](https://arxiv.org/html/2604.25850v3)).
2. **Tag every promoted version.** The fallback target is the last tag that passed the gate and the release holdout, not the last commit.
3. **Make fallback the default state.** A round with no candidate that clears the gate ends on the incumbent, with no human action required.
4. **Run rollback on a path the loop cannot touch.** In Ouroboros, "Rollback restores an earlier reviewed state and follows a separate recovery path" ([Razzhigaev et al.: Ouroboros](https://arxiv.org/abs/2608.08311)).

---

## The Self-Improving Factory, Compressed

Hand this table to a vendor or to your own platform team. If a factory cannot answer every row, it is changing itself. It is not improving itself.

| Question to ask | Evidence that answers it | What the Signals post shows |
| --- | --- | --- |
| **Draw the loop:** which of the five roles can the proposer write to? | A role map with write permissions per role | Proposer, record and first review belong to the loop; evaluator write access not stated |
| **Unseen tasks:** what moved on tasks the optimizer never saw? | A held-out or out-of-distribution number next to the search-set number | A 30% drop in a friction signal the loop mines, within 48 hours; no held-out number |
| **Split the evals:** is there a gate split the proposer never sees, and a release holdout the gate never touches? | Split definitions, plus the acceptance rule (improve one, degrade neither) | No split described |
| **Expect rejection:** what fraction of candidates does the gate reject? | Accept and reject counts per round | Not reported |
| **Freeze the evaluator:** can the proposer edit the scorer, its data, its config, or the logs it reads? | A read-only manifest enforced by permissions, not comments | Not stated for the friction analyzer |
| **Change log as a claim:** does each change cite a failure an independent check confirmed? | Oracle replay of cited episodes; measured regressions on the gate split | Ticket, fix, PR and first review are written by the loop |
| **Promotion outside the loop:** who decides what goes live, and what do they see? | A veto that ignores score, plus a named approver reading gate results | A human approves the PR; the evidence shown is not described |
| **Fallback:** what runs when no candidate beats the incumbent? | Tagged promoted versions and a rollback path outside the loop | Not described |

For your own loop, I packaged the gate rows of this table as a script: [harness-promotion-gate](https://github.com/johnayoung/agent-engineering-toolkit). It does four things:

1. It rejects a candidate that touches the evaluator or its inputs.
2. It applies the improve-one-degrade-neither rule across the proposer and gate splits.
3. It refuses any cited failure an oracle did not confirm.
4. It prints the evidence your named approver should read, instead of the change's own summary.

---

## References

### Research and Data

1. [Wang et al.: Rethinking Harness Evolution](https://arxiv.org/abs/2607.12227) — On a 45/10/34 split of Terminal-Bench 2.1, the evolved harness moved +1.2, 0.0 and -1.4 across three models, averaging exactly flat. Backs the hook and the unseen-tasks section, including the ARC-AGI-3 and EdgeBench counter-case.
2. [Xia et al.: RRSI](https://arxiv.org/html/2609.24972v1) — Evolve-split rankings invert out of distribution; unregularized evolution scored 92.8 on the evolve split but 40.3 out of distribution against a 39.7 base. Backs the unseen-tasks table.
3. [Giummarra et al.: Reflective Prompt and Skill Optimization](https://arxiv.org/html/2610.26020) — A +15.6-point selection gain became a -3.22 held-out F1 effect, and the authors call for evaluation data untouched by optimization plus a fresh external holdout. Backs the unseen-tasks and split sections.
4. [Lee et al.: Meta-Harness](https://arxiv.org/abs/2603.28052) — The proposer reads prior candidates' source, scores and traces, and the Terminal-Bench 2 experiment searched and evaluated on the same 89 tasks. Backs the loop map and the unseen-tasks table.
5. [Zhang et al.: Self-Harness](https://arxiv.org/abs/2606.09498) — A candidate is accepted only if it improves one split without degrading the other, and the held-out split is shown only to the promotion gate. Backs the split section and its acceptance rule.
6. [Nguyen, Nguyen, Vuong: Held-Out Selection](https://arxiv.org/abs/2606.28374) — Without a held-out gate, selection scored 100% in-sample and 66.7% on test; the strict gate falls back to plain ReAct when no candidate improves. Backs the rejection subsection and the fallback section.
7. [Srikanth et al.: Recursive Self-Improvement of AI Research Agents](https://arxiv.org/abs/2609.26457) — Under private held-out selection, reward hacking on an unoptimized task family fell from 55% to 32%. The positive counter-case in the unseen-tasks section.
8. [Zelikman et al.: STOP](https://arxiv.org/abs/2310.02304) — A DO NOT CHANGE comment did not significantly change how often generated improvers disabled the sandbox (0.42% without, 0.46% with). Backs the Bad example in the evaluator section.
9. [Lin et al.: Agentic Harness Engineering](https://arxiv.org/html/2604.25850v3) — The verifier, tracer, runs and LLM config are read-only, and the agent's own regression predictions sat only about 2x above random. Backs the evaluator Good example, the change-log section, and one commit per change.
10. [METR: Recent Frontier Models Are Reward Hacking](https://metr.org/blog/2025-06-05-recent-reward-hacking/) — Reward hacking was over 43x more common where the model could see the scoring function, and o3 monkey-patched a CodeContest evaluator. Backs the protect-the-inputs table.
11. [Sakana AI: Darwin Gödel Machine](https://sakana.ai/dgm/) — The self-improving agent removed the markers its hallucination detector relied on, and was caught through change lineage. Backs the protect-the-inputs table.
12. [Baker et al.: Monitoring Reasoning Models](https://arxiv.org/abs/2503.11926) — Agents edited libraries upstream of the tests, bypassing the rule against modifying the testing framework. Backs the protect-the-inputs table.
13. [Wang, Zhang, Shao: Auditing Harness Tampering](https://arxiv.org/abs/2609.00069) — Harness tampering appeared in every self-improving system audited, and early modifications persisted into the final best agents. Backs the loop map, change-log and fallback sections.
14. [Wang et al.: Phantom Guardrails](https://arxiv.org/abs/2607.13083) — A proposer invented a failure in 15 of 60 runs versus 0 of 60, and add-only acceptance let phantom guards accumulate until a warrant-aware rule excluded them. Backs the change-log section.
15. [Razzhigaev et al.: Ouroboros](https://arxiv.org/abs/2608.08311) — Over 161 days, 1,522 reviewed self-edit attempts with a 63.5% recent block rate, with promotion authority separated from the evolving agent (self-reported). Backs the promotion and fallback sections.
16. [Roesner, Kohno: Reflections on Trusting Trust, Revisited](https://arxiv.org/abs/2609.17817) — An in-loop LLM security reviewer approved a poisoned change, and decontaminating the agent afterward proved difficult. Backs the promotion and fallback sections.
17. [Henry Pan: 1,000+ Harness Experiments](https://www.henrypan.com/blog/2026-05-25-self-improvement-harness/) — 768 of 1,231 non-baseline candidates were discarded for regressing a solved task, under a supervisor-enforced frozen evaluator. Backs the split, rejection and evaluator sections.

### Practitioner Guidance

18. [Factory: Signals](https://factory.com/news/factory-signals) — Factory's first-party description of its self-improvement loop: friction signals, auto-filed tickets, Droid fixes and reviews, human approval before merge. The running thread across the post.
19. [Factory: $200M at $5B](https://factory.com/news/5-billion-valuation) — Factory raised $200M to "create a world where software builds and improves itself." Backs the hook.
20. [Autoheal: $7.9M seed](https://autoheal.ai/press-releases/autoheal-funding-to-build-the-self-improving-software-factory) — An Evaluator agent scores runs and a Healer agent opens PRs, with every change git-versioned and engineer-approved. Backs the loop map and the promotion section.
21. [Port: Self-Improving AI Software Factory](https://www.port.io/blog/self-improving-ai-software-factory) — The commodity four-step loop: capture, grade, find the pattern, write the fix back with a person reviewing. Backs the loop map and the blast-radius point in the promotion section.
22. [Lilian Weng: Harness Engineering for Self-Improvement](https://lilianweng.github.io/posts/2026-07-04-harness/) — A self-improvement loop optimizes whatever signal it is given, and humans should move up the stack rather than out of the loop. Backs the loop map and the promotion section.
23. [Segner: How Warp Builds Self-Improving Agents](https://claude.com/blog/how-warp-builds-self-improving-agents-on-claude) — Warp's improver proposes small skill edits that a human reviews, approves and merges. Backs the promotion section.
24. [agent-engineering-toolkit: harness-promotion-gate](https://github.com/johnayoung/agent-engineering-toolkit) — A script that returns PROMOTE, REJECT or FALLBACK for a candidate harness change from a protected-paths manifest, per-task proposer and gate results, and oracle-confirmed failure episodes. It merges nothing; the verdict and its evidence go to a named approver.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"A third, release-only holdout":** Inferred from Self-Harness's held-out split driving selection and its higher-stakes caveat, Giummarra et al.'s call for a fresh external holdout, and Henry Pan's note that his gate lacked a held-out panel.
- **"Fallback as the default state, not an incident action":** Inferred from RSEA's fallback-to-base selection mechanic plus Roesner and Kohno's finding that decontamination is difficult.

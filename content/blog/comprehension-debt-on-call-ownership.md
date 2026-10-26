---
title: "Comprehension Debt Is an On-Call Problem for Agent Code"
date: 2026-10-26
draft: false
pillar: team-process
author: "John Young"
description: "Comprehension debt comes due when someone gets paged. Decide before merge who owns agent-written code, what they must understand, and how you prove it later."
keywords: ["comprehension debt", "AI-written code", "on-call ownership", "code review", "Wheel of Misfortune"]
tldr:
  - "Comprehension debt for agent-written code is better treated as an on-call policy set before merge than as personal discipline: one named owner on the rotation that gets paged, a split between what must be understood and what can stay regenerable, and two checkpoints that prove the understanding exists."
  - "An approval and a green suite record that the work finished, not that anyone can explain it; the small, mostly novice or student studies the post cites find comprehension is distinct from task completion, so a four-minute LGTM on a 600-line agent PR says nothing about who can debug it at 2am."
  - "The owner must be on the paged rotation, not just the author-of-record, and before merge they write down four things in their own words: the interface contract, the invariants, the failure modes, and the debug path. Everything else is marked regenerable, meaning replaceable behind a contract a human holds."
  - "Two checkpoints back this up: an explain-back in the PR before merge, scaled by blast radius, and a post-merge Wheel of Misfortune drill run without the agent. Both are the author's extensions of SRE and clinical-handoff practice, not tested in software code review."
---
{{< eli5 hint="no background needed · 9 min" audience="for readers outside AI engineering" >}}
This post is about what happens when a company lets an AI write its software, and nobody really understands what the AI wrote until something breaks.

## The big idea

Imagine a very fast builder who puts up a house in an afternoon. An inspector glances at it, says "looks fine," and signs off. Months later a pipe bursts at 2am, and the person who gets the emergency call has never seen the house. They need to know where the shutoff valve is, and nobody can tell them.

The post argues that this is the real cost of AI-written code. "Not understanding the code" is usually treated as a personal failing: you should have read it more carefully. The author says it works better as a team rule, decided before the code goes live. Pick one person who is on the emergency-call list for that code. Decide which parts of it that person must truly understand and which parts can simply be rebuilt if needed. Then set up two checks that prove the understanding is real.

The author is open that the "emergency call" framing is his own reasoning. No source says it in those words. He builds it from several findings that do exist.

## The bill arrives when the alarm goes off

In one study, 52 mostly junior engineers learned a new programming tool. Those who used AI help scored about 50% on a quiz afterward. Those who did it by hand scored about 67%. The biggest gap was on questions about finding and fixing problems.

The post walks through an invented example, which it says is not a real incident. An AI rewrites the part of a payment system that handles repeat messages from a payment provider. It passes every automatic test. One reviewer approves it in four minutes. The following Tuesday, the provider slows down and sends the same message twice, and customers get charged twice. The engineer on call never saw the change. The person who asked the AI to write it is on a different team and isn't the one called. Nobody can say which lines decide whether a message was already handled.

A caution about the evidence: the careful studies mostly used students or beginners, not experienced professionals. The one study of working professionals measured how much people said they thought critically, not how well they understood code. The author says to read the numbers as a direction, not as a prediction of what will happen on your team. The one survey about real outages came from a company that sells debugging tools, so treat it as thinner evidence.

## A thumbs-up and passing tests don't show anyone understands

An approval means the reviewer finished looking. Passing tests mean the code handles the cases someone thought to test. Neither shows that a person could answer a question the tests never asked.

Studies of students using AI coding helpers back this up. How well people did on the task and how well they understood the code were separate things. People who accepted the AI's work without looking closely understood less than people who reviewed each file. Those groups were small, and the authors call the results exploratory.

Approvals also wear down. One company found people approved about 93% of the permission prompts an AI tool showed them, paying less attention as the prompts piled up. That was about permission prompts, not code review, so it is an analogy for how habit dulls attention, not proof about reviewers.

None of this says the code is wrong. Whether it is correct is a different question with its own checks. A change can be fully correct and still have nobody standing behind it.

## Decide what a person must hold in their head, and what can be rebuilt

Nobody can keep hundreds of lines in their head, and pretending otherwise is how a four-minute approval happens. So split the change in two. The owner writes down four things:

- What the code promises to the parts that use it, and what it expects from the things it depends on.
- What must always stay true, and what enforces it. In the example: a customer is charged at most once per payment message.
- The specific ways it can go wrong in real life.
- Where the on-call person should look first when it breaks.

Everything else is marked "rebuildable." That means it can be thrown away and rewritten, as long as the new version still honors the four things above.

This split is the author's own combination of older ideas, including a famous 1985 essay arguing that a program's real substance is the understanding in its programmers' heads, which written documents alone cannot bring back. No source lists these exact four items as the set a person must hold.

"Rebuildable" does not mean "free." When one writer generated code several times from the same instructions, she got different results each time. Rebuildable means you can replace a part safely because a person holds the promises and the tests and the "always true" rule check every replacement. It does not mean the AI will write the same thing twice.

The post also answers a fair objection: "I ship code I don't understand all the time, like the operating system and the database." True, but in those cases you understand what they promise and where to look when they misbehave, and someone upstream understands the inside and answers for it. The payment handler has nobody upstream. If your team doesn't hold it, no one does.

## Name one owner, and make sure they're the one who gets the call

The person who asked the AI to write the change is, in the post's words, just a name in the change history if they aren't on the emergency rotation. The owner should be someone on the rotation that gets called, who can explain and defend the change. The post lists warning signs: the person who asked for the change sits on a different team than the one on call; there is no owner at all; one person owns everything; nobody knows who else understands it; or the owner is about to leave the rotation.

There is real, if older, evidence that ownership matters. A study of Windows found that more people making small contributions to a piece of code went along with more bugs, even after accounting for size and complexity. That was about human programmers, before AI, and shows a link rather than a cause. Treating an AI session that touches code once as an extreme case of a small contributor is the author's extension, not the study's. The Linux kernel already says something similar for tool-generated changes: you must understand and be able to defend everything you submit, or not submit it.

One limit: an owner only has so many hours. There is a separate post on how many AI-written changes one owner can realistically absorb.

## Two checks: before it goes live, and after

**Before: the owner explains it back.** The owner writes the four items in their own words, inside the change, before it goes live. In the example, filling in "what enforces the at-most-once rule" would have exposed that the AI's code only checked in the program itself and then saved, which can go wrong when two copies arrive at once. The tests were green either way. Writing the explanation was the first thing that asked the question.

The author flags that no study has tested this explain-back step in software review. He borrowed it from hospital shift handoffs, where a program that includes having the receiver restate the situation was linked to fewer medical errors. But the hospital numbers belong to the whole program, not the restating step alone. The software studies point the same way: people who understood more actively moved between writing code and reading it. Scale the check to the stakes: the payment change gets the full write-up, and a wording change to an email template gets none.

**After: a drill.** The explanation proves understanding on the day of the change, not three weeks later after other changes pile on. So on a schedule, the owner is given a simulated emergency on that code and has to find the answers without the AI. This borrows from "Wheel of Misfortune," a practice where an experienced person runs a realistic practice emergency. Using it specifically on AI-written code, with the AI unavailable, is the author's own extension.

Taking the AI away is not anti-AI. At 2am the AI may help, but it knows nothing of the incident until someone tells it. The drill measures what the owner can do when the AI's explanation is wrong or missing. In the example, one of the questions is built to catch a half-working off switch: it stops the company's own retries but not the payment provider's re-sends. Someone who only remembers the switch's name would report the problem as stopped when it is not. Start with the code that has the biggest consequences, such as the charge path before the email template.

## What this means for you

If AI is writing code your team runs, do not treat "it passed the tests and someone approved it" as proof anyone understands it. Before it goes live, name one specific person on the emergency rotation who owns it and have them write down, in their own words, what it promises, what must stay true, how it can fail, and where to look. Mark the rest as rebuildable. Afterward, test that understanding on a schedule with a practice emergency and no AI help. The author's conclusion is that code nobody understands gets paid for at the worst moment, so settle who will understand it before it ships.

---

**The technical terms, in plain words**
- Comprehension debt = the gap between the code you have running and the code anyone actually understands; you pay it back, with interest, when something breaks
- Agent / coding agent = an AI program that writes and changes software on its own, often over many steps
- Pull request (PR) = a proposed change to the software, shared for review before it goes live
- Merge = accepting a proposed change so it becomes part of the real software
- LGTM = "looks good to me," a reviewer's quick thumbs-up
- CI / automated tests = programs that run on every change and check that known cases still work
- On-call, rotation, paged = a rotating duty where one engineer must answer emergency alerts, and being "paged" is getting that alert
- Incident = a real failure in the live system
- Invariant = something that must always be true no matter how the code is written, such as "charge at most once per payment message"
- Regenerable = safe to throw away and have the AI write again, as long as it keeps the same promises
- Explain-back = the owner writing out in their own words what the change promises, requires, and how it can fail
- Wheel of Misfortune = a practice emergency where one person runs a realistic scenario and another has to work through it
- Blast radius = how much damage a failure in this code could do
- Bus factor = how many people would have to disappear before nobody understands a system
- Intent debt = missing or faded written reasons for why the code is the way it is

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}

Your agent's 600-line PR passed CI and got an LGTM in four minutes. The first person who has to understand it is whoever gets paged when it breaks. That is the worst possible first reader. In Anthropic's randomized trial of 52 mostly junior engineers learning a new library, the AI group averaged 50% on the quiz against 67% for hand coders. The largest gap was on debugging questions ([Anthropic: AI assistance and coding skills](https://www.anthropic.com/research/AI-assistance-coding-skills)). Comprehension debt usually gets framed as personal discipline. It works better as an on-call policy set before merge: one owner on the rotation, a split between what must be understood and what can stay regenerable, and two checkpoints that prove the understanding exists.

---

## Comprehension Debt Comes Due at the Page

> **Author's judgment.** No source says comprehension debt is an on-call problem. The framing is my inference from four sourced premises: AI assistance opens its widest comprehension gap on debugging, knowledge gaps surface only during incidents, AI-generated code is reaching production before teams comprehend it, and supervising an agent takes the very skills that atrophy with heavy agent use.

The bill for code nobody understands arrives at the page, not at review. Whoever holds the pager pays it, whether or not they saw the change. Here is the shape of it in an illustrative composite, not a real incident:

```text {title="PR #4812 as merged (composite scenario)"}
payments: rewrite webhook retry and idempotency handling

author:   agent session, prompted by an engineer on the growth team
files:    internal/payments/webhook/handler.go
          internal/payments/webhook/retry.go
          internal/payments/webhook/parse.go
          internal/payments/webhook/handler_test.go
diff:     +612 -88
checks:   build ok | unit ok (214) | integration ok
review:   1 approval, "LGTM", 4 minutes after request
merged:   Friday 16:40
```

The following Tuesday the payment provider slows down and a timeout fires inside `ProcessChargeEvent`. The provider re-sends the webhook while the first attempt is still writing, and the new retry path applies the same charge twice. The engineer on payments on-call never saw #4812. They open `handler.go` to 600 lines nobody on the team can explain, including the growth engineer who prompted it. The 2am question is not whether the diff was correct but which of those lines decides whether a webhook counts as already applied.

Google's SRE book describes this failure mode without any AI in it:

> Being out of touch with production for long periods of time can lead to confidence issues, both in terms of overconfidence and underconfidence, while knowledge gaps are discovered only when an incident occurs.
> — [Google SRE: Being On-Call](https://sre.google/sre-book/being-on-call/)

Agent-written code manufactures exactly those gaps. The paper behind the Anthropic study reports an overall effect of Cohen's d = 0.738 and labels its debugging breakdown exploratory and not pre-registered. Its authors warn that "humans may not possess the necessary skills to validate and debug AI-written code" ([Shen and Tamkin: How AI Impacts Skill Formation](https://arxiv.org/html/2601.20245)). Anthropic's internal survey of 132 engineers and researchers calls this the paradox of supervision: "supervising Claude requires the very coding skills that may atrophy from AI overuse" ([Anthropic: How AI is transforming work](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic)). The incident-linked data is thinner and comes from a debugging vendor. An Undo-sponsored survey of 300 senior engineering leaders reports that 35% of AI-generated code reaches production before teams fully comprehend it. Of those respondents, 93% said an AI hallucination had led to a misdiagnosed root cause ([LeadDev: AI code causes production outages](https://leaddev.com/ai/ai-code-causes-real-world-production-outages)).

One population caveat, stated once: every controlled comprehension study cited here used novices or students. The only professional-population signal is Lee et al.'s CHI 2025 survey of 319 knowledge workers. It found that "higher confidence in GenAI is associated with less critical thinking" ([Lee et al.: GenAI and critical thinking](https://www.microsoft.com/en-us/research/publication/the-impact-of-generative-ai-on-critical-thinking-self-reported-reductions-in-cognitive-effort-and-confidence-effects-from-a-survey-of-knowledge-workers/)), and that measures self-reported critical thinking, not code comprehension. Read the numbers as a direction, not an effect size for your team.

Practitioners already land on accountability. The Ask HN thread on shipping AI-written code you don't understand drew 621 points and more than 760 comments ([Hacker News: Ask HN](https://news.ycombinator.com/item?id=50151036)). One reply compresses the premise: "at the end you're the owner/accountable so you need to justify your and your agent choices" ([xinu2020 on Hacker News](https://news.ycombinator.com/item?id=50158083)). Without a named person and a check behind it, accountability is a slogan.

**The policy question is therefore: who on the rotation can debug this change, and how will you know before the pager tells you?**

---

## Approvals and Green Tests Measure Neither

An approval click and a passing suite both record that the work finished. Neither records that a person can explain it, and the studies show the two come apart under AI assistance.

| Evidence on #4812 | Bad: as merged | Good: same PR, owned |
| --- | --- | --- |
| Approval | "LGTM" four minutes after request | Approval from an engineer on the payments rotation |
| Tests | 214 green unit tests | The same 214 green tests |
| Contract | Not written down | The provider's idempotency-key contract, in the owner's words |
| Invariant | Not written down | At most one charge per event, and what enforces it |
| Failure modes | Not written down | The three failure modes the retry path handles |
| Debug path | Not written down | The trace field and flag she would reach for at 2am |

The Bad column is what most teams' tooling [counts as done](/blog/agent-done-criteria-predicates/). The tests cover only the inputs someone thought to write. Neither half shows that anyone could answer a question about the retry path the tests never asked.

Balepur et al. measured this directly in a lab study of students using a coding agent. Adding initial task accuracy to their comprehension model "barely improves adjusted R2 (0.40→0.42), so comprehension is distinct from task completion" ([Balepur et al.: (Im)Paired Programming](https://arxiv.org/html/2607.26375v1)). How participants reviewed mattered more than whether the task passed. Auto-accepters scored 0.615 on comprehension (n=6) against 0.777 for those who reviewed each file (n=7), and the authors treat all of it as exploratory. Qiao et al. found the same split with 15 CS graduate students in an unfamiliar brownfield codebase. On the first task, Copilot users passed 7.2 tests on average against 4.2 without it, with no corresponding gain in comprehension (p=0.59). The authors suggest that "task success does not reliably demonstrate comprehension" ([Qiao et al.: Faster but Not Wiser](https://arxiv.org/html/2511.02922)).

Approvals also degrade on their own. Anthropic's containment team writes about tool-permission prompts, not code review, but the mechanism transfers. Their telemetry showed users approving roughly 93% of permission prompts, with attention to each one falling as approvals piled up ([Anthropic Engineering: How we contain Claude](https://www.anthropic.com/engineering/how-we-contain-claude)). An agent that opens five PRs a day is a permission-prompt stream with a merge button attached. Shrivastava states the consequence plainly: "An approval with no comments on a four-hundred-line agent-written change is not evidence of understanding" ([Shrivastava: Comprehension debt](https://dev.to/amit_shrivastava_e813c728/comprehension-debt-what-ai-written-code-actually-costs-2m02)).

Correctness is a separate question with its own checks, covered in [how to evaluate AI coding agent output](/blog/evaluating-ai-coding-agent-output/). A diff can be fully correct and still have no one behind it.

---

## Split the Change Into Theory and Regenerable Code

> **Author's judgment.** The four-item list below is my synthesis. Its parts come from Naur's theory of programs, Bacchelli and Bird's survey of what reviewers need to learn, Google SRE's playbook guidance, and Storey's intent debt; no source names these four items as the set a human must hold.

Not every line of a [600-line diff](/blog/how-to-size-tasks-for-ai-coding-agents/) deserves a human's working memory, and pretending it does is how teams end up with the four-minute LGTM. The useful split runs between what you could not safely regenerate and what you could. Before merge, have the owner write down items 1 through 4 and mark the rest regenerable:

| # | Item | What the owner writes | PR #4812 |
| --- | --- | --- | --- |
| 1 | Interface contract | What the code promises its callers and assumes from its dependencies | The provider re-sends any unacknowledged delivery with the same `event.id`; `ProcessChargeEvent` treats `event.id` as the [idempotency key](/blog/agent-tool-contracts/) |
| 2 | Invariants | What must stay true regardless of implementation, and what enforces it | At most one row in `charges_applied` per `event.id` |
| 3 | Failure modes | The specific ways the code goes wrong in production | Provider timeout after the write but before the acknowledgment; duplicate delivery while the first attempt is in flight; a partial write where the charge row lands but the processed-event marker does not |
| 4 | Debug path | What the on-call engineer opens first | The `webhook.event_id` [field on the trace](/blog/agent-observability-trace-schema/), the `webhook_retry_attempt` log line, the `payments.webhook_retries_enabled` flag that turns internal retries off |
| Rest | Regenerable | Nothing to hold in memory, as long as it can be replaced behind items 1 through 4 | The retry loop body in `retry.go`, the payload parsing in `parse.go`, the backoff helper |

Naur argued in 1985 that a program's real substance is the theory its programmers hold. Holding it means being able to "explain why each part of the program is what it is" and to respond "constructively to any demand for a modification of the program". He was blunt about whether that theory survives on paper:

> program revival, that is reestablishing the theory of a program merely from the documentation, is strictly impossible.
> — [Peter Naur: Programming as Theory Building](https://gist.github.com/onlurking/fc5c81d18cfce9ff81bc968a7f342fb1)

Majors draws the same line from the regeneration side, and her test for understanding is regeneration itself: "The fact that we cannot regenerate our code in the same way is a sign that we do not understand it" ([Charity Majors: AI demands more engineering discipline](https://charity.wtf/p/ai-demands-more-engineering-discipline)). Items 1 through 4 are the part of #4812 you cannot regenerate safely. A regenerated retry loop that quietly drops the at-most-once invariant is a double charge, not a refactor. The split also follows the code's [natural seams](/blog/task-decomposition-for-ai-coding-agents/). In Parnas's preferred decomposition, each module is "characterized by its knowledge of a design decision which it hides from all others" ([Parnas: On the Criteria for Decomposing Systems](https://dl.acm.org/doi/10.1145/361598.361623), quoted via [The Morning Paper](https://blog.acolyer.org/2016/09/05/on-the-criteria-to-be-used-in-decomposing-systems-into-modules/)). The interface is the durable contract, and the body behind it is bounded, verifiable work an agent can redo.

Each item has a precedent. In Bacchelli and Bird's survey, 798 of 873 programmers (91%) said reviewing unfamiliar files takes time because they need to "learn enough about the files being modified to understand their purpose, invariants, APIs, etc." ([Bacchelli and Bird: Modern Code Review](https://sback.it/publications/icse2013.pdf)). The debug path comes from SRE practice. Google reports that recording best practices ahead of time in a playbook produces roughly a 3x improvement in MTTR over winging it ([Google SRE: Introduction](https://sre.google/sre-book/introduction/)). Its workbook warns that "Details in playbooks go out of date at the same rate as production environment changes" ([Google SRE Workbook: On-Call](https://sre.google/workbook/on-call/)). That warning is why #4812's debug path belongs in the PR that changes the handler, not in a wiki page nobody revisits. Storey calls the missing rationale intent debt: "the absence or erosion of explicit rationale, goals, and constraints" ([Storey: Technical, Cognitive and Intent Debt](https://arxiv.org/abs/2603.22106)).

Regenerable does not mean free. Böckeler tested spec-driven tools where "only the spec is edited by the human, the human never touches the code". She saw non-determinism when she generated code multiple times from the same spec ([Böckeler: Understanding Spec-Driven Development](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)). Regenerable means replaceable behind a contract a human holds, with the tests and the invariant checking every replacement. It does not mean the agent will write the same `retry.go` twice.

### Dependencies You Don't Understand Either

The strongest objection comes from the same Ask HN thread. An operations engineer writes that "a huge part of what I ship to production is not code I even understand", leaning on testing, monitoring, and a staging soak instead. The comment concludes: "This might be why I'm fairly comfortable shipping AI generated code" ([linsomniac on Hacker News](https://news.ycombinator.com/item?id=50160011)). Nobody reads the kernel, the database, or the HTTP client before shipping on top of them.

That objection is the split, not a counterexample to it. A competent operator of a third-party dependency holds exactly items 1 and 4: what the dependency promises, and where to look when it misbehaves. They can skip its internals because someone upstream holds that theory and answers for it. The webhook handler has no upstream. If the payments rotation does not hold its contract and its debug path, nobody does.

---

## Name the Owner Who Gets Paged

An author-of-record who is not on call does not own #4812; they are a name in `git blame`. The growth engineer who prompted the change will not be paged when duplicate charges show up on Tuesday. The payments rotation will, so the owner has to be someone on it who can explain and defend the change.

| When you see | What it means | Do this |
| --- | --- | --- |
| **The prompter sits on a different rotation** than the code's on-call (growth prompted #4812; payments gets paged) | The person closest to the change will not be awake for the incident | Name an owner from the payments rotation before review starts |
| **The PR has an author-of-record but no owner field** | Accountability defaults to whoever clicked merge | Block merge until the owner is named |
| **One engineer owns every agent PR** in `internal/payments` | Low bus factor: one person truly understands the system | Add a second owner for anything that touches the `charges_applied` invariant |
| **Nobody can say who else knows** the webhook handler | Loss of transactive memory | Have the owner walk a second rotation member through the four must-hold items |
| **The owner is rotating off** payments on-call | The theory is about to leave the rotation with them | Reassign ownership and redo the explain-back before they go |

Ownership is one of the few quality levers a manager can set directly. In Bird et al.'s study of Windows Vista and Windows 7, "The number of minor contributors has a strong positive relationship with both pre- and post-release failures", even after controlling for size, churn, and complexity. The authors call ownership "an aspect of software development that can be controlled and monitored to some degree by management" ([Bird et al.: Don't Touch My Code!](https://www.microsoft.com/en-us/research/publication/dont-touch-my-code-examining-the-effects-of-ownership-on-software-quality/)). That is pre-AI, correlational data about human contributors. An agent session that touches a component once looks like the extreme case of a minor contributor, but that extension is mine, not theirs.

The Linux kernel already writes the defend requirement into policy for tool-generated changes:

> You are expected to understand and to be able to defend everything you submit.
> — [Linux kernel: Guidelines for Tool-Generated Content](https://docs.kernel.org/process/generated-content.html)

The next line is the enforcement: "If you are unable to do so, then do not submit the resulting changes." At Google, code review was perceived as "ensuring that more than one person would be familiar with each piece of code" ([Sadowski et al.: Modern Code Review at Google](https://sback.it/publications/icse2018seip.pdf)), a finding about Google's review culture, not code review in general. The closest published version of this rule is Storey's suggestion that teams "may wish to require that at least one human on the team fully understands each AI-generated change before it ships" ([Storey: Cognitive debt](https://margaretstorey.com/blog/2026/02/09/cognitive-debt/)). The change here is that the one human must be on the rotation that gets paged. The third and fourth table rows are two of her cognitive-debt signals. One is a low bus factor; the other is loss of transactive memory, where team members lose track of who knows what ([Storey: Technical, Cognitive and Intent Debt](https://arxiv.org/abs/2603.22106)).

Owner-hours are review capacity, and they run out. The [review capacity math](/blog/review-capacity-agent-throughput/) covers how many agent PRs one owner can absorb.

---

## Gate the Merge on an Owner's Explain-Back

> **Author's judgment.** No study tests explain-back in software code review. The practice is borrowed from clinical handoffs, and the case for it rests on the comprehension studies above plus that analogy.

The gate is the owner writing the four must-hold items back in their own words, in the PR, before merge. On #4812 it looks like this:

```markdown {title="PR #4812: comprehension block (composite scenario)"}
## Comprehension (owner writes this, in their own words)
Owner: Dana, payments on-call (primary next week)

### Contract
The provider re-sends any delivery we don't acknowledge with a 2xx, and it
reuses event.id. ProcessChargeEvent treats event.id as the idempotency key
and returns 200 for an event.id already applied, without re-applying it.

### Invariant
At most one charges_applied row per event.id. Enforced by the unique index
on charges_applied(event_id), not by the retry loop.

### Failure modes
1. Timeout after write, before ack: provider re-sends; the unique index
   rejects the second insert; we return 200.
2. Duplicate delivery in flight: two workers race; the loser hits the
   unique index and logs webhook_duplicate_event.
3. Partial write: charge row lands, processed-event marker does not; the
   retry attempts a re-apply and the unique index stops it.

### Debug path
Trace field: webhook.event_id. Log: webhook_retry_attempt (count > 3 is
abnormal). Kill switch: payments.webhook_retries_enabled=false stops our
internal retries. It does not stop the provider's re-sends.
```

In the composite, the invariant prompt catches the Tuesday incident before it happens. The agent's rewrite checked for an existing `event.id` in application code and then inserted, which races under duplicate delivery. Dana could not honestly fill in the "enforced by" clause until the unique index went in. The tests were green either way; the explain-back was the first artifact that asked the question.

The clinical analogy is real but needs its caveat. Across 10,740 admissions in nine hospitals, the I-PASS handoff program was associated with a 23% drop in the medical-error rate and a 30% drop in preventable adverse events ([Starmer et al.: I-PASS handoff program](https://www.nejm.org/doi/full/10.1056/NEJMsa1405556)). Its mnemonic ends in "Synthesis by Receiver", which "closes the communication loop in the final step to achieve shared understanding" ([Ait Aiss et al.: I-PASS nursing handoffs](https://pmc.ncbi.nlm.nih.gov/articles/PMC12458891/)). Those numbers belong to the whole bundle, not the receiver step alone. The software studies point the same way. Qiao's high-comprehension participants moved from writing code to viewing it 10.8 times on average against 2.3 for the low group ([Qiao et al.: Faster but Not Wiser](https://arxiv.org/html/2511.02922)). Writing the answers down forces that kind of engagement.

Quiz tools are useful practice for this, and they say so themselves. Sphinx has a reviewer that "never saw your chat" read the diff and ask "what the change does when things go wrong" ([Sphinx](https://sphinx-six-theta.vercel.app/)). Its README is plain about the limit:

> This is practice, not a security gate.
> — [Sphinx README](https://github.com/parthh01/sphinx)

vibecheck goes further and posts a commit status so "the PR cannot merge until the author passes", but wrong answers can be retried, after which it reveals the answer ([vibecheck.dev](https://github.com/JoeDrayton/vibecheck.dev)). Explyt's proposed quiz gate, the closest published version of this idea, has the author explain the change before accepting the diff, scaled by risk ([Explyt: Comprehension debt quiz gate](https://explyt.ai/en/blog/comprehension-debt-quiz-gate)). The difference here is who answers and where the answer goes. The person who will be paged writes the explain-back, and it becomes the script the post-merge drill runs against.

Scale the gate by blast radius instead of applying it to every diff. #4812 touches money and gets the full block; a copy change to an email template gets none. The [permission tiers for agent changes](/blog/agent-permission-tiering/) are the sorting key.

---

## Prove Ownership After Merge With a Drill

> **Author's judgment.** Wheel of Misfortune exercises and game days are established SRE practice. Running them specifically on agent-written paths, with the agent unavailable, as a test of ownership is my extension.

Explain-back proves the owner understood #4812 on the day it merged. It does not prove she still does three weeks later, after two more agent sessions have touched `retry.go`. Naur names the moment the gap shows: "The actual state of death becomes visible when demands for modifications of the program cannot be intelligently answered" ([Peter Naur: Programming as Theory Building](https://gist.github.com/onlurking/fc5c81d18cfce9ff81bc968a7f342fb1)). The drill makes that demand on purpose, [on a schedule](/blog/standing-agent-eval-suite/), before production does.

```text {title="Wheel of Misfortune card: webhook duplicate delivery (composite scenario)"}
Target:       PR #4812, internal/payments/webhook (agent-written path)
When:         3 weeks after merge, then once a quarter
Players:      primary = Dana (owner); secondary = next payments on-call
Game master:  payments tech lead
Rules:        no agent, no chat assistant; PR #4812 comprehension block allowed

Scenario:     Provider latency spikes. The same webhook arrives twice,
              1.8s apart, while the first attempt is still writing.
              Page: "charge_amount_mismatch: 14 accounts"

Must find:    1. webhook.event_id on the trace for one affected account
              2. whether charges_applied holds one row or two for it
              3. the flag that stops internal retries, and what it does not stop

Scoring:      each item not found unaided = backlog ticket labelled
              comprehension-debt, assigned to the owner, due before next drill
```

The third item is the one built to fail. `payments.webhook_retries_enabled` stops our retries but not the provider's re-sends. An owner who remembers only the flag name will tell incident command the bleeding has stopped when it has not. A half-working kill switch is a footgun, and a drill is the cheapest place to learn that the owner's theory of it has decayed.

The format is borrowed, not invented. Google's SRE book describes a game master who "has carefully prepared a scenario that is about to unfold" and picks the primary and secondary on-call. It insists that "Realism is paramount in these interactions", because learning "should happen *before* a new SRE reaches that point" of a first real page ([Google SRE: Accelerating SREs to On-Call](https://sre.google/sre-book/accelerating-sre-on-call/)). AWS tells teams to "Involve the same teams who would be responsible for handling production scenarios", which is the owner rule applied to the exercise. Its reliability pillar states the payoff:

> When you practice your response procedures in realistic conditions, you can identify and address any gaps or weaknesses before a real event occurs.
> — [AWS Well-Architected: REL12-BP05 game days](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_testing_resiliency_game_days_resiliency.html)

Taking the agent away is not anti-AI. At 2am the agent may well help, but its context window holds none of the incident until someone pastes it in. The drill measures what the owner can do when the agent's explanation is wrong or missing. One Anthropic engineer already runs a personal version: "Every once in a while, even if I know that Claude can nail a problem, I will not ask it to. It helps me keep myself sharp" ([Anthropic: How AI is transforming work](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic)). The drill is that habit on a team calendar. A quarterly cadence matches Google's guidance that each engineer be on call "at least once or twice a quarter" ([Google SRE: Being On-Call](https://sre.google/sre-book/being-on-call/)). Drill the largest blast radius first: the charge path well before the email template.

---

## The Comprehension Policy on One Page

Run the policy as one table per agent-written change. Each row is a checkpoint from the sections above, with the evidence it accepts, what #4812 looks like there, and what skipping it costs.

| Checkpoint | Evidence it accepts | #4812 at this checkpoint | Cost of skipping |
| --- | --- | --- | --- |
| **On-call cost** | Someone on the paged rotation can debug the change | Payments on-call, not the growth prompter, takes the Tuesday page | Understanding is first paid for during an incident |
| **Broken signals** | Not an approval or a green suite on its own | "LGTM" in four minutes and 214 green tests said nothing about the retry path | False confidence that the change is understood |
| **The split** | Written contract, invariants, failure modes, debug path; the rest marked regenerable | `event.id` as idempotency key, one `charges_applied` row per event, three failure modes, `webhook.event_id` plus the retry flag; `retry.go` and `parse.go` regenerable | Either nobody holds the theory or everyone tries to hold all 600 lines |
| **Owner** | A named person on the rotation that gets paged | Dana, payments rotation, not the growth engineer | Ownership defaults to `git blame` |
| **Explain-back gate** | The owner's own words in the PR, scaled by blast radius | Comprehension block filled before merge; the invariant prompt surfaces the check-then-insert race | The first written explanation happens mid-incident |
| **Drill** | Unaided debugging of a simulated failure on the path | Duplicate-delivery scenario three weeks later, no agent, gaps become tickets | Decay since merge stays invisible until the next real page |

The PR block, a checker that fails an unowned or unfilled one, and the drill card with its backlog rule are in [comprehension-gate](https://github.com/johnayoung/agent-engineering-toolkit); copy the template, label your agent PRs, and make the check required.

---

## References

### Research and Data

1. [Anthropic: AI assistance and coding skills](https://www.anthropic.com/research/AI-assistance-coding-skills) — In a randomized trial of 52 mostly junior engineers, the AI group averaged 50% on a comprehension quiz against 67% for hand coders, with the largest gap on debugging. Backs the hook and the on-call cost section.
2. [Shen and Tamkin: How AI Impacts Skill Formation](https://arxiv.org/html/2601.20245) — AI assistance impaired conceptual understanding, code reading, and debugging (Cohen's d = 0.738 overall; debugging breakdown exploratory). Source of the "validate and debug AI-written code" warning.
3. [Balepur et al.: (Im)Paired Programming](https://arxiv.org/html/2607.26375v1) — Initial task accuracy barely improves prediction of comprehension (adjusted R2 0.40 to 0.42); auto-accepters scored 0.615 against 0.777 for file-by-file reviewers. Student sample, exploratory.
4. [Qiao et al.: Faster but Not Wiser](https://arxiv.org/html/2511.02922) — With Copilot, 15 CS graduate students passed 7.2 tests against 4.2 without it, with no comprehension gain (p=0.59). High-comprehension participants moved from writing to viewing code 10.8 times against 2.3.
5. [Lee et al.: GenAI and critical thinking](https://www.microsoft.com/en-us/research/publication/the-impact-of-generative-ai-on-critical-thinking-self-reported-reductions-in-cognitive-effort-and-confidence-effects-from-a-survey-of-knowledge-workers/) — Among 319 knowledge workers, higher confidence in GenAI is associated with less self-reported critical thinking. The only professional-population signal cited.
6. [LeadDev: AI code causes production outages](https://leaddev.com/ai/ai-code-causes-real-world-production-outages) — An Undo-sponsored survey of 300 senior engineering leaders reports 35% of AI-generated code reaches production before it is fully comprehended. Vendor survey, self-reported.
7. [Anthropic: How AI is transforming work](https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic) — A survey of 132 Anthropic engineers and researchers names the paradox of supervision: supervising Claude takes the skills that may atrophy from overuse. Also the source of the "keep myself sharp" quote.
8. [Bacchelli and Bird: Modern Code Review](https://sback.it/publications/icse2013.pdf) — 91% of 873 surveyed programmers said reviewing unfamiliar files means learning their purpose, invariants, and APIs. Backs the must-hold list.
9. [Bird et al.: Don't Touch My Code!](https://www.microsoft.com/en-us/research/publication/dont-touch-my-code-examining-the-effects-of-ownership-on-software-quality/) — In Windows Vista and Windows 7, the number of minor contributors has a strong positive relationship with pre- and post-release failures. Pre-AI, correlational.
10. [Sadowski et al.: Modern Code Review at Google](https://sback.it/publications/icse2018seip.pdf) — At Google, review was seen as ensuring more than one person is familiar with each piece of code. Scoped to Google only.
11. [Storey: Technical, Cognitive and Intent Debt](https://arxiv.org/abs/2603.22106) — Intent debt is the absence or erosion of explicit rationale, goals, and constraints; low bus factor and loss of transactive memory are cognitive-debt signals.
12. [Starmer et al.: I-PASS handoff program](https://www.nejm.org/doi/full/10.1056/NEJMsa1405556) — Across 10,740 admissions in nine hospitals, the I-PASS bundle was associated with a 23% drop in medical errors and a 30% drop in preventable adverse events. Figures belong to the whole bundle.
13. [Peter Naur: Programming as Theory Building](https://gist.github.com/onlurking/fc5c81d18cfce9ff81bc968a7f342fb1) — A program's modifiability lives in the theory its programmers hold, and reviving that theory from documentation alone is impossible.
14. [Parnas: On the Criteria for Decomposing Systems](https://dl.acm.org/doi/10.1145/361598.361623) — Information hiding: a module is defined by the design decision it hides, so its interface is the durable contract. Cited by principle.

### Practitioner Guidance

15. [Google SRE: Being On-Call](https://sre.google/sre-book/being-on-call/) — Knowledge gaps are discovered only when an incident occurs; size teams so every engineer is on call at least once or twice a quarter.
16. [Google SRE: Introduction](https://sre.google/sre-book/introduction/) — Recording best practices ahead of time in a playbook produces roughly a 3x improvement in MTTR over winging it.
17. [Google SRE Workbook: On-Call](https://sre.google/workbook/on-call/) — Playbook details go out of date as fast as production changes; teams role-play recent incidents to practice debugging.
18. [Google SRE: Accelerating SREs to On-Call](https://sre.google/sre-book/accelerating-sre-on-call/) — Wheel of Misfortune: a game master runs a prepared, realistic scenario so learning happens before the first real page.
19. [AWS Well-Architected: REL12-BP05 game days](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_testing_resiliency_game_days_resiliency.html) — Practicing response in realistic conditions finds gaps before a real event; involve the teams who would handle production.
20. [Anthropic Engineering: How we contain Claude](https://www.anthropic.com/engineering/how-we-contain-claude) — Users approved roughly 93% of permission prompts, and attention fell as approvals piled up. Cited as an approval-fatigue analogy, not a code-review finding.
21. [Linux kernel: Guidelines for Tool-Generated Content](https://docs.kernel.org/process/generated-content.html) — Submitters must understand and be able to defend everything they submit, or not submit it.
22. [Storey: Cognitive debt](https://margaretstorey.com/blog/2026/02/09/cognitive-debt/) — Teams may wish to require that at least one human fully understands each AI-generated change before it ships.
23. [Charity Majors: AI demands more engineering discipline](https://charity.wtf/p/ai-demands-more-engineering-discipline) — If we cannot regenerate our code the same way, we do not understand it; trust has to move into specs and production validation.
24. [Böckeler: Understanding Spec-Driven Development](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) — In spec-as-source tools only the spec is edited by humans, and regenerating from the same spec showed non-determinism.
25. [The Morning Paper](https://blog.acolyer.org/2016/09/05/on-the-criteria-to-be-used-in-decomposing-systems-into-modules/) — Adrian Colyer's summary of Parnas, source of the quoted module definition.
26. [Shrivastava: Comprehension debt](https://dev.to/amit_shrivastava_e813c728/comprehension-debt-what-ai-written-code-actually-costs-2m02) — A silent approval on a four-hundred-line agent-written change is not evidence of understanding.
27. [Hacker News: Ask HN](https://news.ycombinator.com/item?id=50151036) — The thread on shipping AI-written code you don't understand drew 621 points and more than 760 comments. Demand signal.
28. [xinu2020 on Hacker News](https://news.ycombinator.com/item?id=50158083) — You are the owner and accountable, so you need to justify your choices and your agent's.
29. [linsomniac on Hacker News](https://news.ycombinator.com/item?id=50160011) — An operations engineer ships much code he doesn't understand, relying on testing, monitoring, and staging. The objection answered in the dependencies subsection.
30. [Ait Aiss et al.: I-PASS nursing handoffs](https://pmc.ncbi.nlm.nih.gov/articles/PMC12458891/) — I-PASS ends in Synthesis by Receiver, the step that closes the communication loop to reach shared understanding.
31. [Sphinx](https://sphinx-six-theta.vercel.app/) — A reviewer model that never saw your chat reads the diff and asks what the change does when things go wrong.
32. [Sphinx README](https://github.com/parthh01/sphinx) — The tool's own README calls it practice, not a security gate, and says passing does not prove unaided understanding.
33. [vibecheck.dev](https://github.com/JoeDrayton/vibecheck.dev) — A merge-blocking commit status that quizzes the author, revealing answers after retries.
34. [Explyt: Comprehension debt quiz gate](https://explyt.ai/en/blog/comprehension-debt-quiz-gate) — Proposes a risk-tiered, change-specific quiz the author answers before merge, piloted on one class of changes. The closest published approach.
35. [agent-engineering-toolkit: comprehension-gate](https://github.com/johnayoung/agent-engineering-toolkit) — A PR template block, a merge check, and a no-agent drill card that turn this post's ownership policy into files you can drop into a repo. The checker confirms the explain-back exists and names an owner on the paged rotation; it cannot confirm the owner wrote it or that it is true.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"Comprehension debt is an on-call problem"**: Follows from the debugging gap (Anthropic, Shen and Tamkin), knowledge gaps surfacing only in incidents (Google SRE), the Undo survey's comprehension and misdiagnosis figures, and the paradox of supervision.
- **"The four must-hold items: contract, invariants, failure modes, debug path"**: Assembled from Naur, Bacchelli and Bird's purpose/invariants/APIs, Google SRE's playbook guidance, Storey's intent debt, and Parnas's information hiding.
- **"Gate the merge on the owner's explain-back"**: No study tests explain-back in code review; borrowed from I-PASS receiver synthesis and supported indirectly by the engagement findings in Qiao and Balepur.
- **"Drill agent-written paths without the agent"**: An extension of Wheel of Misfortune and AWS game days to ownership of agent-written code.
- **"An agent session is the extreme case of a minor contributor"**: My extension of Bird et al.'s pre-AI ownership finding.

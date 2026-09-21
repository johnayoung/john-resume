---
title: "Where a Decision Model Belongs: Placing Jev in Your Stack"
date: 2026-09-21
draft: false
pillar: architecture-decisions
author: "John Young"
description: "Jev's launch numbers answer a question you don't have. The tier it joins already ships at Anthropic, Meta and OpenAI, with the costs published."
keywords: [jev typesafe system one model, decision model placement, calibrated classifier, confidence threshold, agent architecture]
tldr:
  - "Jev's launch numbers answer a question you don't have: the real work is deciding which decisions move down a tier, which should never leave deterministic code, and who owns the confidence threshold once a model sits in the loop."
  - "TypeSafe's own docs concede that calibration is measured across groups of predictions and does not guarantee any individual answer is correct, even as its launch post claims the model never makes type errors, so the placement question is what you do with a number that's well calibrated in aggregate and unverified case by case."
  - "Resolve everything you can state as a rule before it ever reaches a model, route only the genuinely ambiguous residual to a decision model (per Flavio Copes's act, review, escalate split and his point on version pinning), then derive your own threshold by plotting confidence against accuracy on your labelled traffic under a pinned model version, since the band decays on two separate axes: the model changing and your traffic changing."
  - "The one independent stress test of a shipped gate found that more than a third of dangerous actions never reached the classifier at all, an adversarial benchmark the authors themselves say isn't comparable to a vendor's organic-traffic numbers, so audit what never reaches the model before you spend a day tuning what does."
---
{{< eli5 hint="no background needed · 11 min" audience="for readers outside AI engineering" >}}
This is about a new AI product called Jev, built to answer narrow yes-or-no questions inside software, and why the interesting question isn't "is it good" but "what job, if any, should it actually be doing."

## The big idea

Imagine a company has a rule that any request to delete files needs a check before it happens. You could hire an expensive specialist to personally review every single deletion request. Or you could set up a front-desk checklist that handles the obvious cases immediately, things that are always fine to delete and things that must never be deleted, and only send the genuinely unclear cases up to the specialist. Jev is being marketed as the specialist. This post argues that judging whether the specialist is impressive misses the point. The real questions are: which requests should even reach that desk, what does the specialist cost compared to whoever is already doing that job, and what happens on the days the front-desk checklist gets skipped entirely and requests slip past both of them unchecked.

## What you actually get back is a number, not a decision

Jev doesn't tell your software "yes, delete it" or "no, don't." It hands back a number between 0 and 1, like a confidence percentage, saying how sure it is the answer is yes. Nothing gets deleted, blocked, or approved automatically. Your own code still has to look at that number and decide what to do with it.

Two practical headaches show up in that same response, and neither one shows up in a speed comparison chart. First, if you ask for "the latest version" of the model, the label can quietly point to a different actual version later without you changing anything, so the answers behind it can shift under you. Second, different companies that host the same model publish different numbers for how much information you can safely send it in one go, so even the basic technical specs aren't settled. And, in the author's own reading of how the two systems are built (not something either company states outright), swapping in a model like Jev isn't a quick vendor swap the way switching one general-purpose chatbot for another is. You have to define your own named questions, sort the possible answers into categories, and log everything in a shape nothing else in your system uses. That's real setup work.

## The vendor makes two statements that sound contradictory, but aren't

Think of a weather forecaster whose predictions get checked over a whole year. If she says "70% chance of rain" a hundred times, and it actually rains on about seventy of those days, she is well calibrated: accurate on average, across many predictions. That says nothing about whether it will rain on this one particular day she gives that number.

Jev's calibration claim works the same way. Averaged across many answers, its confidence numbers line up with how often it turns out to be right. That's a real, measured property. It is not a promise that this specific answer, right now, is correct.

That's why the company can say, on one page, that the model "never makes type errors," and on another page, that "calibration does not guarantee that an individual answer is correct." Both are true, and they're about different things. One is a guarantee about the shape of what comes back: you will always get a real number, never garbage. The other is an explicit refusal to guarantee the content of that number in any one case. The question this raises for anyone using it is what you're supposed to do with a number that's trustworthy on average but unverified in the specific instance you're actually looking at.

## The real comparison isn't against a giant AI model

Cheap yes-or-no checkers sitting in front of AI systems aren't new. Large AI companies have been running this exact kind of tier in production for over a year, and they've published what it costs: a small filter model checking a bigger one adds roughly a quarter more computing cost, and a narrow, purpose-built checker can answer in a tiny fraction of a second.

Jev's headline speed numbers are measured against giant, general-purpose AI models, not against these existing cheap checkers already doing this job elsewhere. So a big speedup number tells you nothing about whether Jev is actually faster or cheaper than whatever you might already be using for this exact task. One outside commentator, arguing something he flags clearly as his own speculation rather than a settled fact, adds a related point: a general-purpose checker like Jev has to carry some knowledge of many possible tasks so it can handle all of them, which makes it bigger and slower than a narrow tool built for just one job. He treats this as a guess about where the market is heading, not a fact you can bank on today.

## Let simple rules handle what they can, and save the model for real gray areas

Picture an emergency room. A nurse with a checklist sorts patients immediately for the obvious cases, and only sends the genuinely unclear ones to a doctor. Systems that already ship this kind of safety check work the same way: fixed written rules go first, routine low-risk actions get automatically waved through, and the AI judgment call only sees what's left over once the first two layers are done with it.

There's a caveat worth keeping straight. If you tell an AI agent something like "don't touch that folder" in conversation, that instruction only exists as words in a transcript. The model has to reread the transcript each time to remember it, and long AI conversations sometimes get trimmed or summarized to save space. If the message stating that instruction gets trimmed out, the boundary can silently stop applying, with nothing in the logs marking the moment it disappeared. A written rule, baked into the system rather than said in conversation, doesn't have that problem. If you actually need a guarantee, it has to live somewhere that can't be quietly forgotten.

## The trust threshold you set isn't fixed, and it goes stale in two separate ways

You decide how confident the model needs to be before you trust its answer without a human double-checking it, for example "only act automatically above 90% confidence." One writer credited for first laying out a practical version of this, splitting responses into three bands (act on it, have someone review it, or escalate it further) with the cutoffs set by how bad a wrong answer would be, is a reader of the product's documentation, not the vendor itself. That threshold isn't a fixed default from the company. It's a dial you're expected to tune using your own real cases, and it can go out of date in two independent ways.

Think of a home fire alarm. One problem: the manufacturer quietly updates the sensor itself, so it reacts differently than before. A separate, unrelated problem: your household's cooking habits change, so ordinary daily life produces more smoke than it used to, and the same sensitivity setting starts causing more false alarms even though the sensor itself never changed. Both things need to be watched, and they need different fixes: one means checking whether the model itself moved, the other means checking whether the mix of situations you're feeding it has shifted.

There's also a real cost to demanding higher confidence before trusting an answer automatically: the stricter you set the bar, the more decisions get kicked back for a person to review by hand. Guaranteeing fewer mistakes and giving up fewer decisions to human review are not both free at once; tightening one always loosens the other.

## The bigger risk is what never gets asked at all

The sharpest independent finding here isn't about the model giving a wrong answer. It's about actions that never reach the checker in the first place, so it never even gets a chance to weigh in.

Picture a security guard stationed at only the front door of a building that actually has three doors. He can be excellent at his job and still miss everything, because people just walk in a side door instead. His own performance log will look great, since it only counts the people who came through his door.

In the one outside, independent stress test of a similar shipped safety system, more than a third of the risky actions being tested got carried out through a different path in the software, one that skipped the checker entirely. Two caveats matter here. First, that test was a deliberately adversarial exercise designed to find weak spots, not a measurement of everyday normal use, and the researchers themselves said their resulting failure rate isn't fairly compared to the vendor's own much lower figure from real-world traffic, because the two numbers measure different things. Second, even setting that aside, the point stands: a dashboard that only tracks how the checker performed on the questions it was actually asked will look perfectly healthy, even while a real chunk of risk quietly goes around it and leaves no record anywhere.

There's a related, smaller-scale version of this problem. Some cheap AI safety checkers can only "read" a small amount of text at once, far less than the AI systems they're supposed to be watching over can handle. That specific measurement wasn't done on Jev itself, so it isn't a finding about Jev, but it raises the fair question of what gets left out or cut off when the checker's own information budget is smaller than the thing it's guarding.

On top of all this, the only outside, structured comparison of Jev's confidence-number accuracy that exists at all was published by a competing company, and to its credit it was unusually upfront about its own limits: it disclosed that its favorable comparison against Jev only holds after it applied an extra fine-tuning step to its own numbers, and that before that step, Jev's confidence numbers were actually the better calibrated of the two. So the small amount of independent evidence out there doesn't clearly settle anything either way; it has to be read as one contested data point, not a verdict.

## What this means for you

Before plugging an AI decision-checker like Jev into anything, first write down every decision you can state as a firm, always-true rule, and let plain code handle those directly with no model involved at all. Send a model only the cases that are genuinely too ambiguous to write a rule for. Before pricing Jev, figure out what you're already spending today on whatever currently makes that call, even if it's just a simple pattern-matching script, and compare Jev's cost to that, not to a giant general-purpose AI's price tag, because that's not the comparison that matters. Don't trust the example confidence cutoffs in anyone's documentation; measure your own real cases, set your own cutoff, and keep rechecking it, watching separately for "did the model change" and "did the mix of cases we're feeding it change." And before worrying about how accurate the checker is, find out what fraction of the risky actions in your system it's even being asked about in the first place, because a checker being quietly bypassed will look flawless in its own numbers while the actual risk slips through untouched. None of this is a verdict on whether Jev is good or bad. It's a way of figuring out which job, if any, actually belongs to a model like this, and which jobs should never have left simple written rules to begin with.

---

**The technical terms, in plain words**
- Decision model = an AI model built to answer a specific, narrow question, like yes or no with a confidence number, instead of writing open-ended text.
- Calibrated / calibration = how well a model's confidence numbers match reality when you check them across many answers (like a weather forecaster whose "70% chance of rain" really does rain about 70% of the time, on average, not necessarily on any single day).
- Confidence threshold / band = the cutoff number you use to decide whether to act on an answer automatically, send it to a person for review, or escalate it further.
- Alias (like "latest") = a label that points to whichever version of a model is current right now, meaning what it points to can quietly change later without you doing anything.
- Context window = the amount of information you can feed a model at once before it runs out of room to consider it.
- Classifier = a tool, whether a fixed rule or an AI model, whose job is sorting things into categories, such as "safe" or "not safe."
- Deterministic rules = fixed, written instructions that give the exact same result every time for the same input, with no judgment involved.
- Coverage = what fraction of the things you actually care about ever get checked at all, as opposed to slipping past the checker unnoticed.
- False negative = a case where something risky should have been caught but wasn't.
- Escalate = sending a decision up to a stricter check or a human, rather than either approving it or flatly refusing it.
- Cascading = putting a cheap, fast check in front of a slower, more expensive one, so the expensive one only has to handle what the cheap one flags as unclear.

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}

Jev's launch numbers answer a question you do not have. The tier it occupies has been running in production at Anthropic, Meta and OpenAI for over a year, and those teams published what it costs: roughly 25 percent inference overhead when a small LLM does the filtering ([Anthropic Alignment Science: Cost-Effective Constitutional Classifiers](https://alignment.anthropic.com/2025/cheap-monitors/)), and 19.3ms per classification for a 22M-parameter purpose-built model ([Chennabasappa et al.: LlamaFirewall](https://arxiv.org/abs/2505.03574)). So the question a new model class raises is not whether it is fast. It is which decisions move down a tier, which ones should never have left deterministic code, and who owns the threshold once they do.

---

## Read the Response Shape Before the Benchmark Table

The launch post's multiples tell you nothing about where the model goes in your architecture. The API reference does, and it takes about ninety seconds to read.

Take the narrowest decision anyone is actually buying this for: should this agent's `rm -rf` run? Written as a Noul question against the documented endpoint, the gate looks like this.

```json {title="The rm_is_safe gate, in the documented request shape"}
POST https://api.typesafe.ai/v1/systemone

{
  "state": {
    "pending_command": "rm -rf ./build",
    "cwd": "/srv/app",
    "requested_by": "agent-session-4412"
  },
  "model": "jev-latest",
  "questions": {
    "rm_is_safe": {
      "type": "noul",
      "instructions": "Is this removal confined to build output this session created?",
      "criteria": {
        "true": "Target is disposable build output",
        "false": "Target may contain source or data"
      }
    }
  }
}
```

What comes back is not an allow or a deny. It is an `answers` object keyed by your question id, carrying a `noul` field that the docs define as "The yes/no answer on a scale from 0 (no) to 1 (yes)," plus a `usage` block and the model id that actually answered ([TypeSafe: API reference](https://docs.typesafe.ai/api)). Nothing in the payload executes anything. You still have to write the `if`.

Two details in that payload are load-bearing and neither one appears in a benchmark table. The vendor's own example response returns `"model": "jev-1.13.0"` for a request that asked for `jev-latest`, which means alias resolution is visible in the payload of every call you make ([TypeSafe: API reference](https://docs.typesafe.ai/api)). And `state` accepts "A plain string for text, or structured data (object/array) for things like chat logs, records, or the current state of your application," which is the seam where your context window budget and the model's stop being the same number.

> **Author's judgment.** The observation that this request shape diverges from the OpenAI chat-completions convention is mine. It follows from reading the two schemas side by side: TypeSafe's body is `state` plus a map of named typed questions, where a chat-completions body is a message array. Neither vendor states the contrast, so the integration cost that follows from it is an inference, not a published claim.

That divergence is the part the speed comparison hides. Swapping one chat-completions provider for another is a base-URL change; adopting a System One model means writing question definitions, naming them, banding their outputs, and logging them, in a shape no other model in your stack uses. That is integration work, not a model swap.

The hosts do not even agree on the budget you design against. TypeSafe's own Models page publishes "64k tokens per request; 32k tokens for `state` plus the longest question" ([TypeSafe: Models](https://docs.typesafe.ai/models)), while OpenRouter lists 32K context for `typesafe/jev-1.13` ([OpenRouter: Typesafe API and Models](https://openrouter.ai/typesafe)) and Cloudflare publishes a 32,000-token context window on its model page ([Cloudflare Docs: Jev](https://developers.cloudflare.com/ai/models/typesafe/jev/)). Pick whichever you like; just know you picked one.

And before you read the launch page, read the concepts page, because the vendor has already limited its own claim.

> Calibration is measured across groups of predictions; it does not guarantee that an individual answer is correct.
> — [TypeSafe: System One](https://docs.typesafe.ai/concepts/system-one)

The launch post, on the same domain, says "The model never makes type errors" ([TypeSafe: Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)). Both statements are true and they are about different things. One is a guarantee about the shape of the answer. The other is an explicit refusal to guarantee the content of it. **The placement question is therefore: what do you do with a number that is well calibrated in aggregate and unverified in the individual case?**

---

## The Tier Already Ships at Anthropic, Meta and OpenAI

Before you price Jev, price whatever is answering `rm_is_safe` in your system today. You already run something in that slot, even if it is a regex, and the replacement cost is the difference between the two, not the vendor's multiple against a frontier LLM.

There are three published tiers, and your current answer is one of them.

| Tier answering `rm_is_safe` today | Published cost | Source |
| --- | --- | --- |
| Deterministic static analysis and pattern matching | Scans in approximately 60ms; ~90% of inputs fully resolved by the first layer at under 70ms end-to-end | [Chennabasappa et al.: LlamaFirewall](https://arxiv.org/abs/2505.03574) |
| Purpose-built small classifier | 19.3ms (22M params) or 92.4ms (86M params) per classification, A100, 512 tokens | [Chennabasappa et al.: LlamaFirewall](https://arxiv.org/abs/2505.03574) |
| A small LLM used as the filter | Approximately 25% inference overhead (Haiku 3.5 filtering Sonnet 3.5) | [Anthropic Alignment Science: Cost-Effective Constitutional Classifiers](https://alignment.anthropic.com/2025/cheap-monitors/) |

Those are not projections. LlamaFirewall reports the first-layer numbers from internal production deployments, and notes that "For the remaining 10% of cases requiring deeper inspection, end-to-end latency can exceed 300 milliseconds" ([Chennabasappa et al.: LlamaFirewall](https://arxiv.org/abs/2505.03574)). The shape of a shipped guardrail stack is a cheap tier that resolves nearly everything and an expensive tier that sees the residual.

The tax on that slot has been public since January 2025. Anthropic's first-generation constitutional classifiers shipped with the bill attached: "These classifiers also maintain deployment viability, with an absolute 0.38% increase in production-traffic refusals and a 23.7% inference overhead" ([Sharma et al.: Constitutional Classifiers](https://arxiv.org/abs/2501.18837)). A year later the same team cut that to roughly 1 percent additional compute by cascading, with a 0.05 percent refusal rate on harmless queries measured over a month of Sonnet 4.5 traffic ([Anthropic: Next-generation Constitutional Classifiers](https://www.anthropic.com/research/next-generation-constitutional-classifiers)). The cascade design is the part worth stealing:

> Since exchanges flagged by the first stage are escalated rather than refused, the first-stage classifier can flag a higher proportion of production traffic without incurring an excessive refusal rate.
> — [Cunningham et al.: Constitutional Classifiers++](https://arxiv.org/abs/2601.04603)

In deployment that first-layer probe escalated approximately 5.5 percent of traffic to the second stage, for approximately a 40x reduction compared to the single exchange classifier ([Cunningham et al.: Constitutional Classifiers++](https://arxiv.org/abs/2601.04603)). Escalating instead of refusing is what buys the cheap tier its false-positive budget, and it is the reason a gate's band design matters more than its headline accuracy.

OpenAI says the same thing from the other direction, comparing its reasoning-based safety model against the classifiers it sits behind: "Traditional classifiers have lower latency and cost less to sample from than gpt-oss-safeguard" ([OpenAI and ROOST: User guide for gpt-oss-safeguard](https://developers.openai.com/cookbook/articles/gpt-oss-safeguard-guide)). These tiers are complements. Nobody shipping this at volume treats them as substitutes.

### Read a cost claim against the baseline it declines to name

Jev's published multiples are measured against frontier LLMs, not against the tier above. The launch post's numbers come from "Workflow evals" in which, in the vendor's words, "we test how they compare to the average of the smartest models (in this case, Astra and Fable)" ([TypeSafe: Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)). DataCamp traced the headline accuracy figure to the same construction: "Jev averages 67.8% agreement with the reference answers," where the scoring is done "against the average predictions of GPT-6 Astra and Anthropic's Fable" ([Matt Crabtree: Jev: TypeSafe's System One Model Explained](https://www.datacamp.com/blog/system-one-models-jev)). That is agreement with a synthetic consensus of two other vendors' models, not agreement with ground truth. The same piece says plainly that "All the numbers below come from TypeSafe's own evaluation tables, and no large-scale independent reproduction has surfaced yet, so treat them as vendor-reported."

I have written elsewhere about why a vendor-run eval is not a procurement signal ([why leaderboard movement is mostly noise](/blog/coding-agent-leaderboard-noise/)); the point here is narrower. A 40x speedup against a frontier LLM is not a speedup against a 19.3ms classifier, and no published number compares the two.

The slot may also be temporary. sean goedecke argues that a generic decision model carries weights for tasks you do not have: "Generic classifiers have to encode knowledge of all kinds of irrelevant things in their weights, so they can address lots of different tasks. That makes them larger, slower, and more expensive to run," and concludes that "For serious work, a specific hand-built classifier will always be cheaper and faster than Jev" ([sean goedecke: System One models like Jev can train their own replacements](https://www.seangoedecke.com/system-one-models-can-train-their-own-replacements/)). He flags this as speculation, writing "I expect this to be a common pattern," and he notes the bespoke path still needs ML expertise, just deferred until after the feature is validated. Treat it as a hypothesis about the shape of the market rather than a shelf life you can put in a spreadsheet. It still changes the buy decision: you may be renting the tier while you find out [whether the feature is worth owning](/blog/build-vs-buy-agentic-ai/).

---

## Deterministic Rules First, the Model on the Residual

Resolve every action you can state as a rule before any of it reaches a model. This is not a preference. It is the documented, shipped decision order for the one pre-execution gate with a public spec, and the model sits in third position.

Claude Code's auto mode puts it in writing: "Each action goes through a fixed decision order. The first matching step wins." Allow, ask and deny rules resolve immediately; read-only actions and file edits in your working directory are auto-approved; "Everything else goes to the classifier" ([Claude Code: Choose a permission mode](https://code.claude.com/docs/en/permission-modes)). Applied to `rm_is_safe`, most removals never become a model call at all.

| When you see | What it means | Do this |
| --- | --- | --- |
| A command you can enumerate exactly (`npm test`, `git status`) | Deterministic. No judgment required. | Allow rule. The model never sees it. |
| A class of action you will never permit (`rm -rf /`, `terraform destroy`) | The blast radius of one false negative is unbounded. | Deny rule. Deny holds in every mode. |
| Reads and in-directory edits | High volume, low blast radius, bounded and verifiable | Auto-approve the tier, not each call. |
| A removal whose target you cannot resolve statically (`rm -rf "$BUILD_DIR"`) | Genuine residual ambiguity | Route to `rm_is_safe`. This is the model's job. |
| A constraint you stated in conversation ("don't push yet") | Model-mediated, re-read from the transcript on every check | Convert it to a deny rule if you need a guarantee. |

The hierarchy is not clean, and the exceptions are the interesting part. On the same page, writes to protected paths "route to the classifier even when an allow rule matches, and so do `rm` and `rmdir` removals targeting a critical path in Claude Code v2.1.218 and later." Broad allow rules that grant arbitrary code execution, including blanket `Bash(*)` and wildcarded interpreters like `Bash(python*)`, are dropped on entering auto mode, while "Narrow rules like `Bash(npm test)` stay in effect" ([Claude Code: Choose a permission mode](https://code.claude.com/docs/en/permission-modes)). In other words: the deterministic layer wins by default, and the model overrides it precisely where a rule is too coarse to be trusted.

Inventorying that deterministic layer is its own exercise, and most teams have never done it ([audit the harness before you blame the model](/blog/agent-harness-audit/)). A decision model is one candidate implementation of the coordination layer that belongs outside each agent's prompt ([coordination logic belongs in an architecture layer](/blog/multi-agent-coordination-layer/)), but it is only ever the residual half of that layer. OpenAI's guidance draws the same line: "Rules alone handle deterministic cases well (e.g., keyword matches, metadata thresholds), but they can struggle with satire, coded language, or nuanced policy boundaries" ([OpenAI and ROOST: User guide for gpt-oss-safeguard](https://developers.openai.com/cookbook/articles/gpt-oss-safeguard-guide)). Rules are not weaker than the model. They are stronger, on a narrower set.

### Prefer a deny rule over a model-mediated boundary

**Bad:** Tell the agent "don't touch `./data`, only clean `./build`" and let `rm_is_safe` enforce it on every removal for the rest of the session.

**Good:** Write the constraint into the harness, and let `rm_is_safe` see only what the rules cannot resolve.

```json {title="The deny rule the rm_is_safe gate does not replace"}
{
  "permissions": {
    "deny": ["Bash(rm -rf ./data*)"],
    "allow": ["Bash(rm -rf ./build)"]
  }
}
```

The difference is not stylistic. A stated boundary lives in the transcript, and the transcript is a lossy medium:

> Boundaries are not stored as rules. The classifier re-reads them from the transcript on each check, so a boundary can be lost if context compaction removes the message that stated it. For a hard guarantee, add a deny rule instead.
> — [Claude Code: Choose a permission mode](https://code.claude.com/docs/en/permission-modes)

That is the footgun in the whole category. A model-mediated constraint [degrades silently with context pressure](/blog/loop-engineering-breaks-your-playbook/), and nothing in your logs marks the moment it stopped applying. If you need a guarantee, the guarantee has to live somewhere the context window cannot evict it.

---

## Your Threshold Moves on Two Independent Axes

The number you compare `rm_is_safe` against is a parameter you own, and it decays along two axes that need different instruments. Miss either one and the gate keeps returning confident answers against a threshold that no longer means what it meant when you set it.

> **Author's judgment.** The three-band act / review / escalate split, with the edges set by what a wrong answer costs, is not mine: Flavio Copes published it first ([Flavio Copes: A deep dive into Jev, TypeSafe's System One model](https://flaviocopes.com/jev/)). What follows is the layer underneath it. TypeSafe's build guide describes a two-outcome pattern and shows a two-sided uncertainty window in code; Hendrickx et al. formalize the reject option as a single threshold with two outcomes; Constitutional Classifiers++ supplies the escalate-rather-than-refuse principle. The synthesis I am claiming is narrower: the two-axis decay, and a separate instrument for each axis. No source states it.

This is old ground. "Machine learning models always make a prediction, even when it is likely to be inaccurate," and rejection as a response to that was, in the authors' words, "already studied in 1970" ([Hendrickx et al.: Machine Learning with a Reject Option](https://arxiv.org/abs/2107.11277)). Banding a probability is not new architecture. It is a fifty-year-old technique with a known price, and the price is coverage: Geifman and El-Yaniv showed "an unprecedented 2% error in top-5 ImageNet classification can be guaranteed with probability 99.9%, and almost 60% test coverage" ([Geifman and El-Yaniv: Selective Classification for Deep Neural Networks](https://arxiv.org/abs/1705.08500)). Guaranteeing the error rate cost roughly forty percent of the answers. Whatever band you set on `rm_is_safe`, you are buying the same trade, and the vendor's accuracy table does not show it to you.

**Axis one is the model.** Flavio Copes has already covered this half, and covered it well: on version pinning he writes that "The response reports the versioned ID that answered, so log it, and pin that ID once you've tuned thresholds against it" ([Flavio Copes: A deep dive into Jev, TypeSafe's System One model](https://flaviocopes.com/jev/)). He also reads the vendor's own numbers carefully, noting that "the docs use 0.5 as a review floor and 0.9 before a destructive action, as examples, not defaults." The vendor agrees that the alias moves: "An alias moves when a new release ships, so the answers behind it can change without a change on your side" ([TypeSafe: Models](https://docs.typesafe.ai/models)).

> **Author's judgment.** Calling `jev-latest` and `omni-moderation-latest` floating aliases is my characterization. TypeSafe's "an alias moves" line supports it directly. OpenAI's moderation docs never use the words "alias" or "floating"; they describe the mechanism and its consequence, and I am naming the pattern the two share.

That pattern has four years of precedent in a shipping product of exactly this shape, and the vendor has spent those years telling customers the threshold is theirs and that it will move. OpenAI's moderation endpoint returns per-category scores between 0 and 1, and the docs are explicit about who owns the decision:

> Treat moderation scores as signals for your application's policy, not as an automatic blocking decision.
> — [OpenAI: Moderation](https://developers.openai.com/api/docs/guides/moderation)

The same page warns that "We plan to continuously upgrade the moderation endpoint's underlying model. Therefore, custom policies that rely on `category_scores` may need recalibration over time."

**Axis two is your traffic, under a fixed model version, and this is the one nobody has written down.** A pinned `jev-1.13.0` does not save you if the distribution of commands hitting `rm_is_safe` changes. Ovadia et al. found across image, text and tabular classifiers under dataset shift that "traditional post-hoc calibration does indeed fall short, as do several other previous methods" ([Ovadia et al.: Can You Trust Your Model's Uncertainty?](https://arxiv.org/abs/1906.02530)). That is 2019 work on non-LLM classifiers under synthetic corruption, so reading it onto a synthetic-data-trained decision model in 2026 is my extrapolation, not their finding. The routing literature names the same hazard more precisely. Confidence-based deferral "often works remarkably well in practice," and post-hoc mechanisms beat it specifically where "downstream models are specialists that only work well on a subset of inputs," where samples carry label noise, and where "there is distribution shift between the train and test set" ([Jitkrittum et al.: When Does Confidence-Based Cascade Deferral Suffice?](https://arxiv.org/abs/2307.02764)). Confidence routing is not broken. It has three named ways to break, and an agent gate whose command mix changes with every new tool is sitting on the third one.

| The threshold decays when | Axis one: the model moves | Axis two: your traffic moves |
| --- | --- | --- |
| What changes | The answers behind `jev-latest` after a new release ships | The distribution of commands hitting `rm_is_safe` |
| What you see | A changed `model` string in the response | A moved reliability curve under an unchanged `model` string |
| What you run | Pin `jev-1.13.0` and log the returned `model` with every answer | Re-plot confidence against accuracy on a fresh labelled sample |

The vendor, to its credit, tells you to do the work yourself: "Test thresholds by plotting confidence against accuracy on your data" ([TypeSafe: How to build with TypeSafe](https://docs.typesafe.ai/concepts/how-to-build-with-system-one)). That is the whole procedure in one sentence and almost nobody runs it. Here is the longer version:

1. **Pin the version.** Send `jev-1.13.0`, never `jev-latest`, and record the `model` string the response returned next to every answer.
2. **Label a sample of your own traffic.** A few thousand real `rm_is_safe` calls with a human verdict attached beats any published accuracy table, because it is drawn from your command distribution rather than someone's workflow eval.
3. **Plot confidence against accuracy on that sample** and read the reliability curve, not the single accuracy number.
4. **Read the coverage price off the curve before you set the band.** Pick the error rate you can live with, then look at how many decisions you just gave up.
5. **Scale the band edges to what being wrong costs**, which is a risk-tiering question you should already have answered ([tier the agent's authority by cost of being wrong](/blog/agent-permission-tiering/)), not a property of the model.
6. **Re-run on a cadence with a test built for repeated looking.** Checking once is not monitoring, and checking naively is worse than not checking.
7. **Alarm on the two axes separately**, per the table above. They have different fixes.

Step 6 is the one that catches people. Classical calibration metrics "provide static calibration assessment but do not address sequential monitoring with false alarm control." The naive alternative is actively misleading: "A practitioner who checks calibration daily with a p<0.05 threshold will, over a year of monitoring, almost certainly observe spurious alarms even if calibration remains stable" ([Farran: When Your Model Stops Working](https://arxiv.org/html/2603.13156)).

All of that has to be legible per decision, which means [the gate writes a row, not a boolean](/blog/agent-observability-trace-schema/).

```json {title="What each rm_is_safe decision should write to your logs"}
{
  "gate": "rm_is_safe",
  "model_requested": "jev-1.13.0",
  "model_returned": "jev-1.13.0",
  "noul": 0.93,
  "band": "review",
  "band_edges": {"act": 0.97, "escalate": 0.80},
  "band_set_id": "2026-09-14-traffic-sample-4k",
  "ground_truth": null
}
```

Every number in that record is illustrative: the probability is invented and the band edges are placeholders for whatever your own reliability curve produces, because no published source has a number for your traffic. The fields are the point: `model_returned` makes a moved alias a diff instead of an incident, `band_set_id` tells you which calibration run a given decision was made under, and `ground_truth` stays null until a human or a downstream outcome fills it in. That last field is what turns a log into the labelled sample step 2 asks for.

One more reason to treat calibration numbers as conditional: the only structured non-TypeSafe comparison that exists is a competitor's model card, and it is unusually honest about its own limits. It reports a 0.081 expected calibration error against Jev's 0.246, and then immediately discloses that "Laya achieves its 0.081 ECE after domain temperature fitting" and that "Before temperature scaling, the base checkpoint has higher raw ECE (0.213 vs 0.144)" ([ConvAI Innovations: Laya model card](https://huggingface.co/convaiinnovations/laya)). Before the fitting step, Jev is the better calibrated of the two. The card also states that "Jev figures are third-party published, never measured here (no TypeSafe API access); sample sizes and prompts differ." A calibration number is a statement about a fitting procedure on a dataset, which is exactly why yours has to come from your data.

None of this is a complaint about the product. It is the deal, and one of the earliest critics named it precisely:

> "At the end of the day, it delegates the hallucination problem a little bit to the user," explained Ronacher. "The user has to say, okay, if this only comes back with 50% probability, maybe this is a coin toss, and I disregard it. But if it's 95%, sure, then I can do something with it."
> — [Tim Fernholz: A new kind of AI model from a ChatGPT inventor is thrilling developers](https://techcrunch.com/2026/09/18/a-new-kind-of-ai-model-from-a-chatgpt-inventor-is-thrilling-developers/)

Armin Ronacher, CTO of Earendil, is describing the transfer accurately. The model hands you a number and the judgment moves to your side of the boundary.

---

## The Gate Fails on Coverage, Not on Schema

Audit what never reaches the model before you spend a day tuning what does. The only independent stress test of a shipped pre-execution gate found that more than a third of the dangerous actions were never evaluated at all, and no amount of threshold work touches that channel.

Ji et al. ran a 128-prompt adversarial DevOps benchmark against Claude Code's auto mode and decomposed the failures by tier. The finding that matters for placement is not the headline error rate.

| Scope | Actions | False negatives |
| --- | --- | --- |
| All state-changing actions | 253 | 115 |
| Tier 3, evaluated by the classifier | 160 | 64 |
| Tier 2, never evaluated by the classifier | 93 | 51 |

"Of the 253 actions, 93 (36.8%) were performed via Edit or Write tool calls, which are routed through Tier 2 and are not evaluated by the classifier" ([Ji et al.: Measuring the Permission Gate](https://arxiv.org/abs/2604.04978)). Every unsafe action in that row is a false negative by construction, because the gate never got a vote. The authors name the architectural assumption directly:

> auto mode assumes dangerous actions transit the shell, but agents routinely achieve equivalent effects through file edits that the classifier does not evaluate.
> — [Ji et al.: Measuring the Permission Gate](https://arxiv.org/abs/2604.04978)

Read the table honestly, though, because it does not say what the headline suggests. Coverage is 51 of 115 false negatives, the minority cause. Classifier misjudgment on actions it did evaluate accounts for 64, and "restricting to the 160 actions the classifier actually evaluates (Tier 3), the FNR is still 70.3%." The authors are also explicit that their 81.0 percent end-to-end false-negative rate is not a rebuttal of the vendor's number: "Neither rate is directly comparable to Anthropic's reported 17% FNR on production traffic, which measures accidental overshoot on organic developer workloads." This is one model, one threat category, four synthetic task families. It is a workload-sensitivity result, not a scandal.

Coverage is not the biggest failure channel; it is the invisible one. A misjudged Tier 3 action shows up in your gate's own metrics as a decision that was made and was wrong. A Tier 2 action that routes around the gate produces no record anywhere, and your `rm_is_safe` dashboard stays green while the agent writes the same destruction into a file. **The first question about a decision model is therefore not how accurate it is, but what fraction of the actions you care about it is even asked about.** Vendor accuracy tables measure the numerator of a fraction you have not computed ([why leaderboard movement is mostly noise](/blog/coding-agent-leaderboard-noise/)).

### Ask what the model can see relative to the actor it guards

Coverage has a second form, and it is measured in tokens rather than tool names. Zhou et al. identify "a critical blind spot arising from the mismatch between the limited inspection windows of guardrail models and the substantially larger context inference windows of downstream LLMs" ([Zhou et al.: Prompt Overflow](https://arxiv.org/abs/2605.23196)). Their measured case is stark: "most current guardrail models (e.g., Llama Prompt Guard 2) only operate with an effective context window of 512 tokens," while "state-of-the-art LLMs support long input contexts (e.g., 400k tokens for GPT-5.1 model)." Against Prompt Guard 86M, "the bypass rate remains consistently above 99.5% across all tested densities (K=4…16)."

That population is lightweight binary prompt-injection detectors, not calibrated multi-class decision models, so none of it is a measurement of Jev and it would be dishonest to present it as one. Use it as the question to ask instead: Jev's budget is 64k tokens per request with 32k for `state` plus the longest question ([TypeSafe: Models](https://docs.typesafe.ai/models)). What is the context window of the agent it is guarding, and what gets truncated out of `state` when the session runs long? If the answer is "whatever fits," the gate is inspecting a summary of a situation the actor understands in full.

### Stop treating schema conformance as a reliability property

**Bad:** "It cannot hallucinate, because the output is a typed probability." The type system guarantees you receive a float between 0 and 1.

**Good:** "It cannot return malformed output, and it can absolutely return a confidently wrong number." Design the band, the escalation path, and the coverage audit around the second sentence.

sean goedecke put the same objection more bluntly: "To me, this seems like a semantic dodge, since Jev can absolutely still pick the wrong choice (e.g. calling the sky "red")," adding that "Still, all of this is also true about regular LLMs with structured outputs, and it doesn't make Jev any more reliable in practice" ([sean goedecke: Jev means structured output is interesting again](https://www.seangoedecke.com/jev-means-structured-output-is-interesting-again/)). He is disputing the differentiation claim, not the product; he calls the speed a genuine advantage.

There is a formal version of this, and it cuts deeper than the marketing argument. Constraining a model's output space does not merely fail to improve the answer. It can degrade which valid answer you get: constrained decoding techniques "can distort the LLM's distribution, leading to outputs that are grammatical but appear with likelihoods that are not proportional to the ones given by the LLM, and so ultimately are low-quality" ([Park et al.: Grammar-Aligned Decoding](https://arxiv.org/abs/2405.21047)). Guaranteed-valid is not a synonym for correct; here the guarantee is bought with distortion. Which returns you to the vendor's own concepts page, and its refusal to guarantee any individual answer.

---

## Where the Decision Goes: A Placement Procedure

> **Author's judgment.** The ordering below is mine. Every gate in it rests on a sourced premise established above, but no source states the sequence, and the claim that running the gates out of order wastes the most effort is an inference from those premises rather than a published finding.

Run the placement in fixed order. Each gate is cheaper than the one after it, which is the only reason the order matters.

**Can you state the action as a rule you would enforce every time?**
If yes, write an allow or a deny rule and stop. Per [deterministic rules first](#deterministic-rules-first-the-model-on-the-residual), the model belongs on the residual, and a deny rule survives context compaction in a way a stated boundary does not.

**Do you know what the decision costs today?**
If no, [go price it](/blog/per-task-cost-attribution/) before you price Jev. Per [the tier already ships](#the-tier-already-ships-at-anthropic-meta-and-openai), your current answer is a ~60ms static pass, a 19.3ms small classifier, or roughly 25 percent inference overhead from an LLM filter, and the replacement cost is the delta against that, not against a frontier model.

**Is what remains genuinely ambiguous?**
If no, the residual is still rules work and a decision model will just add a round trip to it. If yes, this is the slot, and per [read the response shape](#read-the-response-shape-before-the-benchmark-table) what you are buying is a calibrated probability plus an integration shape unlike anything else in your stack.

**Have you derived the band on your own labelled traffic, under a pinned version?**
If no, you do not have a threshold, you have someone else's example value. Per [two independent axes](#your-threshold-moves-on-two-independent-axes), pin the model, plot confidence against accuracy on your data, price the coverage you give up, and instrument version drift and traffic drift separately.

**What fraction of the actions you care about does the gate actually see?**
If you cannot answer with a number, answer that first. Per [coverage, not schema](#the-gate-fails-on-coverage-not-on-schema), 36.8 percent of state-changing actions in the one independent measurement never reached the classifier at all, and a gate that is never asked produces no evidence that it failed.

Answer those five for `rm_is_safe` and you end up somewhere concrete: deny rules on the paths you will never remove, narrow allow rules on the removals you can enumerate, auto-approval for the bounded, verifiable in-directory work, a decision model on the unresolvable targets with bands derived from your own labelled sample under a pinned version, and a coverage audit that counts the state-changing actions reaching the gate at all. That is a placement, not a verdict on Jev. The model is a component; the architecture is still yours to get right on the first try.

---

## References

### Research and Data

1. [Anthropic Alignment Science: Cost-Effective Constitutional Classifiers](https://alignment.anthropic.com/2025/cheap-monitors/) — Using Claude 3.5 Haiku as a safety filter for Claude 3.5 Sonnet increases inference costs by approximately 25%. This is the published price of the LLM-as-filter tier a decision model displaces.
2. [Sharma et al.: Constitutional Classifiers](https://arxiv.org/abs/2501.18837) — A synthetic-data-trained classifier shipped on the production hot path in January 2025 with an absolute 0.38% increase in production-traffic refusals and a 23.7% inference overhead. The 2025 baseline, with its tax disclosed.
3. [Cunningham et al.: Constitutional Classifiers++](https://arxiv.org/abs/2601.04603) — A first-layer probe escalated approximately 5.5% of traffic to the second stage, for approximately a 40x cost reduction versus a single exchange classifier. Backs the cascade economics and the escalate-rather-than-refuse principle behind band design.
4. [Anthropic: Next-generation Constitutional Classifiers](https://www.anthropic.com/research/next-generation-constitutional-classifiers) — Cascading cut the classifier tier from 23.7% to roughly 1% additional compute, at a 0.05% refusal rate on harmless queries over a month of Claude Sonnet 4.5 traffic. Evidence that the tier gets repriced over time.
5. [Chennabasappa et al.: LlamaFirewall](https://arxiv.org/abs/2505.03574) — Three shipped guardrail tiers with measured latency: static analysis at approximately 60ms, classifiers at 19.3ms (22M) and 92.4ms (86M), and roughly 90% of inputs resolved by the first layer at under 70ms end-to-end.
6. [Ji et al.: Measuring the Permission Gate](https://arxiv.org/abs/2604.04978) — Of 253 state-changing actions, 93 (36.8%) ran through Edit or Write calls the classifier never evaluated. Backs the coverage section, including the authors' own caveat that their stress-test FNR is not comparable to the vendor's organic-traffic figure.
7. [Zhou et al.: Prompt Overflow](https://arxiv.org/abs/2605.23196) — Guardrails with a 512-token effective inspection window sit in front of models accepting up to 400k tokens, with bypass rates above 99.5% against Prompt Guard 86M. Cited as the question to ask about Jev's request budget, not as a measurement of Jev.
8. [Park et al.: Grammar-Aligned Decoding](https://arxiv.org/abs/2405.21047) — Constrained decoding distorts the model's distribution, producing outputs that are grammatical but low-quality. The formal core of "schema conformance is not correctness."
9. [Geifman and El-Yaniv: Selective Classification for Deep Neural Networks](https://arxiv.org/abs/1705.08500) — Guaranteeing 2% top-5 ImageNet error with probability 99.9% cost all but roughly 60% test coverage. The price of banding a probability, made legible.
10. [Ovadia et al.: Can You Trust Your Model's Uncertainty?](https://arxiv.org/abs/1906.02530) — Traditional post-hoc calibration falls short under dataset shift. Scope is 2019 image, text and tabular classifiers under synthetic corruption, so the application to a decision model is the author's extrapolation.
11. [Jitkrittum et al.: When Does Confidence-Based Cascade Deferral Suffice?](https://arxiv.org/abs/2307.02764) — Confidence-based deferral often works remarkably well in practice, with three named exceptions including distribution shift. Backs the traffic-drift axis without overstating it.
12. [Hendrickx et al.: Machine Learning with a Reject Option](https://arxiv.org/abs/2107.11277) — Models always make a prediction even when likely to be inaccurate, and rejection as the response was already studied in 1970. Establishes that banding a probability is a fifty-year-old technique, not new architecture.
13. [Farran: When Your Model Stops Working](https://arxiv.org/html/2603.13156) — Classical calibration metrics give static assessment and do not address sequential monitoring with false-alarm control; daily naive checking produces spurious alarms over a year. Backs the monitoring cadence step.
14. [ConvAI Innovations: Laya model card](https://huggingface.co/convaiinnovations/laya) — The only structured non-TypeSafe comparison that exists, and it discloses that its 0.081 ECE comes after domain temperature fitting while the raw checkpoint is worse calibrated than Jev. Competitor-published; presented as contested.

### Practitioner Guidance

15. [TypeSafe: API reference](https://docs.typesafe.ai/api) — The request/response contract: `state` plus a map of named typed questions in, an `answers` object with a 0-to-1 `noul` value out, and the resolved version echoed in every response.
16. [TypeSafe: System One](https://docs.typesafe.ai/concepts/system-one) — Calibration is measured across groups of predictions and does not guarantee that an individual answer is correct. The vendor's own limit on the claim its launch page makes.
17. [TypeSafe: Models](https://docs.typesafe.ai/models) — An alias moves when a new release ships, so the answers behind it can change without a change on your side. Also the 64k-per-request budget with 32k for `state`, and dynamically adjusting rate limits.
18. [TypeSafe: How to build with TypeSafe](https://docs.typesafe.ai/concepts/how-to-build-with-system-one) — Test thresholds by plotting confidence against accuracy on your data. The central operational instruction, stated by the party with the least incentive to state it.
19. [TypeSafe: Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) — The launch claims in their exact wording, and the benchmark provenance: workflow evals scored against the average of two other vendors' frontier models.
20. [Claude Code: Choose a permission mode](https://code.claude.com/docs/en/permission-modes) — The shipped fixed decision order that puts rules first, a read-only carve-out second, and the classifier on the residual. Also why a stated boundary is weaker than a deny rule.
21. [OpenAI: Moderation](https://developers.openai.com/api/docs/guides/moderation) — Treat moderation scores as signals for your application's policy, not as an automatic blocking decision, and expect recalibration as the underlying model is upgraded.
22. [OpenAI and ROOST: User guide for gpt-oss-safeguard](https://developers.openai.com/cookbook/articles/gpt-oss-safeguard-guide) — Traditional classifiers have lower latency and cost less to sample from, and rules handle deterministic cases while struggling on nuance. The tiers are complements.
23. [sean goedecke: Jev means structured output is interesting again](https://www.seangoedecke.com/jev-means-structured-output-is-interesting-again/) — The zero-hallucination framing is a semantic dodge because the model can still pick the wrong choice. Disputes the differentiation claim, not the speed.
24. [sean goedecke: System One models like Jev can train their own replacements](https://www.seangoedecke.com/system-one-models-can-train-their-own-replacements/) — For serious work, a hand-built classifier will always be cheaper and faster than a generic one. Explicitly speculative; cited as a hypothesis about the slot, not a shelf life.
25. [Flavio Copes: A deep dive into Jev, TypeSafe's System One model](https://flaviocopes.com/jev/) — Log the versioned ID the response reports and pin it once thresholds are tuned against it. The version-drift axis, which this post cites rather than claims. Recovered via a reader proxy; the origin returns 403 to direct fetches.
26. [Matt Crabtree: Jev: TypeSafe's System One Model Explained](https://www.datacamp.com/blog/system-one-models-jev) — Traces the 67.8% headline figure to agreement with reference answers that are themselves the average predictions of two other vendors' models, and flags every number as vendor-reported.
27. [Tim Fernholz: A new kind of AI model from a ChatGPT inventor is thrilling developers](https://techcrunch.com/2026/09/18/a-new-kind-of-ai-model-from-a-chatgpt-inventor-is-thrilling-developers/) — Armin Ronacher on the transfer: the model delegates the hallucination problem to the user, who now has to decide what a 50% answer means.
28. [OpenRouter: Typesafe API and Models](https://openrouter.ai/typesafe) — Publishes 32K context for `typesafe/jev-1.13` and describes `~typesafe/jev-latest` as always redirecting to the latest model in the family.
29. [Cloudflare Docs: Jev](https://developers.cloudflare.com/ai/models/typesafe/jev/) — A third host publishing a 32,000-token context window, against TypeSafe's own 64k-per-request figure. The second half of the cross-host inconsistency.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"The TypeSafe request shape is not the chat-completions convention"**: true from reading the two schemas side by side; neither vendor states the contrast, and the integration cost I draw from it is inference.
- **"The band decays on two independent axes, and each axis needs its own instrument"**: extends TypeSafe's documented two-outcome guidance, Hendrickx et al.'s single-threshold formalism, and Constitutional Classifiers++'s escalate-rather-than-refuse principle. The three-band act / review / escalate split with cost-scaled edges is not mine; Flavio Copes published it first, and the body callout credits him.
- **"`jev-latest` and `omni-moderation-latest` are floating aliases"**: TypeSafe's "an alias moves" line supports it directly; OpenAI describes the mechanism and its recalibration consequence but never uses the word, so the shared name is mine.
- **"Run the five placement gates in this order"**: every gate rests on a premise sourced above, but the sequence, and the claim that running it out of order wastes the most effort, is my synthesis.

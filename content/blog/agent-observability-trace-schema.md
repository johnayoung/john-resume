---
title: "Rank Your Agent Trace Fields by What You Can Never Get Back"
date: 2026-09-01
draft: false
pillar: production-operations
author: "John Young"
description: "A conformant agent trace proves the run failed and cannot locate where. Rank the fields you write at call time by what no later analysis can recover."
keywords: ["agent trace schema", "agent observability", "OpenTelemetry GenAI", "trace retention", "failure attribution"]
tldr:
  - "Rank your agent trace fields by what you can never get back, not by whatever tier a spec assigns, and capture the top of that list unconditionally instead of leaving it Opt-In."
  - "Published conventions like OpenTelemetry, OpenInference, and OWASP AOS disagree on which fields are required, but none of them frame their tiering as recoverability, so a trace can prove a run failed and still leave you no way to find where it broke."
  - "Write the resolved model snapshot, the pinned prompt version, and the vendor's retirement date into the span at call time, because the string you sent stays in source control forever while the string that answered you expires on a schedule you don't control."
---
{{< eli5 hint="no background needed · 11 min" audience="for readers outside AI engineering" >}}
This is about a practical problem for anyone running an AI system that takes actions on its own: when it fails, you usually cannot just ask it to try again and see what went wrong, so the useful information has to get written down before the failure happens, not after.

## The big idea

Think of an AI agent like a worker you request from a staffing agency by a general title, say "Alex." Today, "Alex" happens to be one particular person with one particular way of working. Two things about this worker make investigating a mistake hard. First, that person isn't perfectly consistent: even asked to redo the exact same task the exact same way, they might do it slightly differently. Second, and more important, the agency doesn't keep any one specific worker forever. On a schedule it sets and announces only briefly ahead of time, that exact worker is retired for good. You can request "Alex" again next month, but you'll get a different, newer Alex. So if a job that the first Alex did goes wrong later and you want to sit down with the worker who actually did it, you often can't, because the tools that are supposed to keep notes on the job write down the easy things by default (that someone named "Alex" was requested, that the job took eight seconds) rather than the hard things (exactly which Alex showed up, exactly what they were told, exactly what they said). You have to decide, before the job runs, which of those hard-to-recover facts you're going to write down anyway, because you will not get a second chance to ask for them later.

## A record that proves something broke doesn't tell you where

Picture a factory conveyor belt with ten work stations and a warning light at the end that flips on when a product comes out defective. A basic log of the line will faithfully show that the product passed through station 1, then 2, then 3, all the way to 10, and that the light came on. That log is very good at telling you a defect happened. It is nearly useless at telling you which station caused it, because it never recorded what each station actually did, only that the product moved through it.

That is close to what one study measured directly, feeding several hundred manufactured example cases and multiple AI systems the kind of records that match the field lists AI companies currently publish. Those records caught that something had failed almost every time, but correctly pointed at the failing step half a percent of the time or less. Remove the part of the record describing what each step was actually told and actually decided, and the systems couldn't find the failing step at all, not even by accident. Both halves of that matter, not just the second one: a standard record is genuinely very good at proving THAT a run failed, and it is separately, specifically bad at showing WHICH step failed. That gap is the discovery, not a footnote.

A second, peer-reviewed study, using real rather than manufactured examples of multi-step AI systems, found that having the complete record instead of a stripped-down one improved the odds of correctly identifying the failing step by a wide margin, up to about three quarters better. That's a comparison against an incomplete version of the same records, not a claim that any tool gets it right three quarters of the time, but it points the same direction: a missing record doesn't just slow down the investigation, it hides real causes.

## The exact version that answered you is the thing you can't get back

When you send a request to an AI system, you typically type a general name, like asking for "the current model." But behind that general name sits one specific, frozen version, built and tested on a particular date, that actually generates the answer. AI companies run that specific version for a while and then retire it permanently, on their own published notice, sometimes with as little as two weeks' warning and sometimes with as much as six months. Once it's retired, any request to that specific version simply fails. There's no bringing it back.

The fix is to write down not just the general name you typed, but the specific frozen version that actually answered, at the moment it answers, because the general name is something you can always reconstruct from your own records later, while the specific version is the one thing that quietly expires.

Two honest limits on that fix. First, writing down the exact version only buys you back who answered, not a guarantee you could recreate the exact same conditions: the setup wrapped around that version, like the routing and safety-checking systems around it, can keep changing even after the core version is frozen, so a matching version name is a decent clue, not proof, that everything else was the same. Second, the "you asked for one thing and got an unpredictable other thing" problem mostly applies to older naming. The newest generation of model names already point to one fixed version instead of floating to whatever is newest, though even those fixed versions still eventually get retired on their own schedule, so writing down what actually answered still matters going forward.

The same logic applies to the exact wording of instructions given to an agent. A live, editable link to instructions can be changed by anyone with access, without approval, and companies are already retiring some of these link-based services on their own announced dates. Recording the literal instructions used, not just a link to them, is the same move as recording the specific model version.

And it doesn't help to say "we'll just run it again and see." Even at an AI system's most consistent setting, the companies that build them say plainly that results still aren't fully repeatable, run to run, on the exact same version. Running it again is not a fallback plan. It does not reliably recreate what happened the first time.

## The published guides for what to record don't agree, and none of them are sorted by what you can never get back

It isn't true that nobody tells you what to write down. Several published guides exist for exactly this, from established industry groups. The problem is that these guides sort fields by how expensive, risky, or easy they are to capture right now, things like processing cost or privacy sensitivity, rather than by whether that information could ever be reconstructed after the fact if you skipped it. The guides even disagree with each other about which fields are must-have. One requires almost nothing by default. Another requires an agent's own instructions and version number but doesn't require recording which specific model actually answered. A third tracks a model's current version in a constantly-updating inventory, which is good for knowing what's running today and useless for knowing what was running back when a specific past job ran, precisely because that inventory keeps changing.

The lesson isn't that these guides are wrong to exist. It's that none of them are built around the question "which of these facts becomes permanently unrecoverable if I skip it," so you have to apply that filter yourself and treat the published guides as a floor, not the final answer.

## Your records get thrown away on a schedule, whether or not you've needed them yet

Every tool that stores these written records also has a built-in expiration, usually somewhere between a few months and about six months, after which the records are permanently deleted, no matter how important a specific session turns out to be later. Some tools also cap how much a single very long job can record before refusing to add more, and long or complicated agent jobs are exactly the ones most likely to hit that cap. Some setups require an explicit "save now" command before a short-lived program shuts down, and skipping that command silently loses the notes. And some companies offer a setting that promises to keep no copy of a conversation at all, which organizations sometimes turn on for privacy reasons without realizing it also turns off the record-keeping. None of this is a bug. Every one of these behaviors is written down in the documentation, which is exactly what makes it dangerous: it quietly does what it says, and you only discover how much you lost on the day you go looking for a specific record and it isn't there.

The obvious fix people reach for is to wait and only keep the "interesting" records after the fact, once you can tell something went wrong. But the tools built for that have their own default decision window, about thirty seconds, to decide whether to keep a record, and a long-running AI agent task can take minutes or hours, so the keep-or-toss decision still gets made before the job is even finished. If a lot of activity happens at once, records can get discarded before that decision process even reaches them. This approach is also mainly meant for extremely high-traffic systems handling well over a thousand records a second; most agent systems run at far lower volume, so the tool is being used outside the range its own makers built it for. Deciding what to keep after the fact doesn't solve the problem. You still have to decide before the fact.

## The law says keep records for a while, not what has to be in them

Some regulation, including a recent European Union law on AI, does require that certain AI systems keep logs, and requires providers to hold onto them for at least six months. But apart from one narrow special case, systems that check people's faces or other biometric details against a database, the law does not specify what fields those logs actually need to contain. A business could technically satisfy a six-month recordkeeping requirement with a log that's missing exactly the details you'd need after something goes wrong. A tally of real incidents involving AI coding tools found repeated cases of missing records of what actually happened and no company follow-up afterward, a survey of public reports rather than a rigorously verified study, but it points at the same gap: a law requiring you to keep something for a while doesn't guarantee that something is useful.

## What this means for you

The point isn't that keeping good records is impossible. The tools to do it exist. The point is that whoever set those tools up made a bunch of small decisions, usually months before anything went wrong, about what was convenient and cheap to write down, not about what would be irreplaceable later. When an AI agent eventually does something wrong, the useful question won't be "can we ask it to explain itself," because you may not even be able to reach the specific version that did the work anymore, and asking it to redo the task won't reliably reproduce what happened the first time either.

The only real lever is deciding, in advance, which facts are the ones you could never get back, and making sure those specific facts get written down every time, by default, rather than trusting that whatever a published checklist happens to mark "recommended" will be enough. The source post ends with the author's own suggested order for what to capture first, and he says directly that it's his synthesis of the evidence above, not an official standard anyone has published. In plain terms: capture the actual content behind a decision (what the agent was told and what it said) on purpose, rather than leaving it off by default; write down the exact model version that answered, on every call; record the actual wording of instructions used, not just a link to them; copy in the date that version is scheduled to be retired; and build a check into your process that refuses to ship an agent that's missing this information, so an incomplete record fails early rather than showing up empty during a real incident.

---

**The technical terms, in plain words**
- agent = a piece of software that can take actions and make decisions on its own, not just answer a single question.
- trace / span = the written record of a single step, or a whole run, that an agent took, similar to a detailed log entry.
- model snapshot vs. alias = "alias" is the general name you type in, like ordering "the manager." "Snapshot" is the one specific, frozen version that actually answers, like the literal person who showed up.
- deprecation / retirement = a company permanently shutting off one specific version of its AI; after that date, any request to it simply fails.
- deterministic / non-deterministic = "deterministic" means the same input always produces the exact same output. AI models are not fully deterministic, so asking the same version to redo the exact same task can still give a different result.
- retention (ceiling) = how long a storage tool keeps records before automatically and permanently deleting them.
- tail sampling / head sampling = deciding, after the fact, which records are worth keeping and throwing the rest away to save space.
- Zero Data Retention = a setting where a company promises to keep no copy of a conversation at all.
- flush() = a command a short-running program has to be told to run, to make sure its records actually get saved before it shuts off.
- prompt version / prompt pointer = the literal wording given to instruct an agent, versus a link to wording that someone else could silently change later.
- CI / "fail the build" = an automated check, run before something ships, that stops it if a required piece, here a required record, is missing.
- detection accuracy vs. origin-step accuracy = one measurement of "did we correctly notice something broke," separate from "did we correctly identify exactly which step caused it."

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}

Anthropic's managed-agents team had a live event stream from every session and still could not separate a harness bug from a dropped packet from a dead container, because all three presented the same ([Anthropic Engineering: Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents)). No dashboard fixes that after the fact. The fields that would have told those three apart are decided at call time, written once, and the published conventions rank the model alias you sent above the model snapshot that actually answered you.

---

## A Conformant Trace Proves Failure Without Locating It

Two weeks after a refund-batch job started producing wrong totals, the only surviving record of the model call at the center of it is a span that looks like this.

```json {title="Span 7f2a from trace refund-batch-0e91"}
{
  "trace_id": "refund-batch-0e91",
  "span_id": "7f2a",
  "name": "chat claude-opus-4-1",
  "attributes": {
    "gen_ai.operation.name": "chat",
    "gen_ai.provider.name": "anthropic",
    "gen_ai.request.model": "claude-opus-4-1",
    "gen_ai.usage.input_tokens": 41822,
    "gen_ai.usage.output_tokens": 1104
  },
  "status": "OK",
  "duration_ms": 8431
}
```

That span is close to everything the OpenTelemetry GenAI conventions actually compel. `gen_ai.operation.name` and `gen_ai.provider.name` are Required, `gen_ai.request.model` is Conditionally Required if available, and the three attributes carrying why the model did anything, `gen_ai.system_instructions`, `gen_ai.input.messages` and `gen_ai.output.messages`, all sit at Opt-In ([OpenTelemetry: GenAI client spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md)). Span 7f2a is conformant. It is also close to useless for finding the step that broke.

That is not a rhetorical claim, it has been measured. A two-author preprint from East China Normal University built a deterministic synthetic corpus of 312 traces across ticketing, document and order domains, rendered each trace through several field views, then asked five models both to detect that a run failed and to name the step where the failure originated ([Zhu and Pu: TelemetrySuffBench](https://arxiv.org/abs/2608.07899)).

> "Metadata, OpenTelemetry-compatible, and OpenInference-compatible views retain 99.5% to 100% detection F1 while limiting origin-step accuracy to at most 0.5%"
> — [Zhu and Pu: TelemetrySuffBench](https://arxiv.org/abs/2608.07899)

Read that with the caveats the paper itself supplies. Those numbers are joint across all three restricted views. The Full view also detects failures at between 99.3% and 100.0% F1, so near-perfect detection is a property of this corpus rather than something the standards-shaped views uniquely preserve. The compatibility renderers are the authors' own: "For the canonical fields available in this corpus, the two compatibility renderers use the same conservative generic field set." So the study measured traces shaped like the published conventions. It did not test the OpenTelemetry or OpenInference registries themselves, and it cannot rank one convention against another. What it does isolate is which class of field carries the localization signal, and the ablation is blunt: removing decision content "reduces origin-step accuracy to zero for all five models."

The question a trace has to answer is therefore not whether the run failed. **It is which step made it fail, and that is the one question the identity-and-timing fields in span 7f2a cannot touch.** A survey of execution provenance puts the same point in reader-facing terms: final-answer accuracy alone "cannot explain how an output was produced, which evidence supported each claim, whether tool calls were justified, how memory influenced later decisions, or where failures originated" ([Wang et al.: From Agent Traces to Trust](https://arxiv.org/abs/2606.04990)). A single-author preprint frames the structural version, that a trace "records which steps executed and in what order, never what each step relied on" ([Zhao: Grade](https://arxiv.org/abs/2606.22741)); treat it as an argued design position rather than a validated result, since it is un-peer-reviewed, but the gap it names matches what TelemetrySuffBench measured.

### Pair the Synthetic Result With a Natural-Trace One

One deterministic synthetic corpus should not carry an argument this expensive on its own. The peer-reviewed leg comes from ACL 2026, where a failure-attribution benchmark built on natural multi-agent traces reports that "full traces improve attribution accuracy by up to 76.5% over a partial-observation counterpart, confirming that missing inputs obscure many failure causes" ([Chen et al.: Seeing the Whole Elephant](https://aclanthology.org/2026.acl-long.912/)). Report that 76.5% as what it is: a relative improvement over a partial-observation baseline, not an absolute accuracy. The same paper shows that the choice of analyzer moves step-level accuracy substantially on identical full traces, so completeness is a precondition for attribution rather than a substitute for good analysis.

---

## Record the Snapshot, Not the Alias

Write the resolved model snapshot into the span at call time, because the string you sent is the one field you could always have reconstructed and the string that answered you is the one that expires. On the generic GenAI spans document, `gen_ai.request.model` is Conditionally Required with example `gpt-4`, while `gen_ai.response.model` is only Recommended with example `gpt-4-0613` ([OpenTelemetry: GenAI client spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md)). On the OpenAI client operations document the same split is sharper: `gen_ai.request.model` is flatly Required, and `gen_ai.response.model` stays Recommended ([OpenTelemetry: OpenAI client operations](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/openai.md)).

Two honest qualifications before that becomes an accusation. `gen_ai.operation.name` is Required too, so request-side data is not uniquely privileged in these documents. And the `gen_ai.*` attributes carry Development status rather than Stable, so this is a moving target by design. The ordering still holds where it counts: the alias sits in your own source control forever, and the snapshot stops serving on a published clock.

Anthropic retired `claude-opus-4-1-20250805` on August 5, 2026, two months after deprecating it, and retirement is absolute: "Retired: The model is no longer available for use. Requests to retired models will fail" ([Anthropic: Model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations)). OpenAI publishes the same mechanic on a different clock ([OpenAI: Deprecations](https://developers.openai.com/api/docs/deprecations)).

| Model class | Notice before shutdown |
| --- | --- |
| Anthropic, publicly released models | At least 60 days, and only to customers with active deployments |
| OpenAI, generally available models | At least 6 months |
| OpenAI, specialized variants, including chat variants such as `gpt-5.1-chat-latest` | At least 3 months |
| OpenAI, preview models | As little as 2 weeks |

Anthropic's published dates cover Anthropic-operated platforms only, since Amazon Bedrock and Google Cloud set their own schedules. And there is a genuine escape hatch worth naming: "In some cases, developers may be able to provision dedicated capacity for continued access after a model's shutdown date." It is sales-gated and case by case, so design the trace around the default rather than the exception.

**Bad:** the span records the string you typed into your client and nothing else about model identity.

```json
"gen_ai.request.model": "claude-opus-4-1"
```

**Good:** the span records what you sent, what answered, which prompt was live, and when the thing that answered stops existing.

```json
"gen_ai.request.model": "claude-opus-4-1",
"gen_ai.response.model": "claude-opus-4-1-20250805",
"agent.prompt.version": "14",
"model.shutdown_date": "2026-08-05"
```

Only the first two of those four are named in a published convention. `model.shutdown_date` is my own attribute name, though its value is machine-readable on OpenAI's Model object, "The date when the model will shut down, or null if not announced" ([OpenAI: Models](https://developers.openai.com/api/reference/resources/models)); on Anthropic you copy the retirement date from the deprecations page. On OpenAI clients, set a fifth: `openai.response.system_fingerprint`, which the conventions mark Recommended and describe as "A fingerprint to track any eventual change in the Generative AI environment."

The prompt-version half has the same shape. Anthropic's own managed-agents tutorial is direct about what happens when you skip it: "If callers are passing the bare agent ID instead of a pinned version, they'll start using the new prompt on their very next session," and "There's no built-in approval workflow on `agents.update`. Any key in the workspace can call it" ([Nowicki: Managed Agents prompt versioning and rollback](https://platform.claude.com/cookbook/managed-agents-cma-prompt-versioning-and-rollback)). A hosted prompt pointer is a footgun for a second reason: pointers expire. OpenAI states that "Prompt creation will be de-emphasized beginning June 3, 2026, and `v1/prompts` is scheduled to shut down on November 30, 2026," and its own migration advice is to "move the prompt content out of the managed `prompt` object and into your application code" ([OpenAI: Migrate from prompt objects](https://developers.openai.com/api/docs/guides/prompting/migrate-from-prompt-object)). Record the resolved content or a hash of it, not a reference to a service with a scheduled end date.

This is the same move I argued for spend in [You Can't Cap What You Can't Attribute](/blog/per-task-cost-attribution/): commit the dimensions on every call, as a schema, before you ship. Forensics has the harder deadline, because an invoice can be recomputed and a retired snapshot cannot.

### Pinning the ID Is Not Enough

Recording the snapshot buys you identity, not reproduction. Anthropic states the limit plainly: "Model weights are fixed for a given ID, but the serving infrastructure around the model can change over time. This infrastructure includes components such as the request router, safety classifiers, and sampling logic," and "Occasionally, infrastructure updates produce minor differences in observable behavior even when the model ID and weights have not changed" ([Anthropic: Model IDs and versioning](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions)). So the pinned ID in span 7f2a identifies the weights, not the router or the classifier stack that shaped the response. Capture whatever behavior-affecting infrastructure identifiers the vendor exposes, and treat a matching model ID as weak evidence of a matching environment rather than proof of one.

### Scope the Alias Claim to the Right Generation

The alias problem is real, but it is generation-scoped, and overclaiming it costs you the argument. Anthropic is explicit that from the 4.6 generation onward, "A 4.6-generation ID such as `claude-sonnet-4-6` is not an alias. It is the snapshot." The floating behavior belongs to earlier models, where "An alias such as `claude-sonnet-4-5` is a convenience pointer that resolves to the most recent dated snapshot for that minor version" ([Anthropic: Model IDs and versioning](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions)). Span 7f2a carries `claude-opus-4-1`, a pre-4.6 ID, so its request model genuinely is a pointer and the dated snapshot behind it is the thing that answered. On a 4.6-or-later ID the request and response strings converge and this specific gap closes. Every model ID, dated or dateless, still has its own retirement schedule, so the clock does not close with it.

---

## The Published Menus Disagree About Requiredness

Decide requiredness yourself and pin it in your own schema, because the published menus assign sharply different obligations to the same field. OpenInference has no Required, Recommended or Opt-In tiering at all, and exactly one attribute is required across all spans: "The `openinference.span.kind` attribute is **required** for all OpenInference spans" ([Arize AI: OpenInference Semantic Conventions](https://arize-ai.github.io/openinference/spec/semantic_conventions.html)). The OWASP Agent Observability Standard runs the other way on a different axis, requiring the agent's own `instructions` and `version` in every valid Agent object while leaving `model` and `tools` out of the required set entirely, and its Model object requires only `id`, `name` and `provider` ([OWASP AOS: Schema](https://github.com/OWASP/www-project-agent-observability-standard/blob/dev/specification/AOS/aos_schema.json)).

| When you see | What it means | What to do |
| --- | --- | --- |
| A menu marks a field Recommended, optional or unspecified | The menu is expressing capture cost and entity validity, not forensic value | Promote it in your own schema and fail the build when it is missing |
| A spec requires the agent's `version` but leaves `model` optional | Entity validity is not session provenance | Pin model identity in the per-call record, not in the agent definition |
| A spec predicts a field will typically go unset, as OpenInference does: "Most providers echo the same model back, so these attributes will typically be unset" | Instrumentation defaults will drop it quietly, and the prediction fails on an alias | Set `gen_ai.response.model` explicitly rather than trusting the default |
| Model version lives in an inventory that refreshes on change | You will learn the current version, not the one that served | Copy the version into the span at call time |

Row four is the AOS case stated fairly. AOS does track model version, in the AgBOM inventory, which updates whenever a model is "discovered, removed or changed capabilities," because "AgBOM must dynamically adapt to reflect the rapid iteration and evolution of agent architectures" ([OWASP AOS: Inspect with AgBOM](https://aos.owasp.org/spec/inspect/)). That is a good design for knowing what is deployed now, and the wrong instrument for knowing what served a session in June, precisely because it adapts.

Three scoping notes so this stays fair. AOS `required` is a JSON entity-validity constraint and OpenTelemetry's Opt-In is a span-capture policy, so these menus assign sharply different requiredness rather than contradicting one another. The AOS schema is served from a moving `dev` branch rather than a tagged release, so it can change under this claim. And OpenInference does publish `llm.prompt_template.version`, "The version of the prompt template," so prompt versioning is not missing from the menus: it is present, unranked, and easy to leave unset. On the neighboring tool-argument move, where `gen_ai.tool.name` is Required and the call arguments are not, I made that case in [Audit Your Agent Harness](/blog/agent-harness-audit/) and will not re-derive it here.

### The Specs Meet Unrecoverability and Never Name It

Read the tiering rationale rather than the tiers. OpenTelemetry's requirement-level document sets its criteria as "attribute availability across instrumented entities, performance, security, and other factors," and defines the bottom tier as "recommended for attributes that are particularly expensive to retrieve or might pose a security or privacy risk" ([OpenTelemetry: Attribute requirement levels](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/general/attribute-requirement-level.md)). Its worked demotion example is the sharpest illustration available: "reading response stream to find `http.response.body.size` when `Content-Length` header is not available." That value exists only in flight and is gone the moment the stream closes, and the document classifies it purely as an expensive read under a performance heading.

Do not stretch that into a claim about what the specs never do. The criteria list is left open twice, cardinality and security are named as genuine criteria elsewhere on the page, and the document is signal-general with zero GenAI or agent content anywhere in it. The defensible statement is narrower and still useful: the tiering is never framed as recoverability, so nothing in the rationale distinguishes a field you can re-derive from a field that dies with the call. Nor is this a complaint that nobody ranks anything. Arize's agent observability guide ranks explicitly, telling you to "Observe the outcome it produced, the path it followed, the actions it attempted, and the context that informed its decisions. These are the core observation surfaces, not an exhaustive checklist" ([Arize AI: Agent observability](https://arize.com/ai-agents/agent-observability/)). That is a real ranking on a diagnostic axis, meaning what tells you fastest that something broke. Survivability is a different axis, and it is the one nobody publishes.

---

## Retention Deletes the Session Before You Need It

Check your retention ceilings, per-trace caps and flush behavior this week, because every one of them discards sessions on a schedule set before anyone knows which session mattered. Span 7f2a can be perfectly instrumented and still not be there when you go looking for it.

- **Read your platform's retention ceiling and count backwards from your incident review cycle.** LangSmith's SaaS tier "retains trace data for 180 days from ingestion. After that, traces are permanently deleted, with limited metadata retained for usage statistics" ([LangChain: Observability concepts](https://docs.langchain.com/langsmith/observability-concepts)).
- **Check the per-trace run cap against your longest agent session.** "Each trace is limited to a maximum of 25,000 runs. Once the trace reaches this limit, LangSmith will reject any additional runs that you send for that trace." It is the tail that gets refused, and the tail is where a compounding failure usually lands.
- **Call `flush()` before any short-lived process exits.** Langfuse is explicit that "To avoid losing data, short-lived applications must explicitly call flush() before exiting" ([Langfuse: Core Concepts](https://langfuse.com/docs/observability/data-model)). That is the CI agent, the cron job and the one-shot task, which between them cover most of [the agent work people actually run in production](/blog/what-ai-agents-are-actually-good-for/).
- **Confirm you are storing your own copy, because the provider is not holding one for you.** Default application-state retention on OpenAI's Responses and Chat Completions endpoints is listed as "None, see below for exceptions," and "When Zero Data Retention is enabled for an organization, the `store` parameter will always be treated as `false`, even if the request attempts to set the value to `true`" ([OpenAI: Data controls](https://developers.openai.com/api/docs/guides/your-data)). Abuse-monitoring logs are retained up to 30 days, and the page describes no customer-facing way to query them.
- **Re-verify export after you customize your framework's tracing.** "Tracing is unavailable for organizations that use OpenAI's APIs under a Zero Data Retention (ZDR) policy," and replacing the default processors via `set_trace_processors()` means "traces will not be sent to the OpenAI backend unless you include a `TracingProcessor` that does so" ([OpenAI Agents SDK: Tracing](https://openai.github.io/openai-agents-python/tracing/)).

None of these are bugs. Every one is a documented default doing exactly what it says on the page. That is what makes them expensive: a retention default has a blast radius measured in sessions you have not run yet, and you find out its size on the day you need one of them.

### Answer the Tail-Sampling Objection

The obvious response to all of this is to sample on the tail and keep the interesting traces. OpenTelemetry does prescribe tail sampling as the remedy to head sampling's core limit, noting that you cannot ensure error-bearing traces survive with head sampling alone and then, in the very next sentence, "For this situation and many others, you need tail sampling" ([OpenTelemetry: Sampling](https://opentelemetry.io/docs/concepts/sampling/)). The problem is what the tail-sampling processor's defaults commit you to.

```yaml {title="The tail-sampling defaults you are agreeing to"}
processors:
  tail_sampling:
    decision_wait: 30s      # default
    num_traces: 50000       # default
    policies:
      - name: keep-errors
        type: status_code
        status_code: { status_codes: [ERROR] }
```

Both of those values are the processor's own documented defaults ([OpenTelemetry: Tail Sampling Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/tailsamplingprocessor/README.md)). A 30-second decision window against an agent session that runs for minutes or hours means the keep-or-drop call is still made on an incomplete trace. That is the same pre-commitment, moved thirty seconds later. The `num_traces` ceiling is harder: "If the collector is processing more traces in-memory than the `num_traces` configuration option allows, some will have to be dropped before they can be sampled," so overflow is discarded before any policy evaluates it. There is also a topology requirement that quietly rules out naive horizontal scaling, since "All spans for a given trace MUST be received by the same collector instance for effective sampling decisions."

Then there is the volume mismatch. OpenTelemetry's own guidance says to sample when "You generate 1000 or more traces per second" and not to when "You generate very little data (tens of small traces per second or lower)." Most agent fleets sit in the second bucket, which means sampling gets reached for outside the range its own maintainers scope it to. The thing deleting your session is retention policy and export configuration, not the sampler.

---

## Compliance Fixes Duration, Never Field Selection

Do not outsource the field list to the regulator, because the statutory floor is a duration and a purpose, not a schema. The EU AI Act says logs must exist, says how long a provider keeps them, and names specific fields exactly once, inside a carve-out ([Regulation (EU) 2024/1689](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02024R1689-20260727)).

| Provision | Binding text | What it leaves open |
| --- | --- | --- |
| Art. 12(1) | High-risk systems "shall technically allow for the automatic recording of events (logs) over the lifetime of the system" | Which events, and which fields per event |
| Art. 19(1) | Providers keep those logs "for a period appropriate to the intended purpose of the high-risk AI system, of at least six months," and only to the extent they are under their control | What the retained log has to contain |
| Art. 18(1) | Technical documentation kept for "a period ending 10 years after" the system is placed on the market | A separate regime covering different artifacts, not a ten-year log-retention rule |
| Art. 12(3) | The Act's only field-level list: the period of each use, the reference database checked against, the input data that produced a match, and the natural persons who verified the results | Scoped to systems "referred to in point 1 (a), of Annex III," which is biometric identification, so it does not generalize |

No other article in the operative text says which fields a log must contain.

So the binding language is real, the "shall" is not advisory, and it still leaves the entire question of this post open. Practitioners are feeling the consequence directly: one survey of public incidents counts "10 documented incidents across 6 AI coding tools in 16 months. Missing audit trails, no liability frameworks, no vendor postmortems" ([Foley: Ten AI Agents Destroyed Production. Zero Postmortems.](https://www.harperfoley.com/blog/ai-agents-destroyed-production-zero-postmortems)). That is a practitioner's tally of public reports rather than a peer-reviewed dataset, but it names the right hole. A six-month floor on an empty log is six months of an empty log.

---

## Rank Every Trace Field by What Survives

> **Author's judgment.** No source ranks published trace-menu fields by unrecoverability, and the ranking below is my synthesis rather than anyone's specification. It follows from four sourced premises: the requirement-level inversion in the OpenTelemetry GenAI conventions, the vendors' published retirement clocks, the vendors' documented retention ceilings, and the measured gap between detecting a failure and locating it.

Rank your fields by unrecoverability before you ship, and capture the top of that list unconditionally rather than at whatever tier a convention assigned it. Concretely, on the next agent you instrument:

1. Set `gen_ai.system_instructions`, `gen_ai.input.messages` and `gen_ai.output.messages` explicitly, taking the privacy and cost tradeoff deliberately instead of inheriting the Opt-In default.
2. Set `gen_ai.response.model` on every call, and treat a span carrying only `gen_ai.request.model` as a defective span.
3. Record the resolved prompt content or its hash, plus the pinned version, rather than a hosted prompt pointer.
4. Copy the retirement date or `shutdown_date` value into the span at call time.
5. Assert all of the above in CI, so a missing survivability field fails the build rather than the postmortem.

Instrumentation is one of the few things in an agent system you have to get right on the first try, because there is no second call to the same snapshot. Re-running is not a fallback, and the vendors say so themselves. Anthropic notes that "even with `temperature` of `0.0`, the results will not be fully deterministic" ([Anthropic: Messages](https://platform.claude.com/docs/en/api/messages)) and extends that "both to Anthropic's first-party inference service and to inference through third-party cloud providers" ([Anthropic: Glossary](https://platform.claude.com/docs/en/about-claude/glossary)), which closes the "we run on a cloud provider so we can replay it" objection. OpenAI's seed parameter is still Beta: "Determinism is not guaranteed, and you should refer to the `system_fingerprint` response parameter to monitor changes in the backend" ([OpenAI: Create chat completion](https://developers.openai.com/api/docs/api-reference/chat/create)). Anthropic's own operators put it in one line: "Agents make dynamic decisions and are non-deterministic between runs, even with identical prompts" ([Anthropic Engineering: Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)).

Which produces the ranking, one row per section above:

| Field class | What destroys it | Recovered by re-running? |
| --- | --- | --- |
| **Decision content** (system instructions, messages, the reasoning behind a step) | Opt-In defaults, plus the measured fact that no later analysis reconstructs it: removing it drives origin-step accuracy to zero | No. The run is non-deterministic between executions |
| **Resolved model snapshot and prompt version** | The vendor's retirement clock and the prompt service's scheduled shutdown | No. The snapshot stops serving and the pointer stops resolving |
| **Fields your menu leaves optional** (response model, tool schema version) | Spec optionality plus instrumentation defaults that expect the field to go unset | No. Nothing writes it retroactively |
| **The span itself** | Retention ceilings, per-trace run caps, unflushed short-lived processes, ZDR, and replaced trace processors | No. Deletion is not reversible from the client side |
| **The field list** | Nothing external. The AI Act fixes duration and purpose, and its only field list is an Annex III biometric carve-out | Not applicable. No authority specifies the list for you |

Every row above is a decision made at call time by whoever wrote the instrumentation, usually months before the incident that needs it. That is the same class of decision as [tiering an agent's production authority](/blog/agent-permission-tiering/) before it has any authority to misuse: cheap to make deliberately in advance, impossible to make retroactively.

---

## References

### Research and Data

1. [Zhu and Pu: TelemetrySuffBench](https://arxiv.org/abs/2608.07899) — Across 312 synthetic traces and five models, views shaped like the published conventions retain 99.5% to 100% detection F1 while origin-step accuracy stays at or below 0.5%, and removing decision content drives origin-step accuracy to zero. A two-author, single-institution preprint whose compatibility renderers are the authors' own conservative field set.
2. [Chen et al.: Seeing the Whole Elephant](https://aclanthology.org/2026.acl-long.912/) — Full traces improve failure-attribution accuracy by up to 76.5% relative to a partial-observation counterpart on natural multi-agent traces. Peer-reviewed at ACL 2026; supplies the natural-trace leg of the localization argument.
3. [Zhao: Grade](https://arxiv.org/abs/2606.22741) — A trace records which steps executed and in what order, never what each step relied on. Single-author, un-peer-reviewed preprint, cited as an argued design position on the order-versus-reliance distinction.
4. [Wang et al.: From Agent Traces to Trust](https://arxiv.org/abs/2606.04990) — Final-answer accuracy alone cannot explain how an output was produced or where failures originated. Cited for framing and vocabulary only; the survey reports no experiments and no quantitative results.
5. [Regulation (EU) 2024/1689](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02024R1689-20260727) — Article 12(1) mandates that high-risk systems allow automatic event recording, Article 19(1) sets a six-month floor on provider log retention, and the Act's only field-level list, Article 12(3), is scoped to Annex III biometric systems. Consolidated EN text as of 27 July 2026.

### Practitioner Guidance

6. [OpenTelemetry: GenAI client spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md) — `gen_ai.request.model` is Conditionally Required while `gen_ai.response.model` is only Recommended, and system instructions and messages sit at Opt-In. Status is Development throughout, not Stable.
7. [OpenTelemetry: OpenAI client operations](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/openai.md) — On OpenAI client spans `gen_ai.request.model` is flatly Required while `gen_ai.response.model` stays Recommended, and `openai.response.system_fingerprint` is Recommended.
8. [OpenTelemetry: Attribute requirement levels](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/general/attribute-requirement-level.md) — Requirement levels are set by availability, performance, security "and other factors," and the worked Opt-In example demotes `http.response.body.size` purely as an expensive read. Stable, signal-general, and contains no GenAI or agent content.
9. [OpenTelemetry: Tail Sampling Processor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/tailsamplingprocessor/README.md) — `decision_wait` defaults to 30s and `num_traces` to 50000, overflow traces are dropped before any policy sees them, and all spans for a trace MUST reach the same collector instance.
10. [OpenTelemetry: Sampling](https://opentelemetry.io/docs/concepts/sampling/) — Sampling is scoped to 1000 or more traces per second and advised against at tens of small traces per second or lower, with tail sampling named as the remedy to head sampling's whole-trace limitation.
11. [Arize AI: OpenInference Semantic Conventions](https://arize-ai.github.io/openinference/spec/semantic_conventions.html) — Exactly one attribute, `openinference.span.kind`, is required across all spans, there is no Required/Recommended/Opt-In tiering, and the request/response model split is expected to go unset.
12. [OWASP AOS: Schema](https://github.com/OWASP/www-project-agent-observability-standard/blob/dev/specification/AOS/aos_schema.json) — The Agent object requires `instructions` and `version` while leaving `model` and `tools` optional, and the Model object has no version or snapshot property. Served from the moving `dev` branch, not a tagged release.
13. [OWASP AOS: Inspect with AgBOM](https://aos.owasp.org/spec/inspect/) — Model version lives in an inventory that dynamically adapts as models change, so it reports the current version rather than the one that served a past session.
14. [Anthropic: Model deprecations](https://platform.claude.com/docs/en/about-claude/model-deprecations) — Retired models stop serving and requests to them fail; `claude-opus-4-1-20250805` was deprecated June 5, 2026 and retired August 5, 2026, with at least 60 days' notice to customers with active deployments.
15. [Anthropic: Model IDs and versioning](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions) — Weights are fixed per model ID but the request router, safety classifiers and sampling logic around them change over time; 4.6-generation dateless IDs are snapshots while earlier dateless IDs are convenience aliases.
16. [Anthropic: Messages](https://platform.claude.com/docs/en/api/messages) — Even at `temperature` 0.0 results are not fully deterministic, and no seed parameter exists on the endpoint.
17. [Anthropic: Glossary](https://platform.claude.com/docs/en/about-claude/glossary) — Non-determinism at temperature 0 applies both to first-party inference and to inference through third-party cloud providers.
18. [Anthropic Engineering: Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents) — A live WebSocket event stream could not distinguish a harness bug from a dropped packet from a container going offline, because all three presented the same. Cited for the before state only; the article reports no observability after-state.
19. [Anthropic Engineering: Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) — Agents make dynamic decisions and are non-deterministic between runs even with identical prompts. Published June 2025.
20. [Nowicki: Managed Agents prompt versioning and rollback](https://platform.claude.com/cookbook/managed-agents-cma-prompt-versioning-and-rollback) — Callers passing a bare agent ID pick up a new prompt on their very next session, and there is no built-in approval workflow on `agents.update`.
21. [OpenAI: Deprecations](https://developers.openai.com/api/docs/deprecations) — At shutdown the model or endpoint is no longer accessible, with at least 6 months' notice for GA models, 3 months for specialized variants including chat variants, and as little as 2 weeks for preview models. Dedicated capacity past shutdown exists in some cases as a sales-gated exception.
22. [OpenAI: Models](https://developers.openai.com/api/reference/resources/models) — The Model object exposes `shutdown_date`, "The date when the model will shut down, or null if not announced," making expiry a machine-readable value you can capture at call time.
23. [OpenAI: Create chat completion](https://developers.openai.com/api/docs/api-reference/chat/create) — Determinism is not guaranteed even with a seed, which is still labelled Beta, and `system_fingerprint` is the documented way to monitor backend changes.
24. [OpenAI: Migrate from prompt objects](https://developers.openai.com/api/docs/guides/prompting/migrate-from-prompt-object) — Prompt creation is de-emphasized from June 3, 2026 and `v1/prompts` is scheduled to shut down on November 30, 2026, with the vendor's own advice being to move prompt content into application code.
25. [OpenAI: Data controls](https://developers.openai.com/api/docs/guides/your-data) — Default application-state retention on the Responses and Chat Completions endpoints is None, Zero Data Retention forces `store` to false regardless of the request, and abuse-monitoring logs are kept up to 30 days.
26. [OpenAI Agents SDK: Tracing](https://openai.github.io/openai-agents-python/tracing/) — Tracing is unavailable under a Zero Data Retention policy, and replacing the default processors stops export to the OpenAI backend unless a replacement processor sends them.
27. [LangChain: Observability concepts](https://docs.langchain.com/langsmith/observability-concepts) — LangSmith SaaS permanently deletes trace data 180 days after ingestion, and each trace is capped at 25,000 runs with additional runs rejected once the cap is reached.
28. [Langfuse: Core Concepts](https://langfuse.com/docs/observability/data-model) — Short-lived applications must explicitly call `flush()` before exiting or buffered trace data is lost when the process exits.
29. [Arize AI: Agent observability](https://arize.com/ai-agents/agent-observability/) — Ranks the core observation surfaces as outcome, path, actions and context, which is a genuine ranking on a diagnostic axis rather than a survivability one.
30. [Foley: Ten AI Agents Destroyed Production. Zero Postmortems.](https://www.harperfoley.com/blog/ai-agents-destroyed-production-zero-postmortems) — Ten documented incidents across six AI coding tools in sixteen months, with missing audit trails and no vendor postmortems. A practitioner survey of public incidents, not a peer-reviewed dataset.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **The survivability ranking itself:** the ordering of trace fields by unrecoverability, and the closing table, follow from four sourced premises: the requirement-level inversion in the OpenTelemetry GenAI conventions, the vendors' published retirement clocks, the vendors' documented retention ceilings, and TelemetrySuffBench's measured gap between failure detection and origin localization. No published spec ranks fields on this axis.
- **`model.shutdown_date` as a span attribute:** my own attribute name for a value that is machine-readable on OpenAI's Model object and published on Anthropic's deprecations page. Neither vendor documents capturing it at call time.

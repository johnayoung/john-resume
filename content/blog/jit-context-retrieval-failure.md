---
title: "Where Just-in-Time Context Retrieval Silently Breaks"
date: 2026-06-22
draft: false
author: "John Young"
description: "JIT context retrieval isn't free — it's slower and only as good as your tooling. A ledger of where runtime retrieval breaks and how to design the fallback."
keywords: ["just-in-time context retrieval", "context engineering", "agentic RAG failure modes", "tool description design", "context rot"]
---

JIT context retrieval reads like a solved problem in every post that sells it — until a reference resolves to nothing on a token that refreshed an hour ago. The agent, instead of erroring, confidently fabricates the payload it was supposed to fetch. The pattern is real and the pattern is good; what the evangelism drops is the honest column of the ledger — the failures runtime retrieval introduces, each of which fails silently by default.

---

## Price In The Two Costs JIT Evangelism Drops: It's Slower, And It's Only As Good As Your Tooling

Before you adopt just-in-time context, write down the two costs its advocates bury: the pattern is slower than pre-loading, and it is only as good as the tooling underneath it. Anthropic — whose engineering team is the reason most teams reach for JIT in the first place — states both plainly.

> *"Of course, there's a trade-off: runtime exploration is slower than retrieving pre-computed data. Not only that, but opinionated and thoughtful engineering is required to ensure that an LLM has the right tools and heuristics for effectively navigating its information landscape."*
> — [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

This is the tradeoff row that seeds the whole post. JIT keeps the context window nearly empty of payloads and full of pointers — file paths, stored queries, ticket IDs — that the agent resolves at runtime ([Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)). That is the same pointers-over-pre-loading discipline that makes a good agent task spec work in the first place: hand the agent enough references to pull context just-in-time rather than dumping everything up front (as in the [anatomy of a perfect AI agent task](/blog/anatomy-of-a-perfect-ai-agent-task/)). The win is real — a preloaded copy is a snapshot that ages, while a reference resolves to the current state of the file at the moment of use ([TrueFoundry: JIT Context](https://www.truefoundry.com/pt/blog/jit-context-just-in-time-context-agents)).

But every one of those runtime resolutions is a new place the loop can break, and the default behavior of a broken resolution is not an error — it is a fabrication. So the ledger has two columns: **what breaks**, and **what the agent does instead of erroring**. The rest of this post fills it in, one row per failure mode.

| What breaks | What the agent does instead of erroring |
| --- | --- |
| *(the honest column the evangelism drops — filled in below)* | |

The framing is therefore: JIT does not make retrieval free. It makes retrieval late, and late retrieval fails silently unless you engineer the failure to be loud.

---

## Make Every Unresolvable Reference Fail Loud — An Honest Error, Never A Fabricated Payload

A pointer that resolves to nothing is the canonical JIT failure, and left alone it is the worst kind: the model does not see the miss, so it invents the payload. TrueFoundry names the discipline directly — this is the honest column of the ledger.

> *"an unresolvable reference must surface as an honest error, not a hallucinated payload"*
> — [TrueFoundry: JIT Context](https://www.truefoundry.com/pt/blog/jit-context-just-in-time-context-agents)

The move is a resolution contract at the boundary. When a pointer resolves, check the outcome before the result re-enters context, and route each outcome to a loud, loop-visible signal:

- **When a reference resolves to null or 404** → raise a hard error the loop can catch, not an empty string the model treats as an answer.
- **When a token-scoped fetch returns 401/403** → surface auth failure as its own error class, because a token that refreshed an hour ago is exactly the reference that silently rots ([Perrone: Why AI Agents Keep Failing in Production](https://medium.com/data-science-collective/why-ai-agents-keep-failing-in-production-cdd335b22219)).
- **When the resolver times out** → return an explicit timeout signal, not a partial payload the model completes on its own.

The reason this matters is mechanical, not stylistic. A dead reference that returns an empty string looks, to the model, like a fetch that succeeded and found nothing worth quoting — so it fills the gap from parametric memory and the answer reads confident. Auth rot is the sharpest version: an agent that worked at 10am is broken by 2pm because a token refreshed, and the automated renewal fails silently ([Perrone: Why AI Agents Keep Failing in Production](https://medium.com/data-science-collective/why-ai-agents-keep-failing-in-production-cdd335b22219)). Nothing in the loop sees the break unless the resolver is engineered to raise one.

The first ledger row, then, is the hook made concrete:

| What breaks | What the agent does instead of erroring |
| --- | --- |
| Dead / unresolvable reference | Fabricates the payload it was supposed to fetch |

---

## Treat The Tool Description As The Decision Surface, Not Documentation — Audit It Like Production Code

The reference resolved and raised nothing — good. The next silent failure is upstream of that: the agent picked the wrong tool to resolve *with*, because the one-line description it read was broken. Tool descriptions are not prose for humans skimming a README; they are the input the model routes on.

> *"Tool descriptions are not documentation. They are the LLM's primary decision surface."*
> — [Guy / AWS Heroes: MCP Tool Design](https://dev.to/aws-heroes/mcp-tool-design-why-your-ai-agent-is-failing-and-how-to-fix-it-40fc)

Audit descriptions the way you review production code, because the wrong one routes silently. Here is the same tool, both ways:

**Bad:** `search_records` — "Searches records in the database."

**Good:** `search_customer_records` — "Full-text search over the *customer* table by name, email, or account ID. Returns up to 25 matches. Does NOT cover orders or support tickets — use `search_orders` / `search_tickets` for those."

The bad stub is not a documentation smell; it is a routing hazard. When two tools have overlapping one-liners, the model picks one and never reports the ambiguity — the most common failures are wrong tool selection and incorrect parameters, especially when tools have similar names ([Anthropic: Advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use)). The scale of the problem is measured: a 2025 study of MCP tool descriptions found 97.1% contain at least one quality issue and more than half (56%) have unclear purpose statements, while augmented descriptions improved task success by 5.85 percentage points (arXiv:2602.14878, reported in [Guy / AWS Heroes: MCP Tool Design](https://dev.to/aws-heroes/mcp-tool-design-why-your-ai-agent-is-failing-and-how-to-fix-it-40fc)). Tool invocation, not model reasoning, is the reliability bottleneck: procedural reliability, particularly tool initialization failures, is the primary bottleneck for smaller models ([Huang et al.: When Agents Fail to Act](https://arxiv.org/abs/2601.16280)).

This adds the second ledger row — the description-quality dependency from the tradeoff, now concrete:

| What breaks | What the agent does instead of erroring |
| --- | --- |
| Bad / ambiguous tool description | Selects the wrong tool, silently |

### Cut The Catalog, Don't Just Document It

Auditing each description is necessary but not sufficient — the catalog itself is a cost paid on every step. A bad description hides a good payload; a bloated catalog degrades every selection at once, because tool-selection accuracy climbs as the set shrinks. Defer or search tools instead of loading all of them upfront:

```python
# Bad: every tool definition loaded upfront, re-sent every loop step.
tools = load_all_tools()          # 58 defs, ~55K tokens before message 1

# Good: expose a search tool; defer the long tail until it's needed.
tools = [tool_search_tool] + [
    t for t in load_all_tools() if t.defer_loading is False
]
```

The upfront-load number is Anthropic's own: that's 58 tools consuming approximately 55K tokens before the conversation even starts, and at Anthropic they've seen tool definitions consume 134K tokens before optimization ([Anthropic: Advanced tool use](https://www.anthropic.com/engineering/advanced-tool-use)). Deferring the long tail is not just a token saving — the Speakeasy team's controlled experiment found that at 107 tools both large and small models failed completely, while at 10 tools performance was perfect (reported in [Guy / AWS Heroes: MCP Tool Design](https://dev.to/aws-heroes/mcp-tool-design-why-your-ai-agent-is-failing-and-how-to-fix-it-40fc)). The catalog is context burn with a selection-accuracy penalty stacked on top.

---

## Give Retrieval A Way To Report "Nothing Found" — Semantic Search Never Will On Its Own

Now assume the right tool was selected and the reference resolved. There is still a silent failure hiding inside the retrieval itself: embedding search always returns something, and "something" is what the model fabricates from. A vector search over an answer that does not exist in your corpus does not come back empty — it comes back with the nearest semantic neighbor, ranked and confident.

The fix is to make absence legible. Add a retrieval path that can report *no supporting evidence* rather than always returning a ranked list — logical or lexical constraints do this where pure embeddings cannot:

- **When embedding search returns results but none satisfy an explicit lexical constraint** → treat the constraint failure as a "not found" signal, not as license to return the closest semantic match as fact.
- **When the top result's score sits below an evidence threshold** → abstain and mark the passage unsupported rather than passing it downstream as a citation.
- **When repeated queries keep returning semantically-related-but-off-topic passages** → read that as the corpus lacking the answer, which is the legible signal embeddings alone never give you.

The mechanism is measured. Anchoring retrieval in logical queries makes failed searches legible, and legibility is what suppresses the fabrication:

> *"Repeated failures under explicit lexical constraints provide a clearer signal that required evidence may be absent, whereas Agentic Hybrid may still return semantically related but unsupported passages."*
> — [Zeng et al.: Rethinking Agentic RAG](https://arxiv.org/html/2605.27123)

The effect size is the point: on answer-unavailable questions, the refusal rate rose from 0.767 to 0.828 while the hallucination rate fell from 0.128 to 0.083 ([Zeng et al.: Rethinking Agentic RAG](https://arxiv.org/html/2605.27123)). Bad retrieval is not a hallucination in the usual sense — the retrieval worked perfectly, it just retrieved garbage, and there is no mechanism to flag that the result was low-confidence unless you build one ([Perrone: Why AI Agents Keep Failing in Production](https://medium.com/data-science-collective/why-ai-agents-keep-failing-in-production-cdd335b22219)).

Third ledger row:

| What breaks | What the agent does instead of erroring |
| --- | --- |
| Empty / no-match semantic result | Returns an unsupported passage as fact |

---

## Cap The Retrieval Loop And Abstain — With No Stop Rule, "Get More" Becomes A Budget Fire

The prior three failures are about what a single resolution returns. This one is about the loop around them: an agent that can retrieve will, by default, keep retrieving, because a locally-optimizing loop with no stopping rule always answers "do I have enough?" with "get more."

> *"At each step, it asks, 'Do I have enough?' and when the answer is uncertain, it defaults to 'get more'. Without hard stopping rules, the default spirals."*
> — [Ibrahim / Towards Data Science: Agentic RAG Failure Modes](https://towardsdatascience.com/agentic-rag-failure-modes-retrieval-thrash-tool-storms-and-context-bloat-and-how-to-spot-them-early/)

Engineer the stop rule explicitly. The loop does not need to be smart about when to quit — it needs a hard cap and an honest exit:

1. Set a hard cap on retrieval cycles — cap at three passes, not "until confident."
2. Count a pass as failed when it adds no new supporting evidence, not merely when it errors.
3. At the cap, return a best-effort answer with a confidence disclaimer — abstain from certainty rather than spending another cycle.
4. Deduplicate results across passes so the loop can't mistake the same low-value chunk for progress.

The mitigation is not novel; the discipline is: three cap retrieval cycles, and after three failed passes return a best-effort answer with a confidence disclaimer ([Ibrahim / Towards Data Science: Agentic RAG Failure Modes](https://towardsdatascience.com/agentic-rag-failure-modes-retrieval-thrash-tool-storms-and-context-bloat-and-how-to-spot-them-early/)). The failure mode without it is not theoretical — one team documented agents making 200 LLM calls in 10 minutes, burning \$50–\$200 before anyone noticed, and another saw costs spike 1,700% during a provider outage as retry logic spiralled out of control ([Ibrahim / Towards Data Science: Agentic RAG Failure Modes](https://towardsdatascience.com/agentic-rag-failure-modes-retrieval-thrash-tool-storms-and-context-bloat-and-how-to-spot-them-early/)). A retrieval loop without a cap is a budget fire with no smoke alarm.

Fourth ledger row:

| What breaks | What the agent does instead of erroring |
| --- | --- |
| No stop rule on the retrieval loop | Thrashes — burns budget chasing "get more" |

---

## Design The Fallback Once: Cap, Check For Evidence, Abstain Honestly, And Never Dump The Raw Payload Back

Four failures, one fix. Rather than bolting a different guard onto each break, build a single fallback path that every resolution funnels through. Get its last step right — the naive fallback poisons the context it was meant to protect. Run these four in order:

1. **Cap the loop.** Apply the hard retrieval-cycle cap from the section above before anything else — the fallback runs *because* a resolution failed, and an uncapped fallback is just the thrash again.
2. **Check whether real evidence came back.** Distinguish "resolved with supporting evidence" from "resolved with a semantically-related but unsupported passage" — the legibility signal is what tells the two apart.
3. **Prefer honest abstention.** If no real evidence is present, surface an honest error or a disclaimed best-effort answer — never a confident fabrication. This is the honest column, applied.
4. **Refuse to re-inject the raw resolved payload.** When a resolution comes back low-confidence, do not dump the raw blob back into context "just in case."

That last step is where most fallbacks quietly fail. The instinct is to hand the model everything retrieved and let it sort out relevance — but re-injecting a low-value payload rots the very window JIT kept clean. The degradation is measured across 18 models: performance degrades as input length increases, often in surprising and non-uniform ways, and even a single distractor reduces performance relative to the baseline ([Chroma: Context Rot — Hong et al., 2025](https://www.trychroma.com/research/context-rot)). One irrelevant payload is enough to move the curve — the same context-rot slope that makes task sizing a context problem rather than a lines-of-code problem (as in [how to size tasks for AI coding agents](/blog/how-to-size-tasks-for-ai-coding-agents/)). Dumping the raw payload back trades a loud miss for a quiet degradation, which is the worse trade.

The ledger's second column, rewritten — every "what the agent does instead" turned into "what a hardened agent does":

| What breaks | Hardened fallback |
| --- | --- |
| Dead / unresolvable reference | Raises a loud, loop-visible error |
| Bad / ambiguous tool description | Audited catalog; wrong-tool routing surfaced, not hidden |
| Empty / no-match semantic result | Reports "no supporting evidence" and abstains |
| No stop rule on the retrieval loop | Caps at three passes, returns disclaimed best-effort |

---

## The Completed Ledger: Run This Table Before You Ship A JIT Agent

Before you ship a JIT agent, walk the completed ledger row by row — for each break, confirm the agent surfaces an honest error instead of a confident fabrication. Each row maps to one section above; if any row's fix is unimplemented, that failure is silent in production.

| # | What breaks | Default (silent) failure | Ship only when the agent instead… |
| --- | --- | --- | --- |
| 1 | Dead / unresolvable reference | Fabricates the payload it was told to fetch | Raises a loud, loop-visible error at the resolution boundary |
| 2 | Bad / ambiguous tool description | Selects the wrong tool silently | Routes on audited descriptions and a cut catalog; ambiguity surfaces |
| 3 | Empty / no-match semantic result | Returns an unsupported passage as fact | Reports "no supporting evidence" and abstains |
| 4 | No stop rule on the retrieval loop | Thrashes, burning budget on "get more" | Caps at three passes and returns a disclaimed best-effort answer |
| — | Low-confidence resolution (the fallback) | Re-injects the raw payload and rots the window | Withholds the raw blob; prefers honest abstention |

The through-line across all five: JIT does not make retrieval free — it makes retrieval late, and late retrieval fails silently unless you engineer the failure to be loud. The evangelism ships the first column. The honest column is the deliverable. If shipping the fallback for a production JIT agent is the wedge between a demo and a system you can trust, that is the work I do — [let's talk](/work-with-me).

---

## References

### Research and Data

1. [Zeng et al.: Rethinking Agentic RAG — Toward LLM-Driven Logical Retrieval Beyond Embeddings](https://arxiv.org/html/2605.27123) — Legibility of failed logical search; refusal rate 0.767→0.828 and hallucination 0.128→0.083 on answer-unavailable questions. Backs the "report nothing found" section.
2. [Chroma: Context Rot — Hong, Troynikov, Huber, 2025](https://www.trychroma.com/research/context-rot) — 18-model study: performance degrades non-uniformly as input grows, and a single distractor reduces performance. Backs "never dump the raw payload back."
3. [Huang et al.: When Agents Fail to Act — A Diagnostic Framework for Tool Invocation Reliability](https://arxiv.org/abs/2601.16280) — Tool initialization failures are the primary reliability bottleneck for smaller models. Backs the tool-description-as-decision-surface premise.

### Practitioner Guidance

4. [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — The runtime-exploration tradeoff (slower + tooling-dependent) and the pointers-over-pre-loading JIT definition. Backs the opening tradeoff section.
5. [TrueFoundry: JIT Context — Why the Best Agents Load Late and Load Little](https://www.truefoundry.com/pt/blog/jit-context-just-in-time-context-agents) — The "honest error, not a hallucinated payload" framing and the description-quality dependency. Seeds the ledger and backs the dead-reference section.
6. [Anthropic: Introducing advanced tool use on the Claude Developer Platform](https://www.anthropic.com/engineering/advanced-tool-use) — 58 tools/55K tokens upfront, 134K before optimization; wrong tool selection as the most common failure. Backs "cut the catalog."
7. [Guy / AWS Heroes: MCP Tool Design — Why Your AI Agent Is Failing (And How to Fix It)](https://dev.to/aws-heroes/mcp-tool-design-why-your-ai-agent-is-failing-and-how-to-fix-it-40fc) — Tool descriptions as the LLM's primary decision surface; the 97.1%/56%/5.85pp figures (arXiv:2602.14878) and the Speakeasy 107-vs-10-tools result. Backs the tool-description section.
8. [Ibrahim / Towards Data Science: Agentic RAG Failure Modes](https://towardsdatascience.com/agentic-rag-failure-modes-retrieval-thrash-tool-storms-and-context-bloat-and-how-to-spot-them-early/) — The "get more" spiral, the three-cycle cap, and the 200-calls/\$50–200 and 1,700% cost anecdotes. Backs "cap the loop and abstain."
9. [Perrone: Why AI Agents Keep Failing in Production](https://medium.com/data-science-collective/why-ai-agents-keep-failing-in-production-cdd335b22219) — Silent retrieval failure has no flag; bad retrieval is not a hallucination; auth/token rot fails silently. Backs the dead-reference and fallback sections.

---
title: "How to Structure CLAUDE.md: It's a Loading Policy, Not a Document"
date: 2026-07-13
draft: false
pillar: context-engineering
author: "John Young"
description: "Anthropic closed 'Claude ignores my CLAUDE.md' as not-planned, area:model. The fix is structural: route every line to the tier that loads it, not a longer file."
keywords: ["CLAUDE.md structure", "Claude Code memory", "context engineering", "CLAUDE.md loading", "agent skills"]
tldr:
  - "CLAUDE.md is not a document to fill — it's a loading policy to configure, and the fix for \"Claude ignores my CLAUDE.md\" is routing each line to the tier that matches which sessions need it, not writing a longer file."
  - "Claude Code runs three loading tiers with three different costs: root and ancestor CLAUDE.md load in full at launch for every session, subdirectory files load only when Claude reads a matching file, and skills load a roughly 100-token blurb always with the full body entering context only on trigger."
  - "Splitting an oversized CLAUDE.md into @-imported files is organization, not load reduction — imported files still load in full at launch, so a 2,100-line file split six ways still bills every session for content its own author measured as 85-90% irrelevant."
  - "Misrouting has a measured cost, not just a theoretical one: over-specified root files bury the rules that matter, and a benchmark of repository context files found they lower task success rates while raising inference cost more than 20%, because agents dutifully obey every line regardless of whether it belongs there."
---
{{< eli5 hint="no background needed · 10 min" audience="for readers outside AI engineering" >}}
A developer filed a bug report against Claude Code (an AI assistant that writes and edits code) that said, in effect: "I told it the rules, it told me it understood the rules, and it broke them anyway." This is about why that happens, and why writing a longer, stricter rulebook is not the fix.

## The big idea

Picture the AI's instructions file not as a memo you write once and forget, but as a stack of paperwork with different rules for when each page gets pulled out and read. Some of it gets read out loud, start to finish, before every single task — even a task as small as fixing one typo. Some of it only gets pulled out when the AI actually opens a specific folder of code, like opening one drawer of a filing cabinet. And some of it sits as a one-line index card, with the full page behind it only read if that specific card gets pulled.

Here's the part that makes this matter: the AI has no memory from one session to the next. It's like a worker who forgets everything the moment a shift ends and has to be briefed again from scratch at the start of the next one. Where you file a rule decides how often that briefing includes it — and that decides both what it costs (in time and money) and whether the important rules actually survive being read, or get buried. The fix for "the AI ignores my rules" isn't a longer, sterner memo. It's putting each rule in the drawer that matches who actually needs it.

## Some rules get re-read every single time, whether they're needed or not

Claude Code sorts instructions into three tiers, and each one has a different cost. The first tier — anything in the main instructions file — gets read in full at the very start of every single session, no matter how small the task is. Think of it as the part of the handbook that gets read out loud before every shift begins, even a shift where the worker will only answer one phone call.

The second tier is instructions tied to one specific folder of code. Those only get pulled in when the AI actually opens a file in that folder — like a drawer in a filing cabinet that only gets opened when someone needs a document that's actually inside it. The third tier is what the tool calls a "skill" — a mini-guide the AI only reads in full if the task actually calls for it. The rest of the time, all it sees is a one-line summary, roughly the size of an index card.

One real example from the source material: a developer had a 2,100-line instructions file. To clean it up, they split it into a short 150-line core plus five separate add-on files, pulled in automatically. It looked tidy. But because those add-on files still load automatically at the start of every session, the AI was still reading all 2,100 lines every single time — the split changed how the paperwork looked on the shelf, not how much of it got read.

One honest caveat here: the "only loads when a specific folder is opened" tier is the documented design, but there are real reports of it not firing reliably on some tools (it's been reported broken on one code editor's extension while working fine elsewhere). If you're depending on a rule only showing up for one folder, there's a built-in command that lists exactly what's actually loaded in the current session — worth checking rather than assuming.

## Cramming in more rules makes the AI worse at following the important ones

There's a documented failure pattern: when the instructions file gets too long, the AI doesn't reject the extra rules — it starts losing track of the ones that matter most, because they get lost in the noise. This isn't a guess. A test that scales a single prompt from 10 up to 500 simultaneous instructions found that even the best AI models cap out around two-thirds accuracy once you hit 500, and they get noticeably worse at obeying instructions once you're past roughly 150–200 at once.

Researchers didn't test instructions files specifically — they tested how these AI models handle any long stretch of text and rules in general. But the mechanism isn't specific to any one file, so the same pattern shows up here: separate research has found that models get worse at using information stuck in the middle of a long document, and that a single stray, plausible-but-irrelevant sentence can throw off a model that would otherwise solve a problem cleanly.

Here's the important caveat, and it matters: this doesn't mean "any extra text is dangerous." One study found that truly unrelated filler — text with nothing to do with the task at all — mostly just slows the AI down, not makes it wrong. A model stuffed with 15,000 words of generic noise dropped only half a percentage point in accuracy, even though it took over seven times longer to respond. The real damage comes from the stuff that looks like it might apply — a coding convention that seems relevant but is actually for a different kind of task. So the rule isn't "delete everything." It's: treat anything that isn't universally true as a suspect, because the rules that look like they might apply are the ones that quietly do the damage. That 2,100-line file turned out to have 85–90% of its content irrelevant to any given conversation — which means most of what it cost every session was pure distraction, not help.

## Breaking a long file into pieces feels tidy, but doesn't actually save anything

When an instructions file gets unwieldy, the natural move is to split it into smaller files and stitch them back together with a reference — like breaking one long memo into five shorter memos, then stapling all five behind the cover page. It looks organized. But if those files still get pulled in automatically at the start of every session, nothing about the actual reading load changed. The documentation for the tool says this plainly: splitting a file this way "helps organization but does not reduce context, since imported files load at launch." That's exactly what happened with the 2,100-line example — the author who built it measured the result themselves and found it used the same amount every session, in a tidier-looking wrapper.

The fix that actually works is different: move each piece of content to the tier that matches who needs it. A rule about one programming language becomes a folder-specific rule that only loads when the AI touches that kind of file. A multi-step procedure becomes a skill that only loads when that procedure is actually invoked. Do that, and a session that never touches those files pays nothing for them.

## A misplaced rule isn't just clutter — the AI actually tries to follow it, and that costs real accuracy and money

Here's the part people underestimate: a rule sitting in the wrong tier doesn't just sit there quietly wasting a little space. The AI treats every instruction it's been given as something to obey, even instructions that don't actually apply to the current task. That's the core finding of a study on these instruction files across multiple AI coding tools: having a repository instructions file tended to lower the AI's success rate compared to having no such file at all, while also making the AI more expensive to run — over 20% more, plus a couple of extra unnecessary steps per task. The mechanism is obedience: the AI generally does follow whatever the file tells it, whether or not that instruction belongs in this particular job. A misplaced line isn't dead weight sitting in a drawer — it's an instruction the AI will actively spend effort satisfying. The same study also found these files tend to be bad at their most common intended job — giving the AI a useful overview of the codebase.

There's a second wrinkle worth keeping in mind: even the "loads only when needed" tier isn't free once it fires. Once a skill (that pay-per-trigger mini-guide) gets triggered, its full content stays part of the conversation for the rest of that session — it's a one-time trigger, not a one-time cost. The savings are real for sessions that never need it, but for the sessions that do, you should count on paying for it in full, and for it lingering.

Put both problems together, and it explains why a bloated instructions file is worse than it looks: the rules you actually need get buried in the noise, and the rules you don't need get carried out anyway, burning time and money on every single session — including ones that never should have touched them in the first place.

## What this means for you

If you're setting up instructions for an AI coding tool, the question to ask about every single rule isn't "is this a good rule?" — it's "which sessions actually need this?" If the honest answer is "every session," it belongs in the main file, and it should be short: just the pointers and critical warnings that genuinely apply everywhere. If the answer is "only sessions touching this one folder or file type," it belongs in a rule scoped to that folder, so only the sessions that need it pay for it. If the answer is "only sometimes, for one specific procedure," it belongs in a skill — a mini-guide that stays out of the way until it's actually called for, though once called for, it stays for the rest of that session. And if you genuinely can't say which sessions need a rule, the honest move is to delete it, because every rule that survives keeps getting read, and keeps getting obeyed, whether it helps or not.

---

**The technical terms, in plain words**
- CLAUDE.md = the special instructions file people write to tell an AI coding assistant the rules and conventions of a project.
- Claude Code = the AI assistant this file is written for; it can read, write, and edit code somewhat on its own.
- Context / context window = everything the AI is currently "holding in mind" for the task at hand — its working memory for that session.
- Token = a small chunk of text (roughly a piece of a word) — the basic unit the AI reads, and effectively pays for.
- Always-loaded tier = the part of the instructions read in full at the very start of every single session, regardless of the task.
- Pay-per-read tier = instructions tied to one folder or file type, only pulled in when the AI actually opens a matching file.
- Skill / pay-per-trigger tier = a mini-guide the AI only reads in full if the task actually calls for it; otherwise it only sees a one-line summary.
- @-imports = a way of stitching separate files into the main instructions file — but they still get read in full at launch, same as if it were one long file.
- Path-scoped rule = an instruction that only applies to, and only loads for, a specific type of file or folder.
- Context rot = the AI's accuracy quietly getting worse as more text competes for its attention, especially text that looks relevant but isn't.
- Distractor = a stray, plausible-but-irrelevant piece of text that throws the AI off, even though it shouldn't matter.
- Instruction ceiling = the point past which an AI model starts reliably missing or dropping some of the instructions it's been given.
- /memory command = a built-in command that shows exactly which instruction files are actually loaded in the current session.
- Inference cost = how much it costs, in compute and money, to run the AI on a given task.
- Compliance cost = the price paid when the AI faithfully tries to follow every instruction it's given, including ones that don't belong in the current job.
- AGENTS.md = a similar instructions-file convention shared across different AI coding tools, not just this one.

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}

When a developer filed a bug titled `[BUG] Claude Code continually ignores CLAUDE.MD file`, Anthropic closed it not-planned and labeled it `area:model` — bug-tracker shorthand for *this is not a defect we can patch* ([anthropics/claude-code#34197](https://github.com/anthropics/claude-code/issues/34197)). The report carried its own confession, pasted straight from the session that triggered it:

> The rules are clear in the CLAUDE.md and memory files — read them, I know them, and I still violated them.
> — [GitHub: anthropics/claude-code#34197](https://github.com/anthropics/claude-code/issues/34197)

If the model knows the rules and breaks them anyway, a longer, sterner CLAUDE.md is not the fix. The fix is structural: CLAUDE.md is not a document you fill, it is a loading policy you configure. Most of what goes wrong is content sitting in the wrong tier — billed to every session whether that session needs it or not.

---

## The Three Loading Tiers Claude Code Already Runs

Before you decide what belongs in a CLAUDE.md, look at where it loads — because Claude Code already sorts your instructions into three tiers, and the tier decides the bill.

> CLAUDE.md and CLAUDE.local.md files in the directory hierarchy above the working directory are loaded in full at launch. Files in subdirectories load on demand when Claude reads files in those directories.
> — [Claude Code Docs: How Claude remembers your project](https://code.claude.com/docs/en/memory)

That splits your configuration into three tiers with three different costs:

| Tier | What lives here | When it loads | Who pays |
| --- | --- | --- | --- |
| **Always-loaded** | Root and ancestor `CLAUDE.md`, `@`-imports, unscoped `.claude/rules/` | In full, at launch | Every session |
| **Pay-per-read** | Subdirectory `CLAUDE.md`, path-scoped rules | When Claude reads a matching file | Only sessions that touch that code |
| **Pay-per-trigger** | Skills | ~100-token blurb always; body on trigger | Only sessions that invoke it |

The pay-per-read tier is lazy and file-access-triggered, not a startup scan — Claude Code's creator confirmed as much when he closed a request to make subdirectory loading eager: Claude automatically reads a subdirectory's `CLAUDE.md` as it works on files in that directory ([anthropics/claude-code#4275](https://github.com/anthropics/claude-code/issues/4275)). The vendor's large-codebases guidance describes the same additive behavior — "root file for the big picture, subdirectory files for local conventions" ([Claude by Anthropic: Large codebases](https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start)). The pay-per-trigger tier is quantified: a skill costs roughly 100 tokens of always-loaded metadata, and its body — under 5k tokens — enters the context window only when the skill fires ([Anthropic: Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)).

This is [context engineering](/blog/anatomy-of-a-perfect-ai-agent-task/), and Anthropic frames it that way: "Context, therefore, must be treated as a finite resource with diminishing marginal returns," with CLAUDE.md as the part "naively dropped into context up front" while glob and grep retrieve the rest just-in-time ([Anthropic: Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)). The always-loaded tier is exactly that — in context at the start of every session, before you type a word ([Claude by Anthropic: Using CLAUDE.md files](https://claude.com/blog/using-claude-md-files)).

Now take a real file. A developer split a 2,100-line CLAUDE.md into a 150-line core plus five `@`-imported docs — `testing.md` (270 lines), `typescript.md` (305), `code-style.md` (370), `workflow.md` (671), and `examples.md` (278) — the tidy, modular layout every "keep it lean" guide recommends ([anthropics/claude-code#11759](https://github.com/anthropics/claude-code/issues/11759)). Map it onto the table and the tidiness evaporates. `@`-imports load at launch, so all six files ride the always-loaded tier. The split changed the file browser, not the bill. This corpus recurs in every section below — it already made the naive fix and measured the result.

### Verify the Pay-Per-Read Tier on Your Own Surface

The pay-per-read tier is documented design, but it has a reliability caveat — confirm it before you bet directory conventions on it. It has unresolved reports of not firing:

- **When subdirectory conventions get silently ignored, suspect the surface.** Nested loading has been reported broken on the VS Code extension while the CLI reportedly works ([anthropics/claude-code#24987](https://github.com/anthropics/claude-code/issues/24987)). An earlier macOS report was closed not-planned without a fix ([anthropics/claude-code#2571](https://github.com/anthropics/claude-code/issues/2571)).
- **Before you rely on a nested file, run `/memory`.** It lists every CLAUDE.md, CLAUDE.local.md, and rules file loaded in the current session; if the file you expect isn't listed, Claude can't see it ([Claude Code Docs: How Claude remembers your project](https://code.claude.com/docs/en/memory)).
- **Treat the lazy tiers as just-in-time retrieval, with JIT's failure modes.** They pull content in as Claude navigates — powerful, but with quiet ways to break down, which is the subject of a [separate post on where lazy retrieval silently fails](/blog/jit-context-retrieval-failure/).

---

## The Over-Specified CLAUDE.md Is a Named Failure Mode

Prune your CLAUDE.md on adherence grounds, not tidiness. Past the file's attention budget, every rule you add subtracts from the ones already there. The rules you actually need to [land a change on the first try](/blog/how-to-size-tasks-for-ai-coding-agents/) are the ones that get buried. Anthropic names the pattern directly:

> The over-specified CLAUDE.md. If your CLAUDE.md is too long, Claude ignores half of it because important rules get lost in the noise.
> — [Claude Code Docs: Best practices](https://code.claude.com/docs/en/best-practices)

This is measured, not folklore. IFScale, a benchmark that scales a single prompt from 10 to 500 simultaneous instructions, found that even the best frontier models top out at 68% accuracy once you hit 500 — and their bias toward earlier instructions peaks around 150–200 ([arXiv: How Many Instructions Can LLMs Follow at Once?](https://arxiv.org/abs/2507.11538)). The instruction ceiling is real and closer than it looks, which is the whole argument of the [companion post on the root file's budget](/blog/claude-md-instruction-ceiling/).

The mechanism is well-documented and not specific to CLAUDE.md. Chroma's context-rot study across 18 models found performance grows unreliable as input length grows, and that distractors compound:

> Even a single distractor reduces performance relative to the baseline (needle only), and adding four distractors compounds this degradation further.
> — [Chroma: Context Rot](https://www.trychroma.com/research/context-rot)

It gets worse with position — models are worst at using information stranded in the middle of a long context ([Liu et al.: Lost in the Middle](https://arxiv.org/abs/2307.03172)) — and worse with sheer length: one study measured accuracy dropping 13.9–85% as input grew, even when the model could perfectly retrieve every relevant fact ([Du et al.: Context Length Alone Hurts LLM Performance](https://aclanthology.org/2025.findings-emnlp.1264/)). A single irrelevant sentence is enough to derail a problem the model solves cleanly without it ([Shi et al.: Distracted by Irrelevant Context](https://arxiv.org/abs/2302.00093)); on a controlled reasoning benchmark, step accuracy fell from 26% to 2% as distractors climbed from one to fifteen ([arXiv: GSM-DC](https://arxiv.org/abs/2505.18761)).

One honest caveat keeps this from overreaching. Truly unrelated filler — text with no plausible bearing on the task — mostly costs latency, not accuracy: one study saturated a 70B model with 15,000 words of generic noise and watched accuracy fall only from 98.5% to 98%, while latency rose 719.64% ([Ponnusamy et al.: Context Discipline and Performance](https://arxiv.org/abs/2601.11564)). The accuracy damage comes from the plausible-but-inapplicable line — the TypeScript convention that looks relevant during a bash task. So the rule is not "delete everything." It is: treat each non-universal line as a suspect, because the ones that read like they might apply are the ones that do the damage.

That is what makes the corpus above worse than a monolith. Its author measured that 85–90% of the loaded content is irrelevant to most conversations ([anthropics/claude-code#11759](https://github.com/anthropics/claude-code/issues/11759)). Most of its per-session tax buys distraction, not guidance — 2,100 lines competing for an attention budget that starts thinning well before 500 instructions.

---

## Why @imports Won't Save You

When a CLAUDE.md gets too long, the reflex is to break it apart with `@path` imports and call it lean. That reflex is wrong, and it is wrong in a specific, measurable way: splitting the file is organization, not load reduction.

**Bad:** the 2,100-line file split into a 150-line core with five `@docs/*.md` imports. Reads modular. Loads identically — all ~2,100 lines enter context at launch, every session. The author who built exactly this split measured the outcome: "the same tokens as a monolithic file, providing organizational benefits only" ([anthropics/claude-code#11759](https://github.com/anthropics/claude-code/issues/11759)).

**Good:** the same content moved to tiers that actually gate loading. `typescript.md` becomes a path-scoped rule that loads only when Claude touches `.ts` files; `workflow.md` becomes a skill that loads only when invoked. Now a bash-only session pays for none of it.

The documentation states the mechanic plainly, and states it more than once:

> Splitting into @path imports helps organization but does not reduce context, since imported files load at launch.
> — [Claude Code Docs: How Claude remembers your project](https://code.claude.com/docs/en/memory)

This matters because the wrong model is actively taught. One popular guide frames `@`-imports as pure leanness — "Put detailed instructions in separate markdown files, then reference them. Claude pulls in the content when relevant" ([Builder.io: How to Write a Good CLAUDE.md](https://www.builder.io/blog/claude-md-guide)). "When relevant" is exactly what imports do not do; they load at launch, relevant or not. Even the guides that state the mechanic correctly — imports "do not reduce context usage" because the "content is expanded inline and still counts against the active window" ([Bijit Ghosh: The Complete Guide to CLAUDE.md](https://medium.com/@bijit211987/the-complete-guide-to-claude-md-memory-rules-loading-and-cross-tool-compression-97cc12ed037b)) — stop at the mechanic and never turn it into a placement rule. That rule is the next section.

---

## Route Every Line by the Sessions That Need It

Here is the fix that actually holds. For every line in your CLAUDE.md, ask one question — *which sessions need this?* — and let the answer pick the tier. That is Anthropic's own instruction: "If an entry is a multi-step procedure or only matters for one part of the codebase, move it to a skill or a path-scoped rule instead" ([Claude Code Docs: How Claude remembers your project](https://code.claude.com/docs/en/memory)).

| Content class | Route to | Loads when |
| --- | --- | --- |
| **Facts every session needs** — build commands, "always do X", critical gotchas | Root `CLAUDE.md`, kept short | In full, at launch |
| **Conventions for one file type or directory** — a `.ts` style rule, a package's local rules | Path-scoped rule or nested `CLAUDE.md` | Claude reads a matching file |
| **A procedure or occasional reference** — a multi-step workflow, a bank of examples | A skill | Metadata always; body on trigger |

The skills row is where the docs are most direct: "CLAUDE.md is loaded every session, so only include things that apply broadly. For domain knowledge or workflows that are only relevant sometimes, use skills instead" ([Claude Code Docs: Best practices](https://code.claude.com/docs/en/best-practices)). Named practitioners land in the same place — a skill "only takes up a few dozen extra tokens, with the full details only loaded in should the user request a task that the skill can help solve" ([Simon Willison: Claude Skills](https://simonwillison.net/2025/Oct/16/claude-skills/)). The discipline for the root file is to keep it "concise and universally applicable" ([HumanLayer: Skill Issue](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents)).

**The routing question is therefore not "is this rule good?" but "which sessions should pay for it?"**

Run the corpus through it. `typescript.md` and `code-style.md` govern specific file types — path-scoped rules matching `**/*.ts` and your source globs, loaded only when Claude edits those files. `testing.md` rides along with the test files it describes. `workflow.md` (671 lines of TDD procedure) and `examples.md` (278 lines of patterns) are a procedure and a reference bank — skills, bodies loaded only on trigger. Layer boundaries are the natural seams here: what governs one layer routes to that layer's files. What is left of the 150-line core shrinks toward what the root is actually for:

> The root file should be pointers and critical gotchas only; everything else drifts into noise.
> — [Claude by Anthropic: Large codebases](https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start)

That is not an aspiration. HumanLayer's production root CLAUDE.md runs "less than sixty lines," on the rule to "Prefer pointers to copies" ([HumanLayer: Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)).

### On-Demand Is Not Free Once It Fires

Routing to a skill is not a free lunch, and pretending otherwise sets a footgun. A skill's body stays out of context until something triggers it — but once it fires, it stays:

> When you or Claude invoke a skill, the rendered SKILL.md content enters the conversation as a single message and stays there for the rest of the session.
> — [Claude Code Docs: Extend Claude with skills](https://code.claude.com/docs/en/skills)

So a triggered skill is a recurring cost from that point on, not a one-time read. The routing win is real — a bash-only session never pays for your TDD skill — but budget the skill body as if it will load, because in the sessions that need it, it does, and it lingers.

---

## The Measured Cost of a Wrongly Routed Line

Here is the failure mode people underweight. A rule in the wrong tier is not quietly ignored — it is dutifully obeyed, at [a price you can measure](/blog/per-task-cost-attribution/). A benchmark of repository context files across multiple coding agents found the compliance itself is the cost: the files "tend to reduce task success rates compared to providing no repository context, while also increasing inference cost by over 20%" ([Gloaguen et al.: Evaluating AGENTS.md](https://arxiv.org/html/2602.11988v1)).

The measured penalty, across SWE-bench Lite and a benchmark of developer-written files ([Gloaguen et al.: Evaluating AGENTS.md](https://arxiv.org/html/2602.11988v1)):

| What the study measured | Result with a repository context file |
| --- | --- |
| Task success / resolution rate | Lower than the no-context baseline |
| Inference cost | +20–23% |
| Extra steps per task | +2.45 and +3.92 across the two benchmarks |

The mechanism is obedience — "agents generally follow instructions present in the context files" — so a misplaced line is therefore not inert weight; it is an instruction the agent will burn steps satisfying. And the thing most root files try hardest to do — narrate the codebase — is the thing the same study found they fail at. Context files "are not effective at providing a repository overview."

Put the two failure modes together and the corpus's real cost comes into focus. The rules you need get lost in the noise (the over-specified failure), and the rules you don't need get executed anyway (the compliance cost). The 2,100-line always-loaded corpus pays both, every session — including the ones that only touch a bash script — to carry content its own author measured as 85–90% irrelevant. That is pure context burn.

And because it is a per-session cost, it compounds. In an iterative loop that restarts context repeatedly, the misrouted tax is paid on every pass — the [recurring-cost problem that breaks playbooks built for one-shot sessions](/blog/loop-engineering-breaks-your-playbook/).

---

## A Routing Flowchart for Every Line You Keep

You do not need a quarterly re-prune ritual. You need to run each line you keep through one decision path — and then most of the pruning takes care of itself. Ask these in order:

**Is it needed in every session?**
→ Root file — but it now competes for [the adherence budget that caps out well before 500 instructions](/blog/claude-md-instruction-ceiling/). Keep it to pointers and critical gotchas.

**Is it needed in one directory or file type?**
→ Nested `CLAUDE.md` or path-scoped rule — the pay-per-read tier. Verify it loads on your surface with `/memory` first.

**Is it a procedure or an occasional reference?**
→ Skill — pay-per-trigger. Budget the body anyway; once it fires it sticks for the session.

**Do you just want the file shorter?**
→ That is organization, not savings. `@`-imports change nothing — they load at launch.

**Can't say which sessions need it?**
→ Delete it. Every surviving line binds and bills.

Run the corpus through the gates and it lands where it should have started: a ~150-line root of pointers and gotchas, three path-scoped files next to the code they govern, and two skills that load only when invoked. Same content, a fraction of the per-session tax, and no standing re-prune ritual — Anthropic's own cadence is a configuration review every three to six months, not a weekly file diet ([Claude by Anthropic: Large codebases](https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start)).

You do not have to run this flowchart by hand. I packaged it as a Claude Code skill — [agent-engineering-toolkit](https://github.com/johnayoung/agent-engineering-toolkit) — that inventories your repo's three tiers, expands every `@`-import, totals the real always-loaded token cost, and emits the routing report above. It is the audit I ran on my own repos while writing this.

And the skill transfers. The same nearest-file hierarchy is now the cross-tool `AGENTS.md` convention — "Agents automatically read the nearest file in the directory tree, so the closest one takes precedence and every subproject can ship tailored instructions" ([AGENTS.md](https://agents.md/)) — with the same discipline attached: keep the root short and push specifics down the tree ([Addy Osmani: AGENTS.md](https://addyosmani.com/agents/15-agents-md/)). Route by tier once and the discipline is portable.

The pay-per-read and pay-per-trigger tiers you just routed into are just-in-time retrieval by another name — and just-in-time retrieval has failure modes of its own. That is the next thing worth understanding before you push your whole config into the lazy tiers: [where lazy retrieval silently breaks](/blog/jit-context-retrieval-failure/).

---

## References

### Research and Data

1. [Chroma: Context Rot — Hong, Troynikov, Huber](https://www.trychroma.com/research/context-rot) — Across 18 LLMs, model performance grows unreliable as input length grows, and even one topically-plausible distractor measurably degrades it. Backs the degradation-by-analogy argument.
2. [arXiv: How Many Instructions Can LLMs Follow at Once?](https://arxiv.org/abs/2507.11538) — The best frontier models reach only 68% accuracy at 500 simultaneous instructions, with the early-instruction bias peaking around 150–200. Backs the instruction-ceiling claim.
3. [Liu et al.: Lost in the Middle](https://arxiv.org/abs/2307.03172) — Models are worst at using information stranded in the middle of a long context. Backs the position-dependence point.
4. [Du et al.: Context Length Alone Hurts LLM Performance](https://aclanthology.org/2025.findings-emnlp.1264/) — Accuracy drops 13.9–85% as input grows even under perfect retrieval, well within claimed context windows. Backs the length-alone degradation point.
5. [Shi et al.: Distracted by Irrelevant Context](https://arxiv.org/abs/2302.00093) — A single irrelevant sentence degrades accuracy on problems the model otherwise solves cleanly. Backs the distraction mechanism.
6. [arXiv: GSM-DC — Reasoning Distracted by Irrelevant Context](https://arxiv.org/abs/2505.18761) — GPT-4.1 step accuracy falls from 26% to 2% as distractors climb from one to fifteen. Backs distractor compounding.
7. [Ponnusamy et al.: Context Discipline and Performance](https://arxiv.org/abs/2601.11564) — A 70B model held 98% accuracy under 15,000 words of generic filler while latency rose 719.64%. Backs the honest caveat that unrelated filler costs latency, not accuracy.
8. [Gloaguen et al.: Evaluating AGENTS.md](https://arxiv.org/html/2602.11988v1) — Repository context files reduced task success while raising inference cost over 20%, because agents comply with everything the file says, and are not effective at providing a repository overview. Backs the measured-cost section.

### Practitioner Guidance

9. [Claude Code Docs: How Claude remembers your project](https://code.claude.com/docs/en/memory) — Ancestor CLAUDE.md files load in full at launch, subdirectory files load on demand when Claude reads files there, and @imports load at launch without reducing context. The loading-policy spec the whole post routes against.
10. [Claude Code Docs: Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) — "The over-specified CLAUDE.md" is a named failure: too long and Claude ignores half of it, so route sometimes-relevant content to skills. Backs the prune-on-adherence and routing sections.
11. [Claude by Anthropic: How Claude Code works in large codebases](https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start) — Root file should be pointers and critical gotchas only, Claude loads files additively as it moves through the codebase, and teams should review configuration every three to six months. Backs the root-scope rule and the cadence.
12. [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — Context is a finite resource with diminishing marginal returns; CLAUDE.md is dropped in up front while glob and grep retrieve just-in-time. Backs the finite-budget and hybrid-tier framing.
13. [Anthropic: Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) — Progressive disclosure: ~100 tokens of metadata always loaded, the under-5k body only when triggered, resources effectively unlimited. Backs the pay-per-trigger cost model.
14. [Claude Code Docs: Extend Claude with skills](https://code.claude.com/docs/en/skills) — A skill's body loads only when used, but once invoked it stays in context for the rest of the session. Backs the routing rule and the on-demand-is-not-free caveat.
15. [Claude by Anthropic: Using CLAUDE.md files](https://claude.com/blog/using-claude-md-files) — Every conversation starts with the always-loaded context already in place. Backs the every-session recurring-cost framing.
16. [Builder.io: How to Write a Good CLAUDE.md File — Gopinath](https://www.builder.io/blog/claude-md-guide) — Frames @imports as "Claude pulls in the content when relevant," the naive model the loading docs refute. The SERP foil in the @imports section.
17. [Bijit Ghosh: The Complete Guide to CLAUDE.md](https://medium.com/@bijit211987/the-complete-guide-to-claude-md-memory-rules-loading-and-cross-tool-compression-97cc12ed037b) — States correctly that imports don't reduce context usage, but never turns the mechanic into a placement rule. The gap the post fills.
18. [Simon Willison: Claude Skills are awesome](https://simonwillison.net/2025/Oct/16/claude-skills/) — Each skill costs a few dozen extra tokens until invoked. Named-author validation of metadata-first loading.
19. [HumanLayer: Writing a good CLAUDE.md — Kyle](https://www.humanlayer.dev/blog/writing-a-good-claude-md) — HumanLayer's root CLAUDE.md runs under sixty lines on the rule to prefer pointers to copies. Backs the trimmed-root target.
20. [HumanLayer: Skill Issue — Harness Engineering for Coding Agents](https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents) — Keep CLAUDE.md concise and universally applicable. Backs the route-by-scope rule.
21. [AGENTS.md](https://agents.md/) — Agents read the nearest file in the directory tree, so the closest one takes precedence. Backs the cross-tool generalization.
22. [Addy Osmani: Lesson 16 — AGENTS.md](https://addyosmani.com/agents/15-agents-md/) — Agents read the nearest file in the current directory or its parents; aim for 150 lines or fewer. Backs the cross-tool close.
23. [anthropics/claude-code#34197](https://github.com/anthropics/claude-code/issues/34197) — "Claude ignores my CLAUDE.md" closed not-planned and labeled area:model, locating the failure in model behavior rather than fixable tooling. The hook.
24. [anthropics/claude-code#4275](https://github.com/anthropics/claude-code/issues/4275) — Boris Cherny confirms subdirectory CLAUDE.md files load lazily as Claude works on files there. Backs the pay-per-read tier.
25. [anthropics/claude-code#11759](https://github.com/anthropics/claude-code/issues/11759) — A 2,100-line CLAUDE.md split across six @-imported files consumed the same tokens as a monolith, ~85–90% irrelevant to most conversations. The running-thread artifact.
26. [anthropics/claude-code#24987](https://github.com/anthropics/claude-code/issues/24987) — Subdirectory CLAUDE.md files reported not loading on the VS Code extension while the CLI works. Backs the verify-your-surface caveat.
27. [anthropics/claude-code#2571](https://github.com/anthropics/claude-code/issues/2571) — Subdirectory CLAUDE.md files reported not auto-loading on macOS, closed not-planned. Backs the reliability caveat.
28. [agent-engineering-toolkit: audit-claude-md](https://github.com/johnayoung/agent-engineering-toolkit) — This post's routing flowchart as a runnable Claude Code skill: tier inventory, @import expansion, token estimates, and a per-section routing report. MIT-licensed, runs standalone.

### Author's Judgment (not directly sourced)

The following framings are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"CLAUDE.md is a loading policy, not a document"** — my lens on the mechanics; follows from Anthropic's documented tiers (memory docs), which describe the loading behavior but never frame the file this way.
- **Applying the context-rot and instruction-density literature to CLAUDE.md** — Chroma, IFScale, Liu, Du, Shi, GSM-DC, and Ponnusamy never test CLAUDE.md itself; the transfer is my analogy, disclosed in-prose as "not specific to CLAUDE.md."
- **The "quarterly re-prune ritual" the flowchart retires** — my characterization of the periodic-review habit; Anthropic recommends a three-to-six-month configuration review but does not frame it as a symptom of wrong routing.

---
title: "CLAUDE.md Instruction Ceiling: Maintained Config, Not a README"
date: 2026-05-18
draft: false
pillar: context-engineering
author: "John Young"
description: "Your CLAUDE.md doesn't have a length problem, it has a discipline problem. Budget it against a hard instruction ceiling and maintain it like config, not a README."
keywords: ["CLAUDE.md instruction ceiling", "CLAUDE.md best practices", "context engineering", "Claude Code", "AI coding agents"]
---

Your CLAUDE.md doesn't have a length problem, it has a discipline problem: every line past the agent's instruction ceiling doesn't sit there harmlessly ignored — it shoves a rule that mattered over the edge, and the agent drops it without telling you. The fix isn't "make it shorter." It's to stop treating the file as documentation you accumulate and start treating it as config you maintain, with a fixed budget and a per-line admission gate.

Practitioners can't even agree on how long the file should be. One reports "My AGENTS.md is 845 lines and it only started getting good once it got that long"; another counters that "the sweet spot is between 60 and 120 lines" ([Hacker News: How big is your claude.md file?](https://news.ycombinator.com/item?id=45688243)). Both can be right, because length was never the variable that mattered — what's on the lines is.

---

## There's a Hard Ceiling on How Many Instructions the Agent Will Follow, and Past It, It Drops Them Silently

Budget your CLAUDE.md against a hard ceiling before you write a single line, because the ceiling is real and it's measured. Frontier models don't follow an unbounded list of rules — HumanLayer, summarizing the instruction-density research, puts the working limit plainly:

> Frontier thinking LLMs can follow ~ 150-200 instructions with reasonable consistency.

— [HumanLayer: Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)

That number is not the whole budget you get — it's the whole budget minus what's already spent. Claude Code's own system prompt contains ~50 individual instructions before your file loads ([HumanLayer: Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)). So every line you add is drawn from a nearly-full account, and the account doesn't bounce a check — it silently skips one.

The underlying study measured this directly. Across the IFScale benchmark, even the best frontier models only achieve 68% accuracy at the max density of 500 instructions ([Distyl AI: How Many Instructions Can LLMs Follow at Once?](https://arxiv.org/html/2507.11538v1)). The failure mode is not that the agent argues with a rule or does the opposite — it omits it. At 500 instructions, llama-4-scout exhibits an extreme O:M ratio of 34.88, indicating omission errors are over 30 times more frequent than modification errors ([Distyl AI: How Many Instructions Can LLMs Follow at Once?](https://arxiv.org/html/2507.11538v1)). That is the mechanism behind "it dropped them silently" — past the ceiling, rules don't get broken, they get forgotten, and nothing in the output tells you which one.

This is the same budget the [anatomy of a well-scoped task](/blog/anatomy-of-a-perfect-ai-agent-task/) is drawn against — the persistent config and the per-task spec spend from one instruction account, not two. A CLAUDE.md that eats 120 instructions leaves less room for the task in front of the agent right now.

There's a widely-repeated Hacker News anecdote that turns this into a live detector: drop a single throwaway line telling the agent to always address you as "Mr Tinkleberry," then watch. When the agent stops using the name, it has stopped reading the bottom of your file — the low-priority probe is exactly the instruction that falls off the cliff first. That canary line is the cheapest instrument you have for knowing when you've breached the ceiling, and it costs one line to install.

---

## Stop Treating CLAUDE.md Like a README — It's Advisory Context Delivered as a User Message, Not Enforced Config

Reclassify the file in your head: it is not documentation the agent must obey and not a compiler directive — it is advisory context the agent *might* follow. Anthropic's own docs are explicit about the delivery mechanism and what it implies:

> CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions.

— [Anthropic (Claude Code Docs): How Claude remembers your project](https://code.claude.com/docs/en/memory)

Write for that reader. A rule phrased as a wish ("be careful with migrations") is advice an advisory reader can ignore without noticing; a rule phrased as a check ("run `npm test` before committing") is something the same reader can execute or fail visibly. The delivery channel doesn't change, so the phrasing has to carry the weight.

The largest empirical read of these files says teams are already treating them like config even when they don't say so. In a study of 2,303 agent context files across 1,925 repositories, the authors describe them as "not static documentation but complex, difficult-to-read artifacts that evolve like configuration code" ([Chatlatanagulchai et al.: Agent READMEs](https://arxiv.org/abs/2511.12884)). A README you write once and forget. Config you version, prune, and test — which is exactly the discipline the rest of this post is about.

---

## Audit What You Already Wrote Before You Add a Line

Before you add anything, sort what's already in the file into two buckets — functional context versus enforced constraints — because you almost certainly over-invested in the first. Run this pass:

1. Grep the file for build commands, architecture notes, file-layout descriptions, and tech-stack facts. That's your **functional context** bucket.
2. Grep for the actual rules — "always X," "never Y," "run Z before W." That's your **constraint** bucket.
3. Compare the two piles. If the constraint pile is a third the size of the functional pile, you have the same imbalance the research found at scale.
4. Drop the "Mr Tinkleberry" canary line at the very bottom and run one real session. If the agent stops using the name, every genuine rule sitting below the fold is being dropped with it.

The imbalance is measurable. In the 2,303-file study, functional content dominates — build and run commands appear in 62.3% of files, implementation details in 69.9%, architecture in 67.7% — while the guardrails are the missing piece, with security at 14.5% and performance at 14.5% ([Chatlatanagulchai et al.: Agent READMEs](https://arxiv.org/abs/2511.12884)). The authors' one-line summary is the finding worth internalizing: "While developers use context files to make agents functional, they provide few guardrails to ensure that agent-written code is secure or performant" ([Chatlatanagulchai et al.: Agent READMEs](https://arxiv.org/abs/2511.12884)).

| Bucket | What it is | Share of files |
| --- | --- | --- |
| Functional context | Implementation details | 69.9% |
| Functional context | Architecture notes | 67.7% |
| Functional context | Build and run commands | 62.3% |
| Guardrail | Security constraints | 14.5% |
| Guardrail | Performance constraints | 14.5% |

The canary probe checks the second half of the problem — not whether you *wrote* guardrails, but whether the agent still *reaches* them. A file heavy on functional context pushes your real rules toward the bottom, past the point where adherence decays. A probe at the very end tells you whether the constraints you did write are being read at all.

---

## Make a Rule Earn Its Line: Add It Only When a Real Failure Demanded It, and Phrase It as a Runnable Check

Never add a rule speculatively — add it only after the agent has actually failed, and even then, phrase it so the agent can run it rather than interpret it. Anthropic's own admission gate names the triggering events: add to CLAUDE.md when "Claude makes the same mistake a second time," when "a code review catches something Claude should have known about this codebase," or when "you type the same correction or clarification into chat that you typed last session" ([Anthropic (Claude Code Docs): How Claude remembers your project](https://code.claude.com/docs/en/memory)). No failure, no line.

Then phrase what earned admission as a check, not a preference:

**Bad:** "Test your changes before committing."
**Good:** "Run `npm test` before committing."

**Bad:** "Format code properly."
**Good:** "Use 2-space indentation."

The difference is verifiability. Anthropic's guidance is to "write instructions that are concrete enough to verify," and their examples are exactly these pairs — "'Run `npm test` before committing' instead of 'Test your changes'" ([Anthropic (Claude Code Docs): How Claude remembers your project](https://code.claude.com/docs/en/memory)). A vague rule and a runnable rule cost the same one line against your ceiling, but only one of them produces a pass/fail the agent can act on. Since every line is drawn from the same nearly-full account, spend it on the check.

---

## Kill the Three Rule Classes That Decay: Anticipatory, Negative-Framed, and Self-Evident

Some lines don't just fail to help — they actively spend budget while doing nothing, and three classes are the usual culprits. When you see one, apply the fix:

- **When you see a self-evident rule** ("write clean code," "use good variable names") — cut it. The agent already does this without the line. Anthropic's exclude list names exactly these: "self-evident practices like 'write clean code'" and "standard language conventions Claude already knows" ([Anthropic (Claude Code Docs): Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)).
- **When you see an anticipatory rule** — a "just in case" line no failure ever earned — cut it. It fails the admission gate from the previous section by definition: no mistake triggered it, so it's pure speculation occupying a slot.
- **When you see a negative "DO NOT" rule** — rephrase it as a positive runnable check, and reserve raw "DO NOT" only for hard safety boundaries.

That last class is the subtle one.

### Rephrase Negative-Framed Rules as Positive Checks

When you see "don't create duplicate files," rewrite it as "check for an existing file before creating one." The reason is mechanical, not stylistic: because CLAUDE.md arrives as a user message, suppression instructions land in the weakest possible position. As the analysis puts it, "negative instructions can be unreliable as user prompts" ([Zhu Liang: The Pink Elephant Problem](https://eval.16x.engineer/blog/the-pink-elephant-negative-instructions-llms-effectiveness-analysis)). The failure is not hypothetical — the same piece documents a case where Claude Code created duplicate files despite an explicit "NEVER create duplicate files" rule.

Carry the caveat, though, because "never use negative rules" would be wrong. Negative instructions "are effective at preventing unethical or harmful behavior, especially when used in system prompts" ([Zhu Liang: The Pink Elephant Problem](https://eval.16x.engineer/blog/the-pink-elephant-negative-instructions-llms-effectiveness-analysis)). So the rule is not *no* prohibitions — it's: rephrase preferences as positive checks, and reserve "DO NOT" for the handful of hard safety lines where the prohibition itself is the point.

---

## Bloat Isn't Free: A Long File Buries the Rules That Matter

Stop thinking of an extra line as harmless, because it isn't neutral — it measurably lowers the odds that the agent retrieves the good rule three lines down. Models don't read context evenly. Chroma's study across 18 LLMs found that "models do not use their context uniformly; instead, their performance grows increasingly unreliable as input length grows" ([Chroma: Context Rot](https://www.trychroma.com/research/context-rot)).

The cost of a single junk line is sharper than "the file is longer now." In the same research, "even a single distractor reduces performance relative to the baseline" ([Chroma: Context Rot](https://www.trychroma.com/research/context-rot)). One low-value line is a distractor competing with your real rules for the model's attention. Anthropic's docs land the practical consequence in one sentence: "Bloated CLAUDE.md files cause Claude to ignore your actual instructions!" ([Anthropic (Claude Code Docs): Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)).

This is why Anthropic sets a concrete size target — "target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence" ([Anthropic (Claude Code Docs): How Claude remembers your project](https://code.claude.com/docs/en/memory)). The number isn't a style rule; it's the same instruction-ceiling budget expressed in lines. Every low-value line you keep is a small tax on the retrieval odds of every rule that actually matters — the tax on boring but necessary pruning you didn't do.

---

## Run the Prune-Test-Audit Cadence: Treat CLAUDE.md Like Code

Put the file on a maintenance loop and run it like a script, not a document you occasionally reread. Anthropic states the discipline directly:

> Treat CLAUDE.md like code: review it when things go wrong, prune it regularly, and test changes by observing whether Claude's behavior actually shifts.

— [Anthropic (Claude Code Docs): Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)

Broken into a runnable cadence:

1. **Prune, per line.** For each line ask: "Would removing this cause Claude to make mistakes? If not, cut it" ([Anthropic (Claude Code Docs): Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)). This is the same admission gate run in reverse — a line that can't answer "yes" never earned its slot.
2. **Test by behavior, not by re-reading.** "Test changes by observing whether Claude's behavior actually shifts" ([Anthropic (Claude Code Docs): Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)). The "Mr Tinkleberry" canary *is* this step made concrete: you don't confirm a prune worked by re-reading the file, you confirm it by watching whether the probe line still fires in a live session.
3. **Audit periodically for conflicts.** "Review your CLAUDE.md files... periodically to remove outdated or conflicting instructions" ([Anthropic (Claude Code Docs): How Claude remembers your project](https://code.claude.com/docs/en/memory)) — because "if two rules contradict each other, Claude may pick one arbitrarily."

The cadence matters more than usual because the file also decays mid-session. As one practitioner documents, "when the context window fills up and gets compacted, your CLAUDE.md values get summarized away with everything else" ([Albert Nahas: Your CLAUDE.md Instructions Are Being Ignored](https://dev.to/albert_nahas_cdc8469a6ae8/your-claudemd-instructions-are-being-ignored-heres-why-and-how-to-fix-it-23p6)). The file you tested at session start isn't the file live 40 turns later — one more reason the test watches behavior, not the file on disk.

---

## Escalate to a Hook When a Rule Must Hold Every Time

When a rule is genuinely non-negotiable, stop trying to make advisory config enforce it. If the answer to "can this be dropped silently even once?" is no, it doesn't belong on the probeable-adherence layer at all — it belongs in a hook.

```json
// .claude/settings.json — a rule that must hold every time
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          { "type": "command", "command": "block-if-path migrations/" }
        ]
      }
    ],
    "Stop": [
      { "hooks": [ { "type": "command", "command": "npm run lint" } ] }
    ]
  }
}
```

The distinction is enforcement, not phrasing. Anthropic draws the line explicitly: "Unlike CLAUDE.md instructions which are advisory, hooks are deterministic and guarantee the action happens" ([Anthropic (Claude Code Docs): Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)). And the docs give the exact test for when to escalate: "if the instruction is something that must run at a specific point, such as before every commit or after each file edit, write it as a hook instead" ([Anthropic (Claude Code Docs): How Claude remembers your project](https://code.claude.com/docs/en/memory)).

There's a second reason to move must-hold rules out. A hook doesn't arrive wrapped in advisory framing — its "output arrives as clean system-reminder messages — no disclaimer, no 'may or may not be relevant' framing" ([Albert Nahas: Your CLAUDE.md Instructions Are Being Ignored](https://dev.to/albert_nahas_cdc8469a6ae8/your-claudemd-instructions-are-being-ignored-heres-why-and-how-to-fix-it-23p6)). The CLAUDE.md line "never touch the migrations folder" is a wish the agent might honor; the PreToolUse hook above is a wall it cannot cross. Lint-before-commit, never-touch-migrations, always-run-the-test-gate — these are hook rules, not file rules.

---

## The Per-Line Decision Table: Does This Line Earn Its Place?

Before any line goes in — or stays in — run it through one table. Each row is a section of this post; a line that survives every row belongs in CLAUDE.md, and a line that fails one belongs in a hook or the trash.

| Gate | Ask | If it fails |
| --- | --- | --- |
| **Ceiling** | Is the file already near ~150–200 lines of real instruction? | You're out of budget — cut before you add ([HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md)). |
| **Maintained-config** | Is this written for an advisory reader that *might* comply? | Rewrite the wish as a runnable check ([Anthropic: memory](https://code.claude.com/docs/en/memory)). |
| **Audit** | Is this functional context, or an actual constraint? | You have plenty of the first — make sure the balance isn't 62% vs 14.5% ([Agent READMEs](https://arxiv.org/abs/2511.12884)). |
| **Earns-its-line** | Did a real failure earn this, and is it phrased as a check? | No failure, no line ([Anthropic: memory](https://code.claude.com/docs/en/memory)). |
| **Decaying classes** | Is it anticipatory, self-evident, or a "DO NOT"? | Cut the first two; rephrase the third as a positive check ([Pink Elephant](https://eval.16x.engineer/blog/the-pink-elephant-negative-instructions-llms-effectiveness-analysis)). |
| **Bloat cost** | Does keeping this lower the retrieval odds of a better rule? | It's a distractor — one line reduces performance ([Chroma](https://www.trychroma.com/research/context-rot)). |
| **Cadence** | Would removing it cause a mistake? | If not, prune it ([Anthropic: best-practices](https://code.claude.com/docs/en/best-practices)). |
| **Hook escalation** | Must it hold every single time, no exceptions? | Move it to a PreToolUse or Stop hook ([Anthropic: best-practices](https://code.claude.com/docs/en/best-practices)). |

The whole table reduces to one bet. A CLAUDE.md line is not documentation and not enforcement — it's a wager that one advisory instruction, drawn from a nearly-full account, will still be read and still be followed when it matters. The instruction ceiling is what makes CLAUDE.md maintenance a real discipline rather than a formatting exercise, and it's the same finite-resource argument that governs how you [size a single task for the agent](/blog/how-to-size-tasks-for-ai-coding-agents/). Budget accordingly.

---

## References

### Research and Data

1. [Distyl AI: How Many Instructions Can LLMs Follow at Once?](https://arxiv.org/html/2507.11538v1) — The IFScale benchmark: best frontier models hit only 68% accuracy at 500 instructions, and omission errors dominate at high density (llama-4-scout's 34.88 O:M ratio) — the "drops rules silently" mechanism.
2. [Chatlatanagulchai et al.: Agent READMEs — An Empirical Study of Context Files for Agentic Coding](https://arxiv.org/abs/2511.12884) — 2,303 context files across 1,925 repos: functional content dominates (build/run 62.3%, implementation 69.9%, architecture 67.7%) while guardrails are missing (security and performance 14.5% each); files "evolve like configuration code."
3. [Chroma: Context Rot — How Increasing Input Tokens Impacts LLM Performance](https://www.trychroma.com/research/context-rot) — Across 18 LLMs, models don't use context uniformly; even a single distractor line reduces performance. Backs "bloat buries the rules that matter."

### Practitioner Guidance

4. [HumanLayer: Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) — The ~150–200 instruction ceiling for frontier models, and the ~50 instructions Claude Code's system prompt already spends before your file loads.
5. [Anthropic (Claude Code Docs): How Claude remembers your project](https://code.claude.com/docs/en/memory) — CLAUDE.md is advisory context delivered as a user message; the when-to-add-a-rule signals; the runnable-check phrasing; the under-200-lines target; the periodic conflict audit; and the "write it as a hook instead" escalation.
6. [Anthropic (Claude Code Docs): Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) — Treat CLAUDE.md like code (prune, test by behavior); the per-line "would removing this cause mistakes" test; bloat causes ignored instructions; hooks are deterministic where CLAUDE.md is advisory.
7. [Zhu Liang: The Pink Elephant Problem — Why 'Don't Do That' Fails with LLMs](https://eval.16x.engineer/blog/the-pink-elephant-negative-instructions-llms-effectiveness-analysis) — Negative instructions are unreliable as user prompts (which is what CLAUDE.md is), with the caveat that they work for hard safety boundaries in system prompts.
8. [Albert Nahas: Your CLAUDE.md Instructions Are Being Ignored — Here's Why (and How to Fix It)](https://dev.to/albert_nahas_cdc8469a6ae8/your-claudemd-instructions-are-being-ignored-heres-why-and-how-to-fix-it-23p6) — CLAUDE.md values get summarized away at compaction; hook output arrives without the "may or may not be relevant" advisory framing.
9. [Hacker News: How big is your claude.md file?](https://news.ycombinator.com/item?id=45688243) — Practitioner size contest (845 lines vs. a 60–120-line sweet spot) showing length alone doesn't predict adherence.

---
title: "AGENTS.md vs CLAUDE.md: Swap the Agent, Keep the Harness"
date: 2026-09-07
draft: false
pillar: context-engineering
author: "John Young"
description: "Claude Code reads CLAUDE.md, not AGENTS.md. Sort your harness into what ports across vendors and what does not, so switching coding agents is a config flip."
keywords: ["AGENTS.md vs CLAUDE.md", "AI coding agents", "harness engineering", "agent portability", "context engineering"]
tldr:
  - "When your AI coding agent has a red-status day, or worse, a quiet week where it keeps answering but the answers get worse and nobody declares anything, the fix isn't a second subscription: it's a repo where swapping the agent underneath is a config flip, not a migration."
  - "Sort your harness into two piles: the instruction file (one AGENTS.md at the root, with a CLAUDE.md that just imports it) ports across vendors almost for free, though the evidence it improves task success is thin, while hooks, permissions, subagents, and MCP client config don't share a schema and have to be rebuilt per vendor."
  - "Put the guarantees that actually must hold, pre-commit checks, GitHub rulesets with the admin bypass closed, plain git worktrees, outside any agent's config entirely, since no vendor's schema can reach them and a sandbox that silently degrades to unsandboxed is a convention, not a boundary."
  - "Vendor outages cluster within a provider but not across providers, so keeping a second vendor warm buys an uncorrelated failure schedule rather than guaranteed uptime, and because the same model scores differently depending on which harness runs it, the only way to know a swap will work is testing it on your own tasks before the incident, not during it."
---
{{< eli5 hint="no background needed · 10 min" audience="for readers outside AI engineering" >}}
This is about the AI tools that write code alongside programmers, and how to set one up so that if the company behind it has a bad day, you can switch to a different company's version in minutes instead of losing a week to rebuilding everything.

## The big idea

Think of an AI coding tool as a temp worker supplied by a staffing agency. You keep a written procedures binder at your desk that any competent temp could pick up and follow. But you also have things that only work because of who is currently on shift: a badge that opens certain doors, a hookup to your internal phone system, a specific way you've trained this one worker to flag something risky. If the agency's phones go down, or worse, if the worker they send starts doing sloppier work without anyone officially saying so, you want to call a different agency and have the new temp be productive fast. That only works if you already know which parts of your setup are in the shared binder and which parts live in that one worker's badge and training. The post's argument is that most people never sort this out, so a switch turns into a slow rebuild instead of a quick handoff. Some parts genuinely do carry over. Most don't, and pretending otherwise is what costs you the sprint.

## Plan for two kinds of bad day, not one

The obvious bad day is when the company's systems are visibly down, the equivalent of the agency's phone lines going dead. Everyone notices, and the company itself usually posts about it.

The costlier bad day is quieter: the worker is still showing up and answering, but the answers have gotten worse, and nobody has officially declared anything wrong. In one real case, a routing bug misdirected messages for about a month before the company even opened a public report about it, and its own internal checks missed the problem because, as the company put it, the AI often recovers well from isolated mistakes, which hid the pattern.

A cheaper first move than switching companies entirely is switching how you reach the same company, the way you might call a different branch office instead of a different agency. On the worst hour of one real incident, the company's own numbers showed that requests routed through a backup path failed far less often than requests going through the main path, sometimes by a thousand times less. That fix is nearly free, but it only helps with plumbing problems. It does nothing if the worker itself has quietly gotten worse.

A caveat worth keeping: a backup company is not a clean safety net either. Two different companies can share the same underlying road or landlord, meaning both can go down together even though they are technically separate businesses. One real day in late 2025 saw one AI company's site go down and, separately, a major infrastructure provider have its own outage in the same window, though neither one's report named the other as the cause. That connection is the author's own reasoning from two side-by-side incidents, not something either company confirmed. Research on outage data also found that two services from the same company fail together on the same day more than 80% of the time in one dataset, while services from different companies showed no such pattern there, but that same research warns this is one dataset, not a universal law, since a different company's own app and its programming interface correlated much more than that elsewhere.

## Sort your setup into what transfers and what doesn't

Once you accept you might need to hand the work to a different company's worker, the next step is figuring out which pieces of your setup are in the shared procedures binder and which pieces are wired to one specific worker.

Interestingly, one of the AI companies has already published its own version of this sorting exercise as part of a tool that imports another company's setup. It maps six kinds of things, instruction files, settings, automated guardrails, shortcut commands, sub-workers, and outside-tool connections, onto its own format, and then hands you a checklist of things to double-check afterward because the mapping isn't perfect. Research across thousands of real project setups backs the same split: most projects use only one company's tool, a smaller share run two, and a notable share keep their instructions in the shared, cross-company format specifically so they aren't locked in.

## The shared instructions file is the one thing that really does transfer, but it's not where the value is

Most of these AI coding tools can read the exact same plain-text instructions file, typically named AGENTS.md, sitting at the top of your project. The one holdout is Claude Code, which by default only reads a file named CLAUDE.md. The fix is simple: make that file one line long, pointing at the shared AGENTS.md file, so Claude Code effectively reads the same handbook as everyone else. One real-world proof of this working: when a company retired one of its own AI tools and moved everyone to a replacement, it explicitly said both tools used identical instruction-file rules and nobody had to change anything. That's the rare case of a vendor swap actually holding up.

Here's the caveat that has to survive: making the instructions file portable doesn't mean the instructions file is doing much work. Research found that having one of these instruction files does not generally improve how often the AI succeeds at a task, and it makes each request more expensive to run. A carefully written file did slightly better than an AI-generated one, but the improvement was small enough that researchers couldn't call it a real, reliable effect. So carry this file across companies because it's nearly free to do, not because it's the thing standing between you and a bad outcome.

## The guardrails, permissions, and connections don't transfer, and rebuilding them is real work

This is the part that actually costs an afternoon. Automated guardrails (rules like "block any attempt to commit a secret password"), permission settings (how much the AI is allowed to do without asking), sub-workers the AI can delegate to, and connections to outside tools are all built differently by each company. The intent behind a guardrail, like "don't let this slip through," is the same everywhere. The file format, the names of the trigger moments, and the way you say "stop, that's not allowed" are all different per company, with only one small convention (a specific error code meaning "blocked") surviving the trip in most cases.

There's a partial exception worth keeping honest: the reusable "skill" files some of these tools use have a small shared core of fields that do work across companies. If you stick to only that shared core, the same skill file can work in several tools. Add extra fields specific to one company, though, and at least one tool will flatly refuse to load the file rather than just ignoring the extra part. Outside-tool connections work similarly: the actual outside service you're connecting to carries over fine, but the file that tells each AI tool how to reach it has to be rewritten per company.

## Put the rules that must always hold outside any AI tool's reach

The most reliable fix for all of this is to move anything that absolutely must hold true out of the AI tool entirely, into places no AI company controls: a separate folder (a "worktree") per task so a half-finished session from one tool doesn't collide with another, and rules enforced by your code-hosting platform itself, like blocking anyone from skipping required checks before merging code. Even the AI company that sells the shared instructions file agrees you should pair it with outside enforcement, like automated tests and code checks that catch problems no matter which AI wrote the code.

One more honest caveat: putting your AI inside a sandboxed container is sometimes treated as a hard safety boundary, but one company says plainly that it isn't one by default, it's a convention, and processes running alongside the AI can still act unconstrained on the underlying machine. If the sandbox can't start for some reason, at least one tool will quietly fall back to running unsandboxed rather than stopping and warning you loudly, unless you specifically configure it not to. A fence that quietly opens itself when it can't lock isn't really a fence, so real enforcement belongs in the places outside the AI tool, not inside a permission setting.

## Test the substitute worker on your own tasks before you need them

The same underlying AI model can perform very differently depending on which company's tool is wrapping it, the same way the same recipe can come out differently depending on which kitchen and equipment it's cooked in. Published comparison scores back this up: identical AI models scored quite differently on the same benchmark depending on which tool ran them, and this wasn't always in favor of the model's home company's own tool. In one of three cases measured, a rival tool actually beat the model's own company's version.

The author is upfront that pinning this difference specifically to "the tool matters, not just the model" is his own reasoning from the data, not a claim the benchmark's publishers made themselves; they just published the numbers without arguing about the cause. Either way, the practical point holds: a published leaderboard gap doesn't tell you which company's assistant will actually do your specific job well. You have to run your own tasks through the candidate before an emergency forces the decision.

## What this means for you

If you rely on an AI coding assistant, don't wait for an outage to discover which parts of your setup are locked to one company. Put your instructions in the shared, plain-text format everyone can read, since it costs almost nothing to keep portable, even though it isn't the thing doing the heavy lifting. Expect to spend real setup time translating your guardrails and permission rules for each company you might switch to, ahead of time, not during the emergency. And put anything that truly must hold, like "never let this get merged without tests passing," into places no AI vendor controls at all. Then actually test the backup assistant on your own work before you need it, because a leaderboard number won't tell you how it performs on your project.

---

**The technical terms, in plain words**
- AGENTS.md = the shared, plain-text instructions file most AI coding tools can read, no matter which company made the tool.
- CLAUDE.md = the instructions file name one specific tool, Claude Code, looks for by default; you can make it just point at AGENTS.md instead of duplicating it.
- Coding agent / AI coding assistant = an AI tool that writes and edits code for you, following instructions and asking permission for certain actions.
- Harness = the overall setup around the AI: its instructions, guardrails, permissions, and connections, as opposed to the underlying AI model itself.
- Hooks = automated guardrail rules that fire at specific moments, like "before this file gets saved, check it for passwords."
- MCP / MCP server = a connection that lets the AI reach an outside tool or service, like a database or a search tool.
- Permissions / permission modes = settings controlling how much the AI is allowed to do on its own before it has to ask you first.
- Subagent = a smaller helper AI the main assistant can delegate part of a task to.
- Worktree = a separate folder for one task, so different work-in-progress doesn't get tangled together.
- Ruleset / branch protection = rules set at the code-hosting platform level (not inside the AI tool) that block certain changes unless conditions like passing tests are met.
- Sandbox / container = an isolated environment meant to contain what the AI can affect, though the post notes it's often a convention rather than a guaranteed boundary.
- Serving path = which server route your request to the AI travels through; switching this is cheaper than switching companies entirely.
- Status page / incident = the company's own public log of when its service was degraded or down.
- Model regression = the AI quietly getting worse at its job without an outage being declared.
- Skill / SKILL.md = a reusable, packaged set of instructions the AI can use for a specific kind of task.
- Benchmark / leaderboard = a published test comparing how different AI setups score on the same tasks.

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}

Roughly 30% of Claude Code users who made requests during Anthropic's August 2025 routing bug had at least one message routed to the wrong server type. The company's own evals never caught it ([Anthropic: A Postmortem of Three Recent Issues](https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues)). If your team's workflow only runs on one vendor's agent, every incident like that is your outage. The fix is not a second subscription: it is a repo where the agent underneath is a config flip rather than a migration.

---

## Treat the Vendor as Your Failure Domain

Plan the swap for two triggers, not one. The obvious trigger is the red status day. The one that actually costs you a sprint is the quiet week when the model is still answering, the answers are worse, and nobody has declared anything.

The red status day is easy to name because the vendor names it for you. On 2026-09-03 Anthropic logged "Elevated errors for multiple models" at impact major, 13:26 to 16:23 UTC, listing claude.ai, the Claude API, Claude Code and Claude Cowork as affected together ([Anthropic Status: Elevated Errors for Multiple Models](https://status.claude.com/incidents/461yvfrzpwtt)). That pattern repeats. A single model incident on 2026-07-17 took the same four surfaces down for five and a half hours ([Anthropic Status: Elevated Errors on Sonnet 5 and Haiku 4.5](https://status.claude.com/incidents/7gpjd8n56rlq)). On 2026-08-28 the cause was not the model at all: "an issue with an upstream cloud provider affecting Claude Cowork and Claude Code on the web" ([Anthropic Status: Elevated Errors on Claude Code and Claude Cowork](https://status.claude.com/incidents/vr9tpk8w7zr8)).

**The blast radius of a vendor incident is the vendor, not the model.** Chu et al. measured this across public status-page data through 2024-08-31 and found that for Anthropic's services, the likelihood of any two services experiencing outages on the same day is over 80%. Their cross-provider finding is the useful half:

> *"There is no correlation observed between services from different providers."*
> — [Chu et al.: An Empirical Characterization of Outages and Incidents in Public Services for LLMs](https://arxiv.org/abs/2501.12469)

Carry the qualifiers, because they are load-bearing. The intra-vendor correlation is Anthropic-specific in that dataset: OpenAI's API-to-ChatGPT same-day co-occurrence is 49.21%. The paper hedges the mechanism to different cloud infrastructures, and says the lack of correlation *suggests* using one service as the other's backup rather than proving it ([Chu et al.](https://arxiv.org/abs/2501.12469)).

The second vendor is no fixed point either. OpenAI's own write-up of a June 2025 incident reports ChatGPT error rates peaking near 35% and API error rates near 25%, with recovery slowed by "The absence of break-glass tooling to rapidly restore network connectivity on affected nodes" ([OpenAI Status: Elevated Error Rates](https://status.openai.com/incidents/01JXCAW3K3JAE0EP56AEZ7CBG3/write-up)). You are not buying reliability by keeping a second agent warm. You are buying an uncorrelated failure schedule.

The second trigger leaves no incident to point at. Anthropic's routing bug started on August 5, 2025 and the public status entry did not open until September 9, crediting community reports for isolating it ([Anthropic Status: Model Output Quality](https://status.claude.com/incidents/72f99lh1cj2c)). The postmortem is blunt about why internal monitoring missed it:

> *"The evaluations we ran simply didn't capture the degradation users were reporting, in part because Claude often recovers well from isolated mistakes."*
> — [Anthropic: A Postmortem of Three Recent Issues](https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues)

Date-stamp any incident count you quote, because the status feed is [a rolling window that ages entries out](/blog/agent-observability-trace-schema/). As of 2026-09-07 the page shows 99.44% 90-day uptime for Claude Code and 99.5% for the Claude API ([Anthropic: Claude Status](https://status.claude.com/)).

> **Author's judgment.** The shared edge is also a failure domain, which limits how much a second vendor buys you. This follows from two sourced premises and is stated by neither: OpenAI attributed its 2025-11-18 outage to "an issue with one of our third-party service providers" without naming one ([OpenAI Status: Access Issues Affecting OpenAI Websites](https://status.openai.com/incidents/01KABE2437NJYKBFHT22SD3H92)), and Cloudflare's postmortem for the same day traces its own core-traffic failure, 11:20 to 17:06 UTC, to a database permissions change that doubled a Bot Management feature file ([Cloudflare: Cloudflare Outage on November 18, 2025](https://blog.cloudflare.com/18-november-2025-outage/)). The windows overlap. Neither names the other.

Everything below traces one worked example, the September 3 drill: a team mid-task on a `feature-shipping-rates` branch under Claude Code when incident `461yvfrzpwtt` opened, who moved to Codex CLI for the afternoon and came back the next morning. The trigger is real and has a permalink; the team is invented. Each section asks what the drill hit in that layer.

### Run a Second Serving Path Before a Second Vendor

If the trigger you fear is an API incident rather than a model regression, the cheapest hedge is the same agent pointed somewhere else. Anthropic's own numbers make the case. At the worst impacted hour on August 31, 16% of Sonnet 4 requests were affected on first-party infrastructure, while misrouted traffic peaked at 0.18% on Bedrock and stayed under 0.0004% on Vertex AI ([Anthropic: A Postmortem of Three Recent Issues](https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues)). Same model, same bug, three orders of magnitude of difference by serving path.

```bash {title="The cheaper hedge: same agent, different serving path"}
# Route Claude Code through Amazon Bedrock
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1

# Or through a gateway your organization already runs
export ANTHROPIC_BASE_URL=https://llm-gateway.internal
```

Both flips cost you something, so price them before the drill day. On Bedrock the `/logout` command is unavailable because authentication runs through AWS credentials, and the WebSearch tool is not available at all. Unpinned aliases such as `sonnet` and `opus` resolve to a built-in default that can lag the newest release, and Claude Code falls back to an earlier or lower-tier model at startup when that default is unavailable ([Claude Code Docs: Claude Code on Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock)). A gateway moves the maintenance burden onto you: "Claude Code adds capabilities with each release, and a gateway that doesn't forward them breaks the corresponding features, so the gateway product needs to be kept updated as Claude Code evolves" ([Claude Code Docs: Other LLM Gateways](https://code.claude.com/docs/en/llm-gateway)). Neither flip hedges a model regression or a capability gap, which is why the rest of this post exists.

---

## Sort the Harness Into Two Piles

Inventory first, then sort. If you have not enumerated what is actually in your harness, start with the [harness audit](/blog/agent-harness-audit/); this post sorts that inventory rather than re-deriving it. The sort runs on one test: is this artifact read by name and format across vendors, or is it read by one vendor's schema?

The useful surprise is that a vendor already published its own version of this sort. Codex's import page maps six categories of another agent's setup onto its own constructs, and then lists what to re-check afterward.

| Imported item | Destination |
| --- | --- |
| Instruction files | `AGENTS.md` |
| `settings.json` | `config.toml` |
| Hooks | Codex hooks |
| Slash commands | Skills |
| Subagents | Codex subagents |
| MCP server configuration | Codex MCP configuration |

The review list underneath is the sort's answer key: permissions in imported skills and agents, MCP settings that use custom authentication, headers, environment variables or transports, hooks whose behavior may differ after import, plugins needing manual follow-up, and prompt templates that depend on arguments or file-path placeholders ([Codex Docs: Import From Another Agent](https://learn.chatgpt.com/docs/import)). Read that as a map of the vendor-bound pile, written by a vendor with every incentive to make the move look painless.

The research points the same direction. Galster et al., across 2,853 repositories, recommend that "developers who rely on multiple tools should maintain an AGENTS.md file as the shared core configuration, given its cross-tool support and the reference patterns we observed," with tool-specific files as adapters that reference that shared core ([Galster et al.: Harness Engineering for Agentic AI Coding Tools](https://arxiv.org/abs/2602.14690)). The same study found 2,015 repos (70.6%) on a single tool, 295 (10.3%) configured for two, and 493 (17.3%) running AGENTS.md alone with no tool-specific artifact. A source-code study of eleven agent runtimes found skills leading MCP in adoption at 9 of 11 against 8 of 11, and ACP hosting rival harnesses "with OpenHands running Claude Code, Codex, or Gemini CLI as interchangeable backends" ([Barbaste et al.: Harness Engineering](https://arxiv.org/abs/2609.00006)). Its reading of the first half of 2026 states the whole problem as a trend line: "behavioral policy migrates from prompt prose to configuration." The layer that carries your rules is the layer that keeps moving into vendor schemas.

The instruction file is also the weakest layer in enforcement terms, which is worth knowing before you [over-invest in it](/blog/claude-md-instruction-ceiling/). Anthropic says so directly: Claude treats memory files "as context, not enforced configuration. To block an action regardless of what Claude decides, use a PreToolUse hook instead" ([Claude Code Docs: How Claude Remembers Your Project](https://code.claude.com/docs/en/memory)).

In the September 3 drill, the first ten minutes were an inventory check, not a migration. `AGENTS.md`, the skills under `.agents/skills/`, and the MCP server processes were read unchanged by the Codex side. Everything under `.claude/` was inert.

---

## Make AGENTS.md the One Instruction File

Keep exactly one `AGENTS.md` at the repo root, with nested files only where a monorepo needs them, and give Claude Code a `CLAUDE.md` whose first line is an import. Claude Code is the one holdout of the four, and it tells you the workaround itself:

> *"Claude Code reads `CLAUDE.md`, not `AGENTS.md`. If your repository already uses `AGENTS.md` for other coding agents, create a `CLAUDE.md` that imports it so both tools read the same instructions without duplicating them."*
> — [Claude Code Docs: How Claude Remembers Your Project](https://code.claude.com/docs/en/memory)

```text {title="What the four-vendor repo root actually holds"}
AGENTS.md               # the one instruction file, read natively by 3 of 4
CLAUDE.md               # one line: @AGENTS.md
.codex/config.toml      # only if you need fallback filenames
.gemini/settings.json   # context.fileName: ["AGENTS.md", "CONTEXT.md", "GEMINI.md"]
                        # Cursor needs nothing; it reads AGENTS.md at root
```

Prefer the import over the symlink. A symlink works, but on Windows it requires Administrator privileges or Developer Mode, so the docs point you back at `@AGENTS.md` ([Claude Code Docs: How Claude Remembers Your Project](https://code.claude.com/docs/en/memory)). The year-long feature request asking for native AGENTS.md support was closed by pointing at that same import, and commenters in the thread report a Claude Code update that blocked writes through symlinked files ([GitHub: Feature Request: Support AGENTS.md](https://github.com/anthropics/claude-code/issues/6235)). `/import` and `/init` are also the wrong tool for this: `/import` appends a one-time copy of instruction files rather than a live link ([Claude Code Docs: How Claude Remembers Your Project](https://code.claude.com/docs/en/memory)).

The other three flip with config, not files. Codex builds its instruction chain at startup, checking each directory in the order `AGENTS.override.md`, `AGENTS.md`, `TEAM_GUIDE.md`, `.agents.md`, with other names configurable through `project_doc_fallback_filenames` under a 32 KiB cap ([Codex Docs: Custom Instructions With AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)). Gemini CLI takes a `context.fileName` setting whose documented example is already `["AGENTS.md", "CONTEXT.md", "GEMINI.md"]` ([Gemini CLI Docs: Provide Context With GEMINI.md Files](https://geminicli.com/docs/cli/gemini-md/)). Cursor needs no flip at all: it reads `AGENTS.md` in the project root and subdirectories as "a plain markdown file without metadata or complex configurations," unlike its own `.mdc` project rules ([Cursor Docs: Rules](https://cursor.com/docs/rules)). Precedence is consistent enough to reason about: the closest AGENTS.md to the edited file wins, and explicit chat prompts override everything ([AGENTS.md](https://agents.md/)).

This is the one layer with a real vendor-swap track record. Google retired consumer Gemini CLI access on June 18, 2026 and moved those users to Antigravity CLI ([Google Developers Blog: Transitioning Gemini CLI to Antigravity CLI](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli)). The migration guide's line on context files is the whole argument for this section:

> *"Both CLI platforms utilize identical workspace context rules. No modifications are needed to your existing rule documents"*
> — [Antigravity CLI Docs: Gemini CLI to Antigravity CLI Migration Guide](https://antigravity.google/docs/cli/gcli-migration)

A vendor swapped its own tool out from under a user base and the instruction layer did not move. How to structure and budget what goes inside that file is a different problem, covered in the [CLAUDE.md context hierarchy post](/blog/claude-md-context-hierarchy/); this section is about portability only.

### The Most Portable Layer Is Not the Most Valuable

Port the instruction file because it is free, not because the swap's risk lives there. The evidence that it earns its keep is thin:

> *"Surprisingly, we find that providing context files does not generally improve task success rates, while increasing inference cost by over 20% on average."*
> — [Gloaguen et al.: Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988)

Developer-written files did better than LLM-generated ones, but the gain was 2.4% on average and not statistically significant ([Gloaguen et al.](https://arxiv.org/abs/2602.11988)). Vercel's evals found the adjacent failure on the skills side: "In 56% of eval cases, the skill was never invoked. The agent had access to the documentation but didn't use it," while a compressed 8KB docs index embedded directly in AGENTS.md hit a 100% pass rate against 79% for skills ([Vercel: AGENTS.md Outperforms Skills](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals)). Treat the instruction file as cheap to move and light in effect. The rest of the harness is the opposite on both counts.

---

## Rebuild Hooks and Permissions as Per-Tool Adapters

Never share this pile. Keep one adapter directory per vendor, treat each as generated output from a policy you own, and accept that the schemas do not meet at the field level. A hook that blocks a secret from reaching a commit is the same *intent* in all four tools and four different files in practice.

| Vendor | Hook config | Event vocabulary | Blocking convention |
| --- | --- | --- | --- |
| Claude Code | `.claude/settings.json`, plugin, skill and subagent frontmatter | `PreToolUse`, `PostToolUse`, `InstructionsLoaded`, `WorktreeCreate`, `TeammateIdle` | "Exit 2 means a blocking error." |
| Codex CLI | `.codex/hooks.json` or `.codex/config.toml` | `PreToolUse`, `PermissionRequest`, `SubagentStop`, `Interrupt` | exit code `2` plus the reason on `stderr` |
| Gemini CLI | `settings.json` | `BeforeTool`, `AfterTool`, `BeforeModel`, `BeforeToolSelection`, `PreCompress` (11 events) | per-hook semantics, different per event |
| Cursor | `.cursor/hooks.json` | `beforeShellExecution`, `afterFileEdit`, `preToolUse` (21 events) | exit 2, "This matches Claude Code behavior for compatibility" |

Sources for the table, row by row: [Claude Code Docs: Hooks Reference](https://code.claude.com/docs/en/hooks), [Codex Docs: Hooks Reference](https://learn.chatgpt.com/docs/hooks), [Gemini CLI Docs: Hooks Reference](https://geminicli.com/docs/hooks/reference/), [Cursor Docs: Agent Hooks](https://cursor.com/docs/agent/hooks). Cursor is the only vendor that states the compatibility intent in writing, and even that covers the exit code, not the event names.

Work the adapter as a checklist, once per vendor you intend to keep warm:

- **Re-map the hook events.** Your `PreToolUse` guard becomes a `BeforeTool` rule on Gemini and a `beforeShellExecution` or `preToolUse` entry on Cursor. The exit-2 convention survives the trip; the event name does not.
- **Re-express the permission policy.** Claude Code gives you six named modes (`default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`) plus a classifier, and refuses to honor `auto` or `bypassPermissions` from `.claude/settings.json` at all ([Claude Code Docs: Choose a Permission Mode](https://code.claude.com/docs/en/permission-modes)). Codex crosses `approval_policy = "untrusted"` against `sandbox_mode = "workspace-write"` or `"danger-full-access"` ([Codex Docs: Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced)). Gemini runs a priority-ordered TOML policy engine under a `plan` < `default` < `autoEdit` < `yolo` hierarchy ([Gemini CLI Docs: Policy Engine](https://geminicli.com/docs/reference/policy-engine/)). Cursor takes rule strings like `Shell(rm)` and `Read(.env*)` where "Deny rules take precedence over allow rules" ([Cursor Docs: CLI Permissions](https://cursor.com/docs/cli/reference/permissions)). Which tier a task belongs in is the subject of the [permission tiering post](/blog/agent-permission-tiering/); this section only insists the tiers get re-expressed per tool.
- **Translate the subagent fields, not the directory.** Cursor reads `.claude/agents/` and `.codex/agents/` for compatibility ([Cursor Docs: Subagents](https://cursor.com/docs/agent/subagents)), so the file location is partly interoperable and the schema is not. Claude Code carries `permissionMode`, `hooks`, `mcpServers` and `isolation: worktree` ([Claude Code Docs: Create Custom Subagents](https://code.claude.com/docs/en/sub-agents)), Codex requires TOML files defining `name`, `description`, `developer_instructions` and warns "the format may evolve as authoring and sharing mature" ([Codex Docs: Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents)), Gemini uses markdown with `max_turns` defaulting to 30 and `timeout_mins` to 10 ([Gemini CLI Docs: Subagents](https://geminicli.com/docs/core/subagents/)), and Cursor adds `readonly` and `is_background`.
- **Strip non-spec frontmatter from skills before you move them.** Only six fields (`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`) are in the Agent Skills spec, and `allowed-tools` is flagged experimental with support that "may vary between agent implementations" ([Agent Skills: Specification](https://agentskills.io/specification)). Anthropic's own packaging path hard-fails on extras rather than ignoring them, with the literal error `Unexpected key(s) in SKILL.md frontmatter` ([Claude Code Docs: Extend Claude With Skills](https://code.claude.com/docs/en/skills)). Written to the spec surface, the same `SKILL.md` "works in Claude Code, Cursor (with rules), Gemini CLI, Codex, and any other harness that accepts system-prompt content" ([Addy Osmani: Agent Skills](https://addyosmani.com/blog/agent-skills/)).
- **Re-emit the MCP client file per tool.** The server process and the `mcpServers` shape port; the file does not. Claude Code reads `.mcp.json` and warns that "A JSON entry that has a `url` but no `type` is a configuration error, because Claude Code reads an entry with no `type` as a stdio server" ([Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp)). Codex uses `[mcp_servers.<server-name>]` in `config.toml`, scoped to trusted projects only ([Codex Docs: Model Context Protocol](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)). Gemini keeps `mcpServers` in `settings.json` with a `trust` option that "bypasses all confirmation dialogs" ([Gemini CLI Docs: MCP Servers](https://geminicli.com/docs/tools/mcp-server/)). Cursor wants `.cursor/mcp.json` with `${env:NAME}` interpolation ([Cursor Docs: MCP](https://cursor.com/docs/mcp)).

That is a real afternoon of work, which is exactly why you do it before the incident and not during. The September 3 drill spent most of its rebuild time here: the pre-commit block on `scripts/no-secrets.sh` moved from a `PreToolUse` hook into `.codex/hooks.json`. The team's `acceptEdits` posture became `approval_policy = "on-request"` paired with `sandbox_mode = "workspace-write"` before anyone let Codex run unattended.

---

## Put Enforcement Where No Vendor Can Reach It

Move every rule that must hold out of the agent entirely. If a guarantee lives in a hook config, it is only as portable as that vendor's schema, and it is off the moment someone runs a different tool. The vendor that sells you the instruction file agrees: "Pair `AGENTS.md` with infrastructure that enforces those rules: pre-commit hooks, linters, and type checkers catch issues before you see them" ([Codex Docs: Customization](https://learn.chatgpt.com/docs/customization/overview)).

Three layers sit outside every vendor's reach, and all three are boring on purpose.

```bash {title="The layer no agent config can turn off"}
# 1. A plain worktree per task. Gemini's own docs give this as the
#    manual equivalent of its .gemini/worktrees convention.
git worktree add ../shipping-rates -b feature-shipping-rates
cd ../shipping-rates && claude    # or: codex, gemini, cursor-agent

# 2. A ruleset on main, with the admin bypass closed and the
#    required check pinned to the app that sets it.
gh api repos/:owner/:repo/rulesets --method POST --input ruleset.json
```

The worktree line is the vendor's own suggestion, not mine. Gemini CLI documents `git worktree add` as the manual path alongside its experimental `.gemini/worktrees/` flag, and warns that it "does not automatically delete" your worktree or branch ([Gemini CLI Docs: Git Worktrees](https://geminicli.com/docs/cli/git-worktrees/)). Codex's managed worktrees live in `$CODEX_HOME/worktrees` and keep the most recent 15, but the feature is scoped to the desktop app running parallel chats ([Codex Docs: Worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees)). A plain sibling directory is what both reduce to, and it costs nothing to standardize on.

Rulesets carry the guarantees. Multiple rulesets targeting the same branch are aggregated and "the most restrictive version of the rule applies." Anyone with read access can view a repository's active rulesets, which makes the policy auditable without admin ([GitHub Docs: About Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)). Two settings are the actual footgun. By default the restrictions "don't apply to people with admin permissions to the repository or custom roles with the 'bypass branch protections' permission," which you close with "Do not allow bypassing the above settings." The second is the required status check: pin it to the app that sets it, because "If the status is set by any other person or integration, merging won't be allowed" ([GitHub Docs: About Protected Branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)).

The container is the third layer, and it is only a boundary if your organization makes it one:

> *"This is a convention rather than an enforcement boundary, because Claude Code does not require a container."*
> — [Claude Code Docs: Choose a Sandbox Environment](https://code.claude.com/docs/en/sandbox-environments)

The same page notes that under the built-in Bash sandbox, "MCP servers and hooks are separate processes that run unconstrained on the host," and points at device management or software allowlisting as the enforcement mechanism ([Claude Code Docs: Choose a Sandbox Environment](https://code.claude.com/docs/en/sandbox-environments)). The vendor sandbox is not liftable either. By default, if it cannot start because dependencies are missing or the platform is unsupported, Claude Code shows a warning and runs commands without sandboxing unless `sandbox.failIfUnavailable` is set to `true` ([Claude Code Docs: Configure the Sandboxed Bash Tool](https://code.claude.com/docs/en/sandboxing)). A boundary that silently degrades to no boundary is a convention with better marketing. Unattended runs belong inside this layer rather than inside a permission mode, which is the argument in the [loop engineering post](/blog/loop-engineering-breaks-your-playbook/).

This is the layer the drill did not have to think about. The `ci/test` check and the ruleset on `main` held identically on the afternoon's pushes, whether Claude Code or Codex made them. Because `feature-shipping-rates` was its own worktree, the half-finished Claude Code session was still sitting there untouched the next morning.

---

## Test the Swap on Your Own Tasks

Run your own task set under the second agent before the drill day, because the harness moves the number as much as the model does. Terminal-Bench 2.1 scores the same model weights at materially different accuracy depending on which harness runs them ([Terminal-Bench 2.1](https://www.tbench.ai/news/terminal-bench-2-1)).

| Model | Vendor's own harness | Terminus 2 | Which harness wins |
| --- | --- | --- | --- |
| Opus 4.6 | 70.1% (Claude Code) | 63.8% | vendor harness |
| GPT-5.4 | 77.3% (Codex CLI) | 54.8% | vendor harness |
| Gemini 3.1 Pro | 67.1% (Gemini CLI) | 70.7% | Terminus 2 |

The direction flips on the third row. The provider's own harness is not automatically the best one for the provider's own model.

> **Author's judgment.** That these gaps are substantially a harness effect is my inference, not a claim the benchmark makes. Terminal-Bench 2.1 publishes the agent-model table and argues nothing about cause; the premise it rests on is that the same model weights sit under both columns, so the difference has to come from the runtime around them.

A two-point leaderboard gap therefore tells you nothing about which agent will ship your work clean on the first try, and the tasks that expose the difference are yours. Pick the second agent the same way you would pick the first: on your own repo, with your own task specs, measured on your own [definition of done](/blog/evaluating-ai-coding-agent-output/). That argument is the whole subject of the [coding agent leaderboard noise post](/blog/coding-agent-leaderboard-noise/). It is the one decision here that no amount of repo layout will make for you.

---

## The Portability Ledger

One row per layer. The last column is what the September 3 drill actually hit. If you want the ledger filled in for your own repo rather than the drill's, [harness-portability-audit](https://github.com/johnayoung/agent-engineering-toolkit) walks the root, sorts every artifact it finds into the two piles, and names the bridge that is missing: the `@AGENTS.md` line, the `context.fileName` key, the non-spec skill field, the `.mcp.json` entry with a `url` and no `type`.

| Layer | Ports across vendors? | The flip | What the drill hit |
| --- | --- | --- | --- |
| Vendor as failure domain | No flip exists | Plan for two triggers; try a second serving path first | Incident `461yvfrzpwtt`, 13:26 to 16:23 UTC |
| Instruction file | Yes, by convention | `CLAUDE.md` holding `@AGENTS.md`, plus two config keys | Nothing; Codex read `AGENTS.md` unchanged |
| Skills | Spec surface only | Strip frontmatter down to the six spec fields | Nothing; `.agents/skills/` loaded as-is |
| MCP | Server yes, client file no | Re-emit `.mcp.json` as `config.toml` or `settings.json` | Re-emitted, one file, ten minutes |
| Hooks | No | Re-map the event names; exit 2 survives | `PreToolUse` guard rebuilt in `.codex/hooks.json` |
| Permissions | No | Re-express the tier in each vendor's grammar | `acceptEdits` became `approval_policy` plus `sandbox_mode` |
| Subagents | Location partly, fields no | Translate the frontmatter per schema | Left behind for the afternoon |
| Worktrees, rulesets, container | Yes; no vendor owns them | Nothing to flip | Held on every push, either agent |
| Capability | Not portable, but measurable | Run your own task set in advance | Only revealed whether it was done |

The pattern the ledger makes visible: the layer the keyword asks about is the layer that already works. AGENTS.md is solved, cheap, and light in effect. The swap is expensive in the adapter pile, and it is free in the enforcement pile only if you put the enforcement there first.

---

## References

### Research and Data

1. [Chu et al.: An Empirical Characterization of Outages and Incidents in Public Services for LLMs](https://arxiv.org/abs/2501.12469) — Across public status-page data through 2024-08-31, any two Anthropic services fail on the same day over 80% of the time, while no correlation appears between services from different providers. Backs the failure-domain framing.
2. [Anthropic: A Postmortem of Three Recent Issues](https://www.anthropic.com/engineering/a-postmortem-of-three-recent-issues) — Roughly 30% of Claude Code users in the affected window had at least one message misrouted, and internal evals did not capture the degradation users reported. Also the source of the per-platform figures (16% first-party, 0.18% Bedrock, under 0.0004% Vertex).
3. [Anthropic Status: Elevated Errors for Multiple Models](https://status.claude.com/incidents/461yvfrzpwtt) — A major-impact incident on 2026-09-03 running 13:26 to 16:23 UTC took claude.ai, the Claude API, Claude Code and Claude Cowork down together. The trigger for the running drill.
4. [Anthropic Status: Elevated Errors on Sonnet 5 and Haiku 4.5](https://status.claude.com/incidents/7gpjd8n56rlq) — A single model incident on 2026-07-17 took the same four surfaces down from 06:47 to 12:21 UTC and regressed from Monitoring back to Identified.
5. [Anthropic Status: Model Output Quality](https://status.claude.com/incidents/72f99lh1cj2c) — The public incident opened on 2025-09-09 for a bug that started August 5, with community reports credited for isolating it.
6. [Anthropic Status: Elevated Errors on Claude Code and Claude Cowork](https://status.claude.com/incidents/vr9tpk8w7zr8) — An upstream cloud provider, not a model, took Claude Code and Claude Cowork on the web down on 2026-08-28.
7. [Anthropic: Claude Status](https://status.claude.com/) — As of 2026-09-07 the page shows 99.44% 90-day uptime for Claude Code and 99.5% for the Claude API. The feed is a rolling window, which is why incident counts need a date stamp.
8. [OpenAI Status: Elevated Error Rates](https://status.openai.com/incidents/01JXCAW3K3JAE0EP56AEZ7CBG3/write-up) — ChatGPT error rates peaked near 35% and API rates near 25% during a June 2025 host-update incident whose recovery was extended by absent break-glass tooling. The second vendor's own outage character.
9. [OpenAI Status: Access Issues Affecting OpenAI Websites](https://status.openai.com/incidents/01KABE2437NJYKBFHT22SD3H92) — OpenAI attributed its 2025-11-18 outage to an issue with one of its third-party service providers, naming none. Premise (a) of the shared-edge judgment.
10. [Cloudflare: Cloudflare Outage on November 18, 2025](https://blog.cloudflare.com/18-november-2025-outage/) — A database permissions change doubled a Bot Management feature file and broke core traffic from 11:20 to 17:06 UTC the same day. Premise (b) of the shared-edge judgment.
11. [Galster et al.: Harness Engineering for Agentic AI Coding Tools](https://arxiv.org/abs/2602.14690) — Across 2,853 repositories, 10.3% configure two tools and 17.3% run AGENTS.md alone; the paper recommends AGENTS.md as shared core with tool-specific files as adapters.
12. [Barbaste et al.: Harness Engineering](https://arxiv.org/abs/2609.00006) — A source-code study of eleven harnesses finding skills ahead of MCP in adoption (9/11 vs 8/11), OpenHands running rival harnesses as interchangeable backends, and behavioral policy migrating from prompt prose into configuration.
13. [Gloaguen et al.: Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988) — Context files do not generally improve task success rates while raising inference cost by over 20% on average; developer-written files gained 2.4%, not statistically significant.
14. [Vercel: AGENTS.md Outperforms Skills](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals) — In 56% of eval cases the skill was never invoked; an 8KB docs index in AGENTS.md hit a 100% pass rate against 79% for skills.
15. [Terminal-Bench 2.1](https://www.tbench.ai/news/terminal-bench-2-1) — The same model scores differently under different harnesses: Opus 4.6 at 70.1% in Claude Code vs 63.8% in Terminus 2, GPT-5.4 at 77.3% in Codex CLI vs 54.8%, Gemini 3.1 Pro at 70.7% in Terminus 2 vs 67.1% in Gemini CLI.

### Practitioner Guidance

16. [Claude Code Docs: Claude Code on Amazon Bedrock](https://code.claude.com/docs/en/amazon-bedrock) — Bedrock costs you `/logout` and the WebSearch tool, and unpinned model aliases can lag the newest release and fall back to a lower tier at startup. The price of the serving-path hedge.
17. [Claude Code Docs: Other LLM Gateways](https://code.claude.com/docs/en/llm-gateway) — A gateway that does not forward new Claude Code capabilities breaks the corresponding features, so it becomes infrastructure your organization operates. `ANTHROPIC_BASE_URL` is the variable that points at it.
18. [Claude Code Docs: How Claude Remembers Your Project](https://code.claude.com/docs/en/memory) — Claude Code reads CLAUDE.md, not AGENTS.md, and recommends a CLAUDE.md that imports it; memory files are context, not enforced configuration.
19. [Claude Code Docs: Hooks Reference](https://code.claude.com/docs/en/hooks) — Hooks are shell commands, HTTP endpoints, MCP tool calls, LLM prompts or subagents fired at lifecycle points, with exit 2 as the blocking error.
20. [Claude Code Docs: Choose a Permission Mode](https://code.claude.com/docs/en/permission-modes) — Six named modes plus a classifier, and `auto` or `bypassPermissions` set in project settings files do not take effect.
21. [Claude Code Docs: Create Custom Subagents](https://code.claude.com/docs/en/sub-agents) — Subagent frontmatter carries `permissionMode`, `hooks`, `mcpServers` and `isolation: worktree`, and `permissionMode` is ignored when the parent runs auto mode.
22. [Claude Code Docs: Extend Claude With Skills](https://code.claude.com/docs/en/skills) — Outside Claude Code only the Agent Skills spec fields are usable, and a non-spec key fails packaging with a hard error rather than being ignored.
23. [Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp) — `.mcp.json` uses the standard `mcpServers` shape, but an entry with a `url` and no `type` is read as a stdio server and skipped.
24. [Claude Code Docs: Choose a Sandbox Environment](https://code.claude.com/docs/en/sandbox-environments) — A dev container is a convention rather than an enforcement boundary, and MCP servers and hooks run unconstrained on the host under the built-in Bash sandbox.
25. [Claude Code Docs: Configure the Sandboxed Bash Tool](https://code.claude.com/docs/en/sandboxing) — If the sandbox cannot start, Claude Code warns and runs commands unsandboxed unless `sandbox.failIfUnavailable` is set to true.
26. [Codex Docs: Import From Another Agent](https://learn.chatgpt.com/docs/import) — Maps instruction files to AGENTS.md, settings.json to config.toml, slash commands to skills and subagents to Codex subagents, then lists permissions, MCP auth, hooks, plugins and argument-bearing prompts as items to review.
27. [Codex Docs: Custom Instructions With AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) — Codex checks `AGENTS.override.md`, `AGENTS.md`, `TEAM_GUIDE.md`, `.agents.md` per directory, with `project_doc_fallback_filenames` and a 32 KiB default cap.
28. [Codex Docs: Hooks Reference](https://learn.chatgpt.com/docs/hooks) — Codex hooks live in `.codex/hooks.json` or `.codex/config.toml` and use exit code 2 with the blocking reason on stderr.
29. [Codex Docs: Advanced Configuration](https://learn.chatgpt.com/docs/config-file/config-advanced) — Permissions are a cross-product of `approval_policy` and `sandbox_mode`, with `danger-full-access` disabling sandboxing entirely.
30. [Codex Docs: Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents) — Standalone TOML agent files must define `name`, `description` and `developer_instructions`, and the docs warn the format may evolve.
31. [Codex Docs: Model Context Protocol](https://learn.chatgpt.com/docs/extend/mcp?surface=cli) — MCP servers are configured as `[mcp_servers.<server-name>]` tables shared across the desktop app, CLI and IDE extension, project-scoped to trusted projects only.
32. [Codex Docs: Worktrees](https://learn.chatgpt.com/docs/environments/git-worktrees) — Codex-managed worktrees live under `$CODEX_HOME/worktrees` with the most recent 15 retained, scoped to running parallel chats.
33. [Codex Docs: Customization](https://learn.chatgpt.com/docs/customization/overview) — OpenAI's own advice is to pair AGENTS.md with infrastructure that enforces the rules: pre-commit hooks, linters and type checkers.
34. [Gemini CLI Docs: Provide Context With GEMINI.md Files](https://geminicli.com/docs/cli/gemini-md/) — The `context.fileName` setting ships an example that already includes AGENTS.md, which is the one-key flip for Gemini CLI.
35. [Gemini CLI Docs: Hooks Reference](https://geminicli.com/docs/hooks/reference/) — Eleven events under a `BeforeTool` / `AfterTool` / `BeforeModel` vocabulary with no name-level overlap with Claude Code's.
36. [Gemini CLI Docs: Policy Engine](https://geminicli.com/docs/reference/policy-engine/) — A priority-ordered rule engine under a `plan` < `default` < `autoEdit` < `yolo` approval hierarchy, structurally unlike the other three permission models.
37. [Gemini CLI Docs: Subagents](https://geminicli.com/docs/core/subagents/) — Markdown with YAML frontmatter in `.gemini/agents/`, carrying `max_turns` (default 30), `timeout_mins` (default 10) and `kind`.
38. [Gemini CLI Docs: MCP Servers](https://geminicli.com/docs/tools/mcp-server/) — Gemini CLI reads the same `mcpServers` shape from `settings.json`, with a `trust` option that bypasses all confirmation dialogs.
39. [Gemini CLI Docs: Git Worktrees](https://geminicli.com/docs/cli/git-worktrees/) — The vendor's own docs give plain `git worktree add ../project-feature-search -b feature-search` as the manual equivalent of its experimental worktree flag.
40. [Cursor Docs: Rules](https://cursor.com/docs/rules) — Cursor supports AGENTS.md in the project root and subdirectories as a plain markdown file without metadata, alongside its own `.mdc` project rules.
41. [Cursor Docs: Agent Hooks](https://cursor.com/docs/agent/hooks) — Twenty-one events in `.cursor/hooks.json`, and the only vendor doc that states its exit-2 behavior matches Claude Code for compatibility.
42. [Cursor Docs: CLI Permissions](https://cursor.com/docs/cli/reference/permissions) — Rule strings like `Shell(rm)` and `Read(.env*)` in `.cursor/cli.json`, where deny rules take precedence over allow rules.
43. [Cursor Docs: Subagents](https://cursor.com/docs/agent/subagents) — Cursor reads `.claude/agents/` and `.codex/agents/` for cross-tool compatibility, while its own fields (`readonly`, `is_background`) have no equivalent elsewhere.
44. [Cursor Docs: MCP](https://cursor.com/docs/mcp) — Project and global MCP config live in `.cursor/mcp.json` and `~/.cursor/mcp.json` with Cursor-specific `${env:NAME}` interpolation.
45. [AGENTS.md](https://agents.md/) — The vendor-neutral instruction-file convention, used by over 60k open-source projects, where the closest AGENTS.md to the edited file wins. Claude Code is absent from the supported-tools list.
46. [Agent Skills: Specification](https://agentskills.io/specification) — Only `name` and `description` are required, six fields total are in the spec, and `allowed-tools` is experimental with support that varies by implementation.
47. [Addy Osmani: Agent Skills](https://addyosmani.com/blog/agent-skills/) — The same SKILL.md file works in Claude Code, Cursor, Gemini CLI, Codex and any harness that accepts system-prompt content.
48. [Google Developers Blog: Transitioning Gemini CLI to Antigravity CLI](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli) — On June 18, 2026 Gemini CLI stopped serving Google AI Pro, Ultra and free individual users. The one real vendor swap in the record.
49. [Antigravity CLI Docs: Gemini CLI to Antigravity CLI Migration Guide](https://antigravity.google/docs/cli/gcli-migration) — Both platforms use identical workspace context rules and no modifications are needed to existing rule documents, so the instruction layer survived a vendor retiring its own tool.
50. [GitHub Docs: About Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) — Rulesets aggregate and the most restrictive version of a rule applies, and anyone with read access can view the active set.
51. [GitHub Docs: About Protected Branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) — Admin bypass is on by default until you enable "Do not allow bypassing the above settings", and a required check pinned to an app blocks merges when anything else sets the status.
52. [GitHub: Feature Request: Support AGENTS.md](https://github.com/anthropics/claude-code/issues/6235) — The year-long request for native AGENTS.md support in Claude Code, closed by pointing at the `@AGENTS.md` import, with thread reports of symlinked files breaking after an update.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"The shared edge is also a failure domain."** This follows from OpenAI's 2025-11-18 incident attributing the outage to an unnamed third-party provider and Cloudflare's same-day postmortem covering an overlapping window. Neither names the other, and no same-day Anthropic incident was retrievable from the rolling status feed.
- **"The Terminal-Bench harness gaps are substantially a harness effect."** This follows from the benchmark's agent-model table, in which identical model weights sit under both columns. Terminal-Bench 2.1 reports the numbers and argues nothing about cause.
53. [agent-engineering-toolkit: harness-portability-audit](https://github.com/johnayoung/agent-engineering-toolkit) — A read-only script that prints this post's portability ledger for one repo, sorting each harness artifact into ports or vendor-bound and naming the documented bridge where one is missing. Bash and jq only; it flags cross-vendor gaps only for vendors whose files already exist in the repo.

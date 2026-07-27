---
title: "Audit Your Agent Harness: The Deterministic Layer Nobody Reviews"
date: 2026-07-27
draft: false
pillar: context-engineering
author: "John Young"
description: "You have reviewed your CLAUDE.md a dozen times and never opened the file that decides whether the agent's next rm -rf runs. Start by inventorying what shipped."
keywords: [agent harness audit, harness engineering, agent permissions, Claude Code hooks, agent sandboxing]
tldr:
  - "The layer most teams put policy on — hooks — fails open by default in every major agent runtime: Claude Code treats a hook's exit code 1 as a non-blocking error and runs the command anyway, Cursor ships its `failClosed` switch set to false, and OpenAI's Codex docs call tool hooks a useful guardrail, not a complete enforcement boundary."
  - "Audit every control by asking where the check physically executes — in the model's context, in the runtime before dispatch, or in the kernel — because a line in `CLAUDE.md` is a request the model is free to reinterpret, while a permission deny rule and an OS sandbox are evaluated outside the model's judgment."
  - "Agent failures are predominantly model-side, not harness-side — 57.9% epistemic against 9.4% environment across 1,794 annotated trajectories — so the case for auditing the harness is leverage, not causation: you cannot retrain the weights, and a fixed model's behavior still moves with the harness around it."
  - "Sell the harness audit as blast-radius control and never as a quality program, because no arrangement of permission rules, sandboxes, and decision logs detects a design that will be expensive in eighteen months."
---
{{< eli5 hint="no background needed · 10 min" audience="for readers outside AI engineering" >}}
Companies now let AI assistants run real commands on real computers. This is about the software that decides which of those commands actually run — and why almost nobody on the team has ever looked at it.

## The big idea

Imagine you hire a contractor and give them keys to your house. Two things govern what they do: the note you leave on the counter, and the locks on the doors. The note is a request — the contractor reads it, interprets it, and may decide a particular job is fine anyway. The locks hold no matter what the contractor concluded.

An AI coding assistant works the same way. Teams have rewritten the note dozens of times. Almost none of them have checked which doors are locked, because the locks came with the house — installed by whoever sold you the software, at settings someone else picked.

## Most of the locks came pre-installed, and nobody read the settings

Start with a command so boring nobody has ever written a rule about it: "delete the build folder." Except that folder is a shortcut. Behind the name sits a shared company storage drive. By the words, it is routine cleanup. By the actual layout of the machine, it reaches into shared storage.

Right now, name the specific piece of software that would decide whether that command runs. Most people can't. That isn't sloppiness — the whole surrounding layer was designed to be invisible.

There are four dials that govern that one command: which commands are allowed or need a human's approval, small check-scripts that run before an action, a restricted area the operating system can confine the work to, and a record of what happened. Every one of those dials is currently at a value the vendor chose. Reviewing them isn't imagination work. It is reading four documented settings and writing down which ones you actually picked.

The reason this goes unreviewed is that all the attention went somewhere else: to the written instructions the model reads. That is the one part of the system that is a request rather than a rule.

## Most mistakes come from the assistant's own thinking — the surroundings are just the part you can change

This is the part that is easy to get backwards, so be careful with it.

Researchers collected thousands of recorded agent sessions and hand-annotated the failures. Their finding: most failures come from the assistant's own reasoning. It had the information it needed and ignored, forgot, or misread it. The single biggest cause was starting from a false assumption. Failures usually began in the first few steps and stayed hidden until recovery was impossible. Blockers coming from the outside environment were a small slice. A second study, built completely differently, reached the same verdict: most failures are thinking failures, not tool failures.

So the claim is *not* "the surrounding software is what's broken." It isn't.

The claim is narrower and more useful. You cannot retrain the model — its trained innards ship the way they ship. The surrounding software is the part whose behavior you own, and you can change it this afternoon.

And that part matters more than people expect. The same model, wrapped in different surrounding software, scores far apart on the same public coding test. That comparison deserves a caveat: each entry was submitted by the team that built that wrapper, at different times, with nothing held constant — it's a spread you observe, not a fair head-to-head. The cleaner evidence is a controlled one. A lab changed nothing but how much computing power the machine had and watched results move by several points. In another case, after someone fixed problems in the test setup itself, the same model went from about 42 percent to 95 percent. Same model both times.

Most kitchen fires start with the cook, not the building. You did not train the cook and cannot retrain them. You do own the fire door.

## Where a check physically happens decides whether it can stop anything

Ask one question of every safeguard: where does this check actually run?

There are three answers, and they are not equivalent.

**In the text the model reads.** A line saying "never delete anything outside the project" sits in the model's working memory, competing with everything else it is holding in mind. By the time it evaluates the delete command, it has already decided the command looks fine. This is a suggestion.

**In the surrounding program, before the command is handed over.** This is a real check, but it judges the *text* of the command. A string of text cannot tell you where a shortcut points.

**In the operating system itself.** The vendor's own documentation is precise about the difference: the operating system enforces its boundary on the running process, so it holds regardless of what the model chose to run, and even if an allowed command does more than its name suggests. That last phrase is the whole story of the build folder. The dangerous command isn't the dramatic one. It's the boring one whose reach is a property of how the machine is laid out rather than of the words typed.

Security standards bodies land in the same place: handle privileged actions in real code rather than handing them to the model, and keep its privileges as small as possible. They are careful to describe these as measures that reduce harm, not prevent it. As one practitioner puts it, you can always tell the model not to do something — but how confident are you that it holds every time?

## The layer everyone treats as a lock is not one, and nothing writes down what it let through

Many teams have written a small check-script that runs before risky commands. Here is what the vendors' own reference documentation says about that layer.

Only one very specific signal from your script counts as "stop." The ordinary way a program reports failure does not block the action — it goes through. So a script that crashes on unexpected input lets the command run. That is not a bug in your script; it is the documented default. The same documentation tells you to use the permission list instead for anything that must genuinely hold.

Another vendor is blunter: treat these scripts as a useful guardrail, not a complete enforcement boundary — some tools skip that path entirely. A third defaults to letting the action through when the check fails, and ships the switch that reverses this turned off, while describing that switch as useful for security-critical checks. The vendor anticipated the security use case and shipped it off.

One more wrinkle: the word covering this layer has quietly expanded to include checks that are themselves an AI judging a condition. So "we have checks in place" no longer describes one kind of thing. These scripts are still worth having — for formatting, notifications, record-keeping, and fast feedback. They are the wrong place for a rule whose failure you cannot tolerate.

The record of what happened is the same story. There is a built-in event that names exactly which layer authorized each command — better than most teams expect. It writes nothing until you switch it on, and the actual command text needs a second switch. It is not sitting in a buffer waiting to be enabled; at default settings it was never written at all. Even switched on, there's a blind spot: when it says the decision was automatic, it doesn't say which rule made it. And the broader industry standard for these records makes the tool's *name* required and its *arguments* optional, so a fully compliant record tells you a command ran and nothing about what it did. That's a deliberate privacy tradeoff, which is why upgrading won't fix it.

## This contains damage; it does not make the work better

The strongest argument against spending a week on all this is that it will not improve the code. That's correct, and worth saying out loud before anyone starts.

Critics make the point well: no amount of tuning the surroundings fixes something that is fundamentally about how the model was trained. Automated checks measure what is fast to measure — tests pass or fail in seconds — while the cost of a bad design shows up in months or years, and nothing in the moment penalizes it. A review across many studies of many benchmarks found that adding more surrounding machinery does not consistently improve reliability.

All of that is true, and none of it touches this argument, because it is a different axis. Those critiques measure whether the assistant produces good software. This measures how far a wrong command can reach. A sprinkler system does not make the food taste better. Sell it as containing damage and never as a quality program — the first claim holds up, the second doesn't, and bundling them loses the argument on the weaker half.

Even the containment claim has a ceiling, and the honest way to show it is the vendor contradicting itself. Its engineering blog says a contained session is fully isolated and cannot affect overall user security. Its own product documentation for the same feature says containment reduces risk but is not a complete isolation boundary, then lists the ways out. The marketing page and the reference page disagree, and only one of them is the thing that actually runs.

## What this means for you

If your team uses AI assistants that can run commands, spend an afternoon on this — not writing a policy, just answering questions.

Pick the most ordinary destructive command you can think of and ask who decides whether it runs. Sort every safeguard you have into three buckets: text the model reads, a check in the surrounding program, and something the operating system enforces. Anything in the first bucket is a request. Confirm your containment layer can't quietly fail to start and let work run unconfined. Look for check-scripts that let the action through when they break. Turn on the record before you need it to reconstruct an incident, because afterward there is nothing to recover.

Then re-check it when the software updates, not once a year. In one product, the behavior of the containment layer changed at seven separate small releases in a stretch of about thirty. The thing you reviewed last quarter has been edited by people who don't work for you.

And do this in the settings rather than by clicking approve on each prompt. The vendor building those prompts says so itself: constant approvals lead to approval fatigue, where people stop reading what they're approving. The seventh approval of the day isn't review. It's a reflex with a keyboard shortcut.

The one question you can't answer is your finding.

---

**The technical terms, in plain words**
- Harness = everything wrapped around the AI model — settings, tools it can call, rules about what runs. Everything that isn't the model itself.
- CLAUDE.md / AGENTS.md = a plain-text instructions file the model reads. Guidance, not enforcement.
- Permission rules = a list in a settings file of which commands are allowed, denied, or need a human's approval.
- Hooks = small scripts the surrounding program runs just before or after the assistant takes an action.
- Fail open / fail closed = when the check itself breaks, does the action still go through (open) or get blocked (closed)?
- Sandbox = a restricted area the operating system enforces around the running work, limiting where it can write and what it can reach.
- Symlink = a shortcut — a folder name that actually points somewhere else on the machine.
- Blast radius = how far the damage spreads when something goes wrong.
- Telemetry = automatic records of what happened during a session.
- Prompt injection = text the assistant reads from a file, page, or ticket that is written to hijack its instructions.
- Model weights = the trained innards of the AI, fixed when it ships and not something you can edit.
- Deterministic vs. probabilistic control = a check that answers the same way every time (a test, a rule) versus one where a model judges and may answer differently.
- Agent runtime = the program on your machine that drives the model and actually executes its commands.

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}

You have reviewed your CLAUDE.md a dozen times, and you have never once opened the file that decides whether the agent's next `rm -rf` actually runs. Those are different files, governed by different software, and only one of them can stop a command — the other is a request the model is free to reinterpret.

---

## Most of Your Harness Arrived Pre-Configured

Before you write a single new rule, inventory the ones that shipped. The harness governing your agents is mostly inherited, and the inherited part is the part with teeth.

Start with a call so unremarkable that nobody has ever written a rule about it. The agent proposes `rm -rf ./build` in a repo where `./build` is a symlink into `/srv/shared/artifacts` — routine cleanup by the text, a shared volume by the filesystem. **Right now, today, name the piece of software that decides whether that command runs.** If you cannot, that is not a discipline failure — it is what the word "harness" has come to mean.

> *"A harness is every piece of code, configuration, and execution logic that isn't the model itself. A raw model is not an agent. But it becomes one when a harness gives it things like state, tool execution, feedback loops, and enforceable constraints."*
> — [Vivek Trivedy: The Anatomy of an Agent Harness](https://www.vtrivedy.com/posts/the-anatomy-of-an-agent-harness)

That definition includes the pieces you authored and the far larger set you did not. Birgitta Böckeler makes the inheritance explicit: in coding agents, part of the harness is already built in — via the system prompt, the chosen code retrieval mechanism, or an orchestration system you never configured ([Birgitta Böckeler: Harness Engineering](https://martinfowler.com/articles/harness-engineering.html)). Simon Willison's definition puts the same point at the center: a coding agent extends an LLM with capabilities "powered by invisible prompts and implemented as callable tools" ([Simon Willison: How Coding Agents Work](https://simonwillison.net/guides/agentic-engineering-patterns/how-coding-agents-work/)). Invisible by construction, in the vendor's product, on your laptop.

For the `rm -rf ./build` call, four surfaces are candidates, and every one of them is at a value someone else picked:

| Control surface | Where it is configured | Documented default behavior |
| --- | --- | --- |
| Permission rules | `permissions` block in `.claude/settings.json`, at user, project, local, and managed scope | Unmatched commands default to requiring manual approval |
| Hooks | `hooks` block in the same settings files | For most events, only exit code 2 blocks; exit code 1 proceeds |
| Bash sandbox | `sandbox.*` keys in settings | If the sandbox cannot start, Claude Code warns and runs commands without sandboxing |
| Tool-call telemetry | `CLAUDE_CODE_ENABLE_TELEMETRY` and `OTEL_LOG_TOOL_DETAILS` environment variables | Nothing is recorded until you set them |

Each of those defaults is the vendor's own documentation rather than my inference — fail-closed permission matching ([Claude Code Docs: Security](https://code.claude.com/docs/en/security)), the exit-code semantics ([Claude Code Docs: Hooks Reference](https://code.claude.com/docs/en/hooks)), the unsandboxed fallback ([Claude Code Docs: Sandboxing](https://code.claude.com/docs/en/sandboxing)), and the telemetry switch ([Claude Code Docs: Monitoring](https://code.claude.com/docs/en/monitoring-usage)). The audit is not an exercise in imagining what could go wrong. It is reading four documented values and writing down which ones you chose.

This layer goes unreviewed because a different layer absorbed all the attention. Böckeler splits harness controls two ways. Computational controls are "deterministic and fast, run by the CPU" — tests, linters, type checkers, structural analysis. Inferential controls cover "Semantic analysis, AI code review, 'LLM as judge'," run on a GPU or NPU, where "results are more non-deterministic" ([Birgitta Böckeler: Harness Engineering](https://martinfowler.com/articles/harness-engineering.html)). She crosses that with guides, which steer the agent before it acts, and sensors, which observe after. `AGENTS.md` and Skills land in the inferential-feedforward cell. That cell is exactly where the industry's review effort has gone, including [my own post on structuring CLAUDE.md](/blog/claude-md-context-hierarchy/). **You have been reviewing one quadrant of four, and it is the probabilistic one.**

Böckeler names the members of two cells. The other two are where the mechanisms in this audit land:

| | Guides — steer before the agent acts | Sensors — observe after it acts |
|---|---|---|
| **Computational** — deterministic, run by the CPU | Permission allow/deny rules, the OS sandbox boundary | Tests, linters, type checkers, structural analysis |
| **Inferential** — model-run, non-deterministic | `AGENTS.md`, Skills, auto-mode command classifiers | AI code review, LLM-as-judge, agent-based hooks |

The bottom-left cell has a thousand blog posts and a linting ecosystem. The top-left cell decides whether `rm -rf ./build` runs, and most teams have never opened it.

The canonical harness-engineering essay does not close the gap either, because it is greenfield by construction. OpenAI's account of building with Codex starts from an empty repository with no pre-existing human-written code, and its enforcement apparatus — "strictly validated dependency directions," custom linters, structural tests — is authored by the team. Their framing: "Agents are most effective in environments with strict boundaries and predictable structure, so we built the application around a rigid architectural model" ([OpenAI: Harness Engineering](https://openai.com/index/harness-engineering/)). Excellent advice for a system you are building from scratch. Silent on the agent runtime you installed last quarter and have been running ever since.

---

## The Harness Is the Variable You Control

Hold the model fixed and the scoreboard still moves by double digits. That is the whole reason this audit earns a slot on a staff engineer's week — not because the harness is exotic, but because it is the input with the widest measured range that you can actually change.

On the Terminal-Bench 2.0 leaderboard, Claude Opus 4.6 appears many times over, once per harness submission:

| Harness | Model | Score | CI | Submitted |
| --- | --- | --- | --- | --- |
| Meta-Harness | Claude Opus 4.6 | 76.4% | ±2.4 | 2026-05-14 |
| Capy | Claude Opus 4.6 | 75.3% | ±2.4 | 2026-03-12 |
| Terminus 2 | Claude Opus 4.6 | 62.9% | ±2.7 | 2026-02-06 |
| Claude Code | Claude Opus 4.6 | 58.0% | ±2.9 | 2026-02-07 |

Same weights, 18.4 points apart, and the confidence intervals do not overlap — the worst-case reading still leaves 13.1 points ([Terminal-Bench 2.0 Leaderboard](https://www.tbench.ai/leaderboard/terminal-bench/2.0)). Read that table with the caveat it deserves: entries are submitted by the harness authors themselves, the submission dates span February to May 2026, and nothing holds harness-side settings constant across them. It is an observational spread, not a controlled experiment, and anyone who cites it as one is overreaching.

The controlled companion comes from a frontier lab measuring against its own interest. Anthropic varied nothing but infrastructure resourcing and re-ran the benchmark:

> *"Infrastructure configuration can swing agentic coding benchmarks by several percentage points—sometimes more than the leaderboard gap between top models."*
> — [Anthropic: Quantifying Infrastructure Noise](https://www.anthropic.com/engineering/infrastructure-noise)

Their own number: the gap between the most- and least-resourced setups on Terminal-Bench 2.0 was 6 percentage points, at p < 0.01. A second Anthropic post supplies the vivid version. Opus 4.5 initially scored 42% on CORE-Bench; after a researcher fixed grading bugs, ambiguous task specs, and stochastic tasks, "Opus 4.5's score jumped to 95%" ([Anthropic: Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)). One model, two scaffolds, fifty-three points.

**The interesting question is therefore not which model you standardized on, but which harness you were measuring when you decided.**

### Concede the Causation Point First

> **Author's judgment.** The move from "the harness has leverage" to "audit the harness" is my inference, not a claim any source makes. It follows from three sourced premises: agent failures are predominantly model-side, a fixed model's behavior still varies widely with its harness, and the weights are not yours to retrain.

Do not claim the harness causes most agent failures. The best trajectory evidence available says the opposite, and a post that overclaims here loses every reader who has already read the paper. Zhao and colleagues collected 3,843 execution trajectories across seven frontier models and three scaffolds, then filtered to 1,794 complete trajectories for manual annotation over more than 63,000 execution steps. Across 1,184 failed trajectories, environment triggers account for 9.4% of decisive root causes against 57.9% epistemic:

> *"Our findings show that coding-agent failures are predominantly driven by epistemic errors, typically begin within the first few execution steps, and often remain hidden until recovery is no longer possible, suggesting that improving coding-agent reliability requires earlier validation and intervention rather than relying solely on final-outcome evaluation."*
> — [Zhao et al.: Failure as a Process](https://arxiv.org/abs/2607.09510)

Their definitions make the split sharper than the labels suggest. Epistemic triggers arise "when the information needed to avoid the error is already available but is ignored, forgotten, or misinterpreted," while environment triggers "originate from external blockers that are outside the agent's reasoning process." The single largest trigger of all is a false premise, at 30.7%. Scale AI's MCP-Atlas benchmark reaches the same verdict from a different direction across 1,000 expert-written tasks spanning 36 real MCP servers and 220 tools: "Automated diagnostics show that 63.3% of diagnosed failures are cognitive rather than tool-call related" ([Bandi et al.: MCP-Atlas](https://arxiv.org/abs/2602.00933)). The agent misreads a premise, or stops early, or synthesizes the wrong answer from a tool call that worked perfectly.

Both findings are true, and neither one touches the argument. You cannot patch the model's priors — the weights ship the way they ship. You can change what the runtime is permitted to execute, and you can change it this afternoon. The trajectory paper's own prescription points the same way: earlier validation and intervention is a harness prescription, because validation and intervention are things the harness does. **The harness is not where most failures start. It is the part of the system whose behavior you own.**

---

## Where the Check Runs Decides Whether It Controls

Ask one question of every control in your harness: where does this check physically execute? If the answer is "inside the model's context," you are holding a suggestion, and suggestions have no failure mode you can reason about.

**Bad:** A line in `CLAUDE.md` reading "Never delete paths outside the repository." The check runs inside the model's context, [competing for attention with everything else in the context window](/blog/claude-md-instruction-ceiling/), and it evaluates `rm -rf ./build` as a string the model has already decided looks fine.
**Good:** A deny rule the runtime evaluates before the call is dispatched, plus an OS sandbox that confines where the process can write once it starts — so the symlink into `/srv/shared/artifacts` is out of bounds whether or not anyone anticipated it.

```json {title=".claude/settings.json — enforcement, not instruction"}
{
  "permissions": {
    "deny": ["Bash(rm -rf /srv/**)"]
  },
  "sandbox": {
    "enabled": true,
    "failIfUnavailable": true,
    "allowUnsandboxedCommands": false
  }
}
```

The vendor draws the distinction more precisely than most security teams do:

> *"Claude Code evaluates permission decisions before a command runs, based on the command string and, in auto mode, a separate classifier's judgment about whether the command is safe. The operating system enforces the sandbox boundary on the running process, so it holds regardless of what the model chose to run and even if an allowed command does more than its name suggests."*
> — [Claude Code Docs: Sandboxing](https://code.claude.com/docs/en/sandboxing)

"Even if an allowed command does more than its name suggests" is the entire argument for `rm -rf ./build` in nine words. The permission layer judges a string; a string cannot tell you where a symlink resolves. Note also what the runtime does *not* special-case: `rm` and `rmdir` commands targeting `/`, your home directory, or other critical system paths still trigger a prompt, and `./build` is none of those. The footgun is not the dramatic command. It is the boring one whose blast radius is a property of the filesystem rather than of the text.

Standards bodies land in the same place. OWASP's prompt-injection entry recommends that you "Provide the application with its own API tokens for extensible functionality, and handle these functions in code rather than providing them to the model," and restrict the model's privileges to the minimum necessary. Both are framed as measures that *can mitigate* impact, alongside the admission that "it is unclear if there are fool-proof methods of prevention for prompt injection" ([OWASP: LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)). Willison puts the practitioner version in one line: you can try telling it not to in your own prompt, "but how confident can you be that your protection will work every time?" ([Simon Willison: The Lethal Trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)).

There is a stronger form of enforcement than blocking a call, and one runtime documents it plainly. In Gemini CLI's policy engine, a deny is not a refusal delivered to the model — it is a change to what the model can perceive. For global rules, meaning those without an `argsPattern`, tools that are denied are "completely excluded from the model's memory," so "the model will not even see the tool as an option, which is more secure and saves context window space" ([Gemini CLI: Policy Engine](https://github.com/google-gemini/gemini-cli/blob/main/docs/reference/policy-engine.md)). That scope qualifier matters: the docs make the claim for blanket deny rules and say nothing about argument-conditional ones.

**The audit question is therefore: where does this check physically execute — in the model's context, in the runtime before dispatch, or in the kernel?** Which authority tier a given task class deserves is a separate question, and [the permission tiering post](/blog/agent-permission-tiering/) answers it in full. This post is about the mechanism underneath that policy: whether the tier you assigned is enforced by anything at all.

---

## Your Hook Layer Is Not an Enforcement Boundary

The `PreToolUse` hook you wrote to catch destructive commands crashed on a malformed argument, exited 1, and `rm -rf ./build` proceeded anyway. That is not a bug in your script. It is the documented default in every major agent runtime, and two vendors say so in their own reference docs.

> *"For most hook events, only exit code 2 blocks the action. Claude Code treats exit code 1 as a non-blocking error and proceeds with the action, even though 1 is the conventional Unix failure code."*
> — [Claude Code Docs: Hooks Reference](https://code.claude.com/docs/en/hooks)

The same page goes further and redirects you off the layer entirely. Because the `if` filter is best-effort — it fails open and runs your hook regardless of pattern when the Bash command cannot be parsed — the docs instruct you to "use the permission system rather than a hook to enforce a hard allow or deny." OpenAI's Codex documentation is blunter still:

> *"Some specialized tool paths can opt out of the default hook path. Treat tool hooks as a useful guardrail, not a complete enforcement boundary."*
> — [OpenAI Codex Docs: Hooks](https://learn.chatgpt.com/docs/hooks)

The named hole behind "specialized tool paths" is concrete: hosted tools such as `WebSearch` do not use the local function-tool hook path at all. Codex also continues the tool call when a `PreToolUse` hook returns an unsupported field, and it launches multiple matching command hooks concurrently, "so one hook can't prevent another matching hook from starting." Cursor documents the same posture with an escape hatch attached. Unexpected exit codes mean "Hook failed, action proceeds (fail-open by default)". The per-script `failClosed` option that reverses this defaults to `false`, described by the vendor as "Useful for security-critical hooks" ([Cursor Docs: Hooks](https://cursor.com/docs/hooks)). The vendor anticipated your security use case and shipped the switch off.

One more qualifier, because the word "deterministic" is doing heavy lifting in this space. Anthropic's hooks guide does say hooks "provide deterministic control over Claude Code's behavior, ensuring certain actions always happen rather than relying on the LLM to choose to run them." The next sentence offers prompt-based and agent-based hooks "that use a Claude model to evaluate conditions" ([Claude Code Docs: Automate Actions with Hooks](https://code.claude.com/docs/en/hooks-guide)). "Hook" is an umbrella that now contains probabilistic members. Never audit it as a single category.

When you see one of these in your config, run the matching move:

| Signal in your config | What it actually means | What to do |
| --- | --- | --- |
| A hook script that ends in `exit 1` | Non-blocking error; the action proceeds | Change it to `exit 2`, or move the rule into the permission system |
| A Cursor security hook with no `failClosed` | Crash, timeout, or invalid JSON lets the action through | Set `failClosed: true` on that script |
| A Codex hook guarding a hosted tool | Some tool paths opt out of the hook path entirely | Constrain the tool itself; do not count the hook |
| A prompt-based or agent-based hook | A model evaluates the condition | File it as an inferential control, not a gate |
| A hook as the only rule for a destructive command | Hooks are not an enforcement boundary | Add the deny rule and keep the hook for logging |

Hooks are still worth having. They are the right layer for formatting, notification, telemetry, and the fast feedback that helps an agent land bounded, verifiable work on the first try. They are the wrong layer to carry a policy whose failure mode you cannot tolerate.

---

## The Tool-Call Audit Trail Ships Disabled

Turn on the record of which surface authorized each call before you need it to reconstruct an incident. Afterward is too late, because the record is not buffered somewhere waiting to be enabled — at defaults, it was never written.

The artifact already exists and it is better than most teams expect. Claude Code emits a `claude_code.tool_decision` event carrying a `source` attribute that names the control surface responsible for each decision: `"config"`, `"hook"`, `"user_permanent"`, `"user_temporary"`, `"user_abort"`, and `"user_reject"`. The docs define the second one exactly as you would want: `"hook"` means "A `PreToolUse` or `PermissionRequest` hook returned the decision" ([Claude Code Docs: Monitoring](https://code.claude.com/docs/en/monitoring-usage)). That is the answer to "which layer let `rm -rf ./build` through," recorded automatically, for free — once two environment variables are set.

```bash {title="The two switches that turn a session into a record"}
# Nothing is emitted until this is set; the docs mark it "(required)"
export CLAUDE_CODE_ENABLE_TELEMETRY=1

# Without this, you learn that Bash ran. Not what it ran.
export OTEL_LOG_TOOL_DETAILS=1
```

The second variable is the one teams miss. `tool_parameters` — the actual command string — is emitted only when `OTEL_LOG_TOOL_DETAILS=1`. And the gap is not vendor-specific: in the OpenTelemetry GenAI semantic conventions, `gen_ai.tool.name` carries requirement level `Required`, while `gen_ai.tool.call.arguments` ("Parameters passed to the tool call") and `gen_ai.tool.call.result` are both `Opt-In` ([OpenTelemetry: GenAI Spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md)). **A fully spec-compliant agent trace tells you that `Bash` ran and nothing whatsoever about what it ran.** That is a real privacy tradeoff rather than an oversight, which is why it will not fix itself by upgrading.

Know the blind spot you are buying, too. When `source` is `"config"`, the event covers project settings, personal allow and deny rules, managed policy, CLI flags, the active permission mode, a session-scoped grant, or the tool simply being inherently safe. The docs are explicit about the limit: "The event doesn't indicate which of these sources matched." You learn the decision was automatic. You do not learn which rule made it.

This matters because the vendor has explicitly handed you the review job: "Claude Code only has the permissions you grant it. You're responsible for reviewing proposed code and commands for safety before approval" ([Claude Code Docs: Security](https://code.claude.com/docs/en/security)). Responsibility you cannot reconstruct after the fact is not responsibility you are discharging.

---

## This Bounds Blast Radius, Not Code Quality

> **Author's judgment.** Separating the two axes — maintainability versus blast radius — is my framing, not a distinction the counter-sources draw. It follows from their own scope: the strongest critiques of harness engineering measure design quality, and the controls in this audit do not touch design quality.

The strongest argument against spending a week on your harness config is that it will not make the code better. It won't, and pretending otherwise is how this practice gets sold as a quality program and then fails to deliver one.

> *"What I'm gonna try to convince you is that no amount of harness engineering or loopsmaxxing can solve what is fundamentally a model-training issue."*
> — [Dex (HumanLayer): Why Software Factories Fail](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/wsff.md)

Fast deterministic gates measure what is fast to measure: "Running the tests gets you a clean pass or fail in ~seconds." Meanwhile "the cost function of bad architecture is measured in weeks, months, maybe even years," and "there is no penalty for eroding codebase maintainability." No arrangement of hooks and permission rules detects a design that will be expensive in eighteen months. The academic synthesis agrees from the other side: across 27 benchmark, taxonomy, and audit papers spanning 19 distinct benchmarks, "additional scaffolding does not consistently improve reliability" ([Albayaydh et al.: Beyond the Leaderboard](https://arxiv.org/abs/2607.05775)).

Both are aimed at a different axis than this audit. They measure [whether the agent produces good software](/blog/evaluating-ai-coding-agent-output/); the audit measures how far a wrong call can reach. **Sell the harness audit as blast-radius control and never as a quality program** — the first claim is well-supported, the second is refuted, and bundling them means losing the argument on the weaker half.

Even the blast-radius claim has a documented ceiling, and the honest move is to source it from the vendor's own contradiction. Anthropic's engineering blog says "Sandboxing ensures that even a successful prompt injection is fully isolated, and cannot impact overall user security" ([Anthropic: Beyond Permission Prompts](https://www.anthropic.com/engineering/claude-code-sandboxing)). The product documentation for the same feature says "Sandboxing reduces risk but is not a complete isolation boundary," then enumerates the escape routes ([Claude Code Docs: Sandboxing](https://code.claude.com/docs/en/sandboxing)):

| Documented escape route | Why the boundary does not hold |
| --- | --- |
| Domain fronting | The proxy makes its allow decision from the client-supplied hostname without inspecting TLS |
| `excludedCommands` | That key has no managed-only lockdown, so any developer can append entries |
| `dangerouslyDisableSandbox` retry | The model may retry a command outside the sandbox when it fails under restriction |

The marketing surface and the reference surface disagree, and only one of them is the thing that runs.

### The Audit Is Recurring, Not One-Time

Schedule this against your runtime's release notes rather than your compliance calendar, because the object you audited last quarter has since been edited by someone who does not work for you. Böckeler names the shape directly: building the outer harness "is emerging as an ongoing engineering practice, not a one-time configuration" ([Birgitta Böckeler: Harness Engineering](https://martinfowler.com/articles/harness-engineering.html)).

The drift rate is measurable on a single page. The Claude Code sandboxing reference carries version-gated behavior notes at seven separate point releases between v2.1.187 and v2.1.218 ([Claude Code Docs: Sandboxing](https://code.claude.com/docs/en/sandboxing)). The list: credential protection, network session grants, TLS termination, symlink resolution on protected settings paths, plan-mode approval scope, filesystem-layer disabling, and classifier routing for `rm`. Thirty-one point releases, seven documented changes to what the enforcement layer does. An annual review against that cadence is decorative.

Lilian Weng arrives at the structural version of this from a narrower case — self-improving harnesses, meaning harnesses that edit their own components. Her position on those: "The evaluator and permission control should likely sit outside the loop that evolves harness, with held-out tests, trace audits, and human review at decision points that matter—how much oversight can be scaled up and automated remains an open research area" ([Lilian Weng: Harness Engineering for Self-Improvement](https://lilianweng.github.io/posts/2026-07-04-harness/)). Note the hedge and the scope; she is writing about self-modifying systems, not agent harnesses in general. The transferable principle is small and useful anyway: a check that lives inside the thing it governs moves when that thing moves. The same logic applies to the iteration structure the harness runs, which [the loop engineering post](/blog/loop-engineering-breaks-your-playbook/) covers as its own problem.

---

## The Harness Audit: Seven Questions

Run these against your own config this week and write down the one you cannot answer. That is your finding — not a policy document, not a maturity score, just the specific question about `rm -rf ./build` that your organization currently has no answer to.

1. **Name the software that decides.** Open the settings files at every scope and list which permission rules you actually wrote versus which arrived with the install. If you cannot say which rule matches `rm -rf ./build`, you are running inherited defaults, which is a choice you have not yet made ([Claude Code Docs: Security](https://code.claude.com/docs/en/security)).
2. **Ask where each check physically executes.** Sort every control into three buckets: the model's context, the runtime before dispatch, and the kernel. Anything in the first bucket is a guide. Anything you assigned an authority tier in [the permission tiering framework](/blog/agent-permission-tiering/) needs a mechanism in one of the other two.
3. **Check whether your sandbox can quietly not exist.** Confirm `sandbox.failIfUnavailable` is `true` and `allowUnsandboxedCommands` is `false`, so the `dangerouslyDisableSandbox` retry is ignored. Then read `excludedCommands` at every scope — that key has no managed-only lockdown, so any developer can append to it ([Claude Code Docs: Sandboxing](https://code.claude.com/docs/en/sandboxing)).
4. **Grep your hook scripts for `exit 1`.** Every one you find is a policy that fails open. Convert the ones that must block to `exit 2`, set `failClosed: true` on Cursor's security-critical scripts, and move anything that must hold to the permission system ([Claude Code Docs: Hooks Reference](https://code.claude.com/docs/en/hooks)).
5. **Turn on the decision record before the incident.** Set `CLAUDE_CODE_ENABLE_TELEMETRY=1` and `OTEL_LOG_TOOL_DETAILS=1`, then verify a `claude_code.tool_decision` event actually lands with a populated `source` and `tool_parameters` ([Claude Code Docs: Monitoring](https://code.claude.com/docs/en/monitoring-usage)).
6. **Re-run this against release notes, not the calendar.** Diff your runtime's changelog for behavior changes to the enforcement surfaces, and re-baseline anything you measured. When the harness changes, the same model can move double digits, so the numbers you decided on belong to a system that no longer exists ([Terminal-Bench 2.0 Leaderboard](https://www.tbench.ai/leaderboard/terminal-bench/2.0)).
7. **Say out loud what this buys.** Blast radius, not code quality. If anyone in the room expects the audit to improve the agent's architecture, correct them before you start, or the whole exercise gets judged against a promise it never made.

If you would rather not open five settings files by hand, [harness-audit](https://github.com/johnayoung/agent-engineering-toolkit) reads them for you and prints the seven answers — including the ones it cannot determine, which are the ones worth writing down.

Do this at the config layer rather than the prompt layer because prompt-time review does not scale, and the vendor building the approval flow says so. Constantly clicking approve "can lead to 'approval fatigue', where users might not pay close attention to what they're approving, and in turn making development less safe" ([Anthropic: Beyond Permission Prompts](https://www.anthropic.com/engineering/claude-code-sandboxing)). The seventh approval of the day is not review. It is a reflex with a keyboard shortcut.

Answer the seven questions and you have converted a shrug into a specification. Then go decide which authority tier each task class actually deserves — that is [the next question](/blog/agent-permission-tiering/), and it is a much better one to argue about once you know your answers are enforced by something.

---

## References

### Research and Data

1. [Terminal-Bench 2.0 Leaderboard](https://www.tbench.ai/leaderboard/terminal-bench/2.0) — The same Claude Opus 4.6 weights score 58.0% under Claude Code and 76.4% under Meta-Harness, an 18.4-point spread with non-overlapping confidence intervals. Entries are self-submitted and non-contemporaneous, so the spread is observational.
2. [Anthropic: Quantifying Infrastructure Noise](https://www.anthropic.com/engineering/infrastructure-noise) — Infrastructure configuration alone swung Terminal-Bench 2.0 by 6 percentage points at p < 0.01, sometimes exceeding the leaderboard gap between top models. The controlled companion to the leaderboard spread.
3. [Anthropic: Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) — Opus 4.5 went from 42% to 95% on CORE-Bench after grading bugs were fixed and the scaffold was loosened, with the model held constant.
4. [Zhao et al.: Failure as a Process](https://arxiv.org/abs/2607.09510) — Across 1,794 annotated CLI agent trajectories and 63,000+ execution steps, environment triggers account for 9.4% of decisive failures against 57.9% epistemic. The direct refutation of harness causation.
5. [Bandi et al.: MCP-Atlas](https://arxiv.org/abs/2602.00933) — Across 1,000 expert-written tasks on 36 real MCP servers, 63.3% of diagnosed failures are cognitive rather than tool-call related. Second independent concession.
6. [Albayaydh et al.: Beyond the Leaderboard](https://arxiv.org/abs/2607.05775) — A synthesis of 27 papers across 19 benchmarks finding that additional scaffolding does not consistently improve reliability. The brake on "more harness is better."

### Practitioner Guidance

7. [Birgitta Böckeler: Harness Engineering](https://martinfowler.com/articles/harness-engineering.html) — Part of a coding agent's harness is already built in via the system prompt, retrieval mechanism, or orchestration; controls split into computational and inferential, guides and sensors, with AGENTS.md filed as inferential feedforward.
8. [Vivek Trivedy: The Anatomy of an Agent Harness](https://www.vtrivedy.com/posts/the-anatomy-of-an-agent-harness) — The canonical definition: the harness is every piece of code, configuration, and execution logic that is not the model itself.
9. [Simon Willison: How Coding Agents Work](https://simonwillison.net/guides/agentic-engineering-patterns/how-coding-agents-work/) — A coding agent extends an LLM with capabilities powered by invisible prompts and implemented as callable tools. The "invisible" framing anchors the inherited-defaults claim.
10. [Simon Willison: The Lethal Trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) — A prompt instruction is not a security control: you can tell the model not to, but you cannot be confident it holds every time.
11. [Claude Code Docs: Sandboxing](https://code.claude.com/docs/en/sandboxing) — The OS enforces the sandbox boundary on the running process regardless of what the model chose to run, but the sandbox falls back to unsandboxed execution when dependencies are missing and is documented as not a complete isolation boundary.
12. [Claude Code Docs: Hooks Reference](https://code.claude.com/docs/en/hooks) — For most hook events only exit code 2 blocks; exit code 1 is a non-blocking error and the action proceeds. The docs redirect hard enforcement to the permission system.
13. [Claude Code Docs: Automate Actions with Hooks](https://code.claude.com/docs/en/hooks-guide) — Hooks provide deterministic control, immediately qualified by prompt-based and agent-based hooks that use a Claude model to evaluate conditions.
14. [Claude Code Docs: Monitoring](https://code.claude.com/docs/en/monitoring-usage) — The `claude_code.tool_decision` event records which control surface authorized each call, but telemetry is off until `CLAUDE_CODE_ENABLE_TELEMETRY` is set and arguments require `OTEL_LOG_TOOL_DETAILS=1`.
15. [Claude Code Docs: Security](https://code.claude.com/docs/en/security) — The vendor transfers review responsibility to the user: Claude Code only has the permissions you grant it, and you are responsible for reviewing commands before approval.
16. [Cursor Docs: Hooks](https://cursor.com/docs/hooks) — Unexpected hook exit codes mean the hook failed and the action proceeds, fail-open by default; the `failClosed` override ships set to `false`.
17. [OpenAI Codex Docs: Hooks](https://learn.chatgpt.com/docs/hooks) — The vendor's own limit disclosure: treat tool hooks as a useful guardrail, not a complete enforcement boundary, since some specialized tool paths opt out of the hook path.
18. [Gemini CLI: Policy Engine](https://github.com/google-gemini/gemini-cli/blob/main/docs/reference/policy-engine.md) — For global rules without an `argsPattern`, denied tools are completely excluded from the model's memory, so the model never sees them as an option.
19. [OWASP: LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) — Recommends handling privileged functions in code rather than providing them to the model, framed as measures that can mitigate impact rather than prevent injection.
20. [Anthropic: Beyond Permission Prompts](https://www.anthropic.com/engineering/claude-code-sandboxing) — Approval fatigue makes prompt-time review unsafe at volume; also the source of the "fully isolated" marketing claim that the product docs contradict.
21. [OpenTelemetry: GenAI Spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md) — `gen_ai.tool.name` is Required while `gen_ai.tool.call.arguments` and `gen_ai.tool.call.result` are both Opt-In, so a compliant trace records that a tool ran and not what it ran.
22. [Dex (HumanLayer): Why Software Factories Fail](https://github.com/humanlayer/advanced-context-engineering-for-coding-agents/blob/main/wsff.md) — No amount of harness engineering solves what is fundamentally a model-training issue, and fast test gates cannot price architectural decay measured in months.
23. [Lilian Weng: Harness Engineering for Self-Improvement](https://lilianweng.github.io/posts/2026-07-04-harness/) — Argues evaluator and permission control should sit outside the loop that evolves the harness, scoped specifically to self-modifying harnesses.
24. [OpenAI: Harness Engineering](https://openai.com/index/harness-engineering/) — Agents are most effective in environments with strict boundaries and predictable structure, enforced mechanically. Written from an empty repository, with no coverage of inherited vendor defaults.

25. [agent-engineering-toolkit: harness-audit](https://github.com/johnayoung/agent-engineering-toolkit) — Read-only script that answers the seven questions against your own config: permission rules by scope, the three enforcement buckets, sandbox keys including `excludedCommands`, registered hooks with their `exit 1` fail-open paths, and the telemetry switches. Marks every control DEFAULT, SET, or UNDETERMINED, and grades nothing.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"Leverage, not causation"** — Follows from three sourced premises: failures are predominantly epistemic (Zhao et al.), a fixed model's score still varies widely with its harness (Terminal-Bench, Anthropic infrastructure noise), and the weights are not yours to retrain.
- **"Blast radius, not code quality"** — Derived by separating axes the counter-sources do not distinguish: HumanLayer and Albayaydh et al. measure design quality and reliability, while permission rules, sandboxes, and decision logs bound reach.

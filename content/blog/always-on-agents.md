---
title: "Always-On Agents: What Breaks When Nobody Is in the Session"
date: 2026-11-16
draft: false
pillar: production-operations
author: "John Young"
description: "An always-on agent loses the human who silently deduplicated, remembered, approved and stopped it. Each job needs a control that lives outside the agent."
keywords: ["always-on agents", "background agents", "scheduled agents", "agent idempotency", "non-human identity"]
tldr:
  - "An always-on agent loses the jobs a person in the session did silently (deduplicating, remembering, lending identity, approving, stopping), so each one needs a control that lives outside the agent before it runs unattended."
  - "Triggers fire twice, late, or never, so every trigger becomes a keyed inbox row before it becomes a run, and approval arrives as a new event, never inside the fired prompt."
  - "Keep an append-only run log the agent cannot edit and treat its own notes as a rebuildable cache; give it its own short-lived identity with a named owner, not a personal token."
  - "A green run only says a session ended, not that the work got done, so page on the missing outcome and keep the alert and off switch out of the agent's reach."
---
{{< eli5 hint="no background needed · 9 min" audience="for readers outside AI engineering" >}}
An AI helper that runs on its own, on a schedule, quietly loses a handful of safety jobs that a person watching used to do for free.

## The big idea

Picture an employee who works the night shift in an office where the manager used to sit right next to them. The manager never wrote down their job. They just noticed when the same task arrived twice, remembered what was said yesterday, signed off on risky decisions, and could pull the plug at any moment. Send the employee to work alone at 2 AM and all of that vanishes, unless someone builds each job a new home somewhere else. The post's point is that every one of those jobs needs a safeguard that lives outside the AI helper, because the helper cannot be trusted to supply it for itself.

## It started with one person who could not stop her helper

Summer Yue was using an AI helper to go through her email. She had told it to suggest what to delete and wait for her go-ahead. Partway through, the helper's working memory got squeezed to make room, and that instruction fell out. It kept deleting. She typed "Do not do that," then "STOP," and it ignored both. She had to run to the computer it lived on to shut it down.

Her only safety control was a sentence typed into a chat. When the sentence disappeared, the last thing left was a person who could physically reach the machine. Now take the person out completely. That is a helper working at 2 AM.

The author lists five jobs the person at the keyboard was quietly doing: catching repeated requests, remembering context, lending their own identity and access, approving risky actions, and stopping the work. Four of these fit into standard building blocks for this kind of system. The fifth, stopping the work, does not, and it is the one Yue ran out of.

To make this concrete, the post follows one made-up example: a helper that checks a software project's bug reports every night and every time a new one arrives. It sorts them, comments on them, and proposes small fixes. Each section below fixes one weakness in how it was first set up.

## Requests arrive twice, late, or never

No scheduling system promises to deliver each message exactly once. And the helper cannot tell a repeat from a new request. Two messages arriving together can start two competing workers, and a crash can lose a message entirely.

The fix is like a mailroom. Every incoming request is written down in a logbook first, with an ID taken from where the request came from, and only then does a worker handle it. One worker handles the logbook at a time. If the same ID shows up again, the worker sees it is already taken and stops. Do not use the time it arrived as the ID, and keep the logbook entries longer than the longest time a sender might retry. One example the post gives: if the logbook forgets entries after an hour but the sender retries for three days, the day-two retry looks like brand new work.

Clocks cause their own trouble. Twice a year, clocks jump forward or back. A job set for 2 AM in New York simply does not happen on the spring-forward night, and a job set for 1:30 AM runs twice on the fall-back night. The fix is to schedule in a time zone that does not change, or to avoid that two-hour window.

For each action the helper can take, decide in advance what is worse: skipping it or doing it twice. Google's scheduler prefers skipping, because a skipped job is easier to recover from. A different tutorial prefers a duplicate, because a duplicate is easier to fix than a lost item. The post says both are right, for different kinds of action. So decide per action, not per helper. Sending something a person reads once, or merging and closing things: skip when in doubt. Creating a new item: skip if it already exists. Harmless things like re-applying a label: doubling is fine.

## Keep the full record, and treat the helper's own notes as a copy

The example helper kept a notes file that it rewrote from memory at the end of every run. By week three the notes said a certain bug report was "won't fix." That was wrong. An earlier rewrite had merged two threads and lost a maintainer's note that reopened it. The real record still showed it. The notes file was the only place that was wrong, and it was the first thing the helper read.

The fix is to have the surrounding system write down every run in a log that the helper can read but never edit. The helper's notes become a copy that can be rebuilt from that log whenever needed, and each rebuild says which runs it came from.

Research backs the worry. One study found that memory an AI keeps rewriting and condensing helps at first, then gets worse, and can end up worse than having no memory at all. The same paper found that keeping the raw episodes doubled accuracy compared to forced condensing. The author is careful here: those are results on test tasks, not on helpers that ran for months. The reasoning still carries over, because the cause is mechanical: when you squash many sourced events into one unsourced summary, you lose where the facts came from. A second study found that even when a newer fact is sitting in memory, the AI often does not act on it. So the real fact can be right there and the stale summary still wins.

A simple rule from one of the sources: memory should only hold what the helper cannot look up again. The state of a bug report can always be looked up, so it belongs in the record.

## Give the helper its own identity

In the example, the helper was using the setup engineer's personal access pass. Every comment and fix it made carried that engineer's name. Two problems follow, and nobody notices either until the engineer leaves. Deleting the stored copy of a key does not always cancel the key itself, so it can stay valid. And the system may credit scheduled runs to whoever last edited the schedule.

The safer setup: the helper gets its own identity, with short-lived passes handed out only when needed, a named owner on record, and a planned end date. For outside services, a go-between holds the real keys, so the helper itself never sees them. That also limits the damage if the helper itself misbehaves. A security group's list of risks says the same thing: long-lived secrets give attackers unlimited time, and many organizations have no process for cancelling old keys or for what happens when an owner leaves.

What the helper's identity is allowed to do is a separate question that the post leaves to another article.

## Approval has to arrive as its own message

Say the helper wants to merge its own fix. The thing that cannot approve that is the instruction that started the run. That instruction was written ahead of time, so it is not a person saying yes right now. One vendor's documentation says this outright.

Waiting is no better if the helper just sits there holding a half-finished job for nobody. The better design is that the helper saves its place, posts a request for a human yes, and stops. When the person answers, the answer arrives as a new message in the same logbook, and the helper picks up where it left off. If nobody answers before an expiry time, the request closes and nothing happens; the next sweep can ask again. While one request is waiting, the helper keeps working on everything else. One tutorial got this wrong: while a request was pending, its helper stopped all its checks. This pattern is old in software outside AI; the post notes that these systems make the wait last, but leave setting the expiry to you. The 48-hour expiry in the example is the author's own illustrative number, not a sourced one.

## Alert on missing results, and keep the off switch out of the helper's reach

A run that finished without errors does not mean the work got done. In the example, the helper's access had been cancelled, so every attempt to label a bug failed. Yet for six nights each run ended normally and showed green. The vendor's own documentation says the status tells you how the run ended, not whether the work happened.

So alert a human when the thing the helper exists to produce goes missing, such as "no bug report labeled in 26 hours," not when a run turns red. A red run can just open a ticket. The 26 hours is the author's illustrative number: one nightly cycle plus a little slack.

The alert itself must also sit where the helper cannot reach it. OpenAI described two cases in its own systems where helpers ended up with human alerts disabled or a monitor removed. OpenAI says it does not have a satisfying explanation for why. The post does not claim to know the intent. The gap in the controls is clear regardless: neither case was treated as an emergency, and neither run was stopped automatically.

Know exactly what your pause button does. In one product, pausing stops future runs but not ones already underway, and a manual run is still possible. Then test your off switch from your phone, because Yue could not stop hers from hers.

Finally, every helper needs one named person or rotation to receive its alerts, and that should be rechecked when people change jobs. The author flags this as his own judgment: no source says it about AI helpers specifically. It follows from security guidance on orphaned identities and from the common practice of putting every alerting service on an on-call rotation.

## What this means for you

Before letting any AI helper run without you, write down the jobs you were silently doing: noticing repeats, remembering, lending your access, approving, and stopping. For each one, name a safeguard that lives outside the helper and a person who owns it. If any of those is still blank, the helper is not ready to run without you.

---

**The technical terms, in plain words**
- Always-on agent = an AI helper that runs by itself on a schedule or when something happens, with nobody in the conversation
- Session = one running conversation or working period with the helper
- Compaction = the helper squeezing its working memory to make room, which can drop things it was told
- Cron / scheduled run = a timer that starts a job at set times
- Webhook / event = an automatic message from another service saying something happened
- Idempotency, dedup key = making sure the same request done twice has the effect of once, using an ID to spot repeats
- Inbox = the logbook where every incoming request is recorded before any work starts
- Append-only log = a record you can only add to, never change
- Non-human identity = an account or set of passes belonging to a program rather than a person
- Credential, token, secret = a password or pass that proves who you are to a service
- Proxy = a go-between that holds the real keys and attaches them, so the helper never sees them
- Harness = the surrounding software that runs the helper and gives it tools
- Deferred call = saving the helper's place mid-task so it can stop and later resume
- Pager / on-call = the way a named person is alerted when something needs attention
- Context rot = an AI's working memory getting messy or losing facts as it fills up

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}

At 6:01 PM, Summer Yue typed "Do not do that" to her OpenClaw agent. At 6:03 PM, she typed "STOP OPENCLAW."

It kept looping through her inbox anyway. Compaction had dropped her instruction to suggest deletions and wait for her go-ahead. To stop it, she had to run to the Mac mini it lived on ([Simon Willison: A quote from Summer Yue](https://simonwillison.net/2026/Feb/23/summer-yue/)).

An always-on agent is that agent at 2 AM. Nobody is at the keyboard, and nobody is there to run anywhere.

---

## What the Chat Window Was Doing for You

Read the Yue incident as an inventory of jobs, not as a story about one bad agent.

Her only safety control was a sentence in the chat. Once compaction dropped it, the last enforcement left was a person who could reach the hardware: "I couldn’t stop it from my phone. I had to RUN to my Mac mini like I was defusing a bomb" ([Simon Willison: A quote from Summer Yue](https://simonwillison.net/2026/Feb/23/summer-yue/)).

And hers was an interactive session. Take the person out entirely, and every job she was doing has to land somewhere else.

So before you put an agent on a schedule, list what the person at the keyboard was doing without noticing. William Hu's reference architecture surrounds the loop with "five core primitives: an event inbox, timers, memory, permissions, and an outbox" ([William Hu: Building always-on agents](https://claude.com/resources/articles/building-always-on-agents)). Four of the five jobs below map onto those primitives. The fifth, the one Yue ran out of, does not.

| Job the human did silently | What Yue's session shows | Where it moves |
|---|---|---|
| **Deduplicating requests** | A person sends one request at a time and sees what is already running | Event inbox with one worker |
| **Remembering context** | The "wait for me" constraint lived only in the chat, and compaction dropped it | Memory, rebuilt from records |
| **Lending identity** | The agent worked in her real inbox with her access | Permissions: its own credentials |
| **Approving actions** | "Confirm before acting" was a sentence, not a gate | Permissions: a deferred call |
| **Stopping the run** | Three typed stops ignored; she ran to the machine | None of the five: an off switch outside the agent |

The research literature has the same blind spot. Ding et al. surveyed 435 works on persistent agents. They found the field favors "accumulating and retrieving state" over "governing, recovering, or relinquishing it." Only twenty-seven of those works expose any rollback mechanism for state-affected decisions ([Ding et al.: Always-On Agents survey](https://arxiv.org/abs/2606.30306)).

The rest of this post takes apart one constructed example: **the 2 AM triage agent**. It watches one repository's issue tracker.

It wakes on two paths. A Claude Managed Agents scheduled deployment runs it nightly. GitHub issue events run it through `claude-code-action`. Each run reads a `NOTES.md` it maintains itself. Then it labels and comments on issues and opens small fix PRs.

An engineer set it up in an afternoon, with the API key in a repo secret. Every setting below is a documented default or a documented example:

```yaml {title="The 2 AM triage agent, as first deployed"}
# deployment.md frontmatter: the nightly sweep (Claude Managed Agents)
name: Nightly issue triage
schedule:
  type: cron
  expression: "0 2 * * *"
  timezone: America/New_York

# .github/workflows/triage.yml: the event path
on:
  issues:
    types: [opened, edited, reopened]
jobs:
  triage:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v6
      - uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          github_token: ${{ secrets.TRIAGE_PAT }}
          prompt: "Read NOTES.md. Triage issue #${{ github.event.issue.number }}: label it, comment, and open a fix PR if the fix is small. Then rewrite NOTES.md."
```

Each section below fixes one line of that file.

This post covers what sits between runs: after the harness exits and before the next trigger arrives. Each run of that agent still needs the per-run caps, spend ledger and read-only gates from the [loop engineering guide](/blog/loop-engineering-practical-guide/).

**The question before scheduling any agent is therefore: who does each of the five jobs in that first table when the session has nobody in it?**

---

## Triggers Fire Twice, Late, or Never

No scheduler you will put an agent on promises exactly-once delivery. And the agent cannot tell a duplicate from a new request. Hu's article states both halves of the problem in one line:

> For example, two events arriving at the same time can start competing runs, and a crash can lose an event entirely.
> — [William Hu: Building always-on agents](https://claude.com/resources/articles/building-always-on-agents)

Hu's answer is structural: "The inbox should be the source of truth," and "An inbox should only have one active worker at a time" ([William Hu: Building always-on agents](https://claude.com/resources/articles/building-always-on-agents)).

So every cron tick, webhook and queue message becomes a row first and a run second. That row needs a dedup key. The key has to come from the source, because each source misfires in its own documented way:

| Trigger source | Documented misfire | Dedup key you store |
|---|---|---|
| **Kubernetes CronJob** | "two Jobs might be created, or no Job might be created"; `concurrencyPolicy` defaults to `Allow` | `batch.kubernetes.io/cronjob-scheduled-timestamp` (v1.32+) |
| **Claude scheduled deployments** (beta as of November 2026) | 2 AM skipped on the spring-forward day, repeated times fire twice on fall-back; missed triggers not backfilled after unpause; a rate-limited session creation recorded "without retry" | `trigger_context.scheduled_at` |
| **Claude Code scheduled tasks** (research preview as of November 2026) | On-the-hour runs "can start several minutes late"; GitHub events over the hourly caps "are dropped"; two PR updates produce two independent sessions | Repo, issue or PR number, event action, and the object's `updated_at` (my construction) |
| **Stripe webhooks** | Retries "for up to three days"; the same event "more than once" | The event ID |
| **Amazon SQS** | At-least-once delivery; an unfinished message reappears after its visibility timeout | A key the producer writes into the message body |

Sources for the table, in row order: [Kubernetes: CronJob](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/), [Claude Platform: Scheduled deployments](https://platform.claude.com/docs/en/managed-agents/scheduled-deployments), [Claude Code: Scheduled tasks](https://code.claude.com/docs/en/routines), [Stripe: Webhooks](https://docs.stripe.com/webhooks), and [AWS: SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html).

Then build the inbox in this order:

1. **Write the row, then acknowledge.** Every trigger lands in the inbox table before any agent code runs. Stripe's guidance is to return a `2xx` "before any complex logic that might cause a timeout" ([Stripe: Webhooks](https://docs.stripe.com/webhooks)).
2. **Key on the source's ID.** Use the key from the table, never the receive time. Stripe warns against using `created` to determine "whether you’ve already processed an event" ([Stripe: Webhooks](https://docs.stripe.com/webhooks)).
3. **Lock before the worker starts.** Mark the row in progress first. Powertools locks identical concurrent requests too: "Since we don't know the result from the first invocation yet, we can't safely allow another concurrent execution" ([Powertools: Idempotency](https://docs.aws.amazon.com/powertools/python/latest/utilities/idempotency/)).
4. **Keep the record longer than the retry window.** Powertools expires idempotency records after an hour by default. After that, "a transaction with the same payload will not be considered idempotent" ([Powertools: Idempotency](https://docs.aws.amazon.com/powertools/python/latest/utilities/idempotency/)). Put a one-hour window behind a sender that retries for three days, and the day-two retry runs as new work.
5. **Run one worker per inbox.** In GitHub Actions the nearest control is a `concurrency:` group. The `claude-code-action` docs list it under cost controls: "Use GitHub's concurrency controls to limit parallel runs" ([Claude Code: GitHub Actions](https://code.claude.com/docs/en/github-actions)).
6. **Move the cron out of the DST window.** Schedule outside 1 AM to 3 AM local time, or use UTC, "when missed or duplicate executions are unacceptable," per the scheduled-deployments doc ([Claude Platform: Scheduled deployments](https://platform.claude.com/docs/en/managed-agents/scheduled-deployments)).

Now run the triage agent through it.

Start with the schedule. It runs `0 2 * * *` in `America/New_York`. On the spring-forward Sunday in March, New York has no 2 AM, so that night's sweep never happens. In November the 2 AM run survives, because New York repeats 1 AM. Move the sweep to 1:30, though, and it fires twice.

That is the footgun. The doc's advice covers a two-hour window, and the wall clock picks which half bites you.

The event path has its own version. Two edits to issue #412 in one minute produce two `issues: edited` events. That means two sessions racing to label the same issue. Claude Code documents the same shape for its own GitHub trigger ([Claude Code: Scheduled tasks](https://code.claude.com/docs/en/routines)).

The fix has three parts:

- **Move the cron to UTC.** Use `0 7 * * *` in `UTC`.
- **Add a concurrency group.** Key the `concurrency:` group on the issue number.
- **Write an inbox row for every trigger.** Key it on `scheduled_at` or the issue event. The second run finds its key taken and exits.

### Decide Skip or Double per Side Effect

Every action the agent can take needs a decision made in advance: which costs less, a missed run or a [duplicate run](/blog/agent-tool-contracts/)?

Google's cron service chose skipping: "In general, we favor skipping launches rather than risking double launches, as much as the infrastructure allows." Its reason is that "recovering from a skipped launch is more tenable than recovering from a double launch" ([Google SRE: Distributed Periodic Scheduling](https://sre.google/sre-book/distributed-periodic-scheduling/)).

OpenRouter's tutorial chose the opposite, on purpose. It marks stories seen only after a run finishes, and it accepts that a crash can list one twice. "A duplicate is easier to fix than a lost story" ([OpenRouter: Build an always-on agent](https://openrouter.ai/blog/tutorials/build-always-on-ai-agent/)).

Both are right, for different side effects. So set the policy per action, not per agent:

| When the action... | Inbox policy | Triage agent example |
|---|---|---|
| **Sends something a human reads once** (email, money, a public post) | Skip on doubt and fail closed | The nightly summary comment |
| **Merges, deploys or closes** | Skip, and route through approval | Merging the fix PR for #412 |
| **Creates a new object** (a PR, a ticket) | Skip if the key already exists | `Fix null check in parseConfig (#412)` on its `claude/` branch |
| **Reads, labels or rebuilds a digest** | Allow the double | Re-applying `bug` to #412 |

---

## Keep the Record; Treat Summaries as a Cache

By week three, the triage agent's `NOTES.md` says issue #412 is "won't fix." It is not.

Three runs ago, the end-of-run rewrite merged #412 with an older duplicate thread. In the process it dropped the maintainer's reopen comment. GitHub still shows that comment. The notes file is the only place the fact is wrong, and it is the first thing the agent reads.

The fix: store every run as an append-only record the agent cannot edit. Anything the agent writes about itself is a cache you rebuild from those records.

- **Bad:** one `NOTES.md` that the agent rewrites from its own context at the end of every run, then trusts at the start of the next.
- **Good:** an append-only run log that the harness writes and the agent can only read. A separate job regenerates `NOTES.md` from the log on a gate (weekly, or past a size threshold). It stamps the file with its source run IDs.

```jsonl {title="runs/drun_01abc124.jsonl (written by the harness, read-only to the agent)"}
{"run_id":"drun_01abc124","trigger":{"type":"schedule","scheduled_at":"2026-11-17T07:00:00Z"},"inbox_key":"schedule:2026-11-17T07:00:00Z"}
{"run_id":"drun_01abc124","issue":412,"observed":"state=open, reopened_by=maintainer","action":"add_label","label":"bug"}
{"run_id":"drun_01abc124","issue":412,"action":"skip_pr","reason":"branch claude/issue-412 exists"}
```

Memory that an LLM keeps rewriting decays on a curve. That curve can drop below having no memory at all:

> As consolidation proceeds, memory utility first rises, then degrades, and can fall below the no-memory baseline.
> — [Zhang et al.: Useful Memories Become Faulty](https://arxiv.org/abs/2605.12978)

The same paper reports agents that "preserve raw episodes by default and double the accuracy of their forced-consolidation counterparts" ([Zhang et al.: Useful Memories Become Faulty](https://arxiv.org/abs/2605.12978)). Those are task benchmarks, not month-long deployments. The analogy still holds, because the failure is mechanical. The Ding survey names it: "summarization collapses many sourced episodes into one unsourced summary" ([Ding et al.: Always-On Agents survey](https://arxiv.org/abs/2606.30306)).

Keeping the newer fact in memory doesn't save you either. Agents often do not act on it. The STALE benchmark found "a pervasive gap between retrieving updated evidence and acting on it," and its best evaluated model reached 55.2% overall accuracy ([Chao et al.: STALE](https://arxiv.org/abs/2605.06527)).

That is the #412 failure exactly. The reopen is retrievable, and the summary wins anyway.

Production designs already work this way. Anthropic's Managed Agents keep the session outside the harness as "the append-only log of everything that happened." That way "nothing in the harness needs to survive a crash" ([Anthropic: Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents)).

Project Vend's shop agent ran for about a month on note-keeping tools, because the shop's full history would overwhelm its context window. It still "announced a plan to simplify pricing and eliminate discount codes, only to return to offering them within days" ([Anthropic: Project Vend](https://www.anthropic.com/research/project-vend-1)). Yue's lost instruction is the same failure at the scale of one run: compaction is context rot with a delete key.

Hu's rule of thumb sets the boundary: "memory should only hold what the agent can’t look up again" ([William Hu: Building always-on agents](https://claude.com/resources/articles/building-always-on-agents)). The state of #412 can always be looked up again. So it belongs in the record, not in a summary.

Two related reads:

- **Memory inside one long run:** for that budget, see [what loop engineering breaks](/blog/loop-engineering-breaks-your-playbook/).
- **Run record fields:** for which fields each run record should carry, use the [trace schema](/blog/agent-observability-trace-schema/).

---

## Give the Agent Its Own Identity

The agent should run as its own non-human identity. That means short-lived credentials injected at call time, an owner on record and an offboarding date. It should never run as whoever last touched the config.

Open issue #412 and look at who commented: the engineer who set the triage agent up. `triage.yml` hands the action that engineer's personal token. Every label, comment and fix PR carries their name.

- **Bad:** `anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}` plus `github_token: ${{ secrets.TRIAGE_PAT }}`, a personal access token from whoever ran setup.
- **Good:** workload identity federation for the model call, the GitHub App for repository writes, and a proxy that injects any third-party credential the agent never sees.

```yaml {title="triage.yml, running as its own identity"}
permissions:
  contents: write
  issues: write
  pull-requests: write
  id-token: write   # OIDC exchange for Claude API access; no stored key
steps:
  - uses: actions/checkout@v6
  - uses: anthropics/claude-code-action@v1
    with:
      anthropic_federation_rule_id: ${{ vars.TRIAGE_FEDERATION_RULE_ID }}
      anthropic_organization_id: ${{ vars.ANTHROPIC_ORG_ID }}
      # no github_token: the action authenticates as the Claude GitHub App
```

The Bad version fails in two ways. Nobody sees either one until the engineer leaves.

**Revocation does not follow the secret.** "If you delete a secret, the credential it held stays valid." Retiring the key takes a second step in the Claude Console ([Claude Code: GitHub Actions](https://code.claude.com/docs/en/github-actions)).

**Attribution follows whoever touched the schedule.** Move the nightly sweep into `triage.yml` as a GitHub `schedule:` trigger and check who gets credited. GitHub attributes each scheduled run "to a repository user, usually the one who last changed the workflow's `cron` schedule" ([Claude Code: GitHub Actions](https://code.claude.com/docs/en/github-actions)).

Claude Code's scheduled tasks borrow your identity the same way. Anything a task does through your connected GitHub identity "appears as you." After 72 hours without a GitHub connection, the task turns off ([Claude Code: Scheduled tasks](https://code.claude.com/docs/en/routines)). That cutoff is the better failure. A personal key that outlives its owner never turns off at all.

OWASP names this pattern in its non-human identity list:

> If a breached secret is long-lived, it provides attackers with access to sensitive services without any time constraints.
> — [OWASP: NHI7 Long-Lived Secrets](https://owasp.org/www-project-non-human-identities-top-10/2025/7-long-lived-secrets/)

The same entry cites the CSA NHI Report finding that "51% of organizations have no formal process to offboard or revoke long-lived API keys." Its companion entry on improper offboarding describes the orphan case. The owner departs, and the identities "remain active without a new designated owner" ([OWASP: NHI1 Improper Offboarding](https://owasp.org/www-project-non-human-identities-top-10/2025/1-improper-offboarding/)). The agent survey says the same of agents: "A cached credential can grant access long after the user intended it to lapse" ([Ding et al.: Always-On Agents survey](https://arxiv.org/abs/2606.30306)).

The proxy limits the blast radius when the agent itself is what misbehaves. In Hu's design, "The agent sends requests without credentials, and the proxy injects the real credentials before forwarding" ([William Hu: Building always-on agents](https://claude.com/resources/articles/building-always-on-agents)). Managed Agents route MCP calls the same way, and "The harness is never made aware of any credentials" ([Anthropic: Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents)).

What the triage agent's identity may do is a separate question, covered by [permission tiers](/blog/agent-permission-tiering/).

---

## Make Approval an Inbox Event

Approval has to arrive as a new event. It cannot ride in on the trigger.

The triage agent wants to merge its own fix for #412. The one thing that cannot approve that merge is the prompt that started the run. Claude Code's scheduled-tasks doc says so outright:

> The trigger attests only that the prompt was stored ahead of time by an authorized session on your account. The fired prompt is therefore not live user input and can't act as approval or consent for actions during the run.
> — [Claude Code: Scheduled tasks](https://code.claude.com/docs/en/routines)

The default alternative is no better at 2 AM. When a scheduled task hits auto mode's repeated-block thresholds, "a permission prompt appears in the run's session and waits until someone answers it" ([Claude Code: Scheduled tasks](https://code.claude.com/docs/en/routines)). That is a live session holding a half-finished merge for nobody.

Hu's design ends the run instead. "When a call is deferred, the run ends and the session is saved mid-call." When the human responds, "their answer comes back as an event in the inbox" ([William Hu: Building always-on agents](https://claude.com/resources/articles/building-always-on-agents)). Approval becomes one more trigger, keyed and deduplicated like the rest.

| When you see | Do |
|---|---|
| **A step needs a human yes** (merge the #412 fix PR) | Defer the call: save the session, post the ask on the PR, end the run |
| **The answer arrives** (an approving review on the PR) | Write it to the inbox as a new event; resume the saved session on the same ID |
| **No answer by the expiry** | Close the ask as expired and take no action; the next sweep can re-raise it |
| **New issues arrive while an ask is pending** | Keep triaging; a pending ask blocks only its own call |
| **Trigger text that reads like approval** | Ignore it; the fired prompt is not consent |

The pattern is old outside agents.

In AWS Step Functions, "A task might need to wait for a human approval, integrate with a third party, or call legacy systems." Without a heartbeat timeout, an unanswered callback token waits until the execution hits its one-year quota ([AWS: Step Functions callbacks](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html)).

LangGraph's interrupts do the same: "the checkpointer writes the exact graph state so you can resume later, even when in an error state." You resume on the same thread ID ([LangChain: Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)).

Both make the wait durable. Both leave the expiry to you.

The counter-example shows why the fourth row matters. OpenRouter's tutorial parks approvals in files, which is close to right. But "While a call is waiting, the agent skips its checks entirely" ([OpenRouter: Build an always-on agent](https://openrouter.ai/blog/tutorials/build-always-on-ai-agent/)). One unanswered ask stops all the watching.

The triage agent's merge ask for #412 expires after 48 hours. That number is mine, not a source's. Pick one shorter than the time it takes the PR to go stale against `main`.

---

## Page on Outcomes; Keep the Off Switch Out of Reach

A green run does not mean the work got done.

For six nights the triage agent's runs came back green, and it triaged nothing. Its GitHub credential had been revoked. Every label call failed. Each session still ended normally.

Scheduled deployments count a run as successful when it creates a session ([Claude Platform: Scheduled deployments](https://platform.claude.com/docs/en/managed-agents/scheduled-deployments)). Claude Code's scheduled-tasks doc spells out what that status means:

> These outcomes say how the session ended, not whether Claude completed the work your prompt describes, so open the run and read its transcript to see what happened.
> — [Claude Code: Scheduled tasks](https://code.claude.com/docs/en/routines)

So page an owner when [the outcome the agent exists to produce](/blog/agent-done-criteria-predicates/) goes missing, not when a run turns red.

This is ordinary SRE practice applied to a new kind of service. Good monitoring "focuses primarily on symptoms for paging, reserving cause-oriented heuristics to serve as aids to debugging problems," and "Every page should be actionable" ([Google SRE: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)). For the triage agent, the symptom is untriaged issues. A failed session is not.

| Signal | What it actually tells you | Triage agent response |
|---|---|---|
| **Deployment run marked successful** | A session was created | Nothing on its own |
| **Scheduled-task run with no Error** | How the session ended, not whether the work got done | Read the transcript |
| **A red run** | A cause, useful for debugging | Open a ticket |
| **No issue labeled in 26h** | The outcome the agent exists to produce is missing | Page the owner |

The second half of the rule comes from OpenAI's internal deployments. Two incidents show the gap.

In one, a coding agent repairing an evaluation pipeline left the misalignment monitor running, but "human alerts were disabled." In the other, a harness migration "removed the monitor configuration and its runtime integration."

OpenAI says "We don’t yet have a satisfying explanation for this behavior" ([OpenAI: Suppressing misalignment monitoring](https://alignment.openai.com/misalignment-reports/suppressing-misalignment-monitoring-alerts-and-disabling-misalignment-monitoring/)). Intent is unresolved. The control gap is not:

> Neither of the incidents described here was classified as a P0, and neither trajectory was automatically killed.
> — [OpenAI: Suppressing misalignment monitoring](https://alignment.openai.com/misalignment-reports/suppressing-misalignment-monitoring-alerts-and-disabling-misalignment-monitoring/)

OpenAI's response leans on monitoring that, in its words, "runs within the service that handles model requests, outside the agent’s direct control." Do the same for the triage agent:

1. **Page on the missing outcome.** "No issue labeled by the triage agent in 26h" pages the owner. A red run opens a ticket. (26 hours is my threshold: one nightly cycle plus slack.)
2. **Move the alert out of `triage.yml`.** The official Claude GitHub App's permission set includes Workflows read and write ([Claude Code: GitHub Actions](https://code.claude.com/docs/en/github-actions)). So an alert defined in the agent's own repo sits within reach of the identity the agent writes with. Put the check in a monitoring system [whose credentials the agent never holds](/blog/self-improving-software-factory/).
3. **Know what your pause actually stops.** Pausing a scheduled deployment suppresses future triggers. It does not stop work in flight: "sessions already running from a prior deployment run continue." Manual runs are still allowed, and archive, unlike pause, is terminal ([Claude Platform: Scheduled deployments](https://platform.claude.com/docs/en/managed-agents/scheduled-deployments)). For Claude Code scheduled tasks, the org-level toggle is the one where "existing scheduled tasks stop running" ([Claude Code: Scheduled tasks](https://code.claude.com/docs/en/routines)).
4. **Test the off switch from your phone.** Yue could not stop her agent from hers ([Simon Willison: A quote from Summer Yue](https://simonwillison.net/2026/Feb/23/summer-yue/)). Find out before the night you need it.

What the page carries, and which run IDs it links to, comes from the same [trace schema](/blog/agent-observability-trace-schema/) as the run log.

### Name One Owner per Agent

> **Author's judgment.** No source states this for agents specifically. It follows from OWASP's orphaned-identity finding and from SRE's practice of putting every paged service on a rotation.

A page with no named recipient is a log line.

Put one human, or one rotation, [on record as the triage agent's owner](/blog/comprehension-debt-on-call-ownership/). Then re-certify that ownership when people move.

OWASP already asks this of every non-human identity: "Periodically recertify NHIs to confirm they are still in use, actively needed, and have valid owners" ([OWASP: NHI1 Improper Offboarding](https://owasp.org/www-project-non-human-identities-top-10/2025/1-improper-offboarding/)).

The SRE book assumes the page lands on a rotation: "Many teams have both a primary and a secondary on-call rotation" ([Google SRE: Being On-Call](https://sre.google/sre-book/being-on-call/)).

An always-on agent is a service in every sense that matters to the pager. Take the 26-hour page for #412's missing outcome. It needs a name to land on, and that name should not belong to the engineer who left.

---

## The Standing-Agent Table

Fill in this table before an agent runs without you. Write one row for each job the human used to do. If the agent runs from a GitHub Actions workflow, [always-on-preflight](https://github.com/johnayoung/agent-engineering-toolkit) reads the file, flags the lines this post fixes, and prints this table filled in as far as a static check can see.

The last column shows the triage agent after every fix above.

| Job | What the session gave you | What breaks without it | Control outside the agent | Triage agent, fixed |
|---|---|---|---|---|
| **The human in the chat** | Someone watching every step | Nobody notices anything | List the five jobs before scheduling | Each job mapped to a control and an owner |
| **Deduplication** | One request at a time | Double fires, DST skips, dropped events | Inbox keyed on the source's event ID, one worker, skip-or-double per action | `0 7 * * *` in `UTC`, inbox keyed on `scheduled_at` or the issue event |
| **Memory** | Context held in a person's head | Rewritten notes drift and override fresh facts | Append-only run log; notes as a rebuildable cache | `runs/*.jsonl` by the harness; `NOTES.md` regenerated and stamped |
| **Identity** | Their own credentials | Borrowed, unrevocable keys | Own identity, short-lived credentials via a proxy | OIDC federation and the GitHub App; no `TRIAGE_PAT` |
| **Approval** | A live yes | Fired prompt treated as consent; prompts waiting on nobody | Deferred call resumed by an inbox event with an expiry | #412 merge parked; expires in 48h |
| **Watching and stopping** | Eyes on the screen, a hand on the machine | Green runs that did nothing; alerts the agent can mute | Page on outcomes; off switch outside its reach | 26h no-label page in a separate system; named owner |

**If any row is still blank, the agent is not ready to run without you.**

---

## References

### Research and Data

1. [Ding et al.: Always-On Agents survey](https://arxiv.org/abs/2606.30306) — Only 27 of 435 works on persistent agents expose any rollback for state-affected decisions. Also backs summaries losing provenance and cached credentials outliving intent.
2. [Zhang et al.: Useful Memories Become Faulty](https://arxiv.org/abs/2605.12978) — LLM-consolidated memory first helps, then degrades below the no-memory baseline; keeping raw episodes doubles accuracy. Backs the run-log-over-notes section.
3. [Chao et al.: STALE](https://arxiv.org/abs/2605.06527) — Agents retrieve updated evidence but fail to act on it; the best model scored 55.2% overall. Backs the stale-notes failure.
4. [Anthropic: Project Vend](https://www.anthropic.com/research/project-vend-1) — A month-long shop agent needed external notes because its history overflowed context, and still reversed its own decisions within days.
5. [OpenAI: Suppressing misalignment monitoring](https://alignment.openai.com/misalignment-reports/suppressing-misalignment-monitoring-alerts-and-disabling-misalignment-monitoring/) — In internal deployments, coding agents disabled human alerts and removed a monitor integration, and neither run was auto-killed. Backs keeping alerts outside the agent's reach.

### Practitioner Guidance

6. [Simon Willison: A quote from Summer Yue](https://simonwillison.net/2026/Feb/23/summer-yue/) — Compaction dropped a "wait for me" instruction and the user could not stop the agent from her phone. The opening incident.
7. [William Hu: Building always-on agents](https://claude.com/resources/articles/building-always-on-agents) — Always-on agents need an event inbox, timers, memory, permissions and an outbox, with one worker per inbox. Also backs deferred approval and the credential proxy.
8. [Anthropic: Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents) — The session is an append-only log outside the harness, and credentials sit behind a proxy the harness never sees.
9. [Claude Platform: Scheduled deployments](https://platform.claude.com/docs/en/managed-agents/scheduled-deployments) — Spring-forward times are skipped, fall-back times fire twice, and missed triggers are not backfilled. Also backs pause versus archive semantics; beta as of November 2026.
10. [Claude Code: Scheduled tasks](https://code.claude.com/docs/en/routines) — A run's status says how the session ended, not whether the work was done. Also backs dropped events, acting as you, and fired prompts not being approval; research preview as of November 2026.
11. [Claude Code: GitHub Actions](https://code.claude.com/docs/en/github-actions) — Deleting a repo secret leaves the credential valid, and scheduled runs are attributed to whoever last changed the cron. Also backs OIDC federation.
12. [Kubernetes: CronJob](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/) — A CronJob can create two Jobs or none for one schedule, so Jobs should be idempotent.
13. [Stripe: Webhooks](https://docs.stripe.com/webhooks) — Endpoints can receive the same event more than once, with retries for up to three days; dedupe on event IDs.
14. [AWS: SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html) — At-least-once delivery means a message can arrive more than once, and an unfinished one reappears after its timeout.
15. [Powertools: Idempotency](https://docs.aws.amazon.com/powertools/python/latest/utilities/idempotency/) — Idempotency records expire after one hour by default, after which the same payload runs again. Also backs the in-progress lock.
16. [Google SRE: Distributed Periodic Scheduling](https://sre.google/sre-book/distributed-periodic-scheduling/) — Google's cron favors skipping launches over risking doubles, because a skip is easier to recover from.
17. [OpenRouter: Build an always-on agent](https://openrouter.ai/blog/tutorials/build-always-on-ai-agent/) — A tutorial agent that accepts duplicates over lost items and skips all checks while an approval is pending.
18. [OWASP: NHI7 Long-Lived Secrets](https://owasp.org/www-project-non-human-identities-top-10/2025/7-long-lived-secrets/) — Long-lived secrets give attackers access without time limits; 51% of organizations have no process to revoke long-lived keys (CSA, as cited).
19. [OWASP: NHI1 Improper Offboarding](https://owasp.org/www-project-non-human-identities-top-10/2025/1-improper-offboarding/) — Non-human identities are orphaned when their owner leaves; recertify that each one has a valid owner.
20. [AWS: Step Functions callbacks](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html) — Callback tasks pause a workflow for human approval, up to a one-year quota unless a heartbeat timeout is set.
21. [LangChain: Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts) — Interrupts checkpoint exact graph state and resume on the same thread ID.
22. [Google SRE: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/) — Page on symptoms, use causes for debugging, and make every page actionable.
23. [Google SRE: Being On-Call](https://sre.google/sre-book/being-on-call/) — Pages land on primary and secondary on-call rotations, and paging alerts should track symptoms that threaten SLOs.
24. [agent-engineering-toolkit: always-on-preflight](https://github.com/johnayoung/agent-engineering-toolkit) — A static check for agent workflows that prints the standing-agent table filled in. It flags missing concurrency, stored keys, cron inside the DST window, and alerts inside the agent's reach; a checklist covers the rows it cannot see.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"Name one owner per agent":** follows from OWASP NHI1 (orphaned identities when the owner leaves; recertify owners) and the SRE book's on-call rotations. No agent-specific source.
- **Mapping the five human jobs onto Hu's primitives:** my framing of the Yue incident against Hu's five primitives. Hu does not cover the off switch.
- **"A one-hour dedup window behind a three-day retrier runs the retry as new work":** combines Powertools' one-hour default expiry with Stripe's three-day retry window.
- **"2 AM skips in March; 1:30 fires twice in November" in `America/New_York`:** applies the scheduled-deployments DST rule to New York's transition times.
- **The GitHub-event dedup key (repo, number, action, `updated_at`):** my construction; no source prescribes it.
- **48-hour approval expiry:** an illustrative number, not a sourced one.
- **26-hour no-outcome page threshold:** one nightly cycle plus slack; illustrative.

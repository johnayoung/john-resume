---
title: "Loop Engineering Examples: Harden One Loop, Control by Control"
date: 2026-11-02
draft: false
pillar: context-engineering
author: "John Young"
description: "Most published agent loops ship without a cap, a ledger, or a gate. Harden one loop.sh control by control, each line tied to a documented default or incident."
keywords: ["loop engineering examples", "Ralph loop", "claude -p max-turns", "agent loop circuit breaker", "agent spend ceiling"]
tldr:
  - "Most published agent loops are demos, not harnesses: the gap is a few dozen lines of bash, each one there because a default is unlimited or because something already went wrong without it."
  - "Harden a loop by taking the exit out of the agent's hands: cap the outer loop and every call, keep the cumulative spend ledger in the wrapper, hold state in a file the agent can only flip, and decide \"done\" with tests mounted read-only, which is only as trustworthy as the tests behind it."
  - "Add a breaker that stops after three iterations in a row leave the patch unchanged (my application of the research, not a measured result), check which controls a built-in loop actually provides before swapping `loop.sh` for it, and treat the 20-iteration, 40-turn, $40 defaults as starting numbers, run in a container on bounded, verifiable work first."
---
{{< eli5 hint="no background needed · 6 min" audience="for readers outside AI engineering" >}}
Some AI programs are set to repeat the same job over and over on their own; this post shows the safety limits they need, one at a time.

## The big idea

Most of the examples people publish for this have no safety limits at all. Picture a contractor who works one shift at a time and forgets everything when the shift ends. A foreman keeps sending the contractor back in until the job is done. If the foreman sets no limit on the number of shifts, the money spent, or how "done" gets decided, the contractor can keep working and billing all night. The fix is a handful of rules kept by the foreman, not by the contractor. Each rule exists either because the tool's default is "no limit" or because something already went wrong without it.

## The popular examples run with no brakes

The post looks at three well known loops. Two stop on nothing; they run until the program dies. The third stops when a notes file says "ALL TASKS DONE", but the worker itself is told to update that file. So the only way out is a sentence the worker writes about itself. Even the guide that taught that third loop said every loop needs three hard stops (a cap on repeats, detection of no progress, and a spending limit), then shipped a loop with none of them.

Two real stories show the stakes. In one big project, an AI ran in an uncapped loop, and it ended only once, by accident, when the AI killed its own process. In another, a team's overnight loop with no stop condition opened over 30 code change requests and left a bill in the thousands of dollars, roughly ten times what the team would have chosen to spend if anyone had been asked.

A safety note the author repeats: these loops let the AI act without asking permission each time, so run them in a sealed container, not on your everyday machine.

## Limit the shifts, and limit each shift; keep the money tally yourself

There are really two loops. The outer one is the foreman sending the worker back in. The inner one is the worker's own steps within one shift. In the tool being used, neither has a limit unless you set one, so you set both: a maximum number of shifts, and a maximum number of steps and dollars per shift.

Those per-shift limits are checked only after each step finishes, so a shift can overshoot a little. The docs themselves say to leave headroom.

A per-shift budget also can't see the whole night. Twenty shifts at four dollars each is eighty dollars, and no single shift ever saw that number. So the foreman keeps a running tally outside the worker and stops everything when it hits a ceiling. The author treats the tally as an estimate, not a bill: the tool's own cost numbers are approximate and can be wrong after a crash. The usage page is the real bill; the tally is just the brake.

## Let the worker tick a checklist, but check the work with a test it can't touch

Instead of trusting "I'm done", the foreman keeps a checklist file where the worker may only change a box from unticked to ticked. If the worker rewrites the list in any other way, the foreman restores the saved copy. The foreman also writes the log note if the whole thing is shut down mid-shift, because the worker can't write a note after it has been cut off.

A tick is still the worker grading itself. So before any tick counts, the foreman runs an outside test, kept in a folder the worker can only read, not change. The research the author cites points one way: AI models that are told to pass tests often cheat by changing the tests, and telling them not to cheat had almost no effect. Separating the one who does the work from the one who judges it helps a lot.

Two limits on this. Read-only tests do not block every kind of cheating. And the cheating studies were done on tasks deliberately made impossible, so they show what the models do under pressure, not how often it happens on ordinary work. A passing check is only as trustworthy as the test behind it, and a person should still read the changes before anything is accepted.

## Stop when three shifts in a row change nothing

Sometimes the worker keeps re-running the same tests and thinking over the same problem without changing any of the actual work. Research found this pattern in one case: one set of tests was rerun 22 times with nothing new written. So the foreman looks at whether the work changed after each shift and stops after three shifts in a row with no change. The notes file and the checklist are excluded from that comparison, since they change every shift and would hide the stall.

The author is open that this is his own application of the idea, not a measured result. The research defined these stalls by studying recorded runs afterward, and another project already uses a similar stop on unchanged files. The author combined those two facts.

## The built-in repeat tools have gaps too

Before swapping your own loop for a ready-made repeat command, check which limits it actually has. Some default to unlimited repeats. Some let the AI decide when it is finished. One lets a small helper model judge whether the goal is met, but that helper can only read what the worker has already said, so a claimed test result is a believed test result. One rule: if a hook (a custom checking script) is your stop condition, adding a certain option that skips hooks removes the stop without any error message. The author also infers, but did not test, that a repeating loop that makes edits is not covered by that hook's built-in eight-in-a-row override.

## What this means for you

If you ever run an AI in a loop, do not rely on the AI to say when to stop, how much it spent, or whether it succeeded. Keep those three in a separate script: a cap on shifts, a spending tally with a ceiling, and an outside test the AI can't edit, plus a stop when nothing is changing. The author's starting numbers (20 shifts, a 40 dollar ceiling, three unchanged shifts) are his own starting points, not researched thresholds. Begin on small, checkable work in a brand new project with a low ceiling, so a bad night costs little. Then read the last line of the log: it says which rule fired, and that is the one to adjust first.

---

**The technical terms, in plain words**
- loop = the same job repeated over and over until a stop condition is met
- agent = an AI program that takes steps on its own to get a job done
- iteration = one pass through the loop, one shift
- turn = one step the AI takes within a shift
- outer loop / inner loop = the foreman repeating shifts / the worker's steps inside one shift
- context window = the AI's working memory for one shift; a new shift starts empty
- harness = the rules and scripts wrapped around the AI to keep it in bounds
- spend ceiling = a total dollar limit for the whole run
- ledger = the running tally of money spent, kept by the wrapper script
- gate = an outside check that must pass before a result counts
- circuit breaker = an automatic stop when something looks stuck
- diff = the list of what changed in the code between two moments
- container = a sealed box on your computer so the AI can't affect anything outside it
- Ralph loop = a well known name for the bare repeat-forever AI loop
- hook = a small script that runs at set moments and can allow or block an action

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}

One of the top search results for loop engineering, a dev.to field guide, tells you to bake three hard stops into every loop: an iteration cap, no-progress detection, a spend ceiling. Then it ships a bash loop with none of them ([truongpx396: The Agentic Loop](https://dev.to/truongpx396/the-agentic-loop-a-practical-field-guide-mnc)). Anthropic's own C compiler ran nearly 2,000 Claude Code sessions across two weeks, at a total cost just under $20,000, on a bare `while true` ([Carlini: Building a C compiler](https://www.anthropic.com/engineering/building-c-compiler)). The loops people publish are demos, not harnesses. The difference is a few dozen lines of bash, each one there because a default is unlimited or because something already went wrong without it.

The why lives in [Loop Engineering Breaks Your Single-Shot Context Playbook](/blog/loop-engineering-breaks-your-playbook/): a loop needs an explicit stop and externalized state, the two fields a single prompt never needed. This post is the how. It takes one `loop.sh`, starts from the bare loop everyone copies, and adds one control per section until every exit names the control that fired. Every recipe here runs `claude -p` with `--dangerously-skip-permissions`, so run it in a container. That is Carlini's own instruction: "(Run this in a container, not your actual machine)." The [agent harness audit](/blog/agent-harness-audit/) covers the sandbox and permissions layer that caveat stands on.

---

## Start from the Loop Everyone Publishes

Read the published loops as the baseline you are about to harden, not the recipe you copy. Here are three, verbatim: Geoffrey Huntley's original Ralph one-liner, the harness Nicholas Carlini used for the C compiler, and the loop in the dev.to field guide.

```bash {title="loop.sh v0: the three published loops"}
# Huntley, the original Ralph loop
while :; do cat PROMPT.md | claude-code ; done

# Carlini, the C compiler harness
while true; do
    COMMIT=$(git rev-parse --short=6 HEAD)
    LOGFILE="agent_logs/agent_${COMMIT}.log"

    claude --dangerously-skip-permissions \
           -p "$(cat AGENT_PROMPT.md)" \
           --model claude-opus-X-Y &> "$LOGFILE"
done

# truongpx396 on dev.to, the one this post hardens
while ! grep -q "ALL TASKS DONE" STATUS.md; do
  # each pass is a brand-new agent with an empty context window
  claude -p "Read PLAN.md and STATUS.md. Pick the next unchecked task,
             implement it, run the tests, commit on success, and update
             STATUS.md. Then stop."
done
```

Read them for what they stop on. Huntley's and Carlini's loops stop on nothing; they run until the process dies. The dev.to loop stops when `STATUS.md` contains `ALL TASKS DONE`. The prompt two lines down tells the agent to update `STATUS.md`, so the agent writes its own exit. None of the three counts iterations, sums spend, or checks whether the last pass changed anything, though a few sections above its loop the dev.to guide says "Bake all three into every loop" ([truongpx396: The Agentic Loop](https://dev.to/truongpx396/the-agentic-loop-a-practical-field-guide-mnc)). Huntley is equally candid about the output: "you'll wake up to a broken codebase that doesn't compile from time to time" ([Huntley: Ralph Wiggum as a "software engineer"](https://ghuntley.com/ralph/)).

Two incidents set the stakes. Carlini's loop ended exactly once, and not by design:

> I did see Claude `pkill -9 bash` on accident, thus killing itself and ending the loop. Whoops!
> — [Carlini: Building a C compiler](https://www.anthropic.com/engineering/building-c-compiler)

The second ran on a cron. Dave Slutzkin describes a team whose overnight loop had an open-ended goal and no stop condition. It opened 30+ PRs, left a four-figure token bill, and averaged $70+ in tokens per PR ([Slutzkin: The loop that cost $1000+ overnight](https://antiburn.com/resources/the-loop-that-cost-1000-dollars/)).

> It spent something like 10x what the team would have chosen to spend if anyone had been asked.
> — [Slutzkin: The loop that cost $1000+ overnight](https://antiburn.com/resources/the-loop-that-cost-1000-dollars/)

**The baseline is therefore: a loop whose only exit is a sentence the agent writes about itself.** Call the dev.to version `loop.sh` v0; [the finished loop](#the-finished-loop-line-by-line) maps every line added after it to the default or incident that put it there.

---

## Cap the Outer Loop and Every Call

A loop needs two caps because it runs two loops, and neither has a limit unless you set one. The outer loop is your bash `while`. The inner loop is the tool-calling loop inside each `claude -p` call. Claude Code documents its `--max-turns` as "No limit by default" ([Anthropic: CLI reference](https://code.claude.com/docs/en/cli-reference)). The Agent SDK lists both its max turns and max budget defaults as "No limit" ([Anthropic: How the agent loop works](https://code.claude.com/docs/en/agent-sdk/agent-loop)).

Clayton Farr's Ralph Playbook is the widely copied loop that does count iterations, and it shows why one cap can't stand in for the other. Its `MAX_ITERATIONS` "Limits the outer loop (number of tasks attempted; NOT tool calls within a single task)". A bare `./loop.sh` runs unlimited until you press Ctrl+C, and the playbook says plainly that "A single task execution has no hard technical limit" ([Farr: The Ralph Playbook](https://github.com/ghuntley/how-to-ralph-wiggum)).

```bash {title="loop.sh v1: an outer cap and per-call caps"}
#!/usr/bin/env bash
set -uo pipefail

MAX_ITERATIONS="${MAX_ITERATIONS:-20}"    # outer cap; a number, never 0 = unlimited
MAX_TURNS="${MAX_TURNS:-40}"              # per call: tool turns + 1 for the final response
CALL_BUDGET="${CALL_BUDGET:-4.00}"        # per call, checked after each response lands
PROMPT_FILE="${PROMPT_FILE:-PROMPT.md}"
[ "$MAX_ITERATIONS" -gt 0 ] || { echo "loop.sh: MAX_ITERATIONS must be > 0" >&2; exit 2; }

ITERATION=0
while [ "$ITERATION" -lt "$MAX_ITERATIONS" ]; do
  ITERATION=$((ITERATION + 1))
  claude -p "$(cat "$PROMPT_FILE")" \
    --dangerously-skip-permissions \
    --max-turns "$MAX_TURNS" \
    --max-budget-usd "$CALL_BUDGET"
  rc=$?
  [ "$rc" -eq 0 ] || echo "iteration $ITERATION: claude exited $rc" >> progress.txt
  grep -q "ALL TASKS DONE" STATUS.md && { echo "loop.sh: done"; exit 0; }
done
echo "loop.sh: stopped by MAX_ITERATIONS ($MAX_ITERATIONS)" >&2
exit 1
```

`MAX_ITERATIONS` defaults to a number and the script refuses 0, so forgetting the argument gets you 20 iterations instead of Farr's unlimited run. The exit code gets branched on, not dropped. Claude Code "exits with code 0 on success and a non-zero code when the run fails, so your scripts can branch on the exit status" ([Anthropic: Run Claude Code programmatically](https://code.claude.com/docs/en/headless)), and `--max-turns` "Exits with an error when the limit is reached." v1 records a nonzero exit in `progress.txt` rather than stopping. The next iteration starts in a fresh context window and can see that the last one ran out of turns. That is why the script sets `-uo pipefail` without `-e`: a loop that branches on failures can't die on the first one.

### Size the Per-Call Caps

Size both per-call caps for the moment they get checked, which is after a response lands, not before. The turn rule from the SDK docs: "Count each turn with tool calls, plus one for the final text-only response" ([Anthropic: How the agent loop works](https://code.claude.com/docs/en/agent-sdk/agent-loop)). The budget is compared "after model responses arrive", so spend can pass the cap by the cost of that response plus whatever running subagents spend before they stop. The CLI reference puts it in one line: "Spend can pass the cap, so leave headroom" ([Anthropic: CLI reference](https://code.claude.com/docs/en/cli-reference)).

| When you see | It means | Do this |
| --- | --- | --- |
| `"subtype": "error_max_turns"` and no `result` in the iteration's JSON | The last turn went to a tool call and the run never wrote its final response | Add one turn for the final response; if it still hits, [the task is too big](/blog/how-to-size-tasks-for-ai-coding-agents/) for one iteration |
| `"subtype": "error_max_budget_usd"` | The call reached `CALL_BUDGET` mid-task | Split the feature before you raise the cap |
| `total_cost_usd` above `CALL_BUDGET` | Expected: the cap is checked after each response | Keep `CALL_BUDGET` well under the run ceiling; never set the two equal |
| `--resume` or `--continue` anywhere in the loop | Restored totals "don't count toward" `--max-budget-usd` | Start every iteration as a fresh call |

The last row is the reason the next section exists.

---

## Keep the Spend Ledger Outside the Agent

A per-call budget stops a call, not a run: twenty iterations at `CALL_BUDGET=4.00` is an $80 run that no single flag ever saw. The cumulative number has to live in the wrapper, and Anthropic's cost docs spell out the arithmetic. For independent calls with no resume, "each result covers only its own call, so add the totals yourself." For resumed sessions the opposite holds:

> Each result already includes the session's earlier spend. Read the latest result for the session total; summing results double-counts the restored spend.
> — [Anthropic: Track cost and usage](https://code.claude.com/docs/en/agent-sdk/cost-tracking)

`loop.sh` never resumes, which keeps the ledger a plain sum. With `--output-format json`, the payload includes `total_cost_usd` "so scripted callers can track spend without consulting the usage dashboard" ([Anthropic: Run Claude Code programmatically](https://code.claude.com/docs/en/headless)).

```bash {title="loop.sh v2: the spend ledger"}
# Above the loop
SPEND_CEILING="${SPEND_CEILING:-40.00}"   # whole run; keep it under MAX_ITERATIONS * CALL_BUDGET
LOOP_DIR=.loop
mkdir -p "$LOOP_DIR/logs" && touch "$LOOP_DIR/spend.log"
spent() { awk -F'\t' '{ s += $2 } END { printf "%.2f", s }' "$LOOP_DIR/spend.log"; }
over_ceiling() { awk -v s="$(spent)" -v c="$SPEND_CEILING" 'BEGIN { exit !(s + 0 >= c + 0) }'; }
stop() { echo "loop.sh: stopped by $1 after $ITERATION iteration(s), spend \$$(spent)" >&2; exit "${2:-1}"; }

# Inside the loop: the call writes JSON, the wrapper keeps the ledger
  out="$LOOP_DIR/logs/iter-$ITERATION.json"
  claude -p "$(cat "$PROMPT_FILE")" \
    --dangerously-skip-permissions \
    --max-turns "$MAX_TURNS" \
    --max-budget-usd "$CALL_BUDGET" \
    --output-format json > "$out"
  rc=$?
  cost=$(jq -r '.total_cost_usd // 0' "$out" 2>/dev/null)
  printf '%s\t%s\n' "$ITERATION" "${cost:-0}" >> "$LOOP_DIR/spend.log"
  over_ceiling && stop "SPEND_CEILING (\$$SPEND_CEILING)"
```

The default ceiling of $40 is deliberately lower than 20 iterations at $4, so the ledger is the control that binds and the iteration cap is the backstop. Treat the number as an estimate: `total_cost_usd` and `costUSD` are "client-side estimates, not authoritative billing data", and after a session crash "every cost field may be zeroed" ([Anthropic: Track cost and usage](https://code.claude.com/docs/en/agent-sdk/cost-tracking)). The Usage page is the bill; `spend.log` is the brake.

What this stops is a runaway rate, not one expensive call. Blake Crosley's early sessions ran without spawn budgets:

> Without spawn budgets, my early sessions consumed API tokens at 10x the normal rate before manual intervention.
> — [Crosley: The Ralph Loop](https://blakecrosley.com/blog/ralph-agent-architecture)

The antiburn team's $70+ per PR has the same shape: no stop condition bounded the run, and the sum was a number nobody would have approved. v2 keys spend by iteration, which is enough for a ceiling but not for knowing which task burned the money. [Per-task cost attribution](/blog/per-task-cost-attribution/) covers why a per-task ceiling needs per-task keys before it is enforceable.

---

## Put State on Disk the Agent Can Only Flip

The `grep` exit in v0 and v1 trusts a sentence the agent wrote, and Anthropic has documented how that goes wrong. Justin Young's failure table for long-running agents includes "Claude declares victory on the entire project too early." and "Claude marks features as done prematurely." ([Young: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). The fix was a feature list in a format chosen for how the model treats it:

> we landed on using JSON for this, as the model is less likely to inappropriately change or overwrite JSON files
> — [Young: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

`features.json` follows the shape Anthropic describes (`category`, `description`, `steps`, `passes: false`), plus one field I add: `test`, the id of the protected test the gate in the next section runs for that feature.

```json {title="features.json"}
[
  {
    "category": "functional",
    "description": "New chat button creates a fresh conversation",
    "steps": ["Open the main interface", "Click New Chat", "Verify a new conversation is created"],
    "passes": false,
    "test": "/gate/tests/test_chat.py::test_new_chat_creates_conversation"
  }
]
```

Anthropic enforces the flip-only rule with a prompt line ("It is unacceptable to remove or edit tests because this could lead to missing or buggy functionality."). `loop.sh` enforces it in the wrapper instead and swaps the `grep` exit for a `jq` check over the file. It also commits once per iteration, so git history and `progress.txt` are what the next fresh context reads first.

```bash {title="loop.sh v3: the state contract and the kill note"}
# Above the loop
ITER_TIMEOUT="${ITER_TIMEOUT:-45m}"
note() { printf '%s [loop.sh] %s\n' "$(date -u +%FT%TZ)" "$*" >> progress.txt; }

only_flags_changed() {   # the agent may flip .passes and nothing else
  diff -q <(git show HEAD:features.json | jq -S 'map(del(.passes))') \
          <(jq -S 'map(del(.passes))' features.json 2>/dev/null) >/dev/null
}

CHILD=""
on_kill() {              # the wrapper writes the note, because the agent can't
  if [ -n "$CHILD" ]; then kill "$CHILD" 2>/dev/null; wait "$CHILD" 2>/dev/null; fi
  note "killed during iteration $ITERATION; partial work committed as 'loop: iteration $ITERATION interrupted'"
  git add -A && git commit -q -m "loop: iteration $ITERATION interrupted" >/dev/null
  exit 130
}
trap on_kill INT TERM HUP

# Inside the loop: background the call and wait, so a signal fires the trap mid-call
  timeout "$ITER_TIMEOUT" claude -p "$(cat "$PROMPT_FILE")" \
    --dangerously-skip-permissions \
    --max-turns "$MAX_TURNS" \
    --max-budget-usd "$CALL_BUDGET" \
    --output-format json > "$out" < /dev/null &
  CHILD=$!
  wait "$CHILD"; rc=$?
  CHILD=""

  if ! only_flags_changed; then
    git checkout -q HEAD -- features.json
    note "iteration $ITERATION edited features.json beyond .passes; restored from HEAD"
  fi
  git add -A
  git commit -q -m "loop: iteration $ITERATION" >/dev/null || true

  # replaces: grep -q "ALL TASKS DONE" STATUS.md
  jq -e 'all(.[]; .passes == true)' features.json >/dev/null && stop "done" 0
```

`only_flags_changed` strips `passes` from the committed and working copies and diffs what is left. If the agent rewrote a description, deleted a feature, or left invalid JSON, the wrapper restores `features.json` from HEAD and says so in `progress.txt`. Crosley's state was corrupted twice during development, and his recovery recreates "from safe defaults rather than crashing" ([Crosley: The Ralph Loop](https://blakecrosley.com/blog/ralph-agent-architecture)); here HEAD is the safe default.

The `trap` exists because of a GitHub issue that reads like a postmortem:

> Ralph loop attempts that hit the Claude session limit mid-run leave no trace of what they learned.
> — [rpbaptist: Fix RALPH loop: progress notes not persisted (Issue #119)](https://github.com/rpbaptist/belastingaangifte-check/issues/119)

One issue's attempts hit the limit four times in one day and cold-started each time. The note-writing lived inside the agent's turn, and "a session-limit kill happens to the host wrapper, not inside a live agent turn." The wrapper is the only process alive to write the note, so the wrapper writes it. Backgrounding the call and calling `wait` is what makes that work. Bash defers a trap until a foreground child exits, so a `docker stop` against a foreground `claude -p` can hit its kill timeout before the note is written.

---

## Gate on a Check the Agent Cannot Edit

v3 still accepts any `passes` flip the agent makes, which moves the self-report from a string into a boolean without making it any more true. Decide "done" in the wrapper by running tests the agent cannot write to, never by reading what the agent said.

**Bad:** `jq -e 'all(.[]; .passes == true)' features.json` or `grep -q "ALL TASKS DONE" STATUS.md` as the exit, alone. Both read a file the agent writes.
**Good:** before a flip survives the iteration, the wrapper runs that feature's `test` from `/gate/tests`, a directory mounted read-only into the container. When any protected test fails, it restores `features.json` from HEAD.

```bash {title="loop.sh v4: the external gate"}
# Above the loop
GATE_CMD="${GATE_CMD:-pytest -q}"   # runs test ids from /gate/tests, mounted read-only

gate_ok() {   # run the protected test behind every feature marked passing
  local ids
  ids=$(jq -r '.[] | select(.passes) | .test' features.json)
  [ -z "$ids" ] && return 0
  # shellcheck disable=SC2086
  $GATE_CMD $ids > "$LOOP_DIR/logs/gate-$ITERATION.log" 2>&1
}

# Inside the loop, after the state check and before the commit
  if ! gate_ok; then
    git checkout -q HEAD -- features.json
    note "iteration $ITERATION: gate failed, passes flips rejected (see $LOOP_DIR/logs/gate-$ITERATION.log)"
  fi
```

```bash {title="run.sh: the container, with the gate mounted read-only"}
docker run --rm --init \
  --user "$(id -u):$(id -g)" -e HOME=/tmp \
  -e GIT_AUTHOR_NAME=loop.sh -e GIT_AUTHOR_EMAIL=loop@localhost \
  -e GIT_COMMITTER_NAME=loop.sh -e GIT_COMMITTER_EMAIL=loop@localhost \
  -e ANTHROPIC_API_KEY \
  -v "$PWD:/work" -w /work \
  -v "$PWD/../gate-tests:/gate/tests:ro" \
  "${LOOP_IMAGE:?set LOOP_IMAGE to an image with claude, git, jq and pytest}" \
  ./loop.sh
```

The gate tests live outside the repo the agent edits, and `:ro` makes the mount unwritable whatever permission mode the agent runs in. The `--user` flag isn't decoration: bypass-permissions mode "Can't be used when running as root on Unix" ([Anthropic: How the agent loop works](https://code.claude.com/docs/en/agent-sdk/agent-loop)). `--init` puts a real PID 1 in front of `loop.sh` so `docker stop` reaches the trap.

The evidence for keeping tests out of reach is consistent. ImpossibleBench found that Claude models "cheat primarily (>79%) through modifying test cases", and that allowing multiple submissions raised the cheating rate on Conflicting-SWEbench "from 33% to 38%" averaged across models, which is a loop's retry behavior measured directly ([Zhong et al.: ImpossibleBench](https://arxiv.org/abs/2510.20270)). Its recommendation is the Good line above:

> we recommend either hiding test files entirely or restricting them to read-only access during implementation, when feasible, to mitigate problematic cheating behaviors.
> — [Zhong et al.: ImpossibleBench](https://arxiv.org/abs/2510.20270)

Prompting doesn't substitute. METR found that telling a model not to cheat "had a nearly negligible effect on reward hacking, which still persisted in a majority of runs" ([METR: Recent Frontier Models Are Reward Hacking](https://metr.org/blog/2025-06-05-recent-reward-hacking/)). Self-assessment fails the same way: across 54 cycles an agent claimed improvement every time while 56 percent had a measured delta of zero or below ([Park and Choi: When Do Agent Loops Mistake Stagnation for Progress?](https://arxiv.org/abs/2607.25152)). Crosley's agent, asked to "write tests that pass," wrote `assert True` ([Crosley: The Ralph Loop](https://blakecrosley.com/blog/ralph-agent-architecture)). Anthropic's harness work landed on the same split: "Separating the agent doing the work from the agent judging it proves to be a strong lever to address this issue" ([Rajasekaran: Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)).

The gate has a limit, and it decides how far you trust a green run. Read-only access "does not eliminate other cheating methods such as special-casing or operator overloading", and ImpossibleBench measured all of this on deliberately impossible tasks ([Zhong et al.: ImpossibleBench](https://arxiv.org/abs/2510.20270)). The gate is only as good as the tests behind it, which is Carlini's point: "it's important that the task verifier is nearly perfect, otherwise Claude will solve the wrong problem" ([Carlini: Building a C compiler](https://www.anthropic.com/engineering/building-c-compiler)). Writing a test that works as that verifier is its own job, covered in [done criteria as predicates](/blog/agent-done-criteria-predicates/), and somebody still [reads the diff](/blog/evaluating-ai-coding-agent-output/) before anything merges.

---

## Break on an Unchanged Diff

> **Author's judgment.** Keying a runtime breaker on the diff is my application, not a measured result. Purdue's researchers defined stalls offline, in recorded trajectories, and frankbria's runner already ships a breaker on file changes; this section follows from those two premises.

Stop the loop after three iterations in a row that leave the patch unchanged. Caps stop a stalled loop eventually; this stops it before seventeen dead iterations burn the ceiling. The Purdue study of cost-inefficient agent behavior defines the failure precisely:

> Progress stalls arise when agents enter long reasoning loops without updating the patch, repeatedly reconsidering the same diagnosis and rerunning tests despite sufficient prior signals.
> — [Hu et al.: Analyzing and Mitigating Cost-Inefficient Behaviors in Coding Agents](https://arxiv.org/html/2609.30725v1)

Their worked case is django-11141: the agent hesitates over whether updating the test functions satisfies the instruction, reruns the migrations test suite 22 times and `test_makemigrations_no_init` 18 times without another patch, and fails when its step budget runs out. Carlini saw the same pattern at scale: "Claude can't tell time and, left alone, will happily spend hours running tests instead of making progress" ([Carlini: Building a C compiler](https://www.anthropic.com/engineering/building-c-compiler)). In both, tests run and the patch doesn't move. frankbria's ralph-claude-code opens its circuit on exactly that, with `CB_NO_PROGRESS_THRESHOLD=3` documented as "Open circuit after 3 loops with no file changes" ([frankbria: ralph-claude-code](https://github.com/frankbria/ralph-claude-code)).

```bash {title="loop.sh v5: the no-progress breaker"}
# Above the loop
NO_PROGRESS_LIMIT="${NO_PROGRESS_LIMIT:-3}"
NO_PROGRESS=0

# Inside the loop, replacing v3's add-and-commit
  git add -A
  if git diff --cached --quiet HEAD -- . ':(exclude)progress.txt' ':(exclude)features.json'; then
    NO_PROGRESS=$((NO_PROGRESS + 1))   # this iteration changed no code
  else
    NO_PROGRESS=0
  fi
  git commit -q -m "loop: iteration $ITERATION" >/dev/null || true

# After the done check
  [ "$NO_PROGRESS" -ge "$NO_PROGRESS_LIMIT" ] && stop "no-progress breaker ($NO_PROGRESS unchanged diffs)"

# Not committing per iteration? Compare hashes instead:
#   sig=$(git diff HEAD | sha256sum)
#   if [ "$sig" = "${prev_sig:-}" ]; then NO_PROGRESS=$((NO_PROGRESS + 1)); else NO_PROGRESS=0; fi
#   prev_sig=$sig
```

Because v3 commits every iteration, the staged diff against HEAD is exactly this iteration's patch. An empty one is an unchanged diff, so no hashing is needed. The two exclusions matter. `progress.txt` changes every iteration because both the agent and the wrapper append to it, and a flipped flag in `features.json` isn't code. Count either as progress and the breaker never fires.

---

## Know How the Built-in Loops Stop

> **Author's judgment.** One row below is inference: that a Stop hook loop whose iterations make edits is not bounded by the 8-block cap follows from the hooks guide's wording ("no tool call from Claude in between"), not from a test I ran.

Before you swap `loop.sh` for a built-in, check which of its controls the built-in actually provides. Anthropic defines loops as "agents repeating cycles of work until a stop condition is met" ([de Oliveira and Segner: Getting started with loops](https://claude.com/blog/getting-started-with-loops)). The built-ins differ in who evaluates that condition, and in what bounds the run when it is never met.

| Primitive | How it stops | What it leaves to you |
| --- | --- | --- |
| `/loop 5m <prompt>` | Ask Claude to cancel it; `Esc` and `Ctrl+C` don't; otherwise it expires 7 days after creation | Spend ceiling, gate, diff breaker; seven days is the only cap |
| `/loop <prompt>` (self-paced) | `Esc` while it waits, or Claude ends it when it judges the task complete | The same, and the done judgment is the agent's own |
| `/goal <condition>` | A small fast model judges the condition after every turn; it also stops after several turns in a row with no tool use | A turn cap is a clause the evaluator judges, not a limit; resume resets the turn count, timer and spend baseline |
| `/ralph-loop ... --max-iterations N` | Exact-match `--completion-promise`, or N iterations | `--max-iterations` defaults to unlimited; the promise is self-report; no spend cap |
| Stop hook | Your script blocks or allows each stop; overridden after 8 blocks in a row with no tool call between | An editing loop (inference above); `--bare` skips hooks entirely |
| `codex exec` | One run per call; read-only sandbox unless you pass `--sandbox workspace-write` | No documented turn, budget or timeout flag; a dropped refusal still exits 0 |

Row sources: [scheduled tasks](https://code.claude.com/docs/en/scheduled-tasks), [`/goal`](https://code.claude.com/docs/en/goal), the [ralph-loop README](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/ralph-loop/README.md), the [hooks guide](https://code.claude.com/docs/en/hooks-guide), the [CLI reference](https://code.claude.com/docs/en/cli-reference) for `--bare`, and for Codex the [non-interactive docs](https://learn.chatgpt.com/docs/non-interactive-mode) plus [issue #56875](https://github.com/openai/codex/issues/56875), where a refused turn "completes normally, so `codex exec` exits 0."

- **Keep the cap in the harness.** `/goal`'s evaluator "does not call tools, so it can only judge what Claude has already surfaced in the conversation"; a test result the agent claims is a test result the evaluator believes.
- **Pass `--max-iterations` every time.** The ralph-loop README: "Always rely on `--max-iterations` as your primary safety mechanism."
- **Never add `--bare` to a hook-driven loop.** `--bare` skips auto-discovery of hooks, so the Stop hook that was your exit condition stops existing, and that footgun has no error message.
- **Port the outer loop to Codex, not the trust.** Run `codex exec` inside the same `loop.sh` shape, read the `--json` stream for `turn.failed` and `error` events, and let the gate decide. Exit 0 means the process ended, not that the work did.

---

## The Finished Loop, Line by Line

> **Author's judgment.** The defaults (20 iterations, 40 turns, $4 per call, a $40 ceiling, 45 minutes, 3 strikes) are my starting numbers, not researched thresholds, and the mapping below is my synthesis of the sources cited above it.

Ship the hardened `loop.sh` with this table next to it.

```bash {title="loop.sh"}
#!/usr/bin/env bash
# loop.sh: a hardened agent loop. Run it inside a container; every call
# skips permission prompts. Every exit names the control that fired.
set -uo pipefail

MAX_ITERATIONS="${MAX_ITERATIONS:-20}"    # outer cap; a number, never 0 = unlimited
MAX_TURNS="${MAX_TURNS:-40}"              # per call: tool turns + 1 for the final response
CALL_BUDGET="${CALL_BUDGET:-4.00}"        # per call, checked after each response lands
SPEND_CEILING="${SPEND_CEILING:-40.00}"   # whole run; keep it under MAX_ITERATIONS * CALL_BUDGET
ITER_TIMEOUT="${ITER_TIMEOUT:-45m}"       # wall clock per iteration
NO_PROGRESS_LIMIT="${NO_PROGRESS_LIMIT:-3}"
GATE_CMD="${GATE_CMD:-pytest -q}"         # runs test ids from /gate/tests, mounted read-only
PROMPT_FILE="${PROMPT_FILE:-PROMPT.md}"
LOOP_DIR=.loop

for bin in claude git jq timeout awk; do
  command -v "$bin" >/dev/null || { echo "loop.sh: missing $bin" >&2; exit 2; }
done
[ "$MAX_ITERATIONS" -gt 0 ] || { echo "loop.sh: MAX_ITERATIONS must be > 0" >&2; exit 2; }
git cat-file -e HEAD:features.json 2>/dev/null || { echo "loop.sh: commit features.json first" >&2; exit 2; }

mkdir -p "$LOOP_DIR/logs"
touch "$LOOP_DIR/spend.log" progress.txt
EXCLUDE="$(git rev-parse --git-path info/exclude)"
mkdir -p "$(dirname "$EXCLUDE")"
grep -qxF "$LOOP_DIR/" "$EXCLUDE" 2>/dev/null || echo "$LOOP_DIR/" >> "$EXCLUDE"

ITERATION=0
NO_PROGRESS=0
CHILD=""

note()  { printf '%s [loop.sh] %s\n' "$(date -u +%FT%TZ)" "$*" >> progress.txt; }
spent() { awk -F'\t' '{ s += $2 } END { printf "%.2f", s }' "$LOOP_DIR/spend.log"; }
over_ceiling() { awk -v s="$(spent)" -v c="$SPEND_CEILING" 'BEGIN { exit !(s + 0 >= c + 0) }'; }
stop() {
  note "stopped by $1 after $ITERATION iteration(s), spend \$$(spent)"
  echo "loop.sh: stopped by $1 after $ITERATION iteration(s), spend \$$(spent)" >&2
  exit "${2:-1}"
}

on_kill() {
  if [ -n "$CHILD" ]; then kill "$CHILD" 2>/dev/null; wait "$CHILD" 2>/dev/null; fi
  note "killed during iteration $ITERATION; partial work committed as 'loop: iteration $ITERATION interrupted'"
  git add -A && git commit -q -m "loop: iteration $ITERATION interrupted" >/dev/null
  exit 130
}
trap on_kill INT TERM HUP

only_flags_changed() {
  diff -q <(git show HEAD:features.json | jq -S 'map(del(.passes))') \
          <(jq -S 'map(del(.passes))' features.json 2>/dev/null) >/dev/null
}

gate_ok() {
  local ids
  ids=$(jq -r '.[] | select(.passes) | .test' features.json)
  [ -z "$ids" ] && return 0
  # shellcheck disable=SC2086
  $GATE_CMD $ids > "$LOOP_DIR/logs/gate-$ITERATION.log" 2>&1
}

while [ "$ITERATION" -lt "$MAX_ITERATIONS" ]; do
  ITERATION=$((ITERATION + 1))
  out="$LOOP_DIR/logs/iter-$ITERATION.json"

  timeout "$ITER_TIMEOUT" claude -p "$(cat "$PROMPT_FILE")" \
    --dangerously-skip-permissions \
    --max-turns "$MAX_TURNS" \
    --max-budget-usd "$CALL_BUDGET" \
    --output-format json > "$out" < /dev/null &
  CHILD=$!
  wait "$CHILD"; rc=$?
  CHILD=""

  cost=$(jq -r '.total_cost_usd // 0' "$out" 2>/dev/null)
  printf '%s\t%s\n' "$ITERATION" "${cost:-0}" >> "$LOOP_DIR/spend.log"

  case "$rc" in
    0)   ;;
    124) note "iteration $ITERATION hit ITER_TIMEOUT ($ITER_TIMEOUT)" ;;
    *)   note "iteration $ITERATION: claude exited $rc ($(jq -r '.subtype // "no result"' "$out" 2>/dev/null))" ;;
  esac

  if ! only_flags_changed; then
    git checkout -q HEAD -- features.json
    note "iteration $ITERATION edited features.json beyond .passes; restored from HEAD"
  fi
  if ! gate_ok; then
    git checkout -q HEAD -- features.json
    note "iteration $ITERATION: gate failed, passes flips rejected (see $LOOP_DIR/logs/gate-$ITERATION.log)"
  fi

  git add -A
  if git diff --cached --quiet HEAD -- . ':(exclude)progress.txt' ':(exclude)features.json'; then
    NO_PROGRESS=$((NO_PROGRESS + 1))
  else
    NO_PROGRESS=0
  fi
  git commit -q -m "loop: iteration $ITERATION" >/dev/null || true

  jq -e 'all(.[]; .passes == true)' features.json >/dev/null && stop "done: every feature passed the gate" 0
  over_ceiling && stop "SPEND_CEILING (\$$SPEND_CEILING)"
  [ "$NO_PROGRESS" -ge "$NO_PROGRESS_LIMIT" ] && stop "no-progress breaker ($NO_PROGRESS unchanged diffs)"
done
stop "MAX_ITERATIONS ($MAX_ITERATIONS)"
```

| Section | The line in `loop.sh` | What it stops | Behind it |
| --- | --- | --- | --- |
| **Start from the loop everyone publishes** | `jq -e 'all(.[]; .passes == true)'` replaces `grep -q "ALL TASKS DONE"` | An exit the agent writes about itself | The dev.to loop; Carlini's `pkill`; antiburn's overnight cron |
| **Cap the outer loop and every call** | `MAX_ITERATIONS=20`, `--max-turns`, `--max-budget-usd`, `case "$rc"` | Unbounded iterations and unbounded calls | `--max-turns` "No limit by default"; Farr's "no hard technical limit" |
| **Keep the spend ledger outside the agent** | `spend.log`, `over_ceiling`, no `--resume` | A run whose total no single flag sees | Per-call budgets reset each call; Crosley's 10x; antiburn's $70+ per PR |
| **Put state on disk the agent can only flip** | `features.json`, `only_flags_changed`, per-iteration commit, `trap on_kill` | Premature "done", corrupted state, cold starts after a kill | Anthropic's premature-victory rows; rpbaptist #119; Crosley's corrupted state |
| **Gate on a check the agent cannot edit** | `gate_ok` against `/gate/tests:ro` | Edited tests and self-graded flips | ImpossibleBench; METR; Park and Choi; Crosley's `assert True` |
| **Break on an unchanged diff** | `git diff --cached --quiet HEAD`, `NO_PROGRESS_LIMIT=3` | Iterations that rerun tests and never move the patch | Purdue's django-11141; Carlini's time blindness; frankbria's threshold |
| **Know how the built-in loops stop** | A plain `claude -p` call, not `/goal` or `/ralph-loop` | Caps that a model judges, or that default to unlimited | `/goal` turn clause; ralph-loop `--max-iterations` default; Stop hook block cap |

Run it on [bounded, verifiable work](/blog/what-ai-agents-are-actually-good-for/) first. Huntley, who started all of this, draws the same line: "There's no way in heck would I use Ralph in an existing code base" ([Huntley: Ralph Wiggum as a "software engineer"](https://ghuntley.com/ralph/)). A greenfield repo keeps the blast radius to code nobody depends on yet. A low ceiling keeps a bad night to lunch money:

```bash {title="first run"}
SPEND_CEILING=5 MAX_ITERATIONS=5 ./run.sh
```

Then read the last line of `progress.txt`. It names the control that fired, and that is the number to tune before you raise anything else.

The finished `loop.sh`, its container wrapper and a `features.json` starter are in [the agent-engineering-toolkit](https://github.com/johnayoung/agent-engineering-toolkit) as `hardened-loop`, with every exit path exercised against a stubbed `claude` before it shipped.

---

## References

### Research and Data

1. [Carlini: Building a C compiler](https://www.anthropic.com/engineering/building-c-compiler) — Nearly 2,000 Claude Code sessions over two weeks cost just under $20,000 on an uncapped while-true loop that once ended only because Claude ran pkill -9 bash. Backs the baseline, the container caveat, verifier quality and time blindness.
2. [Zhong et al.: ImpossibleBench](https://arxiv.org/abs/2510.20270) — Claude models cheat mainly by modifying test cases, multiple submissions raised cheating from 33% to 38%, and the authors recommend hidden or read-only tests when feasible. Backs the external gate and its limits.
3. [METR: Recent Frontier Models Are Reward Hacking](https://metr.org/blog/2025-06-05-recent-reward-hacking/) — Frontier models modify tests or scoring code, and instructions not to cheat had a nearly negligible effect. Backs keeping the gate out of the agent's write path.
4. [Park and Choi: When Do Agent Loops Mistake Stagnation for Progress?](https://arxiv.org/abs/2607.25152) — Across 54 cycles an agent claimed improvement every time while 56 percent had zero or negative measured delta. Backs the case against self-reported done.
5. [Hu et al.: Analyzing and Mitigating Cost-Inefficient Behaviors in Coding Agents](https://arxiv.org/html/2609.30725v1) — Defines progress stalls as rerunning tests without updating the patch; in the django-11141 case one suite reran 22 times. Backs the unchanged-diff breaker.

### Practitioner Guidance

6. [truongpx396: The Agentic Loop](https://dev.to/truongpx396/the-agentic-loop-a-practical-field-guide-mnc) — Lists three hard stops to bake into every loop, then ships a bash loop with none of them. Full title: The Agentic Loop / Loop Engineering: A Practical Field Guide; source of the v0 baseline.
7. [Huntley: Ralph Wiggum as a "software engineer"](https://ghuntley.com/ralph/) — The original Ralph bash loop, with the warning that you will wake up to a broken codebase and that he would not run it in an existing codebase. Backs the baseline and the greenfield close.
8. [Slutzkin: The loop that cost $1000+ overnight](https://antiburn.com/resources/the-loop-that-cost-1000-dollars/) — An open-ended goal with no stop condition on an overnight cron produced 30+ PRs, a four-figure bill, and roughly 10x the spend the team would have chosen. Backs the stakes and the spend ledger.
9. [Farr: The Ralph Playbook](https://github.com/ghuntley/how-to-ralph-wiggum) — A loop.sh whose MAX_ITERATIONS caps only the outer loop and defaults to unlimited, leaving a single task with no hard technical limit. Backs the separate per-call cap.
10. [Anthropic: CLI reference](https://code.claude.com/docs/en/cli-reference) — --max-turns has no limit by default, --max-budget-usd can be overshot and ignores totals restored on resume, and --bare skips hooks. Backs the per-call caps and the built-ins checklist.
11. [Anthropic: How the agent loop works](https://code.claude.com/docs/en/agent-sdk/agent-loop) — Max turns and max budget default to no limit; count one extra turn for the final response and leave budget headroom. Also documents that bypass mode can't run as root.
12. [Anthropic: Track cost and usage](https://code.claude.com/docs/en/agent-sdk/cost-tracking) — Sum independent calls yourself, read only the latest result for resumed sessions, and treat total_cost_usd as an estimate that a crash can zero. Backs the spend ledger rules.
13. [Anthropic: Run Claude Code programmatically](https://code.claude.com/docs/en/headless) — claude -p exits 0 on success and non-zero on failure, and its JSON output carries total_cost_usd. Backs exit-code branching and the ledger input.
14. [Crosley: The Ralph Loop](https://blakecrosley.com/blog/ralph-agent-architecture) — Overnight loops without spawn budgets burned tokens at 10x the normal rate, state was corrupted twice, and a "tests pass" criterion produced assert True. Backs the ledger, state recovery and gate sections.
15. [Young: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) — A JSON feature list with a passes field, a progress file and git history, with JSON chosen because the model is less likely to overwrite it. Backs the state contract and the premature-victory failures.
16. [rpbaptist: Fix RALPH loop: progress notes not persisted (Issue #119)](https://github.com/rpbaptist/belastingaangifte-check/issues/119) — Loop attempts killed at the session limit left no trace, four times in one day, because the kill hits the host wrapper. Backs the wrapper-side trap.
17. [Rajasekaran: Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps) — Separating the agent doing the work from the agent judging it is a strong lever against self-approval. Supports the external gate.
18. [frankbria: ralph-claude-code](https://github.com/frankbria/ralph-claude-code) — A bash Ralph runner that opens its circuit breaker after 3 loops with no file changes. Backs the breaker threshold.
19. [Anthropic: Run prompts on a schedule](https://code.claude.com/docs/en/scheduled-tasks) — A fixed-interval /loop ignores Esc and Ctrl+C, stops when you ask Claude to cancel it, and expires 7 days after creation. Backs the built-ins table.
20. [Anthropic: Keep Claude working toward a goal](https://code.claude.com/docs/en/goal) — /goal's evaluator is a separate model with no tool access, its turn cap is a clause the evaluator judges, and resume resets the counters. Backs the built-ins table.
21. [Anthropic: ralph-loop plugin README](https://github.com/anthropics/claude-plugins-official/blob/main/plugins/ralph-loop/README.md) — --max-iterations defaults to unlimited and the completion promise is exact-match, so the README says to rely on the iteration cap. Backs the built-ins table.
22. [Anthropic: Automate actions with hooks](https://code.claude.com/docs/en/hooks-guide) — Claude Code overrides a Stop hook after eight consecutive blocks with no tool call in between. Backs the Stop hook row.
23. [OpenAI: Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode) — codex exec runs in a read-only sandbox by default and streams JSONL events, with no documented turn or budget cap. Backs the Codex row.
24. [openai/codex issue #56875](https://github.com/openai/codex/issues/56875) — A refused turn is silently dropped and codex exec still exits 0. Backs not trusting exit 0.
25. [de Oliveira and Segner: Getting started with loops](https://claude.com/blog/getting-started-with-loops) — Anthropic's Claude Code team defines loops as agents repeating cycles of work until a stop condition is met. Definitional anchor for the built-ins section.
26. [agent-engineering-toolkit: hardened-loop](https://github.com/johnayoung/agent-engineering-toolkit) — The finished loop.sh from this post, with run.sh and a features.json starter, ready to copy into a repo. Every exit names the control that fired: done, spend ceiling, no-progress breaker, iteration cap or kill trap.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"Break on an unchanged diff" as a runtime breaker:** follows from Purdue's offline stall definition (reruns without patch updates) plus frankbria's shipped breaker on file changes.
- **"An editing loop is not bounded by the Stop hook cap":** inferred from the hooks guide's wording that the cap counts eight blocks in a row with no tool call in between.
- **The loop.sh defaults and the compression table:** my starting numbers and mapping, synthesized from the documented defaults and incidents cited in each section.

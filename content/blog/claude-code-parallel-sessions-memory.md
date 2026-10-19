---
title: "Claude Code Memory Usage: How Many Sessions Fit on One Machine"
date: 2026-10-19
draft: false
pillar: production-operations
author: "John Young"
description: "Claude Code memory usage, measured: three sessions ran 32 processes and MCP servers outweighed Claude in two. A RAM budget for running sessions in parallel."
keywords: ["claude code memory usage", "parallel Claude Code sessions", "MCP server memory", "cgroup memory limits", "PSS vs RSS"]
tldr:
  - "How many Claude Code sessions fit on one machine depends less on the `claude` binary than on everything each session drags along: on my workstation, three sessions ran 32 processes, only three were Claude, and MCP servers outweighed Claude in two of them."
  - "Measure each session as its whole process tree in PSS (or the cgroup's `memory.peak`), not summed RSS or VSZ, then cut the multiplier before buying RAM by trimming servers, dropping `npx`, and sharing stateless servers over HTTP."
  - "My trees stayed flat across a 20-minute log, which says nothing about hour four, so fence each session in its own cgroup with `MemoryHigh` and `MemoryMax` and size with (ceiling minus headroom) divided by measured peak tree PSS, where the 25% headroom is my own judgment."
---
{{< eli5 hint="no background needed · 7 min" audience="for readers outside AI engineering" >}}
This is about what happens to a computer's working memory when you run several AI coding assistants side by side, and how to plan for it.

## The big idea

When you open an AI coding assistant, you think you are starting one program. You are actually starting a small crowd. It is like hiring one contractor who shows up with a van full of specialists, each with their own toolbox. Count only the contractor and you will badly underestimate how much room you need on the job site.

The author counted the programs running behind three assistant windows on his own workstation. There were 32 of them, and only three were the assistant itself. In two of the three windows, the add-on helpers used more memory than the assistant did. So how many windows one computer can hold depends less on the assistant and more on everything it brings along. To plan well, you need to measure the whole crowd fairly, check it at its worst moment, and put a fence around each window so one runaway can't take down the rest.

Note that "memory" here means the computer's working memory (RAM), the space that fills up and makes programs get shut down. It does not mean the assistant's feature for remembering notes between chats.

## Count the whole crowd, not just the windows

Each assistant window starts its own copy of every add-on helper you have set up. Three windows with four helpers each means twelve helpers, not four. The helpers are not shared by default, even when they do the same job. The author's helpers for browsing and for deployment tools each showed up as several separate copies.

Two things make the crowd bigger. A teammate assistant that one window spawns counts as a full extra window with its own helpers. And some helpers keep running after you close the window that started them, so count again after closing things, not just while they run.

## Measure fairly: don't count shared stuff twice

Programs often share the same underlying pieces. The usual way of adding up memory charges each program for the whole shared piece, like splitting a restaurant bill by giving every diner the full price of the shared appetizer. On the author's machine, that made the total look about 62% bigger than it really was. A fairer method splits each shared piece among the programs that use it.

There is an even worse number. One widely repeated horror story said an assistant "consumed 129GB." That figure was the space a program had reserved on paper, not memory it was actually using. The same report showed it was really using about 415 MB. Reserving a seat is not the same as sitting in it.

## Trim the extras before buying more memory

Every helper you remove from your setup is removed from every window, so cutting helpers is the cheapest fix. Some ways to do it:

- Keep only the helpers a given project needs.
- Skip a launcher that quietly starts a second program just to start the first. On the author's machine, each helper started that way cost two programs of about 100 MB each, and roughly half of that was the launcher doing no useful work. That half is the author's measurement; the fix of installing the helper directly is his inference, so he checks the program list afterward.
- Share helpers that don't keep per-window state, by running one copy that all windows talk to. One person cut from 172 programs to about 33 this way. The catch: if any one shared helper fails to start, the whole shared setup can go down with it. The author shares only helpers that hold no private state, and keeps the web browser helper separate per window, because each window drives its own browser.

One trap worth knowing: a feature that makes helpers cheaper for the assistant's *thinking space* does not make them cheaper for the computer's memory. The helpers still run. It saves one kind of room, not the other.

## Plan for the worst moment, not the start

A window's size at startup is a floor, not a budget. The author sampled his three windows every five minutes, but the run was cut short by a restart, so he only has about 20 minutes of data. In that time the windows stayed roughly flat; the biggest one rose by 63 MB and then gave most of it back. That is all 20 minutes can say. It says nothing about what happens at hour four.

For longer stretches, the evidence comes from other people's bug reports, and it is worse: sessions that grew from under a gigabyte to many gigabytes and got killed. The maker has been fixing these one release at a time, so which version you run matters. The maker also shows a warning when a window gets too big. The advice is to restart the window and pick the conversation back up when you see it, and to restart between big tasks anyway.

## Put a fence around each window

Without a fence, all windows draw from one shared pool, and one runaway window can freeze the whole machine. On Linux, you can give each window its own memory limit with two settings: a soft one that slows it down when it gets greedy, and a hard one that is the last resort. Then a leak costs you one window, and that window can be resumed.

Two honest limits. First, a fence protects the computer, not the window; the greedy window still gets shut down. Second, Macs don't have this fencing tool, so on a Mac the options are fewer helpers and fewer windows.

The same math works for automated runs on a build server. Run them in a stripped-down mode so they only start the helpers you listed, put a hard memory cap on each, and record how much each run actually used. The author's claim that the stripped-down mode saves memory is an inference from his measurements, not something the maker states.

## The sizing rule

Maximum windows is roughly: (total memory, minus a cushion) divided by the worst size one window reaches.

The cushion, about a quarter of the memory, is the author's own rule of thumb, not a sourced figure. On his machine, the math gives about 119 windows if every window stays as small as it did in his 20-minute sample, but only about 12 if every window hit its hard limit at once. The gap between those numbers is the whole point. The true answer sits in between, and the fences are what make running well past 12 a reasonable bet. For most teams, though, memory is not the real limit. The number of changes a human can review limits useful parallel work long before the computer does.

## What this means for you

- Before you plan, list every program each window starts, not just the window.
- Measure with the fair method, and look at the worst moment, not the average.
- Trim helpers first. It is cheaper than more memory.
- Fence each window if your system allows it, and restart long-running windows rather than hoping.
- Re-measure after you change your helpers or update the assistant, because both change the answer.
- Remember that this author's own direct measurements cover about 20 minutes. Treat his numbers as a method to copy, not figures to rely on.

---

**The technical terms, in plain words**
- Claude Code = an AI assistant for writing software that runs on your own computer
- session = one open working window with the assistant
- process = one running program; a single session is really many of them
- MCP server = an add-on helper that gives the assistant extra abilities, such as controlling a web browser
- stdio server = a helper that each window starts as its own private copy on your machine
- RAM = the computer's working memory, which fills up and causes shutdowns
- RSS = the usual way of counting a program's memory, which counts shared pieces in full for every program using them
- PSS = the fairer count that splits each shared piece among the programs sharing it
- VSZ = space a program has reserved on paper, not memory it is actually using
- cgroup = a Linux fence that limits how much memory a group of programs can use
- OOM killer = the system step that shuts a program down when memory runs out
- npx = a launcher that starts a helper by first starting a second program
- proxy = one shared middleman that many windows connect to, so helpers run once
- heap = the part of a program's memory it uses while working
- teammate = an extra assistant a window can spawn, which counts as a full extra session
- CI = an automated build server that runs checks without a person watching
- WSL2 = a way of running Linux inside Windows, in its own small virtual computer

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}

I counted the processes behind three Claude Code sessions on my workstation: 32 of them, and only three were Claude. In two of the three sessions, the MCP servers I had configured used more memory than Claude did. Memory here means RAM, the resident kind that fills a host and gets sessions OOM-killed, not the CLAUDE.md feature that shares the name. How many sessions one machine can hold depends less on the `claude` binary than on everything each session drags along with it. That means measuring the whole tree correctly, at its worst moment, inside a fence that keeps one bad session from taking down the rest.

---

## Count Processes, Not Sessions

A Claude Code session is not one process. It is a tree: the `claude` binary, every stdio MCP server it launched, and anything those servers launched in turn. With stdio servers, N sessions times M servers is the number that fills RAM. List the tree for each session before you budget a single megabyte.

Here is that list at 10:42 on October 19, 2026. The host is a WSL2 VM on a 128 GB Windows box running Claude Code 2.1.303, with three interactive sessions open side by side.

| Session | Age | Processes | `claude` RSS | MCP children RSS | MCP share of the tree |
|---|---|---|---|---|---|
| A | 15 min | 8 | 515 MB | 301 MB | 37% |
| B | 10 min | 11 | 326 MB | 694 MB | 68% |
| C | 3 min | 13 | 396 MB | 710 MB | 64% |

Session A runs two MCP servers: proto-mcp, a Go binary at about 75 MB, and playwright-mcp. Sessions B and C add cloud-run-mcp and gitbook-mcp, which pushes their servers past the agent by roughly two to one. Across the host that is three copies of playwright-mcp, three of proto-mcp, two of cloud-run-mcp, and two of gitbook-mcp. Each is a separate process with its own heap, doing the same job as its twins. (`ps --ppid <claude-pid> -o pid,rss,args` gives you the same view of a session's direct children on your own machine.)

This is the documented design, not a quirk of my config. Claude Code's MCP docs state that "Stdio servers run as local processes on your machine" ([Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp)). The protocol defines stdio as the transport where "The client launches the MCP server as a subprocess" ([MCP Spec: Transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)). Every session is its own client, so every session launches its own copy. Claude Code does deduplicate, but only inside one session. When a server is defined in more than one place, it "connects to it once, using the definition from the highest-precedence source" ([Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp)).

Other people's hosts show the same shape at larger N. One user filed the expected count as "4 sessions with 6 MCP servers should spawn 6 MCP processes total, not 42" ([JotaNikkan-pro: #28860](https://github.com/anthropics/claude-code/issues/28860)). A report from October puts the desktop app at roughly 10 GB of duplicate server processes across ten sessions ([lrgibs01: #99831](https://github.com/anthropics/claude-code/issues/99831)). At the far end:

> With N sessions and M configured MCP servers, the system spawns up to N×M node processes with no memory cap. On a 64 GB MacBook Pro, 15 concurrent sessions with 34 configured MCP servers caused a hardware watchdog kernel panic twice in one evening.
> — [TweedBeetle: #45880](https://github.com/anthropics/claude-code/issues/45880)

Two things push the count past N times M. [Agent teammates are not lightweight](/blog/agent-architecture-review-capacity/): "Each teammate is a full, independent Claude Code session." Each one loads "CLAUDE.md, MCP servers, and skills" when it spawns ([Claude Code Docs: Agent teams](https://code.claude.com/docs/en/agent-teams)), so a lead with three teammates carries four sessions' worth of servers. Stdio servers can also outlast their parent; the environment variable reference calls them "long-lived and outlive the session that spawned them" ([Claude Code Docs: Environment variables](https://code.claude.com/docs/en/env-vars)). Count again after you close a session, not only while it runs. The token cost of splitting work across agents is its own budget ([multi-agent context isolation](/blog/multi-agent-context-isolation/)); this post is the host-RAM side of the same decision.

---

## Measure the Session Tree in PSS

Summing RSS across a session's processes gives you a number that is too big. Reading VSZ gives you a number that is not memory at all. Measure each session as its whole process tree in proportional set size, or read its cgroup's `memory.peak`, and nothing else.

PSS is the kernel's answer to shared pages:

> The “proportional set size” (PSS) of a process is the count of pages it has in memory, where each page is divided by the number of processes sharing it.
> — [Linux kernel docs: The /proc Filesystem](https://docs.kernel.org/filesystems/proc.html)

RSS charges every process the full cost of every page it maps. A dozen node processes sharing one runtime each get billed for all of it. On my three sessions the gap is not a rounding error. Summed tree RSS is 2,943 MB against 1,815 MB of PSS, so RSS overstates the real footprint by about 62%. Shyam Verma hit the same wall measuring his own MCP fleet: "RSS overstates actual memory usage because it double-counts shared pages between processes" ([Shyam Verma: My MCP Servers Were Eating 3 GB of RAM](https://readybytes.in/blog/shared-mcp-servers-claude-code)). Budget in RSS and you under-pack the machine by more than a third.

VSZ is worse. The most-cited Claude Code memory headline, a session that "Consumed 129GB RAM," traces to `VmPeak: 135508316 kB` in the report ([nenrightld-ux: #11315](https://github.com/anthropics/claude-code/issues/11315)). The same report's `VmRSS` was 425416 kB, about 415 MB actually resident. VmPeak and VSZ count address space. A runtime can reserve far more than it ever touches, and none of that reservation competes with your other sessions.

Every number here comes from walking each `claude` process's descendants and summing two fields from `smaps_rollup`. That file carries "the same fields as /proc/PID/smaps" summed across every mapping of the process ([Linux kernel docs: The /proc Filesystem](https://docs.kernel.org/filesystems/proc.html)):

```bash {title="session-tree.sh: per-session tree RSS and PSS"}
#!/usr/bin/env bash
# One line per top-level claude session: process count, tree RSS, tree PSS (MB).
set -u

descendants() {
  local pid=$1 child
  echo "$pid"
  for child in $(pgrep -P "$pid"); do descendants "$child"; done
}

for root in $(pgrep -x claude); do
  parent=$(ps -o ppid= -p "$root" | tr -d ' ')
  # skip claude processes whose parent is also claude (split-pane teammates)
  [ "$(ps -o comm= -p "$parent" 2>/dev/null)" = claude ] && continue
  rss=0; pss=0; n=0
  for p in $(descendants "$root"); do
    f=/proc/$p/smaps_rollup
    [ -r "$f" ] || continue
    read -r r s < <(awk '/^Rss:/{r=$2} /^Pss:/{s=$2} END{print r+0, s+0}' "$f")
    rss=$((rss + r)); pss=$((pss + s)); n=$((n + 1))
  done
  printf 'pid=%s procs=%d tree_rss_mb=%d tree_pss_mb=%d\n' \
    "$root" "$n" $((rss / 1024)) $((pss / 1024))
done
```

The log behind this post's tables records those tree sums every five minutes, with the `claude` process and its MCP children broken out separately.

On Linux there is a second instrument that needs no script. Once a session runs in its own cgroup (the fence section below sets that up), the kernel keeps the tree's total for you. `memory.current` is "The total amount of memory currently being used by the cgroup and its descendants." `memory.peak` is "The max memory usage recorded for the cgroup and its descendants" ([Tejun Heo: Control Group v2](https://docs.kernel.org/admin-guide/cgroup-v2.html)). Peak is the one you want, because it remembers the worst moment you were not watching. It is the same discipline as [per-task cost attribution](/blog/per-task-cost-attribution/), measure per unit and then cap, applied to megabytes instead of dollars.

---

## Cut the Multiplier Before You Buy RAM

Every server you remove from a session's config is removed once per session. That makes M the cheapest lever in the whole budget: shrink it before you cap N, and long before you price out more RAM.

**Bad:** the MCP set sessions B and C load, written as one config for comparison.

```json
{
  "mcpServers": {
    "proto":      { "command": "proto-mcp" },
    "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp"] },
    "cloud-run":  { "command": "npx", "args": ["-y", "@google-cloud/cloud-run-mcp"] },
    "gitbook":    { "command": "npx", "args": ["-y", "gitbook-mcp"] }
  }
}
```

**Good:** the same work, trimmed, launched without npx, and shared.

```json
{
  "mcpServers": {
    "proto":      { "command": "proto-mcp" },
    "playwright": { "command": "playwright-mcp" },
    "gitbook":    { "type": "http", "url": "http://localhost:9800/servers/gitbook/mcp" }
  }
}
```

Three moves separate them. Cloud-run-mcp leaves this config and lives only in the `.mcp.json` of the repo that deploys. For servers you can't remove from a shared config, `disabledMcpServers` is the documented opt-out list. `--strict-mcp-config` goes further and makes a session use "only the MCP servers you pass with `--mcp-config`" ([Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp)). Playwright-mcp gets installed once with `npm install -g @playwright/mcp` and launched by `playwright-mcp`, the binary name the package's `bin` field declares ([Microsoft: playwright-mcp package.json](https://github.com/microsoft/playwright-mcp/blob/main/package.json)). Gitbook-mcp runs once behind a local proxy, and every session reaches it over HTTP.

The npx move matters more than it looks. On my host, every server configured as `npx <pkg>` shows up as two node processes of roughly 100 MB each. One is the resident `npm exec` wrapper and the other is the server itself. proto-mcp, configured as a direct binary, shows up as one. Roughly half of each npx server's footprint is npm, doing no MCP work at all. The per-server table in #28860 records the same pair as "2 (npm + node)" ([JotaNikkan-pro: #28860](https://github.com/anthropics/claude-code/issues/28860)). Verma found that "npx-based servers spawn a wrapper process too" ([Shyam Verma: My MCP Servers Were Eating 3 GB of RAM](https://readybytes.in/blog/shared-mcp-servers-claude-code)). After the change, run `ps --ppid` on the session again. If playwright still shows two processes, something in your launch path is still going through npm.

Sharing is the bigger cut, and it comes with a footgun. The protocol's HTTP transport is built for it: "the server operates as an independent process that can handle multiple client connections" ([MCP Spec: Transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)). Verma's seven sessions ran 172 processes. He moved five of their servers behind one proxy, `mcp-proxy --named-server-config ~/.mcp/mcp-proxy-config.json --port 9800 --pass-environment`. With that one instance he "got that number down to about 33 processes and under 1 GB" ([Shyam Verma: My MCP Servers Were Eating 3 GB of RAM](https://readybytes.in/blog/shared-mcp-servers-claude-code)). The footgun is the proxy's blast radius. "If ANY server in your config fails to initialize, the entire proxy crashes, taking every other server down with it." His own threshold for when the setup pays off is "4+ concurrent sessions with 3+ MCP servers each." I share only servers that hold no per-session state, and I keep playwright per session because each session drives its own browser.

Subagents face the same choice in miniature. A subagent definition can define an MCP server inline or reference one by name. Inline servers "are connected when the subagent starts" and disconnected when it finishes, while "String references share the parent session's connection" ([Claude Code Docs: Subagents](https://code.claude.com/docs/en/sub-agents)). Reference by name. Last, resist [declaring every server at user scope](/blog/claude-md-context-hierarchy/) just so it is always there. #99831 names the trap and its cause: there is no way to start a stdio server mid-session. "So the only way to have a server available when you need it is to declare it globally, which makes every session pay for it" ([lrgibs01: #99831](https://github.com/anthropics/claude-code/issues/99831)).

### Context-Cheap Is Not RAM-Cheap

MCP tool search does not save memory, and it is easy to read `/context` and assume it does. Tool search "keeps MCP context usage low by deferring tool definitions until Claude needs them." The docs conclude that "adding more MCP servers has minimal impact on your context window" ([Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp)). That is [a fix for context burn](/blog/jit-context-retrieval-failure/), not for resident memory. The server processes still start; the same page notes that servers "connect in the background by default." A session with twelve servers and tool search on has a small context window footprint and twelve resident processes. The kernel only counts the second number.

---

## Budget for the Session's Peak, Not Its Start

A session's footprint at startup is a floor, not a budget. Plan against the worst it reaches over its working life, and rotate it before it gets there.

I ran the tree sampler every five minutes across the same three sessions. A host restart cut the run short, so the usable log covers 20 minutes, 10:42 to 11:02. Across that window the sessions were between 3 and 35 minutes old:

| Session | Tree PSS at 10:42 | Peak in the window | Tree PSS at 11:02 |
|---|---|---|---|
| A | 579 MB | 579 MB (10:42) | 550 MB |
| B | 578 MB | 641 MB (10:57) | 597 MB |
| C | 658 MB | 659 MB (10:47) | 602 MB |

Flat to slightly declining. B climbed 63 MB over fifteen minutes and gave most of it back, and the three-session total went from 1,815 MB to 1,749 MB. On Claude Code 2.1.303, none of the three trees crept anywhere between 3 and 35 minutes of session age. That is everything a 20-minute window can say, and it says nothing about hour four.

For the long horizon, the record is the issue tracker. On WSL2 and v2.1.143, one user saw "RSS grew from ~900 MB to 12.6 GB in ~12 minutes of normal interactive use" ([anthropics/claude-code #4953](https://github.com/anthropics/claude-code/issues/4953)). Another session grew "to 7.6 GiB RSS (98 GiB virtual) before being killed by the Linux OOM killer" ([jc90069: #18011](https://github.com/anthropics/claude-code/issues/18011)). Anthropic has been closing these one release at a time. Version 2.1.208 "Fixed several memory leaks in long sessions," and 2.1.238 fixed "unbounded memory growth in long interactive sessions." Version 2.1.243 cut roughly 40 to 70 MB per session and made the runtime garbage-collect sooner as the heap grows ([Claude Code Docs: Changelog](https://code.claude.com/docs/en/changelog)). The CLI version you pin is a capacity setting, not just a feature choice.

The vendor's own tripwire is a heap threshold:

> If a session's heap memory passes 2.5GB, a critical memory usage warning appears. To free the memory, restart Claude Code and run `claude --continue` to resume the conversation in a fresh process.
> — [Claude Code Docs: Troubleshooting](https://code.claude.com/docs/en/troubleshooting)

That 2.5 GB is JavaScript heap, not the session tree, so it can't be your budget unit, but it is a good signal. The same page's list also names the habit that prevents most of this: "Close and restart Claude Code between major tasks." A kitchen sink session that runs all day is the one you have no measurement for. Turn the warning and your own numbers into rules:

| When you see | Do |
|---|---|
| **The critical memory warning** (heap past 2.5 GB) | Run `/compact` if you are outside fullscreen rendering; otherwise exit and run `claude --continue` in a fresh process |
| **Fullscreen rendering in a long conversation** | Don't count on `/compact`, which the docs say frees memory only outside fullscreen; fullscreen (`CLAUDE_CODE_NO_FLICKER=1`) is itself described as keeping "memory flat in long conversations" ([Claude Code Docs: Environment variables](https://code.claude.com/docs/en/env-vars)) |
| **Tree PSS past your per-session budget** (from `session-tree.sh` or `memory.peak`) | Rotate: exit and run `claude --continue`, even with no warning on screen |
| **`claude --version` older than 2.1.243** | Upgrade and pin; older builds are missing some of the long-session leak fixes |
| **A session killed by its fence** | Run `claude --resume`; the session id survives the kill |

The last row is what makes a hard limit livable. As one #4953 commenter put it, "Since `--resume` restores the session (session id survives), a hard kill is recoverable" ([anthropics/claude-code #4953](https://github.com/anthropics/claude-code/issues/4953)).

---

## Fence Every Session in Its Own Cgroup

Without a fence, every session on a host draws from one pool, and one runaway session freezes the machine with all its neighbors on it. On Linux and WSL, put each session in its own cgroup, with `MemoryHigh` as the throttle and `MemoryMax` as the backstop. The blast radius of a leak is then one session you can resume.

> It is recommended to use `MemoryHigh=` as the main control mechanism and use `MemoryMax=` as the last line of defense.
> — [systemd: systemd.resource-control](https://www.freedesktop.org/software/systemd/man/latest/systemd.resource-control.html)

The kernel semantics are why that order works. "Going over the high limit never invokes the OOM killer"; it throttles and reclaims instead, while `memory.max` is the "Memory usage hard limit" ([Tejun Heo: Control Group v2](https://docs.kernel.org/admin-guide/cgroup-v2.html)). `systemd-run` builds the cgroup on demand. `--user` talks to "the service manager of the calling user," and `--scope` creates "a transient `.scope` unit instead of the default transient `.service` unit" ([systemd: systemd-run](https://www.freedesktop.org/software/systemd/man/latest/systemd-run.html)).

```bash {title="One fenced Claude Code session per scope (Linux, or WSL with systemd)"}
# 0. WSL only: systemd must be on. Add to /etc/wsl.conf, then `wsl --shutdown` from Windows:
#      [boot]
#      systemd=true

# 1. Check that your user manager can set memory limits ("memory" must be listed).
cat "/sys/fs/cgroup/user.slice/user-$(id -u).slice/user@$(id -u).service/cgroup.controllers"

# 2. Launch every session in its own transient scope.
claude() {
  systemd-run --user --scope -q --unit="claude-$$" \
    -p MemoryHigh=4G -p MemoryMax=6G \
    "$(type -P claude)" "$@"
}

# 3. Cap what the session spawns: shells, builds, MCP servers, teammates.
export CLAUDE_CODE_TOOL_MEMORY_LIMIT=3G
export CLAUDE_CODE_TOOL_MEMORY_CGROUP_EXCLUDE=none

# 4. From another terminal: read the session's peak (<pid> is the launching shell's PID).
cg=$(systemctl --user show -p ControlGroup --value "claude-<pid>.scope")
cat "/sys/fs/cgroup$cg/memory.peak"
```

Step 2 adapts the wrapper from #4953 ([anthropics/claude-code #4953](https://github.com/anthropics/claude-code/issues/4953)). The wrapper's author used 16G and 24G. I use 4G and 6G because my measured trees sit around 0.6 GB. I also want room above the 2.5 GB heap warning before the throttle bites. These are my starting values, not a vendor recommendation. Step 4 is the cgroup instrument from the measurement section, now pointed at a real scope.

Step 3 is the vendor's own fence, and it is narrower than it looks. `CLAUDE_CODE_TOOL_MEMORY_LIMIT` caps Bash, PowerShell, and Monitor commands "so one runaway build can't take the memory the rest of the session needs." Setting `CLAUDE_CODE_TOOL_MEMORY_CGROUP_EXCLUDE=none` extends that one cap to local MCP servers, language servers, hooks (except permission-gating hooks, which always stay outside it), plugins, helpers, and child Claude Code processes such as teammates ([Claude Code Docs: Tools reference](https://code.claude.com/docs/en/tools-reference)). Nothing on that page puts the main `claude` process under the cap, so it fences what the agent runtime spawns, not the agent runtime itself. It also fails quietly in two places. "When it can't set the cgroup up, commands run without a cap, and the debug log from `claude --debug` says why." When the cap is hit, "nothing in its result names the cap." Run `claude --debug` once after you set it. Leaving the exclude variable unset is its own footgun, because Claude Code then takes the capped set from server-delivered configuration that "can change over time."

On WSL the real ceiling sits one level up from any of this. The VM gets "50% of total memory on Windows" unless `.wslconfig` says otherwise ([Microsoft Learn: WSL config](https://learn.microsoft.com/en-us/windows/wsl/wsl-config)). Mine says `memory=104GB`, under a comment that reads "Heavy parallel agentic workloads: give Linux most of the box, leave Windows ~24 GB headroom." Every fence on my workstation lives under that 104 GB VM, not under the 128 GB box.

A fence protects the host, not the session. One user on #11315 reported in October: "Used the systemd-run workaround to prevent my whole system from going down, but still get regular crashes" ([nenrightld-ux: #11315](https://github.com/anthropics/claude-code/issues/11315)). The session still dies; its neighbors don't.

macOS readers get none of this. #45880 says it flatly: "macOS has no cgroups to contain per-process memory" ([TweedBeetle: #45880](https://github.com/anthropics/claude-code/issues/45880)). On a Mac the levers are the count and the cut above. The old Node heap flag will not bound the CLI either. Since 2.1.113 the CLI is set up to "spawn a native Claude Code binary" ([anthropics/claude-code: CHANGELOG.md](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)). Users report the `NODE_OPTIONS` workaround "has no effect on the Bun/JSC build" ([jc90069: #18011](https://github.com/anthropics/claude-code/issues/18011)). The flag still works on node-based MCP servers, where `--max-old-space-size` "Sets the max memory size of V8's old memory section" ([Node.js: Command-line API](https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-mib)). That is why the #45880 reporter's workaround was a heap cap set in each server's `env`.

---

## Size CI Runners with the Same Math

A CI runner is the same budget with a smaller ceiling and nobody watching it. Run headless fleets with `--bare` and an explicit `--mcp-config`, and [assert the MCP set each run actually got](/blog/agent-harness-audit/). Fence each job with a container limit, then divide the runner's RAM by the measured per-run peak.

The default is the expensive path:

> Without `--bare`, a `-p` session runs the hooks in a project's `.claude/settings.json` and connects the servers in its `.mcp.json`, even in a folder you've never trusted.
> — [Claude Code Docs: Headless](https://code.claude.com/docs/en/headless)

Bare mode turns that off: "only servers supplied on the command line connect, for example with `--mcp-config`." Anthropic calls it "the recommended mode for scripted and SDK calls" ([Claude Code Docs: Headless](https://code.claude.com/docs/en/headless)). The docs pitch bare mode as startup time and reproducibility; the RAM saving is my inference from the per-server numbers above. Before v2.1.286 those limits "held only partly," which is one more reason to pin the version. Bare mode also skips your subscription login, so the job needs `ANTHROPIC_API_KEY`.

```yaml {title="GitHub Actions: one bare, fenced, asserted run"}
- name: Agent run
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    docker run --rm --memory=3g --memory-swap=3g \
      -e ANTHROPIC_API_KEY -v "$PWD:/work" -w /work claude-ci \
      sh -c 'claude -p "Add tests for the uncovered branches in internal/billing" \
               --bare --mcp-config ci/mcp.json \
               --output-format stream-json --verbose > run.jsonl
             status=$?
             cat /sys/fs/cgroup/memory.peak > run.peak
             exit $status'
    # fail the job if the run connected any server other than the one ci/mcp.json lists
    jq -se '[.[] | select(.type == "system" and .subtype == "init")][0]
            | [.mcp_servers[].name] == ["playwright"]' run.jsonl
    echo "per-run peak bytes: $(cat run.peak)"
```

`claude-ci` is whatever image you build with the CLI installed, and `ci/mcp.json` lists one server. The `system/init` event reports `mcp_servers` with each server's `name` and `status`. The `jq` line therefore fails the job the moment a run connects something you didn't list. Setting `--memory-swap` equal to `--memory` gives a hard limit with no swap. Docker's docs are blunt that "Hard limits let the container use no more than a fixed amount of memory" ([Docker Docs: Resource constraints](https://docs.docker.com/engine/containers/resource_constraints/)). Without `-m`, they warn, "the host can run out of memory." On Kubernetes the same job gets a container memory limit. Past that limit, the kernel "intervenes by stopping one of the processes in the container that tried to allocate memory" ([Kubernetes: Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)). The kill stays inside the job that caused it.

CI also drops one multiplier for free. In `-p` mode, "including Agent SDK sessions, Claude doesn't spawn teammates" ([Claude Code Docs: Agent teams](https://code.claude.com/docs/en/agent-teams)), so a headless run is one session, never a team.

A private-repo `ubuntu-latest` runner has 2 CPUs and 8 GB; a public one has 4 CPUs and 16 GB ([GitHub Docs: GitHub-hosted runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)). Start from my workstation's worst observed session tree, 659 MB, and hold back a quarter for the OS and the runner agent. A private runner then fits about 9 runs on paper and a public one about 18. Fenced at 3 GB each, the guaranteed counts drop to 2 and 4. Treat the interactive number as a starting point only. A bare `-p` run with one server is a different tree, which is why the job writes `run.peak` every time. Replace my 659 MB with the highest `run.peak` you have recorded, and tighten the 3 GB limit toward it.

---

## The Max-Sessions Sizing Table

Every section above changes one term of a single division. **Max parallel sessions is therefore: (ceiling minus headroom) divided by the measured peak tree PSS per session.** Re-measure [after every change to M or to the CLI version](/blog/standing-agent-eval-suite/), because both move the denominator.

> **Author's judgment.** The headroom term is my own rule, not a sourced number: hold back about a quarter of the ceiling. It follows from Node's guidance to leave 0.5 GiB of a 2 GiB machine for other uses ([Node.js: Command-line API](https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-mib)), from the kernel docs treating overcommitted `memory.high` limits as a viable strategy while `memory.max` stays the hard line ([Tejun Heo: Control Group v2](https://docs.kernel.org/admin-guide/cgroup-v2.html)), and from my own `.wslconfig`, which leaves 24 GB of a 128 GB box to Windows.

Worked once for the 104 GB VM, with the workstation's own numbers:

```text {title="Max sessions on the 104 GB VM"}
ceiling        104,619 MB   MemTotal inside the WSL2 VM (.wslconfig memory=104GB)
headroom        26,155 MB   25% (author's judgment)
usable          78,464 MB
per session        659 MB   worst tree PSS in the log (session C, 10:47)
on paper           119      78,464 / 659
fenced              12      78,464 / 6,144, every session at MemoryMax=6G at once
```

The gap between 119 and 12 is the whole argument. 119 assumes every session stays at the floor a 20-minute log saw; 12 assumes every session hits its backstop at the same moment. `MemoryHigh` throttles each session at 4 GB, and the kernel treats overcommitted high limits as viable. Running well past 12 is therefore a defensible bet, because a leak now costs one session instead of the VM. For most teams neither number is the binding one: review throughput caps useful parallelism long before RAM does ([review capacity, not agent throughput](/blog/review-capacity-agent-throughput/)).

| Step | Measure or change | Lever | Source |
|---|---|---|---|
| **Count** | Process list per session | N sessions × M stdio servers, plus teammates | #45880, Claude Code MCP docs |
| **Measure** | Tree PSS, or the scope's `memory.peak` | `session-tree.sh`; never summed RSS or VSZ | kernel /proc docs, cgroup v2 |
| **Cut** | Trim servers, drop `npx`, share stateless servers over HTTP, reference by name in subagents | the `.mcp.json` | readybytes, subagents docs |
| **Peak** | Worst footprint over the session's life | Rotate at the 2.5 GB heap warning; pin the CLI at 2.1.243 or later | troubleshooting docs, changelog |
| **Fence** | `MemoryHigh` and `MemoryMax` per session; `CLAUDE_CODE_TOOL_MEMORY_LIMIT` for spawned work | `systemd-run --user --scope` | systemd docs, tools reference |
| **CI** | Per-run `memory.peak` inside the container | `--bare`, explicit `--mcp-config`, container limit | headless docs, GitHub runners |

To get these numbers for your own machine, run [session-memory-budget](https://github.com/johnayoung/agent-engineering-toolkit). It walks every running `claude` tree in PSS, flags servers running once per session and the npm exec wrappers, and does the division against your cgroup or WSL VM ceiling.

---

## References

### Research and Data

1. [Shyam Verma: My MCP Servers Were Eating 3 GB of RAM](https://readybytes.in/blog/shared-mcp-servers-claude-code) — Seven sessions ran 172 processes and about 3 GB of MCP RAM; one shared mcp-proxy cut that to about 33 processes and under 1 GB. Also backs the RSS double-count caveat and the npx wrapper process.
2. [JotaNikkan-pro: #28860](https://github.com/anthropics/claude-code/issues/28860) — Four sessions with six MCP servers spawned about 42 processes instead of 6, with npm-launched servers costing two processes each (npm + node). Backs the count and npx sections.
3. [TweedBeetle: #45880](https://github.com/anthropics/claude-code/issues/45880) — N sessions times M servers spawns up to N×M uncapped node processes; 15 sessions and 34 servers kernel-panicked a 64 GB Mac. Also the source for macOS having no cgroups.
4. [lrgibs01: #99831](https://github.com/anthropics/claude-code/issues/99831) — Every desktop session starts its own copy of every stdio server, about 10 GB of duplicates at ten sessions. Also names the declare-it-globally trap.
5. [nenrightld-ux: #11315](https://github.com/anthropics/claude-code/issues/11315) — The 129 GB headline was VmPeak address space; VmRSS was about 415 MB. A later comment shows a systemd-run fence keeps the host up while sessions still crash.
6. [anthropics/claude-code #4953](https://github.com/anthropics/claude-code/issues/4953) — One WSL2 session grew from about 900 MB to 12.6 GB in 12 minutes. Also the systemd-run MemoryHigh/MemoryMax wrapper and the note that --resume makes a hard kill recoverable.
7. [jc90069: #18011](https://github.com/anthropics/claude-code/issues/18011) — One session grew to 7.6 GiB RSS before the OOM killer took it, and NODE_OPTIONS heap flags have no effect on the native build. Backs the peak and fence sections.

### Practitioner Guidance

8. [Claude Code Docs: MCP](https://code.claude.com/docs/en/mcp) — Stdio servers run as local processes, deduplicated only within a session; tool search saves context, not processes. Also the source for --strict-mcp-config and disabledMcpServers.
9. [MCP Spec: Transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports) — Stdio clients launch the server as a subprocess, while a Streamable HTTP server is one process serving many clients. Backs the sharing argument.
10. [Linux kernel docs: The /proc Filesystem](https://docs.kernel.org/filesystems/proc.html) — PSS divides each shared page by the number of processes sharing it, and smaps_rollup sums a process's mappings. Backs the measurement method.
11. [Tejun Heo: Control Group v2](https://docs.kernel.org/admin-guide/cgroup-v2.html) — memory.current and memory.peak cover a cgroup and its descendants; memory.high throttles without the OOM killer and memory.max is the hard limit. Also backs overcommitting high limits.
12. [Claude Code Docs: Subagents](https://code.claude.com/docs/en/sub-agents) — Subagents that reference an MCP server by name share the parent session's connection; inline servers connect per subagent. Backs the cut section.
13. [Claude Code Docs: Troubleshooting](https://code.claude.com/docs/en/troubleshooting) — A critical warning fires when a session's heap passes 2.5 GB; restart with claude --continue, or /compact outside fullscreen. Backs the peak rules.
14. [Claude Code Docs: Changelog](https://code.claude.com/docs/en/changelog) — Long-session leaks were fixed release by release: 2.1.208, 2.1.238, and 2.1.243's 40 to 70 MB per-session cut. Backs pinning the CLI version.
15. [anthropics/claude-code: CHANGELOG.md](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) — Since 2.1.113 the CLI spawns a native binary instead of bundled JavaScript, so Node heap flags no longer bound it. Backs the macOS and NODE_OPTIONS note.
16. [Node.js: Command-line API](https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-mib) — --max-old-space-size limits V8's old space, with an example of leaving 0.5 GiB of 2 GiB free. Backs node MCP server caps and the headroom judgment.
17. [systemd: systemd.resource-control](https://www.freedesktop.org/software/systemd/man/latest/systemd.resource-control.html) — Use MemoryHigh as the main control and MemoryMax as the last line of defense. Backs the fence ordering.
18. [systemd: systemd-run](https://www.freedesktop.org/software/systemd/man/latest/systemd-run.html) — --user targets the calling user's service manager and --scope creates a transient scope unit. Backs the per-session wrapper.
19. [Claude Code Docs: Tools reference](https://code.claude.com/docs/en/tools-reference) — CLAUDE_CODE_TOOL_MEMORY_LIMIT caps what a session spawns, falls back silently to no cap, and can cover MCP servers and teammates. Backs the scope of the vendor fence.
20. [Claude Code Docs: Environment variables](https://code.claude.com/docs/en/env-vars) — Stdio MCP servers are long-lived and can outlive the session that spawned them; fullscreen keeps memory flat. Backs the count and peak sections.
21. [Microsoft Learn: WSL config](https://learn.microsoft.com/en-us/windows/wsl/wsl-config) — The WSL 2 VM gets 50% of Windows memory unless .wslconfig sets memory. Backs the VM-as-ceiling point and the systemd setup.
22. [Claude Code Docs: Headless](https://code.claude.com/docs/en/headless) — Without --bare, a -p run connects every server in the project .mcp.json; with it, only --mcp-config servers connect. Backs the CI section and the system/init assertion.
23. [Claude Code Docs: Agent teams](https://code.claude.com/docs/en/agent-teams) — Each teammate is a full session that loads MCP servers, and -p runs never spawn teammates. Backs the count and CI sections.
24. [GitHub Docs: GitHub-hosted runners](https://docs.github.com/en/actions/reference/runners/github-hosted-runners) — Standard ubuntu-latest runners have 8 GB and 2 CPUs for private repos, 16 GB and 4 CPUs for public ones. Backs the runner math.
25. [Kubernetes: Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) — Past its memory limit, the kernel stops a process inside the offending container. Backs per-job containment.
26. [Docker Docs: Resource constraints](https://docs.docker.com/engine/containers/resource_constraints/) — Hard limits cap a container's memory; without -m the host itself can run out. Backs the CI container limit.
27. [Microsoft: playwright-mcp package.json](https://github.com/microsoft/playwright-mcp/blob/main/package.json) — The @playwright/mcp package declares a playwright-mcp binary. Backs launching it without npx.
28. [agent-engineering-toolkit: session-memory-budget](https://github.com/johnayoung/agent-engineering-toolkit) — A read-only script that measures each Claude Code session's process tree in PSS and prints max parallel sessions for your ceiling and headroom. It flags duplicated stdio servers and npm exec wrappers, samples over time to catch each session's peak, and reads memory.peak from fenced scopes.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"Hold back about 25% of the ceiling as headroom":** follows from Node's 0.5-of-2-GiB example, the kernel's view that overcommitting memory.high is viable, and my .wslconfig leaving 24 GB of 128 GB to Windows.
- **"MemoryHigh=4G and MemoryMax=6G per session; 3 GB per CI run":** my starting values, sized from measured trees of about 0.6 GB with room above the 2.5 GB heap warning; not a vendor recommendation.
- **"--bare saves RAM":** inferred from the per-server process measurements; the headless docs frame bare mode as startup time and reproducibility.
- **"A globally installed npm binary runs without the npm exec wrapper":** inferred from the first-party npx-versus-binary process counts; verify with ps --ppid after the change.
- **"Share only servers that hold no per-session state; keep playwright per session":** my rule, derived from the HTTP transport serving many clients from one process and the proxy's shared failure mode.

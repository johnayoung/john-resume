---
title: "AI Code Review Is a Property of Your Team, Not the Tool"
date: 2026-08-17
draft: false
pillar: team-process
author: "John Young"
description: "Two teams ran the same AI reviewer and reported opposite results. Stop importing a verdict from the discourse and run the diagnostic on your own team."
keywords: ["AI code review impact on teams", "agent-authored pull requests", "code review metrics", "reviewer expertise", "review policy"]
tldr:
  - "The tool doesn't decide whether AI code review helps or hurts your team. A CMU-proposed theory argues the team does, through the expertise of its reviewers and how it structures the review process, though the paper is an unrefereed preprint, not a validated result."
  - "One query choice can flip the direction of your `agent_pr_review_rate`: whether the developer who invoked the agent counts as an independent reviewer (40.1% of agent PRs are reviewed only by that person, versus 21.5% of human PRs). Merge speed and review-discussion volume stay stable either way."
  - "Before trusting a published verdict, check three variables on your own team: whether your reviewers can catch what they approve, how your AI reviewer's suggestions actually perform on your own repo, and whether your written review policy has been updated for agent-authored PRs at all."
  - "Faros AI's telemetry across 22,000 developers found that engineering maturity (high DORA scores, disciplined delivery) didn't shield teams from review slowdowns, and the post doesn't resolve that against its own thesis: none of the three moderators above have actually been measured against it."
---
{{< eli5 hint="no background needed · 9 min" audience="for readers outside AI engineering" >}}
Two companies can use the exact same AI tool to write code and end up with opposite opinions about whether it's safe. The reason usually has nothing to do with the tool.

## The big idea

Companies track a number that's supposed to answer a simple question: "How much of the code an AI writes actually gets checked by a person before it ships?" But that number hides a choice nobody consciously made. Say a developer tells an AI "build me this feature," the AI writes the code, and that same developer looks it over and approves it. Does that count as a real check? It's like asking whether a manager who assigns a report and then reads it over before signing off is an independent reviewer, or just the same person approving their own instructions twice. Both answers are reasonable. But they point in opposite directions: count that person as a reviewer, and AI-written code looks well-supervised. Don't count them, and the exact same data says AI code is barely checked at all. Same quarter, same numbers, opposite headline. Nobody did anything wrong to get there. That single silent choice is the whole argument in miniature: the debate over whether "AI broke code review" is really a debate over a definition nobody wrote down.

## Two confident camps, both skipping the real question

There are two loud opinions about AI and code review. One says it's broken: the code AI produces is now too big and too fast for humans to meaningfully check. The other says it's fine, as long as you follow the right checklist. Both are stated as facts about the whole industry, and neither one actually asks what's true about *your* team specifically. A third, more careful voice says it depends, but on properties of the code itself (how risky it is, how long it'll live, how many people need to understand it), not on whether the specific people reviewing it are actually capable of catching what an AI gets wrong. One research group proposes that the real missing variable is the team itself: its people's skill and how it structures review. They argue review is the control point that decides whether AI helps or hurts. That idea is worth taking seriously, but it's worth being clear about what it is: an unproven theory from a preprint, not an established finding. The researchers themselves call it "a proposed explanatory theory, not a validated one."

## The hidden switch that flips the whole story

Here's the mechanism behind the big idea, with real numbers behind it. In one dataset, 40% of AI-written pull requests were looked at only by the same person who told the AI what to build, compared to about 22% for human-written code. Whether that 40% counts as "reviewed" or as "self-review" decides whether AI code looks better-checked than human code or worse-checked than human code. The underlying data is identical either way. It's important to be precise about how far this goes: not everything about AI code review flips depending on this choice. Other measures in that same study (how fast things get merged, how much discussion happens on a pull request) stayed steady no matter which definition you used. It's specifically the "was this independently reviewed" number that's unstable, because it's the one number built entirely on an unwritten rule.

## This exact trap has caught researchers before

This isn't a new kind of mistake. In 2020, researchers studied a large batch of GitHub projects and concluded that a different tool (automated testing software, not AI) was causing teams to discuss code less during review. Reasonable study, reasonable conclusion. In 2026, a different team took that same original data and reran the analysis 3,072 different ways, each way being an equally defensible choice a researcher could have made along the way (like how you split time periods, or which projects you include). Only 6 of those 3,072 reruns, less than a quarter of one percent, reproduced the original finding. One single choice, about how long a time period to measure, accounted for most of the flip-flopping. That doesn't mean every result built this way is fake. Critics of this rerun-everything method point out it can also bury real effects under a pile of unnecessary alternatives, so instability is a sign a number needs its choices explained, not proof the number is wrong. It's a caution, not a debunking.

This kind of error doesn't require anyone to be cheating or fudging data: researchers can make one entirely sensible choice, not realize it was a choice at all, and get a result that would have looked different with an equally sensible alternative choice. It happened inside this very research process, too: an automated step meant to verify a source failed to load a webpage, and that failure got mistakenly recorded as "this source doesn't actually say that." In fact the source was real and correct all along. Nobody faked anything; a plain technical glitch almost got treated as evidence.

## More data doesn't fix a shaky number; you have to find what's missing

The instinct when a number looks unreliable is to gather more of it: longer time windows, more teams, more repositories. That instinct can make things worse: piling on more data can make a flawed number look more confident and more "statistically real," even though the flaw is still sitting underneath it untouched. What actually helps is figuring out what important factor was left out of the count in the first place. The post names three worth checking on your own team, and is upfront that these three are the author's own reasoning extended from the research, not something any single study proves outright:

First, whether your reviewers can actually catch AI's mistakes, not whether they *say* they're cautious about AI code. Studies of people checking AI-written code found that being aware of the risk is common across skill levels, but the actual ability to catch problems is not; it depends heavily on experience. A survey saying "our team doesn't fully trust AI code" tells you nothing about whether they can catch what's wrong with it.

Second, how your own review bot performs on your own codebase, not the published industry averages from other companies' projects. In one large study, human reviewers' suggestions got adopted far more often than AI reviewers' suggestions, and more than half of the AI suggestions that got ignored were either wrong or replaced with a different fix. Those are pooled numbers from other people's repositories; your bot on your code could be better or worse, and you won't know until you check.

Third, whether your written review rules have actually been updated for a world where an AI, not a person, might be the one opening the pull request. A policy that never mentions AI at all is still running the old assumptions: that a human decided the change was worth making, that the author and the reviewer are different people, that the mistakes to watch for are the ones humans typically make.

## Taking the strongest disagreement seriously

There's a real, well-supported case against all of this, and it deserves to be stated plainly rather than argued away. One large study tracked two years of activity across 22,000 developers and thousands of teams and found that even organizations with excellent, disciplined engineering practices got hit by the same slowdowns during heavy AI use as everyone else: review times up hugely, more code merging without any review at all. If good practices don't protect you, the whole idea of "check your own team's specific factors" might be a comforting story rather than something that actually holds up.

That evidence is real and it isn't dismissed. But look closely at what it measured: it tracked *all* pull requests at high-AI-adoption companies, not specifically the ones written by AI, which means it doesn't actually test the three specific factors above (reviewer skill, bot quality, updated policy). A separate, similar-sounding claim from another major report is flagged as weaker evidence, since it's based on people's self-reported impressions rather than measured behavior, and it's structured so that almost any outcome would seem to confirm it. So the honest conclusion isn't "good teams are automatically protected." It's that nobody has yet actually measured whether reviewer skill, bot quality, or updated policy make a difference. The variables that would settle the question are unmeasured, and you're the only one positioned to measure them for your own team.

## What this means for you

Don't import a verdict about AI and code review from the discourse. Go find the actual query behind your own "how much AI code gets reviewed" number and check which side of the hidden switch it's on: does it count the person who told the AI what to build as a reviewer, or not? Then check whether your reviewers can actually catch mistakes, how your bot performs on your own code, and whether your written policy has caught up to AI writing pull requests. That six-question check is the author's own synthesis pulled together from the research above (not an official, proven test), but working through it gives you a real number about your own team, with a record of the choices behind it, instead of a borrowed headline.

---

**The technical terms, in plain words**
- Independent review = a check on the code done by someone other than whoever asked the AI to write it in the first place.
- Preprint = a research paper posted publicly before other scientists have formally checked it over; treat it as a serious proposal, not a settled fact.
- Construct validity = whether a number is actually measuring the thing you think it's measuring, rather than something else that just looks similar.
- Omitted variable / missing factor = an important cause of a result that nobody included when they set up the measurement, which can make the result misleading.
- Multiverse analysis = rerunning the same study many times, each time making a different but equally reasonable choice about how to analyze the data, to see whether the conclusion holds up or was just one lucky (or unlucky) path.
- Telemetry = data automatically collected from real systems as people use them, as opposed to a survey where people just report their impressions.
- Self-reported data = information based on what people say about themselves, rather than something directly measured or observed.
- Moderator (in this sense) = a factor that changes whether or how strongly one thing affects another; here, things like reviewer skill or bot quality that decide whether AI helps or hurts a given team.
- Dashboard query / predicate = the exact rule, written in code, that decides what counts toward a number on a company dashboard; the hidden definition behind the headline figure.

**Keep reading:** <a class="leaf-exit" href="#essay">the full version, with the research and sources &darr;</a>
{{< /eli5 >}}

Two teams can run the same AI reviewer on the same class of codebase and report opposite results. The argument that follows is almost always about the tool. It is the wrong argument. More than one in five code reviews on GitHub now involve an agent ([The GitHub Blog: Agent pull requests are everywhere](https://github.blog/ai-and-ml/generative-ai/agent-pull-requests-are-everywhere-heres-how-to-review-them/)). The interesting variable is no longer whether agents are in your review process (they are), but what your team does with what they produce.

---

## Both Verdicts on AI Code Review Are Universal Claims

The two loudest positions on AI and code review are both stated as facts about the industry, and neither one is a fact about your team. One camp says review is broken. The other says review is fine if you follow the checklist. Both skip the step where you find out which one describes you.

The "AI broke review" pole is best stated by Moderne, writing up an interview with Morgan Stanley engineers:

> "In the time that Dov and I have been speaking, you probably could have produced a thousand-file, 10,000-line PR on the back of just a simple prompt. No human here is going to review that."
> — [Moderne: AI didn't break coding. It broke code review.](https://moderne.ai/blog/ai-didnt-break-coding-it-broke-code-review)

That is a real observation from a real org, and Moderne sells the deterministic tooling it proposes as the fix. The prescription pole reads the same way from the other direction. GitHub's guidance hands every reader the same review habits regardless of who is reviewing, and CIO's exec-facing version diagnoses a "crisis" and prescribes restructuring. CIO's author earns one credit: he names a real metric pair, writing that he only expands scope "when acceptance rate is climbing and the post-merge defect rate is holding flat or falling. One signal moving without the other is a red flag" ([CIO: The code review crisis and how you should rebuild review models](https://www.cio.com/article/4207438/the-code-review-crisis-and-how-you-should-rebuild-review-models.html)).

The closest thing to a contingent position is Addy Osmani's, and he gets the shape of the answer right:

> "The only answer that survives contact with a real codebase is that it depends entirely on who you are."
> — [Addy Osmani: Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/)

His three variables are blast radius, how long the code lives, and how many people need to understand it ([Addy Osmani: Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/)). Those are properties of the *code*. They tell a solo developer to relax and an enterprise to be careful, which is useful. They say nothing about whether the specific humans on your review rotation can catch what an agent gets wrong. A CMU team working from 3,100 coded practitioner documents puts the missing variable where it belongs: "review is the control point through which a coding agent's effect on software is decided, and that AI does not fix the sign of that effect: the team sets it, through the expertise its humans bring and how it structures the review process" ([Agarwal et al.: 3100 Opinions on Code Review in an AI World](https://arxiv.org/abs/2607.07980)). That paper is an unrefereed preprint and says so plainly: its authors call it "a proposed explanatory theory, not a validated one." Treat it as a set of falsifiable propositions, not a result.

| Position | Stated by | What it conditions on | What it tells you about your team |
| --- | --- | --- | --- |
| AI broke code review | Moderne, via Morgan Stanley engineers | Nothing: no hedge, no team size, no expertise | Nothing |
| Review is fine with the right habits | GitHub | Nothing: the same habits regardless of who is reviewing | Nothing |
| Review is in crisis; rebuild the model | CIO | Acceptance rate against post-merge defect rate | Nothing about who reviews |
| It depends entirely on who you are | Addy Osmani | Blast radius, how long the code lives, how many people must understand it | Properties of the code, not the reviewers |
| The team sets the sign | Agarwal et al. (CMU) | The expertise its humans bring and how it structures review | The variable the other four skip |

Both camps cite the same number to defend their position: the share of agent-authored PRs at your company that received independent human review. Call it `agent_pr_review_rate`. It is on every engineering dashboard that tracks agents, both poles wave at it, and neither one asks what it counts. **The rest of this post takes that one number apart, because everything the discourse is arguing about is downstream of its definition.**

---

## Find Out Whether Your Metric Counts the Invoking Developer

Before you act on your `agent_pr_review_rate`, go find the query behind it and answer one question: when a developer runs an agent and then approves the PR the agent opened, does your dashboard count that as an independent review? The direction of your entire trend line depends on the answer, and most teams have never chosen one.

The CMU paper hit this inside its own dataset, and disclosed it:

> "Whether the developer who invoked an agent counts as an independent reviewer or as the author reviewing their own work decides whether independent review of agent PRs sits above or below the human rate."
> — [Agarwal et al.: 3100 Opinions on Code Review in an AI World](https://arxiv.org/abs/2607.07980)

The underlying number is 40.1% of agent PRs examined only by the developer who invoked the agent, versus 21.5% of human PRs ([Agarwal et al.](https://arxiv.org/abs/2607.07980)). Here is what that means in a query:

```sql {title="Two defensible definitions of agent_pr_review_rate"}
-- Definition A: any human approval counts.
--   The developer who invoked the agent is a reviewer.
reviewed := EXISTS (SELECT 1 FROM reviews r
                    WHERE r.pr_id = pr.id
                      AND r.author_type = 'human')

-- Definition B: a review counts only if the reviewer is not the invoker.
reviewed := EXISTS (SELECT 1 FROM reviews r
                    WHERE r.pr_id = pr.id
                      AND r.author_type = 'human'
                      AND r.author_id <> pr.agent_invoked_by)
```

Under Definition A, that 40.1% slice is reviewed code and agent PRs look *better* supervised than human PRs. Under Definition B, the same slice is self-review and agent PRs look worse. Same data, same quarter, opposite headline. No engineer wrote a bug. Be precise about the scope of this: only the independent-review construct reverses. Merge speed and review-discussion volume are reported as stable in the same paper, so "all the agent-PR trends flip" overstates it.

Salesforce Engineering published the worked case of what happens when nobody asks. Their write-up reports code volume up roughly 30% with PRs regularly past 20 files and 1,000 lines, and then interprets a metric that had stopped rising and in places was falling outright:

> "More concerning, review time for the largest pull requests began to plateau [...] This indicated that reviewers were no longer meaningfully engaging with changes."
> — [Salesforce Engineering: Scaling Code Reviews](https://engineering.salesforce.com/scaling-code-reviews-adapting-to-a-surge-in-ai-generated-code/)

Declining review time on large PRs is genuinely ambiguous. It is consistent with disengagement, and it is equally consistent with better tooling, better PR descriptions, or previously-inflated baselines. The post entertains no alternative, discloses no population or sample size, and (the part that matters here) never says who counts as a reviewer anywhere in it. That is not sloppiness on their part so much as the industry default. It is a footgun: a metric reported without its numerator defined will be read as whatever the reader already believes.

There is a formal name for the defect. An RCT-methods group working on AI evaluation puts it this way: "When construct validity is weak, a study may show that scores increased with AI, but it cannot credibly claim that human capability in the targeted domain has improved" ([Kelly et al.: Principles and Guidelines for RCTs in AI Evaluation](https://arxiv.org/abs/2605.02050)). Their two named failure modes, construct underrepresentation and construct-irrelevant variance, describe an `agent_pr_review_rate` exactly. **The first question is therefore not whether AI is hurting your review process. It is which of those two SQL predicates your dashboard is running.**

---

## Code Review Already Had a Finding Dissolve This Way

The claim "a tool arrived and review discussion went down" is not new. The last time the field made it about code review at scale, the finding did not survive its own analysis choices. The 2026 claim has the same shape as the 2020 one.

In 2020, a SANER paper studied 685 GitHub projects and found that "with the introduction of CI, pull requests are being discussed less. On average CI saves up to one review comment per pull request" ([Cassee, Vasilescu, Serebrenik: The Silent Helper](https://doi.org/10.1109/SANER48275.2020.9054818)). Reasonable study, reasonable finding, exactly the sort of thing a VP would put on a slide.

In 2026, a TOSEM-accepted multiverse analysis re-ran it. The authors identified nine pivotal analytical decisions in the original, each with at least one equally defensible alternative. They "systematically reran all the 3,072 resulting analysis pipelines on the original dataset" ([Cassee & Feldt: Exploring the Garden of Forking Paths in Empirical Software Engineering Research](https://arxiv.org/abs/2512.08910)). The result:

> "Interestingly, only 6 of these universes (<0.2%) reproduced the published results; the overwhelming majority produced qualitatively different, and sometimes even opposite, findings."
> — [Cassee & Feldt: Exploring the Garden of Forking Paths in Empirical Software Engineering Research](https://arxiv.org/abs/2512.08910)

One decision did most of the damage: "For the full study, only changing the *Period Length* resulted in a different outcome in 86.3% of universes" ([Cassee & Feldt](https://arxiv.org/abs/2512.08910)). The multiverse paper names that 2020 study as its target and discloses that "one of the authors of this study was also involved in the primary study" ([Cassee & Feldt](https://arxiv.org/abs/2512.08910)).

| The 2020 claim | Your 2026 claim |
| --- | --- |
| A tool (CI) entered the workflow | A tool (coding agents) entered the workflow |
| Review discussion per PR went down | Independent review of agent PRs went down |
| One observational dataset, one analysis path | One telemetry dashboard, one query |
| Period length was a defensible free choice | The reviewer-identity predicate is a defensible free choice |
| 6 of 3,072 defensible pipelines reproduced it | Unmeasured |

The last row is the one to act on. Nobody has re-run your dashboard 3,072 ways, so you do not know which cell of that multiverse your quarterly number came from. This is the same discipline I applied to model selection in [the leaderboard-noise post](/blog/coding-agent-leaderboard-noise/). The number you generate from your own workload beats the number you import, but only if you know which choices produced it.

Two honest limits. First, this style of analysis has a live critique. Del Giudice and Gangestad argue that "if specifications are not truly arbitrary, multiverse-style analyses can produce misleading results, potentially hiding meaningful effects within a mass of poorly justified alternatives" ([Del Giudice & Gangestad: A Traveler's Guide to the Multiverse](https://iris.unito.it/retrieve/e27ce435-58ab-2581-e053-d805fe0acbaa/DelGiudice_Gangestad_2021_guide-to-the-multiverse_ampps.pdf)). Instability is evidence that a number needs its choices justified, not proof that the effect is imaginary. Second, the method's originators are careful about what it does. They hope it "raises awareness that, in the light of the multiverse of statistical results, isolating a single statistical result stemming from a chain of arbitrary choices can be highly misleading," and say plainly that it "is not a formal test of questionable research practices" ([Steegen et al.: Increasing Transparency Through a Multiverse Analysis](https://sites.stat.columbia.edu/gelman/research/published/multiverse_published.pdf)).

The most credible version of this move is first-party. METR redesigned its developer-productivity experiment after finding that developers were opting out rather than work without AI. It wrote against its own headline number: "However the true speedup could be much higher among the developers and tasks which are selected out of the experiment" ([METR: We are Changing our Developer Productivity Experiment Design](https://metr.org/blog/2026-02-24-uplift-update/)). It also bound the damage: "The selection effects seem to affect a minority share of developers and of tasks, which limits the degree of bias" ([METR](https://metr.org/blog/2026-02-24-uplift-update/)). Bounding the bias like that is what a real correction looks like. That is a productivity study, not a review study. Take the transfer for what it is: a demonstration that a headline effect can be partly a property of who got measured.

I ran the same failure inside this pipeline. My research pass marked every figure in the Faros AI telemetry report as refuted; a dedicated re-check found all of them present verbatim and server-rendered on Faros's own domain. The refutation was a fetch failure scored as an absence. Nobody fabricated anything, one automated retrieval step failed quietly, and a verified source came within one edit of being called wrong in public.

### Nobody Has to Be P-Hacking for This to Happen

Stop treating "we only ran the analysis once" as a defense; it is the exact case the statistics literature was written about. Gelman and Loken state it in their abstract: "Researcher degrees of freedom can lead to a multiple comparisons problem, even in settings where researchers perform only a single analysis on their data" ([Gelman & Loken: The garden of forking paths](https://sites.stat.columbia.edu/gelman/research/unpublished/p_hacking.pdf)).

The mechanism is the part engineers underrate. They write that "researchers can perform a reasonable analysis given their assumptions and their data, but had the data turned out differently, they could have done other analyses that were just as reasonable in those circumstances." Those choices, they add, "do not feel like degrees of freedom because, conditional on the data, each choice appears to be deterministic" ([Gelman & Loken](https://sites.stat.columbia.edu/gelman/research/unpublished/p_hacking.pdf)). Your data engineer picked one reviewer-identity predicate. Conditional on the data in front of them, it felt like the only sensible one. It was one path through the garden, and the fork was never logged.

### A Bigger Dashboard Does Not Fix It

When an agent-PR metric looks ambiguous, the reflex is to add more data: longer windows, more repos, more teams. That reflex makes the problem worse in a specific, measurable way. Furia and Torkar note that sampling more datapoints "may just entrench our reliance on the biased estimate by reducing its variance and giving the false impression of reliability or 'significance'" ([Furia & Torkar: Mitigating Omitted Variable Bias in Empirical Software Engineering](https://arxiv.org/abs/2501.17026)).

Their SE case study shows how little confounding it takes: they compute that a modest omitted-variable strength "would be sufficient to flip the sign of the measured effect" ([Furia & Torkar](https://arxiv.org/abs/2501.17026)). That is a sensitivity threshold, not an observed reversal. The move that actually helps is not more rows, it is conditioning on the variable you left out. For `agent_pr_review_rate`, the omitted variables are the three moderators below.

---

## Moderator One: Measure Verification Capacity, Not Stated Skepticism

> **Author's judgment.** The evidence below measures individual verification behavior and individual reviewer outcomes; extending it to "your team's review rotation" is my inference, not a claim any of these papers makes. Fawzy et al. studied solo verification by Prolific-recruited individuals; the phrase "code review" appears twice in the entire paper. The premises are theirs; the transfer to team review is mine.

Your team's survey score on "do you trust AI-generated code" tells you nothing about whether they can catch its errors. Awareness of the risk is broadly distributed. The ability to act on it is not.

That is the finding, near-verbatim, from a study of 162 vibe coders across three experience groups: a general awareness of risks in AI-generated code is broadly distributed, but "the capacity to evaluate, debug, and verify remains experience-dependent" ([Fawzy, Tahir, Blincoe: From Prompting to Verification](https://arxiv.org/abs/2605.24521)). Reported perceptions of code quality came out broadly similar across groups while actual practices diverged sharply. Professionals reported the highest rates of consistent checking, "with approximately 45% reporting that they always check" AI-generated code before using it; non-developers were the only group to report never checking at all ([Fawzy et al.](https://arxiv.org/abs/2605.24521)).

Measured review outcomes point the same way. Mining 28,127 Mozilla reviews, Kononenko et al. found "that overall 54% of Mozilla code reviews missed bugs in the approved commits," and that "less experienced developers [...] are more likely to neglect problems in changes under review," where less experienced means having conducted relatively fewer code review tasks ([Kononenko et al.: Investigating Code Review Quality](https://plg.uwaterloo.ca/~migod/papers/2015/icsme15-OleksiiOlgaLatifa.pdf)). Their companion survey of 88 Mozilla developers found the same engineers naming familiarity as a driver of quality: "the review quality is primarily associated with the thoroughness of the feedback, the reviewer's familiarity with the code, and the perceived quality of the code itself" ([Kononenko, Baysal, Godfrey: Code Review Quality: How Developers See It](https://plg.uwaterloo.ca/~migod/papers/2016/icse16.pdf)). That is perception, not a measured outcome. Worth labeling as such even when it agrees.

The same-tool-opposite-outcome case exists inside a single company. In interviews at BNY Mellon, researchers recorded that "peer review of code is critical to deploying reliable software to production. However, the use of AI assistants in producing such code may have unforeseen impacts when it comes to the review process," including a senior manager's recurring issue with junior developers optimizing pieces of a change that were not the right things to optimize ([Chen et al.: Beyond the Commit](https://arxiv.org/abs/2602.03593)). One organization, one assistant, different results by seniority.

| Signal you can spot this week | What it means | What to do |
| --- | --- | --- |
| A 900-line agent diff approved in under four minutes | The reviewer read the description, not the diff | Sample five such PRs; ask the approver to explain one non-obvious decision |
| Review comments are all "does CI pass?" and style nits | The rotation is checking form, not semantics | Route agent PRs touching invariants to a named owner |
| Your survey says the team distrusts AI code, approval rates are unchanged | Stated skepticism, no verification capacity | Stop surveying; measure catch rate on seeded defects |
| Juniors approve agent PRs on a module faster than its owner does | Familiarity is not in the routing rule | Add module familiarity to reviewer assignment |
| Nobody in the thread can say why the code is shaped that way | Comprehension debt is accumulating | Require a written rationale in the PR body before approval |

Every one of those signals is about the human sitting in the numerator of `agent_pr_review_rate`. A review by someone who cannot evaluate the change increments the metric identically to a review by someone who can. The number cannot tell them apart, which is why the per-diff framework in [evaluating AI coding agent output](/blog/evaluating-ai-coding-agent-output/) helps in direct proportion to who is holding it.

---

## Moderator Two: Measure the Bot on Your Own Repo

> **Author's judgment.** The imperative to measure your own bot is mine, inferred from a limitation the source discloses rather than from a finding it reports: Zhong et al. pool their results across 300 projects with no breakdown by project, team, or reviewer, and flag that their conclusions "may not generalize to proprietary enterprise systems or smaller niche repositories." Adapting reliance-calibration metrics from human-AI decision research to code review is likewise my move; that literature contains no software engineering content at all.

Compute your own reviewer bot's suggestion-adoption rate and false-positive rate before you let it absorb review load. The published averages are pooled across projects that are not yours. They are still worth knowing, and they are not flattering.

Across 278,790 code review conversations in 300 open-source GitHub projects, human reviewers achieved "significantly higher adoption rates (56.5% vs. 16.6%)" than AI agents, and:

> "Over half of unadopted suggestions from AI agents are either incorrect or addressed through alternative fixes by developers."
> — [Zhong, Noei, Zou, Adams: Human-AI Synergy in Agentic Code Review](https://arxiv.org/abs/2603.15911)

When the suggestions *are* taken, they cost something: adopted agent suggestions "produce significantly larger increases in code complexity and code size than suggestions provided by human reviewers" ([Zhong et al.](https://arxiv.org/abs/2603.15911)). And the failure is quiet on the other side too. An MSR 2026 study of 3,858 PRs found average max redundancy of 0.2867 for AI agents against 0.1532 for humans (roughly 1.87x, significant at p<0.001), while reviewer sentiment ran *more* positive toward the AI-generated code ([Huang et al.: More Code, Less Reuse](https://arxiv.org/abs/2601.21276)). Their reading:

> "This disconnect suggests that the surface-level plausibility of AI code masks redundancy, leading to the silent accumulation of technical debt in real-world development environments."
> — [Huang et al.: More Code, Less Reuse](https://arxiv.org/abs/2601.21276)

Note the measurement caveat before you quote that at your team: the sentiment signal comes from an off-the-shelf, general-English classifier. The authors say it "may misinterpret technical discussions in code reviews as neutral or negative emotions" ([Huang et al.](https://arxiv.org/abs/2601.21276)).

Run these five steps against your own repo. Each produces a number your dashboard does not currently have:

1. **Pull every comment your bot left on merged PRs in the last 90 days.** That file is your denominator.

   ```bash {title="Bot review comments, last 90 days"}
   gh pr list --repo <owner>/<repo> --state merged --limit 500 \
     --json number,mergedAt \
     --jq '.[] | select(.mergedAt > "2026-05-20") | .number' \
   | while read -r pr; do
       gh api "repos/<owner>/<repo>/pulls/$pr/comments" \
         --jq ".[] | select(.user.login == \"<your-bot>[bot]\") | {pr: $pr, path: .path, id: .id}"
     done > bot-comments.jsonl
   ```

2. **Sample 50 unadopted comments and classify each one** as correct-but-ignored, incorrect, or superseded by a different fix. The pooled baseline says over half of unadopted suggestions land in the last two buckets; find out whether yours do.
3. **Diff the complexity delta on adopted suggestions.** If your bot's accepted comments reliably grow the change, it is buying you review coverage with maintenance cost.
4. **Score reliance, not trust.** Count the times a human rejected a wrong bot comment and got it right independently, and the times a human accepted a correct bot comment they had initially missed. Those two counts are the code-review analogue of RSR and RAIR, objective reliance metrics from a literature that finds "trust measurements do not inform users' appropriate reliance on AI systems" ([Raees & Papangelis: From Trust to Appropriate Reliance](https://arxiv.org/abs/2604.23896)).
5. **Decide, in writing, whether a bot comment increments `agent_pr_review_rate`.** Not whether it should in principle; whether it currently does in your query.

Step five is the one that changes the number. If a bot approval counts, your independent-review rate is measuring bounded, verifiable machine attention and calling it human oversight. If it does not count, you may be under-reporting real coverage. Either answer is defensible. **Not having chosen is the only indefensible option, because it means your delegation policy was set by whoever wrote the query.**

---

## Moderator Three: Check Whether Your Review Policy Actually Changed

Go open your written review policy right now. If it predates agents opening PRs, you are running the old process on a new kind of input and calling the output a measurement.

The CMU theory names this as a first-class construct: a review governance policy "sets what must be reviewed, by whom, and against what checklist" ([Agarwal et al.](https://arxiv.org/abs/2607.07980)). Those three clauses are exactly the ones agent PRs invalidate. "What must be reviewed" assumed a human decided the change was worth making. "By whom" assumed the author was not also the invoker. "Against what checklist" assumed the failure modes were human failure modes (typos, off-by-ones, missed edge cases) rather than plausible-looking redundancy that reads clean. The same paper's proposition P15 states the cost of leaving it stale: "Low review depth and opacity increase comprehension debt, undermining review skill, maintainability, collective ownership, and knowledge transfer" ([Agarwal et al.](https://arxiv.org/abs/2607.07980)).

A 2026 vision paper argues the reviewer's job description has already changed, describing a world in which "reviewers transition from manual inspectors into supervisory operators of agents" ([Kamalı, Tuna, Haratian, Tüzün: Rethinking Code Review in the Age of AI](https://arxiv.org/abs/2605.17548)). It is a position paper with no new data, so read it as a proposal rather than a finding. Its concrete criteria are usable: "the selected PR reviewers should possess familiarity with the code changes, have adequate experience in code review, and not be burdened with excessive workload," and "code should not be reviewed faster than 200 lines per hour to maintain inspection quality" ([Kamalı et al.](https://arxiv.org/abs/2605.17548)). Hold a 20-file, 1,000-line agent PR against 200 lines per hour: that is a five-hour review, a capacity question before it is a quality question. [The reviewer-hours ceiling post](/blog/review-capacity-agent-throughput/) sizes that side of it.

Audit the policy against these six items. Verb-first, all answerable today:

1. **Grep the document for "agent," "assistant," and the name of the tool your team actually uses.** Zero hits means the policy predates the input it governs.
2. **Find the sentence that defines who may approve.** Check whether it excludes the person who invoked the agent. If it is silent, your dashboard's SQL is your policy.
3. **Read the checklist and mark every item a compiler or linter already enforces.** Those items are dead weight on an agent PR; the surviving items are your real review.
4. **Add one item the old checklist could not have had:** duplicated logic that already exists elsewhere in the repo, since that is the specific defect class agent PRs over-produce.
5. **Write down a size threshold above which a PR must be split or reviewed by two people**, and pick the number from your own review-throughput data rather than from a blog post.
6. **Name an owner for the policy and a date it gets re-read.** An unowned policy drifts back to the dashboard's default within a quarter.

Item two is the running thread again, one layer down. Most teams have no policy sentence defining independent review at all. The numerator of `agent_pr_review_rate` was never chosen by anyone accountable for it; it was inherited from a query. **A metric definition that nobody chose is still a policy. It is just a policy with no author.**

---

## The Strongest Case Against All of This

The best available counter-evidence says team quality buys you nothing, and it deserves a real hearing rather than a footnote. Faros AI analyzed two years of telemetry across 22,000 developers and more than 4,000 teams. It compared each organization against itself between its periods of lowest and highest AI adoption. Their finding is blunt:

> "High-performing engineering organizations, those with mature DevOps practices, high DORA metrics scores, and disciplined delivery processes, are experiencing the same downstream deterioration as everyone else."
> — [Faros AI: Ten takeaways from the AI Engineering Report 2026](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways)

The review numbers underneath it are large ([Faros AI](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways)):

| Faros metric, lowest- vs highest-AI-adoption period | Change |
| --- | --- |
| Median time to first PR review | +156.6% |
| Median time in review | +441.5% |
| PRs merged without any review, human or agentic | +31.3% |

Osmani reaches the same conclusion from the same data, writing that "the detail I keep returning to is that teams with mature, disciplined engineering practices were hit just as hard as everyone else" ([Addy Osmani: Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/)). If maturity is not a shield, a diagnostic that sorts teams by maturity is theater.

That is a direct contradiction of DORA's position, and Faros says so by name. DORA's 2025 report frames it the other way: "AI's primary role is as an amplifier, magnifying an organization's existing strengths and weaknesses. The greatest returns on AI investment come not from the tools themselves, but from a strategic focus on the underlying organizational system" ([DORA: State of AI-assisted Software Development 2025](https://dora.dev/dora-report-2025/)). Weight that appropriately. DORA is a program run by Google Cloud, the report is presented by Google Cloud, and its headline numbers are self-reported perception rather than telemetry. The amplifier thesis as stated is close to unfalsifiable: any outcome confirms it. I would not lean on it to win this argument.

So take Faros seriously, and then check what it measured. Two things, in their own framing. First, the scope: these figures track "metric change between periods of lowest and highest AI adoption within each organization" ([Faros AI](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways)). That is *all PRs* at high-adoption orgs, not agent-authored PRs specifically. Reading it as "agent PRs get worse review" is precisely the construct swap this post has spent three sections arguing against. I am not going to commit it in the direction that helps me. Second, the window: two years spanning multiple model generations with no stated control for which model wrote the code. Neither point disputes a single percentage, and I have not found anyone who does.

Here is where it leaves the argument, honestly. Faros shows that maturity, measured as DORA scores and delivery discipline, did not protect orgs from an aggregate deterioration. Nothing in it measures the three moderators. Nobody has published a study that stratifies agent-PR review outcomes by reviewer expertise distribution, bot capability on the specific repo, or policy adaptation. **The claim is not that a good team is safe. It is that the variables that would decide it are unmeasured, and you are the only person who can measure them on your team.**

---

## Run the Diagnostic on Your Own Team

> **Author's judgment.** The six questions below are my synthesis, not a validated instrument. They follow from the CMU paper's three proposed moderators, the construct-validity failure in the `agent_pr_review_rate` definition, and the multiverse result on analytical instability. But no source packages them as a diagnostic, and the paper closest to doing so calls its own theory unvalidated.

Answer these before you accept any published verdict about AI and code review, then re-read your own number under the answers.

| Question about your org | What your answer changes about `agent_pr_review_rate` |
| --- | --- |
| Which camp does your own evidence actually resemble: broken review, or fine-with-a-checklist? | Decides whether you are importing a verdict or reporting one |
| Does the developer who invoked the agent count as a reviewer in the query? | Flips the trend's direction; 40.1% of agent PRs sit in that slice |
| Would the number survive a different defensible definition of "reviewed"? | Tells you whether you have a finding or one draw from a multiverse |
| Can the humans in the numerator catch what they approve? | An unqualified review and a qualified one increment it identically |
| What are your bot's real adoption and false-positive rates on your repo? | Decides whether bot comments should increment it at all |
| Does your written policy define any of the above? | If not, the query author set your review policy |
| Does the counter-evidence you are citing measure agent PRs, or all PRs? | Decides whether the strongest case against you applies to you |

Work down the rows and you end up with a different number than the dashboard's, plus a written record of every choice that produced it. That record is the deliverable. The number by itself is a claim about your team that nobody on your team made.

Then take the second question, the one you can answer this afternoon: pull the query, find the reviewer-identity predicate, and write down which one it uses. If your `agent_pr_review_rate` is trending in a direction you have opinions about and the predicate was never chosen deliberately, you do not yet have a trend. You have a definition. Once you know which direction AI is moving your review quality, the next question is how much review capacity you have to spend on it. [The reviewer-hours ceiling](/blog/review-capacity-agent-throughput/) is where that number lives.

---

## References

### Research and Data

1. [Agarwal et al.: 3100 Opinions on Code Review in an AI World](https://arxiv.org/abs/2607.07980) — From 3,100 coded practitioner documents, argues review is the control point where a coding agent's effect on software is decided and that the team, not the tool, sets the sign. Unrefereed preprint; the authors call it a proposed explanatory theory, not a validated one. Backs the thesis, the 40.1%/21.5% reversal, the governance-policy construct, and P15.
2. [Cassee & Feldt: Exploring the Garden of Forking Paths in Empirical Software Engineering Research](https://arxiv.org/abs/2512.08910) — Re-ran a published SE study across 3,072 defensible analysis pipelines; only 6 (<0.2%) reproduced the original result. TOSEM-accepted. Backs the instability section and identifies the re-analyzed study.
3. [Cassee, Vasilescu, Serebrenik: The Silent Helper](https://doi.org/10.1109/SANER48275.2020.9054818) — Found that with CI introduced, pull requests are discussed less, saving up to one review comment per PR across 685 GitHub projects. This is the code-review finding that later failed to reproduce.
4. [Gelman & Loken: The garden of forking paths](https://sites.stat.columbia.edu/gelman/research/unpublished/p_hacking.pdf) — Researcher degrees of freedom create a multiple-comparisons problem even when only one analysis is run. 2013 unpublished manuscript. Backs the "nobody has to be p-hacking" subsection.
5. [Steegen et al.: Increasing Transparency Through a Multiverse Analysis](https://sites.stat.columbia.edu/gelman/research/published/multiverse_published.pdf) — Isolating a single result from a chain of arbitrary choices can be highly misleading; the method is not a test of research misconduct. The origin of the multiverse framing used here.
6. [Del Giudice & Gangestad: A Traveler's Guide to the Multiverse](https://iris.unito.it/retrieve/e27ce435-58ab-2581-e053-d805fe0acbaa/DelGiudice_Gangestad_2021_guide-to-the-multiverse_ampps.pdf) — Multiverse analyses over non-arbitrary specifications can hide real effects among poorly justified alternatives. Supplies the instability section's own counterargument.
7. [Furia & Torkar: Mitigating Omitted Variable Bias in Empirical Software Engineering](https://arxiv.org/abs/2501.17026) — More datapoints can entrench a biased estimate by shrinking its variance and creating a false impression of reliability. The sign-flip figure is a sensitivity threshold, not an observed reversal.
8. [METR: We are Changing our Developer Productivity Experiment Design](https://metr.org/blog/2026-02-24-uplift-update/) — First-party disclosure that developers opting out of the experiment likely biased its headline estimate, with the bias explicitly bounded. Productivity, not review; cited as a transfer.
9. [Kononenko et al.: Investigating Code Review Quality](https://plg.uwaterloo.ca/~migod/papers/2015/icsme15-OleksiiOlgaLatifa.pdf) — Across 28,127 Mozilla reviews, 54% missed bugs in the approved commits, and less experienced reviewers were more likely to neglect problems. Cited for overall reviewer experience only.
10. [Kononenko, Baysal, Godfrey: Code Review Quality: How Developers See It](https://plg.uwaterloo.ca/~migod/papers/2016/icse16.pdf) — 88 Mozilla developers associate review quality with feedback thoroughness, reviewer familiarity, and perceived code quality. Perception data, paired deliberately with the measured 2015 result.
11. [Fawzy, Tahir, Blincoe: From Prompting to Verification](https://arxiv.org/abs/2605.24521) — Awareness of AI-code risk is broadly distributed while the capacity to evaluate, debug, and verify stays experience-dependent, across 162 participants in three experience groups. Solo verification, not team review.
12. [Chen et al.: Beyond the Commit](https://arxiv.org/abs/2602.03593) — 2,989 survey responses and 11 interviews at BNY Mellon; peer review surfaces as a factor where the same assistant produces different outcomes by seniority. Single-company sample.
13. [Zhong, Noei, Zou, Adams: Human-AI Synergy in Agentic Code Review](https://arxiv.org/abs/2603.15911) — Across 278,790 review conversations in 300 projects, human suggestions are adopted at 56.5% versus 16.6% for AI agents, and over half of unadopted agent suggestions are incorrect or superseded. Pooled averages with no team-level breakdown.
14. [Huang et al.: More Code, Less Reuse](https://arxiv.org/abs/2601.21276) — Agent PRs show 1.87x the average max redundancy of human PRs (0.2867 vs 0.1532, p<0.001) while drawing more positive reviewer sentiment. MSR 2026; sentiment measured with a general-English classifier.
15. [Raees & Papangelis: From Trust to Appropriate Reliance](https://arxiv.org/abs/2604.23896) — Trust measurements do not inform users' appropriate reliance on AI systems; defines RAIR and RSR as objective reliance metrics. Contains no software engineering content.
16. [Kelly et al.: Principles and Guidelines for RCTs in AI Evaluation](https://arxiv.org/abs/2605.02050) — Weak construct validity means a study can show scores rose with AI without credibly claiming capability improved. Names construct underrepresentation and construct-irrelevant variance.
17. [Faros AI: Ten takeaways from the AI Engineering Report 2026](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways) — Two years of telemetry across 22,000 developers finds high-performing organizations deteriorating the same as everyone else, with median time in review up 441.5% and unreviewed merges up 31.3%. Measures all PRs at high-adoption orgs, not agent PRs.
18. [DORA: State of AI-assisted Software Development 2025](https://dora.dev/dora-report-2025/) — Frames AI as an amplifier of an organization's existing strengths and weaknesses. Presented by Google Cloud; self-reported perception data; does not address code review.

### Practitioner Guidance

19. [Kamalı, Tuna, Haratian, Tüzün: Rethinking Code Review in the Age of AI](https://arxiv.org/abs/2605.17548) — Proposes a lifecycle in which reviewers become supervisory operators of agents, with concrete reviewer-selection criteria and a 200-lines-per-hour inspection ceiling. Vision paper with no new data.
20. [Addy Osmani: Agentic Code Review](https://addyosmani.com/blog/agentic-code-review/) — The strongest existing contingency argument: what review is for depends on blast radius, how long the code lives, and how many people need to understand it. Reaches contingency without supplying a diagnostic.
21. [Moderne: AI didn't break coding. It broke code review.](https://moderne.ai/blog/ai-didnt-break-coding-it-broke-code-review) — Canonical statement of the "AI broke review" pole, via Morgan Stanley engineers on 10,000-line prompted PRs. Vendor post; Moderne sells the proposed remedy.
22. [The GitHub Blog: Agent pull requests are everywhere](https://github.blog/ai-and-ml/generative-ai/agent-pull-requests-are-everywhere-heres-how-to-review-them/) — More than one in five code reviews on GitHub now involve an agent. Universal review prescriptions with no conditioning on team characteristics.
23. [Salesforce Engineering: Scaling Code Reviews](https://engineering.salesforce.com/scaling-code-reviews-adapting-to-a-surge-in-ai-generated-code/) — Single-org case study reporting ~30% code-volume growth and declining review time on the largest PRs, read as reviewer disengagement. Never defines who counts as a reviewer; page displays no publication year.
24. [CIO: The code review crisis and how you should rebuild review models](https://www.cio.com/article/4207438/the-code-review-crisis-and-how-you-should-rebuild-review-models.html) — Exec-facing prescription to rebuild review workflows, with one real metric check pairing acceptance rate against post-merge defect rate.

### Author's Judgment (not directly sourced)

The following claims are my own synthesis. They follow logically from the sourced material above, but no source states them directly:

- **"Measure the bot on your own repo"**: follows from Zhong et al.'s disclosed pooling limitation (300 projects, no team-level breakdown, generalization caveat), not from any finding they report.
- **"Score reliance, not trust, in code review"**: adapting RAIR and RSR from Raees & Papangelis to review comments is my transfer; that paper contains zero software engineering content.
- **"Solo verification behavior transfers to team review"**: Fawzy et al. measured individuals verifying their own AI-generated code, not review rotations. The mechanism is theirs; the extension to a team's review numerator is mine.
- **"The six-question diagnostic"**: assembled from the CMU paper's three proposed moderators, the construct-validity failure in the review-rate definition, and the multiverse instability result. No source packages these as an instrument.

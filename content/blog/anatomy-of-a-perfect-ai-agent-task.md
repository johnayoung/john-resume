---
title: "The Anatomy of a Perfect AI Agent Task"
date: 2026-04-20
draft: false
author: "John Young"
description: "Context engineering for AI coding agents — the elements that make a task succeed on the first try, with a fully worked example."
keywords: ["AI coding agents", "context engineering", "Claude Code", "prompt engineering", "agentic workflows"]
---

A well-crafted task for an AI coding agent is essentially context engineering — you're deliberately curating the minimum set of information the agent needs to produce the right output on the first try. Rather than pre-loading everything up front, the best approach combines focused instructions with enough pointers that the agent can pull in additional context just-in-time as it works ([Anthropic — Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)). Below is a breakdown of every element that matters, why it matters, and a full example at the end that ties it all together.

---

## When to Use This

The eight elements below describe the upper-bound shape of a non-trivial task spec, not a baseline checklist. For trivial work — anything you could describe in a single sentence — skip the elaborate spec. The Claude Code best practices put it bluntly: "If you could describe the diff in one sentence, skip the plan" ([Claude Code Docs: Best Practices](https://code.claude.com/docs/en/best-practices)). Even for non-trivial tasks, treat these elements as a maximum rather than a minimum: frontier LLMs reliably follow only ~150–200 instructions before performance degrades, and every irrelevant detail dilutes the signal of the rest ([HumanLayer: Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)).

---

## 1. State the Goal, Not the Steps

Lead with the *outcome* you want, not a micro-managed sequence of instructions. Agents perform better when they understand the "why" and can plan their own approach.

**Bad:** "Open `user.go`, find the `CreateUser` function, add a field called `PhoneNumber`..."
**Good:** "Add phone number support to user registration, including validation, storage, and API response."

> *"The best task descriptions share three properties: they state the goal, provide constraints, and define done."*
> — [Claude Directory: Context Engineering for Claude Code](https://www.claudedirectory.org/blog/context-engineering-claude-code)

---

## 2. Provide Architectural Context the Agent Can't Infer

The agent can read your code. What it *can't* read is the reasoning behind your architectural decisions, team conventions, or the "why" behind structural choices. Include only what's not derivable from the codebase itself.

Include things like:

- **Why** the architecture is shaped a certain way (e.g., "We use the repository pattern to keep DB logic out of handlers")
- **Relevant files and entry points** (saves the agent from searching blindly and burning context window)
- **Technology choices and versions** (e.g., "Go 1.22, sqlc for query generation, chi router")
- **Domain-specific terminology** the agent might misinterpret

> *"Claude already knows what your project is after reading a few files. What it needs is information it can't derive from reading code."*
> — [Claude Directory: Context Engineering](https://www.claudedirectory.org/blog/context-engineering-claude-code)

That said, there's a discipline to this — more context is not always better. Research suggests frontier LLMs can reliably follow roughly 150–200 instructions before performance degrades, and broader context-rot studies show models attend to context less reliably as input grows ([Chroma: Context Rot — Hong et al., 2025](https://research.trychroma.com/context-rot)). Every irrelevant detail you add dilutes the signal of the details that actually matter.

> *"Your CLAUDE.md file should contain as few instructions as possible — ideally only ones which are universally applicable. An LLM will perform better when its context window is full of focused, relevant context compared to when it has a lot of irrelevant context."*
> — [HumanLayer: Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)

---

## 3. Define Explicit Constraints and Non-Goals

This is where most tasks fall apart. Without boundaries, agents will happily refactor your auth layer while you asked them to add a field to a struct.

- **Constraints:** What rules must be followed (e.g., "Do not change the public API contract," "Use the existing `validate` package, do not introduce a new dependency")
- **Non-goals:** What is explicitly out of scope (e.g., "Do not modify the frontend," "Do not refactor existing tests")

> *"Without constraints, AI might miss pagination for list APIs, use field injection instead of constructor injection, or not adhere to your project's package structure."*
> — [JetBrains: Coding Guidelines for AI Agents](https://blog.jetbrains.com/idea/2025/05/coding-guidelines-for-your-ai-agents/)

---

## 4. Provide Concrete Examples and Reference Implementations

One of the highest-leverage things you can do. Point the agent at an existing implementation in your codebase that follows the pattern you want replicated.

- "Follow the same pattern as `internal/order/handler.go` for the new endpoint."
- "See `migrations/003_add_email.sql` for the migration format we use."

> *"Include helpful examples for reference. ❌ 'Implement tests for class ImageProcessor' → ✅ 'Implement tests for class ImageProcessor. Check text_processor.py for test organization examples.'"*
> — [Augment Code: Best Practices for AI Coding Agents](https://www.augmentcode.com/blog/best-practices-for-using-ai-coding-agents)

---

## 5. Define "Done" with Acceptance Criteria

If you don't define what "done" looks like, the agent will decide for you — and you probably won't agree.

Acceptance criteria should be:
- **Observable** (can be verified by running something)
- **Specific** (not "should work correctly")
- **Testable** (ideally map to test cases)

> *"Create a set of tests that will determine if the generated code works based on your requirements."*
> — [Google Cloud: Five Best Practices for AI Coding Assistants](https://cloud.google.com/blog/topics/developers-practitioners/five-best-practices-for-using-ai-coding-assistants)

---

## 6. Include Verification Commands

Tell the agent exactly how to confirm its own work. This is the difference between "I think it works" and "it passes the build."

- `go test ./internal/user/...`
- `go vet ./...`
- `golangci-lint run`
- `curl -X POST localhost:8080/api/v1/users -d '{"phone": "+1234567890"}' | jq .`

> *"Claude Code's best practices emphasize including Bash commands for verification. This gives Claude persistent context it can't infer from code alone."*
> — [Claude Code Docs: Best Practices](https://code.claude.com/docs/en/best-practices)

---

## 7. Specify Commit Strategy and Milestones

For anything non-trivial, break the work into verifiable checkpoints. This prevents the catastrophic scenario where a 500-line change has a subtle bug in step 2 and everything after it is wasted. At each milestone boundary in multi-milestone work, start a fresh session to avoid accumulating irrelevant context across the full feature ([Claude Code Docs: Best Practices](https://code.claude.com/docs/en/best-practices)).

> *"When implementing large changes with an Agent, avoid accumulating review debt by reviewing changes after each sub-task."*
> — [Augment Code: Best Practices](https://www.augmentcode.com/blog/best-practices-for-using-ai-coding-agents)

---

## 8. Call Out Edge Cases and Known Pitfalls

You know things about your system the agent doesn't. If there's a footgun, flag it. If there's a non-obvious coupling between modules, say so.

- "The `user_id` column has a unique constraint — the migration must handle existing duplicates."
- "The `Validate()` method is called both at the handler level and inside the repository. Don't double-validate."

---

## The Full Example

A non-trivial feature decomposes into a handful of well-sized tasks. Take adding an optional phone number to user registration — accepted on signup, persisted on the user record, and returned by the user API. That feature splits into four tasks, one per architectural layer:

1. **Migration** — Add a nullable `phone_number` column with reversible up/down SQL.
2. **Model + sqlc** — Update the `User` struct and regenerate sqlc queries.
3. **Service + validation** — Add `ValidatePhone` to `UserService` using `validate.PhoneE164`, with unit tests.
4. **Handler + integration** — Wire the field through `POST` and `GET /api/v1/users` and add integration tests.

The third is spec'd out in full below as the worked example. It's the strongest illustration of the eight elements at the right scope: the diff fits in one sentence, it stays inside a single layer, the agent reads ~5 files, the change lands well under the 200 LOC ceiling, and it can be verified independently — passing every gate of the [companion sizing post's decision flowchart](/blog/how-to-size-tasks-for-ai-coding-agents/#sizing-decision-flowchart).

````markdown
## Task Spec: Add E.164 phone validation to UserService

### Goal
Add `ValidatePhone` to `UserService`, wrapping the internal
`validate.PhoneE164` helper. Service-layer slice of the
phone-number feature; handler and DB layers are separate tasks.

### Architectural Context
- Go 1.22, layered: `handler → service → repository`.
- Semantic validation lives in the service. The handler does
  only null/shape checks.
- `validate.PhoneE164(string) error` already exists in
  `internal/pkg/validate/` and returns `*validate.Error`. No
  third-party validation libraries.
- Service tests use stdlib `testing` plus the existing
  `internal/user/mocks` package — no testify, no ginkgo.

### Relevant Files
- `internal/user/service.go` — add `ValidatePhone` here.
- `internal/user/service_test.go` — add tests here.
- `internal/pkg/validate/phone.go` — read-only reference for
  `PhoneE164` and `validate.Error`.

### Reference Implementation
Mirror `UserService.ValidateEmail` in `service.go`:
- Signature: `func (s *UserService) ValidatePhone(phone *string) error`.
- Nil pointer → return nil. Empty string → return error.
- Return the `*validate.Error` from `PhoneE164` unwrapped — no
  `fmt.Errorf`.
- Copy the table-driven layout from
  `TestUserService_ValidateEmail`.

### Constraints
- Use `validate.PhoneE164`. No regex, no new dependencies.
- Don't touch `UserRepository` or its mock — validation is pure.
- Don't wrap the error; the handler relies on
  `errors.As(&validate.Error{})` to map it to HTTP 422.

### Non-Goals
No handler, migration, sqlc, or integration-test changes. No
edits to `ValidateEmail` or other unrelated methods.

### Edge Cases
- `phone == nil` → return nil (field not provided).
- `*phone == ""` → return `validate.Error` (malformed input).
- Strict E.164: `1234567890` (no leading `+`) must fail.
- The handler already checks the JSON field is present and is a
  string — don't re-check those concerns here.

### Acceptance Criteria
1. `ValidatePhone(phone *string) error` on `UserService`.
2. `nil` phone → returns nil.
3. Empty or non-E.164 → returns `*validate.Error`
   (verifiable via `errors.As`).
4. Valid E.164 (e.g., `+14155552671`) → returns nil.
5. At least four test cases: valid, invalid, nil, empty.
6. Only `service.go` and `service_test.go` change.

### Verification
    go test ./internal/user/... -v -run TestValidatePhone
    go vet ./...
    golangci-lint run ./internal/user/...

### Commit Strategy
Two commits, one PR: failing tests first, then implementation.
````

---

## Why This Works

| Element                      | Purpose                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------- |
| **Goal**                     | Anchors the agent on *what* and *why*, not *how*                             |
| **Architectural context**    | Provides knowledge the agent can't infer from code                           |
| **Relevant files**           | Eliminates unnecessary exploration and context burn                          |
| **Reference implementation** | "Do it like this" is worth 1,000 words of description                        |
| **Constraints + non-goals**  | Prevents scope creep and unsolicited refactors                               |
| **Edge cases**               | Surfaces domain knowledge only you have                                      |
| **Acceptance criteria**      | Defines "done" in observable, testable terms                                 |
| **Verification commands**    | Lets the agent self-check before declaring victory                           |
| **Commit strategy**          | Creates safe rollback points within the task and forces incremental progress |

---

## References

1. [Anthropic — Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — Why just-in-time context retrieval and focused instructions outperform pre-loading everything into the prompt.
2. [Claude Code Docs — Best Practices](https://code.claude.com/docs/en/best-practices) — Including verification commands and CLAUDE.md conventions so the agent can self-check its work.
3. [Claude Directory — Context Engineering for Claude Code](https://www.claudedirectory.org/blog/context-engineering-claude-code) — The task trifecta: state the goal, provide constraints, define done.
4. [Augment Code — Best Practices for Using AI Coding Agents](https://www.augmentcode.com/blog/best-practices-for-using-ai-coding-agents) — Pointing agents at reference implementations and reviewing changes after each sub-task.
5. [JetBrains — Coding Guidelines for Your AI Agents](https://blog.jetbrains.com/idea/2025/05/coding-guidelines-for-your-ai-agents/) — How missing constraints lead agents to skip pagination, misuse injection patterns, and ignore project conventions.
6. [Google Cloud — Five Best Practices for AI Coding Assistants](https://cloud.google.com/blog/topics/developers-practitioners/five-best-practices-for-using-ai-coding-assistants) — Planning-first workflow and using tests as acceptance criteria for generated code.
7. [HumanLayer — Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) — Why fewer, focused instructions outperform instruction overload, and the ~150–200 instruction ceiling for frontier models.
8. [Chroma — Context Rot (Hong et al., 2025)](https://research.trychroma.com/context-rot) — Empirical study across 18 LLMs showing that attention to context degrades non-uniformly as input length grows.

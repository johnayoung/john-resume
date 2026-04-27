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

That said, there's a discipline to this — more context is not always better. Research suggests frontier LLMs can reliably follow roughly 150–200 instructions before performance degrades. Every irrelevant detail you add dilutes the signal of the details that actually matter.

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

For anything non-trivial, break the work into verifiable checkpoints. This prevents the catastrophic scenario where a 500-line change has a subtle bug in step 2 and everything after it is wasted.

> *"When implementing large changes with an Agent, avoid accumulating review debt by reviewing changes after each sub-task."*
> — [Augment Code: Best Practices](https://www.augmentcode.com/blog/best-practices-for-using-ai-coding-agents)

---

## 8. Call Out Edge Cases and Known Pitfalls

You know things about your system the agent doesn't. If there's a footgun, flag it. If there's a non-obvious coupling between modules, say so.

- "The `user_id` column has a unique constraint — the migration must handle existing duplicates."
- "The `Validate()` method is called both at the handler level and inside the repository. Don't double-validate."

---

## The Full Example

Here's what all of this looks like assembled into a **feature spec** — a non-trivial unit of work that decomposes into four task specs (one per milestone), each sized for a single session and PR per the [companion sizing guide](/blog/how-to-size-tasks-for-ai-coding-agents/):

````markdown
## Feature Spec: Add Phone Number to User Registration

### Goal
Add optional phone number support to the user registration flow.
Users should be able to provide a phone number during signup.
The phone number must be validated (E.164 format), persisted, and
returned in the API response.

### Architectural Context
- This is a Go 1.22 project using chi for routing and sqlc for
  query generation.
- The codebase follows a layered architecture:
  `handler → service → repository`. Business logic lives in the
  service layer, not handlers.
- Database: PostgreSQL 16. Migrations use golang-migrate and live
  in `migrations/`.
- Validation uses our internal `validate` package
  (`internal/pkg/validate/`). Do not introduce a third-party
  validation library.

### Relevant Files
- `internal/user/handler.go` — HTTP handler for user endpoints
- `internal/user/service.go` — Business logic layer
- `internal/user/repository.go` — DB access via sqlc
- `internal/user/model.go` — User struct and domain types
- `db/queries/user.sql` — sqlc query definitions
- `db/sqlc/user.sql.go` — Generated code (do not edit directly)
- `internal/pkg/validate/phone.go` — Existing phone validation
  (E.164 format). Use this.

### Reference Implementation
Follow the exact same pattern used when `email` was added:
- Migration: `migrations/004_add_user_email.up.sql`
- sqlc query change: see the `UpdateUserEmail` query in
  `db/queries/user.sql`
- Handler pattern: see `HandleUpdateEmail` in
  `internal/user/handler.go`

### Constraints
- The phone number field is OPTIONAL. Existing users without a
  phone number must not break.
- Do not change the public API response shape for other endpoints.
  Only `POST /api/v1/users` and `GET /api/v1/users/:id` should
  include the new field.
- Do not refactor existing code. The only acceptable changes are
  additive.
- After modifying `db/queries/user.sql`, regenerate sqlc output
  with `make sqlc`.
- The migration must be reversible (provide both `.up.sql` and
  `.down.sql`).

### Non-Goals
- No frontend changes.
- No SMS verification flow (that's a separate task).
- No changes to the admin panel.

### Edge Cases
- Phone number should be stored as a nullable column
  (`VARCHAR(20)`). Do not default to empty string.
- The `validate.PhoneE164()` function returns a
  `validate.Error` — handle it the same way email validation
  errors are handled in the handler (return 422 with the
  validation error payload).
- Duplicate phone numbers ARE allowed (unlike email). Do not add
  a unique constraint.

### Acceptance Criteria
1. `POST /api/v1/users` accepts an optional `phone_number` field.
2. Invalid phone numbers (non-E.164) return HTTP 422 with a
   structured error.
3. `GET /api/v1/users/:id` includes `phone_number` in the
   response (null if not set).
4. Migration applies and rolls back cleanly.
5. All existing tests continue to pass.
6. New tests cover: valid phone, invalid phone, missing phone
   (null), and the GET response shape.

### Verification
Run these after each milestone. All must pass before considering
the task complete:

    go test ./internal/user/... -v
    go vet ./...
    golangci-lint run ./internal/user/...
    make sqlc  # must produce no diff
    migrate -path migrations -database $DB_URL up
    migrate -path migrations -database $DB_URL down 1

### Task Specs (each is its own session and PR)
This feature decomposes into four task specs. Each is independently
verifiable, sized to roughly one PR, and run in a fresh session:

1. **Migration** — Add the column, verify migrate up/down.
2. **Model + sqlc** — Update the struct, sqlc queries, and
   regenerate. Verify `make sqlc` produces no diff.
3. **Service + validation** — Add phone validation logic in the
   service layer. Unit test it.
4. **Handler + integration** — Wire up the handler, write
   integration tests, verify the full flow with curl.
````

---

## Why This Works

| Element                      | Purpose                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| **Goal**                     | Anchors the agent on *what* and *why*, not *how*             |
| **Architectural context**    | Provides knowledge the agent can't infer from code           |
| **Relevant files**           | Eliminates unnecessary exploration and context burn          |
| **Reference implementation** | "Do it like this" is worth 1,000 words of description        |
| **Constraints + non-goals**  | Prevents scope creep and unsolicited refactors               |
| **Edge cases**               | Surfaces domain knowledge only you have                      |
| **Acceptance criteria**      | Defines "done" in observable, testable terms                 |
| **Verification commands**    | Lets the agent self-check before declaring victory           |
| **Milestones**               | Creates safe rollback points and forces incremental progress |

---

## References

1. [Anthropic — Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — Why just-in-time context retrieval and focused instructions outperform pre-loading everything into the prompt.
2. [Claude Code Docs — Best Practices](https://code.claude.com/docs/en/best-practices) — Including verification commands and CLAUDE.md conventions so the agent can self-check its work.
3. [Claude Directory — Context Engineering for Claude Code](https://www.claudedirectory.org/blog/context-engineering-claude-code) — The task trifecta: state the goal, provide constraints, define done.
4. [Augment Code — Best Practices for Using AI Coding Agents](https://www.augmentcode.com/blog/best-practices-for-using-ai-coding-agents) — Pointing agents at reference implementations and reviewing changes after each sub-task.
5. [JetBrains — Coding Guidelines for Your AI Agents](https://blog.jetbrains.com/idea/2025/05/coding-guidelines-for-your-ai-agents/) — How missing constraints lead agents to skip pagination, misuse injection patterns, and ignore project conventions.
6. [Google Cloud — Five Best Practices for AI Coding Assistants](https://cloud.google.com/blog/topics/developers-practitioners/five-best-practices-for-using-ai-coding-assistants) — Planning-first workflow and using tests as acceptance criteria for generated code.
7. [HumanLayer — Writing a Good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md) — Why fewer, focused instructions outperform instruction overload, and the ~150–200 instruction ceiling for frontier models.

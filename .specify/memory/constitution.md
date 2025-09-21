<!--
Sync Impact Report

- Version change: 2.1.1 -> 2.1.2
- Modified principles: Defined and clarified all principle sections (1..5)
- Added sections: `Constraints & Standards`, `Development Workflow`
- Removed sections: none
- Templates checked:
	- .specify/templates/plan-template.md -> ✅ updated (version string)
	- .specify/templates/spec-template.md  -> ✅ checked (no changes required)
	- .specify/templates/tasks-template.md -> ✅ checked (no changes required)
	- .specify/templates/agent-file-template.md -> ✅ checked (no changes required)
- Follow-up TODOs:
	- TODO(RATIFICATION_DATE): Original ratification date unknown — maintainers must fill.
	- Manual review: agent-specific guidance files (CLAUDE.md / copilot instructions) if present.
-->

# OpenHack Participants Constitution

## Core Principles

### I. Library-First

All new features and capabilities MUST be developed as independently
versioned libraries or modules when practical. A library MUST expose a
well-documented public API, include unit tests that cover the contract,
and contain examples demonstrating intended use. Libraries MUST be
designed for reuse and independent testing; ad-hoc repository-scope
utilities are forbidden unless justified in the complexity tracker.

Rationale: Library-first design enforces clear contracts, enables
reliable testing, and reduces coupling across the codebase.

### II. CLI-First Interfaces

Every tool or library that provides user-facing workflows MUST expose a
command-line interface (CLI) or equivalent programmatic API. CLI
interactions MUST follow these conventions: stdin/args for input,
stdout for primary results, and stderr for diagnostics. All CLI tools
MUST support a machine-readable output mode (JSON) and a human-friendly
mode.

Rationale: CLI-first ensures automation, scriptability, and consistent
integration points for CI and developer workflows.

### III. Test-First (NON-NEGOTIABLE)

Tests MUST be written before implementation for all new features and
for bug fixes that affect behavior. A change is not considered
complete until tests exist that would have caught the issue and they
pass in CI. Tests MUST be deterministic, fast (unit tests), and
clearly scoped. Integration and contract tests are required where
components interact across boundaries.

Rationale: Test-first practice prevents regressions and documents
expected behavior in a verifiable way.

### IV. Integration & Contract Testing

Contract tests, end-to-end integration tests, and API schema checks
MUST accompany changes that alter public contracts or inter-service
communication. Integration tests MUST run in CI and may use lightweight
stubs or in-memory fixtures where appropriate. Breaking contract
changes require a documented migration plan and coordinated release.

Rationale: Integration testing protects consumers and keeps contracts
explicit and verifiable.

### V. Observability, Versioning & Simplicity

The project MUST emit structured logs that include correlation IDs for
cross-service flows and expose actionable metrics for key business
paths. Versioning MUST follow SemVer (MAJOR.MINOR.PATCH):

- MAJOR for breaking governance/principle removals or incompatible API
  changes.
- MINOR for new, backwards-compatible principles or features.
- PATCH for wording clarifications, typo fixes, and non-semantic edits.

Design decisions MUST favor simplicity: prefer the smallest reliable
surface area that satisfies requirements (YAGNI). Complexity must be
justified in writing and approved by maintainers.

Rationale: Observability and clear versioning are essential for safe
evolution; simplicity reduces maintenance burden.

## Constraints & Standards

Technology choices SHOULD prefer stable, widely-supported runtimes. The
recommended baseline is:

- Languages: Python 3.11+ and/or Node.js 18+ where applicable.
- Packaging: containerized artifacts (OCI images) for services.
- CI: All PRs MUST run unit, integration, and linting gates.
- Security: Dependabot or similar automated scanning, pinned
  dependencies for releases, and SCA checks in CI.
- Performance goals: p95 request latency < 200ms for core APIs unless
  otherwise documented in the feature spec.

These are guidelines, not strict requirements — deviations must be
documented and approved.

## Development Workflow

- All contributions via pull requests against the main development
  branch.
- PRs MUST include a linked issue or spec, a description of the
  change, and a testing plan.
- CI gates: tests (unit + integration), linting, and security scans
  MUST pass before merge.
- Code review: at least one approving reviewer; for governance-impacting
  changes (principles, versioning) two maintainers MUST approve.
- Releases: follow SemVer and include a changelog entry describing
  user-visible changes and migration notes for breaking changes.

## Governance

The constitution is the authoritative guidance for project practices.
Amendments MUST follow this process:

1. Propose: Open an RFC-style pull request that edits this file and
   includes a migration plan for any breaking changes.
2. Discussion: Allow at least 14 days for review and discussion.
3. Approval: For non-governance edits (clarifications, typos) a
   majority of active maintainers may approve. For principle removals
   or redefinitions a 2/3 majority of active maintainers is required.
4. Ratification: Once approved, update the `Last Amended` date and
   bump the `CONSTITUTION_VERSION` according to SemVer rules. If the
   original ratification date is unknown, maintainers MUST populate it
   as a follow-up.

Compliance: All PRs that touch code or process MUST include a
Constitution Check summary in the PR description describing how the
change conforms to principles. Automated checks (see
`.specify/templates/plan-template.md`) should be used where possible
to enforce gates.

**Version**: 2.1.2 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-09-21

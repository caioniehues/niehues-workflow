---
name: nexus-specify-extended
description: Create comprehensive, testable specifications with automatic sharding
tools: Read, Write, Task, TodoWrite
implementation: .claude/commands/nexus-specify-extended.md
---

# /nexus-specify-extended [feature]

Transform approaches into formal specifications with test criteria.

<requirement_definition>
  For each requirement:
  - Unique ID (FR-XXX, NFR-XXX)
  - Clear description
  - Testable acceptance criteria
  - Edge cases documented
  - Error conditions specified
  - Performance thresholds
</requirement_definition>

<sharding_strategy>
  If specification > 500 lines:

  Epic Level (.nexus/specs/sharded/epics/):
  - High-level overview
  - Story links
  - Cross-cutting concerns

  Story Level (.nexus/specs/sharded/stories/):
  - Detailed requirements
  - Test specifications
  - Implementation notes

  Maintain bidirectional links
</sharding_strategy>

<test_specification>
  Define comprehensive test strategy:
  - Unit test requirements
  - Integration scenarios
  - E2E test cases
  - Performance benchmarks
  - Security test cases
  - Mock/stub definitions
</test_specification>

<api_contracts>
  For each endpoint:
  - Request format
  - Response format
  - Validation rules
  - Error responses
  - Rate limits
  - Authentication
</api_contracts>
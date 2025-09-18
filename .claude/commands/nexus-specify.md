---
name: nexus-specify
description: Create formal, testable specifications with acceptance criteria
tools: Read, Write, Task, TodoWrite
implementation: .claude/commands/nexus-specify.md
---

# /nexus-specify [feature]

Transform brainstormed approaches into formal, testable specifications.

<pre_flight>
  <check id="brainstorm_exists">
    Check for recent brainstorm on topic
    Load brainstorm context if available
  </check>

  <check id="selected_approach">
    Identify which approach to specify
    If unclear: Ask for clarification
  </check>
</pre_flight>

<process_flow>
  <step number="1" subagent="specification-agent">
    **Create Functional Requirements**

    For each requirement:
    - Unique identifier (FR-001, FR-002...)
    - Clear description
    - Testable acceptance criteria
    - Edge cases
    - Error conditions
    - Performance requirements
  </step>

  <step number="2" subagent="api-designer">
    **Design API Contracts**

    Define:
    - Endpoint specifications
    - Request/response formats
    - Data models
    - Validation rules
    - Error responses
    - Rate limiting
  </step>

  <step number="3" subagent="test-strategist">
    **Define Test Strategy**

    Specify:
    - Unit test requirements
    - Integration test scenarios
    - E2E test cases
    - Performance benchmarks
    - Security test cases
    - Mock/stub strategy
  </step>

  <step number="4" subagent="questioning-agent">
    **Clarification Questions**

    Resolve any ambiguities:
    - Unclear requirements
    - Missing edge cases
    - Undefined behaviors
    - Integration uncertainties

    Continue until specification complete
  </step>

  <step number="5">
    **Generate Specification Document**

    Structure:
    # Feature: [Name]
    Version: 1.0
    Date: [timestamp]
    Status: Draft

    ## Overview
    [Feature description]

    ## Functional Requirements
    [All FRs with acceptance criteria]

    ## Non-Functional Requirements
    - Performance
    - Security
    - Scalability
    - Maintainability

    ## API Specifications
    [Complete API documentation]

    ## Data Models
    [All data structures]

    ## Test Requirements
    [Test strategy and cases]

    ## Dependencies
    [External dependencies]

    ## Risks
    [Identified risks and mitigations]
  </step>

  <step number="6">
    **Sharding Decision**

    If specification > 500 lines:
    - Create epic-level shard
    - Break into story shards
    - Maintain linking structure

    Save to appropriate location:
    - Monolithic: .nexus/specs/monolithic/
    - Sharded: .nexus/specs/sharded/
  </step>

  <step number="7">
    **Update Decision Log**

    Record in .nexus/decision-log.md:
    - Specification decisions
    - Trade-offs made
    - Assumptions documented
  </step>
</process_flow>

<gates>
  <gate id="testability">
    All requirements have test criteria
  </gate>
  <gate id="completeness">
    No undefined behaviors
  </gate>
  <gate id="approval">
    User reviews and approves specification
  </gate>
</gates>
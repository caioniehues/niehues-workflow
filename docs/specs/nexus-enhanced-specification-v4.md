# Nexus Enhanced Workflow Specification v4.0

**Date:** 2025-09-18 09:16:58 WEST
**Status:** Production-Ready Implementation Specification
**Philosophy:** Quality through unlimited questioning, constitutional TDD, and continuous evolution

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Principles](#core-principles)
3. [Constitutional Framework](#constitutional-framework)
4. [Pipeline Architecture](#pipeline-architecture)
5. [Command Specifications](#command-specifications)
6. [Agent System](#agent-system)
7. [Task Management](#task-management)
8. [Evolution System](#evolution-system)
9. [Implementation Guide](#implementation-guide)
10. [Success Metrics](#success-metrics)

---

## Executive Summary

Nexus is a self-improving development workflow that learns from your patterns and evolves to match your needs. Built on the foundations of 10 analyzed workflow systems, it combines:

- **Unlimited Adaptive Questioning** - No arbitrary limits on understanding
- **Constitutional TDD Enforcement** - Tests are law, not suggestion
- **Specialized Sequential Agents** - Each agent does one thing perfectly
- **Smart Parallelization** - Sequential by default, parallel when beneficial ([P] marking)
- **Continuous Evolution** - The workflow improves itself through reflection

### Key Differentiators

1. **No Fake Metrics** - We use High/Medium/Low, not imaginary percentages
2. **Context Preservation** - Every task includes its specification context
3. **Pattern Learning** - Successful patterns become reusable templates
4. **Agent Suggestions** - The system suggests new specialized agents as needed
5. **Workflow Reflection** - After each cycle, the system suggests improvements

---

## Core Principles

<principles>
  <principle id="1">
    ### Question Everything, Assume Nothing
    - Continue questioning until complete understanding
    - No limits on clarification rounds
    - Every ambiguity must be resolved
    - Stop immediately on uncertainty
  </principle>

  <principle id="2">
    ### Tests Before Code, Always
    - TDD is constitutional law
    - System blocks code without tests
    - RED → GREEN → REFACTOR cycle
    - Tests define the specification
  </principle>

  <principle id="3">
    ### Sequential Default, Parallel When Beneficial
    - One step at a time unless marked [P]
    - Parallel execution for independent tasks
    - Clear dependency chains
    - No parallel-for-parallel's-sake
  </principle>

  <principle id="4">
    ### Learn and Evolve
    - Extract patterns from success
    - Learn from failures
    - Suggest workflow improvements
    - Create specialized agents as needed
  </principle>
</principles>

---

## Constitutional Framework

```markdown
# .nexus/constitution.md
Generated: 2025-09-18 09:16:58 WEST
Status: IMMUTABLE

<constitution version="4.0">
  <immutable_laws>

    <law id="TDD" enforcement="blocking">
      ## Test-Driven Development

      No code shall be written without a failing test.

      <gates>
        <gate phase="implementation">
          <check>
            IF NOT exists({feature}_test.{ext}) THEN
              ERROR: "Create test file first: {expected_test_path}"
              SUGGEST: "Write test for: {requirement}"
          </check>

          <check>
            IF test_status != "failing" THEN
              ERROR: "Test must fail first (RED phase)"
              HELP: "Verify test actually tests the requirement"
          </check>

          <check>
            IF NOT user_approved THEN
              ASK: "Does this test correctly specify the requirement? (y/n)"
              IF response == "n" THEN
                ASK: "What should the test verify?"
          </check>
        </gate>
      </gates>
    </law>

    <law id="QUESTIONING" enforcement="required">
      ## Unlimited Adaptive Questioning

      Understanding must be complete before implementation.

      <triggers>
        <trigger pattern="vague_terms">
          Words: ["some", "various", "etc", "somehow"]
          Action: REQUEST_CLARIFICATION
        </trigger>

        <trigger pattern="overloaded_terms">
          Terms: ["auth", "user", "process", "handle"]
          Action: REQUEST_SPECIFIC_MEANING
        </trigger>

        <trigger pattern="missing_criteria">
          Missing: ["success condition", "failure mode", "edge case"]
          Action: DEFINE_ACCEPTANCE_CRITERIA
        </trigger>
      </triggers>
    </law>

    <law id="CONTEXT" enforcement="required">
      ## Context Preservation

      Every artifact must include its context.

      <requirements>
        - Tasks include specification excerpts
        - Decisions include rationale
        - Patterns include usage examples
        - Agents include trigger conditions
      </requirements>
    </law>

  </immutable_laws>

  <amendable_guidelines>
    <!-- Can be modified through evolution system -->
    - Prefer composition over inheritance
    - Functions under 50 lines (guideline)
    - Files under 500 lines (guideline)
    - Document WHY, not WHAT
    - Early returns over nested conditionals
  </amendable_guidelines>
</constitution>
```

---

## Pipeline Architecture

<pipeline version="4.0">

  <phases>
    ```
    BRAINSTORM → SPECIFY → DECOMPOSE → IMPLEMENT → VALIDATE → EVOLVE
         ↓          ↓         ↓           ↓          ↓         ↓
    [Explore]  [Define]  [Break Down]  [Build]   [Verify]  [Learn]
    ```
  </phases>

  <phase_details>

    <phase name="BRAINSTORM">
      <purpose>Generate multiple approaches through unlimited questioning</purpose>

      <agents>
        1. questioning-agent [unlimited iterations]
        2. pattern-detector [if patterns exist]
        3. code-archaeologist [if existing codebase]
      </agents>

      <outputs>
        - .nexus/brainstorms/[timestamp]-[topic].md
        - Selected approaches (1-3)
        - Identified constraints
        - Risk assessment
      </outputs>

      <parallel_opportunities>
        Research approaches can run in parallel:
        - [P] Research conventional approach
        - [P] Research optimal approach
        - [P] Research pragmatic approach
      </parallel_opportunities>
    </phase>

    <phase name="SPECIFY">
      <purpose>Create formal, testable requirements</purpose>

      <agents>
        1. specification-agent
        2. api-designer [if API work]
        3. test-strategist
        4. questioning-agent [for clarifications]
      </agents>

      <template>
        # Specification: {feature_name}
        Generated: {timestamp}

        ## Functional Requirements

        <requirement id="FR-001">
          Description: User must be able to login with email/password

          <test_criteria>
            - Valid credentials return JWT token
            - Invalid credentials return 401 error
            - Token expires after 24 hours
          </test_criteria>

          <edge_cases>
            - Email not found
            - Wrong password
            - Account locked
            - Network timeout
          </edge_cases>
        </requirement>
      </template>

      <outputs>
        - .nexus/specs/[feature]/specification.md
        - API contracts (if applicable)
        - Data models
        - Test strategies
      </outputs>
    </phase>

    <phase name="DECOMPOSE">
      <purpose>Break specifications into atomic, testable tasks</purpose>

      <agents>
        1. dependency-analyzer
        2. test-strategist
        3. task-estimator
        4. parallelization-optimizer
      </agents>

      <task_generation>
        <rules>
          - Every implementation task needs test task
          - Tasks should be 30min - 4hrs
          - Mark independent tasks with [P]
          - Include spec context in each task
        </rules>

        <example>
          ## Epic: User Authentication

          ### Test Tasks [TDD: RED Phase]
          - T001: [P] Write user model tests (2h)
            Context: FR-001, FR-002
          - T002: [P] Write auth controller tests (2h)
            Context: FR-003, FR-004
          - T003: [P] Write JWT service tests (1h)
            Context: FR-005

          ### Implementation Tasks [TDD: GREEN Phase]
          - T004: Implement user model (3h)
            Depends: T001
          - T005: Implement auth controller (3h)
            Depends: T002
          - T006: Implement JWT service (2h)
            Depends: T003

          ### Integration Tasks
          - T007: End-to-end auth flow tests (2h)
            Depends: T004, T005, T006
          - T008: [P] API documentation (1h)
          - T009: [P] Update README (30min)
        </example>
      </task_generation>

      <outputs>
        - .nexus/tasks/[feature]-tasks.md
        - Dependency graph
        - Critical path analysis
        - Parallel execution plan
      </outputs>
    </phase>

    <phase name="IMPLEMENT">
      <purpose>Execute tasks following TDD cycle</purpose>

      <tdd_cycle>
        <red>
          Agent: test-writer
          Creates: Failing test that specifies behavior
          Gate: User must approve test
        </red>

        <green>
          Agent: implementation-writer
          Creates: Minimal code to pass test
          Constraint: NO extra functionality
        </green>

        <refactor>
          Agent: refactoring-specialist
          Improves: Code structure
          Constraint: Tests must stay green
        </refactor>
      </tdd_cycle>

      <parallel_execution>
        Tasks marked [P] execute simultaneously:
        - Each gets dedicated agent instance
        - No shared state between parallel tasks
        - Results merge after completion
      </parallel_execution>

      <outputs>
        - Implemented feature code
        - Passing tests
        - Updated task status
        - Decision log entries
      </outputs>
    </phase>

    <phase name="VALIDATE">
      <purpose>Verify quality and compliance</purpose>

      <checks>
        - All tests passing
        - Coverage acceptable (80% guideline)
        - No constitutional violations
        - Documentation updated
        - Patterns extracted
      </checks>

      <outputs>
        - Validation report
        - Quality metrics
        - Identified patterns
      </outputs>
    </phase>

    <phase name="EVOLVE">
      <purpose>Learn and improve the workflow</purpose>

      <agent>workflow-reflector</agent>

      <actions>
        1. Analyze what worked well
        2. Identify bottlenecks
        3. Extract successful patterns
        4. Suggest new specialized agents
        5. Propose workflow optimizations
      </actions>

      <outputs>
        - .nexus/evolution/[timestamp]-reflection.md
        - Suggested improvements
        - New agent proposals
        - Pattern templates
      </outputs>
    </phase>

  </phase_details>
</pipeline>

---

## Command Specifications

### Foundation Commands

```markdown
---
name: nexus-init
description: Initialize Nexus workflow for a project
tools: Read, Write, Glob, Bash
implementation: .claude/commands/nexus-init.md
---

# /nexus-init

Initialize the Nexus workflow system with constitutional enforcement.

<pre_flight>
  - Check for existing .nexus directory
  - Detect project type and technology stack
  - Identify testing framework
</pre_flight>

<process_flow>
  <step number="1" subagent="project-analyzer">
    Analyze project structure:
    - Technology stack (language, framework)
    - Testing framework (jest, pytest, go test, etc.)
    - Project type (web, cli, mobile, library)
    - Existing patterns and conventions
  </step>

  <step number="2">
    Get user commitment:

    <commitment_required>
      DISPLAY: "Nexus requires commitment to Test-Driven Development"
      DISPLAY: "You must write tests before implementation code"
      PROMPT: "Type 'I COMMIT TO TDD' to continue:"
      VALIDATE: exact_match("I COMMIT TO TDD")
    </commitment_required>

    <questioning_acceptance>
      DISPLAY: "Nexus will ask unlimited questions to ensure understanding"
      PROMPT: "Do you accept unlimited adaptive questioning? (y/n):"
      VALIDATE: response == "y"
    </questioning_acceptance>
  </step>

  <step number="3">
    Create directory structure:

    <directories>
      .nexus/
      ├── constitution.md         # Immutable laws
      ├── project-dna.md          # Tech stack and patterns
      ├── decision-log.md         # Decision history
      ├── quality-debt.md         # Technical debt tracking
      ├── brainstorms/           # Ideation outputs
      ├── specs/                 # Specifications
      ├── tasks/                 # Task breakdowns
      ├── patterns/              # Extracted patterns
      ├── agents/                # Custom agents
      └── evolution/             # Workflow improvements
    </directories>
  </step>

  <step number="4">
    Generate foundation files:
    - constitution.md (from template with project specifics)
    - project-dna.md (detected stack and patterns)
    - Templates for each phase
  </step>

  <step number="5">
    Initialize tracking:
    - Create SQLite database for context
    - Set up decision log
    - Initialize pattern library
  </step>
</process_flow>

<gates>
  <gate id="commitment">
    User MUST commit to TDD explicitly
  </gate>
  <gate id="structure">
    All directories MUST be created successfully
  </gate>
</gates>
```

### Pipeline Commands

```markdown
---
name: nexus-brainstorm
description: Generate and evaluate multiple approaches
tools: Read, Write, TodoWrite
implementation: .claude/commands/nexus-brainstorm.md
---

# /nexus-brainstorm [topic]

<process_flow>
  <step number="1" subagent="questioning-agent">
    Understand the problem completely:

    <questions unlimited="true">
      Initial Questions:
      - What problem are we REALLY solving?
      - Who benefits from this solution?
      - What constraints exist?
      - What would make this remarkable?

      Continue until:
      - Problem fully understood
      - Constraints identified
      - Success criteria clear
      - Edge cases discovered
    </questions>
  </step>

  <step number="2" subagent="pattern-detector">
    Check for existing patterns:
    - Search .nexus/patterns/ for similar problems
    - Identify reusable solutions
    - Note what worked before
  </step>

  <step number="3">
    Generate approaches (minimum 3):

    <approaches required="3">
      <approach type="conventional">
        Industry standard solution
        - Pros: Well-tested, documented
        - Cons: May not be optimal
      </approach>

      <approach type="optimal">
        Best if no constraints
        - Pros: Maximum quality
        - Cons: May be complex
      </approach>

      <approach type="pragmatic">
        Balanced trade-offs
        - Pros: Good enough, faster
        - Cons: Some compromises
      </approach>

      <approach type="innovative" optional="true">
        Cutting-edge solution
        - Pros: Modern, efficient
        - Cons: Less tested
      </approach>
    </approaches>
  </step>

  <step number="4">
    Evaluate approaches:

    <comparison_matrix>
      | Approach | Complexity | Time | Risk | Maintenance |
      |----------|-----------|------|------|-------------|
      | Conventional | Low | Medium | Low | Easy |
      | Optimal | High | High | Medium | Complex |
      | Pragmatic | Medium | Low | Low | Moderate |
    </comparison_matrix>
  </step>

  <step number="5">
    Document and select:
    - Write to .nexus/brainstorms/[timestamp]-[topic].md
    - Select 1-3 approaches for specification
    - Note decision rationale
  </step>
</process_flow>
```

---

## Agent System

### Core Specialized Agents

```markdown
---
name: questioning-agent
description: Asks unlimited questions until complete understanding
tools: TodoWrite
color: yellow
triggers: All phases, especially BRAINSTORM and SPECIFY
---

# Questioning Agent

I ask questions until ALL ambiguities are resolved. No limits.

<questioning_strategy>
  <phases>
    <triage>
      Quick 3-5 questions for context
    </triage>

    <exploration unlimited="true">
      Deep dive until everything clear:
      - Requirements clarification
      - Edge case discovery
      - Success criteria definition
      - Failure mode analysis
    </exploration>

    <validation unlimited="true">
      Ensure testability:
      - How will we test this?
      - What indicates success?
      - What are failure modes?
      - How do we handle errors?
    </validation>
  </phases>

  <triggers>
    <trigger pattern="vague_term">
      Terms: ["some", "various", "handle", "process"]
      Action: Ask for specific meaning
    </trigger>

    <trigger pattern="missing_criteria">
      Missing: Success condition
      Action: Define measurable criteria
    </trigger>

    <trigger pattern="ambiguous_flow">
      Unclear: Process flow
      Action: Request step-by-step breakdown
    </trigger>
  </triggers>
</questioning_strategy>

<no_limits>
  I continue until:
  - Zero ambiguities remain
  - All edge cases identified
  - Test criteria defined
  - User confirms understanding complete
</no_limits>
```

```markdown
---
name: pattern-detector
description: Identifies repeated patterns and suggests extractions
tools: Grep, Read, Glob
triggers: After implementations, during BRAINSTORM
---

# Pattern Detector Agent

I identify repeated patterns and suggest reusable extractions.

<detection_process>
  <step number="1">
    Search for similar structures:
    - Function patterns (3+ similar functions)
    - Class patterns (repeated structures)
    - Error handling patterns
    - Test patterns
  </step>

  <step number="2">
    Analyze frequency:
    IF pattern_count >= 3 THEN
      Flag for extraction
  </step>

  <step number="3">
    Generate pattern template:

    <pattern>
      Name: {pattern_name}
      Category: {auth|data|ui|api|test}

      <template>
        {extractable_code_structure}
      </template>

      <usage>
        {how_to_apply_pattern}
      </usage>

      <examples>
        {where_used_successfully}
      </examples>
    </pattern>
  </step>

  <step number="4">
    Save to .nexus/patterns/{category}/{pattern_name}.md
  </step>
</detection_process>

<suggestions>
  "Found authentication pattern repeated 4 times"
  "Suggest extracting as: jwt-auth-pattern"
  "This would save ~200 lines per use"
</suggestions>
```

```markdown
---
name: dependency-analyzer
description: Maps dependencies and identifies parallelization opportunities
tools: Read, Grep
triggers: DECOMPOSE phase
---

# Dependency Analyzer Agent

I identify task dependencies and parallel execution opportunities.

<analysis_process>
  <step number="1">
    Identify shared resources:
    - Database tables
    - API endpoints
    - Shared modules
    - File dependencies
  </step>

  <step number="2">
    Build dependency graph:

    <example>
      T001 (user model test) → T004 (user model impl)
                            ↘
      T002 (auth test) ────────→ T007 (integration)
                            ↗
      T003 (JWT test) → T006 (JWT impl)
    </example>
  </step>

  <step number="3">
    Mark parallel opportunities:

    <rules>
      IF no_shared_resources AND no_logical_dependency THEN
        MARK with [P]

      IF same_type AND different_scope THEN
        MARK with [P]

      IF test_tasks AND different_modules THEN
        MARK with [P]
    </rules>
  </step>

  <step number="4">
    Calculate critical path:
    - Longest chain of dependencies
    - Identify bottlenecks
    - Suggest optimizations
  </step>
</analysis_process>

<output>
  Parallel Groups:
  - Group 1 [P]: T001, T002, T003 (all test tasks)
  - Group 2 [P]: T008, T009 (documentation tasks)

  Critical Path: T001 → T004 → T007 (8 hours)
  Parallel Time: 5 hours (37% faster)
</output>
```

```markdown
---
name: test-strategist
description: Suggests comprehensive testing approaches
tools: Read, Write
triggers: SPECIFY and DECOMPOSE phases
---

# Test Strategist Agent

I ensure comprehensive test coverage with appropriate strategies.

<strategies_by_type>
  <api_endpoint>
    Required Tests:
    - Happy path (200 OK)
    - Validation errors (400)
    - Authentication (401)
    - Authorization (403)
    - Not found (404)
    - Server errors (500)

    Optional Tests:
    - Rate limiting
    - Concurrent requests
    - Large payloads
    - Performance benchmarks
  </api_endpoint>

  <data_model>
    Required Tests:
    - Valid creation
    - Validation rules
    - Required fields
    - Unique constraints

    Optional Tests:
    - Relationships
    - Cascading deletes
    - Migration compatibility
  </data_model>

  <ui_component>
    Required Tests:
    - Renders correctly
    - User interactions
    - Props validation
    - Error states

    Optional Tests:
    - Accessibility (a11y)
    - Visual regression
    - Performance metrics
  </ui_component>

  <business_logic>
    Required Tests:
    - Core calculations
    - Edge cases
    - Boundary conditions
    - Error handling

    Optional Tests:
    - Performance
    - Concurrency
    - Memory usage
  </business_logic>
</strategies_by_type>

<test_structure_template>
  describe('{ComponentName}', () => {
    describe('initialization', () => {
      it('should initialize with defaults', () => {})
    })

    describe('happy path', () => {
      it('should handle normal flow', () => {})
    })

    describe('edge cases', () => {
      it('should handle empty input', () => {})
      it('should handle maximum values', () => {})
    })

    describe('error handling', () => {
      it('should handle network errors', () => {})
      it('should handle invalid data', () => {})
    })
  })
</test_structure_template>
```

### Example: TDD Enforcer Agent (Using Enhanced Template)

```markdown
---
name: tdd-enforcer
description: Master TDD orchestrator enforcing red-green-refactor discipline with constitutional blocking. Use PROACTIVELY for all implementation tasks.
model: opus
tools: Read, Write, Grep, Bash, TodoWrite
triggers: DECOMPOSE and IMPLEMENT phases, before any code writing
color: red
created: 2025-09-18 09:16:58 WEST
created_by: manual
---

# TDD Enforcer Agent

You are an expert TDD orchestrator specializing in constitutional enforcement of test-driven development practices with zero tolerance for test-after development.

## Expert Purpose
Elite TDD enforcer focused on maintaining absolute test-first discipline across all development tasks. Masters the complete red-green-refactor cycle and blocks any attempt to write implementation before tests. Combines deep TDD expertise with constitutional authority to ensure 100% TDD compliance while maintaining development velocity. This agent has veto power over any code that lacks tests.

## Focus Areas
- Red-Green-Refactor cycle orchestration and enforcement
- Test-first discipline verification with automated blocking
- Multi-language TDD support (JavaScript, TypeScript, Python, Go, Java, etc.)
- Property-based and generative testing strategies
- Legacy code characterization and safe refactoring
- TDD metrics collection and compliance reporting

## Capabilities

### TDD Cycle Management
- Complete red-green-refactor cycle enforcement with constitutional blocking
- Test-first discipline verification before allowing any implementation
- Automated detection of test-after anti-patterns
- Refactoring safety net establishment and verification
- Cycle time optimization for rapid feedback loops
- Parallel test execution orchestration when marked with [P]

### Constitutional Enforcement
- BLOCK any implementation without failing tests
- Verify tests actually fail for the right reasons
- Ensure minimal implementation (no gold-plating)
- Prevent test deletion or disabling
- Enforce minimum coverage thresholds (80%)
- Track and report all violations for workflow reflection

### Testing Strategy Design
- Unit test design following AAA pattern (Arrange-Act-Assert)
- Integration test orchestration with proper isolation
- Property-based test generation for edge case discovery
- Contract testing for API boundaries
- Mutation testing for test quality validation
- Performance test integration within TDD cycles

### Multi-Language TDD Support
- JavaScript/TypeScript with Jest, Mocha, Vitest
- Python with pytest, unittest
- Go with testing package and testify
- Java with JUnit 5 and Mockito
- C# with NUnit and xUnit
- Ruby with RSpec
- Rust with built-in testing

## Behavioral Traits
- Uncompromising on test-first discipline - no exceptions
- Provides rapid feedback on test quality and coverage
- Suggests test improvements before implementation
- Coaches developers through difficult TDD scenarios
- Celebrates successful red-green-refactor cycles
- Documents all TDD violations for learning

## Knowledge Base
- Kent Beck's Test-Driven Development by Example
- Growing Object-Oriented Software Guided by Tests
- Chicago vs London schools of TDD
- Property-based testing with QuickCheck family
- Mutation testing principles and tools
- Legacy code refactoring patterns (Working Effectively with Legacy Code)
- Test doubles patterns (mocks, stubs, fakes, spies)

## Response Approach
1. **Verify test existence** - Check for test file before any implementation
2. **Validate test failure** - Ensure test fails for correct reason
3. **Guide minimal implementation** - Help write just enough code
4. **Verify test passing** - Confirm implementation satisfies test
5. **Suggest refactoring** - Identify improvement opportunities
6. **Update metrics** - Track TDD compliance and cycle times

## Workflow Process
<process>
  <step number="1" name="Test Analysis">
    Examine task requirements and identify test needs:
    - Unit tests for business logic
    - Integration tests for boundaries
    - Contract tests for APIs
    - Property tests for algorithms
  </step>

  <step number="2" name="RED Phase">
    Guide test writing that fails correctly:
    IF no_test_file EXISTS THEN
      CREATE test file with proper structure
      WRITE failing test for first requirement
      VERIFY test fails with expected message
    ELSE
      BLOCK with constitutional violation
  </step>

  <step number="3" name="GREEN Phase">
    Enable minimal implementation:
    IF test_is_failing AND user_approved THEN
      ALLOW implementation writing
      MONITOR for minimal code
      VERIFY test passes
    ELSE
      BLOCK implementation
  </step>

  <step number="4" name="REFACTOR Phase">
    Improve code while maintaining green:
    <parallel_when="multiple_refactoring_opportunities">
      - Extract common patterns
      - Improve naming
      - Reduce complexity
    </parallel_when>
    VERIFY all tests still pass
  </step>
</process>

## Input/Output Specification
<inputs>
  Required:
    - Task specification: Requirements to implement
    - Technology stack: Language and framework
    - Test framework: Testing tools available

  Optional:
    - Coverage threshold: Minimum required (default 80%)
    - TDD style: Chicago or London school
    - Performance requirements: For benchmark tests
</inputs>

<outputs>
  Primary:
    - Test files: Comprehensive test suite
    - Implementation: Code that passes all tests
    - Coverage report: Test coverage metrics

  Secondary:
    - TDD metrics: Cycle times, test-first percentage
    - Violation log: Any attempts to bypass TDD
    - Suggestions: Patterns for extraction
</outputs>

## Usage Examples

### Basic Usage
```bash
# Simple TDD enforcement
Use Task tool with subagent_type="tdd-enforcer"
Prompt: "Implement user authentication with TDD"
```

### Advanced Usage
```bash
# Property-based TDD
Use Task tool with subagent_type="tdd-enforcer"
Prompt: "
Implement sorting algorithm with TDD:
- Use property-based tests
- Test with random inputs
- Verify invariants (sorted, same length)
- Include performance benchmarks
"
```

### Legacy Code TDD
```bash
# Characterization tests for legacy code
Use Task tool with subagent_type="tdd-enforcer"
Prompt: "Add tests to legacy PaymentProcessor before refactoring"
```

## Example Interactions
- "Write comprehensive tests for shopping cart that must fail first"
- "Implement minimal code to make the user registration tests pass"
- "Refactor the authentication module while keeping all tests green"
- "Add property-based tests for the data validation functions"
- "Create characterization tests for legacy billing system"

## Anti-Patterns to Avoid
- Writing implementation before tests (test-after)
- Writing tests that don't actually test anything
- Over-mocking to the point of not testing real behavior
- Skipping the refactor phase
- Writing multiple tests before seeing first one fail

## Success Metrics
- 100% test-first compliance
- Average cycle time < 15 minutes
- Test coverage > 80%
- Zero test-after violations
- Mutation score > 75%

## Evolution Triggers
<evolution>
  <trigger condition="repeated_test_pattern">
    SUGGEST: Extract test utility or helper
  </trigger>

  <trigger condition="slow_test_execution">
    SUGGEST: Parallelize test suite with [P] markers
  </trigger>

  <trigger condition="complex_test_setup">
    CREATE: Test data builder pattern
  </trigger>
</evolution>

## Related Agents
- test-strategist: Helps design comprehensive test approach
- pattern-detector: Identifies test patterns for reuse
- refactoring-specialist: Assists in refactor phase
- code-archaeologist: Helps understand legacy code for testing

## Troubleshooting
<issue name="Tests Not Failing">
  Symptom: Test passes immediately when it should fail
  Cause: Test not actually testing the requirement
  Solution: Review test assertions and ensure they check behavior
</issue>

<issue name="Implementation Blocked">
  Symptom: Cannot write implementation code
  Cause: No failing test exists
  Solution: Write test first, see it fail, then implement
</issue>

<issue name="Refactoring Breaks Tests">
  Symptom: Tests fail after refactoring
  Cause: Tests too coupled to implementation
  Solution: Refactor tests to test behavior, not implementation
</issue>
```

### Evolution Agents

```markdown
---
name: workflow-reflector
description: Analyzes workflow execution and suggests improvements
tools: Read, Write, Glob
triggers: After each pipeline completion (EVOLVE phase)
---

# Workflow Reflector Agent

I analyze completed workflows and suggest improvements.

<reflection_process>
  <step number="1">
    Analyze execution metrics:
    - Time per phase
    - Questions asked
    - Patterns identified
    - Tasks parallelized
    - Blockages encountered
  </step>

  <step number="2">
    Identify improvement opportunities:

    <pattern_detection>
      IF same_question_asked >= 5 THEN
        SUGGEST: Add to question template

      IF manual_task_repeated >= 3 THEN
        SUGGEST: Create specialized agent

      IF sequential_tasks_independent THEN
        SUGGEST: Mark with [P]

      IF phase_took_long THEN
        SUGGEST: Break down further
    </pattern_detection>
  </step>

  <step number="3">
    Generate suggestions:

    <suggestion_template>
      ## Workflow Reflection: {timestamp}

      ### Metrics
      - Total time: {duration}
      - Questions asked: {count}
      - Patterns found: {count}
      - Parallel execution: {percentage}

      ### Bottlenecks Identified
      - {phase} took {time} (expected: {expected})

      ### Suggested Improvements

      1. **Create Agent**: {agent_name}
         Purpose: {detected_need}
         Trigger: {when_needed}
         Saves: ~{estimated_time}

      2. **Add Pattern**: {pattern_name}
         Repeated: {count} times
         Category: {category}

      3. **Optimize Parallelization**
         Tasks that could run parallel:
         - {task_list}

      ### Questions to Add to Template
      - {frequently_asked_question}

      ### Implement Suggestions? [y/n]
    </suggestion_template>
  </step>

  <step number="4">
    If approved, update workflow:
    - Add patterns to library
    - Create agent templates
    - Update question templates
    - Modify task markers
  </step>
</reflection_process>
```

```markdown
---
name: agent-creator
description: Generates new specialized agents based on detected needs
tools: Write, Read
triggers: When workflow-reflector identifies repeated manual work
---

# Agent Creator Agent

I create new specialized agents when patterns emerge.

<creation_process>
  <step number="1">
    Analyze need:
    - What task is repeated?
    - What tools are used?
    - When is it triggered?
    - What value does it provide?
  </step>

  <step number="2">
    Generate agent specification:

    <template>
      ---
      name: {suggested_name}
      description: {detected_purpose}
      tools: {observed_tools}
      triggers: {when_needed}
      created: {timestamp}
      created_by: agent-creator
      ---

      # {Agent Title}

      <purpose>
        {what_this_agent_does}
      </purpose>

      <process>
        {step_by_step_process}
      </process>

      <outputs>
        {what_it_produces}
      </outputs>
    </template>
  </step>

  <step number="3">
    Save to .nexus/agents/{agent_name}.md
  </step>

  <step number="4">
    Register in workflow pipeline
  </step>
</creation_process>
```

---

## Task Management

### Task Format

```markdown
# Task Specification

<task id="T001" phase="TDD_RED">
  <title>Write user authentication tests</title>
  <type>test</type>

  <specification_context>
    <!-- Relevant spec included here -->
    FR-001: User must authenticate with email/password
    - Valid credentials return JWT token
    - Invalid credentials return 401 error
    - Token expires after 24 hours
  </specification_context>

  <acceptance_criteria>
    - Test validates successful login
    - Test validates failed login
    - Test checks token generation
    - Test verifies token expiration
  </acceptance_criteria>

  <test_strategy from="test-strategist">
    - Use mock database
    - Test with valid/invalid emails
    - Test with correct/wrong passwords
    - Test token decode and expiry
  </test_strategy>

  <dependencies>
    <!-- None - test tasks have no dependencies -->
  </dependencies>

  <parallel>true</parallel>

  <estimate>2h</estimate>

  <state>PENDING</state>
</task>
```

### Task State Machine

```
<task_states>
  PENDING       → Task created, not started
  WRITING_TEST  → Creating test (RED phase)
  TEST_FAILING  → Test written and failing correctly
  IMPLEMENTING  → Writing code (GREEN phase)
  TEST_PASSING  → Implementation complete
  REFACTORING   → Improving code (REFACTOR phase)
  DONE          → Task complete
  BLOCKED       → Waiting on dependency or clarification
</task_states>

State Transitions:
PENDING → WRITING_TEST → TEST_FAILING → IMPLEMENTING → TEST_PASSING → DONE
                                    ↓                      ↓
                                BLOCKED                REFACTORING
```

### Task Tracking

```markdown
# .nexus/tasks/current.md
Updated: 2025-09-18 09:16:58 WEST

## Sprint: Authentication System

### Epic: User Authentication

#### Test Tasks [TDD: RED] - Can run parallel
- [ ] T001: [P] Write user model tests (2h) [WRITING_TEST]
- [ ] T002: [P] Write auth controller tests (2h) [PENDING]
- [ ] T003: [P] Write JWT service tests (1h) [PENDING]

#### Implementation Tasks [TDD: GREEN]
- [ ] T004: Implement user model (3h) [PENDING]
  Depends: T001
- [ ] T005: Implement auth controller (3h) [PENDING]
  Depends: T002
- [ ] T006: Implement JWT service (2h) [PENDING]
  Depends: T003

#### Integration Tasks
- [ ] T007: E2E authentication flow (2h) [PENDING]
  Depends: T004, T005, T006
- [ ] T008: [P] API documentation (1h) [PENDING]
- [ ] T009: [P] Update README (30min) [PENDING]

### Blocked Tasks
None

### Completed Tasks
- [x] T000: Project setup (1h) [DONE]

### Critical Path
T001 → T004 → T007 (Total: 7h)

### Parallel Execution Plan
Phase 1: T001, T002, T003 (parallel) - 2h
Phase 2: T004, T005, T006 (parallel after dependencies) - 3h
Phase 3: T007 - 2h
Anytime: T008, T009 (parallel) - 1.5h
```

---

## Evolution System

### Automatic Learning

```markdown
# Evolution Triggers

<trigger type="pattern_repetition">
  <condition>
    Code structure repeated >= 3 times
  </condition>

  <action>
    1. Extract pattern
    2. Create template
    3. Save to .nexus/patterns/
    4. Suggest usage in future tasks
  </action>

  <example>
    Detected: API error handling repeated 5 times
    Created: .nexus/patterns/api/error-handler.md
    Saves: ~50 lines per endpoint
  </example>
</trigger>

<trigger type="missing_agent">
  <condition>
    Manual analysis performed >= 3 times
  </condition>

  <action>
    1. Identify repetitive work
    2. Create agent specification
    3. Save to .nexus/agents/
    4. Register in pipeline
  </action>

  <example>
    Detected: Database migration checks done manually
    Created: .nexus/agents/migration-validator.md
    Trigger: Before database changes
  </example>
</trigger>

<trigger type="workflow_optimization">
  <condition>
    Sequential tasks have no dependencies
  </condition>

  <action>
    1. Identify independent tasks
    2. Mark with [P] for parallel
    3. Update task file
    4. Note time savings
  </action>

  <example>
    Found: Documentation tasks can parallelize
    Marked: T008, T009 with [P]
    Saves: 1.5h (parallel) vs 2.5h (sequential)
  </example>
</trigger>

<trigger type="question_pattern">
  <condition>
    Same question asked >= 5 times
  </condition>

  <action>
    1. Add to question template
    2. Update questioning-agent
    3. Include in future sessions
  </action>

  <example>
    Frequent: "What authentication method?"
    Added to: BRAINSTORM initial questions
  </example>
</trigger>
```

### Evolution Reports

```markdown
# .nexus/evolution/2025-09-18-reflection.md

## Workflow Reflection
Date: 2025-09-18 09:16:58 WEST
Feature: User Authentication

### Metrics
- Total duration: 12 hours
- Questions asked: 47
- Patterns extracted: 3
- Tasks parallelized: 5 of 10 (50%)
- Blockages: 1 (missing test framework decision)

### Successful Patterns
1. **JWT Auth Pattern**
   - Used in: 3 locations
   - Saved: ~150 lines
   - Extracted to: .nexus/patterns/auth/jwt-pattern.md

2. **API Error Handler**
   - Used in: 5 endpoints
   - Saved: ~250 lines
   - Extracted to: .nexus/patterns/api/error-handler.md

### Suggested Improvements

#### 1. New Agent: database-migration-validator
**Purpose**: Validate database changes before implementation
**Trigger**: When task involves database schema
**Benefit**: Prevents migration conflicts

#### 2. Parallelize Documentation
**Current**: Documentation tasks run sequentially
**Suggested**: Mark T008, T009 with [P]
**Saves**: 1 hour

#### 3. Add to Question Template
**Question**: "What is the token expiration strategy?"
**Frequency**: Asked in last 5 auth implementations
**Add to**: BRAINSTORM phase template

### Decision Log Entry
**Decision**: Use JWT with refresh tokens
**Rationale**: Stateless, scalable, mobile-friendly
**Confidence**: High
**Reusable**: Yes - save as auth pattern

### Apply Improvements? [y/n]
> y

Improvements applied:
✓ Created database-migration-validator agent
✓ Marked documentation tasks with [P]
✓ Updated question template
✓ Saved JWT pattern
```

---

## Implementation Guide

### Week 1: Foundation

```bash
# Day 1-2: Core Structure
- [ ] Implement /nexus-init command
- [ ] Create constitution enforcement
- [ ] Set up .nexus/ directory structure
- [ ] Initialize SQLite for context storage

# Day 3-4: Basic Pipeline
- [ ] Implement questioning-agent (unlimited)
- [ ] Create /nexus-brainstorm command
- [ ] Create /nexus-specify command

# Day 5: Testing
- [ ] Test with sample project
- [ ] Verify TDD gates work
- [ ] Ensure questioning is unlimited
```

### Week 2: Pipeline Completion

```bash
# Day 1-2: Decomposition
- [ ] Implement dependency-analyzer
- [ ] Create /nexus-decompose command
- [ ] Add parallelization marking

# Day 3-4: Implementation
- [ ] Implement test-writer agent
- [ ] Implement implementation-writer agent
- [ ] Create /nexus-implement command
- [ ] Add TDD cycle enforcement

# Day 5: Integration
- [ ] Connect all phases
- [ ] Test full pipeline
- [ ] Verify parallel execution
```

### Week 3: Specialized Agents

```bash
# Day 1-2: Core Agents
- [ ] Implement pattern-detector
- [ ] Implement test-strategist
- [ ] Implement code-archaeologist

# Day 3-4: Support Agents
- [ ] Implement api-designer
- [ ] Implement refactoring-specialist
- [ ] Create agent registry

# Day 5: Testing
- [ ] Test agent interactions
- [ ] Verify agent triggers
- [ ] Measure performance
```

### Week 4: Evolution System

```bash
# Day 1-2: Learning Loop
- [ ] Implement workflow-reflector
- [ ] Create evolution triggers
- [ ] Build pattern extraction

# Day 3-4: Agent Creation
- [ ] Implement agent-creator
- [ ] Add suggestion system
- [ ] Create feedback loop

# Day 5: Polish
- [ ] Full system test
- [ ] Performance optimization
- [ ] Documentation
```

---

## Success Metrics

### Quantitative Metrics

```markdown
<metrics type="measurable">
  Week 1 Targets:
  - Setup time: < 5 minutes
  - Questions per feature: 20-50
  - Test-first compliance: 100%

  Month 1 Targets:
  - Features completed: 10+
  - Patterns extracted: 5+
  - Parallel execution: 30%+
  - Time saved: 20%+

  Month 3 Targets:
  - Custom agents created: 5+
  - Workflow optimizations: 10+
  - Pattern library: 20+ patterns
  - Time saved: 40%+
</metrics>
```

### Qualitative Metrics

```markdown
<metrics type="observable">
  Code Quality:
  - Consistent patterns
  - Comprehensive tests
  - Clear documentation
  - Reduced bugs

  Developer Experience:
  - Less ambiguity
  - Faster implementation
  - Better understanding
  - Increased confidence

  Workflow Evolution:
  - Patterns emerging
  - Agents suggested
  - Optimizations applied
  - Continuous improvement
</metrics>
```

---

## Appendices

### A. Decision Log Template

```markdown
# Decision: {Topic}
Date: 2025-09-18 09:16:58 WEST
Phase: {BRAINSTORM|SPECIFY|DECOMPOSE|IMPLEMENT}

<context>
What situation required this decision
</context>

<options_considered>
1. Option A
   - Pros: {benefits}
   - Cons: {drawbacks}

2. Option B
   - Pros: {benefits}
   - Cons: {drawbacks}
</options_considered>

<decision>
Selected: Option A
</decision>

<rationale>
Why this option was chosen
</rationale>

<confidence>High|Medium|Low</confidence>

<reusable>Yes|No</reusable>
```

### B. Pattern Template

```markdown
# Pattern: {Pattern Name}
Category: {auth|api|data|ui|test}
Created: 2025-09-18 09:16:58 WEST
Used: {count} times

<purpose>
What this pattern solves
</purpose>

<template>
```{language}
// Reusable code structure
```
</template>

<usage>
How to apply this pattern:
1. Step one
2. Step two
</usage>

<examples>
- Used in: {file:line}
- Used in: {file:line}
</examples>

<variations>
- Variation A: {when to use}
- Variation B: {when to use}
</variations>
```

### C. Enhanced Agent Template

```markdown
---
name: {agent-name}
description: {One-line purpose. Include "Use PROACTIVELY" if agent should be triggered automatically}
model: {sonnet|opus|claude} # Specify model based on complexity
tools: {Read, Write, Grep, Bash, TodoWrite, etc}
triggers: {when this agent activates - be specific about conditions}
color: {yellow|cyan|green|red} # Visual identification in logs
created: 2025-09-18 09:16:58 WEST
created_by: {workflow-reflector|manual}
---

# {Agent Title}

{Opening statement describing agent's expertise and role}

## Expert Purpose
{Comprehensive description of the agent's specialized role, capabilities, and value proposition.
Explain what makes this agent unique and when to use it.}

## Focus Areas
- {Primary focus area with specific details}
- {Secondary focus area with examples}
- {Additional specializations}

## Capabilities

### {Capability Category 1}
- {Specific capability with technical details}
- {Another capability with use cases}
- {Advanced techniques this agent masters}

### {Capability Category 2}
- {Detailed capabilities in this domain}
- {Tools and frameworks expertise}
- {Integration patterns}

### {Capability Category 3}
- {Additional specialized skills}
- {Performance optimization techniques}
- {Best practices enforcement}

## Behavioral Traits
- {How the agent approaches problems}
- {Quality standards it maintains}
- {Communication style and interaction patterns}
- {Decision-making priorities}
- {Error handling approach}

## Knowledge Base
- {Domain expertise and theoretical knowledge}
- {Framework and tool proficiency}
- {Industry standards and best practices}
- {Design patterns and methodologies}
- {Common pitfalls and how to avoid them}

## Response Approach
1. **{Initial assessment}** - How the agent analyzes the request
2. **{Planning phase}** - How it structures the solution
3. **{Execution strategy}** - How it implements or guides
4. **{Validation steps}** - How it ensures quality
5. **{Optimization}** - How it improves the solution
6. **{Documentation}** - What it records for future reference

## Workflow Process
<process>
  <step number="1" name="Analysis">
    {Detailed first step with specific actions}
    - Sub-action 1
    - Sub-action 2
  </step>

  <step number="2" name="Design">
    {Second step with decision points}
    IF {condition} THEN
      {action}
    ELSE
      {alternative}
  </step>

  <step number="3" name="Implementation">
    {Execution step with parallel options}
    <parallel_when="{condition}">
      - {Parallel task 1}
      - {Parallel task 2}
    </parallel_when>
  </step>

  <step number="4" name="Validation">
    {Quality checks and verification}
  </step>
</process>

## Input/Output Specification
<inputs>
  Required:
    - {Input type}: {Description and format}
    - {Context needed}: {What background information}

  Optional:
    - {Configuration}: {Customization options}
    - {Constraints}: {Limitations to consider}
</inputs>

<outputs>
  Primary:
    - {Main deliverable}: {Format and location}
    - {Artifacts created}: {File types and structure}

  Secondary:
    - {Logs/Reports}: {What gets documented}
    - {Metrics}: {What gets measured}
    - {Suggestions}: {Future improvements identified}
</outputs>

## Usage Examples

### Basic Usage
```bash
# Simple invocation
Use Task tool with subagent_type="{agent-name}"
Prompt: "{Basic task description}"
```

### Advanced Usage
```bash
# Complex workflow
Use Task tool with subagent_type="{agent-name}"
Prompt: "
{Multi-line detailed request}
- Requirement 1
- Requirement 2
- Constraint or preference
"
```

### Integration Example
```bash
# Working with other agents
1. Use {agent-name} for {initial task}
2. Pass output to {other-agent} for {follow-up}
3. Validate with {validation-agent}
```

## Example Interactions
- "{Specific task example 1 that showcases core capability}"
- "{Complex scenario demonstrating advanced features}"
- "{Integration example showing collaboration with other agents}"
- "{Edge case handling example}"
- "{Performance optimization example}"

## Anti-Patterns to Avoid
- {Common mistake 1 and why it's problematic}
- {Common mistake 2 and how to prevent it}
- {Misuse scenario and correct approach}

## Success Metrics
- {Measurable outcome 1}
- {Quality indicator 2}
- {Performance metric 3}
- {User satisfaction indicator}

## Evolution Triggers
<evolution>
  <trigger condition="{pattern detected}">
    SUGGEST: {improvement or new pattern}
  </trigger>

  <trigger condition="{repeated issue}">
    CREATE: {new specialized sub-agent}
  </trigger>
</evolution>

## Related Agents
- {agent-1}: {when to use instead or together}
- {agent-2}: {how they complement each other}
- {agent-3}: {workflow dependencies}

## Troubleshooting
<issue name="{Common Problem}">
  Symptom: {What user observes}
  Cause: {Root cause}
  Solution: {How to fix}
</issue>
```

### D. Context Management System Implementation

```markdown
# Context Management System - PostgreSQL + Redis Implementation

## Overview
The Context Management System is the memory and intelligence layer of Nexus, using PostgreSQL for persistent storage and Redis for high-performance caching. All access is via CLI commands, making it practical for agent implementation.

## PostgreSQL Schema

### Database Setup
```sql
-- Create schema for Nexus
CREATE SCHEMA IF NOT EXISTS nexus;

-- Main context table using JSONB for flexibility
CREATE TABLE nexus.contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase VARCHAR(20) NOT NULL CHECK (phase IN ('brainstorm', 'specify', 'decompose', 'implement', 'validate', 'evolve')),
    task_id VARCHAR(50),
    parent_id UUID REFERENCES nexus.contexts(id),
    session_id UUID NOT NULL,
    content JSONB NOT NULL,
    confidence VARCHAR(10) CHECK (confidence IN ('high', 'medium', 'low')),
    tokens_used INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_contexts_phase ON nexus.contexts(phase);
CREATE INDEX idx_contexts_task ON nexus.contexts(task_id);
CREATE INDEX idx_contexts_session ON nexus.contexts(session_id);
CREATE INDEX idx_contexts_parent ON nexus.contexts(parent_id);
CREATE INDEX idx_contexts_content ON nexus.contexts USING GIN(content);

-- Decisions table
CREATE TABLE nexus.decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID REFERENCES nexus.contexts(id),
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    selected TEXT NOT NULL,
    rationale TEXT,
    confidence VARCHAR(10),
    reusable BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_decisions_context ON nexus.decisions(context_id);
CREATE INDEX idx_decisions_reusable ON nexus.decisions(reusable) WHERE reusable = true;

-- Patterns table
CREATE TABLE nexus.patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    pattern JSONB NOT NULL,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(3,2),
    created_from_context UUID REFERENCES nexus.contexts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patterns_category ON nexus.patterns(category);
CREATE INDEX idx_patterns_usage ON nexus.patterns(usage_count DESC);

-- Questions tracking
CREATE TABLE nexus.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase VARCHAR(20) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    context_id UUID REFERENCES nexus.contexts(id),
    frequency INTEGER DEFAULT 1,
    added_to_template BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_frequency ON nexus.questions(frequency DESC);
CREATE INDEX idx_questions_template ON nexus.questions(added_to_template) WHERE added_to_template = false;
```

## CLI Operations

### Context Operations
```bash
# Create context
create_context() {
    local phase="$1"
    local content="$2"
    local parent_id="${3:-null}"

    local result=$(psql -h localhost -U admin -d myapp_db -t -A -c "
        INSERT INTO nexus.contexts (phase, content, parent_id, session_id)
        VALUES ('$phase', '$content'::jsonb, $parent_id, gen_random_uuid())
        RETURNING id;
    ")

    # Cache in Redis
    redis-cli SETEX "nexus:context:$result" 300 "$content"
    redis-cli SET "nexus:current:context" "$result"

    echo "$result"
}

# Get context with inheritance
get_context() {
    local context_id="$1"

    # Try Redis first
    local cached=$(redis-cli GET "nexus:context:$context_id")
    if [ -n "$cached" ]; then
        echo "$cached"
        return
    fi

    # Get from PostgreSQL with inheritance
    local context=$(psql -h localhost -U admin -d myapp_db -t -A -c "
        WITH RECURSIVE ctx_tree AS (
            SELECT id, phase, content, parent_id, 0 as level
            FROM nexus.contexts
            WHERE id = '$context_id'::uuid

            UNION ALL

            SELECT c.id, c.phase, c.content, c.parent_id, ct.level + 1
            FROM nexus.contexts c
            JOIN ctx_tree ct ON c.id = ct.parent_id
        )
        SELECT jsonb_agg(content ORDER BY level DESC) FROM ctx_tree;
    ")

    # Cache result
    redis-cli SETEX "nexus:context:$context_id" 300 "$context"

    echo "$context"
}
```

### Decision Recording
```bash
record_decision() {
    local context_id="$1"
    local question="$2"
    local selected="$3"
    local rationale="$4"

    psql -h localhost -U admin -d myapp_db -c "
        INSERT INTO nexus.decisions (context_id, question, options, selected, rationale)
        VALUES ('$context_id'::uuid, '$question', '[]'::jsonb, '$selected', '$rationale');
    "

    # Track in Redis
    redis-cli LPUSH "nexus:decisions:recent" "{\"question\":\"$question\",\"selected\":\"$selected\"}"
    redis-cli LTRIM "nexus:decisions:recent" 0 49
}
```

### Pattern Management
```bash
extract_pattern() {
    local context_id="$1"
    local pattern_name="$2"
    local category="$3"

    psql -h localhost -U admin -d myapp_db -c "
        INSERT INTO nexus.patterns (name, category, pattern, created_from_context)
        SELECT '$pattern_name', '$category', content, '$context_id'::uuid
        FROM nexus.contexts WHERE id = '$context_id'::uuid
        ON CONFLICT (name) DO UPDATE
        SET usage_count = nexus.patterns.usage_count + 1;
    "

    redis-cli ZINCRBY "nexus:patterns:usage" 1 "$pattern_name"
}
```

## Redis Caching Strategy

### Key Patterns
```bash
# Current state
nexus:current:phase        # Active workflow phase
nexus:current:context      # Active context ID
nexus:current:task         # Active task ID

# Context cache (5min TTL)
nexus:context:{id}         # Full context JSON

# Pattern tracking
nexus:patterns:usage       # Sorted set of pattern usage

# Recent activity
nexus:decisions:recent     # Last 50 decisions
nexus:questions:recent     # Last 50 questions
```

### Usage Examples
```bash
# Set current phase
redis-cli SET "nexus:current:phase" "implement"

# Track pattern usage
redis-cli ZINCRBY "nexus:patterns:usage" 1 "jwt-auth"

# Get top patterns
redis-cli ZREVRANGE "nexus:patterns:usage" 0 9 WITHSCORES

# Cache context
redis-cli SETEX "nexus:context:uuid-123" 300 '{"phase":"implement"}'
```

## Agent Integration

```typescript
// How agents use the context system
class ContextAwareAgent {
  async saveContext(phase: string, content: any): Promise<string> {
    const json = JSON.stringify(content).replace(/'/g, "''");

    const result = await bash(`
      psql -h localhost -U admin -d myapp_db -t -A -c "
        INSERT INTO nexus.contexts (phase, content, session_id)
        VALUES ('${phase}', '${json}'::jsonb, gen_random_uuid())
        RETURNING id;"
    `);

    await bash(`redis-cli SETEX "nexus:context:${result}" 300 '${json}'`);
    return result.trim();
  }

  async getContext(contextId: string): Promise<any> {
    const cached = await bash(`redis-cli GET "nexus:context:${contextId}"`);
    if (cached) return JSON.parse(cached);

    const result = await bash(`
      psql -h localhost -U admin -d myapp_db -t -A -c "
        SELECT content FROM nexus.contexts WHERE id = '${contextId}'::uuid;"
    `);

    return JSON.parse(result);
  }
}
```

## Docker Compose Setup

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
      POSTGRES_DB: myapp_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Initialization Script

```bash
#!/bin/bash
# init-nexus-context.sh

echo "Initializing Nexus Context Management..."

# Start services
docker-compose up -d

# Wait for PostgreSQL
sleep 5

# Create schema and tables
psql -h localhost -U admin -d myapp_db < nexus-schema.sql

# Initialize Redis
redis-cli FLUSHDB
redis-cli SET "nexus:initialized" "true"

echo "Context Management System ready!"
```

## Performance Considerations

- PostgreSQL indexes on frequently queried fields
- JSONB GIN index for content queries
- Redis caching with 5-minute TTL
- Prepared statements for common queries
- Batch operations where possible
- Connection pooling via pgbouncer (optional)

## Context Inheritance Model

```
Global Project Context
└── Phase Context (e.g., brainstorm)
    └── Feature Context (e.g., auth system)
        └── Task Context (e.g., T001)
            └── Sub-task Context
```

Each level inherits from its parent, with conflicts resolved by proximity (nearest wins).
```

---

## Conclusion

The Nexus Enhanced Workflow v4.0 represents a practical, implementable system that:

1. **Enforces quality** through constitutional TDD
2. **Ensures understanding** through unlimited questioning
3. **Optimizes execution** through smart parallelization
4. **Learns continuously** through pattern extraction
5. **Evolves automatically** through workflow reflection

This specification serves as both blueprint and living document, designed to evolve as the system learns from your development patterns.

---

## Appendix E: Integration Architecture (Task Tool Orchestration)

### Overview

The Nexus Enhanced workflow uses the Task tool for parallel agent orchestration combined with file-based state management. The orchestrator (main agent) delegates work to specialized sub-agents via the Task tool, enabling efficient parallel execution while maintaining context through markdown files with embedded XML tags.

### Core Architecture Components

#### 1. The Orchestrator (Main Agent)

The orchestrator coordinates workflow execution through three entry points:

**A. Command-Based**: `/nexus-[command]` triggers specific phase
```bash
/nexus-decompose  # Reads state, launches decomposition agents
/nexus-implement  # Launches test-writer and implementation agents
```

**B. Continuation**: "Continue nexus workflow" resumes from saved state
```bash
# Orchestrator reads .nexus/state/current-phase.md
# Determines next tasks from .nexus/tasks/pending.md
# Launches appropriate sub-agents
```

**C. Explicit Task**: "Run task T003" executes specific task
```bash
# Orchestrator reads .nexus/tasks/T003/definition.md
# Launches targeted sub-agent with task context
```

#### 2. State Management Files

```markdown
# .nexus/state/current-session.md

<session-metadata>
  <id>2024-01-15-093045</id>
  <phase>DECOMPOSE</phase>
  <confidence>Medium</confidence>
  <questions-asked>23</questions-asked>
  <patterns-detected>5</patterns-detected>
</session-metadata>

<global-context>
## Project Constitution
- Test-first development required
- Documentation before implementation
- No code without understanding

## Active Decisions
- Authentication: JWT with refresh tokens
- Database: PostgreSQL with connection pooling
- Testing: Jest with 90% coverage requirement
</global-context>

<phase-context phase="DECOMPOSE">
## Current Specification
Working on: E-commerce checkout flow

## Dependencies Identified
- Payment gateway integration
- Inventory service
- Email notification system

## Tasks Created
- [x] T001: Design checkout data model
- [x] T002: Create payment service interface
- [ ] T003: Implement cart validation [P]
- [ ] T004: Build order processing [P]
- [ ] T005: Add confirmation emails
</phase-context>
```

#### 2. Context Storage Structure

```
.nexus/
├── context/
│   ├── global/
│   │   ├── constitution.md         # Project constitution
│   │   ├── decisions.md           # All decisions with rationale
│   │   └── patterns.md            # Extracted patterns
│   ├── sessions/
│   │   ├── 2024-01-15-093045/    # Session-specific context
│   │   │   ├── metadata.md       # Session metadata
│   │   │   ├── questions.md      # Questions asked
│   │   │   └── responses.md      # Answers received
│   │   └── current -> 2024-01-15-093045  # Symlink to active
│   └── tasks/
│       ├── T001-design-checkout/
│       │   ├── context.md        # Task-specific context
│       │   ├── tests.md          # Test specifications
│       │   ├── implementation.md # Implementation details
│       │   └── review.md         # Review notes
│       └── active.md             # Currently active tasks
```

#### 3. Agent Discovery and Parallel Task Execution

**Step 1: Orchestrator Discovers Available Agents**

```markdown
# .nexus/agents/registry.md

<available-agents>
  <agent name="test-writer" type="specialized" available="true"/>
  <agent name="implementation-writer" type="specialized" available="true"/>
  <agent name="documentation-writer" type="specialized" available="false"/>
  <agent name="code-reviewer" type="specialized" available="true"/>
  <agent name="general-purpose" type="general" available="always"/>
</available-agents>
```

**Step 2: Task Assignment with Fallback**

```markdown
# .nexus/orchestration/task-assignment.md

## Pending Tasks with Agent Assignment
- T003: Write tests → test-writer (available)
- T004: Implementation → implementation-writer (available)
- T005: Documentation → general-purpose (fallback: doc-writer unavailable)
- T006: Integration tests → test-writer (available)
- T007: Code review → code-reviewer (available)

## Parallel Execution Plan
Batch 1 (parallel, marked [P]):
- T003, T004, T005, T007
Batch 2 (sequential):
- T006 (depends on T004)
```

### Task Tool Invocation Pattern

**Step 3: Orchestrator Executes Parallel Tasks**

The orchestrator reads task definitions and invokes multiple Tasks in a SINGLE message:

```python
# Orchestrator reads task definition from .nexus/tasks/T003/definition.md
# Then launches up to 7 parallel tasks:

Task(
    subagent_type="test-writer",  # Or "general-purpose" if specialized unavailable
    description="Write tests for feature",
    prompt="""
    ## Task: T003 - [Read from .nexus/tasks/T003/definition.md]

    ## Context Files to Read:
    - .nexus/tasks/T003/definition.md (task specifics)
    - .nexus/specs/[current-feature].md (specification)
    - .nexus/patterns/[project-patterns].md (patterns to follow)
    - .nexus/constitution.md (project rules)

    ## Instructions:
    1. Read task definition to understand:
       - What to test
       - Where to write test files
       - What patterns to follow

    2. Create comprehensive tests based on specification

    3. Update .nexus/tasks/T003/status.md when complete

    ## Note: All file paths, languages, and frameworks
    ## are specified in the task definition and spec files
    """
)

Task(
    subagent_type="implementation-writer",
    description="Implement feature",
    prompt="""
    ## Task: T004 - [Read from .nexus/tasks/T004/definition.md]

    ## Context Files to Read:
    - .nexus/tasks/T004/definition.md (task specifics)
    - .nexus/specs/[current-feature].md (specification)
    - Check if tests exist (path from task definition)

    ## Instructions:
    1. Read task definition for implementation details
    2. If tests exist, implement to make them pass (TDD)
    3. Follow patterns from .nexus/patterns/
    4. Update status when complete
    """
)

# ... up to 5 more Tasks in the same message
```

**Task Definition File Structure**:

```markdown
# .nexus/tasks/T003/definition.md

<task-metadata>
  <id>T003</id>
  <type>test-writing</type>
  <feature>user-authentication</feature>
  <priority>high</priority>
</task-metadata>

<implementation-details>
  <language>[project-specific: python/js/go/etc]</language>
  <test-framework>[project-specific: pytest/jest/etc]</test-framework>
  <output-location>[project-specific: tests/auth/]</output-location>
  <naming-convention>[project-specific: test_*.py or *.test.js]</naming-convention>
</implementation-details>

<requirements>
  - Test all endpoints defined in spec
  - Cover edge cases
  - Follow project test patterns
  - Achieve specified coverage target
</requirements>
```

**Critical Design**: The orchestrator doesn't assume languages or frameworks - it reads them from task definitions

### Post-Execution: Result Verification

**Step 4: Orchestrator Processes Results**

After Task agents complete, the orchestrator:

```bash
# 1. Check status files for each task
for task in T003 T004 T005 T007; do
  if [ -f ".nexus/tasks/$task/status.md" ]; then
    echo "Checking $task status..."
    grep "<status>" ".nexus/tasks/$task/status.md"
  fi
done

# 2. Verify outputs based on task definitions
# Each task defines its expected outputs
cat .nexus/tasks/T003/status.md | grep "output-files"

# 3. Run project-specific validation (if defined)
if [ -f ".nexus/validation/post-task.sh" ]; then
  .nexus/validation/post-task.sh T003 T004 T005 T007
fi
```

**Agent Status File Format**:

```markdown
# .nexus/tasks/T003/status.md

<task-status>
  <id>T003</id>
  <status>completed</status>
  <completed-at>2024-01-15T10:15:45Z</completed-at>
  <agent-type>test-writer</agent-type>
</task-status>

<output-files>
  - [actual paths written by agent]
  - [based on task definition]
</output-files>

<metrics>
  - Items processed: [count]
  - Files created: [count]
  - Patterns followed: [count]
</metrics>

<learned-patterns>
## [Pattern Name]
[Description of reusable pattern discovered]
- When to apply
- How to implement
- Benefits observed
</learned-patterns>

<blockers>
[Any issues that prevented completion]
</blockers>
```

### Parallel Execution Strategy

**How Parallel Execution Actually Works:**

1. **Before Launch**: Orchestrator plans which tasks can run in parallel

```markdown
# .nexus/orchestration/execution-plan.md

## Batch 1: Parallel Tasks (up to 7)
- T003: Write tests [no dependencies]
- T004: Write implementation [no dependencies]
- T005: Write documentation [no dependencies]
- T007: Review existing code [no dependencies]

## Batch 2: Sequential (depends on Batch 1)
- T006: Integration tests [depends on T003, T004]
- T008: Final review [depends on all]
```

2. **Launch**: Orchestrator sends ALL parallel tasks in ONE message

3. **Wait**: All Task agents run independently (no status updates during execution)

4. **Completion**: Orchestrator receives all results at once

5. **Verification**: Check each task's status file

```bash
# After all tasks complete, verify results:
SUCCESS_COUNT=0
FAILED_TASKS=""

for task in T003 T004 T005 T007; do
  if grep -q "completed" ".nexus/tasks/$task/status.md" 2>/dev/null; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    FAILED_TASKS="$FAILED_TASKS $task"
  fi
done

echo "Completed: $SUCCESS_COUNT/4 tasks"
[ -n "$FAILED_TASKS" ] && echo "Failed:$FAILED_TASKS"
```

**Key Limitations & Realities:**
- No real-time progress updates from Task agents
- Maximum 7 parallel tasks per message
- All tasks in a batch complete before next batch
- No inter-agent communication during execution
- Failed tasks discovered only after completion

### Context Distribution Strategy

**Reality**: Agents don't inherit context - the orchestrator explicitly tells them what to read.

**Orchestrator's Context Decision Process:**

```bash
# For each task, orchestrator determines required context files:

# 1. Always include core files
CORE_CONTEXT="
- .nexus/constitution.md
- .nexus/tasks/T003/definition.md
"

# 2. Add phase-specific if relevant
if [ "$CURRENT_PHASE" = "IMPLEMENT" ]; then
  PHASE_CONTEXT="
  - .nexus/specs/current-feature.md
  - .nexus/patterns/implementation-patterns.md
  "
fi

# 3. Add dependency context if needed
if grep -q "depends-on" .nexus/tasks/T003/definition.md; then
  DEP_CONTEXT="
  - .nexus/tasks/T001/output.md
  - .nexus/tasks/T002/output.md
  "
fi

# 4. Build final context list for agent prompt
FINAL_CONTEXT="$CORE_CONTEXT $PHASE_CONTEXT $DEP_CONTEXT"
```

**Context Levels (Guidelines for Orchestrator):**

```markdown
# .nexus/context/distribution-strategy.md

## Minimal Context (Fast, Token-Efficient)
- Task definition only
- Constitution (key rules only)
- Direct dependencies

## Standard Context (Balanced)
- Task definition
- Full constitution
- Current feature spec
- Relevant patterns
- Direct dependencies

## Maximum Context (Complex Tasks)
- Everything in Standard
- Phase history
- Related features
- All patterns
- Extended dependencies

## When to Use Each:
- Minimal: Simple, isolated tasks
- Standard: Most development tasks
- Maximum: Complex integrations, architectural decisions
```

**Key Principle**: Orchestrator decides context per task based on complexity and dependencies

### State Management

```markdown
# .nexus/state/workflow-state.md

<workflow-state>
  <current-phase>DECOMPOSE</current-phase>
  <previous-phase>SPECIFY</previous-phase>
  <phase-transitions>
    <transition from="BRAINSTORM" to="SPECIFY" at="2024-01-15T08:30:00Z"/>
    <transition from="SPECIFY" to="DECOMPOSE" at="2024-01-15T09:15:00Z"/>
  </phase-transitions>
</workflow-state>

<blocking-issues>
  <issue id="B001" severity="critical">
    <description>Missing test framework selection</description>
    <blocking-tasks>T003, T004</blocking-tasks>
    <resolution-needed>User decision required</resolution-needed>
  </issue>
</blocking-issues>

<active-questions>
  <question id="Q047" status="pending">
    What test framework should we use? (Jest/Vitest/Mocha)
  </question>
</active-questions>
```

### Conflict Prevention Strategy

**Reality**: No lock management needed - agents work on different files by design.

**Conflict Prevention Principles:**

1. **Task Design**: Tasks are designed to write to different files
2. **Clear Ownership**: Each task defines its output files upfront
3. **No Shared State**: Agents communicate through files, not shared memory

```markdown
# .nexus/tasks/T003/definition.md

<output-ownership>
  <exclusive-writes>
    - tests/[feature]/test-file.*
    - .nexus/tasks/T003/status.md
  </exclusive-writes>
  <reads-only>
    - src/[feature]/*
    - .nexus/specs/*
  </reads-only>
</output-ownership>
```

**If Conflicts Occur:**
- Orchestrator detects during result verification
- User resolves manually (rare case)
- Tasks are designed to minimize this possibility

### Optimization Strategies

**Token Efficiency (No Caching, But Smart Context):**

```bash
# Orchestrator uses minimal context strategy:

# 1. Check task complexity
COMPLEXITY=$(grep "<complexity>" .nexus/tasks/T003/definition.md)

# 2. Choose context level
case "$COMPLEXITY" in
  "simple")
    # Only pass essential files (< 1000 tokens)
    CONTEXT_FILES=".nexus/tasks/T003/definition.md"
    ;;
  "medium")
    # Add spec and patterns (< 3000 tokens)
    CONTEXT_FILES="definition.md spec.md patterns.md"
    ;;
  "complex")
    # Include everything relevant (< 5000 tokens)
    CONTEXT_FILES="definition.md spec.md patterns.md dependencies.md"
    ;;
esac
```

**Pattern Reuse (Manual, Not Cached):**

```markdown
# .nexus/patterns/discovered.md

## Authentication Pattern
- First seen: Task T001
- Reused in: T003, T007, T012
- File: .nexus/patterns/auth-pattern.md

## Validation Pattern
- First seen: Task T004
- Reused in: T008, T015
- File: .nexus/patterns/validation-pattern.md
```

Orchestrator checks patterns before launching tasks and includes relevant ones in context.

### How Orchestration Actually Works

**User Triggers:**

```bash
# Option 1: Command-based (if implemented as aliases/scripts)
/nexus-decompose  # Could be alias for: echo "decompose the current feature"

# Option 2: Natural language
"Continue with nexus workflow"
"Run task T003"
"Execute parallel tasks for current feature"

# Option 3: Direct orchestration
"Read .nexus/tasks/pending.md and execute all [P] marked tasks"
```

**What the Orchestrator (Main Agent) Does:**

```bash
# 1. Read current state
STATE=$(cat .nexus/state/current-phase.md)
PENDING=$(grep "\[ \]" .nexus/tasks/pending.md)

# 2. Identify parallel tasks
PARALLEL_TASKS=$(grep "\[P\]" .nexus/tasks/pending.md | head -7)

# 3. Launch Task agents (actual Task tool invocation)
# Orchestrator sends multiple Task() calls in one message

# 4. After completion, verify results
for task in $COMPLETED; do
  test -f ".nexus/tasks/$task/status.md" && echo "✓ $task"
done

# 5. Update state for next run
echo "IMPLEMENT" > .nexus/state/current-phase.md
```

### Benefits of Task Tool + File-Based Architecture

1. **Real Parallelism**: Task tool enables true parallel execution (up to 7 agents)
2. **No Infrastructure**: No databases, daemons, or external services needed
3. **Transparent State**: All workflow state visible in markdown files
4. **Git-Friendly**: Every change tracked, can rollback/branch workflow
5. **Resumable**: Can stop and continue from any point
6. **Debuggable**: Can manually inspect/edit any part of the workflow

### Real-World Orchestration Example

**User**: "Implement user authentication feature"

**Orchestrator Actions**:

```python
# 1. Create initial structure
Write('.nexus/specs/user-auth.md', specification)
Write('.nexus/tasks/pending.md', task_list)

# 2. Launch parallel task batch (in ONE message)
Task(subagent_type="general-purpose",
     prompt="Read .nexus/tasks/T001/definition.md and execute")
Task(subagent_type="general-purpose",
     prompt="Read .nexus/tasks/T002/definition.md and execute")
Task(subagent_type="general-purpose",
     prompt="Read .nexus/tasks/T003/definition.md and execute")

# 3. After completion, check results
results = Read('.nexus/tasks/*/status.md')
if all_completed(results):
    print("✓ Phase 1 complete")
    # Launch next batch...
```

This architecture leverages the Task tool's real capabilities while maintaining simplicity and transparency.

---

## Appendix F: Error Handling & Recovery

### Overview

Errors are inevitable in complex workflows. The Nexus system handles failures gracefully through status tracking, retry strategies, and clear recovery paths.

### Types of Failures

#### 1. Task Agent Failures

**What Happens**: A Task agent fails to complete its work

```markdown
# .nexus/tasks/T003/status.md

<task-status>
  <id>T003</id>
  <status>failed</status>
  <failed-at>2024-01-15T10:30:00Z</failed-at>
  <agent-type>test-writer</agent-type>
</task-status>

<failure-details>
  <reason>Could not find specification file</reason>
  <missing-file>.nexus/specs/user-auth.md</missing-file>
  <suggestion>Create specification before writing tests</suggestion>
</failure-details>
```

**Orchestrator Response**:

```bash
# Check for failures after Task completion
if grep -q "failed" .nexus/tasks/T003/status.md; then
  echo "❌ Task T003 failed"
  REASON=$(grep "<reason>" .nexus/tasks/T003/status.md)
  echo "Reason: $REASON"

  # Options:
  # 1. Fix and retry
  # 2. Skip and continue
  # 3. Abort workflow
fi
```

#### 2. Dependency Failures

**What Happens**: A task can't run because its dependencies failed

```markdown
# .nexus/tasks/T006/definition.md

<dependencies>
  <requires>T003</requires>  <!-- Failed task -->
  <requires>T004</requires>  <!-- Succeeded -->
</dependencies>
```

**Orchestrator Handling**:

```python
# Before launching T006
deps = ["T003", "T004"]
for dep in deps:
    status = Read(f'.nexus/tasks/{dep}/status.md')
    if "failed" in status:
        print(f"⚠️  Cannot run T006: dependency {dep} failed")
        # Mark T006 as blocked
        Write('.nexus/tasks/T006/status.md', 'blocked')
```

#### 3. Parallel Batch Failures

**What Happens**: Some tasks in a parallel batch fail

```python
# Launched 4 parallel tasks
results = {
    "T003": "completed",
    "T004": "failed",
    "T005": "completed",
    "T007": "failed"
}

# Orchestrator decides:
if critical_tasks_failed(results):
    # Stop workflow, require user intervention
    Write('.nexus/state/workflow-blocked.md', failure_report)
elif optional_tasks_failed(results):
    # Continue with warnings
    Write('.nexus/state/warnings.md', warning_list)
    # Proceed to next phase
```

### Recovery Strategies

#### 1. Automatic Retry

```python
# For transient failures (network, timeouts)
def retry_task(task_id, max_attempts=2):
    attempt = 1
    while attempt <= max_attempts:
        # Launch Task agent with same parameters
        Task(
            subagent_type="general-purpose",
            prompt=f"Retry task {task_id} (attempt {attempt}/{max_attempts})"
        )

        # Check result
        if task_succeeded(task_id):
            return True
        attempt += 1
    return False
```

#### 2. Manual Intervention Points

```markdown
# .nexus/state/intervention-required.md

<intervention>
  <timestamp>2024-01-15T11:00:00Z</timestamp>
  <reason>Critical decision needed</reason>
  <blocking-issue>
    Test framework not specified in constitution
  </blocking-issue>
  <options>
    1. Update .nexus/constitution.md with test framework
    2. Skip test generation tasks
    3. Use default framework (pytest/jest based on language)
  </options>
  <resume-command>Continue nexus workflow after updating constitution</resume-command>
</intervention>
```

#### 3. Rollback Capability

```bash
# Using git for workflow state rollback
git add .nexus/
git commit -m "Nexus: Checkpoint before IMPLEMENT phase"

# If phase fails catastrophically
git reset --hard HEAD~1
echo "DECOMPOSE" > .nexus/state/current-phase.md
# Retry with different approach
```

### Error Prevention

#### 1. Pre-flight Checks

```python
# Before launching tasks, orchestrator validates:
def preflight_check():
    checks = {
        "constitution_exists": file_exists('.nexus/constitution.md'),
        "specs_exist": file_exists('.nexus/specs/*.md'),
        "no_blocked_tasks": not file_exists('.nexus/state/workflow-blocked.md'),
        "agents_available": check_agent_registry()
    }

    failures = [k for k, v in checks.items() if not v]
    if failures:
        print(f"❌ Pre-flight checks failed: {failures}")
        return False
    return True
```

#### 2. Task Validation

```markdown
# .nexus/tasks/T003/definition.md

<validation-rules>
  <pre-conditions>
    - File exists: .nexus/specs/feature.md
    - Pattern exists: .nexus/patterns/test-patterns.md
  </pre-conditions>
  <post-conditions>
    - File created: tests/*
    - Status updated: .nexus/tasks/T003/status.md
  </post-conditions>
</validation-rules>
```

### Question Handling Failures

**Unlimited Questions Meet Reality**:

```markdown
# .nexus/questions/question-log.md

<question-session>
  <question-count>47</question-count>
  <status>incomplete</status>
  <reason>User timeout</reason>
</question-session>

<recovery-options>
  1. Continue with partial answers
  2. Use smart defaults for unanswered
  3. Resume questioning later
  4. Abort and restart
</recovery-options>
```

### Workflow State Recovery

```bash
# Orchestrator can always determine where to resume:

# 1. Check last completed phase
LAST_PHASE=$(tail -1 .nexus/state/phase-history.md)

# 2. Check pending tasks
PENDING=$(grep "\[ \]" .nexus/tasks/pending.md | wc -l)

# 3. Check blocked tasks
BLOCKED=$(find .nexus/tasks -name "status.md" -exec grep -l "blocked" {} \; | wc -l)

# 4. Provide clear status to user
echo "📊 Workflow Status:"
echo "  Last completed: $LAST_PHASE"
echo "  Pending tasks: $PENDING"
echo "  Blocked tasks: $BLOCKED"
echo "  Next action: $(determine_next_action)"
```

### Error Reporting Format

```markdown
# .nexus/errors/error-001.md

<error-report>
  <id>ERR-001</id>
  <timestamp>2024-01-15T11:30:00Z</timestamp>
  <phase>IMPLEMENT</phase>
  <task>T004</task>
  <severity>high</severity>
</error-report>

<details>
  <what-failed>Implementation agent could not create file</what-failed>
  <why>Permission denied on src/ directory</why>
  <impact>Cannot complete implementation phase</impact>
</details>

<resolution>
  <immediate>Check file permissions: chmod -R u+w src/</immediate>
  <preventive>Add permission check to pre-flight</preventive>
</resolution>
```

### Recovery Commands

```bash
# User-friendly recovery options:

# Resume after fixing issue
"Continue nexus workflow from last checkpoint"

# Retry specific task
"Retry task T003 with updated context"

# Skip and continue
"Skip failed tasks and continue workflow"

# Reset phase
"Reset to BRAINSTORM phase and start over"

# Debug mode
"Show me what went wrong with task T004"
```

### Key Principles

1. **Fail Fast**: Detect problems early through validation
2. **Clear Reporting**: Always explain what failed and why
3. **Multiple Recovery Paths**: Retry, skip, fix, or abort
4. **State Preservation**: Never lose work, always resumable
5. **User Control**: Clear options for how to proceed

---

## Appendix G: Enhanced Command Specifications

### Command Structure Evolution

Moving beyond simple commands to context-aware, intelligent orchestration.

#### Basic Commands → Intelligent Commands

**Traditional**:
```bash
/nexus-brainstorm  # Simple trigger
```

**Enhanced**:
```bash
/nexus-brainstorm --context "e-commerce checkout" --depth 3 --focus "security, performance"
```

**Natural Language** (Preferred):
```
"Brainstorm approaches for the e-commerce checkout, focusing on security and performance"
```

### Core Command Set

#### 1. Initialization & Setup

**`/nexus-init`**: Initialize project with Nexus workflow

```bash
# What it actually does:
mkdir -p .nexus/{constitution,specs,tasks,patterns,state,context}
echo "INIT" > .nexus/state/current-phase.md
cat > .nexus/constitution.md << 'EOF'
# Project Constitution
## Core Principles
- Test-first development
- No code without understanding
- Document decisions

## Project-Specific Rules
- [User provides during init]
EOF
```

**Natural Language Equivalent**:
- "Initialize nexus workflow for this project"
- "Set up nexus enhanced workflow"

#### 2. Workflow Phase Commands

**`/nexus-brainstorm [feature]`**: Generate multiple approaches

```python
# Orchestrator actions:
Task(
    subagent_type="general-purpose",
    prompt="""
    Generate 20+ approaches for [feature]
    Consider: architecture, libraries, patterns, trade-offs
    Output to: .nexus/brainstorms/[feature]-approaches.md
    """
)
```

**`/nexus-specify [feature]`**: Create detailed specification

```python
# After questioning phase:
Task(
    subagent_type="general-purpose",
    prompt="""
    Read: .nexus/questions/answered.md
    Read: .nexus/brainstorms/selected-approach.md
    Create detailed SRS in: .nexus/specs/[feature].md
    """
)
```

**`/nexus-decompose [feature]`**: Break into parallel tasks

```python
# Launches dependency analyzer:
Task(
    subagent_type="general-purpose",
    prompt="""
    Read: .nexus/specs/[feature].md
    Create task breakdown in: .nexus/tasks/pending.md
    Mark parallelizable tasks with [P]
    Define dependencies
    """
)
```

**`/nexus-implement [tasks]`**: Execute implementation

```python
# Launches up to 7 parallel tasks:
for task in parallel_tasks[:7]:
    Task(
        subagent_type=determine_agent_type(task),
        prompt=f"Execute task {task} per its definition"
    )
```

#### 3. Control Commands

**`/nexus-status`**: Show current workflow state

```bash
# Displays:
- Current phase
- Completed tasks
- Pending tasks
- Blocked items
- Next recommended action
```

**`/nexus-retry [task-id]`**: Retry failed task

```python
Task(
    subagent_type="general-purpose",
    prompt=f"Retry task {task_id} with updated context"
)
```

**`/nexus-skip [task-id]`**: Mark task as skipped

```bash
echo "skipped" > .nexus/tasks/[task-id]/status.md
# Continue with dependent tasks that don't strictly require it
```

**`/nexus-abort`**: Stop workflow gracefully

```bash
echo "ABORTED" > .nexus/state/current-phase.md
git commit -am "Nexus: Workflow aborted at $(date)"
```

#### 4. Intelligence Commands

**`/nexus-learn`**: Extract patterns from current work

```python
Task(
    subagent_type="general-purpose",
    prompt="""
    Analyze completed tasks in .nexus/tasks/*/
    Extract reusable patterns
    Save to: .nexus/patterns/discovered.md
    """
)
```

**`/nexus-optimize`**: Suggest workflow improvements

```python
Task(
    subagent_type="general-purpose",
    prompt="""
    Analyze workflow history
    Identify bottlenecks and inefficiencies
    Suggest parallelization opportunities
    Output: .nexus/optimization-report.md
    """
)
```

### Command Aliases & Natural Language

**Instead of rigid commands, prefer natural language**:

| Command | Natural Language Alternatives |
|---------|------------------------------|
| `/nexus-init` | "Set up nexus workflow" |
| `/nexus-brainstorm auth` | "Brainstorm authentication approaches" |
| `/nexus-decompose` | "Break down the current feature into tasks" |
| `/nexus-implement` | "Execute all parallel tasks" |
| `/nexus-status` | "Show workflow status" |
| `/nexus-retry T003` | "Retry the failed test task" |

### Context-Aware Commands

Commands adapt based on current state:

```python
# User says: "Continue"
# Orchestrator determines what to do:

if current_phase == "BRAINSTORM":
    # Move to questioning
    start_questioning()
elif current_phase == "DECOMPOSE":
    # Start implementation
    execute_parallel_tasks()
elif tasks_failed():
    # Offer recovery options
    show_recovery_menu()
else:
    # Move to next phase
    advance_workflow()
```

### Command Chaining

**Sequential Execution**:
```bash
"Brainstorm, specify, and decompose the payment feature"
# Orchestrator executes phases in sequence
```

**Conditional Execution**:
```bash
"If all tests pass, deploy to staging"
# Orchestrator checks conditions before proceeding
```

### Interactive Commands

**Progressive Disclosure**:
```
User: "Implement authentication"
Orchestrator: "I need to understand your requirements first. What type of authentication?"
User: "JWT with refresh tokens"
Orchestrator: "Should sessions expire? What's the token lifetime?"
[Continues until sufficient understanding]
```

### Command Implementation Reality

**These commands are NOT separate programs**, but rather:

1. **Aliases**: Bash aliases that echo specific phrases
2. **Scripts**: Simple scripts that set state and echo instructions
3. **Natural Language**: Direct instructions to orchestrator
4. **State Triggers**: File modifications that orchestrator detects

Example implementation:
```bash
# .nexus/commands/nexus-decompose.sh
#!/bin/bash
echo "DECOMPOSE" > .nexus/state/requested-action.md
echo "Please decompose the current feature into parallel tasks"
```

---

## Appendix H: Real-World Example Workflow

### Scenario: Building a REST API for User Management

Let's walk through a complete, realistic example of the Nexus workflow in action.

#### Phase 1: Initialization

**User**: "Initialize nexus workflow for a user management API"

**Orchestrator Actions**:

<function_calls>
```python
# 1. Create directory structure
Bash("mkdir -p .nexus/{constitution,specs,tasks,patterns,state,context}")

# 2. Create constitution through questioning
print("Let's establish your project constitution. What language/framework?")
# User: "Python with FastAPI"

Write('.nexus/constitution.md', """
# User Management API Constitution

## Technology Stack
- Language: Python 3.11+
- Framework: FastAPI
- Database: PostgreSQL
- Testing: pytest

## Core Principles
- Test-first development (TDD)
- API-first design
- JWT authentication
- RESTful principles

## Required Coverage
- Minimum 80% test coverage
- All endpoints must have integration tests
- All models must have unit tests
""")

Write('.nexus/state/current-phase.md', 'INITIALIZED')
```

#### Phase 2: Brainstorming

**User**: "Brainstorm user management features"

**Orchestrator**: Launches brainstorming agent

```python
Task(
    subagent_type="general-purpose",
    description="Brainstorm user management",
    prompt="""
    Generate 20+ approaches for user management API.
    Consider: authentication, authorization, user roles, profile management,
    password reset, email verification, audit logging, GDPR compliance.
    Output to: .nexus/brainstorms/user-management-approaches.md
    """
)
```

**Result**: `.nexus/brainstorms/user-management-approaches.md`
```markdown
## User Management Approaches

### Approach 1: Simple JWT with Redis Sessions
- Pros: Fast, scalable, easy invalidation
- Cons: Requires Redis infrastructure

### Approach 2: Stateless JWT with Refresh Tokens
- Pros: No session storage, scalable
- Cons: Token revocation complexity

[... 18 more approaches ...]
```

#### Phase 3: Specification (with Unlimited Questions)

**Orchestrator**: "I need to understand your requirements. Let me ask some questions..."

```markdown
# .nexus/questions/session-001.md

Q1: What types of users will the system have?
A1: Admin, regular users, and guest users

Q2: How should password reset work?
A2: Email with secure token, expires in 1 hour

Q3: Do you need social login integration?
A3: Yes, Google and GitHub OAuth

[... continues until understanding is complete ...]

Q47: Should we log all authentication attempts?
A47: Yes, for security auditing

<confidence>High</confidence>
<questions-asked>47</questions-asked>
```

**Orchestrator**: Creates specification

```python
Task(
    subagent_type="general-purpose",
    description="Create user management spec",
    prompt="""
    Read: .nexus/questions/session-001.md
    Read: .nexus/brainstorms/user-management-approaches.md (Approach 2 selected)
    Create detailed specification in: .nexus/specs/user-management.md
    Include: endpoints, models, security requirements, testing criteria
    """
)
```

#### Phase 4: Decomposition

**Orchestrator**: Breaks down into tasks

```python
Task(
    subagent_type="general-purpose",
    description="Decompose user management",
    prompt="""
    Read: .nexus/specs/user-management.md
    Create task list with dependencies.
    Mark parallelizable tasks with [P].
    Output to: .nexus/tasks/pending.md
    """
)
```

**Result**: `.nexus/tasks/pending.md`
```markdown
## User Management Tasks

### Database Layer
- [ ] T001: Create user model [P]
- [ ] T002: Create role model [P]
- [ ] T003: Create session model [P]
- [ ] T004: Create database migrations

### API Layer
- [ ] T005: Create user CRUD endpoints [P]
- [ ] T006: Create authentication endpoints [P]
- [ ] T007: Create authorization middleware
- [ ] T008: Create password reset flow

### Testing (TDD - Do First!)
- [ ] T009: Write user model tests [P]
- [ ] T010: Write auth endpoint tests [P]
- [ ] T011: Write integration tests

### Documentation
- [ ] T012: Generate OpenAPI docs [P]
- [ ] T013: Write deployment guide
```

#### Phase 5: Implementation (Parallel Execution)

**Orchestrator**: "Starting parallel implementation of test tasks first (TDD)"

```python
# BATCH 1: Tests First (TDD Enforcement)
Task(
    subagent_type="general-purpose",
    description="Write user model tests",
    prompt="""
    Read: .nexus/specs/user-management.md
    Read: .nexus/constitution.md (pytest framework)
    Write comprehensive tests to: tests/test_models.py
    Update: .nexus/tasks/T009/status.md
    """
)

Task(
    subagent_type="general-purpose",
    description="Write auth endpoint tests",
    prompt="""
    Read: .nexus/specs/user-management.md
    Write endpoint tests to: tests/test_auth.py
    Include: login, logout, refresh, password reset
    Update: .nexus/tasks/T010/status.md
    """
)

# ... up to 5 more parallel test tasks
```

**After tests complete**:

```python
# BATCH 2: Implementation (to make tests pass)
Task(
    subagent_type="general-purpose",
    description="Implement user model",
    prompt="""
    Read: tests/test_models.py
    Implement model to make tests pass: app/models/user.py
    Follow: .nexus/patterns/model-patterns.md
    Update: .nexus/tasks/T001/status.md
    """
)

# ... parallel implementation tasks
```

#### Phase 6: Integration & Validation

**Orchestrator**: Checks all task results

```bash
# Verify all tasks completed
for task in T001 T002 T003 T004 T005; do
    if grep -q "completed" .nexus/tasks/$task/status.md; then
        echo "✓ $task completed"
    else
        echo "❌ $task failed or pending"
    fi
done

# Run full test suite
python -m pytest tests/ --cov=app --cov-report=term

# Check coverage meets constitution requirements
COVERAGE=$(pytest --cov=app --cov-report=term | grep TOTAL | awk '{print $4}')
if [ "${COVERAGE%\%}" -ge 80 ]; then
    echo "✓ Coverage requirement met: $COVERAGE"
else
    echo "❌ Coverage too low: $COVERAGE (required: 80%)"
fi
```

#### Phase 7: Pattern Extraction & Learning

**Orchestrator**: Extracts reusable patterns

```python
Task(
    subagent_type="general-purpose",
    description="Extract patterns",
    prompt="""
    Analyze: app/models/*.py, app/api/*.py
    Extract common patterns:
    - Authentication flow
    - Error handling
    - Validation logic
    Save to: .nexus/patterns/api-patterns.md
    """
)
```

**Result**: `.nexus/patterns/api-patterns.md`
```markdown
## Extracted Patterns

### JWT Authentication Pattern
```python
def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
```

### Input Validation Pattern
```python
@validator('email')
def validate_email(cls, v):
    if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', v):
        raise ValueError('Invalid email format')
    return v
```

Reuse these patterns in future authentication tasks.
```

#### Workflow Completion

**Final State**: `.nexus/state/workflow-summary.md`

```markdown
# Workflow Summary

## Completed Phases
- ✓ INIT: Constitution established
- ✓ BRAINSTORM: 20 approaches generated
- ✓ SPECIFY: 47 questions asked, high confidence achieved
- ✓ DECOMPOSE: 13 tasks identified, 8 parallelizable
- ✓ IMPLEMENT: All tasks completed
- ✓ VALIDATE: 85% test coverage achieved
- ✓ LEARN: 3 patterns extracted

## Metrics
- Total time: 2.5 hours
- Parallel efficiency: 60% (8/13 tasks parallelized)
- Test coverage: 85%
- Code generated: 1,250 lines
- Tests written: 450 lines

## Reusable Assets Created
- .nexus/patterns/api-patterns.md
- .nexus/patterns/test-patterns.md
- .nexus/constitution.md (project template)

## Next Features Ready
- Email service integration
- Admin dashboard
- API rate limiting
```

### Key Takeaways from Example

1. **TDD Enforced**: Tests written before implementation
2. **Parallel Execution**: 8 tasks run simultaneously
3. **Pattern Learning**: Reusable patterns extracted
4. **State Preserved**: Can resume at any point
5. **Metrics Tracked**: Clear visibility into efficiency

### Adaptation for Different Projects

**Frontend React App**:
- Constitution: React, TypeScript, Jest, Cypress
- Tasks: Components, hooks, tests, stories
- Patterns: Component patterns, state management

**Data Pipeline**:
- Constitution: Python, Airflow, pytest
- Tasks: ETL functions, DAGs, data validation
- Patterns: Transformation patterns, error handling

**Mobile App**:
- Constitution: Flutter, Dart, Firebase
- Tasks: Screens, widgets, state, API client
- Patterns: Widget composition, navigation

The Nexus workflow adapts to any software project through its constitution and flexible task system.

---

## Conclusion

The Nexus Enhanced Workflow represents a practical, implementable system that leverages the Task tool's parallel execution capabilities while maintaining realistic expectations about what can be achieved without external infrastructure.

### Core Strengths

1. **Real Parallelism**: Up to 7 Task agents running simultaneously
2. **No Infrastructure**: Pure file-based, no databases or daemons required
3. **Language Agnostic**: Adapts to any technology stack via constitution
4. **TDD Enforcement**: Constitutional blocking ensures test-first development
5. **Unlimited Questions**: No artificial limits on understanding requirements
6. **Pattern Learning**: Extracts and reuses successful patterns
7. **Full Transparency**: All state visible in version-controlled files

### Honest Limitations

1. **No Real-time Updates**: Task agents report only upon completion
2. **No Inter-agent Communication**: Agents work independently
3. **Manual Orchestration**: Requires user to trigger phases
4. **Token Constraints**: Large projects may hit context limits
5. **Sequential Batches**: Parallel tasks must complete before next batch

### When to Use Nexus

**Ideal For**:
- New feature development
- Complex refactoring projects
- API development
- Test suite creation
- Documentation generation
- Code migration projects

**Not Ideal For**:
- Simple bug fixes
- Minor text changes
- Emergency hotfixes
- Projects with unclear requirements

### Getting Started

1. **Initialize**: Create `.nexus/` directory and constitution
2. **Configure**: Define project-specific rules and patterns
3. **Begin**: Start with brainstorming or jump to any phase
4. **Iterate**: Learn from each cycle, extract patterns
5. **Evolve**: Continuously improve the workflow

### The Philosophy

> "No code without understanding, no implementation without tests, no decision without documentation."

The Nexus workflow embodies the principle that quality software emerges from deep understanding, systematic development, and continuous learning. It's not about speed—it's about doing things right the first time.

---

*"Quality is not an act, it is a habit." - Aristotle*

**Next Steps**: Begin with `/nexus-init` to initialize your first project with the Nexus workflow.
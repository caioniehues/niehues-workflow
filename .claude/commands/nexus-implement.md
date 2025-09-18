---
name: nexus-implement
description: Execute test-driven implementation with quality enforcement
tools: Read, Write, Edit, Bash, TodoWrite
implementation: .claude/commands/nexus-implement.md
---

# /nexus-implement [task-id]

Execute implementation following TDD cycle with guideline enforcement.

<pre_flight>
  <check id="task_exists">
    Load task from .nexus/tasks/
    Verify task state is appropriate
    Check dependencies completed
  </check>

  <check id="test_requirements">
    Identify test file location
    Verify test task completed first
    Load test specifications
  </check>

  <check id="guidelines">
    Load .nexus/guidelines.md
    Check TDD compliance mode
    Review exceptions if any
  </check>
</pre_flight>

<tdd_cycle>
  <red_phase>
    **Write Failing Test**

    1. Create/update test file
    2. Write test for requirement
    3. Run test to verify failure
    4. Get user approval on test

    If test passes without implementation:
    - Test may be inadequate
    - Implementation may exist
    - Investigate and correct
  </red_phase>

  <green_phase>
    **Write Minimal Implementation**

    1. Write ONLY enough code to pass
    2. No premature optimization
    3. No extra features
    4. Focus on making test green

    Run test to verify passing
  </green_phase>

  <refactor_phase>
    **Improve Code Quality**

    1. Remove duplication
    2. Improve naming
    3. Extract methods/functions
    4. Apply patterns if appropriate

    Run tests after each change
    All tests must remain green
  </refactor_phase>
</tdd_cycle>

<implementation_flow>
  <step number="1">
    **Update Task State**

    Set state: WRITING_TEST
    Update: .nexus/tasks/tracking.yaml
  </step>

  <step number="2">
    **Write Test First**

    Create test following project conventions
    Test must fail initially (RED)
    Document what test validates
  </step>

  <step number="3">
    **Get Test Approval**

    Show test to user
    Explain coverage
    Get confirmation to proceed

    State: TEST_FAILING
  </step>

  <step number="4">
    **Implement Solution**

    Write minimal code
    Follow existing patterns
    Use project conventions

    State: IMPLEMENTING
  </step>

  <step number="5">
    **Verify Tests Pass**

    Run test suite
    All tests must pass
    No regression allowed

    State: TEST_PASSING
  </step>

  <step number="6" subagent="security-guardian">
    **Security Review**

    Check for vulnerabilities
    Review data handling
    Verify authentication
    Check authorization
  </step>

  <step number="7" subagent="pattern-detector">
    **Pattern Extraction**

    If code repeated 3+ times:
    - Extract pattern
    - Document in library
    - Create template
  </step>

  <step number="8">
    **Refactor if Needed**

    Improve structure
    Apply patterns
    Enhance readability

    State: REFACTORING
  </step>

  <step number="9">
    **Final Validation**

    Run full test suite
    Check coverage metrics
    Verify guidelines compliance

    State: REVIEWING → DONE
  </step>
</implementation_flow>

<tdd_exceptions>
  Allowed exceptions (must document):

  **Exploratory Spike**:
  - Maximum 2 hours
  - Must create tests after
  - Document learnings

  **Emergency Hotfix**:
  - Tests within 24 hours
  - Document in decision log
  - Create debt ticket

  **Proof of Concept**:
  - Clearly marked as POC
  - Not for production
  - Tests before productionizing
</tdd_exceptions>

<outputs>
  - Implemented code
  - Passing tests
  - Updated task state
  - Pattern extractions
  - Security review results
</outputs>
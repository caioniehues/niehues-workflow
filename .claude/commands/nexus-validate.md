---
name: nexus-validate
description: Comprehensive validation with quality gates and metrics
tools: Bash, Read, Write, Glob, Task
implementation: .claude/commands/nexus-validate.md
---

# /nexus-validate [feature]

Validate implementation against quality standards and requirements.

<pre_flight>
  <check id="implementation_complete">
    Verify all tasks in DONE state
    Check no BLOCKED tasks
    Review any FAILED tasks
  </check>

  <check id="test_environment">
    Detect test framework
    Verify test commands
    Check coverage tools
  </check>
</pre_flight>

<validation_phases>
  <phase name="test_validation">
    **Test Execution**

    Run all test suites:
    - Unit tests
    - Integration tests
    - E2E tests (if applicable)

    Success criteria:
    - 100% tests passing
    - No flaky tests
    - Reasonable execution time
  </phase>

  <phase name="coverage_validation">
    **Coverage Analysis**

    Measure test coverage:
    - Line coverage ≥ 80%
    - Branch coverage ≥ 70%
    - Critical paths 100%

    Identify gaps:
    - Uncovered lines
    - Untested branches
    - Missing edge cases
  </phase>

  <phase name="guideline_validation">
    **Guideline Compliance**

    Check against .nexus/guidelines.md:
    - TDD compliance
    - Code style
    - Documentation
    - Security practices

    Generate compliance report
  </phase>

  <phase name="security_validation" subagent="security-guardian">
    **Security Scan**

    Perform security checks:
    - Dependency vulnerabilities
    - Code security patterns
    - Sensitive data exposure
    - Authentication/authorization

    Must pass all critical checks
  </phase>

  <phase name="documentation_validation">
    **Documentation Check**

    Verify documentation:
    - API documentation complete
    - README updated
    - Inline comments appropriate
    - Examples provided
  </phase>

  <phase name="performance_validation">
    **Performance Benchmarks**

    Run performance tests:
    - Response time requirements
    - Resource usage limits
    - Scalability tests
    - Load testing
  </phase>

  <phase name="pattern_validation" subagent="pattern-detector">
    **Pattern Compliance**

    Verify pattern usage:
    - Patterns correctly applied
    - No anti-patterns detected
    - Consistency maintained
  </phase>
</validation_phases>

<quality_gates>
  <gate name="tests" required="true">
    All tests must pass
  </gate>

  <gate name="coverage" required="true">
    Coverage ≥ 80%
  </gate>

  <gate name="security" required="true">
    No critical vulnerabilities
  </gate>

  <gate name="guidelines" required="true">
    95% guideline compliance
  </gate>

  <gate name="documentation" required="false">
    Documentation complete
  </gate>
</quality_gates>

<report_generation>
  Generate validation report:
  .nexus/validation/[timestamp]-report.md

  Include:
  - Test results
  - Coverage metrics
  - Security findings
  - Guideline compliance
  - Performance results
  - Recommendations
</report_generation>

<micro_evolution>
  Track validation patterns:
  - Common failures
  - Recurring issues
  - Improvement opportunities
  - Success patterns
</micro_evolution>
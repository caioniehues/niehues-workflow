<?xml version="1.0" encoding="UTF-8"?>
<task id="6" name="Late Pipeline Phases" parallel_group="pipeline">
  <metadata>
    <title>Late Pipeline Phases - IMPLEMENT, VALIDATE, and MAINTAIN</title>
    <description>Create specifications for implementation, validation, and maintenance phases</description>
    <assigned_to>quality-specialist</assigned_to>
    <priority>critical</priority>
    <t_shirt_size>L</t_shirt_size>
    <estimated_hours>4</estimated_hours>
    <context_source>docs/specs/nexus-enhanced-specification-v5.md#late-pipeline</context_source>
  </metadata>

  <requirements>
    <requirement id="LP-001" priority="critical">
      Create /nexus-implement command with TDD enforcement
    </requirement>
    <requirement id="LP-002" priority="critical">
      Create /nexus-validate command with quality gates
    </requirement>
    <requirement id="LP-003" priority="high">
      Create /nexus-maintain command for ongoing support
    </requirement>
    <requirement id="LP-004" priority="high">
      Design validation checklists and quality metrics
    </requirement>
  </requirements>

  <deliverables>

    <!-- 1. Implement Command Specification -->
    <deliverable id="LPD-001" type="command">
      <path>.claude/commands/nexus-implement.md</path>
      <description>Implementation command with TDD enforcement</description>
      <content_structure>
---
name: nexus-implement
description: Execute test-driven implementation with quality enforcement
tools: Read, Write, Edit, Bash, TodoWrite
implementation: .claude/commands/nexus-implement.md
---

# /nexus-implement [task-id]

Execute implementation following TDD cycle with guideline enforcement.

&lt;pre_flight&gt;
  &lt;check id="task_exists"&gt;
    Load task from .nexus/tasks/
    Verify task state is appropriate
    Check dependencies completed
  &lt;/check&gt;

  &lt;check id="test_requirements"&gt;
    Identify test file location
    Verify test task completed first
    Load test specifications
  &lt;/check&gt;

  &lt;check id="guidelines"&gt;
    Load .nexus/guidelines.md
    Check TDD compliance mode
    Review exceptions if any
  &lt;/check&gt;
&lt;/pre_flight&gt;

&lt;tdd_cycle&gt;
  &lt;red_phase&gt;
    **Write Failing Test**

    1. Create/update test file
    2. Write test for requirement
    3. Run test to verify failure
    4. Get user approval on test

    If test passes without implementation:
    - Test may be inadequate
    - Implementation may exist
    - Investigate and correct
  &lt;/red_phase&gt;

  &lt;green_phase&gt;
    **Write Minimal Implementation**

    1. Write ONLY enough code to pass
    2. No premature optimization
    3. No extra features
    4. Focus on making test green

    Run test to verify passing
  &lt;/green_phase&gt;

  &lt;refactor_phase&gt;
    **Improve Code Quality**

    1. Remove duplication
    2. Improve naming
    3. Extract methods/functions
    4. Apply patterns if appropriate

    Run tests after each change
    All tests must remain green
  &lt;/refactor_phase&gt;
&lt;/tdd_cycle&gt;

&lt;implementation_flow&gt;
  &lt;step number="1"&gt;
    **Update Task State**

    Set state: WRITING_TEST
    Update: .nexus/tasks/tracking.yaml
  &lt;/step&gt;

  &lt;step number="2"&gt;
    **Write Test First**

    Create test following project conventions
    Test must fail initially (RED)
    Document what test validates
  &lt;/step&gt;

  &lt;step number="3"&gt;
    **Get Test Approval**

    Show test to user
    Explain coverage
    Get confirmation to proceed

    State: TEST_FAILING
  &lt;/step&gt;

  &lt;step number="4"&gt;
    **Implement Solution**

    Write minimal code
    Follow existing patterns
    Use project conventions

    State: IMPLEMENTING
  &lt;/step&gt;

  &lt;step number="5"&gt;
    **Verify Tests Pass**

    Run test suite
    All tests must pass
    No regression allowed

    State: TEST_PASSING
  &lt;/step&gt;

  &lt;step number="6" subagent="security-guardian"&gt;
    **Security Review**

    Check for vulnerabilities
    Review data handling
    Verify authentication
    Check authorization
  &lt;/step&gt;

  &lt;step number="7" subagent="pattern-detector"&gt;
    **Pattern Extraction**

    If code repeated 3+ times:
    - Extract pattern
    - Document in library
    - Create template
  &lt;/step&gt;

  &lt;step number="8"&gt;
    **Refactor if Needed**

    Improve structure
    Apply patterns
    Enhance readability

    State: REFACTORING
  &lt;/step&gt;

  &lt;step number="9"&gt;
    **Final Validation**

    Run full test suite
    Check coverage metrics
    Verify guidelines compliance

    State: REVIEWING → DONE
  &lt;/step&gt;
&lt;/implementation_flow&gt;

&lt;tdd_exceptions&gt;
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
&lt;/tdd_exceptions&gt;

&lt;outputs&gt;
  - Implemented code
  - Passing tests
  - Updated task state
  - Pattern extractions
  - Security review results
&lt;/outputs&gt;
      </content_structure>
    </deliverable>

    <!-- 2. Validate Command Specification -->
    <deliverable id="LPD-002" type="command">
      <path>.claude/commands/nexus-validate.md</path>
      <description>Validation command with comprehensive quality checks</description>
      <content_structure>
---
name: nexus-validate
description: Comprehensive validation with quality gates and metrics
tools: Bash, Read, Write, Glob, Task
implementation: .claude/commands/nexus-validate.md
---

# /nexus-validate [feature]

Validate implementation against quality standards and requirements.

&lt;pre_flight&gt;
  &lt;check id="implementation_complete"&gt;
    Verify all tasks in DONE state
    Check no BLOCKED tasks
    Review any FAILED tasks
  &lt;/check&gt;

  &lt;check id="test_environment"&gt;
    Detect test framework
    Verify test commands
    Check coverage tools
  &lt;/check&gt;
&lt;/pre_flight&gt;

&lt;validation_phases&gt;
  &lt;phase name="test_validation"&gt;
    **Test Execution**

    Run all test suites:
    - Unit tests
    - Integration tests
    - E2E tests (if applicable)

    Success criteria:
    - 100% tests passing
    - No flaky tests
    - Reasonable execution time
  &lt;/phase&gt;

  &lt;phase name="coverage_validation"&gt;
    **Coverage Analysis**

    Measure test coverage:
    - Line coverage ≥ 80%
    - Branch coverage ≥ 70%
    - Critical paths 100%

    Identify gaps:
    - Uncovered lines
    - Untested branches
    - Missing edge cases
  &lt;/phase&gt;

  &lt;phase name="guideline_validation"&gt;
    **Guideline Compliance**

    Check against .nexus/guidelines.md:
    - TDD compliance
    - Code style
    - Documentation
    - Security practices

    Generate compliance report
  &lt;/phase&gt;

  &lt;phase name="security_validation" subagent="security-guardian"&gt;
    **Security Scan**

    Perform security checks:
    - Dependency vulnerabilities
    - Code security patterns
    - Sensitive data exposure
    - Authentication/authorization

    Must pass all critical checks
  &lt;/phase&gt;

  &lt;phase name="documentation_validation"&gt;
    **Documentation Check**

    Verify documentation:
    - API documentation complete
    - README updated
    - Inline comments appropriate
    - Examples provided
  &lt;/phase&gt;

  &lt;phase name="performance_validation"&gt;
    **Performance Benchmarks**

    Run performance tests:
    - Response time requirements
    - Resource usage limits
    - Scalability tests
    - Load testing
  &lt;/phase&gt;

  &lt;phase name="pattern_validation" subagent="pattern-detector"&gt;
    **Pattern Compliance**

    Verify pattern usage:
    - Patterns correctly applied
    - No anti-patterns detected
    - Consistency maintained
  &lt;/phase&gt;
&lt;/validation_phases&gt;

&lt;quality_gates&gt;
  &lt;gate name="tests" required="true"&gt;
    All tests must pass
  &lt;/gate&gt;

  &lt;gate name="coverage" required="true"&gt;
    Coverage ≥ 80%
  &lt;/gate&gt;

  &lt;gate name="security" required="true"&gt;
    No critical vulnerabilities
  &lt;/gate&gt;

  &lt;gate name="guidelines" required="true"&gt;
    95% guideline compliance
  &lt;/gate&gt;

  &lt;gate name="documentation" required="false"&gt;
    Documentation complete
  &lt;/gate&gt;
&lt;/quality_gates&gt;

&lt;report_generation&gt;
  Generate validation report:
  .nexus/validation/[timestamp]-report.md

  Include:
  - Test results
  - Coverage metrics
  - Security findings
  - Guideline compliance
  - Performance results
  - Recommendations
&lt;/report_generation&gt;

&lt;micro_evolution&gt;
  Track validation patterns:
  - Common failures
  - Recurring issues
  - Improvement opportunities
  - Success patterns
&lt;/micro_evolution&gt;
      </content_structure>
    </deliverable>

    <!-- 3. Maintain Command Specification -->
    <deliverable id="LPD-003" type="command">
      <path>.claude/commands/nexus-maintain.md</path>
      <description>Maintenance command for ongoing support</description>
      <content_structure>
---
name: nexus-maintain
description: Handle maintenance tasks including bugs, updates, and improvements
tools: Read, Write, Edit, Bash, TodoWrite, Task
implementation: .claude/commands/nexus-maintain.md
---

# /nexus-maintain [type] [description]

Handle ongoing maintenance with pattern extraction and debt tracking.

&lt;maintenance_types&gt;
  &lt;type name="bug-fix"&gt;
    Fix defects in production code
    Requires test reproduction
    May bypass full pipeline for critical issues
  &lt;/type&gt;

  &lt;type name="security-patch"&gt;
    Apply security updates
    Priority handling
    Immediate deployment path
  &lt;/type&gt;

  &lt;type name="dependency-update"&gt;
    Update external dependencies
    Check compatibility
    Run regression tests
  &lt;/type&gt;

  &lt;type name="performance-optimization"&gt;
    Improve performance
    Benchmark before/after
    Maintain functionality
  &lt;/type&gt;

  &lt;type name="tech-debt"&gt;
    Address technical debt
    Refactor without changing behavior
    Improve maintainability
  &lt;/type&gt;

  &lt;type name="documentation"&gt;
    Update documentation
    Add examples
    Clarify usage
  &lt;/type&gt;
&lt;/maintenance_types&gt;

&lt;process_flow&gt;
  &lt;step number="1"&gt;
    **Classify Maintenance**

    Determine:
    - Type of maintenance
    - Priority level
    - Impact assessment
    - Required timeline
  &lt;/step&gt;

  &lt;step number="2"&gt;
    **Create Maintenance Task**

    Document in .nexus/maintenance/:
    - Issue description
    - Root cause (if known)
    - Proposed solution
    - Test requirements
  &lt;/step&gt;

  &lt;step number="3"&gt;
    **Bug Reproduction** (if bug-fix)

    Create failing test:
    - Reproduces issue
    - Documents expected behavior
    - Becomes regression test
  &lt;/step&gt;

  &lt;step number="4"&gt;
    **Impact Analysis**

    Assess:
    - Affected components
    - Downstream dependencies
    - User impact
    - Risk level
  &lt;/step&gt;

  &lt;step number="5"&gt;
    **Implementation**

    Follow modified TDD:
    - Test exists (bug) or created first
    - Minimal change principle
    - Preserve existing behavior
    - Document changes
  &lt;/step&gt;

  &lt;step number="6"&gt;
    **Regression Testing**

    Run comprehensive tests:
    - All existing tests
    - New test for fix
    - Integration tests
    - Manual testing if needed
  &lt;/step&gt;

  &lt;step number="7" subagent="pattern-detector"&gt;
    **Pattern Extraction**

    Identify patterns:
    - Recurring bugs
    - Common fixes
    - Maintenance patterns

    Update pattern library
  &lt;/step&gt;

  &lt;step number="8"&gt;
    **Documentation Update**

    Update:
    - Changelog
    - Known issues
    - Troubleshooting guide
    - API documentation
  &lt;/step&gt;

  &lt;step number="9"&gt;
    **Debt Tracking**

    If shortcuts taken:
    - Document technical debt
    - Create follow-up tasks
    - Set remediation timeline
    - Track in .nexus/debt.yaml
  &lt;/step&gt;
&lt;/process_flow&gt;

&lt;emergency_protocols&gt;
  For critical issues:

  1. Assess severity and impact
  2. Implement immediate mitigation
  3. Document emergency changes
  4. Create tests within 24 hours
  5. Full validation within 48 hours
  6. Post-mortem analysis
  7. Update emergency procedures
&lt;/emergency_protocols&gt;

&lt;maintenance_metrics&gt;
  Track:
  - Time to resolution
  - Bug recurrence rate
  - Debt accumulation
  - Pattern extraction rate
  - Test coverage maintenance
&lt;/maintenance_metrics&gt;
      </content_structure>
    </deliverable>

    <!-- 4. Validation Checklist Template -->
    <deliverable id="LPD-004" type="template">
      <path>templates/validation-checklist.md</path>
      <description>Comprehensive validation checklist</description>
      <content_structure>
# Validation Checklist: {{feature_name}}
Date: {{timestamp}}
Validator: {{validator}}
Version: {{version}}

## Test Validation
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing (if applicable)
- [ ] No flaky tests identified
- [ ] Test execution time acceptable (&lt; {{threshold}})

## Coverage Metrics
- [ ] Line coverage ≥ 80% (actual: {{line_coverage}}%)
- [ ] Branch coverage ≥ 70% (actual: {{branch_coverage}}%)
- [ ] Critical paths 100% covered
- [ ] No significant coverage gaps

### Coverage Gaps (if any)
{{#each coverage_gaps}}
- File: {{file}}, Lines: {{lines}}, Reason: {{reason}}
{{/each}}

## Guideline Compliance
- [ ] TDD practices followed
- [ ] Code style guidelines met
- [ ] Naming conventions consistent
- [ ] Documentation standards met
- [ ] Security guidelines followed

### Guideline Violations (if any)
{{#each violations}}
- Guideline: {{guideline}}, Location: {{location}}, Severity: {{severity}}
{{/each}}

## Security Validation
- [ ] No critical vulnerabilities
- [ ] No high-severity issues
- [ ] Dependencies up to date
- [ ] Sensitive data protected
- [ ] Authentication properly implemented
- [ ] Authorization correctly enforced

### Security Findings
{{#each security_findings}}
- Level: {{level}}, Issue: {{issue}}, Remediation: {{remediation}}
{{/each}}

## Documentation Review
- [ ] API documentation complete
- [ ] README updated
- [ ] Inline comments appropriate
- [ ] Examples provided
- [ ] Changelog updated

## Performance Validation
- [ ] Response time requirements met
- [ ] Resource usage within limits
- [ ] Scalability tests passed
- [ ] Load testing successful

### Performance Metrics
- Average response time: {{avg_response}}ms
- Peak memory usage: {{peak_memory}}MB
- CPU utilization: {{cpu_usage}}%
- Throughput: {{throughput}} req/s

## Pattern Compliance
- [ ] Approved patterns used correctly
- [ ] No anti-patterns detected
- [ ] Consistency with codebase maintained
- [ ] New patterns documented (if any)

## Quality Gates Summary
| Gate | Required | Status | Details |
|------|----------|--------|---------|
| Tests | Yes | {{test_status}} | {{test_details}} |
| Coverage | Yes | {{coverage_status}} | {{coverage_details}} |
| Security | Yes | {{security_status}} | {{security_details}} |
| Guidelines | Yes | {{guideline_status}} | {{guideline_details}} |
| Documentation | No | {{doc_status}} | {{doc_details}} |
| Performance | No | {{perf_status}} | {{perf_details}} |

## Overall Validation Result
**Status**: {{overall_status}}

## Recommendations
{{#each recommendations}}
- {{recommendation}}
{{/each}}

## Sign-off
- [ ] Technical Lead Review
- [ ] Security Review
- [ ] QA Approval
- [ ] Product Owner Acceptance

## Next Steps
{{#each next_steps}}
1. {{step}}
{{/each}}
      </content_structure>
    </deliverable>

    <!-- 5. Maintenance Log Template -->
    <deliverable id="LPD-005" type="template">
      <path>templates/maintenance-log.yaml</path>
      <description>Maintenance tracking template</description>
      <content_structure>
# Maintenance Log
# Updated: {{timestamp}}

maintenance_items:
{{#each items}}
  - id: {{maintenance_id}}
    date: {{date}}
    type: {{type}} # bug-fix|security-patch|dependency-update|performance|tech-debt|documentation
    priority: {{priority}} # critical|high|medium|low

    issue:
      description: {{issue_description}}
      reported_by: {{reporter}}
      affected_components:
      {{#each components}}
        - {{component}}
      {{/each}}

    solution:
      approach: {{solution_approach}}
      implemented_by: {{implementer}}
      test_added: {{test_added}}

    validation:
      tests_passing: {{tests_passing}}
      regression_tested: {{regression_tested}}
      security_checked: {{security_checked}}

    metrics:
      time_to_resolve: {{resolution_time}}
      lines_changed: {{lines_changed}}
      files_affected: {{files_affected}}

    patterns_extracted:
    {{#each patterns}}
      - {{pattern_name}}: {{pattern_description}}
    {{/each}}

    technical_debt:
      created: {{debt_created}}
      description: {{debt_description}}
      remediation_plan: {{remediation}}
      target_date: {{target_date}}

    documentation_updates:
    {{#each doc_updates}}
      - {{document}}: {{change}}
    {{/each}}
{{/each}}

statistics:
  total_items: {{total_count}}
  by_type:
    bug_fixes: {{bug_count}}
    security_patches: {{security_count}}
    dependency_updates: {{dependency_count}}
    performance_optimizations: {{performance_count}}
    tech_debt_payments: {{debt_count}}
    documentation_updates: {{doc_count}}

  by_priority:
    critical: {{critical_count}}
    high: {{high_count}}
    medium: {{medium_count}}
    low: {{low_count}}

  metrics:
    average_resolution_time: {{avg_resolution}}
    bug_recurrence_rate: {{recurrence_rate}}%
    debt_reduction: {{debt_reduction}}%
    pattern_extraction_rate: {{pattern_rate}}

recurring_issues:
{{#each recurring}}
  - issue: {{issue}}
    frequency: {{frequency}}
    proposed_solution: {{solution}}
{{/each}}

improvement_opportunities:
{{#each improvements}}
  - area: {{area}}
    description: {{description}}
    potential_impact: {{impact}}
{{/each}}
      </content_structure>
    </deliverable>

  </deliverables>

  <success_criteria>
    - TDD enforcement clearly specified
    - Validation gates comprehensive
    - Maintenance procedures defined
    - Emergency protocols documented
    - Quality metrics tracked
    - Pattern extraction integrated
    - Technical debt managed
    - All templates complete
  </success_criteria>

  <dependencies>
    - Mid pipeline phases (Task 5)
    - Task management (Task 7)
    - Evolution system (Task 8)
  </dependencies>

  <notes>
    This is METHODOLOGY documentation:
    - NO TypeScript code
    - NO compiled software
    - Only process specifications and templates
    - Focus on quality and maintenance workflows
    - All execution through Claude commands
  </notes>

</task>
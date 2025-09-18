---
name: nexus-maintain
description: Handle maintenance tasks including bugs, updates, and improvements
tools: Read, Write, Edit, Bash, TodoWrite, Task
implementation: .claude/commands/nexus-maintain.md
---

# /nexus-maintain [type] [description]

Handle ongoing maintenance with pattern extraction and debt tracking.

<maintenance_types>
  <type name="bug-fix">
    Fix defects in production code
    Requires test reproduction
    May bypass full pipeline for critical issues
  </type>

  <type name="security-patch">
    Apply security updates
    Priority handling
    Immediate deployment path
  </type>

  <type name="dependency-update">
    Update external dependencies
    Check compatibility
    Run regression tests
  </type>

  <type name="performance-optimization">
    Improve performance
    Benchmark before/after
    Maintain functionality
  </type>

  <type name="tech-debt">
    Address technical debt
    Refactor without changing behavior
    Improve maintainability
  </type>

  <type name="documentation">
    Update documentation
    Add examples
    Clarify usage
  </type>
</maintenance_types>

<process_flow>
  <step number="1">
    **Classify Maintenance**

    Determine:
    - Type of maintenance
    - Priority level
    - Impact assessment
    - Required timeline
  </step>

  <step number="2">
    **Create Maintenance Task**

    Document in .nexus/maintenance/:
    - Issue description
    - Root cause (if known)
    - Proposed solution
    - Test requirements
  </step>

  <step number="3">
    **Bug Reproduction** (if bug-fix)

    Create failing test:
    - Reproduces issue
    - Documents expected behavior
    - Becomes regression test
  </step>

  <step number="4">
    **Impact Analysis**

    Assess:
    - Affected components
    - Downstream dependencies
    - User impact
    - Risk level
  </step>

  <step number="5">
    **Implementation**

    Follow modified TDD:
    - Test exists (bug) or created first
    - Minimal change principle
    - Preserve existing behavior
    - Document changes
  </step>

  <step number="6">
    **Regression Testing**

    Run comprehensive tests:
    - All existing tests
    - New test for fix
    - Integration tests
    - Manual testing if needed
  </step>

  <step number="7" subagent="pattern-detector">
    **Pattern Extraction**

    Identify patterns:
    - Recurring bugs
    - Common fixes
    - Maintenance patterns

    Update pattern library
  </step>

  <step number="8">
    **Documentation Update**

    Update:
    - Changelog
    - Known issues
    - Troubleshooting guide
    - API documentation
  </step>

  <step number="9">
    **Debt Tracking**

    If shortcuts taken:
    - Document technical debt
    - Create follow-up tasks
    - Set remediation timeline
    - Track in .nexus/debt.yaml
  </step>
</process_flow>

<emergency_protocols>
  For critical issues:

  1. Assess severity and impact
  2. Implement immediate mitigation
  3. Document emergency changes
  4. Create tests within 24 hours
  5. Full validation within 48 hours
  6. Post-mortem analysis
  7. Update emergency procedures
</emergency_protocols>

<maintenance_metrics>
  Track:
  - Time to resolution
  - Bug recurrence rate
  - Debt accumulation
  - Pattern extraction rate
  - Test coverage maintenance
</maintenance_metrics>
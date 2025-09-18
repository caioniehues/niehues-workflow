---
name: nexus-decompose
description: Break down specifications into sized, trackable tasks
tools: Read, Write, TodoWrite, Task
implementation: .claude/commands/nexus-decompose.md
---

# /nexus-decompose [feature]

Transform designs into executable, sized tasks with dependencies.

<pre_flight>
  <check id="design_exists">
    Load architecture from .nexus/design/
    Identify components to build
  </check>

  <check id="specification_exists">
    Load requirements
    Extract test criteria
  </check>
</pre_flight>

<process_flow>
  <step number="1">
    **Component Analysis**

    For each component:
    - Break into buildable units
    - Identify test requirements
    - Map dependencies
    - Assess complexity
  </step>

  <step number="2">
    **Task Creation**

    For each unit:
    - Create test task first (TDD)
    - Create implementation task
    - Define acceptance criteria
    - Embed context
  </step>

  <step number="3">
    **T-Shirt Sizing**

    Assign sizes:
    - XS: < 30 minutes
    - S: 30-60 minutes
    - M: 1-2 hours
    - L: 2-4 hours
    - XL: Must split!

    If XL detected:
    - Break into smaller tasks
    - Maintain logical cohesion
  </step>

  <step number="4">
    **Dependency Mapping**

    Identify:
    - Sequential dependencies
    - Parallel opportunities [P]
    - Blocking relationships
    - Resource conflicts
  </step>

  <step number="5">
    **Context Embedding**

    For each task include:
    - Link to specification
    - Link to design
    - Related patterns
    - Test requirements
    - Success criteria
  </step>

  <step number="6">
    **Critical Path Analysis**

    Determine:
    - Minimum path to MVP
    - Parallel execution opportunities
    - Risk points
    - Bottlenecks
  </step>

  <step number="7">
    **Generate Task File**

    Save to: .nexus/tasks/[feature]-tasks.md

    Format:
    ```yaml
    tasks:
      - id: T001
        title: Write auth service tests
        size: S
        type: test
        dependencies: []
        parallel: false
        context: Link to spec

      - id: T002
        title: Implement auth service
        size: M
        type: implementation
        dependencies: [T001]
        parallel: false
        context: Link to design
    ```
  </step>

  <step number="8">
    **Initialize Todo List**

    Use TodoWrite to create initial task list
    Set all tasks to PENDING state
  </step>
</process_flow>

<validation>
  - No task larger than L (4 hours)
  - All tasks have test pairs
  - Dependencies form valid DAG
  - Context embedded in all tasks
  - Critical path identified
</validation>
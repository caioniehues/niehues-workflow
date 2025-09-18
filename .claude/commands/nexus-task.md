---
name: nexus-task
description: Manage task states, view progress, and track work
tools: Read, Write, TodoWrite, Bash
implementation: .claude/commands/nexus-task.md
---

# /nexus-task [action] [task-id] [options]

Comprehensive task management and tracking.

<actions>
  <action name="list">
    List tasks with filtering:
    - By state: --state PENDING
    - By size: --size M
    - By parallel: --parallel
    - By feature: --feature auth
  </action>

  <action name="show">
    Display detailed task information:
    - Full context
    - State history
    - Dependencies graph
    - Time tracking
  </action>

  <action name="update">
    Update task state:
    - Validate transition
    - Log change reason
    - Update timestamps
    - Notify dependencies
  </action>

  <action name="start">
    Begin work on task:
    - Check dependencies met
    - Set state to appropriate phase
    - Start time tracking
    - Update todo list
  </action>

  <action name="complete">
    Mark task as done:
    - Verify acceptance criteria
    - Update actual time
    - Calculate variance
    - Unblock dependencies
  </action>

  <action name="block">
    Mark task as blocked:
    - Document blocking reason
    - Identify blocking task/resource
    - Set state to BLOCKED
    - Track block duration
  </action>

  <action name="split">
    Split XL task:
    - Create subtasks
    - Maintain relationships
    - Distribute estimates
    - Update original task
  </action>

  <action name="parallel">
    View parallel groups:
    - Show executable groups
    - Check resource conflicts
    - Display shared dependencies
    - Recommend execution order
  </action>

  <action name="critical">
    Show critical path:
    - Display task sequence
    - Calculate duration
    - Identify bottlenecks
    - Suggest optimizations
  </action>

  <action name="metrics">
    Display task metrics:
    - Completion rate
    - Velocity trends
    - Size accuracy
    - State distribution
  </action>
</actions>

<pre_flight>
  <check id="task_system_initialized">
    Verify .nexus/tasks/ directory exists
    Check for task file structure
    Load task state definitions
  </check>

  <check id="state_machine_loaded">
    Load valid state transitions
    Verify state consistency
    Check transition permissions
  </check>

  <check id="sizing_guidelines">
    Load T-shirt sizing definitions
    Check variance tracking data
    Review splitting thresholds
  </check>
</pre_flight>

<process_flow>
  <step number="1">
    **Parse Command Arguments**

    Extract:
    - Action type (list, show, update, etc.)
    - Target task ID (if applicable)
    - Filter options (state, size, feature)
    - Additional parameters
  </step>

  <step number="2">
    **Load Task Data**

    Read from .nexus/tasks/:
    - Task files for specified feature
    - State transition log
    - Current metrics
    - Active parallel groups
  </step>

  <step number="3">
    **Validate Request**

    Check:
    - Task exists (if specified)
    - State transition valid
    - Dependencies met
    - Required parameters present
  </step>

  <step number="4">
    **Execute Action**

    Perform requested operation:
    - State updates with validation
    - Time tracking updates
    - Dependency management
    - Metrics recalculation
  </step>

  <step number="5">
    **Update Files**

    Write changes to:
    - Task YAML files
    - State change log
    - Metrics files
    - Todo list sync
  </step>

  <step number="6">
    **Display Results**

    Show:
    - Updated task status
    - Impact on dependencies
    - Metrics changes
    - Next recommended actions
  </step>
</process_flow>

<state_management>
  **Transition Validation**:
  - Check current state
  - Validate target state
  - Require transition reason
  - Log all changes

  **Automatic Updates**:
  - Unblock dependencies when complete
  - Update metrics on changes
  - Recalculate critical path
  - Adjust estimates based on actuals

  **State Enforcement**:
  - TDD cycle compliance
  - Test-first requirements
  - Review gate enforcement
  - Quality checkpoints
</state_management>

<parallel_execution>
  **Identify Opportunities**:
  - Tasks with no dependencies
  - Tasks with met dependencies
  - Non-conflicting resource needs
  - Same parallel_group tasks

  **Display Format**:
  ```
  Parallel Group: auth
  [P] T001: Write auth tests (45m)
  [P] T003: Write user tests (30m)
  [P] T005: Write role tests (30m)
  Total if parallel: 45m
  Total if serial: 105m
  Time saved: 60m (57%)
  ```

  **Coordination**:
  - Check resource conflicts
  - Validate parallel marking
  - Suggest execution order
  - Track parallel completion
</parallel_execution>

<critical_path_analysis>
  **Path Calculation**:
  - Identify longest dependency chain
  - Calculate total duration
  - Account for task sizes
  - Include dependency delays

  **Bottleneck Detection**:
  - Single-dependency points
  - Resource constraints
  - Large task impacts
  - Blocking relationships

  **Optimization Suggestions**:
  - Split large tasks on critical path
  - Parallelize independent work
  - Address blocking dependencies
  - Resource reallocation
</critical_path_analysis>

<metrics_tracking>
  **Velocity Metrics**:
  - Tasks completed per day/week
  - Time estimation accuracy
  - State transition patterns
  - Completion rate trends

  **Size Distribution**:
  - Track actual vs estimated
  - Identify sizing patterns
  - Calibrate future estimates
  - Monitor XL splitting

  **Efficiency Metrics**:
  - Time in each state
  - Rework frequency
  - Blocking duration
  - Parallel execution gains
</metrics_tracking>

<integration_points>
  **TodoWrite Integration**:
  - Sync task states
  - Update active work list
  - Track progress
  - Maintain consistency

  **Pattern Detection**:
  - Identify recurring patterns
  - Extract task templates
  - Track workflow efficiency
  - Suggest improvements

  **Evolution System**:
  - Feed metrics to evolution
  - Track workflow patterns
  - Identify optimization opportunities
  - Contribute to methodology improvement
</integration_points>

<file_operations>
  **Task Files** (.nexus/tasks/):
  - feature-name-tasks.yaml
  - state-log.yaml
  - metrics.yaml
  - parallel-groups.yaml

  **Update Protocols**:
  - Atomic writes
  - Backup before changes
  - Validate YAML structure
  - Maintain file consistency

  **Archive Management**:
  - Move completed tasks
  - Preserve history
  - Clean old logs
  - Maintain performance
</file_operations>

<error_handling>
  **Validation Errors**:
  - Invalid state transitions
  - Missing dependencies
  - Malformed task files
  - Conflicting updates

  **Recovery Procedures**:
  - Rollback invalid changes
  - Restore from backups
  - Repair corrupted files
  - Maintain data integrity

  **User Guidance**:
  - Clear error messages
  - Suggested corrections
  - Valid options display
  - Help references
</error_handling>

<outputs>
  - Task status updates
  - Progress visualizations
  - Metrics dashboards
  - Critical path analysis
  - Parallel execution plans
  - Dependency graphs
  - Performance insights
</outputs>
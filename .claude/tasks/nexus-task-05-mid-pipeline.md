<?xml version="1.0" encoding="UTF-8"?>
<task id="5" name="Mid Pipeline Phases" parallel_group="pipeline">
  <metadata>
    <title>Mid Pipeline Phases - DESIGN and DECOMPOSE</title>
    <description>Create command specifications for architecture design and task decomposition</description>
    <assigned_to>architecture-specialist</assigned_to>
    <priority>critical</priority>
    <t_shirt_size>L</t_shirt_size>
    <estimated_hours>3.5</estimated_hours>
    <context_source>docs/specs/nexus-enhanced-specification-v5.md#design-and-decompose</context_source>
  </metadata>

  <requirements>
    <requirement id="MP-001" priority="critical">
      Implement /nexus-design command with security analysis
    </requirement>
    <requirement id="MP-002" priority="critical">
      Implement /nexus-decompose command with task sizing
    </requirement>
    <requirement id="MP-003" priority="high">
      Create architecture agent specification
    </requirement>
    <requirement id="MP-004" priority="high">
      Design templates for architecture and tasks
    </requirement>
  </requirements>

  <deliverables>

    <!-- 1. Design Command Specification -->
    <deliverable id="MPD-001" type="command">
      <path>.claude/commands/nexus-design.md</path>
      <description>Architecture design command with security focus</description>
      <content_structure>
---
name: nexus-design
description: Create comprehensive architectural design with security-first approach
tools: Read, Write, Task, Glob, TodoWrite
implementation: .claude/commands/nexus-design.md
---

# /nexus-design [feature]

Transform specifications into secure architectural designs.

&lt;pre_flight&gt;
  &lt;check id="specification_exists"&gt;
    Load specification from .nexus/specs/
    Extract functional requirements
    Identify non-functional requirements
  &lt;/check&gt;

  &lt;check id="existing_architecture"&gt;
    Review existing design patterns
    Identify integration points
    Check technology constraints
  &lt;/check&gt;

  &lt;check id="security_requirements"&gt;
    Load security guidelines
    Identify compliance needs
    Check threat models
  &lt;/check&gt;
&lt;/pre_flight&gt;

&lt;process_flow&gt;
  &lt;step number="1" subagent="architecture-agent"&gt;
    **System Architecture Design**

    Define:
    - Component structure
    - Layer boundaries
    - Service interfaces
    - Data flow patterns
    - Integration architecture
    - Technology stack
  &lt;/step&gt;

  &lt;step number="2" subagent="security-guardian"&gt;
    **Security Threat Modeling**

    Analyze:
    - Attack surfaces
    - Threat vectors
    - Trust boundaries
    - Authentication flows
    - Authorization models
    - Data protection strategies
    - Audit requirements
  &lt;/step&gt;

  &lt;step number="3" subagent="pattern-detector"&gt;
    **Pattern Application**

    Apply from .nexus/patterns/:
    - Architectural patterns
    - Design patterns
    - Security patterns
    - Integration patterns
    - Performance patterns
  &lt;/step&gt;

  &lt;step number="4"&gt;
    **Component Specification**

    For each component:
    - Responsibility definition
    - Interface design
    - Dependencies
    - Configuration needs
    - Deployment requirements
  &lt;/step&gt;

  &lt;step number="5"&gt;
    **Performance Design**

    Consider:
    - Scalability strategy
    - Caching approach
    - Database design
    - Async processing
    - Resource optimization
  &lt;/step&gt;

  &lt;step number="6"&gt;
    **Document Architecture**

    Save to: .nexus/design/[feature]/
    - architecture.md
    - security-analysis.md
    - component-specs.md
    - integration-design.md
  &lt;/step&gt;

  &lt;step number="7"&gt;
    **Update Decision Log**

    Record:
    - Technology choices
    - Pattern selections
    - Security decisions
    - Trade-offs made
  &lt;/step&gt;
&lt;/process_flow&gt;

&lt;outputs&gt;
  - Architecture diagrams
  - Component specifications
  - Security threat model
  - Integration design
  - Performance strategy
  - Technology rationale
&lt;/outputs&gt;
      </content_structure>
    </deliverable>

    <!-- 2. Decompose Command Specification -->
    <deliverable id="MPD-002" type="command">
      <path>.claude/commands/nexus-decompose.md</path>
      <description>Task decomposition with T-shirt sizing and dependencies</description>
      <content_structure>
---
name: nexus-decompose
description: Break down specifications into sized, trackable tasks
tools: Read, Write, TodoWrite, Task
implementation: .claude/commands/nexus-decompose.md
---

# /nexus-decompose [feature]

Transform designs into executable, sized tasks with dependencies.

&lt;pre_flight&gt;
  &lt;check id="design_exists"&gt;
    Load architecture from .nexus/design/
    Identify components to build
  &lt;/check&gt;

  &lt;check id="specification_exists"&gt;
    Load requirements
    Extract test criteria
  &lt;/check&gt;
&lt;/pre_flight&gt;

&lt;process_flow&gt;
  &lt;step number="1"&gt;
    **Component Analysis**

    For each component:
    - Break into buildable units
    - Identify test requirements
    - Map dependencies
    - Assess complexity
  &lt;/step&gt;

  &lt;step number="2"&gt;
    **Task Creation**

    For each unit:
    - Create test task first (TDD)
    - Create implementation task
    - Define acceptance criteria
    - Embed context
  &lt;/step&gt;

  &lt;step number="3"&gt;
    **T-Shirt Sizing**

    Assign sizes:
    - XS: &lt; 30 minutes
    - S: 30-60 minutes
    - M: 1-2 hours
    - L: 2-4 hours
    - XL: Must split!

    If XL detected:
    - Break into smaller tasks
    - Maintain logical cohesion
  &lt;/step&gt;

  &lt;step number="4"&gt;
    **Dependency Mapping**

    Identify:
    - Sequential dependencies
    - Parallel opportunities [P]
    - Blocking relationships
    - Resource conflicts
  &lt;/step&gt;

  &lt;step number="5"&gt;
    **Context Embedding**

    For each task include:
    - Link to specification
    - Link to design
    - Related patterns
    - Test requirements
    - Success criteria
  &lt;/step&gt;

  &lt;step number="6"&gt;
    **Critical Path Analysis**

    Determine:
    - Minimum path to MVP
    - Parallel execution opportunities
    - Risk points
    - Bottlenecks
  &lt;/step&gt;

  &lt;step number="7"&gt;
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
  &lt;/step&gt;

  &lt;step number="8"&gt;
    **Initialize Todo List**

    Use TodoWrite to create initial task list
    Set all tasks to PENDING state
  &lt;/step&gt;
&lt;/process_flow&gt;

&lt;validation&gt;
  - No task larger than L (4 hours)
  - All tasks have test pairs
  - Dependencies form valid DAG
  - Context embedded in all tasks
  - Critical path identified
&lt;/validation&gt;
      </content_structure>
    </deliverable>

    <!-- 3. Architecture Agent Specification -->
    <deliverable id="MPD-003" type="agent">
      <path>.claude/agents/architecture-agent.md</path>
      <description>System architecture design agent</description>
      <content_structure>
---
name: architecture-agent
description: Design system architectures with patterns and best practices
tools: Read, Write, Glob
triggers: DESIGN phase, architecture decisions needed
---

# Architecture Agent

## Purpose
Create comprehensive system architectures that balance technical excellence with practical constraints.

## Capabilities

### Component Design
- Define clear boundaries
- Specify interfaces
- Map relationships
- Identify responsibilities
- Design for testability

### Pattern Application
- Recognize applicable patterns
- Apply architectural styles
- Use design patterns appropriately
- Avoid over-engineering
- Document pattern usage

### Technology Selection
- Evaluate technology options
- Consider team expertise
- Assess maintenance burden
- Review community support
- Check security posture

### Integration Design
- Define integration points
- Specify protocols
- Design error handling
- Plan retry strategies
- Document data contracts

## Design Process

### 1. Requirements Analysis
- Review functional requirements
- Understand quality attributes
- Identify constraints
- Recognize risks

### 2. High-Level Design
- Create component overview
- Define layers
- Map data flow
- Identify boundaries

### 3. Detailed Design
- Specify interfaces
- Define data models
- Design interactions
- Plan error handling

### 4. Security Integration
- Apply security patterns
- Define trust boundaries
- Design authentication
- Plan authorization

### 5. Documentation
- Create architecture diagrams
- Write design rationale
- Document decisions
- Explain trade-offs

## Output Format
Saves to: .nexus/design/[feature]/
- architecture.md
- diagrams/
- decisions.md
- rationale.md

## Evolution Focus
- Track design patterns used
- Identify successful architectures
- Learn from failures
- Improve pattern library
      </content_structure>
    </deliverable>

    <!-- 4. Design Document Template -->
    <deliverable id="MPD-004" type="template">
      <path>templates/architecture-design.md</path>
      <description>Architecture documentation template</description>
      <content_structure>
# Architecture Design: {{feature_name}}
Version: {{version}}
Date: {{timestamp}}
Author: {{author}}
Status: {{status}}

## Executive Summary
{{summary}}

## Architecture Overview

### System Context
```
{{context_diagram}}
```

### Component Architecture
```
{{component_diagram}}
```

## Component Specifications

{{#each components}}
### {{component_name}}

**Purpose**: {{purpose}}
**Responsibility**: {{responsibility}}

**Interfaces**:
{{#each interfaces}}
- {{interface_name}}: {{interface_description}}
{{/each}}

**Dependencies**:
{{#each dependencies}}
- {{dependency}}: {{reason}}
{{/each}}

**Configuration**:
{{#each config_items}}
- {{config_key}}: {{config_description}}
{{/each}}
{{/each}}

## Data Architecture

### Data Flow
```
{{data_flow_diagram}}
```

### Data Models
{{#each data_models}}
#### {{model_name}}
- Purpose: {{purpose}}
- Storage: {{storage_type}}
- Access Pattern: {{access_pattern}}
{{/each}}

## Security Architecture

### Threat Model
{{#each threats}}
- **Threat**: {{threat_description}}
  **Mitigation**: {{mitigation}}
{{/each}}

### Security Boundaries
```
{{security_boundary_diagram}}
```

### Authentication Flow
{{auth_flow_description}}

### Authorization Model
{{authz_model_description}}

## Integration Architecture

{{#each integrations}}
### {{integration_name}}
- Protocol: {{protocol}}
- Format: {{data_format}}
- Error Handling: {{error_strategy}}
- Retry Policy: {{retry_policy}}
{{/each}}

## Performance Design

### Scalability Strategy
{{scalability_approach}}

### Caching Strategy
{{#each cache_layers}}
- {{layer}}: {{strategy}}
{{/each}}

### Resource Limits
{{#each resource_limits}}
- {{resource}}: {{limit}}
{{/each}}

## Technology Stack

{{#each technologies}}
### {{category}}
- **Choice**: {{technology}}
- **Rationale**: {{reason}}
- **Alternatives Considered**: {{alternatives}}
{{/each}}

## Deployment Architecture

### Deployment Diagram
```
{{deployment_diagram}}
```

### Environment Configuration
{{#each environments}}
#### {{environment}}
{{configuration}}
{{/each}}

## Design Patterns Applied

{{#each patterns}}
- **Pattern**: {{pattern_name}}
  **Usage**: {{where_used}}
  **Rationale**: {{why_chosen}}
{{/each}}

## Design Decisions

{{#each decisions}}
### {{decision_title}}
- **Context**: {{context}}
- **Decision**: {{decision}}
- **Consequences**: {{consequences}}
- **Alternatives**: {{alternatives}}
{{/each}}

## Risks and Mitigations

{{#each risks}}
- **Risk**: {{description}}
  **Impact**: {{impact}}
  **Probability**: {{probability}}
  **Mitigation**: {{mitigation_strategy}}
{{/each}}

## Approval
- [ ] Technical Lead
- [ ] Security Review
- [ ] Architecture Board
- [ ] Product Owner
      </content_structure>
    </deliverable>

    <!-- 5. Task Breakdown Template -->
    <deliverable id="MPD-005" type="template">
      <path>templates/task-breakdown.yaml</path>
      <description>Task decomposition template with sizing</description>
      <content_structure>
# Task Breakdown: {{feature_name}}
# Generated: {{timestamp}}
# Total Tasks: {{total_tasks}}
# Critical Path: {{critical_path_duration}}

metadata:
  feature: {{feature_name}}
  epic: {{epic_id}}
  sprint: {{sprint_number}}
  estimated_total: {{total_hours}}

sizing_guide:
  XS: "&lt; 30 minutes"
  S: "30-60 minutes"
  M: "1-2 hours"
  L: "2-4 hours"
  XL: "MUST SPLIT - Too large"

tasks:
{{#each tasks}}
  - id: {{task_id}}
    title: {{task_title}}
    description: {{task_description}}
    size: {{size}}
    estimated_minutes: {{estimated_minutes}}
    type: {{task_type}}
    state: PENDING

    dependencies:
    {{#each dependencies}}
      - {{dependency_id}}
    {{/each}}

    parallel: {{can_parallelize}}

    context:
      specification: {{spec_link}}
      design: {{design_link}}
      patterns: {{pattern_references}}

    test_requirements:
    {{#each test_requirements}}
      - {{requirement}}
    {{/each}}

    acceptance_criteria:
    {{#each acceptance_criteria}}
      - {{criterion}}
    {{/each}}

    resources_needed:
    {{#each resources}}
      - {{resource}}
    {{/each}}
{{/each}}

critical_path:
{{#each critical_tasks}}
  - {{task_id}}: {{task_title}}
{{/each}}

parallel_opportunities:
{{#each parallel_groups}}
  group_{{@index}}:
  {{#each tasks}}
    - {{task_id}}
  {{/each}}
{{/each}}

risk_points:
{{#each risks}}
  - task: {{task_id}}
    risk: {{risk_description}}
    mitigation: {{mitigation}}
{{/each}}

summary:
  total_xs: {{count_xs}}
  total_s: {{count_s}}
  total_m: {{count_m}}
  total_l: {{count_l}}
  total_xl: {{count_xl}}
  parallel_percentage: {{parallel_percentage}}%
  critical_path_hours: {{critical_hours}}
  total_estimated_hours: {{total_hours}}
      </content_structure>
    </deliverable>

  </deliverables>

  <success_criteria>
    - Design command includes security analysis
    - Decompose command enforces T-shirt sizing
    - All tasks include test requirements
    - Dependencies properly mapped
    - Parallel opportunities identified
    - Architecture templates comprehensive
    - Task templates include context
    - Critical path analysis included
  </success_criteria>

  <dependencies>
    - Early pipeline phases (Task 4)
    - Agent specifications (Task 2)
    - Template system (Task 3)
    - Core commands (Task 1)
  </dependencies>

  <notes>
    This is METHODOLOGY documentation:
    - NO TypeScript code
    - NO compiled software
    - Only markdown specifications and templates
    - Focus on architecture and planning process
    - All execution through Claude commands
  </notes>

</task>
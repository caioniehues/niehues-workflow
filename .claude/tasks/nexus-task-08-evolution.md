<?xml version="1.0" encoding="UTF-8"?>
<task id="8" name="Evolution System" parallel_group="foundation">
  <metadata>
    <title>Nexus Evolution System Implementation</title>
    <description>Create three-layer evolution system for continuous workflow improvement</description>
    <assigned_to>evolution-specialist</assigned_to>
    <priority>high</priority>
    <t_shirt_size>L</t_shirt_size>
    <estimated_hours>3.5</estimated_hours>
    <context_source>docs/specs/nexus-enhanced-specification-v5.md#evolution-system</context_source>
  </metadata>

  <requirements>
    <requirement id="ER-001" priority="critical">
      Implement three-layer evolution architecture:
      - Continuous Evolution (always running)
      - Micro Evolution (after each phase)
      - Formal Evolution (after pipeline)
    </requirement>
    <requirement id="ER-002" priority="high">
      Create pattern extraction system
    </requirement>
    <requirement id="ER-003" priority="high">
      Build evolution triggers and thresholds
    </requirement>
    <requirement id="ER-004" priority="medium">
      Design reflection documentation format
    </requirement>
  </requirements>

  <deliverables>

    <!-- 1. Evolution Command Files -->
    <deliverable id="ED-001" type="command">
      <path>.claude/commands/nexus-evolve.md</path>
      <description>Main evolution command for formal reflection</description>
      <content_structure>
---
name: nexus-evolve
description: Perform formal workflow reflection and evolution
tools: Read, Write, Glob, Task
implementation: .claude/commands/nexus-evolve.md
---

# /nexus-evolve

Perform comprehensive workflow analysis and evolution after pipeline completion.

&lt;pre_flight&gt;
  - Check for completed pipeline execution
  - Gather all phase outputs
  - Collect metrics and patterns
&lt;/pre_flight&gt;

&lt;process_flow&gt;
  &lt;step number="1" subagent="workflow-reflector"&gt;
    Analyze complete pipeline:
    - Execution time metrics
    - Decision points
    - Bottlenecks
    - Success/failure patterns
  &lt;/step&gt;

  &lt;step number="2"&gt;
    Consolidate micro-evolutions:
    - Merge phase learnings
    - Identify systemic patterns
    - Aggregate metrics
  &lt;/step&gt;

  &lt;step number="3" subagent="pattern-detector"&gt;
    Extract patterns:
    - Code patterns (3+ repetitions)
    - Process patterns
    - Question patterns (5+ asks)
  &lt;/step&gt;

  &lt;step number="4"&gt;
    Generate improvements:
    - New agent proposals
    - Guideline updates
    - Process optimizations
    - Template refinements
  &lt;/step&gt;

  &lt;step number="5"&gt;
    Document evolution:
    - Save to .nexus/evolution/[timestamp]-reflection.md
    - Update pattern library
    - Record metrics
  &lt;/step&gt;
&lt;/process_flow&gt;

&lt;outputs&gt;
  - Evolution report
  - Pattern library updates
  - Guideline amendments
  - Agent proposals
  - Metric dashboards
&lt;/outputs&gt;
      </content_structure>
    </deliverable>

    <deliverable id="ED-002" type="command">
      <path>.claude/commands/nexus-micro-evolve.md</path>
      <description>Micro-evolution command for phase-level learning</description>
      <content_structure>
---
name: nexus-micro-evolve
description: Capture learnings after phase completion
tools: Read, Write, TodoWrite
implementation: .claude/commands/nexus-micro-evolve.md
---

# /nexus-micro-evolve [phase]

Quick learning capture after each phase.

&lt;process_flow&gt;
  &lt;step number="1"&gt;
    Capture immediate learnings:
    - What worked well?
    - What was challenging?
    - What patterns emerged?
  &lt;/step&gt;

  &lt;step number="2"&gt;
    Quick optimizations:
    - Template adjustments
    - Question additions
    - Process tweaks
  &lt;/step&gt;

  &lt;step number="3"&gt;
    Save micro-evolution:
    .nexus/evolution/micro/[phase]-[timestamp].md
  &lt;/step&gt;
&lt;/process_flow&gt;
      </content_structure>
    </deliverable>

    <!-- 2. Evolution Tracking Files -->
    <deliverable id="ED-003" type="tracking">
      <path>.nexus/evolution/triggers.yaml</path>
      <description>Evolution trigger definitions</description>
      <content_structure>
# Evolution Triggers Configuration
# Generated: [timestamp]

triggers:
  pattern_repetition:
    condition: "Code structure repeated >= 3 times"
    action: "Extract pattern and create template"
    priority: high

  question_frequency:
    condition: "Same question asked >= 5 times"
    action: "Add to question template"
    priority: medium

  task_failure:
    condition: "Similar tasks fail >= 2 times"
    action: "Analyze and update process"
    priority: critical

  security_vulnerability:
    condition: "Security issue detected"
    action: "Immediate prevention rule"
    priority: critical

  performance_issue:
    condition: "Task exceeds estimate by 2x"
    action: "Review estimation process"
    priority: medium

  guideline_violation:
    condition: "Guideline violated >= 3 times"
    action: "Review and clarify guideline"
    priority: high
      </content_structure>
    </deliverable>

    <deliverable id="ED-004" type="template">
      <path>templates/evolution-report.md</path>
      <description>Template for evolution reports</description>
      <content_structure>
# Evolution Report
Date: {{timestamp}}
Pipeline: {{pipeline_id}}
Duration: {{duration}}

## Executive Summary
{{summary}}

## Metrics

### Performance
- Pipeline duration: {{total_time}}
- Parallel efficiency: {{parallel_percentage}}%
- Bottlenecks identified: {{bottleneck_count}}

### Quality
- Tests passed: {{test_pass_rate}}%
- Guidelines followed: {{guideline_compliance}}%
- Security issues: {{security_issue_count}}

### Learning
- Patterns extracted: {{pattern_count}}
- Questions captured: {{question_count}}
- Process improvements: {{improvement_count}}

## Patterns Extracted

{{#each patterns}}
### {{name}}
- Category: {{category}}
- Frequency: {{count}}
- Confidence: {{confidence}}
- Template created: {{template_path}}
{{/each}}

## Process Improvements

{{#each improvements}}
### {{title}}
- Type: {{type}}
- Impact: {{impact}}
- Implementation: {{details}}
{{/each}}

## Agent Performance

{{#each agents}}
### {{agent_name}}
- Invocations: {{count}}
- Average time: {{avg_time}}
- Success rate: {{success_rate}}%
- Patterns detected: {{patterns}}
{{/each}}

## Guideline Updates

{{#each guideline_updates}}
- {{description}}
- Rationale: {{reason}}
- File: {{file_path}}
{{/each}}

## New Agent Proposals

{{#each agent_proposals}}
### {{agent_name}}
- Purpose: {{purpose}}
- Trigger: {{trigger}}
- Justification: {{justification}}
{{/each}}

## Next Steps
{{next_steps}}
      </content_structure>
    </deliverable>

    <!-- 3. Pattern Library System -->
    <deliverable id="ED-005" type="directory">
      <path>.nexus/patterns/</path>
      <description>Pattern library structure</description>
      <content_structure>
.nexus/patterns/
├── README.md           # Pattern library guide
├── index.yaml          # Pattern registry
├── code/              # Code patterns
│   ├── error-handling.md
│   ├── validation.md
│   └── data-access.md
├── architecture/      # Architectural patterns
│   ├── component-structure.md
│   └── service-layer.md
├── process/          # Process patterns
│   ├── tdd-cycle.md
│   └── code-review.md
├── security/         # Security patterns
│   ├── input-validation.md
│   └── authentication.md
└── testing/          # Test patterns
    ├── mock-strategies.md
    └── test-data.md
      </content_structure>
    </deliverable>

    <deliverable id="ED-006" type="template">
      <path>templates/pattern.md</path>
      <description>Pattern documentation template</description>
      <content_structure>
# Pattern: {{pattern_name}}
Category: {{category}}
Created: {{created_date}}
Usage Count: {{usage_count}}
Confidence: {{confidence}}

## Purpose
{{purpose}}

## Context
When to use this pattern:
{{context}}

## Structure
```{{language}}
{{pattern_code}}
```

## Variables
{{#each variables}}
- {{name}}: {{description}}
{{/each}}

## Examples
{{#each examples}}
### Example {{@index}}
- File: {{file}}:{{line}}
- Context: {{context}}
{{/each}}

## Variations
{{#each variations}}
### {{name}}
- When: {{when}}
- How: {{how}}
{{/each}}

## Security Considerations
{{security_notes}}

## Performance Notes
{{performance_notes}}

## Evolution History
{{#each history}}
- {{version}}: {{changes}}
{{/each}}
      </content_structure>
    </deliverable>

    <!-- 4. Workflow Reflector Agent -->
    <deliverable id="ED-007" type="agent">
      <path>.claude/agents/workflow-reflector.md</path>
      <description>Workflow reflection agent specification</description>
      <content_structure>
---
name: workflow-reflector
description: Comprehensive workflow analysis and improvement agent
tools: Read, Write, Glob, TodoWrite
triggers: EVOLVE phase, pipeline completion
---

# Workflow Reflector Agent

## Capability
Analyzes complete workflow execution, consolidates learnings, and proposes systematic improvements.

## Process

### 1. Metric Collection
- Gather timing data from all phases
- Collect decision points and rationales
- Identify bottlenecks and delays
- Measure parallel execution efficiency

### 2. Pattern Analysis
- Search for repeated code structures
- Identify common question patterns
- Find recurring decision types
- Detect systematic issues

### 3. Learning Consolidation
- Merge micro-evolution learnings
- Aggregate pattern frequencies
- Compile improvement suggestions
- Synthesize agent feedback

### 4. Improvement Generation
- Propose new agents for repeated tasks
- Suggest guideline clarifications
- Recommend process optimizations
- Design new templates

### 5. Documentation
- Generate comprehensive evolution report
- Update pattern library
- Record metrics
- Create action items

## Inputs
- Phase outputs from .nexus/[phases]/
- Micro-evolution logs
- Pattern detection results
- Metric measurements
- Decision log

## Outputs
- Evolution report (.nexus/evolution/[timestamp]-reflection.md)
- Pattern library updates
- Guideline amendments
- Agent proposals
- Metric dashboards

## Evolution Focus
- Track own performance metrics
- Identify reflection patterns
- Optimize analysis processes
- Improve recommendation quality

## Invocation
Task tool with subagent_type="workflow-reflector"
      </content_structure>
    </deliverable>

    <!-- 5. Continuous Evolution System -->
    <deliverable id="ED-008" type="documentation">
      <path>.nexus/evolution/continuous-evolution.md</path>
      <description>Continuous evolution implementation guide</description>
      <content_structure>
# Continuous Evolution System

## Overview
The continuous evolution layer runs throughout workflow execution, detecting patterns and triggering improvements in real-time.

## Pattern Detection

### Code Patterns
Monitor for code structures repeated 3+ times:
- Function signatures
- Error handling blocks
- Data validation logic
- API call patterns

### Question Patterns
Track questions asked 5+ times:
- Requirements clarifications
- Technical decisions
- Edge case handling
- Security considerations

### Process Patterns
Identify workflow patterns:
- Task sequences
- Phase transitions
- Decision points
- Bottlenecks

## Trigger System

### Immediate Triggers
- Security vulnerability detected → Immediate prevention rule
- Critical failure → Process halt and analysis
- Guideline violation → Clarification request

### Threshold Triggers
- Pattern count >= 3 → Extract to template
- Question count >= 5 → Add to questionnaire
- Failure count >= 2 → Process review
- Time overrun >= 2x → Estimation review

## Real-time Tracking

### Metrics Collection
- Phase durations
- Task completion times
- Parallel execution rates
- Error frequencies
- Pattern occurrences

### Storage
All continuous evolution data stored in:
.nexus/evolution/continuous/[date]/
├── patterns.log
├── questions.log
├── metrics.json
└── triggers.yaml

## Integration Points

### With Commands
- Commands report patterns via evolution hooks
- Real-time metric updates
- Pattern extraction calls

### With Agents
- Agents report detected patterns
- Question frequency tracking
- Performance metrics

### With Guidelines
- Guideline compliance monitoring
- Violation tracking
- Clarification needs
      </content_structure>
    </deliverable>

    <!-- 6. Metric Collection System -->
    <deliverable id="ED-009" type="documentation">
      <path>.nexus/evolution/metrics.md</path>
      <description>Metric collection and tracking guide</description>
      <content_structure>
# Evolution Metrics Guide

## Metrics Categories

### Performance Metrics
- Pipeline duration
- Phase execution times
- Task completion rates
- Parallel execution efficiency
- Bottleneck identification

### Quality Metrics
- Test pass rates
- Guideline compliance
- Security scan results
- Documentation completeness
- Pattern quality scores

### Learning Metrics
- Patterns extracted per pipeline
- Questions captured per phase
- Improvements implemented
- Agent proposal acceptance rate
- Evolution effectiveness

## Collection Methods

### Automatic Collection
Via command execution:
- Timestamp all operations
- Log decision points
- Track state transitions
- Record error occurrences

### Agent Reporting
Via specialized agents:
- Pattern detection counts
- Question frequencies
- Security findings
- Performance bottlenecks

### Manual Capture
Via user input:
- Satisfaction ratings
- Improvement suggestions
- Pain points
- Success stories

## Storage Format

### Metric Files
.nexus/evolution/metrics/
├── [date]-performance.json
├── [date]-quality.json
├── [date]-learning.json
└── [date]-summary.yaml

### JSON Structure
```json
{
  "timestamp": "ISO-8601",
  "pipeline_id": "unique-id",
  "phase": "phase-name",
  "metrics": {
    "duration": "seconds",
    "success": true/false,
    "patterns_detected": count,
    "questions_asked": count,
    "guidelines_followed": percentage
  }
}
```

## Metric Dashboards

### Performance Dashboard
- Average pipeline duration trend
- Phase duration comparison
- Parallel execution rates
- Bottleneck frequency

### Quality Dashboard
- Test coverage trends
- Guideline compliance rates
- Security issue trends
- Documentation scores

### Learning Dashboard
- Pattern extraction rate
- Question pattern evolution
- Improvement implementation rate
- Agent effectiveness scores
      </content_structure>
    </deliverable>

  </deliverables>

  <success_criteria>
    - Three-layer evolution system fully documented
    - Pattern extraction threshold system in place
    - Evolution trigger mechanisms defined
    - Reflection documentation templates created
    - Metric collection system operational
    - Workflow reflector agent specified
    - Continuous evolution tracking active
    - Pattern library structure established
  </success_criteria>

  <dependencies>
    - Task 1: Core Commands (for evolution commands)
    - Task 2: Agent Specifications (for workflow-reflector)
    - Task 3: Templates (for evolution templates)
  </dependencies>

  <notes>
    This is a METHODOLOGY implementation:
    - NO TypeScript code
    - NO compiled software
    - NO test files
    - Only markdown documentation, templates, and Claude commands
    - Evolution happens through pattern extraction and documentation
    - All tracking is file-based in .nexus/ directories
  </notes>

</task>
---
name: nexus-evolve
description: Perform formal workflow reflection and evolution
tools: Read, Write, Glob, Task
implementation: .claude/commands/nexus-evolve.md
---

# /nexus-evolve

Perform comprehensive workflow analysis and evolution after pipeline completion.

<pre_flight>
  - Check for completed pipeline execution
  - Gather all phase outputs
  - Collect metrics and patterns
</pre_flight>

<process_flow>
  <step number="1" subagent="workflow-reflector">
    Analyze complete pipeline:
    - Execution time metrics
    - Decision points
    - Bottlenecks
    - Success/failure patterns
  </step>

  <step number="2">
    Consolidate micro-evolutions:
    - Merge phase learnings
    - Identify systemic patterns
    - Aggregate metrics
  </step>

  <step number="3" subagent="pattern-detector">
    Extract patterns:
    - Code patterns (3+ repetitions)
    - Process patterns
    - Question patterns (5+ asks)
  </step>

  <step number="4">
    Generate improvements:
    - New agent proposals
    - Guideline updates
    - Process optimizations
    - Template refinements
  </step>

  <step number="5">
    Document evolution:
    - Save to .nexus/evolution/[timestamp]-reflection.md
    - Update pattern library
    - Record metrics
  </step>
</process_flow>

<outputs>
  - Evolution report
  - Pattern library updates
  - Guideline amendments
  - Agent proposals
  - Metric dashboards
</outputs>
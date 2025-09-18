---
name: nexus-micro-evolve
description: Perform lightweight evolution after phase completion
tools: Read, Write, Glob, Task
implementation: .claude/commands/nexus-micro-evolve.md
---

# /nexus-micro-evolve [phase]

Perform incremental learning and adaptation after each phase completion.

<pre_flight>
  - Verify phase completion
  - Check for new patterns
  - Load current guidelines
  - Gather phase metrics
</pre_flight>

<process_flow>
  <step number="1" subagent="pattern-detector">
    **Pattern Detection**

    Scan recent work for patterns:
    - Code patterns (2+ repetitions)
    - Process patterns
    - Question patterns (3+ asks)
    - Error patterns
    - Success patterns
  </step>

  <step number="2">
    **Micro-Learning Extraction**

    Identify phase learnings:
    - What worked well
    - What slowed progress
    - Unexpected challenges
    - Effective solutions
    - Time estimation accuracy
  </step>

  <step number="3">
    **Guideline Updates**

    Make incremental updates:
    - Add new patterns to library
    - Update time estimates
    - Refine process steps
    - Document exceptions
    - Improve templates
  </step>

  <step number="4">
    **Metrics Collection**

    Track phase metrics:
    - Phase duration
    - Task completion rate
    - Pattern extraction count
    - Question frequency
    - Rework instances
  </step>

  <step number="5">
    **Quick Wins Implementation**

    Apply immediate improvements:
    - Template updates
    - Process shortcuts
    - Common question answers
    - Tool optimizations
  </step>

  <step number="6">
    **Evolution Log Update**

    Document micro-evolution:
    - Save to .nexus/evolution/micro/[timestamp]-[phase].md
    - Update pattern library
    - Record metrics
    - Note process changes
  </step>
</process_flow>

<evolution_triggers>
  **Automatic Triggers**:
  - Phase completion
  - Pattern threshold reached (2+ for micro)
  - Time estimation variance >50%
  - Recurring questions (3+ times)

  **Manual Triggers**:
  - User requests optimization
  - Process friction detected
  - New tool integration
  - Workflow adaptation needed
</evolution_triggers>

<micro_evolution_scope>
  **Focus Areas**:
  - Template improvements
  - Process refinements
  - Question bank updates
  - Time estimate calibration
  - Tool usage optimization

  **Excluded from Micro**:
  - Major process changes
  - Agent role modifications
  - Architectural decisions
  - Methodology restructuring
</micro_evolution_scope>

<pattern_thresholds>
  **Micro-Evolution Thresholds**:
  - Code pattern: 2+ repetitions
  - Process pattern: 2+ occurrences
  - Question: 3+ identical asks
  - Error: 2+ same failure
  - Time variance: >50% estimation error

  **Escalation to Formal**:
  - Pattern reaches 5+ repetitions
  - Process fails 3+ times
  - Major time variance pattern
  - Security pattern detected
</pattern_thresholds>

<lightweight_approach>
  **Design Principles**:
  - Quick execution (5-15 minutes)
  - Minimal disruption
  - Incremental changes only
  - Defer complex changes to formal evolution
  - Focus on immediate improvements

  **Output Format**:
  - Concise markdown reports
  - Pattern library updates
  - Quick metrics dashboard
  - Actionable recommendations
</lightweight_approach>

<integration_points>
  **Phase Integration**:
  - BRAINSTORM → Improve question templates
  - SPECIFY → Refine specification patterns
  - DESIGN → Update architecture templates
  - DECOMPOSE → Calibrate sizing estimates
  - IMPLEMENT → Extract code patterns
  - VALIDATE → Optimize quality gates
  - MAINTAIN → Improve maintenance patterns

  **Tool Integration**:
  - TodoWrite for pattern tasks
  - Pattern library updates
  - Template file modifications
  - Metrics file updates
</integration_points>

<outputs>
  - Micro-evolution report
  - Updated pattern library
  - Refined templates
  - Calibrated time estimates
  - Process improvements
  - Quick wins implemented
</outputs>
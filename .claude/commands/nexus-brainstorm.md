---
name: nexus-brainstorm
description: Generate multiple solution approaches through unlimited questioning
tools: Read, Write, Task, TodoWrite
implementation: .claude/commands/nexus-brainstorm.md
---

# /nexus-brainstorm [topic]

Explore solution approaches through comprehensive questioning and pattern analysis.

<pre_flight>
  <check id="nexus_initialized">
    Verify .nexus directory exists
    If not: Suggest running /nexus-init first
  </check>

  <check id="topic_provided">
    Ensure topic/feature description provided
    If vague: Begin clarification questions
  </check>

  <check id="pattern_library">
    Check .nexus/patterns/ for existing patterns
    Load relevant patterns for context
  </check>
</pre_flight>

<process_flow>
  <step number="1" subagent="questioning-agent">
    **Unlimited Questioning Phase**

    Continue asking until complete understanding:
    - What problem are we solving?
    - Who are the users/stakeholders?
    - What are the success criteria?
    - What constraints exist?
    - What are the edge cases?
    - What security concerns exist?
    - What performance requirements?
    - What integration points?

    NO LIMIT on questions - continue until clarity
  </step>

  <step number="2" subagent="pattern-detector">
    **Pattern Search**

    Search .nexus/patterns/ for:
    - Similar problems solved before
    - Reusable architectural patterns
    - Common implementation patterns
    - Security patterns
    - Testing patterns
  </step>

  <step number="3" subagent="code-archaeologist">
    **Existing Code Analysis**

    Analyze current codebase for:
    - Related functionality
    - Similar patterns
    - Potential conflicts
    - Integration points
    - Reusable components
  </step>

  <step number="4">
    **Generate Approaches (minimum 3)**

    Approach A: Conventional
    - Standard solution
    - Well-tested patterns
    - Lower risk

    Approach B: Optimal
    - Best technical solution
    - May require more effort
    - Higher quality

    Approach C: Pragmatic
    - Balance of speed and quality
    - Practical constraints considered
    - Reasonable compromises

    [Optional] Approach D: Innovative
    - Creative solution
    - Potential for pattern extraction
    - Higher risk/reward
  </step>

  <step number="5">
    **Trade-off Analysis**

    For each approach:
    - Implementation effort
    - Maintenance burden
    - Performance impact
    - Security implications
    - Testing complexity
    - Learning curve
  </step>

  <step number="6">
    **Document Brainstorm**

    Save to: .nexus/brainstorms/[timestamp]-[topic].md

    Include:
    - Questions asked and answers
    - Patterns identified
    - All approaches generated
    - Trade-off analysis
    - Recommendation with rationale
    - Risk assessment
  </step>

  <step number="7">
    **Micro-Evolution**

    Track:
    - New question patterns
    - Constraint patterns
    - Decision patterns

    Update if threshold met:
    - Questions asked 5+ times
    - Patterns seen 3+ times
  </step>
</process_flow>

<outputs>
  <output type="file">
    Path: .nexus/brainstorms/[timestamp]-[topic].md
    Content: Complete brainstorm documentation
  </output>
  <output type="decision">
    Selected approach with justification
  </output>
  <output type="next_step">
    Suggestion: /nexus-specify [selected-approach]
  </output>
</outputs>
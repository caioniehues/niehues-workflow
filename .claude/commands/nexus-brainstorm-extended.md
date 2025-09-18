---
name: nexus-brainstorm-extended
description: Generate and evaluate solution approaches through comprehensive analysis
tools: Read, Write, Task, Glob, TodoWrite
implementation: .claude/commands/nexus-brainstorm-extended.md
---

# /nexus-brainstorm-extended [topic]

Deep exploration of solution spaces with pattern analysis and trade-off evaluation.

<unlimited_questioning>
  Continue asking until complete understanding achieved:
  - Core problem definition
  - Success criteria
  - Constraints and limitations
  - Edge cases and exceptions
  - Integration requirements
  - Performance expectations
  - Security considerations
  - User experience goals

  NO ARTIFICIAL LIMITS - continue until clarity
</unlimited_questioning>

<approach_generation>
  Minimum 3 approaches required:

  Approach A: Conservative
  - Proven patterns
  - Lower risk
  - Standard implementation

  Approach B: Optimal
  - Best technical solution
  - Higher effort
  - Superior quality

  Approach C: Pragmatic
  - Balanced trade-offs
  - Reasonable timeline
  - Practical constraints

  [Optional] Approach D: Innovative
  - Novel solution
  - Pattern extraction opportunity
  - Higher risk/reward
</approach_generation>

<evaluation_matrix>
  For each approach evaluate:
  - Implementation complexity
  - Maintenance burden
  - Performance characteristics
  - Security implications
  - Testing requirements
  - Team expertise needed
  - Timeline impact
  - Cost considerations
</evaluation_matrix>

<pattern_analysis>
  Search .nexus/patterns/ for:
  - Similar problems solved
  - Reusable architectures
  - Common pitfalls
  - Success patterns
</pattern_analysis>

<micro_evolution>
  Track for future improvement:
  - Question patterns (5+ occurrences)
  - Constraint patterns
  - Decision patterns
  - Approach patterns
</micro_evolution>
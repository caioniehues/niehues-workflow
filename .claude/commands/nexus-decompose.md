---
command: nexus-decompose
description: Transform specifications into context-embedded task files with dependency mapping
tools:
  - Read
  - Write
  - TodoWrite
arguments:
  - name: spec
    description: Path to specification file or sharded directory
    required: false
  - name: --strategy
    description: Decomposition strategy (auto/manual/guided)
    required: false
  - name: --context-mode
    description: Context embedding mode (adaptive/full/minimal)
    required: false
  - name: --max-context
    description: Maximum context size per task in lines (default 2000)
    required: false
  - name: --output
    description: Output directory for task files (default .nexus/tasks)
    required: false
  - name: --force
    description: Overwrite existing tasks without prompting
    required: false
---

# Nexus Decompose Command

Transform sharded specifications into self-contained task files with embedded context, eliminating external lookups during implementation.

## Usage
```
/nexus-decompose [--spec=<path>] [--strategy=auto|manual|guided] [--context-mode=adaptive|full|minimal] [--max-context=2000] [--output=<dir>]
```

## What It Does

The decompose command creates implementation-ready task files by:
- Parsing sharded specifications (or monolithic specs)
- Generating context-embedded task definitions
- Mapping dependencies between tasks
- Calculating confidence levels
- Identifying the critical path
- Finding parallelization opportunities
- Embedding TDD requirements (constitutional)

## Decomposition Strategies

### Auto (Default)
```
/nexus-decompose --strategy=auto
```
- Automatically identifies task boundaries
- Uses acceptance criteria and requirements
- Creates tasks from user stories
- No user interaction required

### Manual
```
/nexus-decompose --strategy=manual
```
- Interactive boundary selection
- User chooses task divisions
- Full control over task creation
- Best for complex specifications

### Guided
```
/nexus-decompose --strategy=guided
```
- AI suggests task breakdown
- User can accept, modify, or reject
- Balance of automation and control
- Recommended for most projects

## Context Embedding Modes

### Adaptive (Default)
- 200-500 lines for high confidence (≥85%)
- 500-1500 lines for medium confidence (70-84%)
- 1500-2000 lines for low confidence (<70%)
- Automatically adjusts based on task needs

### Full
- Includes all available context
- Maximum information per task
- Larger file sizes
- Best for complex tasks

### Minimal
- Core context only (200-500 lines)
- Requirements and acceptance criteria
- Smallest file sizes
- Best for simple tasks

## Task File Structure

Each generated task file contains:

```markdown
---
id: EPIC-001-task-abc123
epic: authentication
story: user-login
title: Implement JWT token generation
status: pending
confidence: 87
context_strategy: adaptive
context_size: 1247
dependencies: [AUTH-000, INFRA-001]
estimated_hours: 6
complexity: medium
risk_level: low
---

# Task: Implement JWT token generation

## Embedded Context

### Core Context (Always Included)
- Requirements with source references
- Acceptance criteria with Given/When/Then
- Dependencies with descriptions
- Technical context and constraints
- Constitutional requirements

### Extended Context (If confidence < 85%)
- Similar implementation patterns with code
- Edge cases with mitigations
- Historical decisions with rationale
- Related tasks with relationships

### Reference Context (Links Only)
- Full specification path
- Architecture documentation
- Previous task references

## TDD Requirements (Constitutional)
- Test cases with implementation hints
- Coverage requirements (minimum 80%)
- Mock requirements
- Test strategy

## Implementation Notes
[To be filled during implementation]

## Decision Log
[To be filled with decisions]
```

## Process Flow

### 1. Load Specifications
- Detect sharded vs monolithic specs
- Parse epic/story/task hierarchy
- Extract requirements and criteria

### 2. Identify Task Boundaries
Based on strategy:
- **Auto**: Pattern matching and heuristics
- **Manual**: User selects boundaries
- **Guided**: AI suggestions with user confirmation

### 3. Build Embedded Context
For each task:
- Aggregate core context (always)
- Add extended context (if needed)
- Include reference links
- Optimize to size limits

### 4. Map Dependencies
- Identify task relationships
- Calculate dependency depth
- Find critical path
- Identify parallel opportunities

### 5. Generate Task Files
- Create markdown files with frontmatter
- Embed all context
- Add TDD requirements
- Include completion checklist

## Examples

### Default Decomposition
```
/nexus-decompose
```
Uses sharded specs in `.nexus/specs/sharded` with auto strategy and adaptive context.

### From Monolithic Spec
```
/nexus-decompose --spec="docs/api-specification.md"
```
Decomposes a single specification file.

### Manual with Full Context
```
/nexus-decompose --strategy=manual --context-mode=full
```
Interactive boundary selection with complete context.

### Guided with Size Limit
```
/nexus-decompose --strategy=guided --max-context=1000
```
AI-assisted decomposition with 1000-line context limit.

### Custom Output Directory
```
/nexus-decompose --output="tasks/sprint-1"
```
Outputs task files to custom location.

## Metrics and Analysis

### Task Summary
- Total tasks created
- Average context size
- Average confidence level
- Critical path length
- Parallelization percentage

### Confidence Analysis
- **High (≥85%)**: Ready for implementation
- **Medium (70-84%)**: May need clarification
- **Low (<70%)**: Requires additional context

### Dependency Graph
- Visual hierarchy by epic/story
- Dependency relationships
- Critical path highlighting
- Parallel execution groups

### Complexity Distribution
- Simple/Medium/Complex breakdown
- Correlation with confidence
- Context size by complexity
- Risk assessment

## Next Steps Options

After decomposition:

1. **Start Implementation**
   - Begin with critical path tasks
   - Use `/nexus-implement --task=<id>`

2. **View Task Details**
   - Browse generated tasks
   - Review embedded context

3. **Export to STM**
   - Create STM tasks automatically
   - Includes tags and dependencies

4. **Generate Plan**
   - Week-by-week breakdown
   - Effort estimates
   - Risk assessment

5. **Analyze Complexity**
   - Complexity distribution
   - Confidence correlation
   - Optimization recommendations

## Best Practices

1. **Start with Sharding**: Run `/nexus-shard` first for large specs
2. **Review Low Confidence**: Tasks <70% may need more context
3. **Check Dependencies**: Verify critical path accuracy
4. **Validate Context**: Ensure tasks are self-contained
5. **Update Regularly**: Re-decompose when specs change

## Integration

Works with:
- `/nexus-shard`: Uses sharded specifications
- `/nexus-implement`: Implements decomposed tasks
- `/nexus-metrics`: Tracks decomposition metrics
- STM: Exports tasks for tracking

## Success Metrics

- **Context Completeness**: 100% (no external lookups)
- **Context Efficiency**: 90% tasks under 1500 lines
- **Dependency Accuracy**: 95% correctly mapped
- **TDD Compliance**: 100% (constitutional)
- **Confidence Average**: >80% target

## Troubleshooting

### "No specifications found"
- Run `/nexus-shard` first to create sharded specs
- Or provide `--spec` path to a specification file

### "Context too large"
- Reduce `--max-context` setting
- Use `minimal` context mode
- Consider further task breakdown

### "Low confidence tasks"
- Add more requirements to specification
- Include acceptance criteria
- Use `full` context mode

## Related Commands
- `/nexus-specify`: Create specifications
- `/nexus-shard`: Break down large specs
- `/nexus-implement`: TDD implementation
- `/nexus-metrics`: Track progress
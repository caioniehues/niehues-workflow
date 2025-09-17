---
command: nexus-brainstorm
description: Generate 20+ creative approaches for any problem or feature
tools:
  - Read
  - Write
  - TodoWrite
arguments:
  - name: topic
    description: The topic or feature to brainstorm
    required: true
  - name: --problem
    description: Detailed problem statement
    required: false
  - name: --min-approaches
    description: Minimum number of approaches to generate (default 20)
    required: false
  - name: --output
    description: Output file path (default .nexus/brainstorms/)
    required: false
---

# Nexus Brainstorm Command

Generate diverse creative approaches for any problem or feature using structured ideation.

## Usage
```
/nexus-brainstorm <topic> [--problem="<statement>"] [--min-approaches=20] [--output=<path>]
```

## What It Does

The brainstorm command generates a minimum of 20 diverse approaches categorized as:
- **Conventional**: Proven, low-risk solutions using established patterns
- **Innovative**: Modern, cutting-edge approaches with higher rewards
- **Experimental**: Unproven but potentially breakthrough solutions
- **Hybrid**: Combinations of multiple approaches

Each approach is evaluated on:
- Feasibility (0-10): How achievable with current resources
- Complexity (0-10): Implementation difficulty
- Risk (0-10): Potential for failure or issues
- Innovation (0-10): Novelty and competitive advantage

## Process

### 1. Problem Analysis
- Captures problem statement
- Identifies constraints
- Defines success criteria

### 2. Approach Generation
- Generates 5-7 conventional approaches
- Generates 5-7 innovative approaches
- Generates 5-7 experimental approaches
- Creates 3-5 hybrid combinations
- Explores "what if" questions:
  - What if we had unlimited resources?
  - How would a different industry solve this?
  - What assumptions can we challenge?
  - What would make this remarkable?
  - How would we solve this in 10% of the time?
  - What if we inverted the problem?
  - How would AI solve this differently?
  - What patterns from nature could apply?

### 3. Evaluation
- Scores each approach using weighted criteria
- Generates rationale for scores
- Ranks by overall score

### 4. Selection
- Selects top 3-5 approaches
- Ensures category diversity
- Provides selection rationale

### 5. Documentation
- Saves session to `.nexus/brainstorms/`
- Creates markdown report
- Tracks metrics

## Examples

### Basic Brainstorm
```
/nexus-brainstorm "user authentication system"
```
Generates 20+ approaches for implementing user authentication.

### With Problem Statement
```
/nexus-brainstorm "payment processing" --problem="Need to handle multiple currencies with real-time conversion"
```
Generates approaches specifically for the stated problem.

### Custom Minimum Approaches
```
/nexus-brainstorm "data migration" --min-approaches=30
```
Generates at least 30 different approaches.

### Custom Output Location
```
/nexus-brainstorm "API design" --output="./docs/brainstorms/"
```
Saves the brainstorm session to a custom location.

## Output Format

The command generates a markdown file with:
- Problem statement and context
- All constraints identified
- Success criteria defined
- Complete list of approaches with:
  - Description
  - Pros and cons
  - Metrics (feasibility, complexity, risk, innovation)
  - Score and rationale
- Top 3-5 selected approaches with justification

## Best Practices

1. **Be Specific**: Provide detailed problem statements for better approaches
2. **Review All Approaches**: Don't just focus on selected ones
3. **Consider Combinations**: Hybrid approaches often provide best results
4. **Update Constraints**: Add project-specific constraints for relevance
5. **Iterate**: Run multiple brainstorms from different angles

## Integration

After brainstorming:
1. Use `/nexus-specify` to create detailed specifications for selected approaches
2. Use `/nexus-shard` to break down large specifications
3. Use `/nexus-decompose` to create implementation tasks
4. Use `/nexus-implement` to begin TDD development

## Metrics Tracked

- Total approaches generated
- Category distribution
- Average scores by category
- Selection rate
- Time to generate

## Related Commands
- `/nexus-specify`: Create specifications from brainstorm results
- `/nexus-evaluate`: Compare approaches in detail
- `/nexus-metrics`: View brainstorming effectiveness metrics
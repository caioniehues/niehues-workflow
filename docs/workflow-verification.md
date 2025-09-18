# Workflow Verification Guide

## Command Verification

### Verify /nexus-init
```bash
# Check directory structure
ls -la .nexus/

# Expected:
# - guidelines.md exists
# - project-dna.md exists
# - All subdirectories created
```

### Verify /nexus-brainstorm
```bash
# Check output
ls -la .nexus/brainstorms/

# Verify:
# - Timestamp-named file created
# - Multiple approaches documented
# - Questions answered
```

### Verify /nexus-specify
```bash
# Check specification
ls -la .nexus/specs/[feature]/

# Verify:
# - specification.md exists
# - All requirements testable
# - Acceptance criteria clear
```

## Agent Verification

### Test Questioning Agent
1. Run command with vague requirements
2. Verify unlimited questions asked
3. Check no artificial stopping
4. Confirm understanding achieved

### Test SecurityGuardian
1. Implement code with potential vulnerability
2. Verify agent flags issue
3. Check prevention rule created
4. Confirm immediate action taken

### Test Pattern Detector
1. Create similar code 3+ times
2. Verify pattern detection triggered
3. Check pattern extracted to library
4. Confirm template created

## Evolution Verification

### Continuous Evolution
Monitor `.nexus/evolution/continuous/`:
- patterns.log growing
- questions.log updated
- metrics.json populated
- triggers.yaml activated

### Micro Evolution
After each phase:
- Check `.nexus/evolution/micro/`
- Verify learnings captured
- Confirm quick optimizations made

### Formal Evolution
After pipeline:
- Verify reflection report created
- Check pattern library updated
- Confirm guidelines amended
- Validate agent proposals

## Parallel Execution Verification

### Check Task Parallelization
```yaml
# In .nexus/tasks/
- Tasks marked with [P] execute simultaneously
- Dependencies respected
- No conflicts in parallel execution
- Resource contention managed
```

### Verify Agent Coordination
- Multiple agents working without conflicts
- Context preserved between agents
- Decision rationales maintained
- Communication logged properly

## Guideline Compliance Verification

### TDD Compliance
- Tests exist before implementation
- RED-GREEN-REFACTOR cycle followed
- Exceptions documented with justification
- Tests added within 24h for emergencies

### Questioning Compliance
- No arbitrary question limits
- Understanding verified before proceeding
- Ambiguities resolved
- Context fully established
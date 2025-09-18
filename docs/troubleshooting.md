# Nexus Troubleshooting Guide

## Common Issues and Solutions

### Setup Issues

#### "Command not recognized"
**Problem**: `/nexus-init` not working

**Solution**:
1. Ensure you're using Claude Desktop
2. Commands are in `.claude/commands/` directory
3. Restart Claude if needed

**Prevention**:
- Keep commands in correct directory
- Use proper markdown format

---

#### ".nexus directory already exists"
**Problem**: Can't initialize, directory exists

**Solution**:
```bash
# Backup existing directory
mv .nexus .nexus.backup
# Reinitialize
/nexus-init
```

**Prevention**:
- Check for existing .nexus before init
- Use version control for .nexus

---

### Pipeline Issues

#### "Questioning phase seems endless"
**Problem**: Too many questions during brainstorm

**Solution**:
- This is BY DESIGN - don't fight it
- Answer comprehensively
- Provide examples
- Be specific

**Prevention**:
- Come prepared with requirements
- Document assumptions beforehand
- Have stakeholders available

---

#### "Can't find brainstorm for specification"
**Problem**: `/nexus-specify` can't find brainstorm

**Solution**:
1. Check `.nexus/brainstorms/` directory
2. Run brainstorm if missing
3. Manually specify if needed

**Prevention**:
- Follow pipeline order
- Don't skip phases
- Check outputs exist

---

### Task Management Issues

#### "Task too large (XL)"
**Problem**: Task estimated > 4 hours

**Solution**:
```bash
/nexus-task split T001
```
Split strategies:
- Vertical: By user value
- Horizontal: By layer
- Incremental: MVP first

**Prevention**:
- Break down during decompose
- Think smaller units
- Separate test from implementation

---

#### "Tasks blocking each other"
**Problem**: Circular dependencies

**Solution**:
1. Map dependency graph
2. Identify cycle
3. Break cycle by:
   - Extracting shared interface
   - Creating intermediate task
   - Reordering work

**Prevention**:
- Plan dependencies carefully
- Keep coupling low
- Use dependency injection

---

### Implementation Issues

#### "Test passes without implementation"
**Problem**: Test not failing first (RED phase)

**Solution**:
- Test is checking wrong thing
- Implementation already exists
- Test not actually running

Debug:
```javascript
// Temporarily break implementation
throw new Error('Should fail');
// Run test - should fail
// If passes, test is wrong
```

**Prevention**:
- Always see test fail first
- Test behavior, not implementation
- Use test runners properly

---

#### "Can't achieve 80% coverage"
**Problem**: Coverage below requirement

**Solution**:
1. Run coverage report
2. Identify uncovered code
3. Add tests for:
   - Error conditions
   - Edge cases
   - All branches

**Prevention**:
- Write tests first (TDD)
- Test edge cases
- Remove dead code

---

### Pattern Issues

#### "Pattern not detected"
**Problem**: Repeated code not extracted

**Solution**:
Check thresholds:
- Must repeat 3+ times
- Must be substantial
- Must be similar enough

Manual extraction:
```bash
/nexus-pattern extract "error-handling"
```

**Prevention**:
- Be consistent in coding
- Look for patterns actively
- Document when you see repetition

---

#### "Pattern library overwhelming"
**Problem**: Too many patterns to manage

**Solution**:
1. Categorize patterns
2. Archive unused ones
3. Consolidate similar patterns
4. Document pattern relationships

**Prevention**:
- Extract only valuable patterns
- Regular pattern reviews
- Maintain pattern quality

---

### Evolution Issues

#### "No improvements identified"
**Problem**: Evolution not finding learnings

**Solution**:
- Review manually for:
  - Estimation accuracy
  - Repeated questions
  - Common blockers
  - Process friction

**Prevention**:
- Document issues as they occur
- Regular micro-evolutions
- Team retrospectives

---

#### "Guidelines too restrictive"
**Problem**: Guidelines blocking productivity

**Solution**:
1. Document specific friction
2. Propose guideline change
3. Test with small scope
4. Update if successful

**Prevention**:
- Start with minimal guidelines
- Add based on need
- Review regularly
- Allow documented exceptions

---

### Performance Issues

#### "Pipeline taking too long"
**Problem**: Full pipeline excessive time

**Solution**:
- Identify bottlenecks
- Use parallel tasks [P]
- Skip phases if appropriate
- Batch similar work

**Prevention**:
- Plan parallel work
- Size tasks appropriately
- Optimize critical path

---

#### "Validation very slow"
**Problem**: Tests take too long

**Solution**:
- Run in parallel
- Use test subsets
- Mock external services
- Cache test data

**Prevention**:
- Fast unit tests
- Minimal integration tests
- Selective E2E tests

---

## Emergency Procedures

### Critical Production Bug

1. Document emergency:
```bash
echo "EMERGENCY: [description]" >> .nexus/decision-log.md
```

2. Create failing test:
```bash
/nexus-maintain bug-fix "critical issue"
```

3. Fix with TDD exception:
- Implement fix
- Verify fix works
- Add test within 24 hours

4. Full validation within 48 hours

### Security Vulnerability

1. Immediate mitigation
2. Document vulnerability
3. Create prevention rule
4. Add to security patterns
5. Full security audit

### Data Loss

1. Stop all operations
2. Assess damage
3. Restore from backups
4. Document cause
5. Add prevention measures

## Getting Further Help

### Self-Help Resources
- Check evolution logs: `.nexus/evolution/`
- Review patterns: `.nexus/patterns/`
- Read decision log: `.nexus/decision-log.md`
- Check examples: `examples/`

### Debug Mode

Enable verbose logging:
```yaml
# .nexus/guidelines.md
debug:
  verbose: true
  log_level: DEBUG
  trace_decisions: true
```

### Common Command Fixes

| Issue | Command | Fix |
|-------|---------|-----|
| Stuck task | `/nexus-task update T001 --state PAUSED` | Pause and reassess |
| Lost context | `/nexus-task show T001` | Review embedded context |
| Wrong state | `/nexus-task update T001 --state PENDING --reason "Reset"` | Reset to pending |
| Need split | `/nexus-task split T001` | Break down XL task |

## Prevention Checklist

Before starting work:
- [ ] Nexus initialized
- [ ] Guidelines reviewed
- [ ] Team onboarded
- [ ] Patterns library ready

Before each feature:
- [ ] Requirements clear
- [ ] Stakeholders available
- [ ] Time allocated for questions
- [ ] Test environment ready

During implementation:
- [ ] Following TDD cycle
- [ ] Tests fail first
- [ ] Minimal implementation
- [ ] Patterns extracted

After completion:
- [ ] Validation passing
- [ ] Documentation updated
- [ ] Evolution captured
- [ ] Patterns documented
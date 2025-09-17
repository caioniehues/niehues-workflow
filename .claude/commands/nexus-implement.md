---
command: nexus-implement
description: TDD-enforced implementation with constitutional compliance
arguments: --task [task-id] --mode [red|green|refactor] --strict-tdd
tools:
  - Read
  - Write
  - Edit
  - MultiEdit
  - Bash
  - TodoWrite
---

# /nexus-implement - TDD-Enforced Implementation

## Overview
Implements tasks using constitutional TDD enforcement. BLOCKS any code implementation without failing tests first.

## Constitutional TDD Cycle (Mandatory)

### RED Phase (Write Failing Test First)
```bash
# 1. Load task context
task_file=".nexus/tasks/${task_id}.md"
context=$(extract_embedded_context "$task_file")

# 2. Constitutional check: No implementation exists
if implementation_exists; then
  echo "🛑 CONSTITUTIONAL VIOLATION: Implementation found without test"
  echo "Must delete implementation or add tests first"
  exit 1
fi

# 3. Generate test from acceptance criteria
echo "📝 Generating failing tests from acceptance criteria..."
generate_tests_from_criteria "$context"

# 4. Verify test fails
run_tests
if [ $? -eq 0 ]; then
  echo "🛑 CONSTITUTIONAL VIOLATION: Tests are passing without implementation"
  echo "Tests must fail before implementation"
  exit 1
fi

echo "✅ RED phase complete - Tests are failing"
```

### GREEN Phase (Minimal Implementation)
```bash
# 1. Constitutional check: Tests exist and fail
if ! tests_exist_and_fail; then
  echo "🛑 CONSTITUTIONAL VIOLATION: No failing tests found"
  echo "Must complete RED phase first"
  exit 1
fi

# 2. Implement minimal code to pass tests
echo "💚 Implementing minimal code to pass tests..."
implement_minimal_solution "$context"

# 3. Verify tests pass
run_tests
if [ $? -ne 0 ]; then
  echo "⚠️ Tests still failing - review implementation"
  show_test_results
  exit 1
fi

echo "✅ GREEN phase complete - Tests are passing"
```

### REFACTOR Phase (Quality Improvement)
```bash
# 1. Constitutional check: Tests exist and pass
if ! tests_exist_and_pass; then
  echo "🛑 CONSTITUTIONAL VIOLATION: Tests not passing"
  echo "Must complete GREEN phase first"
  exit 1
fi

# 2. Refactor for quality while keeping tests green
echo "🔧 Refactoring for quality..."
refactor_implementation "$context"

# 3. Verify tests still pass
run_tests
if [ $? -ne 0 ]; then
  echo "🛑 REFACTOR VIOLATION: Tests broke during refactor"
  echo "Reverting changes..."
  git_revert_refactor
  exit 1
fi

# 4. Check coverage
coverage=$(calculate_coverage)
if [ "$coverage" -lt 80 ]; then
  echo "⚠️ Coverage below constitutional minimum (80%): $coverage%"
  echo "Add more tests or justify exception"
fi

echo "✅ REFACTOR phase complete - Quality improved, tests green"
```

## Usage Examples

### Basic Implementation (Full TDD Cycle)
```bash
# Complete TDD cycle for a task
/nexus-implement --task AUTH-001 --strict-tdd

# Output:
# 🔍 Enforcing RED phase (Tests First)...
# ✅ RED phase compliant - Tests written and failing
# 🔍 Enforcing GREEN phase (Minimal Implementation)...
# ✅ GREEN phase compliant - Minimal implementation created
# 🔍 Enforcing REFACTOR phase (Quality Improvement)...
# ✅ REFACTOR phase compliant - Quality improved, tests green
# 📊 Task AUTH-001 completed with 100% TDD compliance
```

### Individual Phase Implementation
```bash
# Run only RED phase
/nexus-implement --task AUTH-001 --mode red

# Run only GREEN phase (after RED complete)
/nexus-implement --task AUTH-001 --mode green

# Run only REFACTOR phase (after GREEN complete)
/nexus-implement --task AUTH-001 --mode refactor
```

## Key Features

- **Constitutional TDD Enforcement**: BLOCKS code without tests
- **Context-Aware Implementation**: Uses embedded context only
- **Automatic Test Generation**: From acceptance criteria
- **Coverage Monitoring**: 80% minimum (constitutional)
- **Decision Logging**: All implementation choices tracked

## Success Criteria

- ✅ 100% TDD compliance (constitutional requirement)
- ✅ 80%+ test coverage (constitutional minimum)
- ✅ Zero constitutional violations
- ✅ Complete decision audit trail
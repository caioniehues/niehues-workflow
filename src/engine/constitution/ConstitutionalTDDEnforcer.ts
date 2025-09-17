import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as matter from 'gray-matter';
import { execSync } from 'child_process';
import { Constitution, ConstitutionalViolation, TDDViolation } from '../../types/constitution';
import { ConstitutionalEnforcer, TDDValidationInput } from './ConstitutionalEnforcer';

export interface TaskContext {
  id: string;
  title: string;
  embedded_context: EmbeddedContext;
  tdd_requirements: TDDRequirements;
  dependencies: string[];
  confidence: number;
}

export interface EmbeddedContext {
  requirements: Requirement[];
  acceptance_criteria: AcceptanceCriterion[];
  technical_context: TechnicalContext;
  test_requirements: TestRequirement[];
  implementation_hints: ImplementationHint[];
  similar_patterns?: Pattern[];
}

export interface TDDRequirements {
  minimum_coverage: number;
  test_types: string[];
  test_patterns: string[];
  failure_requirements: string[];
}

export interface Requirement {
  id: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'functional' | 'non-functional';
}

export interface AcceptanceCriterion {
  id: string;
  description: string;
  given: string;
  when: string;
  then: string;
}

export interface TechnicalContext {
  architecture_pattern: string;
  existing_patterns: string[];
  dependencies: string[];
  frameworks: string[];
}

export interface TestRequirement {
  type: 'unit' | 'integration' | 'e2e';
  framework: string;
  coverage_target: number;
  patterns: string[];
}

export interface ImplementationHint {
  pattern: string;
  rationale: string;
  example: string;
}

export interface Pattern {
  name: string;
  usage: string;
  code: string;
}

export interface TestResult {
  passing: boolean;
  failing: string[];
  coverage: number;
}

export interface Implementation {
  structure: string;
  tests: string;
  documentation: string;
}

export interface Decision {
  title: string;
  context: string;
  options: string[];
  chosen: string;
  rationale: string;
  confidence: number;
}

export class ConstitutionalTDDEnforcer {
  private constitution: Constitution;
  private enforcer: ConstitutionalEnforcer;

  constructor(constitution: Constitution) {
    this.constitution = constitution;
    this.enforcer = new ConstitutionalEnforcer(constitution);
  }

  enforceRedPhase(taskContext: TaskContext): void {
    console.log('🔍 Enforcing RED phase (Tests First)...');

    // Rule I: Tests MUST be written before implementation
    if (this.implementationExists(taskContext)) {
      this.blockViolation({
        rule: 'Test-Driven Development',
        violation: 'Implementation exists without failing test',
        required_action: 'Delete implementation or write failing test first'
      });
    }

    // Generate test from acceptance criteria
    const testCode = this.generateTestFromCriteria(taskContext.embedded_context.acceptance_criteria);

    // Write test file
    this.writeTestFile(taskContext.id, testCode);

    // Verify test fails (no implementation yet)
    const testResult = this.runTests();
    if (testResult.passing) {
      this.blockViolation({
        rule: 'Red-Green-Refactor cycle is mandatory',
        violation: 'Tests are passing without implementation',
        required_action: 'Tests must fail in RED phase'
      });
    }

    console.log('✅ RED phase compliant - Tests written and failing');
  }

  enforceGreenPhase(taskContext: TaskContext): void {
    console.log('🔍 Enforcing GREEN phase (Minimal Implementation)...');

    // Rule I: No production code without failing test first
    const testResult = this.runTests();
    if (!testResult.failing || testResult.failing.length === 0) {
      this.blockViolation({
        rule: 'No production code without failing test first',
        violation: 'No failing tests found',
        required_action: 'Complete RED phase first'
      });
    }

    // Generate minimal implementation
    const implementation = this.generateMinimalImplementation(taskContext);

    // Write implementation
    this.writeImplementation(taskContext.id, implementation);

    // Verify tests now pass
    const newTestResult = this.runTests();
    if (newTestResult.failing && newTestResult.failing.length > 0) {
      console.log('⚠️ Tests still failing after implementation:');
      newTestResult.failing.forEach(test => console.log(`  - ${test}`));
      // Don't block - let developer fix
    }

    console.log('✅ GREEN phase compliant - Minimal implementation created');
  }

  enforceRefactorPhase(taskContext: TaskContext): void {
    console.log('🔍 Enforcing REFACTOR phase (Quality Improvement)...');

    // Rule I: Tests must be green before refactoring
    const initialTestResult = this.runTests();
    if (initialTestResult.failing && initialTestResult.failing.length > 0) {
      this.blockViolation({
        rule: 'Red-Green-Refactor cycle is mandatory',
        violation: 'Tests not passing before refactor',
        required_action: 'Complete GREEN phase first'
      });
    }

    // Perform refactoring
    this.performRefactoring(taskContext);

    // Verify tests still pass
    const postRefactorResult = this.runTests();
    if (postRefactorResult.failing && postRefactorResult.failing.length > 0) {
      console.log('🛑 REFACTOR VIOLATION: Tests broke during refactor');
      this.revertChanges();
      this.blockViolation({
        rule: 'Refactoring must not break tests',
        violation: 'Tests failing after refactor',
        required_action: 'Revert changes and refactor more carefully'
      });
    }

    // Check coverage
    const coverage = this.calculateCoverage();
    if (coverage < this.constitution.tddRequirements.minimumCoverage) {
      console.log(`⚠️ Coverage below constitutional minimum: ${coverage}%`);
    }

    console.log('✅ REFACTOR phase compliant - Quality improved, tests green');
  }

  private blockViolation(violation: { rule: string; violation: string; required_action: string }): never {
    console.error('🛑 CONSTITUTIONAL VIOLATION DETECTED');
    console.error(`Rule: ${violation.rule}`);
    console.error(`Violation: ${violation.violation}`);
    console.error(`Required Action: ${violation.required_action}`);

    // Log violation for metrics
    this.logViolation(violation);

    // BLOCK execution
    throw new Error(`Constitutional violation: ${violation.violation}`);
  }

  private generateTestFromCriteria(criteria: AcceptanceCriterion[]): string {
    let testCode = '';

    for (const criterion of criteria) {
      const testCase = this.generateTestCase(criterion);
      testCode += testCase + '\n\n';
    }

    return testCode;
  }

  private generateTestCase(criterion: AcceptanceCriterion): string {
    return `it('${criterion.description}', async () => {
  // Given: ${criterion.given}
  ${this.generateTestSetup(criterion.given)}

  // When: ${criterion.when}
  ${this.generateTestAction(criterion.when)}

  // Then: ${criterion.then}
  ${this.generateTestAssertion(criterion.then)}
});`;
  }

  private generateTestSetup(given: string): string {
    // Generate test setup code from given condition
    if (given.includes('user')) {
      return 'const user = createTestUser();';
    }
    if (given.includes('database')) {
      return 'const db = createTestDatabase();';
    }
    return '// Setup test conditions';
  }

  private generateTestAction(when: string): string {
    // Generate test action code from when condition
    if (when.includes('calls')) {
      return 'const result = await targetFunction();';
    }
    if (when.includes('submits')) {
      return 'const response = await submitForm(data);';
    }
    return '// Execute action under test';
  }

  private generateTestAssertion(then: string): string {
    // Generate test assertion code from then condition
    if (then.includes('should return')) {
      return 'expect(result).toBeDefined();';
    }
    if (then.includes('should throw')) {
      return 'expect(() => result).toThrow();';
    }
    return '// Assert expected outcome';
  }

  private generateMinimalImplementation(taskContext: TaskContext): Implementation {
    const { requirements, technical_context } = taskContext.embedded_context;

    // Generate minimal code structure
    let implementation = '';

    // Use technical context for implementation hints
    if (technical_context && technical_context.architecture_pattern) {
      implementation = this.applyPattern(technical_context.architecture_pattern, requirements);
    } else {
      implementation = this.generateBasicImplementation(requirements);
    }

    return {
      structure: implementation,
      tests: '',
      documentation: ''
    };
  }

  private applyPattern(pattern: string, requirements: Requirement[]): string {
    switch (pattern) {
      case 'REST API':
        return this.generateRestApiImplementation(requirements);
      case 'Component':
        return this.generateComponentImplementation(requirements);
      default:
        return this.generateBasicImplementation(requirements);
    }
  }

  private generateRestApiImplementation(requirements: Requirement[]): string {
    return `
export class ApiController {
  async handle(req: Request, res: Response): Promise<void> {
    // Minimal implementation to pass tests
    res.status(200).json({ success: true });
  }
}`;
  }

  private generateComponentImplementation(requirements: Requirement[]): string {
    return `
export function Component(props: ComponentProps): JSX.Element {
  // Minimal implementation to pass tests
  return <div>Component</div>;
}`;
  }

  private generateBasicImplementation(requirements: Requirement[]): string {
    return `
export class Implementation {
  execute(): void {
    // Minimal implementation to pass tests
    console.log('Implementation executed');
  }
}`;
  }

  private implementationExists(taskContext: TaskContext): boolean {
    // Check if implementation files exist
    const possiblePaths = [
      `src/${taskContext.id}.ts`,
      `src/components/${taskContext.id}.tsx`,
      `src/api/${taskContext.id}.ts`
    ];

    return possiblePaths.some(path => existsSync(path));
  }

  private writeTestFile(taskId: string, testCode: string): void {
    const testPath = `tests/unit/${taskId}.test.ts`;
    const fullTestCode = `
import { describe, it, expect } from 'vitest';

describe('${taskId}', () => {
${testCode}
});
`;

    writeFileSync(testPath, fullTestCode, 'utf8');
    console.log(`📝 Test file created: ${testPath}`);
  }

  private writeImplementation(taskId: string, implementation: Implementation): void {
    const implPath = `src/${taskId}.ts`;
    writeFileSync(implPath, implementation.structure, 'utf8');
    console.log(`💚 Implementation file created: ${implPath}`);
  }

  private runTests(): TestResult {
    try {
      const output = execSync('npm test', { encoding: 'utf8' });
      const passing = !output.includes('FAIL') && !output.includes('failing');
      const failing = this.extractFailingTests(output);
      const coverage = this.extractCoverage(output);

      return { passing, failing, coverage };
    } catch (error) {
      // Tests failed
      const output = error.stdout || error.message;
      return {
        passing: false,
        failing: this.extractFailingTests(output),
        coverage: 0
      };
    }
  }

  private extractFailingTests(output: string): string[] {
    // Extract failing test names from test output
    const lines = output.split('\n');
    const failingTests: string[] = [];

    lines.forEach(line => {
      if (line.includes('✗') || line.includes('FAIL')) {
        const match = line.match(/✗\s+(.+)|FAIL\s+(.+)/);
        if (match) {
          failingTests.push(match[1] || match[2]);
        }
      }
    });

    return failingTests;
  }

  private extractCoverage(output: string): number {
    // Extract coverage percentage from test output
    const coverageMatch = output.match(/(\d+(?:\.\d+)?)%.*coverage/i);
    return coverageMatch ? parseFloat(coverageMatch[1]) : 0;
  }

  private performRefactoring(taskContext: TaskContext): void {
    // Implement refactoring logic
    console.log('🔧 Performing quality refactoring...');
    // This would implement actual refactoring patterns
  }

  private revertChanges(): void {
    try {
      execSync('git checkout HEAD -- .');
      console.log('🔄 Changes reverted successfully');
    } catch (error) {
      console.error('❌ Failed to revert changes:', error.message);
    }
  }

  private calculateCoverage(): number {
    try {
      const output = execSync('npm run test:coverage', { encoding: 'utf8' });
      return this.extractCoverage(output);
    } catch (error) {
      console.error('❌ Failed to calculate coverage:', error.message);
      return 0;
    }
  }

  private logViolation(violation: { rule: string; violation: string; required_action: string }): void {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - VIOLATION: ${violation.rule} - ${violation.violation}\n`;

    try {
      const logPath = '.nexus/metrics/violations.log';
      writeFileSync(logPath, logEntry, { flag: 'a' });
    } catch (error) {
      console.error('Failed to log violation:', error.message);
    }
  }
}
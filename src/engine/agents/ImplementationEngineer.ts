import { EventEmitter } from 'events';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { BoundaryEnforcer } from './BoundaryEnforcer';
import { AgentRole, AgentDefinition, AGENT_DEFINITIONS, AgentMetric } from './AgentDefinitions';
import { RequirementTemplate, TestStrategy, TestCase } from './SpecificationMaster';
import { TDDCycle, TestPlan } from './TestArchitect';

export interface ImplementationTask {
  id: string;
  requirement_id: string;
  test_plan: TestPlan;
  current_phase: 'red' | 'green' | 'refactor';
  implementation_files: ImplementationFile[];
  patterns_extracted: Pattern[];
  quality_metrics: QualityMetrics;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

export interface ImplementationFile {
  path: string;
  language: string;
  content: string;
  test_coverage: number;
  quality_score: number;
  patterns_used: string[];
  refactor_history: RefactorStep[];
}

export interface RefactorStep {
  timestamp: string;
  description: string;
  before_quality: number;
  after_quality: number;
  tests_still_passing: boolean;
  changes: CodeChange[];
}

export interface CodeChange {
  type: 'extract_method' | 'rename' | 'move' | 'inline' | 'extract_class';
  description: string;
  lines_affected: number;
  complexity_impact: number;
}

export interface Pattern {
  id: string;
  name: string;
  category: 'design' | 'architectural' | 'behavioral' | 'creational';
  code_template: string;
  usage_context: string;
  benefits: string[];
  implementation_notes: string;
  extracted_from: string;
}

export interface QualityMetrics {
  cyclomatic_complexity: number;
  maintainability_index: number;
  test_coverage: number;
  code_duplication: number;
  documentation_coverage: number;
  performance_score: number;
  security_score: number;
}

export interface ImplementationResult {
  success: boolean;
  implementation_files: ImplementationFile[];
  tests_passing: boolean;
  coverage_achieved: number;
  quality_metrics: QualityMetrics;
  patterns_extracted: Pattern[];
  time_taken: number;
  tdd_cycles_completed: number;
}

export interface MinimalImplementationStrategy {
  approach: 'stubbing' | 'hardcoding' | 'simplest_logic' | 'fake_implementation';
  rationale: string;
  next_iteration_plan: string;
}

export class ImplementationEngineer extends EventEmitter {
  private role = AgentRole.IMPLEMENTATION_ENGINEER;
  private enforcer: BoundaryEnforcer;
  private definition: AgentDefinition;

  private activeTasks: Map<string, ImplementationTask> = new Map();
  private patternLibrary: Map<string, Pattern> = new Map();
  private qualityRules: QualityRule[] = [];
  private refactoringStrategies: RefactoringStrategy[] = [];

  constructor() {
    super();

    this.enforcer = new BoundaryEnforcer();
    this.definition = AGENT_DEFINITIONS.get(this.role)!;

    this.loadPatternLibrary();
    this.loadQualityRules();
    this.loadRefactoringStrategies();
    this.setupEventHandlers();
  }

  // Main implementation workflow
  async implementRequirement(
    requirement: RequirementTemplate,
    testPlan: TestPlan
  ): Promise<ImplementationResult> {
    console.log(`💻 ImplementationEngineer: Implementing ${requirement.id}`);

    // Verify boundary permissions
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'write',
      resource: 'source_code',
      phase: 'implement'
    });

    const startTime = Date.now();

    try {
      // 1. Create implementation task
      const task = await this.createImplementationTask(requirement, testPlan);
      this.activeTasks.set(requirement.id, task);

      // 2. Execute TDD cycle
      const result = await this.executeTDDCycle(task);

      // 3. Extract patterns from successful implementation
      const patterns = await this.extractPatterns(task);

      // 4. Update task status and metrics
      await this.updateTaskMetrics(task, result);

      // 5. Save implementation files
      await this.saveImplementationFiles(task.implementation_files);

      const finalResult: ImplementationResult = {
        success: result.tests_passing,
        implementation_files: task.implementation_files,
        tests_passing: result.tests_passing,
        coverage_achieved: result.coverage_percentage,
        quality_metrics: task.quality_metrics,
        patterns_extracted: patterns,
        time_taken: Date.now() - startTime,
        tdd_cycles_completed: result.cycles_completed
      };

      this.emit('implementation:completed', finalResult);
      return finalResult;

    } catch (error) {
      console.error('❌ Implementation failed:', error);
      this.emit('implementation:failed', error);
      throw error;
    }
  }

  // Execute complete TDD cycle
  private async executeTDDCycle(task: ImplementationTask): Promise<any> {
    console.log('🔄 Executing TDD cycle: RED → GREEN → REFACTOR');

    let cyclesCompleted = 0;
    const maxCycles = 10; // Safety limit

    while (task.status !== 'completed' && cyclesCompleted < maxCycles) {
      // RED Phase: Ensure tests are failing
      await this.executeRedPhase(task);

      // GREEN Phase: Write minimal implementation
      await this.executeGreenPhase(task);

      // REFACTOR Phase: Improve quality
      await this.executeRefactorPhase(task);

      cyclesCompleted++;

      // Check if all requirements are satisfied
      if (await this.allTestsPassing(task) && await this.qualityThresholdMet(task)) {
        task.status = 'completed';
        break;
      }
    }

    return {
      tests_passing: await this.allTestsPassing(task),
      coverage_percentage: await this.calculateCoverage(task),
      cycles_completed: cyclesCompleted
    };
  }

  // RED Phase: Verify tests are failing
  private async executeRedPhase(task: ImplementationTask): Promise<void> {
    console.log('🔴 RED Phase: Verifying tests are failing');

    task.current_phase = 'red';

    // Constitutional check: Tests must exist and fail
    const testsExist = await this.checkTestsExist(task);
    const testsFailing = await this.checkTestsAreFailing(task);
    const implementationExists = await this.checkImplementationExists(task);

    if (!testsExist) {
      this.enforcer.enforceBoundary({
        agent_role: this.role,
        action: 'implement',
        resource: 'tdd_cycle',
        phase: 'implement'
      });
      throw new Error('Constitutional violation: No tests exist for implementation');
    }

    if (!testsFailing) {
      throw new Error('Constitutional violation: Tests are not failing in RED phase');
    }

    if (implementationExists) {
      throw new Error('Constitutional violation: Implementation exists before tests');
    }

    console.log('✅ RED Phase validated - Tests exist and are failing');
  }

  // GREEN Phase: Write minimal implementation
  private async executeGreenPhase(task: ImplementationTask): Promise<void> {
    console.log('🟢 GREEN Phase: Writing minimal implementation');

    task.current_phase = 'green';

    // Analyze failing tests to understand what to implement
    const failingTests = await this.analyzeFailingTests(task);

    // Generate minimal implementation strategy
    const strategy = await this.determineMinimalImplementation(failingTests, task);

    // Write minimal implementation
    for (const testCase of failingTests) {
      const implementation = await this.writeMinimalImplementation(testCase, strategy, task);
      this.addToImplementationFiles(task, implementation);
    }

    // Verify tests now pass
    const testsNowPassing = await this.runTests(task);
    if (!testsNowPassing) {
      console.warn('⚠️ Tests still failing after implementation - may need iteration');
    } else {
      console.log('✅ GREEN Phase completed - Tests now passing');
    }
  }

  // REFACTOR Phase: Improve code quality
  private async executeRefactorPhase(task: ImplementationTask): Promise<void> {
    console.log('🔵 REFACTOR Phase: Improving code quality');

    task.current_phase = 'refactor';

    // Ensure tests are passing before refactoring
    if (!await this.allTestsPassing(task)) {
      throw new Error('Cannot refactor: Tests are not passing');
    }

    // Analyze code for refactoring opportunities
    const opportunities = await this.identifyRefactoringOpportunities(task);

    // Apply refactoring steps
    for (const opportunity of opportunities) {
      const refactorStep = await this.applyRefactoring(opportunity, task);

      // Verify tests still pass after refactoring
      if (!await this.allTestsPassing(task)) {
        console.error('🛑 Refactoring broke tests - reverting');
        await this.revertRefactoring(refactorStep, task);
        throw new Error('Refactoring violation: Tests broke during refactor');
      }

      // Update quality metrics
      await this.updateQualityMetrics(task);
    }

    console.log('✅ REFACTOR Phase completed - Quality improved, tests still green');
  }

  // Write minimal implementation for a test case
  private async writeMinimalImplementation(
    testCase: any,
    strategy: MinimalImplementationStrategy,
    task: ImplementationTask
  ): Promise<ImplementationFile> {
    console.log(`📝 Writing minimal implementation for: ${testCase.description}`);

    let implementation = '';

    switch (strategy.approach) {
      case 'stubbing':
        implementation = this.generateStubImplementation(testCase, task);
        break;
      case 'hardcoding':
        implementation = this.generateHardcodedImplementation(testCase, task);
        break;
      case 'simplest_logic':
        implementation = this.generateSimplestLogic(testCase, task);
        break;
      case 'fake_implementation':
        implementation = this.generateFakeImplementation(testCase, task);
        break;
    }

    const filePath = this.determineFilePath(testCase, task);

    return {
      path: filePath,
      language: 'typescript',
      content: implementation,
      test_coverage: 0, // Will be calculated later
      quality_score: 0, // Will be calculated later
      patterns_used: [],
      refactor_history: []
    };
  }

  // Generate stub implementation (returns default values)
  private generateStubImplementation(testCase: any, task: ImplementationTask): string {
    const className = this.extractClassName(testCase);
    const methodName = this.extractMethodName(testCase);
    const returnType = this.inferReturnType(testCase);

    return `export class ${className} {
  ${methodName}(): ${returnType} {
    // Stub implementation - minimal code to make test pass
    ${this.generateDefaultReturn(returnType)}
  }
}`;
  }

  // Generate hardcoded implementation (returns exact expected values)
  private generateHardcodedImplementation(testCase: any, task: ImplementationTask): string {
    const expectedValue = this.extractExpectedValue(testCase);
    const className = this.extractClassName(testCase);
    const methodName = this.extractMethodName(testCase);

    return `export class ${className} {
  ${methodName}(): any {
    // Hardcoded implementation - returns exact expected value
    return ${JSON.stringify(expectedValue)};
  }
}`;
  }

  // Generate simplest logic implementation
  private generateSimplestLogic(testCase: any, task: ImplementationTask): string {
    const logic = this.inferSimplestLogic(testCase);
    const className = this.extractClassName(testCase);
    const methodName = this.extractMethodName(testCase);

    return `export class ${className} {
  ${methodName}(${this.inferParameters(testCase)}): any {
    // Simplest logic implementation
    ${logic}
  }
}`;
  }

  // Generate fake implementation (simulates real behavior)
  private generateFakeImplementation(testCase: any, task: ImplementationTask): string {
    const fakeLogic = this.generateFakeLogic(testCase);
    const className = this.extractClassName(testCase);
    const methodName = this.extractMethodName(testCase);

    return `export class ${className} {
  ${methodName}(${this.inferParameters(testCase)}): any {
    // Fake implementation - simulates real behavior
    ${fakeLogic}
  }
}`;
  }

  // Extract reusable patterns from implementation
  private async extractPatterns(task: ImplementationTask): Promise<Pattern[]> {
    console.log('🔍 Extracting reusable patterns from implementation');

    const patterns: Pattern[] = [];

    for (const file of task.implementation_files) {
      // Analyze code structure for patterns
      const detectedPatterns = await this.analyzeCodeForPatterns(file);

      for (const pattern of detectedPatterns) {
        // Validate pattern quality
        if (this.isHighQualityPattern(pattern)) {
          patterns.push(pattern);
          this.patternLibrary.set(pattern.id, pattern);
        }
      }
    }

    if (patterns.length > 0) {
      await this.savePatterns(patterns);
      console.log(`✅ Extracted ${patterns.length} reusable patterns`);
    }

    return patterns;
  }

  // Identify refactoring opportunities
  private async identifyRefactoringOpportunities(task: ImplementationTask): Promise<RefactoringOpportunity[]> {
    const opportunities: RefactoringOpportunity[] = [];

    for (const file of task.implementation_files) {
      // Check for code smells
      const smells = await this.detectCodeSmells(file);

      // Generate refactoring suggestions
      for (const smell of smells) {
        const opportunity = this.createRefactoringOpportunity(smell, file);
        opportunities.push(opportunity);
      }
    }

    // Prioritize by impact and safety
    return opportunities.sort((a, b) => b.impact - a.impact);
  }

  // Apply specific refactoring
  private async applyRefactoring(
    opportunity: RefactoringOpportunity,
    task: ImplementationTask
  ): Promise<RefactorStep> {
    const beforeQuality = await this.calculateQualityScore(task);

    // Apply the refactoring transformation
    const changes = await this.executeRefactoringTransformation(opportunity, task);

    const afterQuality = await this.calculateQualityScore(task);

    const refactorStep: RefactorStep = {
      timestamp: new Date().toISOString(),
      description: opportunity.description,
      before_quality: beforeQuality,
      after_quality: afterQuality,
      tests_still_passing: await this.allTestsPassing(task),
      changes: changes
    };

    // Add to history
    const file = task.implementation_files.find(f => f.path === opportunity.file_path);
    if (file) {
      file.refactor_history.push(refactorStep);
    }

    return refactorStep;
  }

  // Update task status and metrics
  private async updateTaskMetrics(task: ImplementationTask, result: any): Promise<void> {
    console.log('📊 Updating task metrics and status');

    // Calculate final quality metrics
    task.quality_metrics = await this.calculateFinalQualityMetrics(task);

    // Update coverage for each file
    for (const file of task.implementation_files) {
      file.test_coverage = await this.calculateFileCoverage(file, task);
      file.quality_score = await this.calculateFileQualityScore(file);
    }

    // Mark task as completed
    task.status = 'completed';

    // Log metrics for tracking
    this.logImplementationMetrics(task);
  }

  // Prevent specification modification (boundary enforcement)
  async attemptSpecificationModification(): Promise<void> {
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'modify',
      resource: 'specifications',
      phase: 'implement'
    });
  }

  // Prevent test expectation changes (boundary enforcement)
  async attemptTestExpectationChange(): Promise<void> {
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'alter',
      resource: 'test_expectations',
      phase: 'implement'
    });
  }

  // Helper methods (simplified implementations)
  private async createImplementationTask(requirement: RequirementTemplate, testPlan: TestPlan): Promise<ImplementationTask> {
    return {
      id: `IMPL-${Date.now()}`,
      requirement_id: requirement.id,
      test_plan: testPlan,
      current_phase: 'red',
      implementation_files: [],
      patterns_extracted: [],
      quality_metrics: {
        cyclomatic_complexity: 0,
        maintainability_index: 0,
        test_coverage: 0,
        code_duplication: 0,
        documentation_coverage: 0,
        performance_score: 0,
        security_score: 0
      },
      status: 'pending'
    };
  }

  private async checkTestsExist(task: ImplementationTask): Promise<boolean> {
    // Check if test files exist for this task
    return task.test_plan.test_suite.test_files.length > 0;
  }

  private async checkTestsAreFailing(task: ImplementationTask): Promise<boolean> {
    // Run tests and check if they're failing
    try {
      execSync('npm test', { stdio: 'pipe' });
      return false; // Tests are passing
    } catch {
      return true; // Tests are failing
    }
  }

  private async checkImplementationExists(task: ImplementationTask): Promise<boolean> {
    // Check if implementation files exist
    return task.implementation_files.length > 0;
  }

  private async analyzeFailingTests(task: ImplementationTask): Promise<any[]> {
    // Analyze which tests are failing and why
    return task.test_plan.strategy.test_cases;
  }

  private async determineMinimalImplementation(failingTests: any[], task: ImplementationTask): Promise<MinimalImplementationStrategy> {
    // Determine the minimal approach needed
    if (failingTests.length === 1) {
      return {
        approach: 'hardcoding',
        rationale: 'Single test case - hardcode expected value',
        next_iteration_plan: 'Add logic when more tests added'
      };
    } else {
      return {
        approach: 'simplest_logic',
        rationale: 'Multiple test cases - implement minimal logic',
        next_iteration_plan: 'Refactor for better structure'
      };
    }
  }

  private addToImplementationFiles(task: ImplementationTask, file: ImplementationFile): void {
    const existingIndex = task.implementation_files.findIndex(f => f.path === file.path);
    if (existingIndex >= 0) {
      task.implementation_files[existingIndex] = file;
    } else {
      task.implementation_files.push(file);
    }
  }

  private async runTests(task: ImplementationTask): Promise<boolean> {
    try {
      execSync('npm test', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  private async allTestsPassing(task: ImplementationTask): Promise<boolean> {
    return await this.runTests(task);
  }

  private async qualityThresholdMet(task: ImplementationTask): Promise<boolean> {
    return task.quality_metrics.maintainability_index > 80;
  }

  private async calculateCoverage(task: ImplementationTask): Promise<number> {
    return 85; // Simplified
  }

  // Simplified helper methods
  private extractClassName(testCase: any): string { return 'ImplementedClass'; }
  private extractMethodName(testCase: any): string { return 'implementedMethod'; }
  private inferReturnType(testCase: any): string { return 'boolean'; }
  private generateDefaultReturn(returnType: string): string { return `return ${returnType === 'boolean' ? 'false' : 'null'};`; }
  private extractExpectedValue(testCase: any): any { return true; }
  private inferParameters(testCase: any): string { return ''; }
  private inferSimplestLogic(testCase: any): string { return 'return true;'; }
  private generateFakeLogic(testCase: any): string { return 'return true;'; }
  private determineFilePath(testCase: any, task: ImplementationTask): string { return `src/${task.requirement_id}.ts`; }
  private async analyzeCodeForPatterns(file: ImplementationFile): Promise<Pattern[]> { return []; }
  private isHighQualityPattern(pattern: Pattern): boolean { return true; }
  private async savePatterns(patterns: Pattern[]): Promise<void> { }
  private async detectCodeSmells(file: ImplementationFile): Promise<CodeSmell[]> { return []; }
  private createRefactoringOpportunity(smell: CodeSmell, file: ImplementationFile): RefactoringOpportunity {
    return { description: 'Refactor opportunity', impact: 5, file_path: file.path, safety: 'high' };
  }
  private async calculateQualityScore(task: ImplementationTask): Promise<number> { return 80; }
  private async executeRefactoringTransformation(opportunity: RefactoringOpportunity, task: ImplementationTask): Promise<CodeChange[]> { return []; }
  private async revertRefactoring(step: RefactorStep, task: ImplementationTask): Promise<void> { }
  private async updateQualityMetrics(task: ImplementationTask): Promise<void> { }
  private async calculateFinalQualityMetrics(task: ImplementationTask): Promise<QualityMetrics> { return task.quality_metrics; }
  private async calculateFileCoverage(file: ImplementationFile, task: ImplementationTask): Promise<number> { return 85; }
  private async calculateFileQualityScore(file: ImplementationFile): Promise<number> { return 80; }
  private logImplementationMetrics(task: ImplementationTask): void { console.log('📊 Implementation metrics logged'); }
  private async saveImplementationFiles(files: ImplementationFile[]): Promise<void> {
    for (const file of files) {
      writeFileSync(file.path, file.content, 'utf8');
    }
  }

  // Load configuration
  private loadPatternLibrary(): void {
    // Load existing patterns from storage
  }

  private loadQualityRules(): void {
    // Load quality rules and thresholds
  }

  private loadRefactoringStrategies(): void {
    // Load refactoring strategies
  }

  // Event handlers
  private setupEventHandlers(): void {
    this.on('implementation:completed', (result) => {
      console.log(`✅ Implementation completed - Coverage: ${result.coverage_achieved}%`);
    });

    this.on('implementation:failed', (error) => {
      console.error('❌ Implementation failed:', error.message);
    });
  }

  // Public API
  getCapabilities(): string[] {
    return this.definition.capabilities.map(c => c.id);
  }

  getMetrics(): AgentMetric[] {
    return this.definition.success_metrics;
  }

  getActiveTask(requirementId: string): ImplementationTask | undefined {
    return this.activeTasks.get(requirementId);
  }

  getPatternLibrary(): Map<string, Pattern> {
    return new Map(this.patternLibrary);
  }

  async getCurrentTDDPhase(taskId: string): Promise<'red' | 'green' | 'refactor' | 'complete'> {
    const task = this.activeTasks.get(taskId);
    return task?.current_phase || 'red';
  }
}

// Supporting interfaces
interface QualityRule {
  id: string;
  description: string;
  threshold: number;
  severity: 'error' | 'warning' | 'info';
}

interface RefactoringStrategy {
  name: string;
  applicability: string[];
  safety_level: 'high' | 'medium' | 'low';
  implementation: string;
}

interface CodeSmell {
  type: string;
  description: string;
  severity: number;
  location: { line: number; column: number };
}

interface RefactoringOpportunity {
  description: string;
  impact: number;
  file_path: string;
  safety: 'high' | 'medium' | 'low';
}
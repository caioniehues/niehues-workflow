import { EventEmitter } from 'events';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ConstitutionalEnforcer } from '../constitution/ConstitutionalEnforcer';
import { ContextEmbedder, TaskWithContext } from '../context/ContextEmbedder';
import { TDDMetricsCollector } from '../metrics/TDDMetricsCollector';

export enum WorkflowPhase {
  BRAINSTORM = 'brainstorm',
  SPECIFY = 'specify',
  SHARD = 'shard',
  DECOMPOSE = 'decompose',
  IMPLEMENT = 'implement'
}

export interface PhaseTransition {
  from: WorkflowPhase;
  to: WorkflowPhase;
  timestamp: string;
  duration: number;
  validation_passed: boolean;
  artifacts_generated: string[];
  context_preserved: boolean;
}

export interface PhaseDefinition {
  name: WorkflowPhase;
  entry_conditions: EntryCondition[];
  exit_criteria: ExitCriterion[];
  required_artifacts: string[];
  validation_gates: ValidationGate[];
  agent_assignments: AgentAssignment[];
  handoff_protocol: HandoffProtocol;
}

export interface EntryCondition {
  id: string;
  description: string;
  check: () => Promise<boolean>;
  required: boolean;
}

export interface ExitCriterion {
  id: string;
  description: string;
  validate: () => Promise<boolean>;
  blocking: boolean;
}

export interface ValidationGate {
  type: 'constitutional' | 'quality' | 'completeness' | 'human';
  check: () => Promise<ValidationResult>;
  blocking: boolean;
  retry_allowed: boolean;
}

export interface AgentAssignment {
  agent_type: string;
  responsibilities: string[];
  constraints: string[];
}

export interface HandoffProtocol {
  artifacts_to_transfer: string[];
  context_to_embed: string[];
  notification_message: string;
  next_phase: WorkflowPhase;
  rollback_allowed: boolean;
}

export interface WorkflowState {
  current_phase: WorkflowPhase | null;
  phase_history: PhaseTransition[];
  active_artifacts: Map<string, any>;
  context_chain: Map<string, any>;
  metrics: WorkflowMetrics;
  violations: any[];
}

export interface WorkflowMetrics {
  phases_completed: Map<WorkflowPhase, number>;
  average_phase_duration: Map<WorkflowPhase, number>;
  validation_failures: number;
  context_preservation_rate: number;
  constitutional_violations: number;
  rollback_count: number;
}

export interface ValidationResult {
  passed: boolean;
  reason?: string;
}

export interface PhaseExecutionResult {
  success: boolean;
  phase: WorkflowPhase;
  next_phase?: WorkflowPhase;
  artifacts?: string[];
  context?: any;
  metrics?: any;
  errors?: string[];
  message?: string;
  recovery_attempted?: any;
  task_count?: number;
  coverage?: number;
}

export interface PhaseResult {
  phase: WorkflowPhase;
  artifacts: string[];
  data: any;
  confidence?: number;
  metrics?: any;
  task_count?: number;
}

export interface EntryCheckResult {
  passed: boolean;
  failed_conditions: string[];
}

export interface ExitCheckResult {
  passed: boolean;
  failed_criteria: string[];
}

export interface ValidationGateResult {
  passed: boolean;
  blocking: boolean;
  reason?: string;
  gate_type?: string;
}

export interface HandoffPackage {
  from_phase: WorkflowPhase;
  next_phase: WorkflowPhase;
  artifacts: any;
  embedded_context: any;
  message: string;
  timestamp: string;
  validation_passed: boolean;
}

export interface TransitionValidation {
  valid: boolean;
  reason?: string;
}

export interface RollbackResult {
  rolled_back_from: WorkflowPhase;
  rolled_back_to: WorkflowPhase;
  artifacts_cleared: boolean;
}

export interface WorkflowExecutionResult {
  success: boolean;
  phases_completed: number;
  tasks_generated?: number;
  metrics: WorkflowMetrics;
  error?: string;
}

export interface TaskExecutionResult {
  success: boolean;
  task_id: string;
  coverage?: number;
  artifacts?: string[];
}

export class WorkflowOrchestrator extends EventEmitter {
  private state: WorkflowState;
  private phaseDefinitions: Map<WorkflowPhase, PhaseDefinition>;
  private constitutionalEnforcer: ConstitutionalEnforcer;
  private contextEmbedder: ContextEmbedder;
  private metricsCollector: TDDMetricsCollector;
  private activePhaseStartTime: number = 0;

  constructor() {
    super();

    this.state = this.initializeState();
    this.phaseDefinitions = this.loadPhaseDefinitions();
    this.constitutionalEnforcer = new ConstitutionalEnforcer({ immutable_principles: { I: { rules: { test_coverage_minimum: 80 } } } } as any);
    this.contextEmbedder = new ContextEmbedder();
    this.metricsCollector = new TDDMetricsCollector();

    this.setupEventHandlers();
  }

  // Main orchestration method
  async executePhase(phase: WorkflowPhase, input: any): Promise<PhaseExecutionResult> {
    console.log(`🎯 Executing phase: ${phase}`);

    // 1. Validate phase transition
    const transitionValid = await this.validateTransition(this.state.current_phase, phase);
    if (!transitionValid.valid) {
      throw new Error(`Invalid transition: ${transitionValid.reason}`);
    }

    // 2. Check entry conditions
    const entryCheck = await this.checkEntryConditions(phase);
    if (!entryCheck.passed) {
      return {
        success: false,
        phase: phase,
        errors: entryCheck.failed_conditions,
        message: 'Entry conditions not met'
      };
    }

    // 3. Start phase execution
    this.activePhaseStartTime = Date.now();
    this.state.current_phase = phase;
    this.emit('phase:started', phase);

    try {
      // 4. Execute phase-specific logic
      const phaseResult = await this.executePhaseLogic(phase, input);

      // 5. Validate exit criteria
      const exitCheck = await this.checkExitCriteria(phase);
      if (!exitCheck.passed) {
        throw new Error(`Exit criteria not met: ${exitCheck.failed_criteria.join(', ')}`);
      }

      // 6. Run validation gates
      const validationResult = await this.runValidationGates(phase);
      if (!validationResult.passed) {
        if (validationResult.blocking) {
          throw new Error(`Validation gate failed: ${validationResult.reason}`);
        }
        console.warn(`⚠️ Non-blocking validation failed: ${validationResult.reason}`);
      }

      // 7. Prepare handoff
      const handoff = await this.prepareHandoff(phase, phaseResult);

      // 8. Record transition
      const transition = this.recordTransition(
        this.state.current_phase,
        handoff.next_phase,
        true,
        phaseResult.artifacts
      );

      // 9. Update metrics
      this.updateMetrics(phase, transition);

      this.emit('phase:completed', phase, phaseResult);

      return {
        success: true,
        phase: phase,
        next_phase: handoff.next_phase,
        artifacts: phaseResult.artifacts,
        context: handoff.embedded_context,
        metrics: this.getPhaseMetrics(phase)
      };

    } catch (error) {
      console.error(`❌ Phase ${phase} failed:`, error);

      // Handle failure
      const recoveryResult = await this.handlePhaseFailure(phase, error);

      if (recoveryResult.retry) {
        console.log('🔄 Retrying phase...');
        return this.executePhase(phase, input);
      }

      if (recoveryResult.rollback) {
        console.log('⏮️ Rolling back to previous phase...');
        await this.rollbackPhase(phase);
      }

      this.emit('phase:failed', phase, error);

      return {
        success: false,
        phase: phase,
        errors: [error.message],
        recovery_attempted: recoveryResult
      };
    }
  }

  // Phase-specific execution logic
  private async executePhaseLogic(phase: WorkflowPhase, input: any): Promise<PhaseResult> {
    switch (phase) {
      case WorkflowPhase.BRAINSTORM:
        return await this.executeBrainstormPhase(input);

      case WorkflowPhase.SPECIFY:
        return await this.executeSpecifyPhase(input);

      case WorkflowPhase.SHARD:
        return await this.executeShardPhase(input);

      case WorkflowPhase.DECOMPOSE:
        return await this.executeDecomposePhase(input);

      case WorkflowPhase.IMPLEMENT:
        return await this.executeImplementPhase(input);

      default:
        throw new Error(`Unknown phase: ${phase}`);
    }
  }

  // BRAINSTORM Phase Implementation
  private async executeBrainstormPhase(input: any): Promise<PhaseResult> {
    console.log('🧠 Executing BRAINSTORM phase');

    const artifacts = {
      approaches: [],
      evaluation_matrix: null,
      selected_approaches: []
    };

    // Generate 20+ approaches
    artifacts.approaches = await this.generateApproaches(input, 20);

    // Evaluate approaches
    artifacts.evaluation_matrix = await this.evaluateApproaches(artifacts.approaches);

    // Select top 3-5 approaches
    artifacts.selected_approaches = this.selectTopApproaches(
      artifacts.approaches,
      artifacts.evaluation_matrix,
      5
    );

    // Save artifacts
    await this.saveArtifacts('brainstorm', artifacts);

    return {
      phase: WorkflowPhase.BRAINSTORM,
      artifacts: ['selected_approaches.md', 'evaluation_matrix.yaml'],
      data: artifacts,
      confidence: this.calculateBrainstormConfidence(artifacts)
    };
  }

  // SPECIFY Phase Implementation
  private async executeSpecifyPhase(input: any): Promise<PhaseResult> {
    console.log('📋 Executing SPECIFY phase');

    const artifacts = {
      specification: null,
      test_strategies: [],
      acceptance_criteria: []
    };

    // Load selected approaches from previous phase
    const approaches = await this.loadArtifact('brainstorm', 'selected_approaches');

    // Run adaptive questioning
    const questioningResult = await this.runAdaptiveQuestioning(approaches);

    // Fill SRS template
    artifacts.specification = await this.fillSRSTemplate(questioningResult);

    // Generate test strategies
    artifacts.test_strategies = await this.generateTestStrategies(artifacts.specification);

    // Validate constitutional compliance
    const compliance = await this.validateSpecificationCompliance(artifacts.specification);
    if (!compliance.compliant) {
      throw new Error(`Constitutional violation: ${compliance.violations.join(', ')}`);
    }

    await this.saveArtifacts('specify', artifacts);

    return {
      phase: WorkflowPhase.SPECIFY,
      artifacts: ['specification.md', 'test_strategies.yaml'],
      data: artifacts,
      confidence: questioningResult.confidence
    };
  }

  // SHARD Phase Implementation
  private async executeShardPhase(input: any): Promise<PhaseResult> {
    console.log('✂️ Executing SHARD phase');

    const artifacts = {
      shards: [],
      navigation_index: null,
      cross_references: []
    };

    // Load specification from previous phase
    const specification = await this.loadArtifact('specify', 'specification');

    // Execute sharding
    const shardingResult = await this.shardDocument(specification);
    artifacts.shards = shardingResult.shards;
    artifacts.navigation_index = shardingResult.navigation;
    artifacts.cross_references = shardingResult.cross_references;

    // Validate sharding effectiveness
    const metrics = this.calculateShardingMetrics(artifacts);
    if (metrics.size_reduction < 70) {
      console.warn('⚠️ Sharding size reduction below target');
    }

    await this.saveArtifacts('shard', artifacts);

    return {
      phase: WorkflowPhase.SHARD,
      artifacts: ['shards/', 'index.md', 'cross-references.yaml'],
      data: artifacts,
      metrics: metrics
    };
  }

  // DECOMPOSE Phase Implementation
  private async executeDecomposePhase(input: any): Promise<PhaseResult> {
    console.log('🔨 Executing DECOMPOSE phase');

    const artifacts = {
      tasks: [],
      dependency_graph: null,
      critical_path: []
    };

    // Load shards from previous phase
    const shards = await this.loadArtifact('shard', 'shards');

    // Generate tasks with embedded context
    for (const shard of shards) {
      const shardTasks = await this.generateTasksFromShard(shard);

      // Embed context in each task
      for (const task of shardTasks) {
        const confidence = this.calculateTaskConfidence(task);
        const taskWithContext = await this.contextEmbedder.embedContext(
          task,
          shard,
          confidence
        );
        artifacts.tasks.push(taskWithContext);
      }
    }

    // Generate dependency graph
    artifacts.dependency_graph = this.generateDependencyGraph(artifacts.tasks);

    // Calculate critical path
    artifacts.critical_path = this.calculateCriticalPath(artifacts.dependency_graph);

    // Validate context completeness
    for (const task of artifacts.tasks) {
      const validation = await this.validateTaskContext(task);
      if (!validation.complete) {
        console.warn(`⚠️ Task ${task.id} has incomplete context`);
      }
    }

    await this.saveArtifacts('decompose', artifacts);

    return {
      phase: WorkflowPhase.DECOMPOSE,
      artifacts: ['tasks/', 'dependency_graph.svg', 'critical_path.yaml'],
      data: artifacts,
      task_count: artifacts.tasks.length
    };
  }

  // IMPLEMENT Phase Implementation
  private async executeImplementPhase(input: any): Promise<PhaseResult> {
    console.log('💻 Executing IMPLEMENT phase');

    const artifacts = {
      implementation: null,
      tests: null,
      coverage_report: null,
      decision_log: []
    };

    // Load task from input
    const task = await this.loadTask(input.task_id);

    // Enforce constitutional TDD
    const tddResult = await this.enforceTDDCycle(task);
    artifacts.tests = tddResult.tests;
    artifacts.implementation = tddResult.implementation;

    // Calculate coverage
    artifacts.coverage_report = await this.calculateCoverage(
      artifacts.implementation,
      artifacts.tests
    );

    // Validate constitutional compliance
    if (artifacts.coverage_report.percentage < 80) {
      throw new Error(`Coverage below constitutional minimum: ${artifacts.coverage_report.percentage}%`);
    }

    // Log decisions made during implementation
    artifacts.decision_log = this.extractDecisions(tddResult);

    await this.saveArtifacts('implement', artifacts);

    return {
      phase: WorkflowPhase.IMPLEMENT,
      artifacts: ['implementation/', 'tests/', 'coverage.html'],
      data: artifacts
    };
  }

  // Entry condition checking
  private async checkEntryConditions(phase: WorkflowPhase): Promise<EntryCheckResult> {
    const definition = this.phaseDefinitions.get(phase);
    if (!definition) {
      throw new Error(`No definition for phase: ${phase}`);
    }

    const results = {
      passed: true,
      failed_conditions: []
    };

    for (const condition of definition.entry_conditions) {
      const conditionMet = await condition.check();

      if (!conditionMet && condition.required) {
        results.passed = false;
        results.failed_conditions.push(condition.description);
      }
    }

    return results;
  }

  // Exit criteria validation
  private async checkExitCriteria(phase: WorkflowPhase): Promise<ExitCheckResult> {
    const definition = this.phaseDefinitions.get(phase);
    if (!definition) {
      throw new Error(`No definition for phase: ${phase}`);
    }

    const results = {
      passed: true,
      failed_criteria: []
    };

    for (const criterion of definition.exit_criteria) {
      const criterionMet = await criterion.validate();

      if (!criterionMet && criterion.blocking) {
        results.passed = false;
        results.failed_criteria.push(criterion.description);
      }
    }

    return results;
  }

  // Validation gate execution
  private async runValidationGates(phase: WorkflowPhase): Promise<ValidationGateResult> {
    const definition = this.phaseDefinitions.get(phase);
    if (!definition) {
      return { passed: true, blocking: false };
    }

    for (const gate of definition.validation_gates) {
      const result = await gate.check();

      if (!result.passed) {
        if (gate.blocking) {
          return {
            passed: false,
            blocking: true,
            reason: result.reason,
            gate_type: gate.type
          };
        } else {
          console.warn(`⚠️ Non-blocking gate failed: ${gate.type}`);
        }
      }
    }

    return { passed: true, blocking: false };
  }

  // Handoff preparation with context embedding
  private async prepareHandoff(
    currentPhase: WorkflowPhase,
    phaseResult: PhaseResult
  ): Promise<HandoffPackage> {
    const definition = this.phaseDefinitions.get(currentPhase);
    if (!definition) {
      throw new Error(`No definition for phase: ${currentPhase}`);
    }

    const handoffProtocol = definition.handoff_protocol;

    // Aggregate artifacts
    const artifacts = await this.aggregateHandoffArtifacts(
      handoffProtocol.artifacts_to_transfer,
      phaseResult.artifacts
    );

    // Embed context for next phase
    const embeddedContext = await this.embedHandoffContext(
      handoffProtocol.context_to_embed,
      artifacts
    );

    // Create handoff package
    const handoffPackage: HandoffPackage = {
      from_phase: currentPhase,
      next_phase: handoffProtocol.next_phase,
      artifacts: artifacts,
      embedded_context: embeddedContext,
      message: handoffProtocol.notification_message,
      timestamp: new Date().toISOString(),
      validation_passed: true
    };

    // Save handoff package
    await this.saveHandoffPackage(handoffPackage);

    // Notify next phase
    this.emit('handoff:ready', handoffPackage);

    return handoffPackage;
  }

  // Phase transition validation
  private async validateTransition(
    from: WorkflowPhase | null,
    to: WorkflowPhase
  ): Promise<TransitionValidation> {
    // Allow starting with any phase
    if (from === null) {
      return { valid: true };
    }

    // Check if transition is allowed
    const validTransitions = {
      [WorkflowPhase.BRAINSTORM]: [WorkflowPhase.SPECIFY],
      [WorkflowPhase.SPECIFY]: [WorkflowPhase.SHARD],
      [WorkflowPhase.SHARD]: [WorkflowPhase.DECOMPOSE],
      [WorkflowPhase.DECOMPOSE]: [WorkflowPhase.IMPLEMENT],
      [WorkflowPhase.IMPLEMENT]: [WorkflowPhase.BRAINSTORM] // Can start new cycle
    };

    const allowedTransitions = validTransitions[from] || [];

    if (!allowedTransitions.includes(to)) {
      return {
        valid: false,
        reason: `Cannot transition from ${from} to ${to}`
      };
    }

    // Check if previous phase completed successfully
    const lastTransition = this.getLastTransition();
    if (lastTransition && !lastTransition.validation_passed) {
      return {
        valid: false,
        reason: 'Previous phase did not complete successfully'
      };
    }

    return { valid: true };
  }

  // Rollback mechanism
  private async rollbackPhase(phase: WorkflowPhase): Promise<RollbackResult> {
    console.log(`⏮️ Rolling back phase: ${phase}`);

    const lastSuccessfulPhase = this.findLastSuccessfulPhase();

    if (!lastSuccessfulPhase) {
      throw new Error('No successful phase to rollback to');
    }

    // Restore state
    await this.restorePhaseState(lastSuccessfulPhase);

    // Clear failed artifacts
    await this.clearPhaseArtifacts(phase);

    // Update state
    this.state.current_phase = lastSuccessfulPhase;
    this.state.metrics.rollback_count++;

    this.emit('phase:rolledback', phase, lastSuccessfulPhase);

    return {
      rolled_back_from: phase,
      rolled_back_to: lastSuccessfulPhase,
      artifacts_cleared: true
    };
  }

  // Metrics tracking
  private updateMetrics(phase: WorkflowPhase, transition: PhaseTransition): void {
    // Update phase completion count
    const completionCount = this.state.metrics.phases_completed.get(phase) || 0;
    this.state.metrics.phases_completed.set(phase, completionCount + 1);

    // Update average duration
    const currentAvg = this.state.metrics.average_phase_duration.get(phase) || 0;
    const newAvg = (currentAvg * completionCount + transition.duration) / (completionCount + 1);
    this.state.metrics.average_phase_duration.set(phase, newAvg);

    // Update context preservation rate
    const totalTransitions = this.state.phase_history.length;
    const preservedCount = this.state.phase_history.filter(t => t.context_preserved).length;
    this.state.metrics.context_preservation_rate = totalTransitions > 0 ? preservedCount / totalTransitions : 1;

    // Persist metrics
    this.metricsCollector.trackTDDCompliance(phase, 'green');
  }

  // Phase definition loading
  private loadPhaseDefinitions(): Map<WorkflowPhase, PhaseDefinition> {
    const definitions = new Map<WorkflowPhase, PhaseDefinition>();

    // BRAINSTORM phase definition
    definitions.set(WorkflowPhase.BRAINSTORM, {
      name: WorkflowPhase.BRAINSTORM,
      entry_conditions: [
        {
          id: 'initial_idea',
          description: 'Initial idea or problem statement captured',
          check: async () => this.hasArtifact('initial_idea'),
          required: true
        }
      ],
      exit_criteria: [
        {
          id: 'approaches_generated',
          description: 'Minimum 20 approaches generated',
          validate: async () => {
            const approaches = await this.loadArtifact('brainstorm', 'approaches');
            return approaches && approaches.length >= 20;
          },
          blocking: true
        },
        {
          id: 'selection_made',
          description: 'Top 3-5 approaches selected',
          validate: async () => {
            const selected = await this.loadArtifact('brainstorm', 'selected_approaches');
            return selected && selected.length >= 3 && selected.length <= 5;
          },
          blocking: true
        }
      ],
      required_artifacts: ['selected_approaches.md', 'evaluation_matrix.yaml'],
      validation_gates: [
        {
          type: 'quality',
          check: async () => this.validateApproachQuality(),
          blocking: false,
          retry_allowed: true
        }
      ],
      agent_assignments: [],
      handoff_protocol: {
        artifacts_to_transfer: ['selected_approaches.md'],
        context_to_embed: ['approach_rationale', 'constraints'],
        notification_message: 'Approaches selected. Ready for specification.',
        next_phase: WorkflowPhase.SPECIFY,
        rollback_allowed: true
      }
    });

    // Add other phase definitions
    this.addSpecifyPhaseDefinition(definitions);
    this.addShardPhaseDefinition(definitions);
    this.addDecomposePhaseDefinition(definitions);
    this.addImplementPhaseDefinition(definitions);

    return definitions;
  }

  // State initialization
  private initializeState(): WorkflowState {
    return {
      current_phase: null,
      phase_history: [],
      active_artifacts: new Map(),
      context_chain: new Map(),
      metrics: {
        phases_completed: new Map(),
        average_phase_duration: new Map(),
        validation_failures: 0,
        context_preservation_rate: 1.0,
        constitutional_violations: 0,
        rollback_count: 0
      },
      violations: []
    };
  }

  // Event handler setup
  private setupEventHandlers(): void {
    this.on('phase:started', (phase) => {
      console.log(`📢 Phase ${phase} started at ${new Date().toISOString()}`);
    });

    this.on('phase:completed', (phase, result) => {
      console.log(`✅ Phase ${phase} completed successfully`);
      this.savePhaseResult(phase, result);
    });

    this.on('phase:failed', (phase, error) => {
      console.error(`❌ Phase ${phase} failed:`, error);
    });

    this.on('handoff:ready', (handoff) => {
      console.log(`🤝 Handoff ready: ${handoff.from_phase} → ${handoff.next_phase}`);
    });
  }

  // Public API methods
  async startWorkflow(initialInput: any): Promise<WorkflowExecutionResult> {
    console.log('🚀 Starting Nexus workflow');

    this.state = this.initializeState();

    try {
      // Execute phases in sequence
      const brainstormResult = await this.executePhase(WorkflowPhase.BRAINSTORM, initialInput);
      if (!brainstormResult.success) throw new Error('Brainstorm phase failed');

      const specifyResult = await this.executePhase(WorkflowPhase.SPECIFY, brainstormResult);
      if (!specifyResult.success) throw new Error('Specify phase failed');

      const shardResult = await this.executePhase(WorkflowPhase.SHARD, specifyResult);
      if (!shardResult.success) throw new Error('Shard phase failed');

      const decomposeResult = await this.executePhase(WorkflowPhase.DECOMPOSE, shardResult);
      if (!decomposeResult.success) throw new Error('Decompose phase failed');

      return {
        success: true,
        phases_completed: 4,
        tasks_generated: decomposeResult.task_count,
        metrics: this.getWorkflowMetrics()
      };

    } catch (error) {
      console.error('Workflow execution failed:', error);
      return {
        success: false,
        error: error.message,
        phases_completed: this.state.phase_history.length,
        metrics: this.getWorkflowMetrics()
      };
    }
  }

  async executeTask(taskId: string): Promise<TaskExecutionResult> {
    const implementResult = await this.executePhase(WorkflowPhase.IMPLEMENT, { task_id: taskId });

    return {
      success: implementResult.success,
      task_id: taskId,
      coverage: implementResult.coverage,
      artifacts: implementResult.artifacts
    };
  }

  getWorkflowMetrics(): WorkflowMetrics {
    return this.state.metrics;
  }

  getPhaseHistory(): PhaseTransition[] {
    return this.state.phase_history;
  }

  // Helper methods (simplified implementations)
  private recordTransition(from: WorkflowPhase | null, to: WorkflowPhase, success: boolean, artifacts: string[]): PhaseTransition {
    const transition: PhaseTransition = {
      from: from || WorkflowPhase.BRAINSTORM,
      to,
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.activePhaseStartTime,
      validation_passed: success,
      artifacts_generated: artifacts,
      context_preserved: true
    };

    this.state.phase_history.push(transition);
    return transition;
  }

  private getLastTransition(): PhaseTransition | null {
    return this.state.phase_history.length > 0 ? this.state.phase_history[this.state.phase_history.length - 1] : null;
  }

  private findLastSuccessfulPhase(): WorkflowPhase | null {
    for (let i = this.state.phase_history.length - 1; i >= 0; i--) {
      if (this.state.phase_history[i].validation_passed) {
        return this.state.phase_history[i].to;
      }
    }
    return null;
  }

  private getPhaseMetrics(phase: WorkflowPhase): any {
    return {
      completions: this.state.metrics.phases_completed.get(phase) || 0,
      average_duration: this.state.metrics.average_phase_duration.get(phase) || 0
    };
  }

  // Placeholder methods (would be fully implemented)
  private async generateApproaches(input: any, count: number): Promise<any[]> { return Array(count).fill({}); }
  private async evaluateApproaches(approaches: any[]): Promise<any> { return {}; }
  private selectTopApproaches(approaches: any[], matrix: any, count: number): any[] { return approaches.slice(0, count); }
  private calculateBrainstormConfidence(artifacts: any): number { return 85; }
  private async runAdaptiveQuestioning(approaches: any): Promise<any> { return { confidence: 85 }; }
  private async fillSRSTemplate(questioning: any): Promise<any> { return {}; }
  private async generateTestStrategies(spec: any): Promise<any[]> { return []; }
  private async validateSpecificationCompliance(spec: any): Promise<any> { return { compliant: true, violations: [] }; }
  private async shardDocument(spec: any): Promise<any> { return { shards: [], navigation: {}, cross_references: [] }; }
  private calculateShardingMetrics(artifacts: any): any { return { size_reduction: 75 }; }
  private async generateTasksFromShard(shard: any): Promise<any[]> { return []; }
  private calculateTaskConfidence(task: any): number { return 80; }
  private generateDependencyGraph(tasks: any[]): any { return {}; }
  private calculateCriticalPath(graph: any): any[] { return []; }
  private async validateTaskContext(task: any): Promise<any> { return { complete: true }; }
  private async loadTask(taskId: string): Promise<any> { return {}; }
  private async enforceTDDCycle(task: any): Promise<any> { return { tests: {}, implementation: {} }; }
  private async calculateCoverage(impl: any, tests: any): Promise<any> { return { percentage: 85 }; }
  private extractDecisions(tddResult: any): any[] { return []; }
  private async saveArtifacts(phase: string, artifacts: any): Promise<void> { }
  private async loadArtifact(phase: string, name: string): Promise<any> { return {}; }
  private async hasArtifact(name: string): Promise<boolean> { return true; }
  private async validateApproachQuality(): Promise<ValidationResult> { return { passed: true }; }
  private async aggregateHandoffArtifacts(toTransfer: string[], artifacts: string[]): Promise<any> { return {}; }
  private async embedHandoffContext(toEmbed: string[], artifacts: any): Promise<any> { return {}; }
  private async saveHandoffPackage(handoff: HandoffPackage): Promise<void> { }
  private async handlePhaseFailure(phase: WorkflowPhase, error: any): Promise<any> { return { retry: false, rollback: false }; }
  private async restorePhaseState(phase: WorkflowPhase): Promise<void> { }
  private async clearPhaseArtifacts(phase: WorkflowPhase): Promise<void> { }
  private savePhaseResult(phase: WorkflowPhase, result: any): void { }
  private addSpecifyPhaseDefinition(definitions: Map<WorkflowPhase, PhaseDefinition>): void { }
  private addShardPhaseDefinition(definitions: Map<WorkflowPhase, PhaseDefinition>): void { }
  private addDecomposePhaseDefinition(definitions: Map<WorkflowPhase, PhaseDefinition>): void { }
  private addImplementPhaseDefinition(definitions: Map<WorkflowPhase, PhaseDefinition>): void { }
}
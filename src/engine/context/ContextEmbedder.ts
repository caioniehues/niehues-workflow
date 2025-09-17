import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

export interface EmbeddingOptions {
  strategy: 'adaptive' | 'full' | 'minimal';
  maxContextSize: number;
  confidenceThreshold: number;
  includeExtended: boolean;
  preserveReferences: boolean;
}

export interface SmartContext {
  strategy: 'adaptive';

  core_context: {
    // Always included (200-500 lines)
    direct_requirements: Requirement[];
    acceptance_criteria: Criterion[];
    immediate_dependencies: Dependency[];
    task_metadata: TaskMeta;
    constitutional_requirements: ConstitutionalRule[];
  };

  extended_context?: {
    // Added when confidence < 85% (500-1000 lines)
    related_patterns: Pattern[];
    historical_decisions: Decision[];
    edge_cases: EdgeCase[];
    similar_implementations: Example[];
    technical_notes: TechnicalNote[];
  };

  reference_context: {
    // Links only (10-20 lines)
    full_specification: string;  // Path
    architecture_docs: string[];  // Paths
    previous_tasks: string[];     // Task IDs
    related_shards: string[];     // Shard IDs
  };
}

export interface ContextMetrics {
  total_size: number;
  core_size: number;
  extended_size: number;
  reference_size: number;
  confidence_impact: number;
  reusability_score: number;
}

export interface TaskWithContext {
  id: string;
  title: string;
  epic: string;
  story: string;
  embedded_context: SmartContext;
  context_size: number;
  confidence: number;
  status: string;
  dependencies: string[];
}

export interface Task {
  id: string;
  title: string;
  epic: string;
  story?: string;
  type: string;
  complexity: 'simple' | 'medium' | 'complex';
  dependencies: string[];
  technical_requirements: any;
  technical_approach?: string;
  shard_id?: string;
}

export interface Shard {
  id: string;
  epic_id: string;
  requirements: Requirement[];
  acceptance_criteria: Criterion[];
}

export interface Requirement {
  id: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: 'functional' | 'non-functional';
}

export interface Criterion {
  id: string;
  description: string;
  given: string;
  when: string;
  then: string;
}

export interface Dependency {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
  type: 'data' | 'service' | 'interface';
}

export interface TaskMeta {
  created: string;
  epic: string;
  story?: string;
  priority: string;
  estimated_effort: string;
}

export interface ConstitutionalRule {
  rule: string;
  description: string;
  enforcement: 'blocking' | 'warning';
  source: string;
}

export interface Pattern {
  id: string;
  name: string;
  type: string;
  domain?: string;
  technical_approach?: string;
  success_rate: number;
  created: string;
  tags: string[];
  implementation_approach?: string;
  technical_context?: any;
  implementation_example?: Example;
  relevance_score?: number;
}

export interface Decision {
  id: string;
  title: string;
  epic?: string;
  story?: string;
  date: string;
  confidence: number;
  impact_level: number;
  technical_context?: any;
  affects_dependencies?: string[];
  inherited_from?: string;
}

export interface EdgeCase {
  id: string;
  description: string;
  severity: number;
  likelihood: number;
  mitigation: string;
}

export interface Example {
  id: string;
  title: string;
  code: string;
  framework: string;
  approach: string;
  relevance_score?: number;
}

export interface TechnicalNote {
  id: string;
  content: string;
  type: 'architecture' | 'performance' | 'security' | 'implementation';
  source: string;
}

export interface ValidationResult {
  complete: boolean;
  missing: string[];
  warnings: string[];
  score: number;
}

export interface ContextReport {
  task_id: string;
  confidence: number;
  context_size: number;
  metrics: ContextMetrics;
  validation: ValidationResult;
  recommendations: string[];
}

export class ContextEmbedder {
  private options: EmbeddingOptions;
  private contextCache: Map<string, any> = new Map();
  private patternLibrary: Pattern[] = [];
  private decisionHistory: Decision[] = [];

  constructor(options: Partial<EmbeddingOptions> = {}) {
    this.options = {
      strategy: 'adaptive',
      maxContextSize: 2000,
      confidenceThreshold: 85,
      includeExtended: true,
      preserveReferences: true,
      ...options
    };

    this.loadPatternLibrary();
    this.loadDecisionHistory();
  }

  async embedContext(
    task: Task,
    shard: Shard,
    confidence: number,
    previousTask?: TaskWithContext
  ): Promise<TaskWithContext> {
    console.log(`🔄 Embedding context for task ${task.id} (confidence: ${confidence}%)`);

    // 1. Aggregate core context (always included)
    const coreContext = await this.extractCoreContext(task, shard);

    // 2. Determine if extended context is needed
    const needsExtended = this.shouldIncludeExtended(confidence, task);

    // 3. Build smart context
    const smartContext: SmartContext = {
      strategy: 'adaptive',
      core_context: coreContext,
      reference_context: this.buildReferences(task, shard)
    };

    // 4. Add extended context if needed
    if (needsExtended) {
      smartContext.extended_context = await this.extractExtendedContext(
        task,
        shard,
        confidence,
        previousTask
      );
    }

    // 5. Inherit context from previous task
    if (previousTask) {
      smartContext = await this.inheritFromPrevious(smartContext, previousTask);
    }

    // 6. Optimize context size
    const optimizedContext = await this.optimizeContextSize(smartContext);

    // 7. Calculate final metrics
    const contextSize = this.calculateContextSize(optimizedContext);
    const finalConfidence = this.recalculateConfidence(confidence, optimizedContext);

    const taskWithContext: TaskWithContext = {
      ...task,
      embedded_context: optimizedContext,
      context_size: contextSize,
      confidence: finalConfidence
    };

    console.log(`✅ Context embedded: ${contextSize} lines, confidence: ${finalConfidence}%`);
    return taskWithContext;
  }

  private async extractCoreContext(
    task: Task,
    shard: Shard
  ): Promise<SmartContext['core_context']> {
    // Extract direct requirements relevant to this task
    const directRequirements = this.extractRelevantRequirements(shard.requirements, task);

    // Extract acceptance criteria
    const acceptanceCriteria = this.extractAcceptanceCriteria(shard.acceptance_criteria, task);

    // Map immediate dependencies
    const immediateDependencies = await this.mapImmediateDependencies(task);

    // Extract task metadata
    const taskMetadata = this.extractTaskMetadata(task, shard);

    // Add constitutional requirements
    const constitutionalRequirements = this.getConstitutionalRequirements();

    return {
      direct_requirements: directRequirements,
      acceptance_criteria: acceptanceCriteria,
      immediate_dependencies: immediateDependencies,
      task_metadata: taskMetadata,
      constitutional_requirements: constitutionalRequirements
    };
  }

  private async extractExtendedContext(
    task: Task,
    shard: Shard,
    confidence: number,
    previousTask?: TaskWithContext
  ): Promise<SmartContext['extended_context']> {
    // Find related patterns from pattern library
    const relatedPatterns = await this.findRelatedPatterns(task);

    // Extract relevant historical decisions
    const historicalDecisions = this.findRelevantDecisions(task);

    // Identify edge cases
    const edgeCases = await this.identifyEdgeCases(task, shard.acceptance_criteria);

    // Find similar implementations
    const similarImplementations = await this.findSimilarImplementations(task);

    // Extract technical notes
    const technicalNotes = this.extractTechnicalNotes(shard, task);

    return {
      related_patterns: relatedPatterns,
      historical_decisions: historicalDecisions,
      edge_cases: edgeCases,
      similar_implementations: similarImplementations,
      technical_notes: technicalNotes
    };
  }

  private shouldIncludeExtended(confidence: number, task: Task): boolean {
    // Always include if confidence below threshold
    if (confidence < this.options.confidenceThreshold) return true;

    // Include for complex tasks
    if (task.complexity === 'complex') return true;

    // Include if task has many dependencies
    if (task.dependencies && task.dependencies.length > 3) return true;

    // Include if no similar patterns found
    if (!this.hasExistingPatterns(task)) return true;

    return false;
  }

  private async inheritFromPrevious(
    currentContext: SmartContext,
    previousTask: TaskWithContext
  ): Promise<SmartContext> {
    console.log(`📋 Inheriting context from ${previousTask.id}`);

    // Extract relevant decisions from previous task
    const relevantDecisions = this.extractRelevantDecisions(
      previousTask.embedded_context.extended_context?.historical_decisions || [],
      currentContext.core_context.direct_requirements
    );

    // Extract successful patterns
    const successfulPatterns = this.extractSuccessfulPatterns(
      previousTask.embedded_context.extended_context?.related_patterns || []
    );

    // Extract technical insights
    const technicalInsights = this.extractTechnicalInsights(
      previousTask.embedded_context.extended_context?.technical_notes || []
    );

    // Merge into current context
    if (currentContext.extended_context) {
      currentContext.extended_context.historical_decisions = [
        ...currentContext.extended_context.historical_decisions,
        ...relevantDecisions
      ];

      currentContext.extended_context.related_patterns = [
        ...currentContext.extended_context.related_patterns,
        ...successfulPatterns
      ];

      currentContext.extended_context.technical_notes = [
        ...currentContext.extended_context.technical_notes,
        ...technicalInsights
      ];
    } else {
      currentContext.extended_context = {
        related_patterns: successfulPatterns,
        historical_decisions: relevantDecisions,
        edge_cases: [],
        similar_implementations: [],
        technical_notes: technicalInsights
      };
    }

    return currentContext;
  }

  private async optimizeContextSize(context: SmartContext): Promise<SmartContext> {
    const currentSize = this.calculateContextSize(context);

    if (currentSize <= this.options.maxContextSize) {
      return context; // No optimization needed
    }

    console.log(`🔧 Optimizing context size: ${currentSize} → ${this.options.maxContextSize} lines`);

    // Priority order: Core > Extended > Reference
    const optimized: SmartContext = {
      strategy: context.strategy,
      core_context: context.core_context, // Always preserve core
      reference_context: context.reference_context // Always preserve references
    };

    // Calculate remaining space after core and reference
    const coreSize = this.calculateCoreSize(context.core_context);
    const refSize = this.calculateReferenceSize(context.reference_context);
    const availableForExtended = this.options.maxContextSize - coreSize - refSize;

    // Trim extended context to fit
    if (context.extended_context && availableForExtended > 0) {
      optimized.extended_context = this.trimExtendedContext(
        context.extended_context,
        availableForExtended
      );
    }

    return optimized;
  }

  private trimExtendedContext(
    extended: SmartContext['extended_context'],
    maxSize: number
  ): SmartContext['extended_context'] {
    if (!extended) return undefined;

    // Prioritize by relevance and utility
    const prioritized = {
      related_patterns: this.prioritizePatterns(extended.related_patterns).slice(0, 3),
      historical_decisions: this.prioritizeDecisions(extended.historical_decisions).slice(0, 5),
      edge_cases: this.prioritizeEdgeCases(extended.edge_cases).slice(0, 5),
      similar_implementations: extended.similar_implementations.slice(0, 2),
      technical_notes: this.prioritizeTechnicalNotes(extended.technical_notes).slice(0, 3)
    };

    // Calculate size and trim further if needed
    let currentSize = this.calculateExtendedSize(prioritized);

    // Trim least important items if still too large
    while (currentSize > maxSize && this.canTrimMore(prioritized)) {
      prioritized.similar_implementations = prioritized.similar_implementations.slice(0, -1);
      prioritized.edge_cases = prioritized.edge_cases.slice(0, -1);
      currentSize = this.calculateExtendedSize(prioritized);
    }

    return prioritized;
  }

  // Core context extraction methods
  private extractRelevantRequirements(requirements: Requirement[], task: Task): Requirement[] {
    return requirements.filter(req => {
      // Filter requirements relevant to this specific task
      const taskKeywords = task.title.toLowerCase().split(' ');
      const reqText = req.description.toLowerCase();

      return taskKeywords.some(keyword => reqText.includes(keyword)) ||
             req.type === 'functional' && task.type === 'feature' ||
             req.priority === 'critical';
    }).slice(0, 10); // Limit to top 10 requirements
  }

  private extractAcceptanceCriteria(criteria: Criterion[], task: Task): Criterion[] {
    return criteria.filter(criterion => {
      // Filter criteria relevant to this task
      const taskKeywords = task.title.toLowerCase().split(' ');
      const criterionText = criterion.description.toLowerCase();

      return taskKeywords.some(keyword => criterionText.includes(keyword));
    }).slice(0, 8); // Limit to top 8 criteria
  }

  private async mapImmediateDependencies(task: Task): Promise<Dependency[]> {
    const dependencies: Dependency[] = [];

    for (const depId of task.dependencies) {
      // This would typically load dependency information from STM or file system
      dependencies.push({
        id: depId,
        title: `Dependency ${depId}`,
        status: 'pending', // Would be loaded from actual dependency status
        type: 'interface' // Would be determined from dependency analysis
      });
    }

    return dependencies;
  }

  private extractTaskMetadata(task: Task, shard: Shard): TaskMeta {
    return {
      created: new Date().toISOString(),
      epic: task.epic,
      story: task.story,
      priority: 'medium', // Would be extracted from task priority
      estimated_effort: '4 hours' // Would be calculated from complexity
    };
  }

  private getConstitutionalRequirements(): ConstitutionalRule[] {
    return [
      {
        rule: 'TDD_MANDATORY',
        description: 'Tests MUST be written before implementation',
        enforcement: 'blocking',
        source: 'Constitution Article I'
      },
      {
        rule: 'COVERAGE_MINIMUM',
        description: 'Test coverage minimum: 80%',
        enforcement: 'warning',
        source: 'Constitution Article I'
      },
      {
        rule: 'NO_IMPLICIT_DECISIONS',
        description: 'No implicit decisions allowed',
        enforcement: 'blocking',
        source: 'Constitution Article II'
      },
      {
        rule: 'CONTEXT_PRESERVATION',
        description: 'Every task must have embedded context',
        enforcement: 'blocking',
        source: 'Constitution Article IV'
      }
    ];
  }

  // Extended context extraction methods
  private async findRelatedPatterns(task: Task): Promise<Pattern[]> {
    const patterns: Pattern[] = [];

    // Search pattern library by task type
    const typePatterns = this.patternLibrary.filter(p =>
      p.type === task.type || p.tags.includes(task.epic)
    );

    // Search by implementation approach
    const approachPatterns = this.patternLibrary.filter(p =>
      p.implementation_approach &&
      this.isApproachRelevant(p.implementation_approach, task)
    );

    // Search by technical context
    const techPatterns = this.patternLibrary.filter(p =>
      p.technical_context &&
      this.hasTechnicalOverlap(p.technical_context, task.technical_requirements)
    );

    // Combine and deduplicate
    const allPatterns = [...typePatterns, ...approachPatterns, ...techPatterns];
    const uniquePatterns = this.deduplicatePatterns(allPatterns);

    // Score and sort by relevance
    return this.scorePatternsByRelevance(uniquePatterns, task)
      .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
      .slice(0, 5); // Top 5 patterns
  }

  private findRelevantDecisions(task: Task): Decision[] {
    return this.decisionHistory.filter(decision => {
      // Same epic or story
      if (decision.epic === task.epic || decision.story === task.story) return true;

      // Similar technical context
      if (this.hasTechnicalOverlap(decision.technical_context, task.technical_requirements)) return true;

      // Related dependencies
      if (decision.affects_dependencies?.some(dep => task.dependencies?.includes(dep))) return true;

      return false;
    }).slice(0, 10); // Most recent relevant decisions
  }

  private async identifyEdgeCases(
    task: Task,
    acceptanceCriteria: Criterion[]
  ): Promise<EdgeCase[]> {
    const edgeCases: EdgeCase[] = [];

    // Error scenarios
    if (this.involvesIO(task)) {
      edgeCases.push(...this.generateIOEdgeCases(task));
    }

    // Concurrency issues
    if (this.involvesAsync(task)) {
      edgeCases.push(...this.generateConcurrencyEdgeCases(task));
    }

    // Security concerns
    if (this.involvesUserInput(task)) {
      edgeCases.push(...this.generateSecurityEdgeCases(task));
    }

    // Business logic edge cases from acceptance criteria
    for (const criterion of acceptanceCriteria) {
      edgeCases.push(...this.extractEdgeCasesFromCriterion(criterion));
    }

    // Performance edge cases
    if (this.hasPerformanceRequirements(task)) {
      edgeCases.push(...this.generatePerformanceEdgeCases(task));
    }

    return edgeCases.slice(0, 10); // Top 10 edge cases
  }

  private async findSimilarImplementations(task: Task): Promise<Example[]> {
    const examples: Example[] = [];

    // Search codebase for similar implementations
    const codebaseExamples = await this.searchCodebaseForSimilar(task);
    examples.push(...codebaseExamples);

    // Search pattern library for implementations
    const patternExamples = this.patternLibrary
      .filter(p => p.implementation_example)
      .map(p => p.implementation_example!)
      .filter(ex => this.isImplementationRelevant(ex, task));

    examples.push(...patternExamples);

    // External examples from documentation
    const docExamples = await this.searchDocumentationForExamples(task);
    examples.push(...docExamples);

    return this.scoreExamplesByRelevance(examples, task)
      .slice(0, 3); // Top 3 examples
  }

  private extractTechnicalNotes(shard: Shard, task: Task): TechnicalNote[] {
    // Extract technical notes from shard and task context
    return [
      {
        id: 'note-1',
        content: `Task ${task.id} requires ${task.technical_approach || 'standard'} approach`,
        type: 'implementation',
        source: 'task_analysis'
      }
    ];
  }

  // Context size calculation methods
  private calculateContextSize(context: SmartContext): number {
    const coreSize = this.calculateCoreSize(context.core_context);
    const extendedSize = context.extended_context ?
      this.calculateExtendedSize(context.extended_context) : 0;
    const referenceSize = this.calculateReferenceSize(context.reference_context);

    return coreSize + extendedSize + referenceSize;
  }

  private calculateCoreSize(core: SmartContext['core_context']): number {
    let size = 0;

    // Requirements (each ~3-5 lines)
    size += core.direct_requirements.length * 4;

    // Acceptance criteria (each ~2-3 lines)
    size += core.acceptance_criteria.length * 2.5;

    // Dependencies (each ~2 lines)
    size += core.immediate_dependencies.length * 2;

    // Task metadata (~10 lines)
    size += 10;

    // Constitutional requirements (~15 lines)
    size += 15;

    return Math.round(size);
  }

  private calculateExtendedSize(extended: SmartContext['extended_context']): number {
    if (!extended) return 0;

    let size = 0;

    // Patterns (each ~20-30 lines with code)
    size += extended.related_patterns.length * 25;

    // Historical decisions (each ~10-15 lines)
    size += extended.historical_decisions.length * 12;

    // Edge cases (each ~5-8 lines)
    size += extended.edge_cases.length * 6;

    // Similar implementations (each ~15-25 lines)
    size += extended.similar_implementations.length * 20;

    // Technical notes (each ~8-12 lines)
    size += extended.technical_notes.length * 10;

    return Math.round(size);
  }

  private calculateReferenceSize(reference: SmartContext['reference_context']): number {
    // References are just links, minimal size
    let size = 5; // Base structure
    size += reference.architecture_docs.length * 1; // 1 line per doc link
    size += reference.previous_tasks.length * 1; // 1 line per task link
    size += reference.related_shards.length * 1; // 1 line per shard link

    return Math.round(size);
  }

  // Utility and helper methods
  private buildReferences(task: Task, shard: Shard): SmartContext['reference_context'] {
    return {
      full_specification: `../specs/sharded/epics/${shard.epic_id}.md`,
      architecture_docs: this.getArchitectureDocs(task.epic),
      previous_tasks: this.getPreviousTaskIds(task.dependencies),
      related_shards: this.getRelatedShardIds(shard)
    };
  }

  private recalculateConfidence(
    originalConfidence: number,
    context: SmartContext
  ): number {
    let confidence = originalConfidence;

    // Boost confidence based on context quality
    if (context.extended_context) {
      if (context.extended_context.related_patterns.length > 0) confidence += 5;
      if (context.extended_context.similar_implementations.length > 0) confidence += 5;
      if (context.extended_context.historical_decisions.length > 0) confidence += 3;
    }

    // Boost for complete core context
    if (context.core_context.direct_requirements.length > 0) confidence += 2;
    if (context.core_context.acceptance_criteria.length > 0) confidence += 3;

    return Math.min(confidence, 100);
  }

  // Validation methods
  async validateContextCompleteness(taskWithContext: TaskWithContext): Promise<ValidationResult> {
    const validation: ValidationResult = {
      complete: true,
      missing: [],
      warnings: [],
      score: 100
    };

    // Check core context completeness
    const core = taskWithContext.embedded_context.core_context;

    if (core.direct_requirements.length === 0) {
      validation.missing.push('direct_requirements');
      validation.score -= 20;
    }

    if (core.acceptance_criteria.length === 0) {
      validation.missing.push('acceptance_criteria');
      validation.score -= 25;
    }

    if (core.immediate_dependencies.length === 0 && taskWithContext.dependencies.length > 0) {
      validation.warnings.push('Dependencies declared but not mapped in context');
      validation.score -= 5;
    }

    // Check extended context appropriateness
    if (taskWithContext.confidence < 85 && !taskWithContext.embedded_context.extended_context) {
      validation.warnings.push('Low confidence but no extended context provided');
      validation.score -= 10;
    }

    // Check context size efficiency
    if (taskWithContext.context_size > this.options.maxContextSize) {
      validation.warnings.push(`Context size exceeds limit: ${taskWithContext.context_size}`);
      validation.score -= 15;
    }

    validation.complete = validation.missing.length === 0;

    return validation;
  }

  // Helper methods with simplified implementations
  private loadPatternLibrary(): void {
    const patternPath = '.nexus/patterns/pattern-library.json';
    if (existsSync(patternPath)) {
      try {
        const patternData = readFileSync(patternPath, 'utf8');
        this.patternLibrary = JSON.parse(patternData);
      } catch (error) {
        console.warn('Failed to load pattern library:', error.message);
        this.patternLibrary = [];
      }
    }
  }

  private loadDecisionHistory(): void {
    const decisionPath = '.nexus/decision-log.json';
    if (existsSync(decisionPath)) {
      try {
        const decisionData = readFileSync(decisionPath, 'utf8');
        this.decisionHistory = JSON.parse(decisionData);
      } catch (error) {
        console.warn('Failed to load decision history:', error.message);
        this.decisionHistory = [];
      }
    }
  }

  private hasExistingPatterns(task: Task): boolean {
    return this.patternLibrary.some(p => p.type === task.type);
  }

  private scorePatternsByRelevance(patterns: Pattern[], task: Task): Pattern[] {
    return patterns.map(pattern => ({
      ...pattern,
      relevance_score: this.calculatePatternRelevance(pattern, task)
    }));
  }

  private calculatePatternRelevance(pattern: Pattern, task: Task): number {
    let score = 0;

    // Type match
    if (pattern.type === task.type) score += 30;

    // Epic/domain match
    if (pattern.domain === task.epic) score += 25;

    // Technical approach match
    if (pattern.technical_approach === task.technical_approach) score += 20;

    // Success rate
    score += pattern.success_rate * 15;

    // Recency (more recent patterns score higher)
    const ageInDays = (Date.now() - new Date(pattern.created).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 10 - ageInDays * 0.1);

    return Math.round(score);
  }

  // Prioritization methods
  private prioritizePatterns(patterns: Pattern[]): Pattern[] {
    return patterns.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
  }

  private prioritizeDecisions(decisions: Decision[]): Decision[] {
    return decisions.sort((a, b) => {
      const scoreA = a.confidence * 0.4 + this.getRecencyScore(a.date) * 0.3 + a.impact_level * 0.3;
      const scoreB = b.confidence * 0.4 + this.getRecencyScore(b.date) * 0.3 + b.impact_level * 0.3;
      return scoreB - scoreA;
    });
  }

  private prioritizeEdgeCases(edgeCases: EdgeCase[]): EdgeCase[] {
    return edgeCases.sort((a, b) => {
      const scoreA = a.severity * 0.6 + a.likelihood * 0.4;
      const scoreB = b.severity * 0.6 + b.likelihood * 0.4;
      return scoreB - scoreA;
    });
  }

  private prioritizeTechnicalNotes(notes: TechnicalNote[]): TechnicalNote[] {
    return notes.sort((a, b) => {
      const priorities = { 'architecture': 4, 'implementation': 3, 'security': 2, 'performance': 1 };
      return priorities[b.type] - priorities[a.type];
    });
  }

  // Simplified helper methods (would be fully implemented in production)
  private isApproachRelevant(approach: string, task: Task): boolean { return true; }
  private hasTechnicalOverlap(context1: any, context2: any): boolean { return false; }
  private deduplicatePatterns(patterns: Pattern[]): Pattern[] { return patterns; }
  private extractRelevantDecisions(decisions: Decision[], requirements: Requirement[]): Decision[] { return decisions; }
  private extractSuccessfulPatterns(patterns: Pattern[]): Pattern[] { return patterns; }
  private extractTechnicalInsights(notes: TechnicalNote[]): TechnicalNote[] { return notes; }
  private canTrimMore(extended: any): boolean { return extended.similar_implementations.length > 0; }
  private involvesIO(task: Task): boolean { return task.type.includes('api') || task.type.includes('data'); }
  private involvesAsync(task: Task): boolean { return task.type.includes('async') || task.type.includes('concurrent'); }
  private involvesUserInput(task: Task): boolean { return task.type.includes('form') || task.type.includes('input'); }
  private hasPerformanceRequirements(task: Task): boolean { return task.type.includes('performance') || task.complexity === 'complex'; }
  private generateIOEdgeCases(task: Task): EdgeCase[] { return []; }
  private generateConcurrencyEdgeCases(task: Task): EdgeCase[] { return []; }
  private generateSecurityEdgeCases(task: Task): EdgeCase[] { return []; }
  private generatePerformanceEdgeCases(task: Task): EdgeCase[] { return []; }
  private extractEdgeCasesFromCriterion(criterion: Criterion): EdgeCase[] { return []; }
  private async searchCodebaseForSimilar(task: Task): Promise<Example[]> { return []; }
  private isImplementationRelevant(example: Example, task: Task): boolean { return true; }
  private async searchDocumentationForExamples(task: Task): Promise<Example[]> { return []; }
  private scoreExamplesByRelevance(examples: Example[], task: Task): Example[] { return examples; }
  private getArchitectureDocs(epic: string): string[] { return [`docs/architecture/${epic}.md`]; }
  private getPreviousTaskIds(dependencies: string[]): string[] { return dependencies; }
  private getRelatedShardIds(shard: Shard): string[] { return []; }
  private getRecencyScore(date: string): number { return 1; }
}
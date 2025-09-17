import * as fs from 'fs-extra';
import * as path from 'path';

export interface InheritedContext {
  decisions: Decision[];
  successful_patterns: Pattern[];
  insights: Insight[];
  technical_context: TechnicalContext;
  metadata: {
    inherited_from: string[];
    inheritance_depth: number;
    relevance_score: number;
    cache_timestamp: string;
    context_version: string;
  };
}

export interface Decision {
  id: string;
  context: string;
  options_considered: string[];
  decision: string;
  rationale: string;
  confidence: number;
  timestamp: Date;
  impact: 'low' | 'medium' | 'high';
  tags: string[];
  success_indicators: string[];
  lessons_learned: string[];
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  implementation: string;
  success_rate: number;
  use_count: number;
  last_used: Date;
  applicable_to: string[];
  performance_impact: 'positive' | 'neutral' | 'negative';
  complexity_level: 'simple' | 'medium' | 'complex';
  maintenance_burden: 'low' | 'medium' | 'high';
}

export interface Insight {
  type: 'insight' | 'warning' | 'lesson' | 'tip' | 'antipattern';
  content: string;
  source_task: string;
  importance: number; // 0-10
  timestamp: Date;
  category: string;
  actionable: boolean;
  context_tags: string[];
}

export interface TechnicalContext {
  technologies_used: TechnologyUsage[];
  architectural_decisions: ArchitecturalDecision[];
  api_contracts: APIContract[];
  database_schemas: DatabaseSchema[];
  configuration: ConfigurationSet;
  performance_benchmarks: PerformanceBenchmark[];
  security_considerations: SecurityConsideration[];
}

export interface TechnologyUsage {
  technology: string;
  version: string;
  purpose: string;
  satisfaction_score: number; // 0-10
  alternative_considered: string[];
  adoption_challenges: string[];
}

export interface ArchitecturalDecision {
  decision: string;
  context: string;
  consequences: string[];
  status: 'active' | 'superseded' | 'deprecated';
  related_patterns: string[];
}

export interface APIContract {
  endpoint: string;
  method: string;
  request_schema: any;
  response_schema: any;
  error_scenarios: string[];
  performance_characteristics: string[];
}

export interface DatabaseSchema {
  table_name: string;
  schema_definition: any;
  indexes: string[];
  relationships: string[];
  performance_notes: string[];
}

export interface ConfigurationSet {
  environment: Record<string, any>;
  application: Record<string, any>;
  deployment: Record<string, any>;
  monitoring: Record<string, any>;
}

export interface PerformanceBenchmark {
  metric: string;
  baseline: number;
  target: number;
  current: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface SecurityConsideration {
  category: string;
  description: string;
  mitigation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'mitigated' | 'accepted';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  requirements?: string[];
  phase?: string;
  complexity?: string;
  domain?: string;
}

export interface TaskWithContext extends Task {
  decisions?: Decision[];
  patterns?: Pattern[];
  completion_notes?: CompletionNote[];
  technical_decisions?: any;
  inherited_context?: InheritedContext;
  performance_metrics?: any;
  quality_metrics?: any;
}

export interface CompletionNote {
  id: string;
  type: 'insight' | 'warning' | 'lesson' | 'note' | 'problem' | 'solution';
  content: string;
  task_id?: string;
  timestamp?: Date;
  category?: string;
  importance?: number;
  related_decisions?: string[];
}

export class ContextInheritance {
  private readonly RELEVANCE_THRESHOLD = 0.6;
  private readonly MAX_INHERITANCE_DEPTH = 5;
  private readonly CACHE_EXPIRY_HOURS = 24;
  private readonly VERSION = '1.0.0';

  private inheritanceCache: Map<string, InheritedContext> = new Map();
  private patternAnalyzer: PatternAnalyzer;
  private relevanceCalculator: RelevanceCalculator;

  constructor() {
    this.patternAnalyzer = new PatternAnalyzer();
    this.relevanceCalculator = new RelevanceCalculator();
  }

  async inheritFromPrevious(
    currentTask: Task,
    previousTask: TaskWithContext
  ): Promise<InheritedContext> {
    console.log(`🧬 Inheriting context from task: ${previousTask.id}`);

    // Check cache first
    const cacheKey = this.generateCacheKey(currentTask.id, previousTask.id);
    const cachedResult = this.getCachedInheritance(cacheKey);
    if (cachedResult) {
      console.log('  ✓ Using cached inheritance');
      return cachedResult;
    }

    console.log('  🔍 Analyzing inheritance compatibility...');

    // Phase 1: Filter relevant decisions
    const relevantDecisions = this.filterRelevantDecisions(
      previousTask.decisions || [],
      currentTask
    );
    console.log(`  ✓ Found ${relevantDecisions.length} relevant decisions`);

    // Phase 2: Extract successful patterns
    const successfulPatterns = this.extractSuccessfulPatterns(
      previousTask.patterns || [],
      currentTask
    );
    console.log(`  ✓ Extracted ${successfulPatterns.length} successful patterns`);

    // Phase 3: Collect valuable insights
    const insights = this.extractInsights(
      previousTask.completion_notes || [],
      currentTask
    );
    console.log(`  ✓ Collected ${insights.length} insights`);

    // Phase 4: Inherit technical context
    const technicalContext = this.extractRelevantTechnical(
      previousTask.technical_decisions || {},
      currentTask.requirements || []
    );
    console.log(`  ✓ Inherited technical context with ${technicalContext.technologies_used.length} technologies`);

    // Phase 5: Build inheritance metadata
    const inheritedContext: InheritedContext = {
      decisions: relevantDecisions,
      successful_patterns: successfulPatterns,
      insights,
      technical_context: technicalContext,
      metadata: {
        inherited_from: [previousTask.id],
        inheritance_depth: this.calculateDepth(previousTask),
        relevance_score: this.calculateRelevance(
          relevantDecisions,
          successfulPatterns,
          currentTask
        ),
        cache_timestamp: new Date().toISOString(),
        context_version: this.VERSION
      }
    };

    // Cache the result
    this.cacheInheritance(cacheKey, inheritedContext);

    const score = inheritedContext.metadata.relevance_score;
    console.log(`  ✅ Inheritance complete (relevance: ${(score * 100).toFixed(1)}%)`);

    return inheritedContext;
  }

  async inheritFromChain(
    currentTask: Task,
    taskChain: TaskWithContext[]
  ): Promise<InheritedContext> {
    console.log(`🔗 Inheriting from task chain (${taskChain.length} tasks)`);

    if (taskChain.length === 0) {
      return this.createEmptyInheritance();
    }

    if (taskChain.length === 1) {
      return this.inheritFromPrevious(currentTask, taskChain[0]);
    }

    const allDecisions: Decision[] = [];
    const allPatterns: Pattern[] = [];
    const allInsights: Insight[] = [];
    const inheritedFrom: string[] = [];
    const technicalContexts: any[] = [];

    // Process each task in the chain
    for (const task of taskChain) {
      console.log(`  📋 Processing task: ${task.id}`);

      const context = await this.inheritFromPrevious(currentTask, task);

      // Merge decisions (avoid duplicates)
      for (const decision of context.decisions) {
        if (!allDecisions.find(d => d.id === decision.id)) {
          allDecisions.push(decision);
        }
      }

      // Merge patterns (update success rates with weighted average)
      for (const pattern of context.successful_patterns) {
        const existing = allPatterns.find(p => p.id === pattern.id);
        if (existing) {
          // Update with weighted average based on use count
          const totalUse = existing.use_count + pattern.use_count;
          existing.success_rate = (
            (existing.success_rate * existing.use_count) +
            (pattern.success_rate * pattern.use_count)
          ) / totalUse;
          existing.use_count = totalUse;
          existing.last_used = new Date(Math.max(
            existing.last_used.getTime(),
            pattern.last_used.getTime()
          ));
        } else {
          allPatterns.push(pattern);
        }
      }

      // Collect all insights
      allInsights.push(...context.insights);
      inheritedFrom.push(task.id);

      if (task.technical_decisions) {
        technicalContexts.push(task.technical_decisions);
      }
    }

    // Optimize collections by relevance and importance
    const optimizedDecisions = this.optimizeDecisions(allDecisions, currentTask);
    const optimizedPatterns = this.optimizePatterns(allPatterns, currentTask);
    const optimizedInsights = this.optimizeInsights(allInsights, currentTask);

    const mergedTechnicalContext = this.mergeTechnicalContexts(technicalContexts);

    const chainInheritance: InheritedContext = {
      decisions: optimizedDecisions,
      successful_patterns: optimizedPatterns,
      insights: optimizedInsights,
      technical_context: mergedTechnicalContext,
      metadata: {
        inherited_from: inheritedFrom,
        inheritance_depth: Math.min(taskChain.length, this.MAX_INHERITANCE_DEPTH),
        relevance_score: this.calculateChainRelevance(optimizedDecisions, optimizedPatterns),
        cache_timestamp: new Date().toISOString(),
        context_version: this.VERSION
      }
    };

    console.log(`  ✅ Chain inheritance complete:`);
    console.log(`    - Decisions: ${optimizedDecisions.length}`);
    console.log(`    - Patterns: ${optimizedPatterns.length}`);
    console.log(`    - Insights: ${optimizedInsights.length}`);
    console.log(`    - Relevance: ${(chainInheritance.metadata.relevance_score * 100).toFixed(1)}%`);

    return chainInheritance;
  }

  private filterRelevantDecisions(
    decisions: Decision[],
    currentTask: Task
  ): Decision[] {
    return decisions.filter(decision => {
      // Calculate multiple relevance factors
      const tagRelevance = this.relevanceCalculator.calculateTagOverlap(
        decision.tags,
        currentTask.tags || []
      );

      const contextSimilarity = this.relevanceCalculator.calculateTextSimilarity(
        decision.context,
        currentTask.description || ''
      );

      const domainRelevance = this.calculateDomainRelevance(decision, currentTask);

      // Weight by impact level
      const impactMultiplier = this.getImpactMultiplier(decision.impact);

      // Weight by confidence
      const confidenceWeight = decision.confidence / 100;

      // Composite relevance score
      const relevanceScore = (
        tagRelevance * 0.3 +
        contextSimilarity * 0.3 +
        domainRelevance * 0.2 +
        confidenceWeight * 0.2
      ) * impactMultiplier;

      return relevanceScore > this.RELEVANCE_THRESHOLD;
    }).sort((a, b) => b.confidence - a.confidence);
  }

  private extractSuccessfulPatterns(
    patterns: Pattern[],
    currentTask: Task
  ): Pattern[] {
    return patterns.filter(pattern => {
      // Only inherit high-success patterns
      if (pattern.success_rate < 0.8) return false;

      // Check applicability to current context
      const isApplicable = this.patternAnalyzer.isApplicableToTask(pattern, currentTask);

      // Consider maintenance burden
      const maintainabilityScore = this.calculateMaintainabilityScore(pattern);

      return isApplicable && maintainabilityScore > 0.6;
    }).sort((a, b) => {
      // Sort by success rate, then by recent usage, then by simplicity
      if (b.success_rate !== a.success_rate) {
        return b.success_rate - a.success_rate;
      }
      if (b.last_used.getTime() !== a.last_used.getTime()) {
        return b.last_used.getTime() - a.last_used.getTime();
      }
      // Prefer simpler patterns
      const complexityScore = (pattern: Pattern) =>
        pattern.complexity_level === 'simple' ? 3 :
        pattern.complexity_level === 'medium' ? 2 : 1;
      return complexityScore(b) - complexityScore(a);
    });
  }

  private extractInsights(
    completionNotes: CompletionNote[],
    currentTask: Task
  ): Insight[] {
    const insights: Insight[] = [];

    for (const note of completionNotes) {
      // Convert completion notes to structured insights
      if (note.type === 'insight' || note.type === 'warning') {
        insights.push({
          type: note.type,
          content: note.content,
          source_task: note.task_id || 'unknown',
          importance: this.calculateImportance(note, currentTask),
          timestamp: note.timestamp || new Date(),
          category: note.category || 'general',
          actionable: this.isActionable(note.content),
          context_tags: this.extractContextTags(note.content, currentTask)
        });
      }

      // Extract lessons learned from notes
      if (this.containsLessonIndicators(note.content)) {
        insights.push({
          type: 'lesson',
          content: note.content,
          source_task: note.task_id || 'unknown',
          importance: 7,
          timestamp: note.timestamp || new Date(),
          category: 'lesson_learned',
          actionable: true,
          context_tags: this.extractContextTags(note.content, currentTask)
        });
      }

      // Extract anti-patterns
      if (this.containsAntipatternIndicators(note.content)) {
        insights.push({
          type: 'antipattern',
          content: note.content,
          source_task: note.task_id || 'unknown',
          importance: 8,
          timestamp: note.timestamp || new Date(),
          category: 'antipattern',
          actionable: true,
          context_tags: ['antipattern', ...this.extractContextTags(note.content, currentTask)]
        });
      }
    }

    return insights.sort((a, b) => b.importance - a.importance);
  }

  private extractRelevantTechnical(
    technicalDecisions: any,
    requirements: string[]
  ): TechnicalContext {
    const context: TechnicalContext = {
      technologies_used: [],
      architectural_decisions: [],
      api_contracts: [],
      database_schemas: [],
      configuration: {
        environment: {},
        application: {},
        deployment: {},
        monitoring: {}
      },
      performance_benchmarks: [],
      security_considerations: []
    };

    // Extract and filter technologies
    if (technicalDecisions.technologies) {
      context.technologies_used = this.filterRelevantTechnologies(
        technicalDecisions.technologies,
        requirements
      );
    }

    // Extract architectural decisions
    if (technicalDecisions.architecture) {
      context.architectural_decisions = this.filterRelevantArchitecture(
        technicalDecisions.architecture,
        requirements
      );
    }

    // Extract API contracts if API-related requirements exist
    if (this.hasAPIRequirements(requirements) && technicalDecisions.api_contracts) {
      context.api_contracts = technicalDecisions.api_contracts;
    }

    // Extract database schemas if data-related requirements exist
    if (this.hasDataRequirements(requirements) && technicalDecisions.database_schemas) {
      context.database_schemas = technicalDecisions.database_schemas;
    }

    // Extract relevant configuration
    context.configuration = this.filterRelevantConfig(
      technicalDecisions.configuration || {},
      requirements
    );

    // Extract performance benchmarks if performance requirements exist
    if (this.hasPerformanceRequirements(requirements) && technicalDecisions.performance_benchmarks) {
      context.performance_benchmarks = technicalDecisions.performance_benchmarks;
    }

    // Extract security considerations if security requirements exist
    if (this.hasSecurityRequirements(requirements) && technicalDecisions.security_considerations) {
      context.security_considerations = technicalDecisions.security_considerations;
    }

    return context;
  }

  private optimizeDecisions(decisions: Decision[], currentTask: Task): Decision[] {
    // Sort by relevance and confidence, keep top 10
    return decisions
      .sort((a, b) => {
        const scoreA = this.calculateDecisionScore(a, currentTask);
        const scoreB = this.calculateDecisionScore(b, currentTask);
        return scoreB - scoreA;
      })
      .slice(0, 10);
  }

  private optimizePatterns(patterns: Pattern[], currentTask: Task): Pattern[] {
    // Sort by success rate and applicability, keep top 5
    return patterns
      .sort((a, b) => {
        const scoreA = this.calculatePatternScore(a, currentTask);
        const scoreB = this.calculatePatternScore(b, currentTask);
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }

  private optimizeInsights(insights: Insight[], currentTask: Task): Insight[] {
    // Group by type and keep most important from each category
    const grouped = insights.reduce((acc, insight) => {
      if (!acc[insight.type]) acc[insight.type] = [];
      acc[insight.type].push(insight);
      return acc;
    }, {} as Record<string, Insight[]>);

    const optimized: Insight[] = [];

    // Keep top insights from each category
    for (const [type, typeInsights] of Object.entries(grouped)) {
      const sortedInsights = typeInsights.sort((a, b) => b.importance - a.importance);
      const countToKeep = type === 'warning' || type === 'antipattern' ? 5 : 3;
      optimized.push(...sortedInsights.slice(0, countToKeep));
    }

    return optimized.slice(0, 15); // Total limit
  }

  // Helper methods for various calculations
  private calculateDepth(task: TaskWithContext): number {
    if (!task.inherited_context) return 1;
    const previousDepth = task.inherited_context.metadata?.inheritance_depth || 0;
    return Math.min(previousDepth + 1, this.MAX_INHERITANCE_DEPTH);
  }

  private calculateRelevance(
    decisions: Decision[],
    patterns: Pattern[],
    currentTask: Task
  ): number {
    const decisionWeight = 0.4;
    const patternWeight = 0.6;

    const avgDecisionConfidence = decisions.length > 0
      ? decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length / 100
      : 0;

    const avgPatternSuccess = patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.success_rate, 0) / patterns.length
      : 0;

    return (avgDecisionConfidence * decisionWeight) + (avgPatternSuccess * patternWeight);
  }

  private calculateChainRelevance(decisions: Decision[], patterns: Pattern[]): number {
    const avgConfidence = decisions.length > 0
      ? decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length
      : 0;

    const avgSuccess = patterns.length > 0
      ? patterns.reduce((sum, p) => sum + p.success_rate, 0) / patterns.length
      : 0;

    return (avgConfidence / 100 * 0.5) + (avgSuccess * 0.5);
  }

  private mergeTechnicalContexts(contexts: any[]): TechnicalContext {
    const merged: TechnicalContext = {
      technologies_used: [],
      architectural_decisions: [],
      api_contracts: [],
      database_schemas: [],
      configuration: {
        environment: {},
        application: {},
        deployment: {},
        monitoring: {}
      },
      performance_benchmarks: [],
      security_considerations: []
    };

    for (const ctx of contexts) {
      if (ctx.technologies) {
        this.mergeUniqueTechnologies(merged.technologies_used, ctx.technologies);
      }
      if (ctx.architecture) {
        merged.architectural_decisions.push(...ctx.architecture);
      }
      if (ctx.configuration) {
        this.mergeConfigurations(merged.configuration, ctx.configuration);
      }
      if (ctx.performance_benchmarks) {
        merged.performance_benchmarks.push(...ctx.performance_benchmarks);
      }
      if (ctx.security_considerations) {
        merged.security_considerations.push(...ctx.security_considerations);
      }
    }

    return merged;
  }

  // Persistence methods
  async saveInheritance(
    taskId: string,
    inheritance: InheritedContext
  ): Promise<void> {
    const dir = '.nexus/tasks/inheritance';
    await fs.ensureDir(dir);

    const filepath = path.join(dir, `${taskId}-inheritance.json`);
    await fs.writeJson(filepath, inheritance, { spaces: 2 });

    console.log(`  💾 Inheritance saved to: ${filepath}`);
  }

  async loadInheritance(taskId: string): Promise<InheritedContext | null> {
    const filepath = path.join('.nexus/tasks/inheritance', `${taskId}-inheritance.json`);

    if (await fs.pathExists(filepath)) {
      return await fs.readJson(filepath);
    }

    return null;
  }

  // Cache management
  private generateCacheKey(currentTaskId: string, sourceTaskId: string): string {
    return `${currentTaskId}:${sourceTaskId}:${this.VERSION}`;
  }

  private getCachedInheritance(cacheKey: string): InheritedContext | null {
    const cached = this.inheritanceCache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }
    return null;
  }

  private cacheInheritance(cacheKey: string, inheritance: InheritedContext): void {
    this.inheritanceCache.set(cacheKey, inheritance);

    // Cleanup old cache entries if map gets too large
    if (this.inheritanceCache.size > 1000) {
      const entries = Array.from(this.inheritanceCache.entries());
      const sorted = entries.sort((a, b) =>
        new Date(b[1].metadata.cache_timestamp).getTime() -
        new Date(a[1].metadata.cache_timestamp).getTime()
      );

      this.inheritanceCache.clear();
      sorted.slice(0, 500).forEach(([key, value]) => {
        this.inheritanceCache.set(key, value);
      });
    }
  }

  private isCacheValid(inheritance: InheritedContext): boolean {
    const cacheTime = new Date(inheritance.metadata.cache_timestamp);
    const expiryTime = new Date(cacheTime.getTime() + (this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000));
    return new Date() < expiryTime;
  }

  private createEmptyInheritance(): InheritedContext {
    return {
      decisions: [],
      successful_patterns: [],
      insights: [],
      technical_context: {
        technologies_used: [],
        architectural_decisions: [],
        api_contracts: [],
        database_schemas: [],
        configuration: {
          environment: {},
          application: {},
          deployment: {},
          monitoring: {}
        },
        performance_benchmarks: [],
        security_considerations: []
      },
      metadata: {
        inherited_from: [],
        inheritance_depth: 0,
        relevance_score: 0,
        cache_timestamp: new Date().toISOString(),
        context_version: this.VERSION
      }
    };
  }

  // Additional helper methods would be implemented here...
  // (Implementation details for helper methods have been abbreviated for length)
}

// Helper classes for specialized calculations
class PatternAnalyzer {
  isApplicableToTask(pattern: Pattern, task: Task): boolean {
    return pattern.applicable_to.some(category =>
      task.categories?.includes(category) ||
      task.description?.toLowerCase().includes(category.toLowerCase()) ||
      task.domain?.toLowerCase().includes(category.toLowerCase())
    );
  }
}

class RelevanceCalculator {
  calculateTagOverlap(tags1: string[], tags2: string[]): number {
    if (tags1.length === 0 || tags2.length === 0) return 0;

    const set1 = new Set(tags1.map(t => t.toLowerCase()));
    const set2 = new Set(tags2.map(t => t.toLowerCase()));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }
}
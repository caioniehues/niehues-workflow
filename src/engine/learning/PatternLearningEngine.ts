import { ContextInheritance, InheritedContext, Pattern, Decision } from '../context/ContextInheritance';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface ExtractedPattern {
  id: string;
  name: string;
  description: string;
  category: PatternCategory;
  implementation_type: ImplementationType;
  code_snippets: CodeSnippet[];
  success_metrics: SuccessMetrics;
  reusability_score: number;
  applicability_rules: ApplicabilityRule[];
  dependencies: string[];
  anti_patterns: string[];
  extraction_metadata: ExtractionMetadata;
}

export interface CodeSnippet {
  language: string;
  framework?: string;
  code: string;
  context: string;
  abstraction_level: 'concrete' | 'template' | 'pattern';
  variables: Variable[];
  comments: string[];
}

export interface Variable {
  name: string;
  type: string;
  purpose: string;
  default_value?: any;
  validation_rules?: string[];
}

export interface SuccessMetrics {
  times_used: number;
  success_rate: number;
  average_implementation_time: number;
  bug_rate: number;
  maintainability_score: number;
  performance_impact: 'positive' | 'neutral' | 'negative';
  developer_satisfaction: number;
  last_success_date: Date;
}

export interface ApplicabilityRule {
  condition_type: 'domain' | 'technology' | 'requirement' | 'complexity' | 'team_size';
  operator: 'equals' | 'contains' | 'matches' | 'range' | 'not_equals';
  value: any;
  weight: number;
  reasoning: string;
}

export interface ExtractionMetadata {
  extracted_from_task: string;
  extraction_date: Date;
  extraction_confidence: number;
  pattern_similarity_threshold: number;
  validation_status: 'pending' | 'validated' | 'deprecated';
  validator: string;
  extraction_method: string;
}

export interface PatternSuggestion {
  pattern: ExtractedPattern;
  relevance_score: number;
  customization_needed: CustomizationRequirement[];
  implementation_guidance: string[];
  risk_factors: string[];
  expected_benefits: string[];
  effort_estimate: EffortEstimate;
}

export interface CustomizationRequirement {
  aspect: string;
  description: string;
  difficulty: 'low' | 'medium' | 'high';
  required: boolean;
  example?: string;
}

export interface EffortEstimate {
  implementation_hours: number;
  customization_hours: number;
  testing_hours: number;
  total_hours: number;
  confidence_level: number;
}

export interface PatternAnalysis {
  total_patterns: number;
  categories_covered: PatternCategory[];
  success_rate_distribution: Record<string, number>;
  reusability_trends: ReusabilityTrend[];
  most_successful_patterns: ExtractedPattern[];
  emerging_patterns: ExtractedPattern[];
  deprecated_patterns: ExtractedPattern[];
  pattern_evolution: PatternEvolution[];
}

export interface ReusabilityTrend {
  category: PatternCategory;
  trend_direction: 'increasing' | 'stable' | 'decreasing';
  usage_frequency: number;
  success_trend: number;
  prediction: string;
}

export interface PatternEvolution {
  original_pattern_id: string;
  evolved_pattern_id: string;
  evolution_type: 'refinement' | 'generalization' | 'specialization' | 'replacement';
  evolution_date: Date;
  improvement_metrics: Record<string, number>;
  evolution_reasoning: string;
}

export interface AntiPattern {
  id: string;
  name: string;
  description: string;
  why_problematic: string[];
  common_causes: string[];
  detection_signs: string[];
  refactoring_approaches: string[];
  better_alternatives: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency_observed: number;
}

export type PatternCategory =
  | 'architectural'
  | 'design'
  | 'implementation'
  | 'testing'
  | 'deployment'
  | 'configuration'
  | 'data_access'
  | 'user_interface'
  | 'error_handling'
  | 'performance'
  | 'security'
  | 'integration'
  | 'workflow'
  | 'business_logic';

export type ImplementationType =
  | 'function'
  | 'class'
  | 'module'
  | 'component'
  | 'service'
  | 'configuration'
  | 'workflow'
  | 'test_pattern'
  | 'documentation'
  | 'deployment_script';

export class PatternLearningEngine {
  private readonly PATTERN_STORAGE_PATH = '.nexus/patterns';
  private readonly SIMILARITY_THRESHOLD = 0.7;
  private readonly MIN_SUCCESS_RATE = 0.6;
  private readonly VERSION = '1.0.0';

  private patternExtractor: PatternExtractor;
  private reusabilityScorer: ReusabilityScorer;
  private similarityMatcher: SimilarityMatcher;
  private antiPatternDetector: AntiPatternDetector;
  private patternEvolutionTracker: PatternEvolutionTracker;

  constructor() {
    this.patternExtractor = new PatternExtractor();
    this.reusabilityScorer = new ReusabilityScorer();
    this.similarityMatcher = new SimilarityMatcher();
    this.antiPatternDetector = new AntiPatternDetector();
    this.patternEvolutionTracker = new PatternEvolutionTracker();
  }

  async extractPatternsFromImplementation(
    taskId: string,
    implementationData: ImplementationData,
    contextData: InheritedContext,
    successMetrics: SuccessMetrics
  ): Promise<ExtractedPattern[]> {
    console.log(`🧠 Extracting patterns from implementation: ${taskId}`);

    // Phase 1: Analyze implementation for pattern candidates
    const patternCandidates = await this.patternExtractor.extractCandidates(
      implementationData,
      contextData
    );
    console.log(`  🔍 Found ${patternCandidates.length} pattern candidates`);

    // Phase 2: Score reusability for each candidate
    const scoredPatterns: ExtractedPattern[] = [];
    for (const candidate of patternCandidates) {
      const reusabilityScore = await this.reusabilityScorer.scorePattern(
        candidate,
        implementationData,
        successMetrics
      );

      if (reusabilityScore >= this.MIN_SUCCESS_RATE) {
        const extractedPattern = await this.createExtractedPattern(
          candidate,
          implementationData,
          successMetrics,
          reusabilityScore,
          taskId
        );
        scoredPatterns.push(extractedPattern);
      }
    }

    console.log(`  ✅ Extracted ${scoredPatterns.length} viable patterns`);

    // Phase 3: Check for similar existing patterns
    const uniquePatterns = await this.deduplicatePatterns(scoredPatterns);
    console.log(`  🔄 After deduplication: ${uniquePatterns.length} unique patterns`);

    // Phase 4: Save patterns to storage
    await this.saveExtractedPatterns(uniquePatterns);

    // Phase 5: Update pattern evolution tracking
    await this.patternEvolutionTracker.trackEvolution(uniquePatterns);

    return uniquePatterns;
  }

  async suggestPatternsForTask(
    taskContext: any,
    requirements: string[],
    technicalContext: any
  ): Promise<PatternSuggestion[]> {
    console.log(`💡 Suggesting patterns for task: ${taskContext.task_id}`);

    // Phase 1: Load all available patterns
    const availablePatterns = await this.loadAllPatterns();
    console.log(`  📚 Evaluating ${availablePatterns.length} available patterns`);

    // Phase 2: Filter patterns by applicability
    const applicablePatterns = await this.filterApplicablePatterns(
      availablePatterns,
      taskContext,
      requirements,
      technicalContext
    );
    console.log(`  🎯 Found ${applicablePatterns.length} applicable patterns`);

    // Phase 3: Score relevance for each applicable pattern
    const suggestions: PatternSuggestion[] = [];
    for (const pattern of applicablePatterns) {
      const relevanceScore = await this.calculateRelevanceScore(
        pattern,
        taskContext,
        requirements,
        technicalContext
      );

      if (relevanceScore > 0.5) { // Only suggest patterns with reasonable relevance
        const suggestion = await this.createPatternSuggestion(
          pattern,
          relevanceScore,
          taskContext,
          requirements
        );
        suggestions.push(suggestion);
      }
    }

    // Phase 4: Sort by relevance and return top suggestions
    const sortedSuggestions = suggestions.sort((a, b) => b.relevance_score - a.relevance_score);
    const topSuggestions = sortedSuggestions.slice(0, 10);

    console.log(`  ⭐ Suggesting top ${topSuggestions.length} patterns`);
    return topSuggestions;
  }

  async analyzePatternUsage(): Promise<PatternAnalysis> {
    console.log('📊 Analyzing pattern usage and trends...');

    const allPatterns = await this.loadAllPatterns();
    const antiPatterns = await this.loadAntiPatterns();

    const analysis: PatternAnalysis = {
      total_patterns: allPatterns.length,
      categories_covered: this.extractUniqueCategories(allPatterns),
      success_rate_distribution: this.calculateSuccessRateDistribution(allPatterns),
      reusability_trends: await this.calculateReusabilityTrends(allPatterns),
      most_successful_patterns: this.identifyMostSuccessfulPatterns(allPatterns),
      emerging_patterns: await this.identifyEmergingPatterns(allPatterns),
      deprecated_patterns: this.identifyDeprecatedPatterns(allPatterns),
      pattern_evolution: await this.patternEvolutionTracker.getEvolutionHistory()
    };

    console.log(`  📈 Analysis complete:`);
    console.log(`    - Total patterns: ${analysis.total_patterns}`);
    console.log(`    - Categories: ${analysis.categories_covered.length}`);
    console.log(`    - Success rate average: ${this.calculateAverageSuccessRate(allPatterns).toFixed(1)}%`);

    return analysis;
  }

  async detectAntiPatterns(
    implementationData: ImplementationData,
    contextData: InheritedContext
  ): Promise<AntiPattern[]> {
    console.log('🚨 Detecting anti-patterns in implementation...');

    const detectedAntiPatterns = await this.antiPatternDetector.detectAntiPatterns(
      implementationData,
      contextData
    );

    console.log(`  ⚠️ Detected ${detectedAntiPatterns.length} anti-patterns`);

    // Log warnings for detected anti-patterns
    for (const antiPattern of detectedAntiPatterns) {
      console.warn(`    - ${antiPattern.name}: ${antiPattern.severity.toUpperCase()}`);
    }

    return detectedAntiPatterns;
  }

  async learnFromFailure(
    taskId: string,
    implementationData: ImplementationData,
    failureData: FailureData
  ): Promise<void> {
    console.log(`❌ Learning from failure in task: ${taskId}`);

    // Extract anti-patterns from failure
    const antiPatterns = await this.extractAntiPatternsFromFailure(
      implementationData,
      failureData
    );

    // Update existing pattern success rates
    await this.updatePatternSuccessRates(implementationData, false);

    // Save failure patterns for future avoidance
    await this.saveAntiPatterns(antiPatterns);

    console.log(`  📚 Learned ${antiPatterns.length} lessons from failure`);
  }

  async evolvePatterns(): Promise<PatternEvolution[]> {
    console.log('🧬 Evolving patterns based on usage data...');

    const allPatterns = await this.loadAllPatterns();
    const evolutions: PatternEvolution[] = [];

    // Identify patterns that could be generalized
    const generalizationCandidates = await this.identifyGeneralizationCandidates(allPatterns);
    for (const candidate of generalizationCandidates) {
      const evolution = await this.generalizePattern(candidate);
      if (evolution) {
        evolutions.push(evolution);
      }
    }

    // Identify patterns that should be specialized
    const specializationCandidates = await this.identifySpecializationCandidates(allPatterns);
    for (const candidate of specializationCandidates) {
      const evolution = await this.specializePattern(candidate);
      if (evolution) {
        evolutions.push(evolution);
      }
    }

    // Identify patterns that should be refined
    const refinementCandidates = await this.identifyRefinementCandidates(allPatterns);
    for (const candidate of refinementCandidates) {
      const evolution = await this.refinePattern(candidate);
      if (evolution) {
        evolutions.push(evolution);
      }
    }

    await this.patternEvolutionTracker.recordEvolutions(evolutions);

    console.log(`  🌱 Evolved ${evolutions.length} patterns`);
    return evolutions;
  }

  async generatePatternReport(): Promise<string> {
    const analysis = await this.analyzePatternUsage();
    const antiPatterns = await this.loadAntiPatterns();

    return `
# Pattern Learning Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Patterns**: ${analysis.total_patterns}
- **Categories Covered**: ${analysis.categories_covered.length}
- **Average Success Rate**: ${this.calculateAverageSuccessRate(await this.loadAllPatterns()).toFixed(1)}%
- **Anti-Patterns Identified**: ${antiPatterns.length}

## Most Successful Patterns
${analysis.most_successful_patterns.slice(0, 5).map(p =>
  `- **${p.name}**: ${(p.success_metrics.success_rate * 100).toFixed(1)}% success, used ${p.success_metrics.times_used} times`
).join('\n')}

## Emerging Patterns
${analysis.emerging_patterns.slice(0, 3).map(p =>
  `- **${p.name}**: ${p.description}`
).join('\n')}

## Category Distribution
${analysis.categories_covered.map(category => {
  const categoryPatterns = analysis.total_patterns; // Would be calculated properly
  return `- **${category}**: ${Math.round(categoryPatterns / analysis.categories_covered.length)} patterns`;
}).join('\n')}

## Reusability Trends
${analysis.reusability_trends.map(trend =>
  `- **${trend.category}**: ${trend.trend_direction} (${trend.usage_frequency} uses)`
).join('\n')}

## Pattern Evolution
- **Total Evolutions**: ${analysis.pattern_evolution.length}
- **Refinements**: ${analysis.pattern_evolution.filter(e => e.evolution_type === 'refinement').length}
- **Generalizations**: ${analysis.pattern_evolution.filter(e => e.evolution_type === 'generalization').length}

## Recommendations
${this.generatePatternRecommendations(analysis)}

## Anti-Pattern Summary
${antiPatterns.slice(0, 5).map(ap =>
  `- **${ap.name}**: ${ap.severity.toUpperCase()} - observed ${ap.frequency_observed} times`
).join('\n')}
`;
  }

  // Private implementation methods

  private async createExtractedPattern(
    candidate: any,
    implementationData: ImplementationData,
    successMetrics: SuccessMetrics,
    reusabilityScore: number,
    taskId: string
  ): Promise<ExtractedPattern> {
    return {
      id: this.generatePatternId(candidate.name),
      name: candidate.name,
      description: candidate.description,
      category: candidate.category,
      implementation_type: candidate.implementation_type,
      code_snippets: candidate.code_snippets,
      success_metrics: successMetrics,
      reusability_score: reusabilityScore,
      applicability_rules: candidate.applicability_rules || [],
      dependencies: candidate.dependencies || [],
      anti_patterns: [],
      extraction_metadata: {
        extracted_from_task: taskId,
        extraction_date: new Date(),
        extraction_confidence: reusabilityScore,
        pattern_similarity_threshold: this.SIMILARITY_THRESHOLD,
        validation_status: 'pending',
        validator: 'system',
        extraction_method: 'automated'
      }
    };
  }

  private async deduplicatePatterns(patterns: ExtractedPattern[]): Promise<ExtractedPattern[]> {
    const uniquePatterns: ExtractedPattern[] = [];
    const existingPatterns = await this.loadAllPatterns();

    for (const pattern of patterns) {
      let isDuplicate = false;

      // Check against existing patterns
      for (const existing of existingPatterns) {
        const similarity = await this.similarityMatcher.calculateSimilarity(pattern, existing);
        if (similarity > this.SIMILARITY_THRESHOLD) {
          // Merge with existing pattern instead of creating duplicate
          await this.mergePatternWithExisting(pattern, existing);
          isDuplicate = true;
          break;
        }
      }

      // Check against other new patterns
      if (!isDuplicate) {
        for (const unique of uniquePatterns) {
          const similarity = await this.similarityMatcher.calculateSimilarity(pattern, unique);
          if (similarity > this.SIMILARITY_THRESHOLD) {
            isDuplicate = true;
            break;
          }
        }
      }

      if (!isDuplicate) {
        uniquePatterns.push(pattern);
      }
    }

    return uniquePatterns;
  }

  private async saveExtractedPatterns(patterns: ExtractedPattern[]): Promise<void> {
    await fs.ensureDir(this.PATTERN_STORAGE_PATH);

    for (const pattern of patterns) {
      const filename = `${pattern.id}.json`;
      const filepath = path.join(this.PATTERN_STORAGE_PATH, filename);
      await fs.writeJson(filepath, pattern, { spaces: 2 });
    }

    console.log(`  💾 Saved ${patterns.length} patterns to storage`);
  }

  private async loadAllPatterns(): Promise<ExtractedPattern[]> {
    if (!await fs.pathExists(this.PATTERN_STORAGE_PATH)) {
      return [];
    }

    const files = await fs.readdir(this.PATTERN_STORAGE_PATH);
    const patternFiles = files.filter(file => file.endsWith('.json') && !file.includes('anti-pattern'));

    const patterns: ExtractedPattern[] = [];
    for (const file of patternFiles) {
      const filepath = path.join(this.PATTERN_STORAGE_PATH, file);
      const pattern = await fs.readJson(filepath);
      patterns.push(pattern);
    }

    return patterns;
  }

  private async filterApplicablePatterns(
    patterns: ExtractedPattern[],
    taskContext: any,
    requirements: string[],
    technicalContext: any
  ): Promise<ExtractedPattern[]> {
    const applicablePatterns: ExtractedPattern[] = [];

    for (const pattern of patterns) {
      let isApplicable = true;

      // Check applicability rules
      for (const rule of pattern.applicability_rules) {
        if (!this.evaluateApplicabilityRule(rule, taskContext, requirements, technicalContext)) {
          isApplicable = false;
          break;
        }
      }

      if (isApplicable) {
        applicablePatterns.push(pattern);
      }
    }

    return applicablePatterns;
  }

  private async calculateRelevanceScore(
    pattern: ExtractedPattern,
    taskContext: any,
    requirements: string[],
    technicalContext: any
  ): Promise<number> {
    let relevanceScore = 0;

    // Base score from success metrics
    relevanceScore += pattern.success_metrics.success_rate * 0.3;

    // Reusability score contribution
    relevanceScore += pattern.reusability_score * 0.25;

    // Requirements matching
    const requirementMatch = this.calculateRequirementMatch(pattern, requirements);
    relevanceScore += requirementMatch * 0.25;

    // Technical context matching
    const technicalMatch = this.calculateTechnicalMatch(pattern, technicalContext);
    relevanceScore += technicalMatch * 0.2;

    return Math.min(1, Math.max(0, relevanceScore));
  }

  private async createPatternSuggestion(
    pattern: ExtractedPattern,
    relevanceScore: number,
    taskContext: any,
    requirements: string[]
  ): Promise<PatternSuggestion> {
    return {
      pattern: pattern,
      relevance_score: relevanceScore,
      customization_needed: this.identifyCustomizationNeeds(pattern, taskContext, requirements),
      implementation_guidance: this.generateImplementationGuidance(pattern, taskContext),
      risk_factors: this.identifyRiskFactors(pattern, taskContext),
      expected_benefits: this.calculateExpectedBenefits(pattern, taskContext),
      effort_estimate: this.estimateImplementationEffort(pattern, taskContext)
    };
  }

  // Additional helper methods would be implemented here...
  // (Implementation details abbreviated for length)

  private generatePatternId(name: string): string {
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `pattern_${sanitized}_${Date.now()}`;
  }

  private extractUniqueCategories(patterns: ExtractedPattern[]): PatternCategory[] {
    return [...new Set(patterns.map(p => p.category))];
  }

  private calculateAverageSuccessRate(patterns: ExtractedPattern[]): number {
    if (patterns.length === 0) return 0;
    const totalSuccessRate = patterns.reduce((sum, p) => sum + p.success_metrics.success_rate, 0);
    return (totalSuccessRate / patterns.length) * 100;
  }

  private generatePatternRecommendations(analysis: PatternAnalysis): string {
    const recommendations = [];

    if (analysis.total_patterns < 10) {
      recommendations.push('- Focus on extracting more patterns from successful implementations');
    }

    if (analysis.categories_covered.length < 8) {
      recommendations.push('- Develop patterns in underrepresented categories');
    }

    const avgSuccessRate = this.calculateAverageSuccessRate(analysis.most_successful_patterns);
    if (avgSuccessRate < 80) {
      recommendations.push('- Review and refine patterns with low success rates');
    }

    return recommendations.length > 0 ? recommendations.join('\n') : '- Pattern library is well-developed';
  }
}

// Supporting interfaces and classes
export interface ImplementationData {
  code_files: string[];
  test_files: string[];
  configuration_files: string[];
  documentation: string[];
  dependencies: string[];
  performance_metrics: any;
  quality_metrics: any;
}

export interface FailureData {
  error_messages: string[];
  failure_points: string[];
  root_causes: string[];
  resolution_attempts: string[];
  lessons_learned: string[];
}

// Supporting classes for specialized operations
class PatternExtractor {
  async extractCandidates(implementationData: ImplementationData, contextData: InheritedContext): Promise<any[]> {
    // Implementation would analyze code and extract pattern candidates
    return [];
  }
}

class ReusabilityScorer {
  async scorePattern(candidate: any, implementationData: ImplementationData, successMetrics: SuccessMetrics): Promise<number> {
    // Implementation would score pattern reusability
    return 0.8;
  }
}

class SimilarityMatcher {
  async calculateSimilarity(pattern1: ExtractedPattern, pattern2: ExtractedPattern): Promise<number> {
    // Implementation would calculate pattern similarity
    return 0.5;
  }
}

class AntiPatternDetector {
  async detectAntiPatterns(implementationData: ImplementationData, contextData: InheritedContext): Promise<AntiPattern[]> {
    // Implementation would detect anti-patterns
    return [];
  }
}

class PatternEvolutionTracker {
  async trackEvolution(patterns: ExtractedPattern[]): Promise<void> {
    // Implementation would track pattern evolution
  }

  async getEvolutionHistory(): Promise<PatternEvolution[]> {
    // Implementation would return evolution history
    return [];
  }

  async recordEvolutions(evolutions: PatternEvolution[]): Promise<void> {
    // Implementation would record evolution data
  }
}
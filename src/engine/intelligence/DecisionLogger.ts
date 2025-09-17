import { ConfidenceScore } from './ConfidenceCalculator';
import { InheritedContext } from '../context/ContextInheritance';

export interface Decision {
  id: string;
  title: string;
  description: string;
  decision_type: DecisionType;
  decision_maker: string | 'system' | 'user' | 'team';
  timestamp: Date;
  context: DecisionContext;
  rationale: DecisionRationale;
  alternatives_considered: Alternative[];
  confidence_score: ConfidenceScore;
  tags: string[];
  impact_analysis: ImpactAnalysis;
  status: DecisionStatus;
  metadata: DecisionMetadata;
}

export interface DecisionContext {
  task_id?: string;
  phase: string;
  component: string;
  stakeholders: string[];
  business_context?: BusinessContext;
  technical_context?: TechnicalContext;
  inherited_context?: InheritedContext;
  environmental_factors: EnvironmentalFactor[];
  constraints: Constraint[];
  assumptions: Assumption[];
}

export interface DecisionRationale {
  primary_reason: string;
  supporting_reasons: string[];
  risk_assessment: RiskAssessment;
  trade_offs: TradeOff[];
  success_criteria: string[];
  failure_conditions: string[];
  review_triggers: string[];
}

export interface Alternative {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  confidence: number;
  effort_estimate: EffortEstimate;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  why_not_chosen: string;
}

export interface ImpactAnalysis {
  immediate_impact: ImpactAssessment;
  projected_impact: ImpactAssessment;
  actual_impact?: ImpactAssessment; // Filled in during review
  impact_categories: ImpactCategory[];
  affected_components: string[];
  downstream_decisions: string[];
  upstream_dependencies: string[];
}

export interface ImpactAssessment {
  performance: ImpactLevel;
  maintainability: ImpactLevel;
  scalability: ImpactLevel;
  security: ImpactLevel;
  usability: ImpactLevel;
  cost: ImpactLevel;
  timeline: ImpactLevel;
  team_velocity: ImpactLevel;
  technical_debt: ImpactLevel;
  custom_metrics: Record<string, ImpactLevel>;
}

export interface DecisionMetadata {
  logger_version: string;
  decision_sequence: number;
  parent_decision?: string;
  child_decisions: string[];
  related_decisions: string[];
  decision_tree_path: string[];
  review_history: ReviewRecord[];
  automation_level: 'manual' | 'assisted' | 'automated';
  validation_status: ValidationStatus;
}

export interface DecisionQuery {
  decision_types?: DecisionType[];
  decision_makers?: string[];
  tags?: string[];
  components?: string[];
  date_range?: DateRange;
  confidence_range?: ConfidenceRange;
  impact_level?: ImpactLevel;
  status?: DecisionStatus[];
  text_search?: string;
  limit?: number;
  offset?: number;
  sort_by?: SortField;
  sort_order?: 'asc' | 'desc';
}

export interface DecisionSearchResult {
  decisions: Decision[];
  total_count: number;
  facets: SearchFacets;
  related_suggestions: string[];
  query_execution_time_ms: number;
}

export interface DecisionAnalytics {
  decision_velocity: VelocityMetrics;
  confidence_trends: ConfidenceTrends;
  impact_distribution: ImpactDistribution;
  decision_makers_activity: DecisionMakerActivity[];
  most_common_rationales: string[];
  frequently_reviewed_types: DecisionType[];
  success_rate_by_type: Record<DecisionType, number>;
  recommendation_insights: RecommendationInsight[];
}

export type DecisionType =
  | 'architectural'
  | 'implementation'
  | 'technical_choice'
  | 'business_rule'
  | 'process'
  | 'quality_standard'
  | 'security'
  | 'performance'
  | 'ui_ux'
  | 'data_structure'
  | 'integration'
  | 'deployment'
  | 'testing'
  | 'documentation'
  | 'governance';

export type DecisionStatus =
  | 'proposed'
  | 'under_review'
  | 'approved'
  | 'implemented'
  | 'validated'
  | 'deprecated'
  | 'superseded'
  | 'failed';

export type ImpactLevel =
  | 'negligible'
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export class DecisionLogger {
  private readonly VERSION = '1.0.0';
  private readonly STORAGE_KEY = 'nexus_decisions';

  private decisions: Map<string, Decision>;
  private decisionIndex: DecisionIndex;
  private analyticsEngine: DecisionAnalyticsEngine;
  private impactTracker: ImpactTracker;
  private confidenceTracker: ConfidenceTracker;

  constructor() {
    this.decisions = new Map();
    this.decisionIndex = new DecisionIndex();
    this.analyticsEngine = new DecisionAnalyticsEngine();
    this.impactTracker = new ImpactTracker();
    this.confidenceTracker = new ConfidenceTracker();
    this.loadExistingDecisions();
  }

  async logDecision(
    title: string,
    description: string,
    decisionType: DecisionType,
    context: DecisionContext,
    rationale: DecisionRationale,
    alternativesConsidered: Alternative[] = [],
    decisionMaker: string = 'system'
  ): Promise<Decision> {
    console.log(`📝 Logging decision: ${title}`);

    const decisionId = this.generateDecisionId();
    const timestamp = new Date();

    // Calculate confidence score for this decision
    const confidenceScore = await this.calculateDecisionConfidence(
      title,
      description,
      rationale,
      alternativesConsidered,
      context
    );

    // Perform initial impact analysis
    const impactAnalysis = await this.analyzeImpact(
      decisionType,
      context,
      rationale,
      alternativesConsidered
    );

    // Generate tags based on decision content
    const tags = this.generateTags(title, description, decisionType, context);

    const decision: Decision = {
      id: decisionId,
      title,
      description,
      decision_type: decisionType,
      decision_maker: decisionMaker,
      timestamp,
      context,
      rationale,
      alternatives_considered: alternativesConsidered,
      confidence_score: confidenceScore,
      tags,
      impact_analysis: impactAnalysis,
      status: 'proposed',
      metadata: {
        logger_version: this.VERSION,
        decision_sequence: this.getNextSequenceNumber(),
        child_decisions: [],
        related_decisions: await this.findRelatedDecisions(title, description, context),
        decision_tree_path: this.buildDecisionPath(context),
        review_history: [],
        automation_level: decisionMaker === 'system' ? 'automated' : 'manual',
        validation_status: {
          is_validated: false,
          validation_date: null,
          validation_results: [],
          requires_review: confidenceScore.overall_confidence < 0.8
        }
      }
    };

    // Store the decision
    this.decisions.set(decisionId, decision);

    // Update indexes
    await this.decisionIndex.indexDecision(decision);

    // Track confidence
    this.confidenceTracker.trackDecision(decision);

    // Persist to storage
    await this.persistDecisions();

    console.log(`  ✓ Decision logged with ID: ${decisionId} (confidence: ${confidenceScore.overall_confidence.toFixed(2)})`);

    return decision;
  }

  async searchDecisions(query: DecisionQuery): Promise<DecisionSearchResult> {
    const startTime = Date.now();
    console.log('🔍 Searching decisions...');

    let filteredDecisions = Array.from(this.decisions.values());

    // Apply filters
    if (query.decision_types && query.decision_types.length > 0) {
      filteredDecisions = filteredDecisions.filter(d =>
        query.decision_types!.includes(d.decision_type)
      );
    }

    if (query.decision_makers && query.decision_makers.length > 0) {
      filteredDecisions = filteredDecisions.filter(d =>
        query.decision_makers!.includes(d.decision_maker)
      );
    }

    if (query.tags && query.tags.length > 0) {
      filteredDecisions = filteredDecisions.filter(d =>
        query.tags!.some(tag => d.tags.includes(tag))
      );
    }

    if (query.components && query.components.length > 0) {
      filteredDecisions = filteredDecisions.filter(d =>
        query.components!.includes(d.context.component)
      );
    }

    if (query.date_range) {
      filteredDecisions = filteredDecisions.filter(d =>
        d.timestamp >= query.date_range!.start &&
        d.timestamp <= query.date_range!.end
      );
    }

    if (query.confidence_range) {
      filteredDecisions = filteredDecisions.filter(d =>
        d.confidence_score.overall_confidence >= query.confidence_range!.min &&
        d.confidence_score.overall_confidence <= query.confidence_range!.max
      );
    }

    if (query.status && query.status.length > 0) {
      filteredDecisions = filteredDecisions.filter(d =>
        query.status!.includes(d.status)
      );
    }

    // Text search
    if (query.text_search) {
      const searchTerm = query.text_search.toLowerCase();
      filteredDecisions = filteredDecisions.filter(d =>
        d.title.toLowerCase().includes(searchTerm) ||
        d.description.toLowerCase().includes(searchTerm) ||
        d.rationale.primary_reason.toLowerCase().includes(searchTerm) ||
        d.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Sort results
    const sortBy = query.sort_by || 'timestamp';
    const sortOrder = query.sort_order || 'desc';

    filteredDecisions.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'timestamp':
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
          break;
        case 'confidence':
          aValue = a.confidence_score.overall_confidence;
          bValue = b.confidence_score.overall_confidence;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        default:
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 50;
    const paginatedDecisions = filteredDecisions.slice(offset, offset + limit);

    // Generate facets
    const facets = this.generateSearchFacets(filteredDecisions);

    // Generate related suggestions
    const relatedSuggestions = await this.generateRelatedSuggestions(query, filteredDecisions);

    const executionTime = Date.now() - startTime;

    console.log(`  ✓ Found ${filteredDecisions.length} decisions (${executionTime}ms)`);

    return {
      decisions: paginatedDecisions,
      total_count: filteredDecisions.length,
      facets,
      related_suggestions: relatedSuggestions,
      query_execution_time_ms: executionTime
    };
  }

  async updateDecisionStatus(decisionId: string, status: DecisionStatus, notes?: string): Promise<void> {
    const decision = this.decisions.get(decisionId);
    if (!decision) {
      throw new Error(`Decision not found: ${decisionId}`);
    }

    console.log(`📊 Updating decision ${decisionId} status: ${decision.status} → ${status}`);

    decision.status = status;

    // Add review record
    const reviewRecord: ReviewRecord = {
      timestamp: new Date(),
      reviewer: 'system', // This could be passed as parameter
      action: 'status_change',
      previous_status: decision.status,
      new_status: status,
      notes: notes || `Status changed to ${status}`,
      confidence_at_review: decision.confidence_score.overall_confidence
    };

    decision.metadata.review_history.push(reviewRecord);

    // If decision is implemented, start tracking actual impact
    if (status === 'implemented') {
      await this.impactTracker.startTracking(decision);
    }

    // If decision is validated, update actual impact
    if (status === 'validated') {
      decision.impact_analysis.actual_impact = await this.impactTracker.assessActualImpact(decision);
    }

    await this.persistDecisions();
    console.log(`  ✓ Decision status updated`);
  }

  async getDecisionAnalytics(timeRange?: DateRange): Promise<DecisionAnalytics> {
    console.log('📈 Generating decision analytics...');

    const decisions = timeRange
      ? Array.from(this.decisions.values()).filter(d =>
          d.timestamp >= timeRange.start && d.timestamp <= timeRange.end
        )
      : Array.from(this.decisions.values());

    return await this.analyticsEngine.generateAnalytics(decisions);
  }

  async getDecisionById(decisionId: string): Promise<Decision | null> {
    return this.decisions.get(decisionId) || null;
  }

  async getDecisionsByParent(parentId: string): Promise<Decision[]> {
    return Array.from(this.decisions.values()).filter(d =>
      d.metadata.parent_decision === parentId
    );
  }

  async getDecisionsByComponent(component: string): Promise<Decision[]> {
    return Array.from(this.decisions.values()).filter(d =>
      d.context.component === component
    );
  }

  async getRecentDecisions(count: number = 10): Promise<Decision[]> {
    return Array.from(this.decisions.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count);
  }

  async exportDecisions(format: 'json' | 'csv' | 'markdown' = 'json'): Promise<string> {
    console.log(`📤 Exporting decisions in ${format} format...`);

    const decisions = Array.from(this.decisions.values());

    switch (format) {
      case 'json':
        return JSON.stringify(decisions, null, 2);

      case 'csv':
        return this.exportToCsv(decisions);

      case 'markdown':
        return this.exportToMarkdown(decisions);

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private async calculateDecisionConfidence(
    title: string,
    description: string,
    rationale: DecisionRationale,
    alternatives: Alternative[],
    context: DecisionContext
  ): Promise<ConfidenceScore> {
    // This would integrate with the ConfidenceCalculator
    // For now, return a mock confidence score
    return {
      overall_confidence: 0.8,
      component_scores: {
        requirements_completeness: 85,
        implementation_clarity: 80,
        test_coverage_readiness: 75,
        context_availability: 90,
        edge_case_coverage: 70,
        business_rule_clarity: 85,
        technical_feasibility: 90,
        risk_assessment: 80,
        stakeholder_alignment: 85,
        definition_precision: 80
      },
      confidence_trend: {
        direction: 'stable',
        rate_of_change: 0,
        historical_scores: [0.8],
        predicted_next_score: 0.8,
        confidence_in_prediction: 0.7
      },
      factors_analyzed: [],
      threshold_analysis: {
        current_threshold: 85,
        recommended_threshold: 80,
        threshold_justification: 'Standard threshold for decisions',
        risk_level: 'medium',
        proceed_recommendation: 'proceed'
      },
      recommendations: [],
      calculation_metadata: {
        calculation_timestamp: new Date(),
        calculator_version: '1.0.0',
        factors_used: [],
        total_factors_considered: 0,
        calculation_time_ms: 0,
        data_quality_score: 0.8
      }
    };
  }

  private async analyzeImpact(
    decisionType: DecisionType,
    context: DecisionContext,
    rationale: DecisionRationale,
    alternatives: Alternative[]
  ): Promise<ImpactAnalysis> {
    // Analyze immediate and projected impact
    const immediateImpact: ImpactAssessment = {
      performance: 'medium',
      maintainability: 'high',
      scalability: 'medium',
      security: 'low',
      usability: 'medium',
      cost: 'low',
      timeline: 'medium',
      team_velocity: 'medium',
      technical_debt: 'low',
      custom_metrics: {}
    };

    const projectedImpact: ImpactAssessment = {
      performance: 'high',
      maintainability: 'high',
      scalability: 'high',
      security: 'medium',
      usability: 'high',
      cost: 'medium',
      timeline: 'high',
      team_velocity: 'high',
      technical_debt: 'low',
      custom_metrics: {}
    };

    return {
      immediate_impact: immediateImpact,
      projected_impact: projectedImpact,
      impact_categories: this.categorizeImpact(decisionType),
      affected_components: this.identifyAffectedComponents(context),
      downstream_decisions: [],
      upstream_dependencies: []
    };
  }

  private generateDecisionId(): string {
    return `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNextSequenceNumber(): number {
    return this.decisions.size + 1;
  }

  private generateTags(
    title: string,
    description: string,
    decisionType: DecisionType,
    context: DecisionContext
  ): string[] {
    const tags: string[] = [];

    // Add decision type as tag
    tags.push(decisionType);

    // Add component as tag
    tags.push(context.component);

    // Add phase as tag
    tags.push(context.phase);

    // Extract keywords from title and description
    const keywords = this.extractKeywords(title + ' ' + description);
    tags.push(...keywords);

    // Add stakeholder tags
    tags.push(...context.stakeholders.map(s => `stakeholder:${s}`));

    return [...new Set(tags)]; // Remove duplicates
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - could be enhanced with NLP
    const words = text.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
      .slice(0, 10); // Limit to 10 keywords

    return words;
  }

  private async findRelatedDecisions(
    title: string,
    description: string,
    context: DecisionContext
  ): Promise<string[]> {
    // Find decisions with similar context or content
    const related: string[] = [];

    for (const [id, decision] of this.decisions) {
      // Same component
      if (decision.context.component === context.component) {
        related.push(id);
      }

      // Similar keywords
      const titleSimilarity = this.calculateTextSimilarity(title, decision.title);
      if (titleSimilarity > 0.3) {
        related.push(id);
      }
    }

    return [...new Set(related)]; // Remove duplicates
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple similarity calculation - could be enhanced
    const words1 = new Set(text1.toLowerCase().split(/\W+/));
    const words2 = new Set(text2.toLowerCase().split(/\W+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private buildDecisionPath(context: DecisionContext): string[] {
    return [context.phase, context.component];
  }

  private generateSearchFacets(decisions: Decision[]): SearchFacets {
    const facets: SearchFacets = {
      decision_types: {},
      decision_makers: {},
      components: {},
      statuses: {},
      tags: {},
      confidence_ranges: {}
    };

    for (const decision of decisions) {
      // Count decision types
      facets.decision_types[decision.decision_type] =
        (facets.decision_types[decision.decision_type] || 0) + 1;

      // Count decision makers
      facets.decision_makers[decision.decision_maker] =
        (facets.decision_makers[decision.decision_maker] || 0) + 1;

      // Count components
      facets.components[decision.context.component] =
        (facets.components[decision.context.component] || 0) + 1;

      // Count statuses
      facets.statuses[decision.status] =
        (facets.statuses[decision.status] || 0) + 1;

      // Count tags (top 20)
      for (const tag of decision.tags.slice(0, 20)) {
        facets.tags[tag] = (facets.tags[tag] || 0) + 1;
      }

      // Group confidence ranges
      const confidence = decision.confidence_score.overall_confidence;
      let range: string;
      if (confidence >= 0.9) range = 'high (90-100%)';
      else if (confidence >= 0.7) range = 'medium (70-89%)';
      else if (confidence >= 0.5) range = 'low (50-69%)';
      else range = 'very-low (0-49%)';

      facets.confidence_ranges[range] = (facets.confidence_ranges[range] || 0) + 1;
    }

    return facets;
  }

  private async generateRelatedSuggestions(query: DecisionQuery, results: Decision[]): Promise<string[]> {
    // Generate suggestions based on query and results
    const suggestions: string[] = [];

    // Suggest popular tags
    const tagCounts = new Map<string, number>();
    for (const decision of results) {
      for (const tag of decision.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    const popularTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    suggestions.push(...popularTags);

    return suggestions;
  }

  private exportToCsv(decisions: Decision[]): string {
    const headers = [
      'ID', 'Title', 'Type', 'Maker', 'Timestamp', 'Status',
      'Confidence', 'Component', 'Phase', 'Tags'
    ];

    const rows = decisions.map(d => [
      d.id,
      d.title,
      d.decision_type,
      d.decision_maker,
      d.timestamp.toISOString(),
      d.status,
      d.confidence_score.overall_confidence.toFixed(2),
      d.context.component,
      d.context.phase,
      d.tags.join(';')
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private exportToMarkdown(decisions: Decision[]): string {
    let markdown = '# Decision Log\n\n';

    for (const decision of decisions) {
      markdown += `## ${decision.title}\n\n`;
      markdown += `**ID:** ${decision.id}\n`;
      markdown += `**Type:** ${decision.decision_type}\n`;
      markdown += `**Maker:** ${decision.decision_maker}\n`;
      markdown += `**Date:** ${decision.timestamp.toLocaleDateString()}\n`;
      markdown += `**Status:** ${decision.status}\n`;
      markdown += `**Confidence:** ${(decision.confidence_score.overall_confidence * 100).toFixed(1)}%\n\n`;

      markdown += `**Description:** ${decision.description}\n\n`;

      markdown += `**Rationale:** ${decision.rationale.primary_reason}\n\n`;

      if (decision.alternatives_considered.length > 0) {
        markdown += `**Alternatives Considered:**\n`;
        for (const alt of decision.alternatives_considered) {
          markdown += `- ${alt.name}: ${alt.why_not_chosen}\n`;
        }
        markdown += '\n';
      }

      markdown += `**Tags:** ${decision.tags.join(', ')}\n\n`;
      markdown += '---\n\n';
    }

    return markdown;
  }

  private categorizeImpact(decisionType: DecisionType): ImpactCategory[] {
    // Return impact categories relevant to the decision type
    const categories: ImpactCategory[] = [];

    switch (decisionType) {
      case 'architectural':
        categories.push(
          { category: 'system_design', weight: 1.0 },
          { category: 'maintainability', weight: 0.9 },
          { category: 'scalability', weight: 0.8 }
        );
        break;
      case 'performance':
        categories.push(
          { category: 'performance', weight: 1.0 },
          { category: 'user_experience', weight: 0.8 },
          { category: 'resource_usage', weight: 0.7 }
        );
        break;
      // Add more cases as needed
    }

    return categories;
  }

  private identifyAffectedComponents(context: DecisionContext): string[] {
    const components = [context.component];

    // Add related components based on context
    if (context.technical_context?.integration_points) {
      components.push(...context.technical_context.integration_points);
    }

    return [...new Set(components)];
  }

  private async loadExistingDecisions(): Promise<void> {
    // Load decisions from persistent storage
    // Implementation would depend on storage mechanism (file, database, etc.)
  }

  private async persistDecisions(): Promise<void> {
    // Persist decisions to storage
    // Implementation would depend on storage mechanism
  }
}

// Supporting interfaces and types
interface DateRange {
  start: Date;
  end: Date;
}

interface ConfidenceRange {
  min: number;
  max: number;
}

interface SearchFacets {
  decision_types: Record<string, number>;
  decision_makers: Record<string, number>;
  components: Record<string, number>;
  statuses: Record<string, number>;
  tags: Record<string, number>;
  confidence_ranges: Record<string, number>;
}

interface BusinessContext {
  business_rules: string[];
  user_personas: string[];
  compliance_requirements: string[];
}

interface TechnicalContext {
  technologies_used: string[];
  integration_points: string[];
  performance_requirements: string[];
}

interface EnvironmentalFactor {
  factor: string;
  description: string;
  influence_level: ImpactLevel;
}

interface Constraint {
  type: 'technical' | 'business' | 'regulatory' | 'resource';
  description: string;
  severity: ImpactLevel;
}

interface Assumption {
  description: string;
  confidence: number;
  validation_criteria: string;
}

interface RiskAssessment {
  risk_level: ImpactLevel;
  identified_risks: Risk[];
  mitigation_strategies: string[];
  contingency_plans: string[];
}

interface Risk {
  description: string;
  probability: number;
  impact: ImpactLevel;
  mitigation: string;
}

interface TradeOff {
  aspect: string;
  positive_impact: string;
  negative_impact: string;
  net_assessment: 'positive' | 'negative' | 'neutral';
}

interface EffortEstimate {
  development_hours: number;
  testing_hours: number;
  documentation_hours: number;
  total_hours: number;
  complexity_score: number;
}

interface ImpactCategory {
  category: string;
  weight: number;
}

interface ReviewRecord {
  timestamp: Date;
  reviewer: string;
  action: string;
  previous_status?: DecisionStatus;
  new_status?: DecisionStatus;
  notes: string;
  confidence_at_review: number;
}

interface ValidationStatus {
  is_validated: boolean;
  validation_date: Date | null;
  validation_results: ValidationResult[];
  requires_review: boolean;
}

interface ValidationResult {
  criterion: string;
  passed: boolean;
  notes: string;
}

type SortField = 'timestamp' | 'confidence' | 'title' | 'status';

interface VelocityMetrics {
  decisions_per_day: number;
  average_time_to_implementation: number;
  review_cycle_time: number;
}

interface ConfidenceTrends {
  average_confidence: number;
  confidence_over_time: Array<{ date: Date; confidence: number }>;
  low_confidence_decisions: number;
}

interface ImpactDistribution {
  by_category: Record<string, number>;
  by_severity: Record<ImpactLevel, number>;
}

interface DecisionMakerActivity {
  decision_maker: string;
  decision_count: number;
  average_confidence: number;
  most_common_type: DecisionType;
}

interface RecommendationInsight {
  insight: string;
  supporting_data: any;
  action_items: string[];
}

// Supporting classes
class DecisionIndex {
  async indexDecision(decision: Decision): Promise<void> {
    // Implementation for indexing decisions for fast search
  }
}

class DecisionAnalyticsEngine {
  async generateAnalytics(decisions: Decision[]): Promise<DecisionAnalytics> {
    // Implementation for generating analytics
    return {
      decision_velocity: {
        decisions_per_day: 2.5,
        average_time_to_implementation: 48,
        review_cycle_time: 24
      },
      confidence_trends: {
        average_confidence: 0.78,
        confidence_over_time: [],
        low_confidence_decisions: 12
      },
      impact_distribution: {
        by_category: {},
        by_severity: {
          'negligible': 5,
          'low': 15,
          'medium': 25,
          'high': 10,
          'critical': 2
        }
      },
      decision_makers_activity: [],
      most_common_rationales: [],
      frequently_reviewed_types: [],
      success_rate_by_type: {},
      recommendation_insights: []
    };
  }
}

class ImpactTracker {
  async startTracking(decision: Decision): Promise<void> {
    // Implementation for starting impact tracking
  }

  async assessActualImpact(decision: Decision): Promise<ImpactAssessment> {
    // Implementation for assessing actual impact after implementation
    return {
      performance: 'medium',
      maintainability: 'high',
      scalability: 'medium',
      security: 'low',
      usability: 'medium',
      cost: 'low',
      timeline: 'medium',
      team_velocity: 'medium',
      technical_debt: 'low',
      custom_metrics: {}
    };
  }
}

class ConfidenceTracker {
  trackDecision(decision: Decision): void {
    // Implementation for tracking confidence metrics
  }
}
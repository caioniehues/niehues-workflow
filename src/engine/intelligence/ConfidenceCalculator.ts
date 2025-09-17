import { QuestioningSession, Answer, RequirementGap, EdgeCase } from '../questioning/AdaptiveQuestioningEngine';
import { InheritedContext } from '../context/ContextInheritance';

export interface ConfidenceScore {
  overall_confidence: number;
  component_scores: ComponentConfidenceScores;
  confidence_trend: ConfidenceTrend;
  factors_analyzed: ConfidenceFactor[];
  threshold_analysis: ThresholdAnalysis;
  recommendations: ConfidenceRecommendation[];
  calculation_metadata: CalculationMetadata;
}

export interface ComponentConfidenceScores {
  requirements_completeness: number;
  implementation_clarity: number;
  test_coverage_readiness: number;
  context_availability: number;
  edge_case_coverage: number;
  business_rule_clarity: number;
  technical_feasibility: number;
  risk_assessment: number;
  stakeholder_alignment: number;
  definition_precision: number;
}

export interface ConfidenceTrend {
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  rate_of_change: number;
  historical_scores: number[];
  predicted_next_score: number;
  confidence_in_prediction: number;
}

export interface ConfidenceFactor {
  name: string;
  weight: number;
  raw_score: number;
  normalized_score: number;
  contribution: number;
  assessment_method: string;
  evidence: string[];
  concerns: string[];
}

export interface ThresholdAnalysis {
  current_threshold: number;
  recommended_threshold: number;
  threshold_justification: string;
  risk_level: 'low' | 'medium' | 'high';
  proceed_recommendation: 'proceed' | 'continue_questioning' | 'pause_for_clarification';
}

export interface ConfidenceRecommendation {
  type: 'improvement' | 'risk_mitigation' | 'threshold_adjustment' | 'process_optimization';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action_items: string[];
  expected_confidence_gain: number;
  effort_required: 'low' | 'medium' | 'high';
}

export interface CalculationMetadata {
  calculation_timestamp: Date;
  calculator_version: string;
  factors_used: string[];
  total_factors_considered: number;
  calculation_time_ms: number;
  data_quality_score: number;
}

export interface HistoricalPattern {
  pattern_id: string;
  similar_tasks_count: number;
  average_confidence_at_success: number;
  confidence_variance: number;
  success_rate: number;
  failure_indicators: string[];
}

export interface DynamicThreshold {
  base_threshold: number;
  risk_adjustment: number;
  complexity_adjustment: number;
  historical_adjustment: number;
  stakeholder_adjustment: number;
  final_threshold: number;
  justification: string;
}

export class ConfidenceCalculator {
  private readonly DEFAULT_THRESHOLD = 85;
  private readonly VERSION = '1.0.0';
  private readonly HISTORICAL_WINDOW_SIZE = 10;

  private factorWeights: Map<string, number>;
  private thresholdCalculator: DynamicThresholdCalculator;
  private patternMatcher: HistoricalPatternMatcher;
  private trendAnalyzer: TrendAnalyzer;

  constructor() {
    this.initializeFactorWeights();
    this.thresholdCalculator = new DynamicThresholdCalculator();
    this.patternMatcher = new HistoricalPatternMatcher();
    this.trendAnalyzer = new TrendAnalyzer();
  }

  async calculateConfidence(session: QuestioningSession): Promise<ConfidenceScore> {
    const startTime = Date.now();
    console.log('🎯 Calculating comprehensive confidence score...');

    // Phase 1: Calculate component scores
    const componentScores = await this.calculateComponentScores(session);
    console.log(`  ✓ Component scores calculated`);

    // Phase 2: Analyze factors with evidence
    const factors = await this.analyzeConfidenceFactors(session, componentScores);
    console.log(`  ✓ ${factors.length} factors analyzed`);

    // Phase 3: Calculate overall confidence
    const overallConfidence = this.calculateOverallConfidence(componentScores, factors);
    console.log(`  ✓ Overall confidence: ${overallConfidence.toFixed(1)}%`);

    // Phase 4: Analyze trends
    const trend = await this.analyzeTrend(session, overallConfidence);
    console.log(`  ✓ Trend analysis: ${trend.direction}`);

    // Phase 5: Calculate dynamic threshold
    const thresholdAnalysis = await this.calculateDynamicThreshold(session, overallConfidence);
    console.log(`  ✓ Dynamic threshold: ${thresholdAnalysis.recommended_threshold}%`);

    // Phase 6: Generate recommendations
    const recommendations = await this.generateRecommendations(
      session,
      componentScores,
      factors,
      thresholdAnalysis
    );
    console.log(`  ✓ Generated ${recommendations.length} recommendations`);

    const calculationTime = Date.now() - startTime;

    const confidenceScore: ConfidenceScore = {
      overall_confidence: overallConfidence,
      component_scores: componentScores,
      confidence_trend: trend,
      factors_analyzed: factors,
      threshold_analysis: thresholdAnalysis,
      recommendations: recommendations,
      calculation_metadata: {
        calculation_timestamp: new Date(),
        calculator_version: this.VERSION,
        factors_used: factors.map(f => f.name),
        total_factors_considered: factors.length,
        calculation_time_ms: calculationTime,
        data_quality_score: this.assessDataQuality(session)
      }
    };

    console.log(`  🎉 Confidence calculation complete (${calculationTime}ms)`);
    return confidenceScore;
  }

  async calculateComponentScores(session: QuestioningSession): Promise<ComponentConfidenceScores> {
    return {
      requirements_completeness: await this.calculateRequirementsCompleteness(session),
      implementation_clarity: await this.calculateImplementationClarity(session),
      test_coverage_readiness: await this.calculateTestCoverageReadiness(session),
      context_availability: await this.calculateContextAvailability(session),
      edge_case_coverage: await this.calculateEdgeCaseCoverage(session),
      business_rule_clarity: await this.calculateBusinessRuleClarity(session),
      technical_feasibility: await this.calculateTechnicalFeasibility(session),
      risk_assessment: await this.calculateRiskAssessment(session),
      stakeholder_alignment: await this.calculateStakeholderAlignment(session),
      definition_precision: await this.calculateDefinitionPrecision(session)
    };
  }

  async analyzeConfidenceFactors(
    session: QuestioningSession,
    componentScores: ComponentConfidenceScores
  ): Promise<ConfidenceFactor[]> {
    const factors: ConfidenceFactor[] = [];

    // Requirements completeness factor
    factors.push({
      name: 'Requirements Completeness',
      weight: this.factorWeights.get('requirements_completeness') || 0.25,
      raw_score: componentScores.requirements_completeness,
      normalized_score: componentScores.requirements_completeness / 100,
      contribution: (componentScores.requirements_completeness / 100) * (this.factorWeights.get('requirements_completeness') || 0.25),
      assessment_method: 'Gap analysis and coverage mapping',
      evidence: this.gatherRequirementsEvidence(session),
      concerns: this.identifyRequirementsConcerns(session)
    });

    // Implementation clarity factor
    factors.push({
      name: 'Implementation Clarity',
      weight: this.factorWeights.get('implementation_clarity') || 0.20,
      raw_score: componentScores.implementation_clarity,
      normalized_score: componentScores.implementation_clarity / 100,
      contribution: (componentScores.implementation_clarity / 100) * (this.factorWeights.get('implementation_clarity') || 0.20),
      assessment_method: 'Technical specification analysis',
      evidence: this.gatherImplementationEvidence(session),
      concerns: this.identifyImplementationConcerns(session)
    });

    // Test coverage readiness factor
    factors.push({
      name: 'Test Coverage Readiness',
      weight: this.factorWeights.get('test_coverage_readiness') || 0.15,
      raw_score: componentScores.test_coverage_readiness,
      normalized_score: componentScores.test_coverage_readiness / 100,
      contribution: (componentScores.test_coverage_readiness / 100) * (this.factorWeights.get('test_coverage_readiness') || 0.15),
      assessment_method: 'Testability and scenario coverage analysis',
      evidence: this.gatherTestingEvidence(session),
      concerns: this.identifyTestingConcerns(session)
    });

    // Context availability factor
    factors.push({
      name: 'Context Availability',
      weight: this.factorWeights.get('context_availability') || 0.15,
      raw_score: componentScores.context_availability,
      normalized_score: componentScores.context_availability / 100,
      contribution: (componentScores.context_availability / 100) * (this.factorWeights.get('context_availability') || 0.15),
      assessment_method: 'Context richness and inheritance analysis',
      evidence: this.gatherContextEvidence(session),
      concerns: this.identifyContextConcerns(session)
    });

    // Edge case coverage factor
    factors.push({
      name: 'Edge Case Coverage',
      weight: this.factorWeights.get('edge_case_coverage') || 0.10,
      raw_score: componentScores.edge_case_coverage,
      normalized_score: componentScores.edge_case_coverage / 100,
      contribution: (componentScores.edge_case_coverage / 100) * (this.factorWeights.get('edge_case_coverage') || 0.10),
      assessment_method: 'Edge case identification and handling analysis',
      evidence: this.gatherEdgeCaseEvidence(session),
      concerns: this.identifyEdgeCaseConcerns(session)
    });

    // Additional factors for business and technical aspects
    factors.push(...await this.calculateAdditionalFactors(session, componentScores));

    return factors;
  }

  private async calculateRequirementsCompleteness(session: QuestioningSession): Promise<number> {
    const totalAnswers = session.answers_received.length;
    const criticalGaps = session.identified_gaps.filter(gap => gap.severity === 'critical').length;
    const highGaps = session.identified_gaps.filter(gap => gap.severity === 'high').length;

    // Base score from answer coverage
    let baseScore = Math.min(90, totalAnswers * 8); // Each answer worth ~8 points, max 90

    // Penalize for gaps
    const gapPenalty = (criticalGaps * 15) + (highGaps * 8);
    const gapAdjustedScore = Math.max(0, baseScore - gapPenalty);

    // Bonus for comprehensive coverage
    const comprehensivenessBonus = this.calculateComprehensivenessBonu‚s(session);

    return Math.min(100, gapAdjustedScore + comprehensivenessBonus);
  }

  private async calculateImplementationClarity(session: QuestioningSession): Promise<number> {
    let score = 0;

    // Technical specification clarity
    const technicalAnswers = session.answers_received.filter(answer =>
      this.isTechnicalAnswer(answer)
    );
    score += Math.min(40, technicalAnswers.length * 5);

    // Architecture clarity
    const architecturalClarity = this.assessArchitecturalClarity(session);
    score += architecturalClarity * 0.3;

    // Interface definitions
    const interfaceClarity = this.assessInterfaceClarity(session);
    score += interfaceClarity * 0.2;

    // Data structure clarity
    const dataClarity = this.assessDataStructureClarity(session);
    score += dataClarity * 0.1;

    return Math.min(100, score);
  }

  private async calculateTestCoverageReadiness(session: QuestioningSession): Promise<number> {
    let score = 0;

    // Testable requirements identified
    const testableRequirements = this.countTestableRequirements(session);
    score += Math.min(40, testableRequirements * 8);

    // Edge cases for testing
    const testableEdgeCases = session.edge_cases.length;
    score += Math.min(25, testableEdgeCases * 5);

    // Error scenarios identified
    const errorScenarios = this.countErrorScenarios(session);
    score += Math.min(20, errorScenarios * 4);

    // Integration points clarity
    const integrationClarity = this.assessIntegrationClarity(session);
    score += integrationClarity * 0.15;

    return Math.min(100, score);
  }

  private async calculateContextAvailability(session: QuestioningSession): Promise<number> {
    let score = 0;

    // Inherited context richness
    if (session.task_context.existing_context) {
      const contextRichness = this.assessContextRichness(session.task_context.existing_context);
      score += contextRichness * 0.4;
    }

    // Business context availability
    if (session.task_context.business_context) {
      score += 25;
    }

    // Technical context availability
    if (session.task_context.technical_context) {
      score += 20;
    }

    // Stakeholder information
    const stakeholderInfo = session.task_context.stakeholders.length * 5;
    score += Math.min(15, stakeholderInfo);

    // Historical patterns available
    const historicalPatterns = await this.patternMatcher.findSimilarTasks(session.task_context);
    score += Math.min(15, historicalPatterns.length * 3);

    return Math.min(100, score);
  }

  private async calculateEdgeCaseCoverage(session: QuestioningSession): Promise<number> {
    const edgeCases = session.edge_cases;
    let score = 0;

    // Number of edge cases identified
    score += Math.min(50, edgeCases.length * 10);

    // Edge case categorization
    const categories = new Set(edgeCases.map(ec => ec.priority));
    score += categories.size * 10;

    // Critical edge cases addressed
    const criticalEdgeCases = edgeCases.filter(ec => ec.priority === 'critical');
    score += criticalEdgeCases.length * 15;

    // Edge case handling strategies
    const handlingStrategies = edgeCases.filter(ec => ec.testing_strategy).length;
    score += Math.min(25, handlingStrategies * 5);

    return Math.min(100, score);
  }

  private async calculateBusinessRuleClarity(session: QuestioningSession): Promise<number> {
    let score = 0;

    // Business rule answers
    const businessAnswers = session.answers_received.filter(answer =>
      this.isBusinessRuleAnswer(answer)
    );
    score += Math.min(60, businessAnswers.length * 12);

    // Business context completeness
    if (session.task_context.business_context) {
      const businessContext = session.task_context.business_context;
      score += businessContext.business_rules.length * 5;
      score += businessContext.user_personas.length * 3;
      score += businessContext.compliance_requirements.length * 4;
    }

    return Math.min(100, score);
  }

  private async calculateTechnicalFeasibility(session: QuestioningSession): Promise<number> {
    let score = 85; // Start with high feasibility assumption

    // Technology constraints
    const technicalConstraints = this.identifyTechnicalConstraints(session);
    score -= technicalConstraints.length * 5;

    // Performance requirements feasibility
    const performanceRisks = this.assessPerformanceRisks(session);
    score -= performanceRisks * 10;

    // Integration complexity
    const integrationComplexity = this.assessIntegrationComplexity(session);
    score -= integrationComplexity * 8;

    // Resource availability
    const resourceConstraints = this.assessResourceConstraints(session);
    score -= resourceConstraints * 6;

    return Math.max(0, Math.min(100, score));
  }

  private async calculateRiskAssessment(session: QuestioningSession): Promise<number> {
    let riskScore = 0;

    // Identified risks
    const identifiedRisks = this.identifyProjectRisks(session);
    riskScore += identifiedRisks.high_risk_count * 15;
    riskScore += identifiedRisks.medium_risk_count * 8;
    riskScore += identifiedRisks.low_risk_count * 3;

    // Mitigation strategies
    const mitigationStrategies = this.countMitigationStrategies(session);
    const mitigationBonus = Math.min(30, mitigationStrategies * 10);

    // Convert risk score to confidence (inverse relationship)
    const confidenceScore = Math.max(0, 100 - riskScore + mitigationBonus);
    return Math.min(100, confidenceScore);
  }

  private async calculateStakeholderAlignment(session: QuestioningSession): Promise<number> {
    let score = 0;

    // Stakeholder identification
    const stakeholderCount = session.task_context.stakeholders.length;
    score += Math.min(30, stakeholderCount * 10);

    // Stakeholder input in answers
    const stakeholderMentions = this.countStakeholderMentions(session);
    score += Math.min(40, stakeholderMentions * 8);

    // Consensus indicators
    const consensusIndicators = this.identifyConsensusIndicators(session);
    score += Math.min(30, consensusIndicators * 6);

    return Math.min(100, score);
  }

  private async calculateDefinitionPrecision(session: QuestioningSession): Promise<number> {
    let score = 0;

    // Precise terminology usage
    const preciseTerms = this.countPreciseTerminology(session);
    score += Math.min(40, preciseTerms * 4);

    // Quantified requirements
    const quantifiedRequirements = this.countQuantifiedRequirements(session);
    score += Math.min(30, quantifiedRequirements * 6);

    // Clear acceptance criteria
    const clearCriteria = this.assessAcceptanceCriteriaClarity(session);
    score += clearCriteria * 0.3;

    return Math.min(100, score);
  }

  private calculateOverallConfidence(
    componentScores: ComponentConfidenceScores,
    factors: ConfidenceFactor[]
  ): number {
    // Weighted average based on factor contributions
    const totalContribution = factors.reduce((sum, factor) => sum + factor.contribution, 0);
    const weightedScore = totalContribution * 100;

    // Apply adjustment for confidence in calculation
    const calculationConfidence = this.assessCalculationConfidence(factors);
    const adjustedScore = weightedScore * calculationConfidence;

    return Math.min(100, Math.max(0, adjustedScore));
  }

  private async analyzeTrend(
    session: QuestioningSession,
    currentConfidence: number
  ): Promise<ConfidenceTrend> {
    return await this.trendAnalyzer.analyzeTrend(session, currentConfidence);
  }

  private async calculateDynamicThreshold(
    session: QuestioningSession,
    currentConfidence: number
  ): Promise<ThresholdAnalysis> {
    const dynamicThreshold = await this.thresholdCalculator.calculateThreshold(session);

    return {
      current_threshold: this.DEFAULT_THRESHOLD,
      recommended_threshold: dynamicThreshold.final_threshold,
      threshold_justification: dynamicThreshold.justification,
      risk_level: this.assessRiskLevel(session, currentConfidence),
      proceed_recommendation: this.generateProceedRecommendation(
        currentConfidence,
        dynamicThreshold.final_threshold,
        session
      )
    };
  }

  private async generateRecommendations(
    session: QuestioningSession,
    componentScores: ComponentConfidenceScores,
    factors: ConfidenceFactor[],
    thresholdAnalysis: ThresholdAnalysis
  ): Promise<ConfidenceRecommendation[]> {
    const recommendations: ConfidenceRecommendation[] = [];

    // Analyze weak areas and generate improvement recommendations
    const weakAreas = this.identifyWeakAreas(componentScores);
    for (const area of weakAreas) {
      recommendations.push(await this.generateImprovementRecommendation(area, session));
    }

    // Risk mitigation recommendations
    const riskRecommendations = await this.generateRiskMitigationRecommendations(session);
    recommendations.push(...riskRecommendations);

    // Threshold adjustment recommendations
    if (thresholdAnalysis.recommended_threshold !== thresholdAnalysis.current_threshold) {
      recommendations.push(this.generateThresholdRecommendation(thresholdAnalysis));
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private initializeFactorWeights(): void {
    this.factorWeights = new Map([
      ['requirements_completeness', 0.25],
      ['implementation_clarity', 0.20],
      ['test_coverage_readiness', 0.15],
      ['context_availability', 0.15],
      ['edge_case_coverage', 0.10],
      ['business_rule_clarity', 0.08],
      ['technical_feasibility', 0.04],
      ['risk_assessment', 0.02],
      ['stakeholder_alignment', 0.01]
    ]);
  }

  // Additional helper methods would be implemented here...
  // (Implementation details abbreviated for length)
}

// Supporting classes for specialized calculations
class DynamicThresholdCalculator {
  async calculateThreshold(session: QuestioningSession): Promise<DynamicThreshold> {
    // Implementation would calculate dynamic threshold based on multiple factors
    return {
      base_threshold: 85,
      risk_adjustment: 0,
      complexity_adjustment: 0,
      historical_adjustment: 0,
      stakeholder_adjustment: 0,
      final_threshold: 85,
      justification: 'Standard threshold applied'
    };
  }
}

class HistoricalPatternMatcher {
  async findSimilarTasks(taskContext: any): Promise<HistoricalPattern[]> {
    // Implementation would find similar historical tasks
    return [];
  }
}

class TrendAnalyzer {
  async analyzeTrend(session: QuestioningSession, currentConfidence: number): Promise<ConfidenceTrend> {
    // Implementation would analyze confidence trends
    return {
      direction: 'increasing',
      rate_of_change: 5,
      historical_scores: [currentConfidence],
      predicted_next_score: currentConfidence + 5,
      confidence_in_prediction: 0.8
    };
  }
}
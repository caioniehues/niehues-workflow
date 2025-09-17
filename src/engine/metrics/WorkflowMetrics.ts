import { EventEmitter } from 'events';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface WorkflowMetric {
  id: string;
  timestamp: string;
  session_id: string;
  phase: WorkflowPhase;
  metric_type: MetricType;
  value: number | string | boolean;
  unit?: string;
  context: MetricContext;
  tags: string[];
}

export type WorkflowPhase =
  | 'brainstorm'
  | 'specify'
  | 'shard'
  | 'decompose'
  | 'implement'
  | 'validate'
  | 'complete';

export type MetricType =
  | 'duration'
  | 'confidence'
  | 'question_count'
  | 'context_efficiency'
  | 'pattern_reuse'
  | 'constitutional_compliance'
  | 'velocity'
  | 'quality_score'
  | 'error_rate'
  | 'test_coverage';

export interface MetricContext {
  requirement_id?: string;
  agent_name?: string;
  task_id?: string;
  file_path?: string;
  user_id?: string;
  project_id?: string;
  additional_data?: Record<string, any>;
}

export interface PhaseMetrics {
  phase: WorkflowPhase;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  questions_asked: number;
  confidence_start: number;
  confidence_end: number;
  confidence_progression: number[];
  context_size_bytes: number;
  context_efficiency_score: number;
  patterns_identified: number;
  patterns_reused: number;
  constitutional_violations: number;
  tasks_completed: number;
  test_coverage_achieved: number;
  quality_metrics: QualityMetrics;
  agent_interactions: AgentInteraction[];
}

export interface QualityMetrics {
  code_quality_score: number;
  maintainability_index: number;
  technical_debt_ratio: number;
  bug_density: number;
  first_pass_success_rate: number;
  rework_percentage: number;
}

export interface AgentInteraction {
  agent_name: string;
  start_time: string;
  end_time: string;
  actions_performed: number;
  boundary_violations: number;
  success_rate: number;
}

export interface SessionMetrics {
  session_id: string;
  start_time: string;
  end_time?: string;
  total_duration_ms?: number;
  phases: PhaseMetrics[];
  overall_confidence_progression: number[];
  total_questions_asked: number;
  total_context_processed_bytes: number;
  total_patterns_discovered: number;
  total_patterns_reused: number;
  constitutional_compliance_rate: number;
  velocity_metrics: VelocityMetrics;
  outcome_metrics: OutcomeMetrics;
}

export interface VelocityMetrics {
  requirements_per_hour: number;
  tasks_per_hour: number;
  lines_of_code_per_hour: number;
  tests_written_per_hour: number;
  defects_per_kloc: number;
  time_to_first_working_solution: number;
}

export interface OutcomeMetrics {
  requirements_fully_satisfied: number;
  total_requirements: number;
  test_coverage_percentage: number;
  code_quality_score: number;
  user_satisfaction_score?: number;
  business_value_delivered?: number;
}

export interface MetricsSummary {
  time_period: string;
  total_sessions: number;
  average_session_duration: number;
  average_confidence_improvement: number;
  average_context_efficiency: number;
  pattern_reuse_rate: number;
  constitutional_compliance_rate: number;
  velocity_trends: VelocityTrends;
  quality_trends: QualityTrends;
  recommendations: MetricRecommendation[];
}

export interface VelocityTrends {
  requirements_velocity_trend: number; // Positive = improving
  task_completion_trend: number;
  quality_velocity_trend: number;
  learning_curve_factor: number;
}

export interface QualityTrends {
  code_quality_trend: number;
  test_coverage_trend: number;
  defect_trend: number;
  maintainability_trend: number;
}

export interface MetricRecommendation {
  category: 'velocity' | 'quality' | 'process' | 'learning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact_estimate: string;
  effort_estimate: string;
  metrics_supporting: string[];
}

export interface Dashboard {
  generated_at: string;
  time_range: string;
  summary: MetricsSummary;
  phase_breakdowns: PhaseBreakdown[];
  agent_performance: AgentPerformance[];
  quality_dashboard: QualityDashboard;
  velocity_dashboard: VelocityDashboard;
  constitutional_dashboard: ConstitutionalDashboard;
  recommendations: MetricRecommendation[];
}

export interface PhaseBreakdown {
  phase: WorkflowPhase;
  average_duration: number;
  success_rate: number;
  common_bottlenecks: string[];
  efficiency_score: number;
}

export interface AgentPerformance {
  agent_name: string;
  total_interactions: number;
  average_success_rate: number;
  boundary_violation_rate: number;
  efficiency_score: number;
  specialization_effectiveness: number;
}

export interface QualityDashboard {
  overall_quality_score: number;
  quality_by_phase: Record<WorkflowPhase, number>;
  test_coverage_distribution: number[];
  defect_categories: Record<string, number>;
  quality_gates_passed: number;
  quality_gates_failed: number;
}

export interface VelocityDashboard {
  current_velocity: VelocityMetrics;
  velocity_history: VelocityMetrics[];
  velocity_by_phase: Record<WorkflowPhase, number>;
  bottleneck_analysis: BottleneckAnalysis;
  acceleration_opportunities: string[];
}

export interface ConstitutionalDashboard {
  overall_compliance_rate: number;
  violations_by_principle: Record<string, number>;
  compliance_trends: number[];
  enforcement_effectiveness: number;
  critical_violations: ConstitutionalViolation[];
}

export interface BottleneckAnalysis {
  primary_bottleneck: string;
  bottleneck_impact: number;
  resolution_suggestions: string[];
  affected_phases: WorkflowPhase[];
}

export interface ConstitutionalViolation {
  principle: string;
  violation_type: string;
  frequency: number;
  impact_severity: 'low' | 'medium' | 'high' | 'critical';
  trend: 'increasing' | 'stable' | 'decreasing';
}

export class WorkflowMetrics extends EventEmitter {
  private currentSession: SessionMetrics | null = null;
  private currentPhase: PhaseMetrics | null = null;
  private metrics: WorkflowMetric[] = [];
  private sessionsHistory: SessionMetrics[] = [];
  private metricsStoragePath: string;

  constructor(storagePath: string = '.nexus/metrics') {
    super();
    this.metricsStoragePath = storagePath;
    this.ensureStorageDirectoryExists();
    this.loadHistoricalData();
    this.setupAutoSave();
  }

  // Session management
  async startSession(projectId: string, userId?: string): Promise<string> {
    const sessionId = this.generateSessionId();
    console.log(`📊 WorkflowMetrics: Starting session ${sessionId}`);

    this.currentSession = {
      session_id: sessionId,
      start_time: new Date().toISOString(),
      phases: [],
      overall_confidence_progression: [],
      total_questions_asked: 0,
      total_context_processed_bytes: 0,
      total_patterns_discovered: 0,
      total_patterns_reused: 0,
      constitutional_compliance_rate: 0,
      velocity_metrics: {
        requirements_per_hour: 0,
        tasks_per_hour: 0,
        lines_of_code_per_hour: 0,
        tests_written_per_hour: 0,
        defects_per_kloc: 0,
        time_to_first_working_solution: 0
      },
      outcome_metrics: {
        requirements_fully_satisfied: 0,
        total_requirements: 0,
        test_coverage_percentage: 0,
        code_quality_score: 0
      }
    };

    this.recordMetric('session_start', sessionId, 'brainstorm', {
      project_id: projectId,
      user_id: userId
    });

    this.emit('session:started', sessionId);
    return sessionId;
  }

  async endSession(): Promise<SessionMetrics> {
    if (!this.currentSession) {
      throw new Error('No active session to end');
    }

    console.log(`📊 WorkflowMetrics: Ending session ${this.currentSession.session_id}`);

    // End current phase if active
    if (this.currentPhase) {
      await this.endPhase();
    }

    // Calculate final session metrics
    this.currentSession.end_time = new Date().toISOString();
    this.currentSession.total_duration_ms = this.calculateDuration(
      this.currentSession.start_time,
      this.currentSession.end_time
    );

    // Calculate derived metrics
    this.calculateSessionDerivedMetrics();

    // Store session
    this.sessionsHistory.push(this.currentSession);
    this.saveSessionData(this.currentSession);

    const completedSession = this.currentSession;
    this.currentSession = null;

    this.emit('session:ended', completedSession);
    return completedSession;
  }

  // Phase management
  async startPhase(phase: WorkflowPhase, context?: MetricContext): Promise<void> {
    console.log(`📊 WorkflowMetrics: Starting phase ${phase}`);

    // End previous phase if active
    if (this.currentPhase) {
      await this.endPhase();
    }

    this.currentPhase = {
      phase,
      start_time: new Date().toISOString(),
      questions_asked: 0,
      confidence_start: 0,
      confidence_end: 0,
      confidence_progression: [],
      context_size_bytes: 0,
      context_efficiency_score: 0,
      patterns_identified: 0,
      patterns_reused: 0,
      constitutional_violations: 0,
      tasks_completed: 0,
      test_coverage_achieved: 0,
      quality_metrics: {
        code_quality_score: 0,
        maintainability_index: 0,
        technical_debt_ratio: 0,
        bug_density: 0,
        first_pass_success_rate: 0,
        rework_percentage: 0
      },
      agent_interactions: []
    };

    this.recordMetric('phase_start', phase, phase, context);
    this.emit('phase:started', phase);
  }

  async endPhase(): Promise<PhaseMetrics> {
    if (!this.currentPhase) {
      throw new Error('No active phase to end');
    }

    console.log(`📊 WorkflowMetrics: Ending phase ${this.currentPhase.phase}`);

    this.currentPhase.end_time = new Date().toISOString();
    this.currentPhase.duration_ms = this.calculateDuration(
      this.currentPhase.start_time,
      this.currentPhase.end_time
    );

    // Calculate phase efficiency scores
    this.calculatePhaseEfficiencyScores();

    // Add to current session
    if (this.currentSession) {
      this.currentSession.phases.push(this.currentPhase);
    }

    this.recordMetric('phase_end', this.currentPhase.phase, this.currentPhase.phase);

    const completedPhase = this.currentPhase;
    this.currentPhase = null;

    this.emit('phase:ended', completedPhase);
    return completedPhase;
  }

  // Metric recording methods
  recordConfidenceUpdate(confidence: number, context?: MetricContext): void {
    if (this.currentPhase) {
      this.currentPhase.confidence_progression.push(confidence);
      this.currentPhase.confidence_end = confidence;

      if (this.currentPhase.confidence_progression.length === 1) {
        this.currentPhase.confidence_start = confidence;
      }
    }

    if (this.currentSession) {
      this.currentSession.overall_confidence_progression.push(confidence);
    }

    this.recordMetric('confidence', confidence, this.getCurrentPhase(), context);
  }

  recordQuestionAsked(questionText: string, context?: MetricContext): void {
    if (this.currentPhase) {
      this.currentPhase.questions_asked++;
    }

    if (this.currentSession) {
      this.currentSession.total_questions_asked++;
    }

    this.recordMetric('question_count', 1, this.getCurrentPhase(), {
      ...context,
      question_text: questionText
    });
  }

  recordContextProcessed(sizeBytes: number, efficiencyScore: number, context?: MetricContext): void {
    if (this.currentPhase) {
      this.currentPhase.context_size_bytes += sizeBytes;
      this.currentPhase.context_efficiency_score = efficiencyScore;
    }

    if (this.currentSession) {
      this.currentSession.total_context_processed_bytes += sizeBytes;
    }

    this.recordMetric('context_efficiency', efficiencyScore, this.getCurrentPhase(), context);
  }

  recordPatternActivity(identified: number, reused: number, context?: MetricContext): void {
    if (this.currentPhase) {
      this.currentPhase.patterns_identified += identified;
      this.currentPhase.patterns_reused += reused;
    }

    if (this.currentSession) {
      this.currentSession.total_patterns_discovered += identified;
      this.currentSession.total_patterns_reused += reused;
    }

    this.recordMetric('pattern_reuse', reused, this.getCurrentPhase(), context);
  }

  recordConstitutionalViolation(principle: string, violationType: string, context?: MetricContext): void {
    if (this.currentPhase) {
      this.currentPhase.constitutional_violations++;
    }

    this.recordMetric('constitutional_compliance', 0, this.getCurrentPhase(), {
      ...context,
      principle,
      violation_type: violationType
    });

    this.emit('constitutional:violation', { principle, violationType, context });
  }

  recordTaskCompletion(taskId: string, testCoverage: number, qualityScore: number, context?: MetricContext): void {
    if (this.currentPhase) {
      this.currentPhase.tasks_completed++;
      this.currentPhase.test_coverage_achieved = Math.max(
        this.currentPhase.test_coverage_achieved,
        testCoverage
      );
    }

    this.recordMetric('velocity', 1, this.getCurrentPhase(), {
      ...context,
      task_id: taskId,
      test_coverage: testCoverage,
      quality_score: qualityScore
    });
  }

  recordAgentInteraction(
    agentName: string,
    startTime: string,
    endTime: string,
    actionsPerformed: number,
    boundaryViolations: number,
    context?: MetricContext
  ): void {
    const interaction: AgentInteraction = {
      agent_name: agentName,
      start_time: startTime,
      end_time: endTime,
      actions_performed: actionsPerformed,
      boundary_violations: boundaryViolations,
      success_rate: boundaryViolations === 0 ? 100 : Math.max(0, 100 - (boundaryViolations / actionsPerformed * 100))
    };

    if (this.currentPhase) {
      this.currentPhase.agent_interactions.push(interaction);
    }

    this.recordMetric('agent_performance', interaction.success_rate, this.getCurrentPhase(), {
      ...context,
      agent_name: agentName
    });
  }

  // Analysis and reporting
  async generateDashboard(timeRange: string = '30d'): Promise<Dashboard> {
    console.log('📈 WorkflowMetrics: Generating comprehensive dashboard');

    const relevantSessions = this.getSessionsInTimeRange(timeRange);
    const summary = this.calculateMetricsSummary(relevantSessions, timeRange);

    const dashboard: Dashboard = {
      generated_at: new Date().toISOString(),
      time_range: timeRange,
      summary,
      phase_breakdowns: this.generatePhaseBreakdowns(relevantSessions),
      agent_performance: this.generateAgentPerformanceReport(relevantSessions),
      quality_dashboard: this.generateQualityDashboard(relevantSessions),
      velocity_dashboard: this.generateVelocityDashboard(relevantSessions),
      constitutional_dashboard: this.generateConstitutionalDashboard(relevantSessions),
      recommendations: this.generateRecommendations(summary, relevantSessions)
    };

    this.saveDashboard(dashboard);
    this.emit('dashboard:generated', dashboard);

    return dashboard;
  }

  async getVelocityTrends(timeRange: string = '30d'): Promise<VelocityTrends> {
    const sessions = this.getSessionsInTimeRange(timeRange);

    // Calculate velocity trends over time
    const velocityData = sessions.map(s => s.velocity_metrics);

    return {
      requirements_velocity_trend: this.calculateTrend(velocityData.map(v => v.requirements_per_hour)),
      task_completion_trend: this.calculateTrend(velocityData.map(v => v.tasks_per_hour)),
      quality_velocity_trend: this.calculateTrend(velocityData.map(v => v.lines_of_code_per_hour)),
      learning_curve_factor: this.calculateLearningCurve(velocityData)
    };
  }

  async getQualityTrends(timeRange: string = '30d'): Promise<QualityTrends> {
    const sessions = this.getSessionsInTimeRange(timeRange);

    return {
      code_quality_trend: this.calculateTrend(sessions.map(s => s.outcome_metrics.code_quality_score)),
      test_coverage_trend: this.calculateTrend(sessions.map(s => s.outcome_metrics.test_coverage_percentage)),
      defect_trend: this.calculateTrend(sessions.map(s => s.velocity_metrics.defects_per_kloc)),
      maintainability_trend: this.calculateTrend(
        sessions.flatMap(s => s.phases.map(p => p.quality_metrics.maintainability_index))
      )
    };
  }

  // Metric calculation helpers
  private calculateSessionDerivedMetrics(): void {
    if (!this.currentSession) return;

    const totalDurationHours = (this.currentSession.total_duration_ms || 0) / (1000 * 60 * 60);

    // Calculate velocity metrics
    this.currentSession.velocity_metrics = {
      requirements_per_hour: this.currentSession.outcome_metrics.total_requirements / totalDurationHours,
      tasks_per_hour: this.currentSession.phases.reduce((sum, p) => sum + p.tasks_completed, 0) / totalDurationHours,
      lines_of_code_per_hour: this.estimateLinesOfCode() / totalDurationHours,
      tests_written_per_hour: this.estimateTestsWritten() / totalDurationHours,
      defects_per_kloc: this.calculateDefectDensity(),
      time_to_first_working_solution: this.calculateTimeToFirstSolution()
    };

    // Calculate constitutional compliance
    const totalViolations = this.currentSession.phases.reduce((sum, p) => sum + p.constitutional_violations, 0);
    const totalActions = this.currentSession.phases.reduce((sum, p) => sum + p.tasks_completed, 0);
    this.currentSession.constitutional_compliance_rate = totalActions > 0
      ? Math.max(0, 100 - (totalViolations / totalActions * 100))
      : 100;
  }

  private calculatePhaseEfficiencyScores(): void {
    if (!this.currentPhase) return;

    // Context efficiency: bytes processed per unit of value delivered
    const valueDelivered = this.currentPhase.tasks_completed + (this.currentPhase.patterns_identified * 0.5);
    this.currentPhase.context_efficiency_score = valueDelivered > 0
      ? this.currentPhase.context_size_bytes / valueDelivered
      : 0;

    // Overall quality score
    const qualityMetrics = this.currentPhase.quality_metrics;
    qualityMetrics.code_quality_score = this.calculateOverallQualityScore();
  }

  private calculateOverallQualityScore(): number {
    if (!this.currentPhase) return 0;

    const qm = this.currentPhase.quality_metrics;
    return (
      qm.maintainability_index * 0.3 +
      (100 - qm.technical_debt_ratio) * 0.2 +
      (100 - qm.bug_density) * 0.2 +
      qm.first_pass_success_rate * 0.2 +
      (100 - qm.rework_percentage) * 0.1
    );
  }

  private generatePhaseBreakdowns(sessions: SessionMetrics[]): PhaseBreakdown[] {
    const phaseData: Record<WorkflowPhase, { durations: number[], successes: number[], total: number }> = {
      brainstorm: { durations: [], successes: [], total: 0 },
      specify: { durations: [], successes: [], total: 0 },
      shard: { durations: [], successes: [], total: 0 },
      decompose: { durations: [], successes: [], total: 0 },
      implement: { durations: [], successes: [], total: 0 },
      validate: { durations: [], successes: [], total: 0 },
      complete: { durations: [], successes: [], total: 0 }
    };

    // Collect data for each phase
    for (const session of sessions) {
      for (const phase of session.phases) {
        if (phase.duration_ms) {
          phaseData[phase.phase].durations.push(phase.duration_ms);
          phaseData[phase.phase].successes.push(phase.constitutional_violations === 0 ? 1 : 0);
          phaseData[phase.phase].total++;
        }
      }
    }

    // Generate breakdowns
    return Object.entries(phaseData).map(([phaseKey, data]) => {
      const phase = phaseKey as WorkflowPhase;
      return {
        phase,
        average_duration: this.calculateAverage(data.durations),
        success_rate: data.total > 0 ? (data.successes.reduce((a, b) => a + b, 0) / data.total) * 100 : 0,
        common_bottlenecks: this.identifyPhaseBottlenecks(phase, sessions),
        efficiency_score: this.calculatePhaseEfficiency(phase, sessions)
      };
    });
  }

  private generateAgentPerformanceReport(sessions: SessionMetrics[]): AgentPerformance[] {
    const agentData: Record<string, {
      interactions: AgentInteraction[],
      totalInteractions: number
    }> = {};

    // Collect agent interaction data
    for (const session of sessions) {
      for (const phase of session.phases) {
        for (const interaction of phase.agent_interactions) {
          if (!agentData[interaction.agent_name]) {
            agentData[interaction.agent_name] = { interactions: [], totalInteractions: 0 };
          }
          agentData[interaction.agent_name].interactions.push(interaction);
          agentData[interaction.agent_name].totalInteractions++;
        }
      }
    }

    // Generate performance reports
    return Object.entries(agentData).map(([agentName, data]) => ({
      agent_name: agentName,
      total_interactions: data.totalInteractions,
      average_success_rate: this.calculateAverage(data.interactions.map(i => i.success_rate)),
      boundary_violation_rate: this.calculateAverage(data.interactions.map(i => i.boundary_violations)),
      efficiency_score: this.calculateAgentEfficiency(data.interactions),
      specialization_effectiveness: this.calculateSpecializationEffectiveness(agentName, data.interactions)
    }));
  }

  private generateQualityDashboard(sessions: SessionMetrics[]): QualityDashboard {
    const allPhases = sessions.flatMap(s => s.phases);

    return {
      overall_quality_score: this.calculateAverage(
        sessions.map(s => s.outcome_metrics.code_quality_score)
      ),
      quality_by_phase: this.calculateQualityByPhase(allPhases),
      test_coverage_distribution: this.calculateTestCoverageDistribution(sessions),
      defect_categories: this.calculateDefectCategories(sessions),
      quality_gates_passed: this.countQualityGatesPassed(sessions),
      quality_gates_failed: this.countQualityGatesFailed(sessions)
    };
  }

  private generateVelocityDashboard(sessions: SessionMetrics[]): VelocityDashboard {
    const currentVelocity = sessions.length > 0
      ? sessions[sessions.length - 1].velocity_metrics
      : this.getDefaultVelocityMetrics();

    return {
      current_velocity: currentVelocity,
      velocity_history: sessions.map(s => s.velocity_metrics),
      velocity_by_phase: this.calculateVelocityByPhase(sessions),
      bottleneck_analysis: this.analyzeBottlenecks(sessions),
      acceleration_opportunities: this.identifyAccelerationOpportunities(sessions)
    };
  }

  private generateConstitutionalDashboard(sessions: SessionMetrics[]): ConstitutionalDashboard {
    return {
      overall_compliance_rate: this.calculateAverage(sessions.map(s => s.constitutional_compliance_rate)),
      violations_by_principle: this.calculateViolationsByPrinciple(sessions),
      compliance_trends: sessions.map(s => s.constitutional_compliance_rate),
      enforcement_effectiveness: this.calculateEnforcementEffectiveness(sessions),
      critical_violations: this.identifyCriticalViolations(sessions)
    };
  }

  private generateRecommendations(summary: MetricsSummary, sessions: SessionMetrics[]): MetricRecommendation[] {
    const recommendations: MetricRecommendation[] = [];

    // Velocity recommendations
    if (summary.velocity_trends.requirements_velocity_trend < 0) {
      recommendations.push({
        category: 'velocity',
        priority: 'high',
        title: 'Improve Requirements Processing Speed',
        description: 'Requirements velocity is declining. Focus on context optimization and pattern reuse.',
        impact_estimate: 'Could improve velocity by 25-40%',
        effort_estimate: '2-3 weeks',
        metrics_supporting: ['requirements_velocity_trend', 'pattern_reuse_rate']
      });
    }

    // Quality recommendations
    if (summary.quality_trends.code_quality_trend < 0) {
      recommendations.push({
        category: 'quality',
        priority: 'high',
        title: 'Address Quality Degradation',
        description: 'Code quality metrics are declining. Review TDD enforcement and refactoring practices.',
        impact_estimate: 'Could improve quality scores by 15-30%',
        effort_estimate: '1-2 weeks',
        metrics_supporting: ['code_quality_trend', 'constitutional_compliance_rate']
      });
    }

    // Constitutional recommendations
    if (summary.constitutional_compliance_rate < 95) {
      recommendations.push({
        category: 'process',
        priority: 'medium',
        title: 'Strengthen Constitutional Enforcement',
        description: 'Constitutional violations are above acceptable threshold. Review enforcement mechanisms.',
        impact_estimate: 'Could improve compliance to 98%+',
        effort_estimate: '1 week',
        metrics_supporting: ['constitutional_compliance_rate']
      });
    }

    return recommendations;
  }

  // Utility methods
  private recordMetric(
    metricType: MetricType | string,
    value: number | string | boolean,
    phase: WorkflowPhase,
    context?: MetricContext
  ): void {
    const metric: WorkflowMetric = {
      id: this.generateMetricId(),
      timestamp: new Date().toISOString(),
      session_id: this.currentSession?.session_id || 'no-session',
      phase,
      metric_type: metricType as MetricType,
      value,
      context: context || {},
      tags: []
    };

    this.metrics.push(metric);
  }

  private getCurrentPhase(): WorkflowPhase {
    return this.currentPhase?.phase || 'brainstorm';
  }

  private calculateDuration(startTime: string, endTime: string): number {
    return new Date(endTime).getTime() - new Date(startTime).getTime();
  }

  private calculateAverage(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    // Simple linear regression slope
    const n = values.length;
    const sumX = n * (n - 1) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, idx) => sum + (idx * val), 0);
    const sumX2 = n * (n - 1) * (2 * n - 1) / 6;

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private calculateLearningCurve(velocityData: VelocityMetrics[]): number {
    // Measure how much velocity improves over time
    if (velocityData.length < 2) return 0;

    const firstHalf = velocityData.slice(0, Math.floor(velocityData.length / 2));
    const secondHalf = velocityData.slice(Math.floor(velocityData.length / 2));

    const firstAvg = this.calculateAverage(firstHalf.map(v => v.requirements_per_hour));
    const secondAvg = this.calculateAverage(secondHalf.map(v => v.requirements_per_hour));

    return firstAvg > 0 ? (secondAvg - firstAvg) / firstAvg : 0;
  }

  private getSessionsInTimeRange(timeRange: string): SessionMetrics[] {
    // Simplified time range filtering
    const daysBack = parseInt(timeRange.replace('d', '')) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    return this.sessionsHistory.filter(session =>
      new Date(session.start_time) >= cutoffDate
    );
  }

  private calculateMetricsSummary(sessions: SessionMetrics[], timeRange: string): MetricsSummary {
    return {
      time_period: timeRange,
      total_sessions: sessions.length,
      average_session_duration: this.calculateAverage(
        sessions.map(s => s.total_duration_ms || 0)
      ),
      average_confidence_improvement: this.calculateAverageConfidenceImprovement(sessions),
      average_context_efficiency: this.calculateAverageContextEfficiency(sessions),
      pattern_reuse_rate: this.calculatePatternReuseRate(sessions),
      constitutional_compliance_rate: this.calculateAverage(
        sessions.map(s => s.constitutional_compliance_rate)
      ),
      velocity_trends: {
        requirements_velocity_trend: this.calculateTrend(
          sessions.map(s => s.velocity_metrics.requirements_per_hour)
        ),
        task_completion_trend: this.calculateTrend(
          sessions.map(s => s.velocity_metrics.tasks_per_hour)
        ),
        quality_velocity_trend: this.calculateTrend(
          sessions.map(s => s.velocity_metrics.lines_of_code_per_hour)
        ),
        learning_curve_factor: this.calculateLearningCurve(
          sessions.map(s => s.velocity_metrics)
        )
      },
      quality_trends: {
        code_quality_trend: this.calculateTrend(
          sessions.map(s => s.outcome_metrics.code_quality_score)
        ),
        test_coverage_trend: this.calculateTrend(
          sessions.map(s => s.outcome_metrics.test_coverage_percentage)
        ),
        defect_trend: this.calculateTrend(
          sessions.map(s => s.velocity_metrics.defects_per_kloc)
        ),
        maintainability_trend: 0 // Would need more detailed calculation
      },
      recommendations: []
    };
  }

  // Storage methods
  private ensureStorageDirectoryExists(): void {
    if (!existsSync(this.metricsStoragePath)) {
      mkdirSync(this.metricsStoragePath, { recursive: true });
    }
  }

  private loadHistoricalData(): void {
    try {
      const historyPath = join(this.metricsStoragePath, 'sessions_history.json');
      if (existsSync(historyPath)) {
        const data = readFileSync(historyPath, 'utf8');
        this.sessionsHistory = JSON.parse(data);
      }
    } catch (error) {
      console.warn('⚠️ Could not load historical metrics data:', error);
      this.sessionsHistory = [];
    }
  }

  private saveSessionData(session: SessionMetrics): void {
    try {
      // Save individual session
      const sessionPath = join(this.metricsStoragePath, `session_${session.session_id}.json`);
      writeFileSync(sessionPath, JSON.stringify(session, null, 2));

      // Update history
      const historyPath = join(this.metricsStoragePath, 'sessions_history.json');
      writeFileSync(historyPath, JSON.stringify(this.sessionsHistory, null, 2));
    } catch (error) {
      console.error('❌ Failed to save session data:', error);
    }
  }

  private saveDashboard(dashboard: Dashboard): void {
    try {
      const dashboardPath = join(this.metricsStoragePath, `dashboard_${Date.now()}.json`);
      writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));

      // Also save as latest dashboard
      const latestPath = join(this.metricsStoragePath, 'latest_dashboard.json');
      writeFileSync(latestPath, JSON.stringify(dashboard, null, 2));
    } catch (error) {
      console.error('❌ Failed to save dashboard:', error);
    }
  }

  private setupAutoSave(): void {
    // Auto-save metrics every 5 minutes
    setInterval(() => {
      if (this.currentSession) {
        this.saveCurrentMetrics();
      }
    }, 5 * 60 * 1000);
  }

  private saveCurrentMetrics(): void {
    try {
      const metricsPath = join(this.metricsStoragePath, 'current_metrics.json');
      writeFileSync(metricsPath, JSON.stringify({
        currentSession: this.currentSession,
        currentPhase: this.currentPhase,
        recentMetrics: this.metrics.slice(-100) // Keep last 100 metrics
      }, null, 2));
    } catch (error) {
      console.error('❌ Failed to save current metrics:', error);
    }
  }

  // ID generation
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Simplified calculation methods (would be more complex in real implementation)
  private estimateLinesOfCode(): number { return 1000; } // Placeholder
  private estimateTestsWritten(): number { return 50; } // Placeholder
  private calculateDefectDensity(): number { return 2.5; } // Placeholder
  private calculateTimeToFirstSolution(): number { return 300000; } // 5 minutes in ms
  private identifyPhaseBottlenecks(phase: WorkflowPhase, sessions: SessionMetrics[]): string[] { return []; }
  private calculatePhaseEfficiency(phase: WorkflowPhase, sessions: SessionMetrics[]): number { return 85; }
  private calculateAgentEfficiency(interactions: AgentInteraction[]): number { return 90; }
  private calculateSpecializationEffectiveness(agentName: string, interactions: AgentInteraction[]): number { return 88; }
  private calculateQualityByPhase(phases: PhaseMetrics[]): Record<WorkflowPhase, number> {
    return {
      brainstorm: 85, specify: 88, shard: 90, decompose: 87, implement: 85, validate: 92, complete: 90
    };
  }
  private calculateTestCoverageDistribution(sessions: SessionMetrics[]): number[] { return [80, 85, 90, 95]; }
  private calculateDefectCategories(sessions: SessionMetrics[]): Record<string, number> { return { logic: 5, syntax: 2, integration: 3 }; }
  private countQualityGatesPassed(sessions: SessionMetrics[]): number { return 25; }
  private countQualityGatesFailed(sessions: SessionMetrics[]): number { return 2; }
  private calculateVelocityByPhase(sessions: SessionMetrics[]): Record<WorkflowPhase, number> {
    return {
      brainstorm: 5, specify: 3, shard: 8, decompose: 6, implement: 4, validate: 7, complete: 9
    };
  }
  private analyzeBottlenecks(sessions: SessionMetrics[]): BottleneckAnalysis {
    return {
      primary_bottleneck: 'context_processing',
      bottleneck_impact: 15,
      resolution_suggestions: ['Optimize context embedding', 'Improve pattern reuse'],
      affected_phases: ['specify', 'decompose']
    };
  }
  private identifyAccelerationOpportunities(sessions: SessionMetrics[]): string[] {
    return ['Increase pattern reuse', 'Optimize context size', 'Improve agent coordination'];
  }
  private calculateViolationsByPrinciple(sessions: SessionMetrics[]): Record<string, number> {
    return { 'TDD enforcement': 3, 'Quality gates': 2, 'Context preservation': 1 };
  }
  private calculateEnforcementEffectiveness(sessions: SessionMetrics[]): number { return 94; }
  private identifyCriticalViolations(sessions: SessionMetrics[]): ConstitutionalViolation[] {
    return [{
      principle: 'TDD enforcement',
      violation_type: 'implementation_before_tests',
      frequency: 3,
      impact_severity: 'high',
      trend: 'decreasing'
    }];
  }
  private calculateAverageConfidenceImprovement(sessions: SessionMetrics[]): number {
    return this.calculateAverage(
      sessions.map(s => {
        const progression = s.overall_confidence_progression;
        return progression.length > 1 ? progression[progression.length - 1] - progression[0] : 0;
      })
    );
  }
  private calculateAverageContextEfficiency(sessions: SessionMetrics[]): number {
    return this.calculateAverage(
      sessions.flatMap(s => s.phases.map(p => p.context_efficiency_score))
    );
  }
  private calculatePatternReuseRate(sessions: SessionMetrics[]): number {
    const totalDiscovered = sessions.reduce((sum, s) => sum + s.total_patterns_discovered, 0);
    const totalReused = sessions.reduce((sum, s) => sum + s.total_patterns_reused, 0);
    return totalDiscovered > 0 ? (totalReused / totalDiscovered) * 100 : 0;
  }
  private getDefaultVelocityMetrics(): VelocityMetrics {
    return {
      requirements_per_hour: 0,
      tasks_per_hour: 0,
      lines_of_code_per_hour: 0,
      tests_written_per_hour: 0,
      defects_per_kloc: 0,
      time_to_first_working_solution: 0
    };
  }

  // Public API methods
  getCurrentSessionMetrics(): SessionMetrics | null {
    return this.currentSession;
  }

  getCurrentPhaseMetrics(): PhaseMetrics | null {
    return this.currentPhase;
  }

  getMetricsHistory(): WorkflowMetric[] {
    return [...this.metrics];
  }

  getSessionsHistory(): SessionMetrics[] {
    return [...this.sessionsHistory];
  }

  async exportMetrics(format: 'json' | 'csv' = 'json'): Promise<string> {
    if (format === 'json') {
      return JSON.stringify({
        sessions: this.sessionsHistory,
        metrics: this.metrics,
        exported_at: new Date().toISOString()
      }, null, 2);
    } else {
      // CSV export would be implemented here
      return 'CSV export not implemented yet';
    }
  }
}
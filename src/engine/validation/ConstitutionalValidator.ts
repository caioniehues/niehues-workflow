import { EventEmitter } from 'events';
import { readFileSync, existsSync } from 'fs';
import { ConstitutionalEnforcer, ConstitutionalViolation } from '../constitution/ConstitutionalEnforcer';

export interface ConstitutionalPrinciple {
  id: string;
  name: string;
  category: 'immutable' | 'amendable';
  enforcement_level: 'blocking' | 'mandatory' | 'warning';
  description: string;
  validation_criteria: ValidationCriterion[];
  exemptions: Exemption[];
  violation_consequences: ViolationConsequence[];
}

export interface ValidationCriterion {
  id: string;
  description: string;
  validation_type: 'code_analysis' | 'file_check' | 'metric_check' | 'workflow_check' | 'coverage_check';
  threshold?: number;
  required_artifacts: string[];
  validation_logic: string;
  error_message: string;
}

export interface Exemption {
  condition: string;
  rationale: string;
  approval_required: boolean;
  approval_level: 'team_lead' | 'architect' | 'product_owner';
  expiration_date?: string;
}

export interface ViolationConsequence {
  severity: 'info' | 'warning' | 'error' | 'blocking';
  action: 'log' | 'notify' | 'block' | 'escalate';
  message: string;
  remediation_steps: string[];
}

export interface ValidationRequest {
  id: string;
  timestamp: string;
  context: ValidationContext;
  scope: ValidationScope;
  requested_by: string;
  principles_to_validate: string[];
  exemptions_claimed?: ClaimedExemption[];
}

export interface ValidationContext {
  project_id: string;
  session_id?: string;
  task_id?: string;
  agent_id?: string;
  phase: 'brainstorm' | 'specify' | 'shard' | 'decompose' | 'implement' | 'validate' | 'complete';
  operation: string;
  artifacts: ValidationArtifact[];
}

export interface ValidationScope {
  scope_type: 'single_file' | 'module' | 'project' | 'global';
  target_paths: string[];
  include_dependencies: boolean;
  validation_depth: 'surface' | 'deep' | 'comprehensive';
}

export interface ValidationArtifact {
  type: 'source_code' | 'test_file' | 'specification' | 'configuration' | 'documentation';
  path: string;
  content?: string;
  metadata: Record<string, any>;
}

export interface ClaimedExemption {
  principle_id: string;
  exemption_id: string;
  justification: string;
  approver?: string;
  approval_date?: string;
}

export interface ValidationResult {
  request_id: string;
  timestamp: string;
  overall_status: 'compliant' | 'violation' | 'exempted' | 'blocked';
  compliance_score: number; // 0-100
  principle_results: PrincipleValidationResult[];
  violations: ConstitutionalViolation[];
  exemptions_applied: AppliedExemption[];
  blocking_violations: ConstitutionalViolation[];
  remediation_plan: RemediationPlan;
  next_validation_required?: string;
}

export interface PrincipleValidationResult {
  principle_id: string;
  principle_name: string;
  status: 'compliant' | 'violation' | 'exempted' | 'not_applicable';
  score: number;
  criteria_results: CriterionValidationResult[];
  violations: ConstitutionalViolation[];
  exemptions: AppliedExemption[];
  evidence: ValidationEvidence[];
}

export interface CriterionValidationResult {
  criterion_id: string;
  description: string;
  status: 'pass' | 'fail' | 'exempted' | 'warning';
  actual_value?: any;
  expected_value?: any;
  deviation?: number;
  evidence: string[];
  failure_reason?: string;
}

export interface AppliedExemption {
  exemption_id: string;
  principle_id: string;
  applied_at: string;
  applied_by: string;
  justification: string;
  expiration_date?: string;
  approval_chain: ApprovalRecord[];
}

export interface ApprovalRecord {
  approver: string;
  role: string;
  approved_at: string;
  conditions?: string[];
}

export interface ValidationEvidence {
  type: 'file_analysis' | 'test_execution' | 'coverage_report' | 'metric_calculation' | 'workflow_trace';
  description: string;
  data: any;
  confidence: number;
  timestamp: string;
}

export interface RemediationPlan {
  priority: 'immediate' | 'high' | 'medium' | 'low';
  estimated_effort: string;
  steps: RemediationStep[];
  dependencies: string[];
  success_criteria: string[];
  validation_after_remediation: boolean;
}

export interface RemediationStep {
  step_number: number;
  description: string;
  action_type: 'code_change' | 'file_addition' | 'configuration' | 'process_change' | 'approval_required';
  details: string;
  artifacts_affected: string[];
  verification_method: string;
}

export interface ComplianceReport {
  generated_at: string;
  reporting_period: string;
  project_id: string;
  overall_compliance_rate: number;
  principle_compliance: PrincipleComplianceReport[];
  violation_trends: ViolationTrend[];
  exemption_usage: ExemptionUsageReport[];
  recommendations: ComplianceRecommendation[];
  constitutional_health_score: number;
}

export interface PrincipleComplianceReport {
  principle_id: string;
  principle_name: string;
  compliance_rate: number;
  total_validations: number;
  violations_count: number;
  exemptions_count: number;
  trend: 'improving' | 'stable' | 'declining';
  critical_violations: number;
}

export interface ViolationTrend {
  principle_id: string;
  time_period: string;
  violation_count: number;
  severity_distribution: Record<string, number>;
  resolution_rate: number;
  average_resolution_time: number;
}

export interface ExemptionUsageReport {
  exemption_id: string;
  usage_count: number;
  approval_rate: number;
  abuse_indicators: string[];
  recommended_action: string;
}

export interface ComplianceRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'process' | 'tooling' | 'training' | 'policy';
  title: string;
  description: string;
  impact: string;
  implementation_effort: string;
  success_metrics: string[];
}

export class ConstitutionalValidator extends EventEmitter {
  private enforcer: ConstitutionalEnforcer;
  private principles: Map<string, ConstitutionalPrinciple> = new Map();
  private validationHistory: Map<string, ValidationResult> = new Map();
  private activeExemptions: Map<string, AppliedExemption> = new Map();
  private complianceMetrics: ComplianceMetrics = {
    total_validations: 0,
    successful_validations: 0,
    violation_count: 0,
    exemption_count: 0,
    blocking_count: 0
  };

  constructor() {
    super();
    this.enforcer = new ConstitutionalEnforcer();
    this.initializeConstitutionalPrinciples();
    this.loadActiveExemptions();
    this.setupEventHandlers();
  }

  // Main validation method
  async validateConstitutionalCompliance(request: ValidationRequest): Promise<ValidationResult> {
    console.log(`🏛️ ConstitutionalValidator: Validating compliance for ${request.operation}`);

    const startTime = new Date().toISOString();

    try {
      // Initialize result
      const result: ValidationResult = {
        request_id: request.id,
        timestamp: startTime,
        overall_status: 'compliant',
        compliance_score: 0,
        principle_results: [],
        violations: [],
        exemptions_applied: [],
        blocking_violations: [],
        remediation_plan: {
          priority: 'low',
          estimated_effort: '0 hours',
          steps: [],
          dependencies: [],
          success_criteria: [],
          validation_after_remediation: false
        }
      };

      // Validate each requested principle
      for (const principleId of request.principles_to_validate) {
        const principleResult = await this.validatePrinciple(
          principleId,
          request.context,
          request.scope,
          request.exemptions_claimed
        );
        result.principle_results.push(principleResult);

        // Aggregate violations
        result.violations.push(...principleResult.violations);

        // Check for blocking violations
        const blockingViolations = principleResult.violations.filter(v => v.enforcement_level === 'blocking');
        result.blocking_violations.push(...blockingViolations);

        // Aggregate exemptions
        result.exemptions_applied.push(...principleResult.exemptions);
      }

      // Calculate overall compliance score
      result.compliance_score = this.calculateOverallComplianceScore(result.principle_results);

      // Determine overall status
      result.overall_status = this.determineOverallStatus(result);

      // Generate remediation plan if needed
      if (result.violations.length > 0) {
        result.remediation_plan = await this.generateRemediationPlan(result.violations, request.context);
      }

      // Block if there are blocking violations
      if (result.blocking_violations.length > 0) {
        result.overall_status = 'blocked';
        await this.enforceBlocking(result.blocking_violations, request.context);
      }

      // Store validation result
      this.validationHistory.set(request.id, result);

      // Update compliance metrics
      this.updateComplianceMetrics(result);

      // Emit events
      this.emit('validation:completed', result);

      if (result.overall_status === 'blocked') {
        this.emit('validation:blocked', result);
        console.error(`🛑 ConstitutionalValidator: BLOCKING - ${result.blocking_violations.length} blocking violations detected`);
      } else {
        console.log(`✅ ConstitutionalValidator: Compliance validated - Score: ${result.compliance_score}%`);
      }

      return result;

    } catch (error) {
      console.error('❌ ConstitutionalValidator: Validation failed:', error);
      this.emit('validation:failed', error);
      throw error;
    }
  }

  // Validate individual principle
  private async validatePrinciple(
    principleId: string,
    context: ValidationContext,
    scope: ValidationScope,
    claimedExemptions?: ClaimedExemption[]
  ): Promise<PrincipleValidationResult> {
    const principle = this.principles.get(principleId);
    if (!principle) {
      throw new Error(`Unknown constitutional principle: ${principleId}`);
    }

    console.log(`📋 Validating principle: ${principle.name}`);

    const result: PrincipleValidationResult = {
      principle_id: principleId,
      principle_name: principle.name,
      status: 'compliant',
      score: 100,
      criteria_results: [],
      violations: [],
      exemptions: [],
      evidence: []
    };

    // Check for applicable exemptions first
    const applicableExemptions = await this.checkApplicableExemptions(
      principleId,
      context,
      claimedExemptions
    );

    if (applicableExemptions.length > 0) {
      result.exemptions = applicableExemptions;
      result.status = 'exempted';
      console.log(`⚖️ Principle ${principle.name} exempted with ${applicableExemptions.length} exemptions`);
      return result;
    }

    // Validate each criterion
    let totalScore = 0;
    let maxScore = 0;

    for (const criterion of principle.validation_criteria) {
      const criterionResult = await this.validateCriterion(criterion, context, scope);
      result.criteria_results.push(criterionResult);

      maxScore += 100;

      if (criterionResult.status === 'pass') {
        totalScore += 100;
      } else if (criterionResult.status === 'warning') {
        totalScore += 50;
      } else {
        // Failed criterion - create violation
        const violation: ConstitutionalViolation = {
          id: this.generateViolationId(),
          principle_id: principleId,
          principle_name: principle.name,
          violation_type: criterion.validation_type,
          severity: this.mapEnforcementToSeverity(principle.enforcement_level),
          enforcement_level: principle.enforcement_level,
          description: `${criterion.description}: ${criterionResult.failure_reason || 'Validation failed'}`,
          context: this.contextToString(context),
          detected_at: new Date().toISOString(),
          evidence: criterionResult.evidence,
          remediation_suggestions: this.generateRemediationSuggestions(criterion, context),
          blocking: principle.enforcement_level === 'blocking'
        };

        result.violations.push(violation);
      }
    }

    // Calculate principle score
    result.score = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 100;

    // Determine principle status
    if (result.violations.length === 0) {
      result.status = 'compliant';
    } else {
      const hasBlockingViolations = result.violations.some(v => v.blocking);
      if (hasBlockingViolations || principle.enforcement_level === 'blocking') {
        result.status = 'violation';
      } else {
        result.status = 'violation';
      }
    }

    return result;
  }

  // Validate individual criterion
  private async validateCriterion(
    criterion: ValidationCriterion,
    context: ValidationContext,
    scope: ValidationScope
  ): Promise<CriterionValidationResult> {
    const result: CriterionValidationResult = {
      criterion_id: criterion.id,
      description: criterion.description,
      status: 'pass',
      evidence: []
    };

    try {
      switch (criterion.validation_type) {
        case 'code_analysis':
          await this.validateCodeAnalysis(criterion, context, scope, result);
          break;

        case 'file_check':
          await this.validateFileCheck(criterion, context, scope, result);
          break;

        case 'metric_check':
          await this.validateMetricCheck(criterion, context, scope, result);
          break;

        case 'workflow_check':
          await this.validateWorkflowCheck(criterion, context, scope, result);
          break;

        case 'coverage_check':
          await this.validateCoverageCheck(criterion, context, scope, result);
          break;

        default:
          result.status = 'warning';
          result.failure_reason = `Unknown validation type: ${criterion.validation_type}`;
      }

    } catch (error) {
      result.status = 'fail';
      result.failure_reason = `Validation error: ${error.message}`;
      result.evidence.push(`Error during validation: ${error.message}`);
    }

    return result;
  }

  // Specific validation methods
  private async validateCodeAnalysis(
    criterion: ValidationCriterion,
    context: ValidationContext,
    scope: ValidationScope,
    result: CriterionValidationResult
  ): Promise<void> {
    console.log(`🔍 Analyzing code for: ${criterion.description}`);

    // TDD compliance check
    if (criterion.id === 'tdd_compliance') {
      const tddCompliance = await this.checkTDDCompliance(context, scope);
      result.actual_value = tddCompliance.compliance_percentage;
      result.expected_value = criterion.threshold || 100;

      if (tddCompliance.compliance_percentage < (criterion.threshold || 100)) {
        result.status = 'fail';
        result.failure_reason = `TDD compliance ${tddCompliance.compliance_percentage}% below required ${criterion.threshold}%`;
        result.evidence = tddCompliance.violations;
      } else {
        result.evidence = [`TDD compliance verified: ${tddCompliance.compliance_percentage}%`];
      }
    }

    // Quality gate check
    else if (criterion.id === 'quality_gates') {
      const qualityCheck = await this.checkQualityGates(context, scope);
      result.actual_value = qualityCheck.passed_gates;
      result.expected_value = qualityCheck.total_gates;

      if (qualityCheck.passed_gates < qualityCheck.total_gates) {
        result.status = 'fail';
        result.failure_reason = `Quality gates failed: ${qualityCheck.failed_gates.join(', ')}`;
        result.evidence = qualityCheck.failure_details;
      } else {
        result.evidence = [`All ${qualityCheck.total_gates} quality gates passed`];
      }
    }

    // No implementation without tests
    else if (criterion.id === 'no_implementation_without_tests') {
      const implementationCheck = await this.checkImplementationWithoutTests(context, scope);
      result.actual_value = implementationCheck.violations.length;
      result.expected_value = 0;

      if (implementationCheck.violations.length > 0) {
        result.status = 'fail';
        result.failure_reason = `Found ${implementationCheck.violations.length} implementation files without corresponding tests`;
        result.evidence = implementationCheck.violations;
      } else {
        result.evidence = ['All implementation files have corresponding tests'];
      }
    }
  }

  private async validateFileCheck(
    criterion: ValidationCriterion,
    context: ValidationContext,
    scope: ValidationScope,
    result: CriterionValidationResult
  ): Promise<void> {
    console.log(`📁 Checking files for: ${criterion.description}`);

    if (criterion.id === 'required_artifacts') {
      const missingArtifacts: string[] = [];

      for (const requiredFile of criterion.required_artifacts) {
        const filePath = this.resolveFilePath(requiredFile, context);
        if (!existsSync(filePath)) {
          missingArtifacts.push(requiredFile);
        }
      }

      if (missingArtifacts.length > 0) {
        result.status = 'fail';
        result.failure_reason = `Missing required artifacts: ${missingArtifacts.join(', ')}`;
        result.evidence = missingArtifacts.map(file => `Missing: ${file}`);
      } else {
        result.evidence = [`All required artifacts present: ${criterion.required_artifacts.join(', ')}`];
      }
    }
  }

  private async validateMetricCheck(
    criterion: ValidationCriterion,
    context: ValidationContext,
    scope: ValidationScope,
    result: CriterionValidationResult
  ): Promise<void> {
    console.log(`📊 Checking metrics for: ${criterion.description}`);

    if (criterion.id === 'test_coverage_threshold') {
      const coverage = await this.calculateTestCoverage(context, scope);
      result.actual_value = coverage.percentage;
      result.expected_value = criterion.threshold;

      if (coverage.percentage < (criterion.threshold || 80)) {
        result.status = 'fail';
        result.failure_reason = `Test coverage ${coverage.percentage}% below required ${criterion.threshold}%`;
        result.evidence = [`Coverage report: ${coverage.details}`];
      } else {
        result.evidence = [`Test coverage ${coverage.percentage}% meets requirement`];
      }
    }

    else if (criterion.id === 'confidence_threshold') {
      const confidence = await this.checkConfidenceLevel(context);
      result.actual_value = confidence.current_level;
      result.expected_value = criterion.threshold;

      if (confidence.current_level < (criterion.threshold || 85)) {
        result.status = 'fail';
        result.failure_reason = `Confidence level ${confidence.current_level}% below required ${criterion.threshold}%`;
        result.evidence = [`Confidence analysis: ${confidence.analysis}`];
      } else {
        result.evidence = [`Confidence level ${confidence.current_level}% meets requirement`];
      }
    }
  }

  private async validateWorkflowCheck(
    criterion: ValidationCriterion,
    context: ValidationContext,
    scope: ValidationScope,
    result: CriterionValidationResult
  ): Promise<void> {
    console.log(`🔄 Checking workflow for: ${criterion.description}`);

    if (criterion.id === 'unlimited_questioning') {
      const questioningCheck = await this.checkUnlimitedQuestioning(context);
      result.actual_value = questioningCheck.questions_asked;

      if (!questioningCheck.reached_confidence_threshold) {
        result.status = 'fail';
        result.failure_reason = `Questioning stopped before reaching confidence threshold (${questioningCheck.final_confidence}% < ${questioningCheck.required_confidence}%)`;
        result.evidence = [`Questions asked: ${questioningCheck.questions_asked}`, `Final confidence: ${questioningCheck.final_confidence}%`];
      } else {
        result.evidence = [`Unlimited questioning completed with ${questioningCheck.questions_asked} questions`, `Final confidence: ${questioningCheck.final_confidence}%`];
      }
    }

    else if (criterion.id === 'context_preservation') {
      const contextCheck = await this.checkContextPreservation(context);
      result.actual_value = contextCheck.preservation_score;
      result.expected_value = criterion.threshold || 90;

      if (contextCheck.preservation_score < (criterion.threshold || 90)) {
        result.status = 'fail';
        result.failure_reason = `Context preservation score ${contextCheck.preservation_score}% below required ${criterion.threshold}%`;
        result.evidence = contextCheck.missing_context;
      } else {
        result.evidence = [`Context preservation score: ${contextCheck.preservation_score}%`];
      }
    }
  }

  private async validateCoverageCheck(
    criterion: ValidationCriterion,
    context: ValidationContext,
    scope: ValidationScope,
    result: CriterionValidationResult
  ): Promise<void> {
    console.log(`🎯 Checking coverage for: ${criterion.description}`);

    if (criterion.id === 'comprehensive_validation') {
      const validationCheck = await this.checkComprehensiveValidation(context, scope);
      result.actual_value = validationCheck.coverage_percentage;
      result.expected_value = criterion.threshold || 100;

      if (validationCheck.coverage_percentage < (criterion.threshold || 100)) {
        result.status = 'fail';
        result.failure_reason = `Validation coverage ${validationCheck.coverage_percentage}% below required ${criterion.threshold}%`;
        result.evidence = validationCheck.missing_validations;
      } else {
        result.evidence = [`Comprehensive validation coverage: ${validationCheck.coverage_percentage}%`];
      }
    }
  }

  // Enforcement and blocking
  private async enforceBlocking(
    blockingViolations: ConstitutionalViolation[],
    context: ValidationContext
  ): Promise<void> {
    console.error(`🛑 ConstitutionalValidator: ENFORCING BLOCK - ${blockingViolations.length} blocking violations`);

    for (const violation of blockingViolations) {
      console.error(`   🚫 ${violation.principle_name}: ${violation.description}`);

      // Use the enforcer to block the operation
      this.enforcer.enforceBoundary({
        agent_role: context.agent_id || 'system',
        action: context.operation,
        resource: 'constitutional_compliance',
        phase: context.phase
      });
    }

    // Emit blocking event for external systems
    this.emit('constitutional:blocked', {
      violations: blockingViolations,
      context,
      timestamp: new Date().toISOString()
    });

    // Throw error to halt execution
    throw new Error(`Constitutional violations detected: ${blockingViolations.map(v => v.description).join('; ')}`);
  }

  // Reporting and analytics
  async generateComplianceReport(
    projectId: string,
    timeRange: string = '30d'
  ): Promise<ComplianceReport> {
    console.log(`📈 ConstitutionalValidator: Generating compliance report for ${timeRange}`);

    const validations = this.getValidationsInTimeRange(timeRange);
    const principleCompliance = this.calculatePrincipleCompliance(validations);
    const violationTrends = this.calculateViolationTrends(validations);
    const exemptionUsage = this.calculateExemptionUsage(validations);
    const recommendations = this.generateComplianceRecommendations(principleCompliance, violationTrends);

    const report: ComplianceReport = {
      generated_at: new Date().toISOString(),
      reporting_period: timeRange,
      project_id: projectId,
      overall_compliance_rate: this.calculateOverallComplianceRate(validations),
      principle_compliance: principleCompliance,
      violation_trends: violationTrends,
      exemption_usage: exemptionUsage,
      recommendations,
      constitutional_health_score: this.calculateConstitutionalHealthScore(principleCompliance, violationTrends)
    };

    this.emit('report:generated', report);
    return report;
  }

  // Amendment and principle management
  async proposeConstitutionalAmendment(
    amendment: ConstitutionalAmendment
  ): Promise<AmendmentProposal> {
    console.log(`📜 ConstitutionalValidator: Processing constitutional amendment proposal`);

    const proposal: AmendmentProposal = {
      id: this.generateAmendmentId(),
      amendment,
      proposed_at: new Date().toISOString(),
      proposed_by: amendment.proposed_by,
      status: 'proposed',
      discussion_period_days: 7,
      voting_deadline: this.calculateVotingDeadline(7),
      impact_assessment: await this.assessAmendmentImpact(amendment),
      approval_requirements: this.determineApprovalRequirements(amendment),
      votes: [],
      discussion_log: []
    };

    this.emit('amendment:proposed', proposal);
    return proposal;
  }

  // Utility methods for validation checks
  private async checkTDDCompliance(
    context: ValidationContext,
    scope: ValidationScope
  ): Promise<{ compliance_percentage: number, violations: string[] }> {
    // Implementation would check for TDD compliance
    // For now, return mock data
    return {
      compliance_percentage: 95,
      violations: []
    };
  }

  private async checkQualityGates(
    context: ValidationContext,
    scope: ValidationScope
  ): Promise<{ passed_gates: number, total_gates: number, failed_gates: string[], failure_details: string[] }> {
    // Implementation would check quality gates
    return {
      passed_gates: 8,
      total_gates: 8,
      failed_gates: [],
      failure_details: []
    };
  }

  private async checkImplementationWithoutTests(
    context: ValidationContext,
    scope: ValidationScope
  ): Promise<{ violations: string[] }> {
    // Implementation would check for code without tests
    return {
      violations: []
    };
  }

  private async calculateTestCoverage(
    context: ValidationContext,
    scope: ValidationScope
  ): Promise<{ percentage: number, details: string }> {
    // Implementation would calculate actual test coverage
    return {
      percentage: 87,
      details: 'Line coverage: 87%, Branch coverage: 82%'
    };
  }

  private async checkConfidenceLevel(
    context: ValidationContext
  ): Promise<{ current_level: number, analysis: string }> {
    // Implementation would check confidence from ConfidenceCalculator
    return {
      current_level: 92,
      analysis: 'All confidence factors above threshold'
    };
  }

  private async checkUnlimitedQuestioning(
    context: ValidationContext
  ): Promise<{
    questions_asked: number,
    reached_confidence_threshold: boolean,
    final_confidence: number,
    required_confidence: number
  }> {
    // Implementation would check questioning completeness
    return {
      questions_asked: 15,
      reached_confidence_threshold: true,
      final_confidence: 88,
      required_confidence: 85
    };
  }

  private async checkContextPreservation(
    context: ValidationContext
  ): Promise<{ preservation_score: number, missing_context: string[] }> {
    // Implementation would check context preservation
    return {
      preservation_score: 93,
      missing_context: []
    };
  }

  private async checkComprehensiveValidation(
    context: ValidationContext,
    scope: ValidationScope
  ): Promise<{ coverage_percentage: number, missing_validations: string[] }> {
    // Implementation would check validation coverage
    return {
      coverage_percentage: 96,
      missing_validations: []
    };
  }

  // Utility and helper methods
  private calculateOverallComplianceScore(principleResults: PrincipleValidationResult[]): number {
    if (principleResults.length === 0) return 100;

    const totalScore = principleResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / principleResults.length);
  }

  private determineOverallStatus(result: ValidationResult): 'compliant' | 'violation' | 'exempted' | 'blocked' {
    if (result.blocking_violations.length > 0) {
      return 'blocked';
    }

    if (result.violations.length > 0) {
      return 'violation';
    }

    const allExempted = result.principle_results.every(pr => pr.status === 'exempted');
    if (allExempted && result.principle_results.length > 0) {
      return 'exempted';
    }

    return 'compliant';
  }

  private async generateRemediationPlan(
    violations: ConstitutionalViolation[],
    context: ValidationContext
  ): Promise<RemediationPlan> {
    const steps: RemediationStep[] = [];
    let stepNumber = 1;

    for (const violation of violations) {
      for (const suggestion of violation.remediation_suggestions) {
        steps.push({
          step_number: stepNumber++,
          description: suggestion,
          action_type: this.determineActionType(suggestion),
          details: `Address ${violation.principle_name} violation: ${violation.description}`,
          artifacts_affected: context.artifacts.map(a => a.path),
          verification_method: 'Re-run constitutional validation'
        });
      }
    }

    return {
      priority: violations.some(v => v.blocking) ? 'immediate' : 'high',
      estimated_effort: `${steps.length * 0.5} hours`,
      steps,
      dependencies: [],
      success_criteria: ['All constitutional violations resolved', 'Validation passes'],
      validation_after_remediation: true
    };
  }

  private async checkApplicableExemptions(
    principleId: string,
    context: ValidationContext,
    claimedExemptions?: ClaimedExemption[]
  ): Promise<AppliedExemption[]> {
    const applicable: AppliedExemption[] = [];

    // Check claimed exemptions
    if (claimedExemptions) {
      for (const claimed of claimedExemptions) {
        if (claimed.principle_id === principleId) {
          const exemption = await this.validateExemption(claimed, context);
          if (exemption) {
            applicable.push(exemption);
          }
        }
      }
    }

    // Check active exemptions
    for (const [_, exemption] of this.activeExemptions) {
      if (exemption.principle_id === principleId && !this.isExemptionExpired(exemption)) {
        applicable.push(exemption);
      }
    }

    return applicable;
  }

  private async validateExemption(
    claimed: ClaimedExemption,
    context: ValidationContext
  ): Promise<AppliedExemption | null> {
    // Implementation would validate exemption claims
    // For now, return null (no valid exemptions)
    return null;
  }

  private isExemptionExpired(exemption: AppliedExemption): boolean {
    if (!exemption.expiration_date) return false;
    return new Date(exemption.expiration_date) < new Date();
  }

  // Helper methods
  private mapEnforcementToSeverity(enforcement: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (enforcement) {
      case 'blocking': return 'critical';
      case 'mandatory': return 'high';
      case 'warning': return 'medium';
      default: return 'low';
    }
  }

  private contextToString(context: ValidationContext): string {
    return `${context.phase}:${context.operation} in ${context.project_id}`;
  }

  private generateRemediationSuggestions(criterion: ValidationCriterion, context: ValidationContext): string[] {
    // Implementation would generate specific remediation suggestions based on the criterion
    return [
      `Review and fix ${criterion.description}`,
      'Ensure all required artifacts are present',
      'Follow constitutional requirements'
    ];
  }

  private resolveFilePath(fileName: string, context: ValidationContext): string {
    // Implementation would resolve file paths based on context
    return fileName; // Simplified
  }

  private generateViolationId(): string {
    return `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAmendmentId(): string {
    return `amendment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateVotingDeadline(days: number): string {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + days);
    return deadline.toISOString();
  }

  private determineActionType(suggestion: string): 'code_change' | 'file_addition' | 'configuration' | 'process_change' | 'approval_required' {
    if (suggestion.includes('code') || suggestion.includes('implement')) return 'code_change';
    if (suggestion.includes('add') || suggestion.includes('create')) return 'file_addition';
    if (suggestion.includes('configure') || suggestion.includes('setting')) return 'configuration';
    if (suggestion.includes('approval') || suggestion.includes('review')) return 'approval_required';
    return 'process_change';
  }

  private updateComplianceMetrics(result: ValidationResult): void {
    this.complianceMetrics.total_validations++;

    if (result.overall_status === 'compliant') {
      this.complianceMetrics.successful_validations++;
    }

    this.complianceMetrics.violation_count += result.violations.length;
    this.complianceMetrics.exemption_count += result.exemptions_applied.length;
    this.complianceMetrics.blocking_count += result.blocking_violations.length;
  }

  // Reporting helper methods
  private getValidationsInTimeRange(timeRange: string): ValidationResult[] {
    // Implementation would filter validation history by time range
    return Array.from(this.validationHistory.values());
  }

  private calculatePrincipleCompliance(validations: ValidationResult[]): PrincipleComplianceReport[] {
    // Implementation would calculate compliance per principle
    return [];
  }

  private calculateViolationTrends(validations: ValidationResult[]): ViolationTrend[] {
    // Implementation would calculate violation trends
    return [];
  }

  private calculateExemptionUsage(validations: ValidationResult[]): ExemptionUsageReport[] {
    // Implementation would calculate exemption usage
    return [];
  }

  private generateComplianceRecommendations(
    principleCompliance: PrincipleComplianceReport[],
    violationTrends: ViolationTrend[]
  ): ComplianceRecommendation[] {
    // Implementation would generate recommendations
    return [];
  }

  private calculateOverallComplianceRate(validations: ValidationResult[]): number {
    if (validations.length === 0) return 100;

    const compliantValidations = validations.filter(v => v.overall_status === 'compliant').length;
    return Math.round((compliantValidations / validations.length) * 100);
  }

  private calculateConstitutionalHealthScore(
    principleCompliance: PrincipleComplianceReport[],
    violationTrends: ViolationTrend[]
  ): number {
    // Implementation would calculate overall constitutional health
    return 92; // Mock score
  }

  private async assessAmendmentImpact(amendment: ConstitutionalAmendment): Promise<AmendmentImpactAssessment> {
    // Implementation would assess the impact of proposed amendments
    return {
      affected_principles: [],
      compatibility_issues: [],
      implementation_effort: 'medium',
      risk_level: 'low',
      stakeholder_impact: []
    };
  }

  private determineApprovalRequirements(amendment: ConstitutionalAmendment): ApprovalRequirement[] {
    // Implementation would determine what approvals are needed
    return [];
  }

  // Initialization methods
  private initializeConstitutionalPrinciples(): void {
    // TDD Enforcement Principle
    this.principles.set('tdd_enforcement', {
      id: 'tdd_enforcement',
      name: 'Test-Driven Development',
      category: 'immutable',
      enforcement_level: 'blocking',
      description: 'Tests MUST be written before implementation code',
      validation_criteria: [
        {
          id: 'tdd_compliance',
          description: 'Verify tests exist before implementation',
          validation_type: 'code_analysis',
          threshold: 100,
          required_artifacts: [],
          validation_logic: 'Check test file timestamps vs implementation files',
          error_message: 'Implementation code found without preceding tests'
        },
        {
          id: 'no_implementation_without_tests',
          description: 'No production code without failing test first',
          validation_type: 'code_analysis',
          required_artifacts: [],
          validation_logic: 'Verify all implementation files have corresponding test files',
          error_message: 'Production code exists without corresponding tests'
        }
      ],
      exemptions: [],
      violation_consequences: [
        {
          severity: 'blocking',
          action: 'block',
          message: 'Cannot proceed without tests',
          remediation_steps: ['Write failing tests first', 'Implement code to pass tests']
        }
      ]
    });

    // Unlimited Questioning Principle
    this.principles.set('unlimited_questioning', {
      id: 'unlimited_questioning',
      name: 'Unlimited Questioning',
      category: 'immutable',
      enforcement_level: 'blocking',
      description: 'Continue questioning until confidence threshold achieved',
      validation_criteria: [
        {
          id: 'unlimited_questioning',
          description: 'Verify questioning continued until confidence threshold',
          validation_type: 'workflow_check',
          threshold: 85,
          required_artifacts: [],
          validation_logic: 'Check final confidence level meets minimum threshold',
          error_message: 'Questioning stopped before confidence threshold reached'
        }
      ],
      exemptions: [],
      violation_consequences: [
        {
          severity: 'blocking',
          action: 'block',
          message: 'Cannot proceed without sufficient confidence',
          remediation_steps: ['Continue questioning until threshold reached', 'Document confidence progression']
        }
      ]
    });

    // Quality Standards Principle
    this.principles.set('quality_standards', {
      id: 'quality_standards',
      name: 'Quality Standards',
      category: 'immutable',
      enforcement_level: 'blocking',
      description: 'Minimum quality thresholds must be met',
      validation_criteria: [
        {
          id: 'test_coverage_threshold',
          description: 'Minimum test coverage requirement',
          validation_type: 'metric_check',
          threshold: 80,
          required_artifacts: [],
          validation_logic: 'Calculate and verify test coverage percentage',
          error_message: 'Test coverage below minimum threshold'
        },
        {
          id: 'quality_gates',
          description: 'All quality gates must pass',
          validation_type: 'code_analysis',
          required_artifacts: [],
          validation_logic: 'Verify all quality gates pass',
          error_message: 'Quality gates failing'
        }
      ],
      exemptions: [],
      violation_consequences: [
        {
          severity: 'blocking',
          action: 'block',
          message: 'Quality standards not met',
          remediation_steps: ['Increase test coverage', 'Fix quality gate failures']
        }
      ]
    });

    // Context Preservation Principle
    this.principles.set('context_preservation', {
      id: 'context_preservation',
      name: 'Context Preservation',
      category: 'immutable',
      enforcement_level: 'mandatory',
      description: 'All decisions and context must be documented and preserved',
      validation_criteria: [
        {
          id: 'context_preservation',
          description: 'Verify context is preserved and accessible',
          validation_type: 'workflow_check',
          threshold: 90,
          required_artifacts: [],
          validation_logic: 'Check context embedding and accessibility',
          error_message: 'Context preservation below threshold'
        }
      ],
      exemptions: [],
      violation_consequences: [
        {
          severity: 'error',
          action: 'notify',
          message: 'Context preservation insufficient',
          remediation_steps: ['Document missing context', 'Ensure context embedding']
        }
      ]
    });

    // Comprehensive Validation Principle
    this.principles.set('comprehensive_validation', {
      id: 'comprehensive_validation',
      name: 'Comprehensive Validation',
      category: 'immutable',
      enforcement_level: 'blocking',
      description: 'All requirements must be validated comprehensively',
      validation_criteria: [
        {
          id: 'comprehensive_validation',
          description: 'Verify comprehensive validation coverage',
          validation_type: 'coverage_check',
          threshold: 100,
          required_artifacts: [],
          validation_logic: 'Check validation coverage across all requirements',
          error_message: 'Validation coverage incomplete'
        }
      ],
      exemptions: [],
      violation_consequences: [
        {
          severity: 'blocking',
          action: 'block',
          message: 'Validation coverage insufficient',
          remediation_steps: ['Complete missing validations', 'Ensure all requirements tested']
        }
      ]
    });
  }

  private loadActiveExemptions(): void {
    // Implementation would load active exemptions from storage
    // For now, no active exemptions
  }

  private setupEventHandlers(): void {
    this.on('validation:completed', (result) => {
      console.log(`📊 Validation completed - Score: ${result.compliance_score}%`);
    });

    this.on('validation:blocked', (result) => {
      console.error(`🚫 Validation blocked - ${result.blocking_violations.length} blocking violations`);
    });

    this.on('constitutional:blocked', (event) => {
      console.error(`🛑 Constitutional enforcement blocked operation: ${event.context.operation}`);
    });
  }

  // Public API methods
  getValidationHistory(): ValidationResult[] {
    return Array.from(this.validationHistory.values());
  }

  getActiveExemptions(): AppliedExemption[] {
    return Array.from(this.activeExemptions.values());
  }

  getComplianceMetrics(): ComplianceMetrics {
    return { ...this.complianceMetrics };
  }

  async quickValidation(
    operation: string,
    context: ValidationContext,
    principleIds: string[] = ['tdd_enforcement', 'quality_standards']
  ): Promise<boolean> {
    const request: ValidationRequest = {
      id: `quick_${Date.now()}`,
      timestamp: new Date().toISOString(),
      context,
      scope: { scope_type: 'single_file', target_paths: [], include_dependencies: false, validation_depth: 'surface' },
      requested_by: 'system',
      principles_to_validate: principleIds
    };

    try {
      const result = await this.validateConstitutionalCompliance(request);
      return result.overall_status === 'compliant' || result.overall_status === 'exempted';
    } catch (error) {
      return false; // Validation failed or was blocked
    }
  }
}

// Supporting interfaces
interface ComplianceMetrics {
  total_validations: number;
  successful_validations: number;
  violation_count: number;
  exemption_count: number;
  blocking_count: number;
}

interface ConstitutionalAmendment {
  title: string;
  description: string;
  changes: PrincipleChange[];
  rationale: string;
  proposed_by: string;
  impact_analysis: string;
}

interface PrincipleChange {
  principle_id: string;
  change_type: 'modify' | 'add' | 'remove';
  old_value?: any;
  new_value?: any;
  justification: string;
}

interface AmendmentProposal {
  id: string;
  amendment: ConstitutionalAmendment;
  proposed_at: string;
  proposed_by: string;
  status: 'proposed' | 'discussing' | 'voting' | 'approved' | 'rejected';
  discussion_period_days: number;
  voting_deadline: string;
  impact_assessment: AmendmentImpactAssessment;
  approval_requirements: ApprovalRequirement[];
  votes: Vote[];
  discussion_log: DiscussionEntry[];
}

interface AmendmentImpactAssessment {
  affected_principles: string[];
  compatibility_issues: string[];
  implementation_effort: 'low' | 'medium' | 'high';
  risk_level: 'low' | 'medium' | 'high';
  stakeholder_impact: StakeholderImpact[];
}

interface ApprovalRequirement {
  role: string;
  required_votes: number;
  threshold_percentage: number;
}

interface Vote {
  voter: string;
  role: string;
  vote: 'approve' | 'reject' | 'abstain';
  timestamp: string;
  comments?: string;
}

interface DiscussionEntry {
  participant: string;
  timestamp: string;
  message: string;
  type: 'comment' | 'question' | 'concern' | 'support';
}

interface StakeholderImpact {
  stakeholder_group: string;
  impact_description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation_strategy?: string;
}
import {
  Constitution,
  ConstitutionalViolation,
  TDDViolation,
  QuestioningViolation,
  ContextViolation,
  QualityViolation,
  ValidationViolation,
  ConstitutionalAmendment,
  AmendmentStatus
} from '../../types/constitution';

export interface TDDValidationInput {
  hasTests: boolean;
  testsAreFailing: boolean;
  coverage: number;
  phase: 'red' | 'green' | 'refactor';
}

export interface QuestioningInput {
  confidence: number;
  questionsAsked: number;
  gapsIdentified: string[];
  edgeCasesFound: number;
}

export interface ContextInput {
  contextLines: number;
  hasDecisionLog: boolean;
  hasPatterns: boolean;
  isEmbedded: boolean;
  hasExternalDependencies: boolean;
  confidence?: number;
}

export interface QualityInput {
  testCoverage: number;
  hasCodeReview: boolean;
  followsNamingConventions: boolean;
  hasCodeSmells: boolean;
  hasDocumentation: boolean;
  performance: {
    shardingReduction: number;
    contextLookupReduction: number;
    implementationTimeReduction: number;
  };
}

export interface ValidationInput {
  preImplementationValidated: boolean;
  postImplementationValidated: boolean;
  ciChecksPassed: boolean;
  noRegressions: boolean;
  constitutionallyCompliant: boolean;
}

export interface ValidationResult {
  valid: boolean;
  violations: ConstitutionalViolation[];
}

export interface ComprehensiveValidationInput {
  tdd: TDDValidationInput;
  questioning: QuestioningInput;
  context: ContextInput;
  quality: QualityInput;
  validation: ValidationInput;
}

export interface ComprehensiveValidationResult {
  compliant: boolean;
  violations: ConstitutionalViolation[];
}

export interface AmendmentProposal {
  principleId: string;
  changeType: 'add' | 'modify' | 'remove';
  description: string;
  rationale: string;
  proposedBy: string;
}

export interface AmendmentResult {
  success: boolean;
  amendment?: ConstitutionalAmendment;
  reason?: string;
}

export class ConstitutionalViolationError extends Error {
  public violations: ConstitutionalViolation[];

  constructor(message: string, violations: ConstitutionalViolation[]) {
    super(message);
    this.name = 'ConstitutionalViolationError';
    this.violations = violations;
  }
}

export class ConstitutionalEnforcer {
  private constitution: Constitution;
  private violationCounter: number = 0;

  constructor(constitution: Constitution) {
    this.constitution = constitution;
  }

  public validateTDD(input: TDDValidationInput): ValidationResult {
    const violations: TDDViolation[] = [];

    // Check if tests exist
    if (!input.hasTests) {
      violations.push(this.createTDDViolation(
        'No tests exist for implementation',
        'critical',
        input.phase,
        false,
        input.coverage,
        true
      ));
      // If no tests exist, don't check other conditions
      return {
        valid: false,
        violations
      };
    }

    // Check if tests are failing in RED phase
    if (input.phase === 'red' && input.hasTests && !input.testsAreFailing) {
      violations.push(this.createTDDViolation(
        'Tests must fail in RED phase',
        'critical',
        input.phase,
        false,
        input.coverage,
        false
      ));
    }

    // Check minimum coverage (only if tests exist)
    if (input.hasTests && input.coverage < this.constitution.tddRequirements.minimumCoverage) {
      violations.push(this.createTDDViolation(
        `Test coverage ${input.coverage}% is below minimum ${this.constitution.tddRequirements.minimumCoverage}%`,
        'critical',
        input.phase,
        input.testsAreFailing,
        input.coverage,
        false
      ));
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  public checkQuestioningCompleteness(input: QuestioningInput): ValidationResult {
    const violations: QuestioningViolation[] = [];
    const threshold = this.constitution.questioningRequirements.minimumConfidenceThreshold;

    // Check confidence threshold
    if (input.confidence < threshold) {
      const violation: QuestioningViolation = {
        id: `q-vio-${++this.violationCounter}`,
        timestamp: new Date(),
        principleId: 'questioning-completeness',
        type: 'questioning',
        severity: 'critical',
        description: input.questionsAsked === 0
          ? 'triage phase required with initial questions'
          : `Confidence ${input.confidence}% below threshold ${threshold}%`,
        context: {
          questionsAsked: input.questionsAsked,
          gapsIdentified: input.gapsIdentified,
          edgeCasesFound: input.edgeCasesFound
        },
        blocked: true,
        resolution: 'Continue questioning until confidence reaches 85%',
        confidence: input.confidence,
        threshold,
        questionsAsked: input.questionsAsked,
        gapsIdentified: input.gapsIdentified
      };
      violations.push(violation);
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  public enforceContextRequirements(input: ContextInput): ValidationResult {
    const violations: ContextViolation[] = [];
    const reqs = this.constitution.contextRequirements;

    // Adaptive context size based on confidence
    let minLines = reqs.minimumContextLines;
    let maxLines = reqs.maximumContextLines;

    if (input.confidence !== undefined && reqs.adaptiveBasedOnConfidence) {
      if (input.confidence >= 90) {
        minLines = 200; // High confidence needs less context
      } else if (input.confidence >= 70) {
        minLines = 500; // Medium confidence
      } else {
        minLines = 1000; // Low confidence needs more context
      }
    }

    // Check context size
    if (input.contextLines < minLines) {
      violations.push(this.createContextViolation(
        `Context size ${input.contextLines} lines below minimum ${minLines}`,
        input.contextLines,
        minLines
      ));
    }

    if (input.contextLines > maxLines) {
      violations.push(this.createContextViolation(
        `Context size ${input.contextLines} lines exceeds maximum ${maxLines}`,
        input.contextLines,
        maxLines
      ));
    }

    // Check for external dependencies
    if (input.hasExternalDependencies) {
      violations.push(this.createContextViolation(
        'Context has external dependencies - must be self-contained',
        input.contextLines,
        minLines
      ));
      // If there are external dependencies, that's the primary violation
      return {
        valid: false,
        violations
      };
    }

    // Check for missing elements (only if no external dependencies)
    const missingElements: string[] = [];
    if (!input.hasDecisionLog && reqs.includeDecisionLog) {
      missingElements.push('decision log');
    }
    if (!input.hasPatterns && reqs.includePatterns) {
      missingElements.push('patterns');
    }
    if (!input.isEmbedded && reqs.embedInTaskFile) {
      missingElements.push('embedded context');
    }

    if (missingElements.length > 0) {
      violations.push({
        id: `ctx-vio-${++this.violationCounter}`,
        timestamp: new Date(),
        principleId: 'context-embedding',
        type: 'context',
        severity: 'high',
        description: `Missing context elements: ${missingElements.join(', ')}`,
        context: { missingElements },
        blocked: true,
        resolution: 'Include all required context elements',
        contextSize: input.contextLines,
        requiredSize: minLines,
        missingElements
      });
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  public enforceQualityGates(input: QualityInput): ValidationResult {
    const violations: QualityViolation[] = [];
    const reqs = this.constitution.qualityRequirements;

    // Check test coverage
    if (input.testCoverage < reqs.minimumTestCoverage) {
      violations.push(this.createQualityViolation(
        'testCoverage',
        input.testCoverage,
        reqs.minimumTestCoverage,
        [`Test coverage ${input.testCoverage}% below minimum`]
      ));
    }

    // Check code review
    if (reqs.requiresCodeReview && !input.hasCodeReview) {
      violations.push(this.createQualityViolation(
        'codeReview',
        0,
        1,
        ['Code review required but not performed']
      ));
    }

    // Check performance metrics
    const perf = input.performance;
    const thresholds = reqs.performanceThresholds;

    if (perf.shardingReduction < thresholds.shardingReduction) {
      violations.push(this.createQualityViolation(
        'shardingReduction',
        perf.shardingReduction,
        thresholds.shardingReduction,
        [`Sharding reduction ${perf.shardingReduction}% below target`]
      ));
    }

    if (perf.contextLookupReduction < thresholds.contextLookupReduction) {
      violations.push(this.createQualityViolation(
        'contextLookupReduction',
        perf.contextLookupReduction,
        thresholds.contextLookupReduction,
        [`Context lookup reduction ${perf.contextLookupReduction}% below target`]
      ));
    }

    if (perf.implementationTimeReduction < thresholds.implementationTimeReduction) {
      violations.push(this.createQualityViolation(
        'implementationTimeReduction',
        perf.implementationTimeReduction,
        thresholds.implementationTimeReduction,
        [`Implementation time reduction ${perf.implementationTimeReduction}% below target`]
      ));
    }

    // Check other quality aspects
    const failedChecks: string[] = [];
    if (reqs.enforceNamingConventions && !input.followsNamingConventions) {
      failedChecks.push('naming conventions');
    }
    if (reqs.preventCodeSmells && input.hasCodeSmells) {
      failedChecks.push('code smells detected');
    }
    if (reqs.requiresDocumentation && !input.hasDocumentation) {
      failedChecks.push('documentation missing');
    }

    if (failedChecks.length > 0) {
      violations.push(this.createQualityViolation(
        'generalQuality',
        0,
        1,
        failedChecks
      ));
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  public enforceValidationRequirements(input: ValidationInput): ValidationResult {
    const violations: ValidationViolation[] = [];
    const reqs = this.constitution.validationRequirements;

    const failedValidations: string[] = [];
    const passedValidations: string[] = [];

    // Check pre-implementation validation
    if (reqs.requiresPreImplementationValidation) {
      if (input.preImplementationValidated) {
        passedValidations.push('pre-implementation');
      } else {
        failedValidations.push('pre-implementation validation');
      }
    }

    // Check post-implementation validation
    if (reqs.requiresPostImplementationValidation) {
      if (input.postImplementationValidated) {
        passedValidations.push('post-implementation');
      } else {
        failedValidations.push('post-implementation validation');
      }
    }

    // Check CI checks
    if (reqs.continuousIntegrationChecks) {
      if (input.ciChecksPassed) {
        passedValidations.push('CI checks');
      } else {
        failedValidations.push('CI checks');
      }
    }

    // Check regression prevention
    if (reqs.regressionPrevention) {
      if (input.noRegressions) {
        passedValidations.push('regression prevention');
      } else {
        failedValidations.push('regression detected');
      }
    }

    // Check constitutional compliance - CRITICAL
    if (reqs.constitutionalComplianceCheck && !input.constitutionallyCompliant) {
      violations.push({
        id: `val-vio-${++this.violationCounter}`,
        timestamp: new Date(),
        principleId: 'validation-first',
        type: 'validation',
        severity: 'critical',
        description: 'Constitutional compliance check failed',
        context: {},
        blocked: true,
        resolution: 'Ensure full constitutional compliance',
        validationType: 'constitutional',
        failedValidations: ['constitutional compliance'],
        passedValidations: []
      });
    }

    // Add other failed validations
    if (failedValidations.length > 0) {
      violations.push({
        id: `val-vio-${++this.violationCounter}`,
        timestamp: new Date(),
        principleId: 'validation-first',
        type: 'validation',
        severity: failedValidations.includes('pre-implementation validation') ? 'critical' : 'high',
        description: `Validation requirements not met: ${failedValidations.join(', ')}`,
        context: {},
        blocked: true,
        resolution: 'Complete all required validations',
        validationType: failedValidations.includes('pre-implementation validation')
          ? 'pre-implementation'
          : 'general',
        failedValidations,
        passedValidations
      });
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  public validateAll(input: ComprehensiveValidationInput): ComprehensiveValidationResult {
    const allViolations: ConstitutionalViolation[] = [];

    // Validate TDD
    const tddResult = this.validateTDD(input.tdd);
    allViolations.push(...tddResult.violations);

    // Check Questioning
    const questioningResult = this.checkQuestioningCompleteness(input.questioning);
    allViolations.push(...questioningResult.violations);

    // Enforce Context
    const contextResult = this.enforceContextRequirements(input.context);
    allViolations.push(...contextResult.violations);

    // Enforce Quality
    const qualityResult = this.enforceQualityGates(input.quality);
    allViolations.push(...qualityResult.violations);

    // Enforce Validation
    const validationResult = this.enforceValidationRequirements(input.validation);
    allViolations.push(...validationResult.violations);

    return {
      compliant: allViolations.length === 0,
      violations: allViolations
    };
  }

  public blockViolations(violations: ConstitutionalViolation[]): void {
    const criticalViolations = violations.filter(v => v.severity === 'critical' && v.blocked);

    if (criticalViolations.length > 0) {
      const messages = criticalViolations.map(v =>
        `  - [${v.principleId}] ${v.description}`
      ).join('\n');

      const error = new ConstitutionalViolationError(
        `🛑 CONSTITUTIONAL VIOLATION DETECTED\n\n` +
        `The following critical violations must be resolved:\n${messages}\n\n` +
        `Execution blocked. Resolve violations before proceeding.`,
        criticalViolations
      );

      throw error;
    }
  }

  public proposeAmendment(proposal: AmendmentProposal): AmendmentResult {
    // Check if principle is immutable
    const principle = this.constitution.principles.find(p => p.id === proposal.principleId);

    if (principle && principle.immutable) {
      return {
        success: false,
        reason: `Principle '${proposal.principleId}' is immutable and cannot be amended`
      };
    }

    // Create amendment
    const amendment: ConstitutionalAmendment = {
      id: `amend-${++this.violationCounter}`,
      proposedDate: new Date(),
      proposedBy: proposal.proposedBy,
      principleId: proposal.principleId,
      changeType: proposal.changeType,
      description: proposal.description,
      rationale: proposal.rationale,
      impact: 'To be assessed',
      status: 'proposed',
      votesFor: 0,
      votesAgainst: 0,
      implementationDate: null
    };

    // Add to constitution
    this.constitution.amendments.push(amendment);

    return {
      success: true,
      amendment
    };
  }

  // Helper methods to create violations
  private createTDDViolation(
    description: string,
    severity: 'critical' | 'high' | 'medium' | 'low',
    phase: 'red' | 'green' | 'refactor',
    hasFailingTest: boolean,
    coverage: number,
    attemptedImplementationFirst: boolean
  ): TDDViolation {
    return {
      id: `tdd-vio-${++this.violationCounter}`,
      timestamp: new Date(),
      principleId: 'tdd-first',
      type: 'tdd',
      severity,
      description,
      context: {},
      blocked: severity === 'critical',
      resolution: 'Write failing tests first',
      phase,
      hasFailingTest,
      coverage,
      attemptedImplementationFirst
    };
  }

  private createContextViolation(
    description: string,
    contextSize: number,
    requiredSize: number
  ): ContextViolation {
    return {
      id: `ctx-vio-${++this.violationCounter}`,
      timestamp: new Date(),
      principleId: 'context-embedding',
      type: 'context',
      severity: 'critical',
      description,
      context: {},
      blocked: true,
      resolution: 'Adjust context to meet requirements',
      contextSize,
      requiredSize,
      missingElements: []
    };
  }

  private createQualityViolation(
    metric: string,
    actual: number,
    required: number,
    failedChecks: string[]
  ): QualityViolation {
    return {
      id: `qual-vio-${++this.violationCounter}`,
      timestamp: new Date(),
      principleId: 'quality-gates',
      type: 'quality',
      severity: 'high',
      description: `Quality metric '${metric}' failed`,
      context: {},
      blocked: false,
      resolution: 'Improve quality metrics',
      qualityMetric: metric,
      actualValue: actual,
      requiredValue: required,
      failedChecks
    };
  }
}
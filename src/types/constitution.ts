/**
 * Constitutional Types for Nexus Enhanced Workflow
 *
 * Defines the core constitutional framework that governs all development decisions.
 * Based on the immutable principles from nexus-enhanced-implementation-spec.md
 */

// Core principle types
export interface ConstitutionalPrinciple {
  id: string;
  name: string;
  description: string;
  immutable: boolean;
  enforcementLevel: 'blocking' | 'warning' | 'advisory';
  validationRules: string[];
}

// TDD Requirements
export interface TDDRequirement {
  phase: 'red' | 'green' | 'refactor';
  requiresFailingTest: boolean;
  minimumCoverage: number;
  allowImplementationWithoutTest: boolean;
  enforceTestFirst: boolean;
}

// Questioning Requirements
export interface QuestioningRequirement {
  minimumConfidenceThreshold: number;
  requiresTriagePhase: boolean;
  triageQuestionLimit: number;
  allowUnlimitedExploration: boolean;
  trackGapIdentification: boolean;
  edgeCaseDetection: boolean;
}

// Context Requirements
export interface ContextRequirement {
  minimumContextLines: number;
  maximumContextLines: number;
  adaptiveBasedOnConfidence: boolean;
  includeDecisionLog: boolean;
  includePatterns: boolean;
  embedInTaskFile: boolean;
  preventExternalLookups: boolean;
}

// Quality Requirements
export interface QualityRequirement {
  minimumTestCoverage: number;
  requiresCodeReview: boolean;
  enforceNamingConventions: boolean;
  preventCodeSmells: boolean;
  requiresDocumentation: boolean;
  performanceThresholds: {
    shardingReduction: number;
    contextLookupReduction: number;
    implementationTimeReduction: number;
  };
}

// Validation Requirements
export interface ValidationRequirement {
  requiresPreImplementationValidation: boolean;
  requiresPostImplementationValidation: boolean;
  continuousIntegrationChecks: boolean;
  regressionPrevention: boolean;
  constitutionalComplianceCheck: boolean;
}

// Violation types
export type ViolationSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ConstitutionalViolation {
  id: string;
  timestamp: Date;
  principleId: string;
  type: 'tdd' | 'questioning' | 'context' | 'quality' | 'validation';
  severity: ViolationSeverity;
  description: string;
  context: {
    file?: string;
    line?: number;
    phase?: string;
    [key: string]: any;
  };
  blocked: boolean;
  resolution: string | null;
}

// Specific violation types
export interface TDDViolation extends ConstitutionalViolation {
  type: 'tdd';
  phase: 'red' | 'green' | 'refactor';
  hasFailingTest: boolean;
  coverage: number;
  attemptedImplementationFirst: boolean;
}

export interface QuestioningViolation extends ConstitutionalViolation {
  type: 'questioning';
  confidence: number;
  threshold: number;
  questionsAsked: number;
  gapsIdentified: string[];
}

export interface ContextViolation extends ConstitutionalViolation {
  type: 'context';
  contextSize: number;
  requiredSize: number;
  missingElements: string[];
}

export interface QualityViolation extends ConstitutionalViolation {
  type: 'quality';
  qualityMetric: string;
  actualValue: number;
  requiredValue: number;
  failedChecks: string[];
}

export interface ValidationViolation extends ConstitutionalViolation {
  type: 'validation';
  validationType: string;
  failedValidations: string[];
  passedValidations: string[];
}

// Enforcement types
export interface EnforcementAction {
  type: 'block' | 'warn' | 'audit' | 'rollback';
  violationId: string;
  timestamp: Date;
  message: string;
  requiresResolution: boolean;
  suggestedFix: string | null;
}

// Amendment types
export type AmendmentStatus = 'proposed' | 'under_review' | 'approved' | 'rejected' | 'implemented';

export interface ConstitutionalAmendment {
  id: string;
  proposedDate: Date;
  proposedBy: string;
  principleId: string;
  changeType: 'add' | 'modify' | 'remove';
  description: string;
  rationale: string;
  impact: string;
  status: AmendmentStatus;
  votesFor: number;
  votesAgainst: number;
  implementationDate: Date | null;
}

// Main Constitution interface
export interface Constitution {
  version: string;
  lastUpdated: Date;
  principles: ConstitutionalPrinciple[];
  tddRequirements: TDDRequirement;
  questioningRequirements: QuestioningRequirement;
  contextRequirements: ContextRequirement;
  qualityRequirements: QualityRequirement;
  validationRequirements: ValidationRequirement;
  violations: ConstitutionalViolation[];
  amendments: ConstitutionalAmendment[];
  enforcementActions: EnforcementAction[];
}

// Export a default constitution configuration
export const DEFAULT_CONSTITUTION: Constitution = {
  version: '1.0.0',
  lastUpdated: new Date(),
  principles: [
    {
      id: 'tdd-first',
      name: 'TDD First Development',
      description: 'All code must have tests written first',
      immutable: true,
      enforcementLevel: 'blocking',
      validationRules: ['Tests must exist before implementation', 'Tests must fail before implementation']
    },
    {
      id: 'questioning-completeness',
      name: 'Questioning Until Confidence',
      description: 'Continue questioning until 85% confidence threshold',
      immutable: true,
      enforcementLevel: 'blocking',
      validationRules: ['Confidence must be >= 85%', 'All gaps must be identified']
    },
    {
      id: 'context-embedding',
      name: 'Context Embedding',
      description: 'All tasks must have embedded context',
      immutable: true,
      enforcementLevel: 'blocking',
      validationRules: ['Context must be 200-2000 lines', 'Context must be self-contained']
    },
    {
      id: 'quality-gates',
      name: 'Quality Gates',
      description: 'All code must pass quality gates',
      immutable: true,
      enforcementLevel: 'blocking',
      validationRules: ['Coverage >= 80%', 'No critical violations']
    },
    {
      id: 'validation-first',
      name: 'Validation First',
      description: 'All changes must be validated before and after',
      immutable: true,
      enforcementLevel: 'blocking',
      validationRules: ['Pre-implementation validation required', 'Post-implementation validation required']
    }
  ],
  tddRequirements: {
    phase: 'red',
    requiresFailingTest: true,
    minimumCoverage: 80,
    allowImplementationWithoutTest: false,
    enforceTestFirst: true
  },
  questioningRequirements: {
    minimumConfidenceThreshold: 85,
    requiresTriagePhase: true,
    triageQuestionLimit: 5,
    allowUnlimitedExploration: true,
    trackGapIdentification: true,
    edgeCaseDetection: true
  },
  contextRequirements: {
    minimumContextLines: 200,
    maximumContextLines: 2000,
    adaptiveBasedOnConfidence: true,
    includeDecisionLog: true,
    includePatterns: true,
    embedInTaskFile: true,
    preventExternalLookups: true
  },
  qualityRequirements: {
    minimumTestCoverage: 80,
    requiresCodeReview: true,
    enforceNamingConventions: true,
    preventCodeSmells: true,
    requiresDocumentation: true,
    performanceThresholds: {
      shardingReduction: 70,
      contextLookupReduction: 60,
      implementationTimeReduction: 30
    }
  },
  validationRequirements: {
    requiresPreImplementationValidation: true,
    requiresPostImplementationValidation: true,
    continuousIntegrationChecks: true,
    regressionPrevention: true,
    constitutionalComplianceCheck: true
  },
  violations: [],
  amendments: [],
  enforcementActions: []
};
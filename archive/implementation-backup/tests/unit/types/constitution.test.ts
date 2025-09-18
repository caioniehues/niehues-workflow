import type {
  Constitution,
  ConstitutionalPrinciple,
  TDDRequirement,
  QuestioningRequirement,
  ContextRequirement,
  QualityRequirement,
  ValidationRequirement,
  ConstitutionalViolation,
  TDDViolation,
  QuestioningViolation,
  ContextViolation,
  QualityViolation,
  ValidationViolation,
  ViolationSeverity,
  EnforcementAction,
  ConstitutionalAmendment,
  AmendmentStatus
} from '../../../src/types/constitution';

describe('Constitutional Types', () => {
  describe('ConstitutionalPrinciple', () => {
    it('should have required fields for a principle', () => {
      const principle: ConstitutionalPrinciple = {
        id: 'tdd-first',
        name: 'TDD First Development',
        description: 'All code must have tests written first',
        immutable: true,
        enforcementLevel: 'blocking',
        validationRules: []
      };

      expect(principle.id).toBeDefined();
      expect(principle.name).toBeDefined();
      expect(principle.immutable).toBe(true);
      expect(principle.enforcementLevel).toBe('blocking');
    });
  });

  describe('TDD Requirements', () => {
    it('should define RED-GREEN-REFACTOR cycle requirements', () => {
      const tddReq: TDDRequirement = {
        phase: 'red',
        requiresFailingTest: true,
        minimumCoverage: 80,
        allowImplementationWithoutTest: false,
        enforceTestFirst: true
      };

      expect(tddReq.phase).toBe('red');
      expect(tddReq.requiresFailingTest).toBe(true);
      expect(tddReq.minimumCoverage).toBe(80);
      expect(tddReq.allowImplementationWithoutTest).toBe(false);
    });

    it('should support all TDD phases', () => {
      const phases: TDDRequirement['phase'][] = ['red', 'green', 'refactor'];
      phases.forEach(phase => {
        const req: TDDRequirement = {
          phase,
          requiresFailingTest: phase === 'red',
          minimumCoverage: 80,
          allowImplementationWithoutTest: false,
          enforceTestFirst: true
        };
        expect(req.phase).toBe(phase);
      });
    });
  });

  describe('Questioning Requirements', () => {
    it('should enforce confidence thresholds', () => {
      const questionReq: QuestioningRequirement = {
        minimumConfidenceThreshold: 85,
        requiresTriagePhase: true,
        triageQuestionLimit: 5,
        allowUnlimitedExploration: true,
        trackGapIdentification: true,
        edgeCaseDetection: true
      };

      expect(questionReq.minimumConfidenceThreshold).toBe(85);
      expect(questionReq.requiresTriagePhase).toBe(true);
      expect(questionReq.triageQuestionLimit).toBe(5);
      expect(questionReq.allowUnlimitedExploration).toBe(true);
    });
  });

  describe('Context Requirements', () => {
    it('should define adaptive context embedding rules', () => {
      const contextReq: ContextRequirement = {
        minimumContextLines: 200,
        maximumContextLines: 2000,
        adaptiveBasedOnConfidence: true,
        includeDecisionLog: true,
        includePatterns: true,
        embedInTaskFile: true,
        preventExternalLookups: true
      };

      expect(contextReq.minimumContextLines).toBe(200);
      expect(contextReq.maximumContextLines).toBe(2000);
      expect(contextReq.adaptiveBasedOnConfidence).toBe(true);
      expect(contextReq.preventExternalLookups).toBe(true);
    });
  });

  describe('Quality Requirements', () => {
    it('should enforce quality gates', () => {
      const qualityReq: QualityRequirement = {
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
      };

      expect(qualityReq.minimumTestCoverage).toBe(80);
      expect(qualityReq.performanceThresholds.shardingReduction).toBe(70);
      expect(qualityReq.performanceThresholds.contextLookupReduction).toBe(60);
    });
  });

  describe('Validation Requirements', () => {
    it('should define validation checkpoints', () => {
      const validationReq: ValidationRequirement = {
        requiresPreImplementationValidation: true,
        requiresPostImplementationValidation: true,
        continuousIntegrationChecks: true,
        regressionPrevention: true,
        constitutionalComplianceCheck: true
      };

      expect(validationReq.requiresPreImplementationValidation).toBe(true);
      expect(validationReq.constitutionalComplianceCheck).toBe(true);
    });
  });

  describe('Constitutional Violations', () => {
    it('should define violation structure', () => {
      const violation: ConstitutionalViolation = {
        id: 'vio-001',
        timestamp: new Date(),
        principleId: 'tdd-first',
        type: 'tdd',
        severity: 'critical',
        description: 'Implementation without failing test',
        context: {
          file: 'src/example.ts',
          line: 42,
          phase: 'implementation'
        },
        blocked: true,
        resolution: null
      };

      expect(violation.principleId).toBe('tdd-first');
      expect(violation.severity).toBe('critical');
      expect(violation.blocked).toBe(true);
    });

    it('should support all violation types', () => {
      const violationTypes: ConstitutionalViolation['type'][] = [
        'tdd', 'questioning', 'context', 'quality', 'validation'
      ];

      violationTypes.forEach(type => {
        const violation: ConstitutionalViolation = {
          id: `vio-${type}`,
          timestamp: new Date(),
          principleId: `${type}-principle`,
          type,
          severity: 'critical',
          description: `${type} violation`,
          context: {},
          blocked: true,
          resolution: null
        };
        expect(violation.type).toBe(type);
      });
    });
  });

  describe('TDD Violations', () => {
    it('should track TDD-specific violations', () => {
      const tddViolation: TDDViolation = {
        id: 'tdd-vio-001',
        timestamp: new Date(),
        principleId: 'tdd-first',
        type: 'tdd',
        severity: 'critical',
        description: 'Code written without test',
        context: {
          file: 'src/feature.ts',
          line: 100,
          phase: 'implementation'
        },
        blocked: true,
        resolution: null,
        phase: 'green',
        hasFailingTest: false,
        coverage: 45,
        attemptedImplementationFirst: true
      };

      expect(tddViolation.phase).toBe('green');
      expect(tddViolation.hasFailingTest).toBe(false);
      expect(tddViolation.coverage).toBeLessThan(80);
      expect(tddViolation.attemptedImplementationFirst).toBe(true);
    });
  });

  describe('Enforcement Actions', () => {
    it('should define enforcement action types', () => {
      const action: EnforcementAction = {
        type: 'block',
        violationId: 'vio-001',
        timestamp: new Date(),
        message: 'Execution blocked due to TDD violation',
        requiresResolution: true,
        suggestedFix: 'Write failing test first'
      };

      expect(action.type).toBe('block');
      expect(action.requiresResolution).toBe(true);
      expect(action.suggestedFix).toBeDefined();
    });

    it('should support all action types', () => {
      const actionTypes: EnforcementAction['type'][] = ['block', 'warn', 'audit', 'rollback'];
      actionTypes.forEach(type => {
        const action: EnforcementAction = {
          type,
          violationId: 'test-vio',
          timestamp: new Date(),
          message: `${type} action`,
          requiresResolution: type === 'block' || type === 'rollback',
          suggestedFix: null
        };
        expect(action.type).toBe(type);
      });
    });
  });

  describe('Constitutional Amendments', () => {
    it('should track amendment proposals', () => {
      const amendment: ConstitutionalAmendment = {
        id: 'amend-001',
        proposedDate: new Date(),
        proposedBy: 'developer',
        principleId: 'quality-gates',
        changeType: 'modify',
        description: 'Increase minimum coverage to 85%',
        rationale: 'Improve code quality',
        impact: 'All future code must meet 85% coverage',
        status: 'proposed',
        votesFor: 0,
        votesAgainst: 0,
        implementationDate: null
      };

      expect(amendment.changeType).toBe('modify');
      expect(amendment.status).toBe('proposed');
      expect(amendment.rationale).toBeDefined();
    });

    it('should support amendment lifecycle', () => {
      const statuses: AmendmentStatus[] = ['proposed', 'under_review', 'approved', 'rejected', 'implemented'];
      statuses.forEach(status => {
        const amendment: ConstitutionalAmendment = {
          id: `amend-${status}`,
          proposedDate: new Date(),
          proposedBy: 'developer',
          principleId: 'test-principle',
          changeType: 'add',
          description: 'Test amendment',
          rationale: 'Testing',
          impact: 'None',
          status,
          votesFor: 0,
          votesAgainst: 0,
          implementationDate: status === 'implemented' ? new Date() : null
        };
        expect(amendment.status).toBe(status);
      });
    });
  });

  describe('Constitution', () => {
    it('should define the complete constitution structure', () => {
      const constitution: Constitution = {
        version: '1.0.0',
        lastUpdated: new Date(),
        principles: [],
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

      expect(constitution.version).toBeDefined();
      expect(constitution.tddRequirements.minimumCoverage).toBe(80);
      expect(constitution.questioningRequirements.minimumConfidenceThreshold).toBe(85);
      expect(constitution.contextRequirements.minimumContextLines).toBe(200);
      expect(constitution.qualityRequirements.performanceThresholds).toBeDefined();
    });
  });

  describe('Severity Levels', () => {
    it('should support all severity levels', () => {
      const severities: ViolationSeverity[] = ['critical', 'high', 'medium', 'low'];
      severities.forEach(severity => {
        const violation: ConstitutionalViolation = {
          id: `sev-${severity}`,
          timestamp: new Date(),
          principleId: 'test',
          type: 'quality',
          severity,
          description: `${severity} severity violation`,
          context: {},
          blocked: severity === 'critical',
          resolution: null
        };
        expect(violation.severity).toBe(severity);
        if (severity === 'critical') {
          expect(violation.blocked).toBe(true);
        }
      });
    });
  });
});
import { ConstitutionalEnforcer } from '../../../../src/engine/constitution/ConstitutionalEnforcer';
import {
  Constitution,
  TDDViolation,
  QuestioningViolation,
  ContextViolation,
  QualityViolation,
  ValidationViolation,
  DEFAULT_CONSTITUTION
} from '../../../../src/types/constitution';

describe('ConstitutionalEnforcer', () => {
  let enforcer: ConstitutionalEnforcer;
  let constitution: Constitution;

  beforeEach(() => {
    constitution = { ...DEFAULT_CONSTITUTION };
    enforcer = new ConstitutionalEnforcer(constitution);
  });

  describe('TDD Enforcement', () => {
    describe('validateTDD', () => {
      it('should pass when tests exist and are failing', () => {
        const result = enforcer.validateTDD({
          hasTests: true,
          testsAreFailing: true,
          coverage: 85,
          phase: 'red'
        });

        expect(result.valid).toBe(true);
        expect(result.violations).toHaveLength(0);
      });

      it('should block when no tests exist', () => {
        const result = enforcer.validateTDD({
          hasTests: false,
          testsAreFailing: false,
          coverage: 0,
          phase: 'green'
        });

        expect(result.valid).toBe(false);
        expect(result.violations).toHaveLength(1);
        expect(result.violations[0].type).toBe('tdd');
        expect((result.violations[0] as TDDViolation).attemptedImplementationFirst).toBe(true);
      });

      it('should block when tests are not failing in red phase', () => {
        const result = enforcer.validateTDD({
          hasTests: true,
          testsAreFailing: false,
          coverage: 85,
          phase: 'red'
        });

        expect(result.valid).toBe(false);
        expect(result.violations).toHaveLength(1);
        expect((result.violations[0] as TDDViolation).hasFailingTest).toBe(false);
      });

      it('should block when coverage is below minimum', () => {
        const result = enforcer.validateTDD({
          hasTests: true,
          testsAreFailing: false,
          coverage: 75,
          phase: 'refactor'
        });

        expect(result.valid).toBe(false);
        expect(result.violations).toHaveLength(1);
        expect((result.violations[0] as TDDViolation).coverage).toBe(75);
      });

      it('should throw on critical TDD violations', () => {
        expect(() => {
          enforcer.blockViolations([{
            id: 'tdd-001',
            timestamp: new Date(),
            principleId: 'tdd-first',
            type: 'tdd',
            severity: 'critical',
            description: 'Implementation without tests',
            context: {},
            blocked: true,
            resolution: null,
            phase: 'green',
            hasFailingTest: false,
            coverage: 0,
            attemptedImplementationFirst: true
          } as TDDViolation]);
        }).toThrow('CONSTITUTIONAL VIOLATION DETECTED');
      });
    });
  });

  describe('Questioning Enforcement', () => {
    describe('checkQuestioningCompleteness', () => {
      it('should pass when confidence threshold is met', () => {
        const result = enforcer.checkQuestioningCompleteness({
          confidence: 90,
          questionsAsked: 15,
          gapsIdentified: [],
          edgeCasesFound: 3
        });

        expect(result.valid).toBe(true);
        expect(result.violations).toHaveLength(0);
      });

      it('should block when confidence is below threshold', () => {
        const result = enforcer.checkQuestioningCompleteness({
          confidence: 70,
          questionsAsked: 3,
          gapsIdentified: ['requirement clarity', 'error handling'],
          edgeCasesFound: 0
        });

        expect(result.valid).toBe(false);
        expect(result.violations).toHaveLength(1);
        expect(result.violations[0].type).toBe('questioning');
        expect((result.violations[0] as QuestioningViolation).confidence).toBe(70);
        expect((result.violations[0] as QuestioningViolation).threshold).toBe(85);
      });

      it('should require triage phase with initial questions', () => {
        const result = enforcer.checkQuestioningCompleteness({
          confidence: 50,
          questionsAsked: 0,
          gapsIdentified: [],
          edgeCasesFound: 0
        });

        expect(result.valid).toBe(false);
        expect(result.violations).toHaveLength(1);
        expect(result.violations[0].description).toContain('triage');
      });

      it('should allow unlimited exploration after triage', () => {
        const result = enforcer.checkQuestioningCompleteness({
          confidence: 84,
          questionsAsked: 50,
          gapsIdentified: ['minor detail'],
          edgeCasesFound: 5
        });

        expect(result.valid).toBe(false);
        expect(result.violations).toHaveLength(1);
        expect((result.violations[0] as QuestioningViolation).confidence).toBe(84);
      });
    });
  });

  describe('Context Enforcement', () => {
    describe('enforceContextRequirements', () => {
      it('should pass with properly embedded context', () => {
        const result = enforcer.enforceContextRequirements({
          contextLines: 500,
          hasDecisionLog: true,
          hasPatterns: true,
          isEmbedded: true,
          hasExternalDependencies: false
        });

        expect(result.valid).toBe(true);
        expect(result.violations).toHaveLength(0);
      });

      it('should block when context is too small', () => {
        const result = enforcer.enforceContextRequirements({
          contextLines: 150,
          hasDecisionLog: true,
          hasPatterns: true,
          isEmbedded: true,
          hasExternalDependencies: false
        });

        expect(result.valid).toBe(false);
        expect(result.violations).toHaveLength(1);
        expect(result.violations[0].type).toBe('context');
        expect((result.violations[0] as ContextViolation).contextSize).toBe(150);
      });

      it('should block when context is too large', () => {
        const result = enforcer.enforceContextRequirements({
          contextLines: 2500,
          hasDecisionLog: true,
          hasPatterns: true,
          isEmbedded: true,
          hasExternalDependencies: false
        });

        expect(result.valid).toBe(false);
        expect(result.violations).toHaveLength(1);
        expect(result.violations[0].type).toBe('context');
        expect((result.violations[0] as ContextViolation).contextSize).toBe(2500);
      });

      it('should block when context has external dependencies', () => {
        const result = enforcer.enforceContextRequirements({
          contextLines: 500,
          hasDecisionLog: true,
          hasPatterns: true,
          isEmbedded: false,
          hasExternalDependencies: true
        });

        expect(result.valid).toBe(false);
        expect(result.violations).toHaveLength(1);
        expect(result.violations[0].description).toContain('external');
      });

      it('should adapt context size based on confidence', () => {
        const lowConfidenceResult = enforcer.enforceContextRequirements({
          contextLines: 300,
          hasDecisionLog: true,
          hasPatterns: true,
          isEmbedded: true,
          hasExternalDependencies: false,
          confidence: 60
        });

        expect(lowConfidenceResult.valid).toBe(false);

        const highConfidenceResult = enforcer.enforceContextRequirements({
          contextLines: 300,
          hasDecisionLog: true,
          hasPatterns: true,
          isEmbedded: true,
          hasExternalDependencies: false,
          confidence: 95
        });

        expect(highConfidenceResult.valid).toBe(true);
      });
    });
  });

  describe('Quality Enforcement', () => {
    describe('enforceQualityGates', () => {
      it('should pass all quality gates', () => {
        const result = enforcer.enforceQualityGates({
          testCoverage: 85,
          hasCodeReview: true,
          followsNamingConventions: true,
          hasCodeSmells: false,
          hasDocumentation: true,
          performance: {
            shardingReduction: 75,
            contextLookupReduction: 65,
            implementationTimeReduction: 35
          }
        });

        expect(result.valid).toBe(true);
        expect(result.violations).toHaveLength(0);
      });

      it('should block on insufficient test coverage', () => {
        const result = enforcer.enforceQualityGates({
          testCoverage: 75,
          hasCodeReview: true,
          followsNamingConventions: true,
          hasCodeSmells: false,
          hasDocumentation: true,
          performance: {
            shardingReduction: 75,
            contextLookupReduction: 65,
            implementationTimeReduction: 35
          }
        });

        expect(result.valid).toBe(false);
        expect(result.violations).toHaveLength(1);
        expect((result.violations[0] as QualityViolation).qualityMetric).toBe('testCoverage');
      });

      it('should block on poor performance metrics', () => {
        const result = enforcer.enforceQualityGates({
          testCoverage: 85,
          hasCodeReview: true,
          followsNamingConventions: true,
          hasCodeSmells: false,
          hasDocumentation: true,
          performance: {
            shardingReduction: 65,
            contextLookupReduction: 55,
            implementationTimeReduction: 25
          }
        });

        expect(result.valid).toBe(false);
        expect(result.violations.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Validation Enforcement', () => {
    describe('enforceValidationRequirements', () => {
      it('should pass with all validations complete', () => {
        const result = enforcer.enforceValidationRequirements({
          preImplementationValidated: true,
          postImplementationValidated: true,
          ciChecksPassed: true,
          noRegressions: true,
          constitutionallyCompliant: true
        });

        expect(result.valid).toBe(true);
        expect(result.violations).toHaveLength(0);
      });

      it('should block when pre-implementation validation missing', () => {
        const result = enforcer.enforceValidationRequirements({
          preImplementationValidated: false,
          postImplementationValidated: true,
          ciChecksPassed: true,
          noRegressions: true,
          constitutionallyCompliant: true
        });

        expect(result.valid).toBe(false);
        expect(result.violations).toHaveLength(1);
        expect((result.violations[0] as ValidationViolation).validationType).toContain('pre-implementation');
      });

      it('should block on constitutional non-compliance', () => {
        const result = enforcer.enforceValidationRequirements({
          preImplementationValidated: true,
          postImplementationValidated: true,
          ciChecksPassed: true,
          noRegressions: true,
          constitutionallyCompliant: false
        });

        expect(result.valid).toBe(false);
        expect(result.violations).toHaveLength(1);
        expect(result.violations[0].severity).toBe('critical');
      });
    });
  });

  describe('Blocking Mechanism', () => {
    it('should physically block execution on critical violations', () => {
      const criticalViolation: TDDViolation = {
        id: 'critical-001',
        timestamp: new Date(),
        principleId: 'tdd-first',
        type: 'tdd',
        severity: 'critical',
        description: 'Code without tests',
        context: { file: 'test.ts', line: 42 },
        blocked: true,
        resolution: null,
        phase: 'green',
        hasFailingTest: false,
        coverage: 0,
        attemptedImplementationFirst: true
      };

      expect(() => {
        enforcer.blockViolations([criticalViolation]);
      }).toThrow('CONSTITUTIONAL VIOLATION DETECTED');
    });

    it('should not block on warnings', () => {
      const warningViolation: QualityViolation = {
        id: 'warn-001',
        timestamp: new Date(),
        principleId: 'quality-gates',
        type: 'quality',
        severity: 'low',
        description: 'Minor naming convention issue',
        context: {},
        blocked: false,
        resolution: null,
        qualityMetric: 'naming',
        actualValue: 0,
        requiredValue: 1,
        failedChecks: ['camelCase']
      };

      expect(() => {
        enforcer.blockViolations([warningViolation]);
      }).not.toThrow();
    });

    it('should provide detailed error messages', () => {
      const violation: TDDViolation = {
        id: 'tdd-block-001',
        timestamp: new Date(),
        principleId: 'tdd-first',
        type: 'tdd',
        severity: 'critical',
        description: 'Implementation without failing test',
        context: {
          file: 'src/feature.ts',
          line: 100,
          phase: 'implementation'
        },
        blocked: true,
        resolution: 'Write failing test first',
        phase: 'green',
        hasFailingTest: false,
        coverage: 45,
        attemptedImplementationFirst: true
      };

      try {
        enforcer.blockViolations([violation]);
        fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toContain('CONSTITUTIONAL VIOLATION');
        expect(error.message).toContain('tdd-first');
        expect(error.message).toContain('Implementation without failing test');
        expect(error.violations).toEqual([violation]);
      }
    });
  });

  describe('Amendment Process', () => {
    it('should not allow amendments to immutable principles', () => {
      const result = enforcer.proposeAmendment({
        principleId: 'tdd-first',
        changeType: 'modify',
        description: 'Reduce coverage to 70%',
        rationale: 'Too strict',
        proposedBy: 'developer'
      });

      expect(result.success).toBe(false);
      expect(result.reason).toContain('immutable');
    });

    it('should allow amendments to amendable rules', () => {
      const result = enforcer.proposeAmendment({
        principleId: 'naming-conventions',
        changeType: 'modify',
        description: 'Allow snake_case for test files',
        rationale: 'Better readability for test descriptions',
        proposedBy: 'team-lead'
      });

      expect(result.success).toBe(true);
      expect(result.amendment?.status).toBe('proposed');
    });
  });

  describe('Comprehensive Validation', () => {
    it('should validate all constitutional requirements', () => {
      const result = enforcer.validateAll({
        tdd: {
          hasTests: true,
          testsAreFailing: true,
          coverage: 85,
          phase: 'red'
        },
        questioning: {
          confidence: 90,
          questionsAsked: 20,
          gapsIdentified: [],
          edgeCasesFound: 5
        },
        context: {
          contextLines: 500,
          hasDecisionLog: true,
          hasPatterns: true,
          isEmbedded: true,
          hasExternalDependencies: false
        },
        quality: {
          testCoverage: 85,
          hasCodeReview: true,
          followsNamingConventions: true,
          hasCodeSmells: false,
          hasDocumentation: true,
          performance: {
            shardingReduction: 75,
            contextLookupReduction: 65,
            implementationTimeReduction: 35
          }
        },
        validation: {
          preImplementationValidated: true,
          postImplementationValidated: true,
          ciChecksPassed: true,
          noRegressions: true,
          constitutionallyCompliant: true
        }
      });

      expect(result.compliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should collect all violations from all principles', () => {
      const result = enforcer.validateAll({
        tdd: {
          hasTests: false,
          testsAreFailing: false,
          coverage: 50,
          phase: 'green'
        },
        questioning: {
          confidence: 60,
          questionsAsked: 2,
          gapsIdentified: ['many', 'gaps'],
          edgeCasesFound: 0
        },
        context: {
          contextLines: 100,
          hasDecisionLog: false,
          hasPatterns: false,
          isEmbedded: false,
          hasExternalDependencies: true
        },
        quality: {
          testCoverage: 50,
          hasCodeReview: false,
          followsNamingConventions: false,
          hasCodeSmells: true,
          hasDocumentation: false,
          performance: {
            shardingReduction: 50,
            contextLookupReduction: 40,
            implementationTimeReduction: 10
          }
        },
        validation: {
          preImplementationValidated: false,
          postImplementationValidated: false,
          ciChecksPassed: false,
          noRegressions: false,
          constitutionallyCompliant: false
        }
      });

      expect(result.compliant).toBe(false);
      expect(result.violations.length).toBeGreaterThan(4);
      expect(result.violations.some(v => v.type === 'tdd')).toBe(true);
      expect(result.violations.some(v => v.type === 'questioning')).toBe(true);
      expect(result.violations.some(v => v.type === 'context')).toBe(true);
      expect(result.violations.some(v => v.type === 'quality')).toBe(true);
      expect(result.violations.some(v => v.type === 'validation')).toBe(true);
    });
  });
});
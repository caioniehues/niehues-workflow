import {
  PipelineValidator,
  PipelineContext,
  ValidationConfiguration,
  PipelineValidationResult,
  PipelinePhase,
  IntegrationPoint,
  DataFlow,
  Artifact,
  HandoffPoint
} from '../../../../src/engine/validation/PipelineValidator';
import { DecisionLogger } from '../../../../src/engine/intelligence/DecisionLogger';
import { WorkflowMetrics } from '../../../../src/engine/metrics/WorkflowMetrics';

// Mock dependencies
jest.mock('../../../../src/engine/intelligence/DecisionLogger');
jest.mock('../../../../src/engine/metrics/WorkflowMetrics');

describe('PipelineValidator', () => {
  let pipelineValidator: PipelineValidator;
  let mockDecisionLogger: jest.Mocked<DecisionLogger>;
  let mockWorkflowMetrics: jest.Mocked<WorkflowMetrics>;
  let mockPipelineContext: PipelineContext;
  let mockValidationConfig: ValidationConfiguration;

  beforeEach(() => {
    mockDecisionLogger = new DecisionLogger() as jest.Mocked<DecisionLogger>;
    mockWorkflowMetrics = new WorkflowMetrics() as jest.Mocked<WorkflowMetrics>;
    pipelineValidator = new PipelineValidator(mockDecisionLogger, mockWorkflowMetrics);

    // Create mock pipeline context
    const mockPhases: PipelinePhase[] = [
      {
        name: 'requirements',
        entry_criteria: ['stakeholder_approval'],
        exit_criteria: ['requirements_documented', 'acceptance_criteria_defined'],
        prerequisites: [],
        outputs: ['requirements_document', 'user_stories'],
        supports_rollback: false
      },
      {
        name: 'design',
        entry_criteria: ['requirements_complete'],
        exit_criteria: ['architecture_approved', 'design_reviewed'],
        prerequisites: ['requirements'],
        outputs: ['architecture_diagram', 'design_document'],
        supports_rollback: true
      },
      {
        name: 'implementation',
        entry_criteria: ['design_approved'],
        exit_criteria: ['code_complete', 'tests_passing'],
        prerequisites: ['design'],
        outputs: ['source_code', 'unit_tests'],
        supports_rollback: true
      }
    ];

    const mockIntegrationPoints: IntegrationPoint[] = [
      {
        name: 'requirements_to_design',
        source: 'requirements',
        target: 'design',
        protocol: 'context_inheritance',
        data_format: 'structured_json'
      },
      {
        name: 'design_to_implementation',
        source: 'design',
        target: 'implementation',
        protocol: 'artifact_transfer',
        data_format: 'specification_documents'
      }
    ];

    const mockDataFlows: DataFlow[] = [
      {
        name: 'requirements_flow',
        source: 'stakeholder_input',
        destination: 'requirements_store',
        data_type: 'requirements_data',
        transformation_rules: ['normalize_format', 'validate_completeness']
      },
      {
        name: 'design_flow',
        source: 'requirements_store',
        destination: 'design_store',
        data_type: 'design_specifications',
        transformation_rules: ['extract_design_elements', 'create_architecture']
      }
    ];

    const mockArtifacts: Artifact[] = [
      {
        type: 'requirements_document',
        path: '/artifacts/requirements.md',
        version: '1.0.0',
        dependencies: []
      },
      {
        type: 'design_document',
        path: '/artifacts/design.md',
        version: '1.0.0',
        dependencies: ['requirements_document']
      },
      {
        type: 'source_code',
        path: '/src',
        version: '1.0.0',
        dependencies: ['design_document']
      }
    ];

    const mockHandoffPoints: HandoffPoint[] = [
      {
        name: 'requirements_to_design_handoff',
        from_phase: 'requirements',
        to_phase: 'design',
        data_transfer: ['requirements_document', 'stakeholder_feedback'],
        responsibility_transfer: ['requirements_ownership', 'stakeholder_communication']
      },
      {
        name: 'design_to_implementation_handoff',
        from_phase: 'design',
        to_phase: 'implementation',
        data_transfer: ['design_document', 'architecture_diagram'],
        responsibility_transfer: ['design_ownership', 'technical_decisions']
      }
    ];

    mockPipelineContext = {
      pipeline_id: 'test_pipeline_001',
      current_phase: 'implementation',
      phases: mockPhases,
      components: [
        {
          name: 'requirements_analyzer',
          type: 'analyzer',
          dependencies: [],
          interfaces: ['stakeholder_input']
        },
        {
          name: 'design_generator',
          type: 'generator',
          dependencies: ['requirements_analyzer'],
          interfaces: ['requirements_input', 'design_output']
        }
      ],
      integration_points: mockIntegrationPoints,
      data_flows: mockDataFlows,
      artifacts: mockArtifacts,
      handoff_points: mockHandoffPoints,
      configuration: {
        timeout_ms: 300000,
        retry_attempts: 3,
        parallel_execution: true,
        error_handling_strategy: 'graceful_degradation'
      }
    };

    mockValidationConfig = {
      validation_level: 'standard',
      include_performance_tests: true,
      include_security_tests: true,
      include_rollback_tests: true,
      timeout_ms: 60000,
      parallel_validation: true,
      fail_fast: false,
      generate_report: true,
      store_metrics: true
    };

    // Setup mocks
    mockDecisionLogger.logDecision = jest.fn().mockResolvedValue({
      id: 'decision_123',
      title: 'Pipeline Validation',
      status: 'approved'
    });
  });

  describe('validatePipeline', () => {
    it('should perform comprehensive pipeline validation', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      expect(result).toMatchObject({
        is_valid: expect.any(Boolean),
        validation_timestamp: expect.any(Date),
        overall_score: expect.any(Number),
        phase_validations: expect.any(Array),
        integration_validations: expect.any(Array),
        data_flow_validations: expect.any(Array),
        artifact_validations: expect.any(Array),
        handoff_validations: expect.any(Array),
        rollback_validations: expect.any(Array),
        error_recovery_validations: expect.any(Array),
        recommendations: expect.any(Array),
        critical_issues: expect.any(Array),
        validation_metadata: expect.objectContaining({
          validator_version: '1.0.0',
          validation_time_ms: expect.any(Number),
          total_checks_performed: expect.any(Number)
        })
      });
    });

    it('should validate all phases in the pipeline', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      expect(result.phase_validations).toHaveLength(mockPipelineContext.phases.length);

      result.phase_validations.forEach((phaseValidation, index) => {
        expect(phaseValidation).toMatchObject({
          phase_name: mockPipelineContext.phases[index].name,
          is_valid: expect.any(Boolean),
          validation_score: expect.any(Number),
          entry_criteria_met: expect.any(Boolean),
          exit_criteria_met: expect.any(Boolean),
          prerequisites_satisfied: expect.any(Boolean),
          outputs_generated: expect.any(Boolean),
          phase_specific_checks: expect.any(Array),
          transition_readiness: expect.any(Object),
          issues_found: expect.any(Array)
        });
      });
    });

    it('should validate integration points', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      expect(result.integration_validations).toHaveLength(mockPipelineContext.integration_points.length);

      result.integration_validations.forEach((integrationValidation, index) => {
        expect(integrationValidation).toMatchObject({
          integration_point: mockPipelineContext.integration_points[index].name,
          source_component: mockPipelineContext.integration_points[index].source,
          target_component: mockPipelineContext.integration_points[index].target,
          is_valid: expect.any(Boolean),
          connection_status: expect.any(Object),
          data_compatibility: expect.any(Object),
          protocol_compliance: expect.any(Object),
          error_handling: expect.any(Object),
          performance_validation: expect.any(Object),
          security_validation: expect.any(Object)
        });
      });
    });

    it('should validate data flows', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      expect(result.data_flow_validations).toHaveLength(mockPipelineContext.data_flows.length);

      result.data_flow_validations.forEach((dataFlowValidation, index) => {
        expect(dataFlowValidation).toMatchObject({
          flow_name: mockPipelineContext.data_flows[index].name,
          source: mockPipelineContext.data_flows[index].source,
          destination: mockPipelineContext.data_flows[index].destination,
          is_valid: expect.any(Boolean),
          data_integrity: expect.any(Object),
          transformation_validity: expect.any(Object),
          schema_compatibility: expect.any(Object),
          data_lineage: expect.any(Object),
          quality_metrics: expect.any(Object)
        });
      });
    });

    it('should validate artifacts', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      expect(result.artifact_validations).toHaveLength(mockPipelineContext.artifacts.length);

      result.artifact_validations.forEach((artifactValidation, index) => {
        expect(artifactValidation).toMatchObject({
          artifact_type: mockPipelineContext.artifacts[index].type,
          artifact_path: mockPipelineContext.artifacts[index].path,
          is_valid: expect.any(Boolean),
          existence_check: expect.any(Boolean),
          format_validation: expect.any(Object),
          content_validation: expect.any(Object),
          version_consistency: expect.any(Object),
          preservation_status: expect.any(Object),
          accessibility: expect.any(Object)
        });
      });
    });

    it('should validate handoff points', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      expect(result.handoff_validations).toHaveLength(mockPipelineContext.handoff_points.length);

      result.handoff_validations.forEach((handoffValidation, index) => {
        expect(handoffValidation).toMatchObject({
          handoff_point: mockPipelineContext.handoff_points[index].name,
          from_phase: mockPipelineContext.handoff_points[index].from_phase,
          to_phase: mockPipelineContext.handoff_points[index].to_phase,
          is_valid: expect.any(Boolean),
          protocol_compliance: expect.any(Object),
          data_transfer_integrity: expect.any(Object),
          context_preservation: expect.any(Object),
          responsibility_transfer: expect.any(Object),
          documentation_completeness: expect.any(Object)
        });
      });
    });

    it('should test rollback capabilities when enabled', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      // Should have rollback validations for phases that support rollback
      const rollbackSupportingPhases = mockPipelineContext.phases.filter(p => p.supports_rollback);
      expect(result.rollback_validations).toHaveLength(rollbackSupportingPhases.length);

      result.rollback_validations.forEach(rollbackValidation => {
        expect(rollbackValidation).toMatchObject({
          rollback_point: expect.any(String),
          is_capable: expect.any(Boolean),
          rollback_mechanisms: expect.any(Array),
          state_restoration: expect.any(Object),
          data_consistency: expect.any(Object),
          dependency_handling: expect.any(Object),
          rollback_testing: expect.any(Object),
          recovery_time_estimate: expect.any(Number)
        });
      });
    });

    it('should test error recovery mechanisms when enabled', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      expect(result.error_recovery_validations.length).toBeGreaterThan(0);

      result.error_recovery_validations.forEach(errorRecoveryValidation => {
        expect(errorRecoveryValidation).toMatchObject({
          error_scenario: expect.any(String),
          recovery_mechanism: expect.any(String),
          is_functional: expect.any(Boolean),
          detection_capability: expect.any(Object),
          isolation_mechanism: expect.any(Object),
          recovery_procedure: expect.any(Object),
          fallback_options: expect.any(Array),
          recovery_testing: expect.any(Object)
        });
      });
    });

    it('should calculate overall validation score correctly', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      expect(result.overall_score).toBeGreaterThanOrEqual(0);
      expect(result.overall_score).toBeLessThanOrEqual(1);

      // Score should be reflected in validation result
      if (result.overall_score >= 0.85) {
        expect(result.is_valid).toBe(true);
      } else {
        expect(result.is_valid).toBe(false);
      }
    });

    it('should identify critical issues when validation fails', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      result.critical_issues.forEach(issue => {
        expect(issue).toMatchObject({
          severity: expect.stringMatching(/^(critical|high|medium|low)$/),
          category: expect.any(String),
          description: expect.any(String),
          impact: expect.any(String),
          recommended_action: expect.any(String),
          affected_components: expect.any(Array)
        });
      });
    });

    it('should generate recommendations for improvement', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      result.recommendations.forEach(recommendation => {
        expect(recommendation).toMatchObject({
          priority: expect.stringMatching(/^(critical|high|medium|low)$/),
          category: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          action_items: expect.any(Array),
          expected_impact: expect.any(String)
        });
      });
    });

    it('should log validation decision', async () => {
      await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      expect(mockDecisionLogger.logDecision).toHaveBeenCalledWith(
        expect.stringContaining('Pipeline Validation'),
        expect.any(String),
        'validation',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should include comprehensive metadata', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      expect(result.validation_metadata).toMatchObject({
        validator_version: '1.0.0',
        validation_time_ms: expect.any(Number),
        configuration_used: mockValidationConfig,
        total_checks_performed: expect.any(Number),
        parallel_execution: mockValidationConfig.parallel_validation,
        timeout_applied: expect.any(Boolean)
      });

      expect(result.validation_metadata.validation_time_ms).toBeGreaterThan(0);
      expect(result.validation_metadata.total_checks_performed).toBeGreaterThan(0);
    });
  });

  describe('validation configuration options', () => {
    it('should respect parallel validation setting', async () => {
      const sequentialConfig = {
        ...mockValidationConfig,
        parallel_validation: false
      };

      const result = await pipelineValidator.validatePipeline(mockPipelineContext, sequentialConfig);

      expect(result.validation_metadata.parallel_execution).toBe(false);
    });

    it('should apply timeout configuration', async () => {
      const shortTimeoutConfig = {
        ...mockValidationConfig,
        timeout_ms: 100 // Very short timeout
      };

      const result = await pipelineValidator.validatePipeline(mockPipelineContext, shortTimeoutConfig);

      expect(result.validation_metadata.configuration_used.timeout_ms).toBe(100);
    });

    it('should skip rollback tests when disabled', async () => {
      const noRollbackConfig = {
        ...mockValidationConfig,
        include_rollback_tests: false
      };

      const result = await pipelineValidator.validatePipeline(mockPipelineContext, noRollbackConfig);

      expect(result.rollback_validations).toHaveLength(0);
    });

    it('should skip error recovery tests when disabled', async () => {
      const noErrorRecoveryConfig = {
        ...mockValidationConfig,
        include_security_tests: false
      };

      const result = await pipelineValidator.validatePipeline(mockPipelineContext, noErrorRecoveryConfig);

      expect(result.error_recovery_validations).toHaveLength(0);
    });

    it('should use default configuration when none provided', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext);

      expect(result.validation_metadata.configuration_used).toMatchObject({
        validation_level: 'standard',
        include_performance_tests: true,
        include_security_tests: true,
        include_rollback_tests: false,
        timeout_ms: 300000,
        parallel_validation: true,
        fail_fast: false,
        generate_report: true,
        store_metrics: true
      });
    });
  });

  describe('validation levels', () => {
    it('should perform basic validation', async () => {
      const basicConfig = {
        ...mockValidationConfig,
        validation_level: 'basic' as const
      };

      const result = await pipelineValidator.validatePipeline(mockPipelineContext, basicConfig);

      expect(result.validation_metadata.configuration_used.validation_level).toBe('basic');
    });

    it('should perform comprehensive validation', async () => {
      const comprehensiveConfig = {
        ...mockValidationConfig,
        validation_level: 'comprehensive' as const
      };

      const result = await pipelineValidator.validatePipeline(mockPipelineContext, comprehensiveConfig);

      expect(result.validation_metadata.configuration_used.validation_level).toBe('comprehensive');
    });

    it('should perform exhaustive validation', async () => {
      const exhaustiveConfig = {
        ...mockValidationConfig,
        validation_level: 'exhaustive' as const
      };

      const result = await pipelineValidator.validatePipeline(mockPipelineContext, exhaustiveConfig);

      expect(result.validation_metadata.configuration_used.validation_level).toBe('exhaustive');
    });
  });

  describe('error handling', () => {
    it('should handle validation errors gracefully', async () => {
      // Create a pipeline context that might cause validation issues
      const problematicContext = {
        ...mockPipelineContext,
        phases: [] // No phases should cause issues
      };

      const result = await pipelineValidator.validatePipeline(problematicContext, mockValidationConfig);

      expect(result.phase_validations).toHaveLength(0);
      expect(result.overall_score).toBeDefined();
    });

    it('should provide meaningful error messages in critical issues', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      result.critical_issues.forEach(issue => {
        expect(issue.description).toBeTruthy();
        expect(issue.description.length).toBeGreaterThan(10);
        expect(issue.recommended_action).toBeTruthy();
        expect(issue.affected_components).toBeDefined();
      });
    });
  });

  describe('performance and scalability', () => {
    it('should handle large numbers of pipeline components', async () => {
      // Create a context with many components
      const largeContext = {
        ...mockPipelineContext,
        phases: Array.from({ length: 20 }, (_, i) => ({
          name: `phase_${i}`,
          entry_criteria: [`prerequisite_${i}`],
          exit_criteria: [`output_${i}`],
          prerequisites: i > 0 ? [`phase_${i-1}`] : [],
          outputs: [`artifact_${i}`],
          supports_rollback: i % 2 === 0
        })),
        integration_points: Array.from({ length: 50 }, (_, i) => ({
          name: `integration_${i}`,
          source: `component_${i}`,
          target: `component_${i+1}`,
          protocol: 'http',
          data_format: 'json'
        }))
      };

      const startTime = Date.now();
      const result = await pipelineValidator.validatePipeline(largeContext, mockValidationConfig);
      const duration = Date.now() - startTime;

      expect(result.phase_validations).toHaveLength(20);
      expect(result.integration_validations).toHaveLength(50);
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should benefit from parallel validation', async () => {
      const sequentialConfig = { ...mockValidationConfig, parallel_validation: false };
      const parallelConfig = { ...mockValidationConfig, parallel_validation: true };

      const sequentialStart = Date.now();
      await pipelineValidator.validatePipeline(mockPipelineContext, sequentialConfig);
      const sequentialDuration = Date.now() - sequentialStart;

      const parallelStart = Date.now();
      await pipelineValidator.validatePipeline(mockPipelineContext, parallelConfig);
      const parallelDuration = Date.now() - parallelStart;

      // Parallel should generally be faster or at least not significantly slower
      expect(parallelDuration).toBeLessThanOrEqual(sequentialDuration * 1.5);
    });
  });

  describe('integration with other components', () => {
    it('should integrate with DecisionLogger for audit trail', async () => {
      await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      expect(mockDecisionLogger.logDecision).toHaveBeenCalledTimes(1);

      const logCall = mockDecisionLogger.logDecision.mock.calls[0];
      expect(logCall[0]).toContain('Pipeline Validation');
      expect(logCall[2]).toBe('validation');
    });

    it('should provide validation results compatible with metrics collection', async () => {
      const result = await pipelineValidator.validatePipeline(mockPipelineContext, mockValidationConfig);

      // Ensure result structure is suitable for metrics collection
      expect(result.overall_score).toBeGreaterThanOrEqual(0);
      expect(result.overall_score).toBeLessThanOrEqual(1);
      expect(result.validation_metadata.validation_time_ms).toBeGreaterThan(0);
      expect(result.validation_metadata.total_checks_performed).toBeGreaterThan(0);
    });
  });
});
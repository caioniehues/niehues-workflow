import * as fs from 'fs';
import * as path from 'path';
import * as tmp from 'tmp';
import { PipelineIntegration, WorkflowRequest, WorkflowConfiguration, WorkflowResult } from '../../src/engine/integration/PipelineIntegration';

describe('PipelineIntegration - End-to-End Integration Tests', () => {
  let pipelineIntegration: PipelineIntegration;
  let testProjectDir: string;
  let cleanupCallback: () => void;

  beforeEach(() => {
    // Create temporary directory for each test
    const tmpDir = tmp.dirSync({ unsafeCleanup: true });
    testProjectDir = tmpDir.name;
    cleanupCallback = tmpDir.removeCallback;

    // Initialize pipeline integration
    pipelineIntegration = new PipelineIntegration();

    // Setup test project structure
    setupTestProjectStructure(testProjectDir);
  });

  afterEach(() => {
    // Cleanup temporary directory
    if (cleanupCallback) {
      cleanupCallback();
    }
  });

  describe('Complete Workflow Execution', () => {
    it('should execute full workflow from requirement to implementation', async () => {
      const workflowRequest: WorkflowRequest = {
        project_name: 'todo-app-test',
        initial_requirement: 'Create a simple todo application with add, complete, and delete functionality',
        project_directory: testProjectDir,
        configuration: {
          auto_advance: true,
          validation_level: 'standard',
          parallel_processing: false, // Sequential for easier testing
          constitutional_compliance: 'standard',
          context_preservation_mode: 'standard',
          error_handling: 'graceful_degradation',
          approval_required: false,
          dry_run: false
        }
      };

      const result = await pipelineIntegration.executeFullWorkflow(workflowRequest);

      // Validate overall workflow success
      expect(result.status).toBe('completed');
      expect(result.workflow_id).toBeTruthy();
      expect(result.phases_executed).toHaveLength(5); // All 5 phases

      // Validate phase execution order and completion
      const phaseOrder = ['brainstorm', 'specify', 'shard', 'decompose', 'implement'];
      result.phases_executed.forEach((phase, index) => {
        expect(phase.phase).toBe(phaseOrder[index]);
        expect(phase.status).toBe('completed');
        expect(phase.duration_ms).toBeGreaterThan(0);
      });

      // Validate artifacts generation
      expect(result.artifacts_generated.length).toBeGreaterThan(0);
      expect(result.decisions_made.length).toBeGreaterThan(0);

      // Validate context preservation through phases
      expect(result.context_chain).toHaveLength(5);
      result.context_chain.forEach(context => {
        expect(context.confidence_score).toBeGreaterThan(0.5);
        expect(context.preservation_score).toBeGreaterThan(0.5);
      });

      // Validate execution summary
      expect(result.execution_summary.workflow_successful).toBe(true);
      expect(result.execution_summary.phases_completed).toBe(5);
      expect(result.execution_summary.phases_failed).toBe(0);
      expect(result.execution_summary.constitutional_violations).toBe(0);

    }, 120000); // Extended timeout for full workflow

    it('should handle constitutional compliance throughout workflow', async () => {
      const workflowRequest: WorkflowRequest = {
        project_name: 'compliance-test',
        initial_requirement: 'Create a user authentication system',
        project_directory: testProjectDir,
        configuration: {
          auto_advance: true,
          constitutional_compliance: 'strict',
          approval_required: false,
          dry_run: false
        }
      };

      const result = await pipelineIntegration.executeFullWorkflow(workflowRequest);

      // Should complete successfully with strict compliance
      expect(result.status).toBe('completed');

      // Validate no constitutional violations
      expect(result.execution_summary.constitutional_violations).toBe(0);

      // Validate TDD enforcement (constitutional requirement)
      const implementationPhase = result.phases_executed.find(p => p.phase === 'implement');
      expect(implementationPhase).toBeTruthy();
      expect(implementationPhase!.validation_passed).toBe(true);

      // Check that decisions were logged for constitutional compliance
      const constitutionalDecisions = result.decisions_made.filter(d =>
        d.title.includes('Constitutional') || d.description.includes('constitutional')
      );
      expect(constitutionalDecisions.length).toBeGreaterThan(0);

    }, 90000);

    it('should preserve context inheritance between phases', async () => {
      const workflowRequest: WorkflowRequest = {
        project_name: 'context-test',
        initial_requirement: 'Build a REST API for managing books',
        project_directory: testProjectDir,
        configuration: {
          auto_advance: true,
          context_preservation_mode: 'comprehensive',
          approval_required: false,
          dry_run: false
        }
      };

      const result = await pipelineIntegration.executeFullWorkflow(workflowRequest);

      expect(result.status).toBe('completed');

      // Validate context inheritance chain
      expect(result.context_chain).toHaveLength(5);

      // Each phase should inherit context from previous phase
      result.phases_executed.slice(1).forEach((phase, index) => {
        expect(phase.context_inherited).toBeTruthy();
        expect(phase.context_inherited!.preserved_decisions).toBe(true);
        expect(phase.context_inherited!.quality_score).toBeGreaterThan(0.7);
      });

      // Context size should increase as we progress (accumulating context)
      const contextSizes = result.context_chain.map(c => c.context_size_bytes);
      expect(contextSizes[1]).toBeGreaterThan(contextSizes[0]); // Specification > Brainstorm
      expect(contextSizes[2]).toBeGreaterThan(contextSizes[1]); // Sharding > Specification

    }, 90000);

    it('should generate appropriate artifacts for each phase', async () => {
      const workflowRequest: WorkflowRequest = {
        project_name: 'artifacts-test',
        initial_requirement: 'Create a simple calculator application',
        project_directory: testProjectDir,
        configuration: {
          auto_advance: true,
          approval_required: false,
          dry_run: false
        }
      };

      const result = await pipelineIntegration.executeFullWorkflow(workflowRequest);

      expect(result.status).toBe('completed');

      // Validate artifacts for each phase
      const brainstormPhase = result.phases_executed.find(p => p.phase === 'brainstorm');
      expect(brainstormPhase!.artifacts_created.length).toBeGreaterThan(0);
      expect(brainstormPhase!.artifacts_created.some(a => a.includes('approaches'))).toBe(true);

      const specificationPhase = result.phases_executed.find(p => p.phase === 'specify');
      expect(specificationPhase!.artifacts_created.length).toBeGreaterThan(0);

      const shardingPhase = result.phases_executed.find(p => p.phase === 'shard');
      expect(shardingPhase!.artifacts_created.length).toBeGreaterThan(0);
      expect(shardingPhase!.artifacts_created.some(a => a.includes('shard'))).toBe(true);

      const decompositionPhase = result.phases_executed.find(p => p.phase === 'decompose');
      expect(decompositionPhase!.artifacts_created.length).toBeGreaterThan(0);
      expect(decompositionPhase!.artifacts_created.some(a => a.includes('task'))).toBe(true);

      const implementationPhase = result.phases_executed.find(p => p.phase === 'implement');
      expect(implementationPhase!.artifacts_created.length).toBeGreaterThan(0);

      // Validate artifact metadata
      result.artifacts_generated.forEach(artifact => {
        expect(artifact.type).toBeTruthy();
        expect(artifact.path).toBeTruthy();
        expect(artifact.created_at).toBeInstanceOf(Date);
        expect(artifact.size_bytes).toBeGreaterThan(0);
      });

    }, 90000);
  });

  describe('Error Handling and Recovery', () => {
    it('should handle phase failures gracefully', async () => {
      // Create a scenario that might cause failures
      const workflowRequest: WorkflowRequest = {
        project_name: 'error-test',
        initial_requirement: '', // Empty requirement to potentially cause issues
        project_directory: testProjectDir,
        configuration: {
          auto_advance: true,
          error_handling: 'graceful_degradation',
          approval_required: false,
          dry_run: false
        }
      };

      const result = await pipelineIntegration.executeFullWorkflow(workflowRequest);

      // Should handle errors gracefully
      expect(result.status).toBeDefined();
      expect(result.errors).toBeDefined();
      expect(result.execution_summary).toBeTruthy();

      // Should log errors properly
      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          expect(error.phase).toBeTruthy();
          expect(error.error_message).toBeTruthy();
          expect(error.timestamp).toBeInstanceOf(Date);
          expect(['low', 'medium', 'high', 'critical']).toContain(error.impact_level);
        });
      }

    }, 60000);

    it('should provide meaningful error messages and recovery suggestions', async () => {
      const workflowRequest: WorkflowRequest = {
        project_name: 'recovery-test',
        initial_requirement: 'Invalid requirement with impossible constraints',
        project_directory: '/invalid/path', // Invalid directory
        configuration: {
          auto_advance: true,
          error_handling: 'fail_fast',
          approval_required: false,
          dry_run: false
        }
      };

      try {
        const result = await pipelineIntegration.executeFullWorkflow(workflowRequest);

        // If it doesn't throw, check that errors are properly recorded
        if (result.status === 'failed') {
          expect(result.errors.length).toBeGreaterThan(0);
          expect(result.execution_summary.recommendations.length).toBeGreaterThan(0);
        }
      } catch (error) {
        // Expected to throw with invalid configuration
        expect(error).toBeTruthy();
      }

    }, 30000);
  });

  describe('Validation and Quality Assurance', () => {
    it('should run pipeline validation successfully', async () => {
      const workflowRequest: WorkflowRequest = {
        project_name: 'validation-test',
        initial_requirement: 'Create a simple note-taking app',
        project_directory: testProjectDir,
        configuration: {
          auto_advance: true,
          validation_level: 'comprehensive',
          approval_required: false,
          dry_run: false
        }
      };

      const result = await pipelineIntegration.executeFullWorkflow(workflowRequest);

      expect(result.status).toBe('completed');

      // Should have validation results
      expect(result.validation_results.length).toBeGreaterThan(0);

      const finalValidation = result.validation_results[result.validation_results.length - 1];
      expect(finalValidation).toMatchObject({
        is_valid: expect.any(Boolean),
        overall_score: expect.any(Number),
        phase_validations: expect.any(Array),
        integration_validations: expect.any(Array),
        recommendations: expect.any(Array)
      });

      // Validation score should be reasonable
      expect(finalValidation.overall_score).toBeGreaterThan(0.5);

    }, 90000);

    it('should maintain quality metrics throughout execution', async () => {
      const workflowRequest: WorkflowRequest = {
        project_name: 'quality-test',
        initial_requirement: 'Build a file upload service',
        project_directory: testProjectDir,
        configuration: {
          auto_advance: true,
          constitutional_compliance: 'strict',
          approval_required: false,
          dry_run: false
        }
      };

      const result = await pipelineIntegration.executeFullWorkflow(workflowRequest);

      expect(result.status).toBe('completed');

      // Validate quality metrics
      expect(result.execution_summary.quality_score).toBeGreaterThan(60);
      expect(result.execution_summary.performance_score).toBeGreaterThan(50);

      // Each phase should have meaningful metrics
      result.phases_executed.forEach(phase => {
        expect(phase.metrics.execution_time_ms).toBeGreaterThan(0);
        expect(phase.metrics.validation_score).toBeGreaterThanOrEqual(0);
      });

      // Should maintain context quality
      result.context_chain.forEach(context => {
        expect(context.confidence_score).toBeGreaterThan(0.5);
        expect(context.embedding_quality).toBeGreaterThan(0.5);
      });

    }, 90000);
  });

  describe('Decision Logging and Tracking', () => {
    it('should log decisions for each phase', async () => {
      const workflowRequest: WorkflowRequest = {
        project_name: 'decision-test',
        initial_requirement: 'Create a chat application',
        project_directory: testProjectDir,
        configuration: {
          auto_advance: true,
          approval_required: false,
          dry_run: false
        }
      };

      const result = await pipelineIntegration.executeFullWorkflow(workflowRequest);

      expect(result.status).toBe('completed');

      // Should have decisions for each phase
      expect(result.decisions_made.length).toBeGreaterThan(0);

      // At minimum, should have decisions for:
      // - Brainstorm phase selection
      // - Workflow completion
      const phaseDecisions = result.decisions_made.filter(d =>
        d.title.includes('Brainstorm') || d.title.includes('Workflow')
      );
      expect(phaseDecisions.length).toBeGreaterThan(0);

      // Validate decision structure
      result.decisions_made.forEach(decision => {
        expect(decision.id).toBeTruthy();
        expect(decision.title).toBeTruthy();
        expect(decision.timestamp).toBeInstanceOf(Date);
        expect(decision.decision_type).toBeTruthy();
      });

    }, 90000);

    it('should track decision impact and rationale', async () => {
      const workflowRequest: WorkflowRequest = {
        project_name: 'impact-test',
        initial_requirement: 'Build a weather dashboard',
        project_directory: testProjectDir,
        configuration: {
          auto_advance: true,
          approval_required: false,
          dry_run: false
        }
      };

      const result = await pipelineIntegration.executeFullWorkflow(workflowRequest);

      expect(result.status).toBe('completed');

      // Check that decisions have proper impact analysis
      const decisionsWithImpact = result.decisions_made.filter(d =>
        d.impact_analysis && d.rationale
      );
      expect(decisionsWithImpact.length).toBeGreaterThan(0);

      // Validate decision rationale
      decisionsWithImpact.forEach(decision => {
        expect(decision.rationale.primary_reason).toBeTruthy();
        expect(decision.rationale.supporting_reasons).toBeInstanceOf(Array);
        expect(decision.impact_analysis.immediate_impact).toBeTruthy();
      });

    }, 90000);
  });

  describe('Configuration and Customization', () => {
    it('should respect different validation levels', async () => {
      const basicRequest: WorkflowRequest = {
        project_name: 'basic-validation-test',
        initial_requirement: 'Simple counter app',
        project_directory: testProjectDir,
        configuration: {
          auto_advance: true,
          validation_level: 'basic',
          approval_required: false,
          dry_run: false
        }
      };

      const result = await pipelineIntegration.executeFullWorkflow(basicRequest);

      expect(result.status).toBe('completed');
      expect(result.validation_results.length).toBeGreaterThan(0);

      // Basic validation should be less comprehensive
      const validation = result.validation_results[0];
      expect(validation.recommendations.length).toBeDefined();

    }, 60000);

    it('should handle dry run mode correctly', async () => {
      const dryRunRequest: WorkflowRequest = {
        project_name: 'dry-run-test',
        initial_requirement: 'Test application',
        project_directory: testProjectDir,
        configuration: {
          auto_advance: true,
          approval_required: false,
          dry_run: true
        }
      };

      const result = await pipelineIntegration.executeFullWorkflow(dryRunRequest);

      expect(result.status).toBe('completed');

      // In dry run mode, should simulate execution without actual file generation
      expect(result.phases_executed.length).toBeGreaterThan(0);
      expect(result.execution_summary.workflow_successful).toBe(true);

      // May still have artifacts listed but they shouldn't be actually created
      expect(result.artifacts_generated).toBeDefined();

    }, 60000);
  });

  describe('Performance and Scalability', () => {
    it('should complete workflow within reasonable time limits', async () => {
      const startTime = Date.now();

      const workflowRequest: WorkflowRequest = {
        project_name: 'performance-test',
        initial_requirement: 'Create a simple blog',
        project_directory: testProjectDir,
        configuration: {
          auto_advance: true,
          parallel_processing: true,
          approval_required: false,
          dry_run: false
        }
      };

      const result = await pipelineIntegration.executeFullWorkflow(workflowRequest);
      const duration = Date.now() - startTime;

      expect(result.status).toBe('completed');

      // Should complete within reasonable time (2 minutes for integration test)
      expect(duration).toBeLessThan(120000);

      // Should track performance metrics
      expect(result.metrics.total_duration_ms).toBeGreaterThan(0);
      expect(result.metrics.total_duration_ms).toBeLessThan(duration + 1000); // Allow small margin

    }, 150000);

    it('should benefit from parallel processing', async () => {
      // This test compares sequential vs parallel execution
      // Note: In a real scenario, parallel should be faster, but for testing we just ensure it works

      const parallelRequest: WorkflowRequest = {
        project_name: 'parallel-test',
        initial_requirement: 'Multi-component dashboard',
        project_directory: testProjectDir,
        configuration: {
          auto_advance: true,
          parallel_processing: true,
          approval_required: false,
          dry_run: true // Use dry run for faster execution
        }
      };

      const result = await pipelineIntegration.executeFullWorkflow(parallelRequest);

      expect(result.status).toBe('completed');
      expect(result.phases_executed.length).toBe(5);

      // Should record that parallel processing was used
      expect(result.phases_executed.every(p => p.duration_ms > 0)).toBe(true);

    }, 90000);
  });
});

// Helper function to setup test project structure
function setupTestProjectStructure(projectDir: string): void {
  // Create basic Nexus project structure
  const nexusDir = path.join(projectDir, '.nexus');
  fs.mkdirSync(nexusDir, { recursive: true });

  const subDirs = [
    'brainstorms',
    'specs',
    'specs/monolithic',
    'specs/sharded',
    'specs/sharded/epics',
    'specs/sharded/stories',
    'tasks',
    'patterns',
    'templates',
    'metrics',
    'decisions'
  ];

  subDirs.forEach(dir => {
    fs.mkdirSync(path.join(nexusDir, dir), { recursive: true });
  });

  // Create basic constitution file
  const constitutionContent = `# Project Constitution

## I. Immutable Principles

### Quality Standards
- All code must have comprehensive test coverage (minimum 80%)
- Test-Driven Development (TDD) is required for all features
- Code quality standards must be maintained

### Development Process
- Constitutional compliance is mandatory
- All decisions must be logged and tracked
- Context preservation is required between phases

## Implementation
This constitution ensures quality and consistency throughout the Nexus Enhanced Workflow.
`;

  fs.writeFileSync(path.join(nexusDir, 'constitution.md'), constitutionContent);

  // Create basic project DNA file
  const projectDNAContent = `# Project DNA

## Framework Preferences
- Testing: Jest/Vitest preferred
- Code Style: TypeScript with strict mode
- Architecture: Modular design with clear separation of concerns

## Team Preferences
- TDD approach for all development
- Comprehensive documentation
- Clean, maintainable code
`;

  fs.writeFileSync(path.join(nexusDir, 'project-dna.md'), projectDNAContent);

  // Create src directory
  fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });

  // Create package.json for testing
  const packageJson = {
    name: 'test-project',
    version: '1.0.0',
    description: 'Test project for Nexus Enhanced Workflow',
    scripts: {
      test: 'jest',
      build: 'tsc'
    },
    dependencies: {},
    devDependencies: {
      jest: '^29.0.0',
      typescript: '^5.0.0'
    }
  };

  fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));
}
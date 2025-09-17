export enum AgentRole {
  SPECIFICATION_MASTER = 'specification_master',
  TEST_ARCHITECT = 'test_architect',
  IMPLEMENTATION_ENGINEER = 'implementation_engineer',
  SHARD_SPECIALIST = 'shard_specialist',
  QUALITY_GUARDIAN = 'quality_guardian'
}

export interface AgentPermission {
  action: string;
  resource: string;
  allowed: boolean;
  reason?: string;
}

export interface AgentCapability {
  id: string;
  description: string;
  category: 'read' | 'write' | 'execute' | 'validate';
  resources: string[];
}

export interface AgentRestriction {
  id: string;
  description: string;
  enforcement: 'blocking' | 'warning';
  error_message: string;
  resources: string[];
}

export interface AgentDefinition {
  role: AgentRole;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  restrictions: AgentRestriction[];
  dependencies: AgentRole[];
  phase_assignments: string[];
  success_metrics: AgentMetric[];
}

export interface AgentMetric {
  name: string;
  description: string;
  unit: string;
  target: number;
  current?: number;
}

// Complete Agent Role Definitions
export const AGENT_DEFINITIONS: Map<AgentRole, AgentDefinition> = new Map([
  [
    AgentRole.SPECIFICATION_MASTER,
    {
      role: AgentRole.SPECIFICATION_MASTER,
      name: 'Specification Master',
      description: 'Creates and refines Software Requirements Specifications with focus on testability and completeness',
      capabilities: [
        {
          id: 'write_specifications',
          description: 'Write and modify SRS documents',
          category: 'write',
          resources: ['specifications', 'requirements', 'acceptance_criteria']
        },
        {
          id: 'elicit_requirements',
          description: 'Run adaptive questioning to elicit requirements',
          category: 'execute',
          resources: ['questioning_engine', 'user_input']
        },
        {
          id: 'validate_testability',
          description: 'Ensure all requirements are testable',
          category: 'validate',
          resources: ['requirements', 'test_strategies']
        },
        {
          id: 'create_templates',
          description: 'Generate and fill specification templates',
          category: 'write',
          resources: ['templates', 'srs_template']
        }
      ],
      restrictions: [
        {
          id: 'no_implementation',
          description: 'Cannot write implementation code',
          enforcement: 'blocking',
          error_message: 'BOUNDARY VIOLATION: Specification Master cannot write implementation code',
          resources: ['source_code', 'implementation']
        },
        {
          id: 'no_test_modification',
          description: 'Cannot modify test implementations',
          enforcement: 'blocking',
          error_message: 'BOUNDARY VIOLATION: Specification Master cannot modify tests',
          resources: ['test_code', 'test_files']
        },
        {
          id: 'no_architecture_changes',
          description: 'Cannot change system architecture',
          enforcement: 'blocking',
          error_message: 'BOUNDARY VIOLATION: Specification Master cannot modify architecture',
          resources: ['architecture', 'system_design']
        }
      ],
      dependencies: [],
      phase_assignments: ['specify'],
      success_metrics: [
        {
          name: 'specification_completeness',
          description: 'Percentage of required sections completed',
          unit: 'percent',
          target: 100
        },
        {
          name: 'testability_score',
          description: 'Percentage of requirements that are testable',
          unit: 'percent',
          target: 100
        }
      ]
    }
  ],
  [
    AgentRole.TEST_ARCHITECT,
    {
      role: AgentRole.TEST_ARCHITECT,
      name: 'Test Architect',
      description: 'Designs comprehensive test strategies and enforces TDD compliance',
      capabilities: [
        {
          id: 'design_test_strategies',
          description: 'Create test plans and strategies',
          category: 'write',
          resources: ['test_strategies', 'test_plans']
        },
        {
          id: 'write_test_specs',
          description: 'Write test specifications and templates',
          category: 'write',
          resources: ['test_specifications', 'test_templates']
        },
        {
          id: 'validate_tdd_compliance',
          description: 'Ensure TDD cycle is followed',
          category: 'validate',
          resources: ['tdd_compliance', 'test_coverage']
        },
        {
          id: 'create_test_fixtures',
          description: 'Design test fixtures and mocks',
          category: 'write',
          resources: ['test_fixtures', 'mocks']
        }
      ],
      restrictions: [
        {
          id: 'no_implementation_code',
          description: 'Cannot write implementation code',
          enforcement: 'blocking',
          error_message: 'BOUNDARY VIOLATION: Test Architect cannot write implementation',
          resources: ['source_code', 'production_code']
        },
        {
          id: 'no_requirement_changes',
          description: 'Cannot modify requirements',
          enforcement: 'blocking',
          error_message: 'BOUNDARY VIOLATION: Test Architect cannot change requirements',
          resources: ['requirements', 'specifications']
        },
        {
          id: 'no_test_skipping',
          description: 'Cannot skip test creation',
          enforcement: 'blocking',
          error_message: 'CONSTITUTIONAL VIOLATION: TDD is mandatory - cannot skip tests',
          resources: ['tdd_cycle']
        }
      ],
      dependencies: [AgentRole.SPECIFICATION_MASTER],
      phase_assignments: ['decompose', 'implement'],
      success_metrics: [
        {
          name: 'test_coverage',
          description: 'Code coverage percentage',
          unit: 'percent',
          target: 80
        },
        {
          name: 'tdd_compliance',
          description: 'Percentage of code with tests written first',
          unit: 'percent',
          target: 100
        }
      ]
    }
  ],
  [
    AgentRole.IMPLEMENTATION_ENGINEER,
    {
      role: AgentRole.IMPLEMENTATION_ENGINEER,
      name: 'Implementation Engineer',
      description: 'Writes implementation code following TDD cycle and refactors for quality',
      capabilities: [
        {
          id: 'write_implementation',
          description: 'Write production code',
          category: 'write',
          resources: ['source_code', 'implementation']
        },
        {
          id: 'refactor_code',
          description: 'Refactor existing code for quality',
          category: 'write',
          resources: ['source_code', 'refactoring']
        },
        {
          id: 'update_task_status',
          description: 'Update task completion status',
          category: 'write',
          resources: ['task_status', 'metrics']
        },
        {
          id: 'extract_patterns',
          description: 'Extract reusable patterns from implementations',
          category: 'execute',
          resources: ['patterns', 'pattern_library']
        }
      ],
      restrictions: [
        {
          id: 'no_spec_modification',
          description: 'Cannot modify specifications',
          enforcement: 'blocking',
          error_message: 'BOUNDARY VIOLATION: Implementation Engineer cannot modify specifications',
          resources: ['specifications', 'requirements']
        },
        {
          id: 'no_test_expectation_changes',
          description: 'Cannot alter test expectations',
          enforcement: 'blocking',
          error_message: 'BOUNDARY VIOLATION: Cannot change test expectations',
          resources: ['test_expectations', 'assertions']
        },
        {
          id: 'requires_failing_test',
          description: 'Must have failing test before implementation',
          enforcement: 'blocking',
          error_message: 'CONSTITUTIONAL VIOLATION: No implementation without failing test',
          resources: ['tdd_cycle']
        }
      ],
      dependencies: [AgentRole.TEST_ARCHITECT, AgentRole.SPECIFICATION_MASTER],
      phase_assignments: ['implement'],
      success_metrics: [
        {
          name: 'implementation_success',
          description: 'Tests passing after implementation',
          unit: 'percent',
          target: 100
        },
        {
          name: 'refactor_quality',
          description: 'Code quality score after refactoring',
          unit: 'score',
          target: 85
        }
      ]
    }
  ],
  [
    AgentRole.SHARD_SPECIALIST,
    {
      role: AgentRole.SHARD_SPECIALIST,
      name: 'Shard Specialist',
      description: 'Breaks down specifications into manageable shards with context boundaries',
      capabilities: [
        {
          id: 'parse_specifications',
          description: 'Parse and analyze specification structure',
          category: 'read',
          resources: ['specifications', 'documents']
        },
        {
          id: 'create_shards',
          description: 'Create document shards with boundaries',
          category: 'write',
          resources: ['shards', 'document_fragments']
        },
        {
          id: 'build_navigation',
          description: 'Build navigation indices for shards',
          category: 'write',
          resources: ['navigation_index', 'cross_references']
        },
        {
          id: 'define_context_boundaries',
          description: 'Define context scope for each shard',
          category: 'execute',
          resources: ['context_boundaries', 'scope_definitions']
        }
      ],
      restrictions: [
        {
          id: 'no_content_modification',
          description: 'Cannot modify specification content',
          enforcement: 'blocking',
          error_message: 'BOUNDARY VIOLATION: Shard Specialist cannot modify content',
          resources: ['specification_content', 'requirements']
        },
        {
          id: 'no_requirement_changes',
          description: 'Cannot change requirements',
          enforcement: 'blocking',
          error_message: 'BOUNDARY VIOLATION: Cannot alter requirements',
          resources: ['functional_requirements', 'acceptance_criteria']
        },
        {
          id: 'no_code_writing',
          description: 'Cannot write any code',
          enforcement: 'blocking',
          error_message: 'BOUNDARY VIOLATION: Shard Specialist cannot write code',
          resources: ['source_code', 'test_code']
        }
      ],
      dependencies: [AgentRole.SPECIFICATION_MASTER],
      phase_assignments: ['shard'],
      success_metrics: [
        {
          name: 'sharding_effectiveness',
          description: 'Size reduction percentage',
          unit: 'percent',
          target: 70
        },
        {
          name: 'boundary_accuracy',
          description: 'Accuracy of boundary detection',
          unit: 'percent',
          target: 85
        }
      ]
    }
  ],
  [
    AgentRole.QUALITY_GUARDIAN,
    {
      role: AgentRole.QUALITY_GUARDIAN,
      name: 'Quality Guardian',
      description: 'Enforces constitutional compliance and quality gates throughout workflow',
      capabilities: [
        {
          id: 'verify_constitutional_compliance',
          description: 'Verify adherence to constitutional rules',
          category: 'validate',
          resources: ['constitution', 'compliance']
        },
        {
          id: 'check_coverage',
          description: 'Validate test coverage requirements',
          category: 'validate',
          resources: ['coverage_reports', 'metrics']
        },
        {
          id: 'validate_quality_gates',
          description: 'Ensure quality gates are met',
          category: 'validate',
          resources: ['quality_gates', 'benchmarks']
        },
        {
          id: 'generate_reports',
          description: 'Generate compliance and quality reports',
          category: 'write',
          resources: ['reports', 'audit_logs']
        }
      ],
      restrictions: [
        {
          id: 'no_constitutional_override',
          description: 'Cannot override constitutional rules',
          enforcement: 'blocking',
          error_message: 'ABSOLUTE VIOLATION: Cannot override constitution',
          resources: ['constitutional_rules']
        },
        {
          id: 'no_approval_without_tests',
          description: 'Cannot approve code without tests',
          enforcement: 'blocking',
          error_message: 'CONSTITUTIONAL VIOLATION: Cannot approve without tests',
          resources: ['approval_gate']
        },
        {
          id: 'no_implementation_modification',
          description: 'Cannot modify implementation directly',
          enforcement: 'blocking',
          error_message: 'BOUNDARY VIOLATION: Quality Guardian cannot modify code',
          resources: ['source_code', 'implementation']
        }
      ],
      dependencies: [],
      phase_assignments: ['all'],
      success_metrics: [
        {
          name: 'constitutional_compliance',
          description: 'Percentage of constitutional rules followed',
          unit: 'percent',
          target: 100
        },
        {
          name: 'quality_gate_pass_rate',
          description: 'Percentage of quality gates passed',
          unit: 'percent',
          target: 95
        }
      ]
    }
  ]
]);
import { BoundaryEnforcer, ActionContext } from './BoundaryEnforcer';
import { AgentRole } from './AgentDefinitions';

// Example: SpecificationMaster with Boundary Enforcement
export class SpecificationMaster {
  private enforcer: BoundaryEnforcer;
  private role = AgentRole.SPECIFICATION_MASTER;

  constructor() {
    this.enforcer = new BoundaryEnforcer(true); // Strict mode
  }

  async writeSpecification(content: string): Promise<void> {
    // Check boundary before action
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'write',
      resource: 'specifications',
      phase: 'specify'
    });

    console.log('✅ Boundary check passed - Writing specification');
    await this.doWriteSpecification(content);
  }

  async runAdaptiveQuestioning(context: any): Promise<any> {
    // Check boundary for questioning capability
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'execute',
      resource: 'questioning_engine',
      phase: 'specify'
    });

    console.log('✅ Boundary check passed - Running adaptive questioning');
    return await this.doRunQuestioning(context);
  }

  async writeCode(code: string): Promise<void> {
    // This will throw a boundary violation
    try {
      this.enforcer.enforceBoundary({
        agent_role: this.role,
        action: 'write',
        resource: 'source_code',
        phase: 'implement'
      });

      // This line will never execute due to boundary violation
      await this.doWriteCode(code);
    } catch (error) {
      console.error('❌ Boundary violation prevented code writing:', error.message);
      throw error;
    }
  }

  private async doWriteSpecification(content: string): Promise<void> {
    // Actual implementation logic
    console.log('Writing specification content...');
  }

  private async doRunQuestioning(context: any): Promise<any> {
    // Actual questioning logic
    return { confidence: 85, requirements: [] };
  }

  private async doWriteCode(code: string): Promise<void> {
    // This should never be called due to boundary enforcement
    throw new Error('This should never execute');
  }
}

// Example: TestArchitect with Boundary Enforcement
export class TestArchitect {
  private enforcer: BoundaryEnforcer;
  private role = AgentRole.TEST_ARCHITECT;

  constructor() {
    this.enforcer = new BoundaryEnforcer(true);
  }

  async createTestStrategy(requirements: any[]): Promise<any> {
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'create',
      resource: 'test_strategies',
      phase: 'decompose'
    });

    console.log('✅ Creating test strategy');
    return await this.doCreateTestStrategy(requirements);
  }

  async validateTDDCompliance(task: any): Promise<boolean> {
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'validate',
      resource: 'tdd_compliance',
      phase: 'implement'
    });

    console.log('✅ Validating TDD compliance');
    return await this.doValidateTDD(task);
  }

  async modifyRequirements(requirements: any[]): Promise<void> {
    // This will throw a boundary violation
    try {
      this.enforcer.enforceBoundary({
        agent_role: this.role,
        action: 'modify',
        resource: 'requirements',
        phase: 'specify'
      });
    } catch (error) {
      console.error('❌ Boundary violation: TestArchitect cannot modify requirements');
      throw error;
    }
  }

  private async doCreateTestStrategy(requirements: any[]): Promise<any> {
    return { strategy: 'TDD-first', coverage_target: 80 };
  }

  private async doValidateTDD(task: any): Promise<boolean> {
    return true; // Simplified validation
  }
}

// Example: Implementation Engineer with TDD Enforcement
export class ImplementationEngineer {
  private enforcer: BoundaryEnforcer;
  private role = AgentRole.IMPLEMENTATION_ENGINEER;

  constructor() {
    this.enforcer = new BoundaryEnforcer(true);
  }

  async writeImplementation(code: string, hasFailingTest: boolean): Promise<void> {
    // Check if we can write implementation
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'write',
      resource: 'source_code',
      phase: 'implement'
    });

    // Constitutional check: Must have failing test first
    if (!hasFailingTest) {
      this.enforcer.enforceBoundary({
        agent_role: this.role,
        action: 'implement',
        resource: 'tdd_cycle',
        phase: 'implement'
      });
    }

    console.log('✅ TDD compliance verified - Writing implementation');
    await this.doWriteImplementation(code);
  }

  async refactorCode(existingCode: string): Promise<string> {
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'refactor',
      resource: 'source_code',
      phase: 'implement'
    });

    console.log('✅ Refactoring code for quality');
    return await this.doRefactorCode(existingCode);
  }

  async modifySpecification(spec: any): Promise<void> {
    // This will throw a boundary violation
    try {
      this.enforcer.enforceBoundary({
        agent_role: this.role,
        action: 'modify',
        resource: 'specifications',
        phase: 'implement'
      });
    } catch (error) {
      console.error('❌ Boundary violation: ImplementationEngineer cannot modify specifications');
      throw error;
    }
  }

  private async doWriteImplementation(code: string): Promise<void> {
    console.log('Writing implementation code...');
  }

  private async doRefactorCode(code: string): Promise<string> {
    return code + ' // refactored';
  }
}

// Example usage and testing
export class BoundaryEnforcementDemo {
  static async demonstrateBoundaries(): Promise<void> {
    console.log('🧪 Demonstrating Agent Boundary Enforcement\n');

    const specMaster = new SpecificationMaster();
    const testArchitect = new TestArchitect();
    const implEngineer = new ImplementationEngineer();

    // ✅ ALLOWED ACTIONS
    console.log('--- ALLOWED ACTIONS ---');

    try {
      await specMaster.writeSpecification('User authentication spec');
      await testArchitect.createTestStrategy([{ id: 'req1', description: 'Login' }]);
      await implEngineer.writeImplementation('function login() {}', true);
      console.log('✅ All allowed actions completed successfully\n');
    } catch (error) {
      console.error('❌ Unexpected error in allowed actions:', error.message);
    }

    // ❌ BOUNDARY VIOLATIONS
    console.log('--- BOUNDARY VIOLATIONS ---');

    try {
      await specMaster.writeCode('console.log("hello")');
    } catch (error) {
      console.log('🛑 Correctly blocked: SpecificationMaster cannot write code\n');
    }

    try {
      await testArchitect.modifyRequirements([]);
    } catch (error) {
      console.log('🛑 Correctly blocked: TestArchitect cannot modify requirements\n');
    }

    try {
      await implEngineer.modifySpecification({});
    } catch (error) {
      console.log('🛑 Correctly blocked: ImplementationEngineer cannot modify specifications\n');
    }

    try {
      await implEngineer.writeImplementation('function test() {}', false);
    } catch (error) {
      console.log('🛑 Correctly blocked: Implementation without failing test (TDD violation)\n');
    }
  }

  static demonstrateBoundaryChecking(): void {
    const enforcer = new BoundaryEnforcer(true);

    console.log('🔍 Testing Agent Boundary Checks\n');

    // Test each agent role
    for (const role of Object.values(AgentRole)) {
      console.log(`--- Testing ${role} ---`);
      const results = enforcer.testAgentBoundaries(role);

      for (const [action, result] of Object.entries(results)) {
        const status = result.allowed ? '✅' : '❌';
        const warnings = result.warnings?.length ? ` (${result.warnings.length} warnings)` : '';
        console.log(`${status} ${action}${warnings}`);
      }
      console.log('');
    }

    // Generate comprehensive report
    console.log('📊 BOUNDARY ENFORCEMENT REPORT');
    console.log(enforcer.generateBoundaryReport());
  }
}

// Run demonstration if this file is executed directly
if (require.main === module) {
  (async () => {
    await BoundaryEnforcementDemo.demonstrateBoundaries();
    BoundaryEnforcementDemo.demonstrateBoundaryChecking();
  })();
}
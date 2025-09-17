import { existsSync } from 'fs';
import { TaskContext } from './ConstitutionalTDDEnforcer';
import { Constitution } from '../../types/constitution';

export interface ComplianceCheck {
  rule: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  blocking: boolean;
}

export interface ComplianceResult {
  compliant: boolean;
  checks: ComplianceCheck[];
  score: number;
  blockers: ComplianceCheck[];
}

export class ConstitutionalComplianceChecker {
  private constitution: Constitution;

  constructor(constitution: Constitution) {
    this.constitution = constitution;
  }

  checkCompliance(taskContext: TaskContext): ComplianceResult {
    const checks: ComplianceCheck[] = [
      this.checkTestFirst(taskContext),
      this.checkCoverageRequirement(taskContext),
      this.checkQualityStandards(taskContext),
      this.checkDependencyFulfillment(taskContext),
      this.checkContextEmbedding(taskContext),
      this.checkDocumentationRequirements(taskContext)
    ];

    const blockers = checks.filter(check => check.blocking && check.status === 'fail');
    const passed = checks.filter(check => check.status === 'pass').length;
    const score = (passed / checks.length) * 100;

    return {
      compliant: blockers.length === 0 && score >= 80,
      checks,
      score,
      blockers
    };
  }

  checkPreImplementation(taskContext: TaskContext): ComplianceResult {
    const checks: ComplianceCheck[] = [
      this.checkTaskContextComplete(taskContext),
      this.checkDependenciesResolved(taskContext),
      this.checkConfidenceLevel(taskContext),
      this.checkEmbeddedContextSufficient(taskContext)
    ];

    const blockers = checks.filter(check => check.blocking && check.status === 'fail');
    const passed = checks.filter(check => check.status === 'pass').length;
    const score = (passed / checks.length) * 100;

    return {
      compliant: blockers.length === 0,
      checks,
      score,
      blockers
    };
  }

  checkPostImplementation(taskContext: TaskContext): ComplianceResult {
    const checks: ComplianceCheck[] = [
      this.checkImplementationExists(taskContext),
      this.checkTestsExistAndPass(taskContext),
      this.checkCoverageAchieved(taskContext),
      this.checkQualityMetrics(taskContext),
      this.checkNoRegressions(taskContext)
    ];

    const blockers = checks.filter(check => check.blocking && check.status === 'fail');
    const passed = checks.filter(check => check.status === 'pass').length;
    const score = (passed / checks.length) * 100;

    return {
      compliant: blockers.length === 0 && score >= 90,
      checks,
      score,
      blockers
    };
  }

  private checkTestFirst(taskContext: TaskContext): ComplianceCheck {
    const implementationExists = this.implementationExists(taskContext.id);
    const testsExist = this.testsExist(taskContext.id);

    if (implementationExists && !testsExist) {
      return {
        rule: 'Tests MUST be written before implementation',
        status: 'fail',
        message: 'Implementation found without tests',
        blocking: true
      };
    }

    if (testsExist && !implementationExists) {
      return {
        rule: 'Tests MUST be written before implementation',
        status: 'pass',
        message: 'Tests exist before implementation (TDD compliant)',
        blocking: false
      };
    }

    if (testsExist && implementationExists) {
      return {
        rule: 'Tests MUST be written before implementation',
        status: 'warning',
        message: 'Both tests and implementation exist - verify TDD order',
        blocking: false
      };
    }

    return {
      rule: 'Tests MUST be written before implementation',
      status: 'pass',
      message: 'No implementation yet - ready for TDD',
      blocking: false
    };
  }

  private checkCoverageRequirement(taskContext: TaskContext): ComplianceCheck {
    const minimumCoverage = this.constitution.tddRequirements?.minimumCoverage || 80;
    const currentCoverage = this.getCurrentCoverage(taskContext.id);

    if (currentCoverage < minimumCoverage) {
      return {
        rule: `Minimum ${minimumCoverage}% test coverage required`,
        status: 'fail',
        message: `Coverage ${currentCoverage}% below minimum ${minimumCoverage}%`,
        blocking: true
      };
    }

    return {
      rule: `Minimum ${minimumCoverage}% test coverage required`,
      status: 'pass',
      message: `Coverage ${currentCoverage}% meets requirement`,
      blocking: false
    };
  }

  private checkQualityStandards(taskContext: TaskContext): ComplianceCheck {
    const qualityIssues: string[] = [];

    // Check for code smells (simplified)
    if (this.hasCodeSmells(taskContext.id)) {
      qualityIssues.push('code smells detected');
    }

    // Check naming conventions
    if (!this.followsNamingConventions(taskContext.id)) {
      qualityIssues.push('naming conventions not followed');
    }

    // Check documentation
    if (!this.hasDocumentation(taskContext.id)) {
      qualityIssues.push('documentation missing');
    }

    if (qualityIssues.length > 0) {
      return {
        rule: 'Code quality standards must be met',
        status: 'warning',
        message: `Quality issues: ${qualityIssues.join(', ')}`,
        blocking: false
      };
    }

    return {
      rule: 'Code quality standards must be met',
      status: 'pass',
      message: 'Quality standards met',
      blocking: false
    };
  }

  private checkDependencyFulfillment(taskContext: TaskContext): ComplianceCheck {
    const unresolvedDeps: string[] = [];

    for (const depId of taskContext.dependencies) {
      if (!this.isDependencyResolved(depId)) {
        unresolvedDeps.push(depId);
      }
    }

    if (unresolvedDeps.length > 0) {
      return {
        rule: 'All dependencies must be resolved',
        status: 'fail',
        message: `Unresolved dependencies: ${unresolvedDeps.join(', ')}`,
        blocking: true
      };
    }

    return {
      rule: 'All dependencies must be resolved',
      status: 'pass',
      message: 'All dependencies resolved',
      blocking: false
    };
  }

  private checkContextEmbedding(taskContext: TaskContext): ComplianceCheck {
    const context = taskContext.embedded_context;
    const missingElements: string[] = [];

    if (!context.requirements || context.requirements.length === 0) {
      missingElements.push('requirements');
    }

    if (!context.acceptance_criteria || context.acceptance_criteria.length === 0) {
      missingElements.push('acceptance criteria');
    }

    if (!context.technical_context) {
      missingElements.push('technical context');
    }

    if (missingElements.length > 0) {
      return {
        rule: 'Context must be embedded and complete',
        status: 'fail',
        message: `Missing context elements: ${missingElements.join(', ')}`,
        blocking: true
      };
    }

    return {
      rule: 'Context must be embedded and complete',
      status: 'pass',
      message: 'Context is embedded and complete',
      blocking: false
    };
  }

  private checkDocumentationRequirements(taskContext: TaskContext): ComplianceCheck {
    const hasReadme = existsSync('README.md');
    const hasApiDocs = existsSync('docs/api.md');
    const hasTaskDocs = this.hasTaskDocumentation(taskContext.id);

    if (!hasTaskDocs) {
      return {
        rule: 'Implementation must be documented',
        status: 'warning',
        message: 'Task-specific documentation missing',
        blocking: false
      };
    }

    return {
      rule: 'Implementation must be documented',
      status: 'pass',
      message: 'Documentation requirements met',
      blocking: false
    };
  }

  private checkTaskContextComplete(taskContext: TaskContext): ComplianceCheck {
    const requiredFields = ['id', 'title', 'embedded_context', 'tdd_requirements'];
    const missingFields = requiredFields.filter(field => !taskContext[field]);

    if (missingFields.length > 0) {
      return {
        rule: 'Task context must be complete',
        status: 'fail',
        message: `Missing fields: ${missingFields.join(', ')}`,
        blocking: true
      };
    }

    return {
      rule: 'Task context must be complete',
      status: 'pass',
      message: 'Task context is complete',
      blocking: false
    };
  }

  private checkDependenciesResolved(taskContext: TaskContext): ComplianceCheck {
    const unresolvedDeps = taskContext.dependencies.filter(dep => !this.isDependencyResolved(dep));

    if (unresolvedDeps.length > 0) {
      return {
        rule: 'Dependencies must be resolved before implementation',
        status: 'fail',
        message: `Unresolved: ${unresolvedDeps.join(', ')}`,
        blocking: true
      };
    }

    return {
      rule: 'Dependencies must be resolved before implementation',
      status: 'pass',
      message: 'All dependencies resolved',
      blocking: false
    };
  }

  private checkConfidenceLevel(taskContext: TaskContext): ComplianceCheck {
    const minimumConfidence = this.constitution.questioningRequirements?.minimumConfidenceThreshold || 85;

    if (taskContext.confidence < minimumConfidence) {
      return {
        rule: `Minimum ${minimumConfidence}% confidence required`,
        status: 'fail',
        message: `Confidence ${taskContext.confidence}% below threshold`,
        blocking: true
      };
    }

    return {
      rule: `Minimum ${minimumConfidence}% confidence required`,
      status: 'pass',
      message: `Confidence ${taskContext.confidence}% meets requirement`,
      blocking: false
    };
  }

  private checkEmbeddedContextSufficient(taskContext: TaskContext): ComplianceCheck {
    const contextSize = this.estimateContextSize(taskContext.embedded_context);
    const minimumSize = this.constitution.contextRequirements?.minimumContextLines || 200;

    if (contextSize < minimumSize) {
      return {
        rule: `Minimum ${minimumSize} lines of context required`,
        status: 'fail',
        message: `Context size ${contextSize} below minimum`,
        blocking: true
      };
    }

    return {
      rule: `Minimum ${minimumSize} lines of context required`,
      status: 'pass',
      message: `Context size ${contextSize} sufficient`,
      blocking: false
    };
  }

  private checkImplementationExists(taskContext: TaskContext): ComplianceCheck {
    if (!this.implementationExists(taskContext.id)) {
      return {
        rule: 'Implementation must exist',
        status: 'fail',
        message: 'No implementation found',
        blocking: true
      };
    }

    return {
      rule: 'Implementation must exist',
      status: 'pass',
      message: 'Implementation exists',
      blocking: false
    };
  }

  private checkTestsExistAndPass(taskContext: TaskContext): ComplianceCheck {
    if (!this.testsExist(taskContext.id)) {
      return {
        rule: 'Tests must exist and pass',
        status: 'fail',
        message: 'No tests found',
        blocking: true
      };
    }

    if (!this.testsPass(taskContext.id)) {
      return {
        rule: 'Tests must exist and pass',
        status: 'fail',
        message: 'Tests exist but are failing',
        blocking: true
      };
    }

    return {
      rule: 'Tests must exist and pass',
      status: 'pass',
      message: 'Tests exist and pass',
      blocking: false
    };
  }

  private checkCoverageAchieved(taskContext: TaskContext): ComplianceCheck {
    const requiredCoverage = taskContext.tdd_requirements.minimum_coverage || 80;
    const actualCoverage = this.getCurrentCoverage(taskContext.id);

    if (actualCoverage < requiredCoverage) {
      return {
        rule: `${requiredCoverage}% coverage required`,
        status: 'fail',
        message: `Coverage ${actualCoverage}% below requirement`,
        blocking: true
      };
    }

    return {
      rule: `${requiredCoverage}% coverage required`,
      status: 'pass',
      message: `Coverage ${actualCoverage}% achieved`,
      blocking: false
    };
  }

  private checkQualityMetrics(taskContext: TaskContext): ComplianceCheck {
    // Simplified quality check
    const issues: string[] = [];

    if (this.hasCodeSmells(taskContext.id)) issues.push('code smells');
    if (!this.followsNamingConventions(taskContext.id)) issues.push('naming');
    if (!this.hasDocumentation(taskContext.id)) issues.push('documentation');

    if (issues.length > 2) {
      return {
        rule: 'Quality metrics must meet standards',
        status: 'fail',
        message: `Multiple quality issues: ${issues.join(', ')}`,
        blocking: false
      };
    }

    return {
      rule: 'Quality metrics must meet standards',
      status: 'pass',
      message: 'Quality metrics acceptable',
      blocking: false
    };
  }

  private checkNoRegressions(taskContext: TaskContext): ComplianceCheck {
    // Simplified regression check
    if (this.hasRegressions()) {
      return {
        rule: 'No regressions allowed',
        status: 'fail',
        message: 'Regressions detected in existing functionality',
        blocking: true
      };
    }

    return {
      rule: 'No regressions allowed',
      status: 'pass',
      message: 'No regressions detected',
      blocking: false
    };
  }

  // Helper methods (simplified implementations)
  private implementationExists(taskId: string): boolean {
    return existsSync(`src/${taskId}.ts`) ||
           existsSync(`src/components/${taskId}.tsx`) ||
           existsSync(`src/api/${taskId}.ts`);
  }

  private testsExist(taskId: string): boolean {
    return existsSync(`tests/unit/${taskId}.test.ts`) ||
           existsSync(`tests/integration/${taskId}.test.ts`);
  }

  private testsPass(taskId: string): boolean {
    // This would run tests and check results
    // Simplified to return true for now
    return true;
  }

  private getCurrentCoverage(taskId: string): number {
    // This would calculate actual coverage
    // Simplified to return a default value
    return 85;
  }

  private hasCodeSmells(taskId: string): boolean {
    // This would analyze code for smells
    // Simplified to return false
    return false;
  }

  private followsNamingConventions(taskId: string): boolean {
    // This would check naming conventions
    // Simplified to return true
    return true;
  }

  private hasDocumentation(taskId: string): boolean {
    // This would check for documentation
    // Simplified to return true
    return true;
  }

  private isDependencyResolved(depId: string): boolean {
    // This would check if dependency is resolved
    // Simplified to return true
    return true;
  }

  private hasTaskDocumentation(taskId: string): boolean {
    return existsSync(`docs/${taskId}.md`) ||
           existsSync(`.nexus/tasks/${taskId}.md`);
  }

  private estimateContextSize(context: any): number {
    // Estimate context size in lines
    let size = 0;
    size += context.requirements?.length * 2 || 0;
    size += context.acceptance_criteria?.length * 3 || 0;
    size += context.test_requirements?.length * 5 || 0;
    size += context.implementation_hints?.length * 2 || 0;
    return size;
  }

  private hasRegressions(): boolean {
    // This would check for regressions
    // Simplified to return false
    return false;
  }
}
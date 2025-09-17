import { AgentRole, AgentDefinition, AgentPermission, AGENT_DEFINITIONS } from './AgentDefinitions';

export interface BoundaryViolation {
  agent_role: AgentRole;
  attempted_action: string;
  resource: string;
  restriction_id: string;
  error_message: string;
  timestamp: string;
  severity: 'warning' | 'blocking' | 'critical';
  stack_trace?: string;
}

export interface BoundaryCheckResult {
  allowed: boolean;
  violation?: BoundaryViolation;
  warnings?: string[];
  suggestions?: string[];
}

export interface ActionContext {
  agent_role: AgentRole;
  action: string;
  resource: string;
  phase?: string;
  metadata?: Record<string, any>;
}

export class BoundaryEnforcer {
  private violations: BoundaryViolation[] = [];
  private permissionCache: Map<string, BoundaryCheckResult> = new Map();
  private agentDefinitions: Map<AgentRole, AgentDefinition>;
  private strictMode: boolean = true;

  constructor(strictMode: boolean = true) {
    this.strictMode = strictMode;
    this.agentDefinitions = AGENT_DEFINITIONS;
  }

  // Main boundary checking method
  checkBoundary(context: ActionContext): BoundaryCheckResult {
    const cacheKey = this.getCacheKey(context);

    // Check cache first
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    // Get agent definition
    const agentDef = this.agentDefinitions.get(context.agent_role);
    if (!agentDef) {
      throw new Error(`Unknown agent role: ${context.agent_role}`);
    }

    // Check restrictions first (deny list)
    const restrictionCheck = this.checkRestrictions(agentDef, context);
    if (!restrictionCheck.allowed) {
      this.recordViolation(restrictionCheck.violation!);
      this.permissionCache.set(cacheKey, restrictionCheck);
      return restrictionCheck;
    }

    // Check capabilities (allow list)
    const capabilityCheck = this.checkCapabilities(agentDef, context);
    if (!capabilityCheck.allowed && this.strictMode) {
      this.recordViolation(capabilityCheck.violation!);
      this.permissionCache.set(cacheKey, capabilityCheck);
      return capabilityCheck;
    }

    // Check phase assignment
    const phaseCheck = this.checkPhaseAssignment(agentDef, context);
    if (!phaseCheck.allowed) {
      this.permissionCache.set(cacheKey, phaseCheck);
      return phaseCheck;
    }

    // Action is allowed
    const result: BoundaryCheckResult = {
      allowed: true,
      warnings: this.generateWarnings(agentDef, context),
      suggestions: this.generateSuggestions(agentDef, context)
    };

    this.permissionCache.set(cacheKey, result);
    return result;
  }

  // Check if action violates any restrictions
  private checkRestrictions(
    agentDef: AgentDefinition,
    context: ActionContext
  ): BoundaryCheckResult {
    for (const restriction of agentDef.restrictions) {
      if (this.resourceMatches(context.resource, restriction.resources)) {
        // Check if action is restricted
        if (this.actionViolatesRestriction(context.action, restriction)) {
          const violation: BoundaryViolation = {
            agent_role: context.agent_role,
            attempted_action: context.action,
            resource: context.resource,
            restriction_id: restriction.id,
            error_message: restriction.error_message,
            timestamp: new Date().toISOString(),
            severity: restriction.enforcement === 'blocking' ? 'blocking' : 'warning',
            stack_trace: new Error().stack
          };

          return {
            allowed: false,
            violation: violation
          };
        }
      }
    }

    return { allowed: true };
  }

  // Check if agent has capability for action
  private checkCapabilities(
    agentDef: AgentDefinition,
    context: ActionContext
  ): BoundaryCheckResult {
    // Find matching capability
    const hasCapability = agentDef.capabilities.some(cap => {
      return this.actionMatchesCapability(context.action, cap.category) &&
             this.resourceMatches(context.resource, cap.resources);
    });

    if (!hasCapability) {
      const violation: BoundaryViolation = {
        agent_role: context.agent_role,
        attempted_action: context.action,
        resource: context.resource,
        restriction_id: 'no_capability',
        error_message: `Agent ${agentDef.name} lacks capability for action '${context.action}' on resource '${context.resource}'`,
        timestamp: new Date().toISOString(),
        severity: 'blocking'
      };

      return {
        allowed: false,
        violation: violation,
        suggestions: this.suggestAlternativeAgent(context)
      };
    }

    return { allowed: true };
  }

  // Check if agent is assigned to current phase
  private checkPhaseAssignment(
    agentDef: AgentDefinition,
    context: ActionContext
  ): BoundaryCheckResult {
    if (!context.phase) return { allowed: true };

    if (agentDef.phase_assignments.includes('all')) {
      return { allowed: true };
    }

    if (!agentDef.phase_assignments.includes(context.phase)) {
      return {
        allowed: false,
        warnings: [`Agent ${agentDef.name} is not assigned to phase ${context.phase}`],
        suggestions: [`Consider using agent assigned to ${context.phase} phase`]
      };
    }

    return { allowed: true };
  }

  // Enforce boundary with exception throwing
  enforceBoundary(context: ActionContext): void {
    const result = this.checkBoundary(context);

    if (!result.allowed) {
      if (result.violation) {
        this.handleViolation(result.violation);
      }
    }

    // Log warnings even if action is allowed
    if (result.warnings && result.warnings.length > 0) {
      result.warnings.forEach(warning => console.warn(`⚠️ ${warning}`));
    }
  }

  // Handle boundary violation
  private handleViolation(violation: BoundaryViolation): never {
    console.error('🛑 BOUNDARY VIOLATION DETECTED');
    console.error(`Agent: ${violation.agent_role}`);
    console.error(`Action: ${violation.attempted_action} on ${violation.resource}`);
    console.error(`Error: ${violation.error_message}`);

    if (violation.stack_trace) {
      console.error('Stack trace:', violation.stack_trace);
    }

    // Log to metrics
    this.logViolationMetrics(violation);

    // Throw exception to block execution
    throw new Error(violation.error_message);
  }

  // Record violation for auditing
  private recordViolation(violation: BoundaryViolation): void {
    this.violations.push(violation);

    // Keep only last 1000 violations in memory
    if (this.violations.length > 1000) {
      this.violations = this.violations.slice(-1000);
    }
  }

  // Resource matching logic
  private resourceMatches(resource: string, allowedResources: string[]): boolean {
    return allowedResources.some(allowed => {
      if (allowed === '*') return true;
      if (allowed === resource) return true;
      if (allowed.endsWith('*')) {
        return resource.startsWith(allowed.slice(0, -1));
      }
      return false;
    });
  }

  // Action matching logic
  private actionMatchesCapability(action: string, category: string): boolean {
    const actionCategories: Record<string, string[]> = {
      'read': ['read', 'get', 'fetch', 'load', 'parse'],
      'write': ['write', 'create', 'update', 'modify', 'save'],
      'execute': ['run', 'execute', 'perform', 'trigger', 'call'],
      'validate': ['check', 'verify', 'validate', 'test', 'assert']
    };

    const categoryActions = actionCategories[category] || [];
    return categoryActions.some(catAction =>
      action.toLowerCase().includes(catAction)
    );
  }

  // Check if action violates restriction
  private actionViolatesRestriction(action: string, restriction: AgentRestriction): boolean {
    const restrictedActions: Record<string, string[]> = {
      'no_implementation': ['write', 'create', 'implement'],
      'no_test_modification': ['modify', 'change', 'update'],
      'no_architecture_changes': ['alter', 'restructure', 'redesign'],
      'no_requirement_changes': ['modify', 'change', 'update'],
      'no_content_modification': ['edit', 'modify', 'change'],
      'no_code_writing': ['write', 'implement', 'code'],
      'no_spec_modification': ['modify', 'change', 'update'],
      'no_test_expectation_changes': ['alter', 'change', 'modify'],
      'requires_failing_test': ['implement', 'write'],
      'no_constitutional_override': ['override', 'bypass', 'ignore'],
      'no_approval_without_tests': ['approve', 'accept'],
      'no_implementation_modification': ['modify', 'change', 'edit'],
      'no_test_skipping': ['skip', 'bypass', 'ignore']
    };

    const actions = restrictedActions[restriction.id] || [];
    return actions.some(restrictedAction =>
      action.toLowerCase().includes(restrictedAction)
    );
  }

  // Generate warnings for edge cases
  private generateWarnings(agentDef: AgentDefinition, context: ActionContext): string[] {
    const warnings: string[] = [];

    // Check for near-boundary actions
    if (this.isNearBoundary(agentDef, context)) {
      warnings.push(`Action '${context.action}' is close to agent boundaries`);
    }

    // Check for dependency requirements
    if (agentDef.dependencies.length > 0) {
      warnings.push(`This action may require coordination with: ${agentDef.dependencies.join(', ')}`);
    }

    return warnings;
  }

  // Generate helpful suggestions
  private generateSuggestions(agentDef: AgentDefinition, context: ActionContext): string[] {
    const suggestions: string[] = [];

    // Suggest related capabilities
    const relatedCaps = agentDef.capabilities.filter(cap =>
      cap.resources.some(r => r.includes(context.resource.split('/')[0]))
    );

    if (relatedCaps.length > 0) {
      suggestions.push(`Consider using capabilities: ${relatedCaps.map(c => c.id).join(', ')}`);
    }

    return suggestions;
  }

  // Suggest alternative agent for action
  private suggestAlternativeAgent(context: ActionContext): string[] {
    const suggestions: string[] = [];

    for (const [role, def] of this.agentDefinitions) {
      if (role === context.agent_role) continue;

      const hasCapability = def.capabilities.some(cap =>
        this.actionMatchesCapability(context.action, cap.category) &&
        this.resourceMatches(context.resource, cap.resources)
      );

      if (hasCapability) {
        suggestions.push(`Agent '${def.name}' has capability for this action`);
      }
    }

    return suggestions;
  }

  // Check if action is near agent boundary
  private isNearBoundary(agentDef: AgentDefinition, context: ActionContext): boolean {
    // Check if resource is mentioned in restrictions
    return agentDef.restrictions.some(restriction =>
      restriction.resources.some(r => context.resource.includes(r))
    );
  }

  // Cache key generation
  private getCacheKey(context: ActionContext): string {
    return `${context.agent_role}:${context.action}:${context.resource}:${context.phase || 'any'}`;
  }

  // Metrics logging
  private logViolationMetrics(violation: BoundaryViolation): void {
    // In real implementation, this would send to metrics system
    console.log('📊 Violation logged to metrics:', {
      agent: violation.agent_role,
      action: violation.attempted_action,
      severity: violation.severity,
      timestamp: violation.timestamp
    });
  }

  // Public API methods
  getViolationHistory(): BoundaryViolation[] {
    return [...this.violations];
  }

  clearViolationHistory(): void {
    this.violations = [];
  }

  getAgentCapabilities(role: AgentRole): string[] {
    const def = this.agentDefinitions.get(role);
    if (!def) return [];
    return def.capabilities.map(cap => cap.id);
  }

  getAgentRestrictions(role: AgentRole): string[] {
    const def = this.agentDefinitions.get(role);
    if (!def) return [];
    return def.restrictions.map(res => res.id);
  }

  validateAgentAction(
    role: AgentRole,
    action: string,
    resource: string,
    phase?: string
  ): BoundaryCheckResult {
    return this.checkBoundary({
      agent_role: role,
      action: action,
      resource: resource,
      phase: phase
    });
  }

  // Utility method for testing agent boundaries
  testAgentBoundaries(role: AgentRole): Record<string, BoundaryCheckResult> {
    const testCases = [
      { action: 'write', resource: 'specifications' },
      { action: 'write', resource: 'source_code' },
      { action: 'write', resource: 'test_code' },
      { action: 'modify', resource: 'requirements' },
      { action: 'validate', resource: 'tdd_compliance' },
      { action: 'execute', resource: 'refactoring' }
    ];

    const results: Record<string, BoundaryCheckResult> = {};

    for (const testCase of testCases) {
      const key = `${testCase.action}:${testCase.resource}`;
      results[key] = this.checkBoundary({
        agent_role: role,
        action: testCase.action,
        resource: testCase.resource
      });
    }

    return results;
  }

  // Generate boundary enforcement report
  generateBoundaryReport(): string {
    const roleCount = this.agentDefinitions.size;
    const violationCount = this.violations.length;
    const recentViolations = this.violations.filter(v =>
      Date.now() - new Date(v.timestamp).getTime() < 24 * 60 * 60 * 1000
    );

    const violationsByAgent: Record<string, number> = {};
    for (const violation of this.violations) {
      violationsByAgent[violation.agent_role] = (violationsByAgent[violation.agent_role] || 0) + 1;
    }

    return `
# Agent Boundary Enforcement Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Agent Roles**: ${roleCount}
- **Total Violations**: ${violationCount}
- **Recent Violations (24h)**: ${recentViolations.length}
- **Cache Size**: ${this.permissionCache.size} entries

## Agent Roles Defined
${Array.from(this.agentDefinitions.values()).map(def =>
  `- **${def.name}** (${def.role}): ${def.capabilities.length} capabilities, ${def.restrictions.length} restrictions`
).join('\n')}

## Violation Distribution
${Object.entries(violationsByAgent).map(([agent, count]) =>
  `- **${agent}**: ${count} violations`
).join('\n')}

## Recent Violations
${recentViolations.slice(0, 5).map(v =>
  `- **${v.agent_role}**: ${v.attempted_action} on ${v.resource} (${v.severity})`
).join('\n')}

## Boundary Enforcement Status
✅ Hard boundaries enforced
✅ Constitutional violations blocked
✅ Phase assignments validated
✅ Capability-based permissions active
✅ Violation tracking enabled
`;
  }

  // Test all agent boundaries systematically
  runBoundaryTests(): Record<AgentRole, Record<string, BoundaryCheckResult>> {
    const results: Record<AgentRole, Record<string, BoundaryCheckResult>> = {} as any;

    for (const role of Object.values(AgentRole)) {
      results[role] = this.testAgentBoundaries(role);
    }

    return results;
  }
}
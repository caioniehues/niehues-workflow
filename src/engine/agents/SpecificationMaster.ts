import { EventEmitter } from 'events';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { BoundaryEnforcer } from './BoundaryEnforcer';
import { AgentRole, AgentDefinition, AGENT_DEFINITIONS, AgentMetric } from './AgentDefinitions';
import { ContextEmbedder } from '../context/ContextEmbedder';

export interface RequirementTemplate {
  id: string;
  title: string;
  description: string;
  acceptance_criteria: AcceptanceCriterion[];
  testability_score: number;
  dependencies: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  source: string;
}

export interface AcceptanceCriterion {
  id: string;
  description: string;
  given: string;
  when: string;
  then: string;
  testable: boolean;
}

export interface ElicitationSession {
  id: string;
  timestamp: string;
  questions_asked: Question[];
  answers_received: Answer[];
  requirements_discovered: RequirementTemplate[];
  confidence: number;
  gaps_identified: string[];
}

export interface Question {
  id: string;
  category: 'functional' | 'non-functional' | 'constraint' | 'quality' | 'edge_case';
  text: string;
  priority: number;
  follow_ups: Question[];
}

export interface Answer {
  question_id: string;
  response: string;
  confidence: number;
  clarifications_needed: string[];
}

export interface SRSDocument {
  version: string;
  created: string;
  modified: string;
  metadata: SRSMetadata;
  sections: SRSSection[];
  requirements: RequirementTemplate[];
  test_strategies: TestStrategy[];
  validation_status: ValidationStatus;
}

export interface SRSMetadata {
  confidence: number;
  iterations: number;
  total_requirements: number;
  testability_average: number;
}

export interface SRSSection {
  id: string;
  title: string;
  content: string;
  completeness: number;
  validation_errors: string[];
}

export interface TestStrategy {
  requirement_id: string;
  strategy_type: 'unit' | 'integration' | 'e2e' | 'acceptance';
  approach: string;
  coverage_target: number;
  test_cases: TestCase[];
}

export interface TestCase {
  id: string;
  description: string;
  given: string;
  when: string;
  then: string;
  test_type: 'positive' | 'negative' | 'edge_case';
}

export interface ValidationStatus {
  is_valid: boolean;
  testability: number;
  completeness: number;
  consistency: number;
  errors: ValidationError[];
  warnings: string[];
}

export interface ValidationError {
  type: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ElicitationResult {
  requirements: RequirementTemplate[];
  confidence: number;
  iterations: number;
  gaps: string[];
}

export class SpecificationMaster extends EventEmitter {
  private role = AgentRole.SPECIFICATION_MASTER;
  private enforcer: BoundaryEnforcer;
  private definition: AgentDefinition;
  private contextEmbedder: ContextEmbedder;

  private currentSession: ElicitationSession | null = null;
  private questionBank: Question[] = [];
  private requirementPatterns: Map<string, RequirementTemplate> = new Map();
  private srsTemplate: string = '';

  constructor() {
    super();

    this.enforcer = new BoundaryEnforcer();
    this.definition = AGENT_DEFINITIONS.get(this.role)!;
    this.contextEmbedder = new ContextEmbedder();

    this.loadQuestionBank();
    this.loadRequirementPatterns();
    this.loadSRSTemplate();

    this.setupEventHandlers();
  }

  // Main specification creation flow
  async createSpecification(initialContext: any): Promise<SRSDocument> {
    console.log('📋 SpecificationMaster: Starting specification creation');

    // Verify boundary permissions
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'write',
      resource: 'specifications',
      phase: 'specify'
    });

    try {
      // 1. Start elicitation session
      this.currentSession = this.initializeSession();

      // 2. Run adaptive questioning
      const elicitationResult = await this.runAdaptiveElicitation(initialContext);

      // 3. Process requirements
      const requirements = await this.processRequirements(elicitationResult);

      // 4. Generate test strategies
      const testStrategies = await this.generateTestStrategies(requirements);

      // 5. Create SRS document
      const srsDocument = await this.assembleSRSDocument(
        requirements,
        testStrategies,
        elicitationResult
      );

      // 6. Validate completeness and testability
      const validation = await this.validateSpecification(srsDocument);
      srsDocument.validation_status = validation;

      if (!validation.is_valid) {
        console.warn('⚠️ Specification has validation issues:', validation.errors);
      }

      // 7. Save specification
      await this.saveSpecification(srsDocument);

      this.emit('specification:created', srsDocument);

      return srsDocument;

    } catch (error) {
      console.error('❌ Specification creation failed:', error);
      this.emit('specification:failed', error);
      throw error;
    }
  }

  // Adaptive elicitation process
  private async runAdaptiveElicitation(context: any): Promise<ElicitationResult> {
    console.log('🎯 Running adaptive requirements elicitation');

    const result: ElicitationResult = {
      requirements: [],
      confidence: 0,
      iterations: 0,
      gaps: []
    };

    // Start with triage questions
    const triageQuestions = this.getTriageQuestions();
    const triageAnswers = await this.askQuestions(triageQuestions);

    // Analyze initial responses
    const initialAnalysis = this.analyzeResponses(triageAnswers);
    result.confidence = initialAnalysis.confidence;

    // Continue with unlimited exploration until confidence > 85%
    while (result.confidence < 85 && result.iterations < 100) {
      console.log(`📊 Current confidence: ${result.confidence}%`);

      // Identify gaps
      const gaps = this.identifyGaps(result.requirements, initialAnalysis);
      result.gaps = gaps;

      // Generate targeted questions
      const targetedQuestions = this.generateTargetedQuestions(gaps);

      // Ask questions
      const answers = await this.askQuestions(targetedQuestions);

      // Extract new requirements
      const newRequirements = await this.extractRequirements(answers);
      result.requirements.push(...newRequirements);

      // Recalculate confidence
      result.confidence = this.calculateConfidence(result.requirements, gaps);
      result.iterations++;
    }

    console.log(`✅ Elicitation complete: ${result.confidence}% confidence after ${result.iterations} iterations`);

    return result;
  }

  // Question generation based on gaps
  private generateTargetedQuestions(gaps: string[]): Question[] {
    const questions: Question[] = [];

    for (const gap of gaps) {
      switch (gap) {
        case 'functional_requirements':
          questions.push(...this.generateFunctionalQuestions());
          break;

        case 'non_functional_requirements':
          questions.push(...this.generateNonFunctionalQuestions());
          break;

        case 'edge_cases':
          questions.push(...this.generateEdgeCaseQuestions());
          break;

        case 'performance_criteria':
          questions.push(...this.generatePerformanceQuestions());
          break;

        case 'security_requirements':
          questions.push(...this.generateSecurityQuestions());
          break;

        case 'integration_points':
          questions.push(...this.generateIntegrationQuestions());
          break;

        default:
          questions.push(this.generateGenericQuestion(gap));
      }
    }

    // Add follow-up questions based on previous answers
    if (this.currentSession) {
      questions.push(...this.generateFollowUpQuestions(this.currentSession.answers_received));
    }

    return questions;
  }

  // Extract requirements from answers
  private async extractRequirements(answers: Answer[]): Promise<RequirementTemplate[]> {
    const requirements: RequirementTemplate[] = [];

    for (const answer of answers) {
      // Parse answer for requirement indicators
      const requirementIndicators = [
        /must\s+(\w+)/gi,
        /should\s+(\w+)/gi,
        /shall\s+(\w+)/gi,
        /needs?\s+to\s+(\w+)/gi,
        /required?\s+to\s+(\w+)/gi
      ];

      let hasRequirement = false;
      for (const pattern of requirementIndicators) {
        if (pattern.test(answer.response)) {
          hasRequirement = true;
          break;
        }
      }

      if (hasRequirement) {
        const requirement = await this.parseRequirement(answer);
        if (requirement) {
          requirements.push(requirement);
        }
      }
    }

    // Deduplicate and prioritize
    return this.deduplicateRequirements(requirements);
  }

  // Parse individual requirement from answer
  private async parseRequirement(answer: Answer): Promise<RequirementTemplate | null> {
    // Extract key information
    const requirement: RequirementTemplate = {
      id: this.generateRequirementId(),
      title: this.extractTitle(answer.response),
      description: this.extractDescription(answer.response),
      acceptance_criteria: await this.generateAcceptanceCriteria(answer.response),
      testability_score: 0,
      dependencies: this.extractDependencies(answer.response),
      priority: this.determinePriority(answer),
      source: `Elicitation question ${answer.question_id}`
    };

    // Calculate testability
    requirement.testability_score = this.calculateTestability(requirement);

    // Validate requirement quality
    if (requirement.testability_score < 60) {
      console.warn(`⚠️ Low testability for requirement: ${requirement.title}`);
      // Attempt to improve testability
      requirement = await this.improveRequirementTestability(requirement);
    }

    return requirement.testability_score > 40 ? requirement : null;
  }

  // Generate acceptance criteria from requirement
  private async generateAcceptanceCriteria(requirementText: string): Promise<AcceptanceCriterion[]> {
    const criteria: AcceptanceCriterion[] = [];

    // Extract Given-When-Then patterns
    const gwtPattern = /given\s+(.+?)[,\s]+when\s+(.+?)[,\s]+then\s+(.+)/gi;
    const matches = requirementText.matchAll(gwtPattern);

    for (const match of matches) {
      criteria.push({
        id: this.generateCriterionId(),
        description: match[0],
        given: match[1].trim(),
        when: match[2].trim(),
        then: match[3].trim(),
        testable: true
      });
    }

    // Generate criteria if none found
    if (criteria.length === 0) {
      criteria.push(...this.generateDefaultCriteria(requirementText));
    }

    // Validate testability
    for (const criterion of criteria) {
      criterion.testable = this.isCriterionTestable(criterion);
    }

    return criteria;
  }

  // Calculate requirement testability score
  private calculateTestability(requirement: RequirementTemplate): number {
    let score = 100;

    // Check for vague terms
    const vagueTerms = ['good', 'fast', 'easy', 'user-friendly', 'efficient', 'scalable'];
    for (const term of vagueTerms) {
      if (requirement.description.toLowerCase().includes(term)) {
        score -= 10;
      }
    }

    // Check for measurable criteria
    if (requirement.acceptance_criteria.length === 0) {
      score -= 30;
    } else {
      const testableCount = requirement.acceptance_criteria.filter(c => c.testable).length;
      const testabilityRatio = testableCount / requirement.acceptance_criteria.length;
      score *= testabilityRatio;
    }

    // Check for specific values/thresholds
    const hasNumbers = /\d+/.test(requirement.description);
    if (!hasNumbers) {
      score -= 15;
    }

    return Math.max(0, Math.round(score));
  }

  // Improve requirement testability
  private async improveRequirementTestability(requirement: RequirementTemplate): Promise<RequirementTemplate> {
    console.log(`🔧 Improving testability for: ${requirement.title}`);

    // Replace vague terms with specific ones
    requirement.description = this.replaceVagueTerms(requirement.description);

    // Add measurable criteria if missing
    if (requirement.acceptance_criteria.length === 0) {
      requirement.acceptance_criteria = await this.generateSmartCriteria(requirement);
    }

    // Add specific thresholds
    requirement.description = this.addSpecificThresholds(requirement.description);

    // Recalculate score
    requirement.testability_score = this.calculateTestability(requirement);

    return requirement;
  }

  // Generate test strategies for requirements
  private async generateTestStrategies(requirements: RequirementTemplate[]): Promise<TestStrategy[]> {
    console.log('🧪 Generating test strategies for requirements');

    // Verify boundary - can create test strategies
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'create',
      resource: 'test_strategies',
      phase: 'specify'
    });

    const strategies: TestStrategy[] = [];

    for (const requirement of requirements) {
      const strategy = await this.createTestStrategy(requirement);
      strategies.push(strategy);
    }

    return strategies;
  }

  // Create test strategy for single requirement
  private async createTestStrategy(requirement: RequirementTemplate): Promise<TestStrategy> {
    const strategy: TestStrategy = {
      requirement_id: requirement.id,
      strategy_type: this.determineTestType(requirement),
      approach: this.generateTestApproach(requirement),
      coverage_target: this.calculateCoverageTarget(requirement),
      test_cases: []
    };

    // Generate test cases from acceptance criteria
    for (const criterion of requirement.acceptance_criteria) {
      if (criterion.testable) {
        strategy.test_cases.push(this.generateTestCase(criterion, requirement));
      }
    }

    // Add edge case tests
    strategy.test_cases.push(...this.generateEdgeCaseTests(requirement));

    // Add negative tests
    strategy.test_cases.push(...this.generateNegativeTests(requirement));

    return strategy;
  }

  // Assemble complete SRS document
  private async assembleSRSDocument(
    requirements: RequirementTemplate[],
    testStrategies: TestStrategy[],
    elicitationResult: ElicitationResult
  ): Promise<SRSDocument> {
    console.log('📄 Assembling SRS document');

    const srsDocument: SRSDocument = {
      version: '1.0.0',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      metadata: {
        confidence: elicitationResult.confidence,
        iterations: elicitationResult.iterations,
        total_requirements: requirements.length,
        testability_average: this.calculateAverageTestability(requirements)
      },
      sections: await this.generateSRSSections(requirements, elicitationResult),
      requirements: requirements,
      test_strategies: testStrategies,
      validation_status: {
        is_valid: false,
        testability: 0,
        completeness: 0,
        consistency: 0,
        errors: [],
        warnings: []
      }
    };

    return srsDocument;
  }

  // Generate SRS sections from template
  private async generateSRSSections(
    requirements: RequirementTemplate[],
    elicitationResult: ElicitationResult
  ): Promise<SRSSection[]> {
    const sections: SRSSection[] = [];

    // 1. Introduction
    sections.push({
      id: 'introduction',
      title: 'Introduction',
      content: this.generateIntroduction(elicitationResult),
      completeness: 100,
      validation_errors: []
    });

    // 2. Product Scope
    sections.push({
      id: 'product_scope',
      title: 'Product Scope',
      content: this.generateProductScope(requirements),
      completeness: this.calculateSectionCompleteness('product_scope', requirements),
      validation_errors: []
    });

    // 3. Functional Requirements
    const functionalReqs = requirements.filter(r => this.isFunctionalRequirement(r));
    sections.push({
      id: 'functional_requirements',
      title: 'Functional Requirements',
      content: this.formatFunctionalRequirements(functionalReqs),
      completeness: functionalReqs.length > 0 ? 100 : 0,
      validation_errors: functionalReqs.length === 0 ? ['No functional requirements defined'] : []
    });

    // 4. Non-Functional Requirements
    const nonFunctionalReqs = requirements.filter(r => !this.isFunctionalRequirement(r));
    sections.push({
      id: 'non_functional_requirements',
      title: 'Non-Functional Requirements',
      content: this.formatNonFunctionalRequirements(nonFunctionalReqs),
      completeness: nonFunctionalReqs.length > 0 ? 100 : 50,
      validation_errors: []
    });

    // 5. Quality Attributes
    sections.push({
      id: 'quality_attributes',
      title: 'Quality Attributes',
      content: this.generateQualityAttributes(requirements),
      completeness: this.calculateSectionCompleteness('quality_attributes', requirements),
      validation_errors: []
    });

    // 6. Constraints
    sections.push({
      id: 'constraints',
      title: 'Constraints',
      content: this.generateConstraints(elicitationResult),
      completeness: 100,
      validation_errors: []
    });

    // 7. Test Strategies
    sections.push({
      id: 'test_strategies',
      title: 'Test Strategies',
      content: this.formatTestStrategies(requirements),
      completeness: 100,
      validation_errors: []
    });

    return sections;
  }

  // Validate specification completeness and quality
  private async validateSpecification(srsDocument: SRSDocument): Promise<ValidationStatus> {
    console.log('✅ Validating specification');

    const validation: ValidationStatus = {
      is_valid: true,
      testability: 0,
      completeness: 0,
      consistency: 0,
      errors: [],
      warnings: []
    };

    // Check testability
    validation.testability = this.calculateOverallTestability(srsDocument);
    if (validation.testability < 80) {
      validation.warnings.push(`Testability below target: ${validation.testability}%`);
    }

    // Check completeness
    validation.completeness = this.calculateCompleteness(srsDocument);
    if (validation.completeness < 90) {
      validation.errors.push({
        type: 'completeness',
        message: `Specification incomplete: ${validation.completeness}%`,
        severity: 'high'
      });
      validation.is_valid = false;
    }

    // Check consistency
    validation.consistency = this.checkConsistency(srsDocument);
    if (validation.consistency < 95) {
      validation.warnings.push(`Inconsistencies detected: ${100 - validation.consistency}%`);
    }

    // Check for required sections
    const requiredSections = ['functional_requirements', 'test_strategies'];
    for (const required of requiredSections) {
      const section = srsDocument.sections.find(s => s.id === required);
      if (!section || section.completeness < 50) {
        validation.errors.push({
          type: 'missing_section',
          message: `Required section incomplete: ${required}`,
          severity: 'critical'
        });
        validation.is_valid = false;
      }
    }

    // Check for testable requirements
    const untestableReqs = srsDocument.requirements.filter(r => r.testability_score < 40);
    if (untestableReqs.length > 0) {
      validation.warnings.push(`${untestableReqs.length} requirements have low testability`);
    }

    return validation;
  }

  // Save specification to file
  private async saveSpecification(srsDocument: SRSDocument): Promise<void> {
    const specPath = '.nexus/specs/specification.md';
    const yamlPath = '.nexus/specs/specification.yaml';

    // Save as markdown
    const markdown = this.convertToMarkdown(srsDocument);
    writeFileSync(specPath, markdown, 'utf8');

    // Save as YAML for processing (simplified - would use proper YAML library)
    const yamlContent = JSON.stringify(srsDocument, null, 2);
    writeFileSync(yamlPath, yamlContent, 'utf8');

    console.log(`📄 Specification saved to ${specPath}`);
  }

  // Convert SRS to markdown format
  private convertToMarkdown(srsDocument: SRSDocument): string {
    let markdown = `# Software Requirements Specification\n\n`;
    markdown += `**Version:** ${srsDocument.version}\n`;
    markdown += `**Created:** ${srsDocument.created}\n`;
    markdown += `**Confidence:** ${srsDocument.metadata.confidence}%\n\n`;

    // Add sections
    for (const section of srsDocument.sections) {
      markdown += `## ${section.title}\n\n`;
      markdown += section.content + '\n\n';
    }

    // Add requirements table
    markdown += '## Requirements Summary\n\n';
    markdown += '| ID | Title | Priority | Testability |\n';
    markdown += '|----|-------|----------|-------------|\n';
    for (const req of srsDocument.requirements) {
      markdown += `| ${req.id} | ${req.title} | ${req.priority} | ${req.testability_score}% |\n`;
    }

    return markdown;
  }

  // Helper methods (simplified implementations)
  private initializeSession(): ElicitationSession {
    return {
      id: this.generateSessionId(),
      timestamp: new Date().toISOString(),
      questions_asked: [],
      answers_received: [],
      requirements_discovered: [],
      confidence: 0,
      gaps_identified: []
    };
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRequirementId(): string {
    return `FR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }

  private generateCriterionId(): string {
    return `AC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }

  // Event handlers
  private setupEventHandlers(): void {
    this.on('question:asked', (question) => {
      if (this.currentSession) {
        this.currentSession.questions_asked.push(question);
      }
    });

    this.on('answer:received', (answer) => {
      if (this.currentSession) {
        this.currentSession.answers_received.push(answer);
      }
    });

    this.on('requirement:discovered', (requirement) => {
      if (this.currentSession) {
        this.currentSession.requirements_discovered.push(requirement);
      }
    });
  }

  // Load question bank
  private loadQuestionBank(): void {
    // Load predefined questions for various categories
    this.questionBank = [
      {
        id: 'func-1',
        category: 'functional',
        text: 'What are the main features this system needs to provide?',
        priority: 10,
        follow_ups: []
      },
      {
        id: 'perf-1',
        category: 'non-functional',
        text: 'What are the performance requirements for response time?',
        priority: 8,
        follow_ups: []
      }
    ];
  }

  private loadRequirementPatterns(): void {
    // Load common requirement patterns for quality improvement
    const patterns = new Map();
    patterns.set('auth', {
      id: 'AUTH-PATTERN',
      title: 'Authentication Pattern',
      description: 'User authentication and authorization requirements',
      acceptance_criteria: [],
      testability_score: 85,
      dependencies: [],
      priority: 'high',
      source: 'pattern'
    });
    this.requirementPatterns = patterns;
  }

  private loadSRSTemplate(): void {
    // In production, would load from file
    this.srsTemplate = `# Software Requirements Specification Template`;
  }

  // Simplified helper methods (would be fully implemented)
  private getTriageQuestions(): Question[] { return this.questionBank.slice(0, 3); }
  private async askQuestions(questions: Question[]): Promise<Answer[]> { return []; }
  private analyzeResponses(answers: Answer[]): any { return { confidence: 60 }; }
  private identifyGaps(requirements: RequirementTemplate[], analysis: any): string[] { return ['functional_requirements']; }
  private generateFunctionalQuestions(): Question[] { return []; }
  private generateNonFunctionalQuestions(): Question[] { return []; }
  private generateEdgeCaseQuestions(): Question[] { return []; }
  private generatePerformanceQuestions(): Question[] { return []; }
  private generateSecurityQuestions(): Question[] { return []; }
  private generateIntegrationQuestions(): Question[] { return []; }
  private generateGenericQuestion(gap: string): Question { return { id: 'gen-1', category: 'functional', text: `Tell me more about ${gap}`, priority: 5, follow_ups: [] }; }
  private generateFollowUpQuestions(answers: Answer[]): Question[] { return []; }
  private deduplicateRequirements(requirements: RequirementTemplate[]): RequirementTemplate[] { return requirements; }
  private extractTitle(response: string): string { return response.split('.')[0] || 'Requirement'; }
  private extractDescription(response: string): string { return response; }
  private extractDependencies(response: string): string[] { return []; }
  private determinePriority(answer: Answer): 'critical' | 'high' | 'medium' | 'low' { return 'medium'; }
  private generateDefaultCriteria(text: string): AcceptanceCriterion[] { return []; }
  private isCriterionTestable(criterion: AcceptanceCriterion): boolean { return true; }
  private replaceVagueTerms(description: string): string { return description; }
  private async generateSmartCriteria(requirement: RequirementTemplate): Promise<AcceptanceCriterion[]> { return []; }
  private addSpecificThresholds(description: string): string { return description; }
  private calculateConfidence(requirements: RequirementTemplate[], gaps: string[]): number { return Math.min(85, 60 + requirements.length * 5); }
  private async processRequirements(result: ElicitationResult): Promise<RequirementTemplate[]> { return result.requirements; }
  private determineTestType(requirement: RequirementTemplate): 'unit' | 'integration' | 'e2e' | 'acceptance' { return 'unit'; }
  private generateTestApproach(requirement: RequirementTemplate): string { return 'TDD with Jest'; }
  private calculateCoverageTarget(requirement: RequirementTemplate): number { return 80; }
  private generateTestCase(criterion: AcceptanceCriterion, requirement: RequirementTemplate): TestCase {
    return {
      id: `TC-${Date.now()}`,
      description: criterion.description,
      given: criterion.given,
      when: criterion.when,
      then: criterion.then,
      test_type: 'positive'
    };
  }
  private generateEdgeCaseTests(requirement: RequirementTemplate): TestCase[] { return []; }
  private generateNegativeTests(requirement: RequirementTemplate): TestCase[] { return []; }
  private calculateAverageTestability(requirements: RequirementTemplate[]): number {
    if (requirements.length === 0) return 0;
    return requirements.reduce((sum, r) => sum + r.testability_score, 0) / requirements.length;
  }
  private generateIntroduction(result: ElicitationResult): string { return `Requirements elicited with ${result.confidence}% confidence`; }
  private generateProductScope(requirements: RequirementTemplate[]): string { return `System scope covering ${requirements.length} requirements`; }
  private calculateSectionCompleteness(sectionId: string, requirements: RequirementTemplate[]): number { return 100; }
  private formatFunctionalRequirements(requirements: RequirementTemplate[]): string { return requirements.map(r => `- ${r.title}: ${r.description}`).join('\n'); }
  private isFunctionalRequirement(requirement: RequirementTemplate): boolean { return !requirement.description.toLowerCase().includes('performance'); }
  private formatNonFunctionalRequirements(requirements: RequirementTemplate[]): string { return requirements.map(r => `- ${r.title}: ${r.description}`).join('\n'); }
  private generateQualityAttributes(requirements: RequirementTemplate[]): string { return 'Quality attributes derived from requirements'; }
  private generateConstraints(result: ElicitationResult): string { return 'System constraints and limitations'; }
  private formatTestStrategies(requirements: RequirementTemplate[]): string { return 'Test strategies for each requirement type'; }
  private calculateOverallTestability(srsDocument: SRSDocument): number { return srsDocument.metadata.testability_average; }
  private calculateCompleteness(srsDocument: SRSDocument): number {
    const completeSections = srsDocument.sections.filter(s => s.completeness >= 90).length;
    return (completeSections / srsDocument.sections.length) * 100;
  }
  private checkConsistency(srsDocument: SRSDocument): number { return 95; }

  // Public API
  async elicitRequirements(context: any): Promise<RequirementTemplate[]> {
    const result = await this.runAdaptiveElicitation(context);
    return result.requirements;
  }

  async validateRequirement(requirement: RequirementTemplate): Promise<boolean> {
    const testability = this.calculateTestability(requirement);
    return testability >= 60;
  }

  getCapabilities(): string[] {
    return this.definition.capabilities.map(c => c.id);
  }

  getMetrics(): AgentMetric[] {
    return this.definition.success_metrics;
  }

  async attemptCodeWriting(): Promise<void> {
    // This should throw a boundary violation
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'write',
      resource: 'source_code',
      phase: 'specify'
    });
  }
}
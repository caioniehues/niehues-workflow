import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as inquirer from 'inquirer';

// Core interfaces
interface Question {
  id: string;
  category: 'functional' | 'non-functional' | 'technical' | 'business' | 'edge-case';
  question: string;
  answer?: string;
  confidence?: number;
  follow_ups?: Question[];
}

interface Requirement {
  id: string;
  type: 'functional' | 'non-functional';
  priority: 'must-have' | 'should-have' | 'could-have' | 'won\'t-have';
  description: string;
  acceptance_criteria: string[];
  test_scenarios: string[];
  dependencies: string[];
  edge_cases: string[];
  confidence: number;
}

interface Specification {
  id: string;
  title: string;
  version: string;
  created: Date;
  modified: Date;
  confidence: number;
  status: 'draft' | 'review' | 'approved' | 'implemented';

  executive_summary: string;
  problem_statement: string;
  solution_overview: string;

  stakeholders: Stakeholder[];
  assumptions: string[];
  constraints: string[];
  risks: Risk[];

  functional_requirements: Requirement[];
  non_functional_requirements: Requirement[];

  user_stories: UserStory[];
  use_cases: UseCase[];

  technical_architecture: TechnicalArchitecture;
  data_model: DataModel;
  api_specification: APISpecification;

  testing_strategy: TestingStrategy;
  deployment_strategy: DeploymentStrategy;

  timeline: Timeline;
  success_metrics: SuccessMetric[];

  questions_asked: Question[];
  total_questions: number;
}

// Supporting interfaces
interface Stakeholder {
  name: string;
  role: string;
  responsibilities: string[];
  contact?: string;
}

interface Risk {
  id: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

interface UserStory {
  id: string;
  as_a: string;
  i_want: string;
  so_that: string;
  acceptance_criteria: string[];
  priority: number;
}

interface UseCase {
  id: string;
  name: string;
  actor: string;
  preconditions: string[];
  main_flow: string[];
  alternative_flows: string[][];
  postconditions: string[];
  exceptions: string[];
}

interface TechnicalArchitecture {
  overview: string;
  components: Component[];
  integrations: Integration[];
  technology_stack: TechnologyChoice[];
  scalability_approach: string;
  security_approach: string;
}

interface Component {
  name: string;
  responsibility: string;
  interfaces: string[];
  dependencies: string[];
}

interface Integration {
  system: string;
  protocol: string;
  data_format: string;
  authentication: string;
}

interface TechnologyChoice {
  category: string;
  technology: string;
  rationale: string;
}

interface DataModel {
  entities: Entity[];
  relationships: Relationship[];
  data_flow: string;
}

interface Entity {
  name: string;
  attributes: Attribute[];
  constraints: string[];
}

interface Attribute {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  default?: any;
}

interface Relationship {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  description: string;
}

interface APISpecification {
  base_url: string;
  version: string;
  authentication: string;
  endpoints: Endpoint[];
}

interface Endpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  request_body?: any;
  response_body?: any;
  error_codes: ErrorCode[];
}

interface ErrorCode {
  code: number;
  message: string;
  description: string;
}

interface TestingStrategy {
  approach: string;
  test_levels: TestLevel[];
  tools: string[];
  coverage_targets: CoverageTarget[];
}

interface TestLevel {
  level: 'unit' | 'integration' | 'system' | 'acceptance';
  scope: string;
  responsibility: string;
  tools: string[];
}

interface CoverageTarget {
  metric: string;
  target: number;
  rationale: string;
}

interface DeploymentStrategy {
  approach: string;
  environments: Environment[];
  rollout_plan: string;
  rollback_plan: string;
  monitoring: string[];
}

interface Environment {
  name: string;
  purpose: string;
  infrastructure: string;
  configuration: string;
}

interface Timeline {
  phases: Phase[];
  milestones: Milestone[];
  critical_path: string[];
}

interface Phase {
  name: string;
  duration: string;
  deliverables: string[];
  dependencies: string[];
}

interface Milestone {
  name: string;
  date: string;
  criteria: string[];
}

interface SuccessMetric {
  metric: string;
  target: string;
  measurement_method: string;
  frequency: string;
}

export class SpecificationEngine {
  private readonly CONFIDENCE_THRESHOLD = 85;
  private readonly MIN_QUESTIONS = 20;
  private readonly MAX_QUESTIONS = 200;
  private readonly OUTPUT_DIR = '.nexus/specs/monolithic';

  private currentConfidence = 0;
  private questionsAsked: Question[] = [];
  private questionCount = 0;

  async createSpecification(
    topic: string,
    brainstormSession?: any
  ): Promise<Specification> {
    console.log('📝 Starting Specification Creation');
    console.log(`📋 Topic: ${topic}`);
    console.log('─'.repeat(50));

    const spec: Partial<Specification> = {
      id: uuidv4(),
      title: topic,
      version: '1.0.0',
      created: new Date(),
      modified: new Date(),
      status: 'draft',
      questions_asked: [],
      total_questions: 0
    };

    try {
      // Phase 1: Initial context gathering
      console.log('\n🎯 Phase 1: Context Gathering');
      await this.gatherInitialContext(spec, brainstormSession);

      // Phase 2: Adaptive questioning
      console.log('\n❓ Phase 2: Adaptive Questioning');
      await this.runAdaptiveQuestioning(spec);

      // Phase 3: Requirements extraction
      console.log('\n📋 Phase 3: Requirements Extraction');
      await this.extractRequirements(spec);

      // Phase 4: Technical specification
      console.log('\n🔧 Phase 4: Technical Specification');
      await this.defineTechnicalSpecification(spec);

      // Phase 5: Validation and testability
      console.log('\n✅ Phase 5: Validation & Testability');
      await this.validateTestability(spec);

      // Phase 6: Edge cases and exceptions
      console.log('\n🔍 Phase 6: Edge Cases & Exceptions');
      await this.identifyEdgeCases(spec);

      // Phase 7: Final review and confidence check
      console.log('\n📊 Phase 7: Final Review');
      await this.finalReview(spec);

      // Phase 8: Generate SRS document
      console.log('\n📄 Phase 8: Generating SRS Document');
      await this.generateSRSDocument(spec as Specification);

      console.log('\n✅ Specification Complete!');
      console.log(`📊 Final Confidence: ${spec.confidence}%`);
      console.log(`❓ Total Questions: ${spec.total_questions}`);

      return spec as Specification;

    } catch (error: any) {
      console.error('❌ Specification creation failed:', error.message);
      throw error;
    }
  }

  private async gatherInitialContext(
    spec: Partial<Specification>,
    brainstormSession?: any
  ): Promise<void> {
    // If we have a brainstorm session, use it as context
    if (brainstormSession) {
      spec.problem_statement = brainstormSession.problem_statement;
    }

    // Ask fundamental questions
    const contextQuestions = [
      {
        name: 'problem_statement',
        type: 'editor',
        message: 'Describe the problem this specification solves:',
        default: spec.problem_statement || ''
      },
      {
        name: 'solution_overview',
        type: 'editor',
        message: 'Describe the proposed solution at a high level:'
      },
      {
        name: 'executive_summary',
        type: 'editor',
        message: 'Provide an executive summary (2-3 paragraphs):'
      },
      {
        name: 'primary_users',
        type: 'input',
        message: 'Who are the primary users? (comma-separated):'
      },
      {
        name: 'success_definition',
        type: 'editor',
        message: 'How will success be measured?'
      }
    ];

    const answers = await inquirer.prompt(contextQuestions);
    Object.assign(spec, answers);

    // Initialize stakeholders
    spec.stakeholders = this.parseStakeholders(answers.primary_users);

    this.updateConfidence(20); // Base confidence from initial context
  }

  private async runAdaptiveQuestioning(spec: Partial<Specification>): Promise<void> {
    console.log('\n🤔 Starting adaptive questioning...');
    console.log(`Target confidence: ${this.CONFIDENCE_THRESHOLD}%`);

    while (this.currentConfidence < this.CONFIDENCE_THRESHOLD &&
           this.questionCount < this.MAX_QUESTIONS) {

      // Generate next questions based on current understanding
      const nextQuestions = this.generateAdaptiveQuestions(spec);

      // Ask questions in batches
      for (const question of nextQuestions) {
        if (this.currentConfidence >= this.CONFIDENCE_THRESHOLD) break;

        const answer = await this.askQuestion(question);
        question.answer = answer;
        this.questionsAsked.push(question);
        this.questionCount++;

        // Process answer and update specification
        await this.processAnswer(spec, question, answer);

        // Generate follow-up questions if needed
        if (question.confidence && question.confidence < 70) {
          const followUps = this.generateFollowUpQuestions(question, answer);
          question.follow_ups = followUps;

          for (const followUp of followUps) {
            if (this.currentConfidence >= this.CONFIDENCE_THRESHOLD) break;
            const followUpAnswer = await this.askQuestion(followUp);
            followUp.answer = followUpAnswer;
            this.questionCount++;
            await this.processAnswer(spec, followUp, followUpAnswer);
          }
        }

        console.log(`📊 Current confidence: ${this.currentConfidence}%`);
        console.log(`❓ Questions asked: ${this.questionCount}`);
      }
    }

    spec.questions_asked = this.questionsAsked;
    spec.total_questions = this.questionCount;
    spec.confidence = this.currentConfidence;
  }

  private generateAdaptiveQuestions(spec: Partial<Specification>): Question[] {
    const questions: Question[] = [];

    // Functional requirements questions
    if (!spec.functional_requirements || spec.functional_requirements.length < 5) {
      questions.push({
        id: uuidv4(),
        category: 'functional',
        question: 'What specific functionality must the system provide? List key features:'
      });
    }

    // Non-functional requirements questions
    if (!spec.non_functional_requirements || spec.non_functional_requirements.length < 3) {
      questions.push({
        id: uuidv4(),
        category: 'non-functional',
        question: 'What are the performance requirements? (response time, throughput, etc.)'
      });
    }

    // Technical questions
    if (!spec.technical_architecture) {
      questions.push({
        id: uuidv4(),
        category: 'technical',
        question: 'What is the preferred technology stack? Any constraints?'
      });
    }

    // Business questions
    if (!spec.timeline) {
      questions.push({
        id: uuidv4(),
        category: 'business',
        question: 'What is the expected timeline for this project?'
      });
    }

    // Edge case questions
    questions.push({
      id: uuidv4(),
      category: 'edge-case',
      question: 'What could go wrong? What are the edge cases we should handle?'
    });

    return questions.slice(0, 5); // Ask up to 5 questions at a time
  }

  private async askQuestion(question: Question): Promise<string> {
    const answer = await inquirer.prompt([
      {
        type: 'editor',
        name: 'answer',
        message: `\n${question.question}`
      }
    ]);

    return answer.answer;
  }

  private async processAnswer(
    spec: Partial<Specification>,
    question: Question,
    answer: string
  ): Promise<void> {
    // Parse answer based on question category
    switch (question.category) {
      case 'functional':
        this.extractFunctionalRequirements(spec, answer);
        break;
      case 'non-functional':
        this.extractNonFunctionalRequirements(spec, answer);
        break;
      case 'technical':
        this.extractTechnicalDetails(spec, answer);
        break;
      case 'business':
        this.extractBusinessDetails(spec, answer);
        break;
      case 'edge-case':
        this.extractEdgeCases(spec, answer);
        break;
    }

    // Calculate confidence boost based on answer quality
    const answerQuality = this.assessAnswerQuality(answer);
    question.confidence = answerQuality;

    const confidenceBoost = Math.floor(answerQuality / 10);
    this.updateConfidence(confidenceBoost);
  }

  private assessAnswerQuality(answer: string): number {
    const wordCount = answer.split(/\s+/).length;
    const hasDetails = answer.includes('-') || answer.includes('•');
    const hasNumbers = /\d+/.test(answer);
    const hasSpecifics = /must|should|will|shall/i.test(answer);

    let quality = 50; // Base quality

    if (wordCount > 50) quality += 20;
    if (wordCount > 100) quality += 10;
    if (hasDetails) quality += 10;
    if (hasNumbers) quality += 5;
    if (hasSpecifics) quality += 5;

    return Math.min(quality, 100);
  }

  private generateFollowUpQuestions(question: Question, answer: string): Question[] {
    const followUps: Question[] = [];

    // Look for ambiguous terms
    const ambiguousTerms = ['maybe', 'possibly', 'sometimes', 'usually', 'often'];
    const hasAmbiguity = ambiguousTerms.some(term => answer.toLowerCase().includes(term));

    if (hasAmbiguity) {
      followUps.push({
        id: uuidv4(),
        category: question.category,
        question: 'You mentioned some uncertainty. Can you be more specific about when/how this applies?'
      });
    }

    // Look for missing details
    if (answer.length < 100) {
      followUps.push({
        id: uuidv4(),
        category: question.category,
        question: 'Can you provide more details or examples?'
      });
    }

    return followUps;
  }

  private extractFunctionalRequirements(spec: Partial<Specification>, answer: string): void {
    if (!spec.functional_requirements) {
      spec.functional_requirements = [];
    }

    const lines = answer.split('\n').filter(line => line.trim());

    for (const line of lines) {
      if (line.match(/^[-•*]/)) {
        const requirement: Requirement = {
          id: `FR-${spec.functional_requirements.length + 1}`,
          type: 'functional',
          priority: this.inferPriority(line),
          description: line.replace(/^[-•*]\s*/, ''),
          acceptance_criteria: [],
          test_scenarios: [],
          dependencies: [],
          edge_cases: [],
          confidence: 70
        };

        spec.functional_requirements.push(requirement);
      }
    }
  }

  private extractNonFunctionalRequirements(spec: Partial<Specification>, answer: string): void {
    if (!spec.non_functional_requirements) {
      spec.non_functional_requirements = [];
    }

    const lines = answer.split('\n').filter(line => line.trim());

    for (const line of lines) {
      if (line.trim()) {
        const requirement: Requirement = {
          id: `NFR-${spec.non_functional_requirements.length + 1}`,
          type: 'non-functional',
          priority: this.inferPriority(line),
          description: line.trim(),
          acceptance_criteria: [],
          test_scenarios: [],
          dependencies: [],
          edge_cases: [],
          confidence: 70
        };

        spec.non_functional_requirements.push(requirement);
      }
    }
  }

  private extractTechnicalDetails(spec: Partial<Specification>, answer: string): void {
    if (!spec.technical_architecture) {
      spec.technical_architecture = {
        overview: answer,
        components: [],
        integrations: [],
        technology_stack: [],
        scalability_approach: '',
        security_approach: ''
      };
    }
  }

  private extractBusinessDetails(spec: Partial<Specification>, answer: string): void {
    // Extract timeline information
    const timePattern = /(\d+)\s*(day|week|month|quarter|year)s?/gi;
    const matches = answer.match(timePattern);

    if (matches && !spec.timeline) {
      spec.timeline = {
        phases: [],
        milestones: [],
        critical_path: []
      };

      for (const match of matches) {
        spec.timeline.phases.push({
          name: `Phase ${spec.timeline.phases.length + 1}`,
          duration: match,
          deliverables: [],
          dependencies: []
        });
      }
    }

    if (!spec.success_metrics) {
      spec.success_metrics = [];
    }
  }

  private extractEdgeCases(spec: Partial<Specification>, answer: string): void {
    const edgeCases = answer.split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());

    if (spec.functional_requirements) {
      for (const req of spec.functional_requirements) {
        if (req.edge_cases.length === 0) {
          req.edge_cases = edgeCases.slice(0, 2);
        }
      }
    }

    if (!spec.risks) {
      spec.risks = [];
    }

    for (const edgeCase of edgeCases.slice(0, 3)) {
      spec.risks.push({
        id: `R-${spec.risks.length + 1}`,
        description: edgeCase,
        probability: 'low',
        impact: 'medium',
        mitigation: 'To be determined'
      });
    }
  }

  private inferPriority(text: string): 'must-have' | 'should-have' | 'could-have' | 'won\'t-have' {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('must') || lowerText.includes('required')) {
      return 'must-have';
    }
    if (lowerText.includes('should') || lowerText.includes('important')) {
      return 'should-have';
    }
    if (lowerText.includes('could') || lowerText.includes('nice')) {
      return 'could-have';
    }
    if (lowerText.includes('won\'t') || lowerText.includes('not')) {
      return 'won\'t-have';
    }

    return 'should-have';
  }

  private async extractRequirements(spec: Partial<Specification>): Promise<void> {
    console.log('\n📋 Extracting detailed requirements...');

    // Generate acceptance criteria for each requirement
    for (const req of spec.functional_requirements || []) {
      if (req.acceptance_criteria.length === 0) {
        req.acceptance_criteria = this.generateAcceptanceCriteria(req);
      }
      if (req.test_scenarios.length === 0) {
        req.test_scenarios = this.generateTestScenarios(req);
      }
    }

    // Create user stories from requirements
    spec.user_stories = this.generateUserStories(spec.functional_requirements || []);

    // Create use cases
    spec.use_cases = this.generateUseCases(spec.functional_requirements || []);

    this.updateConfidence(15);
  }

  private generateAcceptanceCriteria(requirement: Requirement): string[] {
    return [
      `Given the system is in a valid state`,
      `When ${requirement.description.toLowerCase()}`,
      `Then the expected outcome is achieved`,
      `And no errors are thrown`,
      `And the change is persisted`
    ];
  }

  private generateTestScenarios(requirement: Requirement): string[] {
    return [
      `Happy path: ${requirement.description}`,
      `Error case: Invalid input provided`,
      `Boundary case: Maximum values`,
      `Boundary case: Minimum values`,
      `Concurrency: Multiple simultaneous requests`
    ];
  }

  private generateUserStories(requirements: Requirement[]): UserStory[] {
    const stories: UserStory[] = [];

    for (const req of requirements) {
      stories.push({
        id: `US-${stories.length + 1}`,
        as_a: 'user',
        i_want: req.description.toLowerCase(),
        so_that: 'I can achieve my goal',
        acceptance_criteria: req.acceptance_criteria,
        priority: this.priorityToNumber(req.priority)
      });
    }

    return stories;
  }

  private generateUseCases(requirements: Requirement[]): UseCase[] {
    const useCases: UseCase[] = [];

    for (const req of requirements) {
      useCases.push({
        id: `UC-${useCases.length + 1}`,
        name: req.description,
        actor: 'User',
        preconditions: ['System is available', 'User is authenticated'],
        main_flow: [
          'User initiates action',
          'System validates request',
          'System processes request',
          'System returns result',
          'User receives confirmation'
        ],
        alternative_flows: [
          ['User provides invalid input', 'System shows error', 'User corrects input']
        ],
        postconditions: ['Action completed successfully', 'State updated'],
        exceptions: ['Network failure', 'Invalid permissions']
      });
    }

    return useCases;
  }

  private priorityToNumber(priority: string): number {
    switch (priority) {
      case 'must-have': return 1;
      case 'should-have': return 2;
      case 'could-have': return 3;
      case 'won\'t-have': return 4;
      default: return 2;
    }
  }

  private async defineTechnicalSpecification(spec: Partial<Specification>): Promise<void> {
    console.log('\n🔧 Defining technical specification...');

    if (!spec.data_model) {
      spec.data_model = await this.defineDataModel(spec);
    }

    if (!spec.api_specification) {
      spec.api_specification = await this.defineAPISpecification(spec);
    }

    if (!spec.testing_strategy) {
      spec.testing_strategy = this.defineTestingStrategy();
    }

    if (!spec.deployment_strategy) {
      spec.deployment_strategy = this.defineDeploymentStrategy();
    }

    this.updateConfidence(15);
  }

  private async defineDataModel(spec: Partial<Specification>): Promise<DataModel> {
    const dataModel: DataModel = {
      entities: [],
      relationships: [],
      data_flow: 'Data flows from user input through validation, processing, and storage layers'
    };

    // Create basic entities from requirements
    const entitySet = new Set<string>();
    for (const req of spec.functional_requirements || []) {
      const nouns = req.description.match(/\b[A-Z][a-z]+\b/g) || [];
      nouns.forEach(noun => entitySet.add(noun));
    }

    for (const entityName of Array.from(entitySet).slice(0, 5)) {
      dataModel.entities.push({
        name: entityName,
        attributes: [
          { name: 'id', type: 'uuid', required: true, unique: true },
          { name: 'created_at', type: 'datetime', required: true },
          { name: 'updated_at', type: 'datetime', required: true },
          { name: 'status', type: 'string', required: true }
        ],
        constraints: ['Primary key on id', 'Index on created_at']
      });
    }

    return dataModel;
  }

  private async defineAPISpecification(spec: Partial<Specification>): Promise<APISpecification> {
    return {
      base_url: '/api/v1',
      version: '1.0.0',
      authentication: 'Bearer token',
      endpoints: this.generateEndpoints(spec)
    };
  }

  private generateEndpoints(spec: Partial<Specification>): Endpoint[] {
    const endpoints: Endpoint[] = [];

    // Generate basic CRUD endpoints for entities
    if (spec.data_model) {
      for (const entity of spec.data_model.entities.slice(0, 3)) {
        const basePath = `/${entity.name.toLowerCase()}s`;

        endpoints.push({
          path: basePath,
          method: 'GET',
          description: `List all ${entity.name}s`,
          error_codes: [
            { code: 401, message: 'Unauthorized', description: 'Missing or invalid token' },
            { code: 500, message: 'Server Error', description: 'Internal server error' }
          ]
        });

        endpoints.push({
          path: basePath,
          method: 'POST',
          description: `Create a new ${entity.name}`,
          error_codes: [
            { code: 400, message: 'Bad Request', description: 'Invalid input' },
            { code: 401, message: 'Unauthorized', description: 'Missing or invalid token' }
          ]
        });
      }
    }

    return endpoints;
  }

  private defineTestingStrategy(): TestingStrategy {
    return {
      approach: 'TDD with comprehensive coverage',
      test_levels: [
        {
          level: 'unit',
          scope: 'Individual functions and methods',
          responsibility: 'Developers',
          tools: ['Jest', 'Vitest']
        },
        {
          level: 'integration',
          scope: 'Module interactions',
          responsibility: 'Developers',
          tools: ['Jest', 'Supertest']
        },
        {
          level: 'system',
          scope: 'End-to-end flows',
          responsibility: 'QA Team',
          tools: ['Playwright', 'Cypress']
        },
        {
          level: 'acceptance',
          scope: 'Business requirements',
          responsibility: 'Product Owner',
          tools: ['Manual testing', 'User feedback']
        }
      ],
      tools: ['Jest', 'Playwright', 'Cypress'],
      coverage_targets: [
        { metric: 'Line coverage', target: 80, rationale: 'Minimum acceptable coverage' },
        { metric: 'Branch coverage', target: 75, rationale: 'Ensure all paths tested' },
        { metric: 'Function coverage', target: 90, rationale: 'All functions must be tested' }
      ]
    };
  }

  private defineDeploymentStrategy(): DeploymentStrategy {
    return {
      approach: 'Progressive rollout with monitoring',
      environments: [
        {
          name: 'Development',
          purpose: 'Active development and testing',
          infrastructure: 'Local/Docker',
          configuration: 'Development config'
        },
        {
          name: 'Staging',
          purpose: 'Pre-production validation',
          infrastructure: 'Cloud (scaled down)',
          configuration: 'Production-like config'
        },
        {
          name: 'Production',
          purpose: 'Live environment',
          infrastructure: 'Cloud (auto-scaling)',
          configuration: 'Production config'
        }
      ],
      rollout_plan: 'Canary deployment with 10% -> 50% -> 100% rollout',
      rollback_plan: 'Automated rollback on error threshold',
      monitoring: ['Application logs', 'Performance metrics', 'Error tracking', 'User analytics']
    };
  }

  private async validateTestability(spec: Partial<Specification>): Promise<void> {
    console.log('\n✅ Validating testability...');

    // Ensure all requirements have acceptance criteria
    for (const req of spec.functional_requirements || []) {
      if (req.acceptance_criteria.length === 0) {
        req.acceptance_criteria = this.generateAcceptanceCriteria(req);
      }
    }

    this.updateConfidence(10);
  }

  private async identifyEdgeCases(spec: Partial<Specification>): Promise<void> {
    console.log('\n🔍 Identifying edge cases...');

    // Add common edge cases to requirements
    const commonEdgeCases = [
      'Empty input',
      'Maximum size input',
      'Special characters',
      'Concurrent access',
      'Network failure',
      'Timeout scenarios'
    ];

    for (const req of spec.functional_requirements || []) {
      if (req.edge_cases.length === 0) {
        req.edge_cases = commonEdgeCases.slice(0, 3);
      }
    }

    this.updateConfidence(10);
  }

  private async finalReview(spec: Partial<Specification>): Promise<void> {
    console.log('\n📊 Performing final review...');

    // Ensure all required fields are present
    spec.assumptions = spec.assumptions || ['System will have reliable network connectivity', 'Users have modern browsers'];
    spec.constraints = spec.constraints || ['Must work with existing infrastructure', 'Budget limitations apply'];

    // Set final confidence
    spec.confidence = this.currentConfidence;

    this.updateConfidence(10);
  }

  private async generateSRSDocument(spec: Specification): Promise<void> {
    console.log('\n📄 Generating SRS document...');

    await fs.ensureDir(this.OUTPUT_DIR);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${timestamp}-${spec.title.toLowerCase().replace(/\s+/g, '-')}-srs.md`;
    const filepath = path.join(this.OUTPUT_DIR, filename);

    const content = this.formatSRSMarkdown(spec);
    await fs.writeFile(filepath, content);

    console.log(`💾 SRS saved to: ${filepath}`);
  }

  private formatSRSMarkdown(spec: Specification): string {
    return `# Software Requirements Specification
## ${spec.title}
Version: ${spec.version}
Generated: ${spec.created.toISOString()}
Confidence: ${spec.confidence}%
Status: ${spec.status}

---

## Executive Summary
${spec.executive_summary}

## Problem Statement
${spec.problem_statement}

## Solution Overview
${spec.solution_overview}

## Stakeholders
${spec.stakeholders.map(s => `- **${s.name}** (${s.role}): ${s.responsibilities.join(', ')}`).join('\n')}

## Assumptions
${spec.assumptions.map(a => `- ${a}`).join('\n')}

## Constraints
${spec.constraints.map(c => `- ${c}`).join('\n')}

## Functional Requirements
${spec.functional_requirements.map(r => `
### ${r.id}: ${r.description}
**Priority**: ${r.priority}
**Confidence**: ${r.confidence}%

**Acceptance Criteria**:
${r.acceptance_criteria.map(ac => `- ${ac}`).join('\n')}

**Test Scenarios**:
${r.test_scenarios.map(ts => `- ${ts}`).join('\n')}

**Edge Cases**:
${r.edge_cases.map(ec => `- ${ec}`).join('\n')}
`).join('\n')}

## Non-Functional Requirements
${spec.non_functional_requirements.map(r => `
### ${r.id}: ${r.description}
**Priority**: ${r.priority}
**Confidence**: ${r.confidence}%
`).join('\n')}

## User Stories
${spec.user_stories.map(s => `
### ${s.id}
As a ${s.as_a}, I want ${s.i_want}, so that ${s.so_that}

**Priority**: ${s.priority}
**Acceptance Criteria**:
${s.acceptance_criteria.map(ac => `- ${ac}`).join('\n')}
`).join('\n')}

## Technical Architecture
${spec.technical_architecture.overview}

## Testing Strategy
${spec.testing_strategy.approach}

**Test Levels**:
${spec.testing_strategy.test_levels.map(tl => `- **${tl.level}**: ${tl.scope}`).join('\n')}

**Coverage Targets**:
${spec.testing_strategy.coverage_targets.map(ct => `- ${ct.metric}: ${ct.target}%`).join('\n')}

## Deployment Strategy
${spec.deployment_strategy.approach}

**Environments**:
${spec.deployment_strategy.environments.map(e => `- **${e.name}**: ${e.purpose}`).join('\n')}

## Success Metrics
${spec.success_metrics.map(m => `- **${m.metric}**: ${m.target}`).join('\n')}

## Risks
${spec.risks.map(r => `
### ${r.id}: ${r.description}
- **Probability**: ${r.probability}
- **Impact**: ${r.impact}
- **Mitigation**: ${r.mitigation}
`).join('\n')}

---
*Generated by Nexus Enhanced Workflow - Total Questions Asked: ${spec.total_questions}*
`;
  }

  private parseStakeholders(userList: string): Stakeholder[] {
    const users = userList.split(',').map(u => u.trim());
    return users.map(user => ({
      name: user,
      role: 'User',
      responsibilities: ['Use the system', 'Provide feedback'],
      contact: ''
    }));
  }

  private updateConfidence(boost: number): void {
    this.currentConfidence = Math.min(100, this.currentConfidence + boost);
  }
}
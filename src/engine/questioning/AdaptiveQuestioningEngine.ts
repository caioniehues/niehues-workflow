import { ContextInheritance, InheritedContext } from '../context/ContextInheritance';

export interface QuestioningSession {
  session_id: string;
  task_context: TaskContext;
  current_phase: QuestioningPhase;
  confidence_score: number;
  target_confidence: number;
  questions_asked: Question[];
  answers_received: Answer[];
  identified_gaps: RequirementGap[];
  edge_cases: EdgeCase[];
  session_start: Date;
  session_duration: number;
  status: 'active' | 'completed' | 'paused' | 'timeout';
}

export interface TaskContext {
  task_id: string;
  task_description: string;
  initial_requirements: string[];
  domain: string;
  complexity_level: 'simple' | 'medium' | 'complex';
  stakeholders: string[];
  existing_context?: InheritedContext;
  business_context?: BusinessContext;
  technical_context?: TechnicalContext;
}

export interface BusinessContext {
  business_domain: string;
  user_personas: UserPersona[];
  business_rules: string[];
  compliance_requirements: string[];
  success_metrics: string[];
}

export interface UserPersona {
  name: string;
  role: string;
  goals: string[];
  pain_points: string[];
  technical_proficiency: 'low' | 'medium' | 'high';
}

export interface TechnicalContext {
  existing_systems: string[];
  technology_stack: string[];
  performance_requirements: string[];
  scalability_requirements: string[];
  integration_points: string[];
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  category: QuestionCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string;
  expected_answer_type: 'text' | 'choice' | 'boolean' | 'numeric' | 'structured';
  follow_up_triggers: FollowUpTrigger[];
  gap_addresses: string[];
  timestamp: Date;
  phase: QuestioningPhase;
}

export type QuestionType =
  | 'clarification'
  | 'exploration'
  | 'validation'
  | 'edge_case'
  | 'constraint'
  | 'assumption'
  | 'integration'
  | 'performance'
  | 'security'
  | 'usability'
  | 'business_rule'
  | 'workflow'
  | 'error_handling';

export type QuestionCategory =
  | 'functional'
  | 'non_functional'
  | 'technical'
  | 'business'
  | 'user_experience'
  | 'integration'
  | 'compliance'
  | 'testing'
  | 'deployment'
  | 'maintenance';

export type QuestioningPhase = 'triage' | 'exploration' | 'validation' | 'refinement' | 'completion';

export interface Answer {
  question_id: string;
  answer_text: string;
  answer_data?: any;
  confidence_level: number; // 0-100
  timestamp: Date;
  follow_up_questions_generated: string[];
  clarifications_needed: string[];
  assumptions_identified: string[];
}

export interface RequirementGap {
  id: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  questions_needed: string[];
  potential_impact: string;
  discovered_in_phase: QuestioningPhase;
}

export interface EdgeCase {
  id: string;
  scenario: string;
  trigger_conditions: string[];
  expected_behavior: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  testing_strategy: string;
  questions_generated: string[];
}

export interface FollowUpTrigger {
  condition: string;
  operator: 'contains' | 'equals' | 'not_equals' | 'greater_than' | 'less_than';
  value: any;
  follow_up_questions: string[];
}

export interface ConfidenceAnalysis {
  overall_confidence: number;
  category_confidence: Record<QuestionCategory, number>;
  gap_analysis: {
    critical_gaps: RequirementGap[];
    medium_gaps: RequirementGap[];
    low_gaps: RequirementGap[];
  };
  readiness_assessment: {
    ready_for_implementation: boolean;
    blocking_issues: string[];
    recommended_actions: string[];
  };
}

export class AdaptiveQuestioningEngine {
  private readonly TRIAGE_QUESTION_COUNT = 5;
  private readonly DEFAULT_TARGET_CONFIDENCE = 85;
  private readonly MAX_SESSION_DURATION_HOURS = 8;
  private readonly CONFIDENCE_IMPROVEMENT_THRESHOLD = 2; // Minimum improvement per round

  private contextInheritance: ContextInheritance;
  private questionGenerators: Map<QuestionType, QuestionGenerator>;
  private confidenceCalculator: ConfidenceCalculator;
  private gapDetector: GapDetector;
  private edgeCaseDetector: EdgeCaseDetector;

  constructor() {
    this.contextInheritance = new ContextInheritance();
    this.initializeQuestionGenerators();
    this.confidenceCalculator = new ConfidenceCalculator();
    this.gapDetector = new GapDetector();
    this.edgeCaseDetector = new EdgeCaseDetector();
  }

  async startQuestioningSession(
    taskContext: TaskContext,
    targetConfidence: number = this.DEFAULT_TARGET_CONFIDENCE
  ): Promise<QuestioningSession> {
    console.log('🤔 Starting adaptive questioning session...');
    console.log(`  📋 Task: ${taskContext.task_description}`);
    console.log(`  🎯 Target confidence: ${targetConfidence}%`);

    const sessionId = this.generateSessionId();
    const session: QuestioningSession = {
      session_id: sessionId,
      task_context: taskContext,
      current_phase: 'triage',
      confidence_score: 0,
      target_confidence: targetConfidence,
      questions_asked: [],
      answers_received: [],
      identified_gaps: [],
      edge_cases: [],
      session_start: new Date(),
      session_duration: 0,
      status: 'active'
    };

    // Phase 1: Initial confidence assessment
    const initialConfidence = await this.calculateInitialConfidence(taskContext);
    session.confidence_score = initialConfidence;

    console.log(`  📊 Initial confidence: ${initialConfidence.toFixed(1)}%`);

    if (initialConfidence >= targetConfidence) {
      console.log(`  ✅ Target confidence already achieved!`);
      session.current_phase = 'completion';
      session.status = 'completed';
      return session;
    }

    // Phase 2: Generate triage questions
    const triageQuestions = await this.generateTriageQuestions(taskContext);
    session.questions_asked.push(...triageQuestions);

    console.log(`  🔍 Generated ${triageQuestions.length} triage questions`);
    console.log(`  📅 Session ${sessionId} ready for interaction`);

    return session;
  }

  async processAnswer(
    session: QuestioningSession,
    questionId: string,
    answerText: string,
    answerData?: any
  ): Promise<QuestioningSession> {
    console.log(`💬 Processing answer for question: ${questionId}`);

    const question = session.questions_asked.find(q => q.id === questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }

    // Create answer record
    const answer: Answer = {
      question_id: questionId,
      answer_text: answerText,
      answer_data: answerData,
      confidence_level: this.assessAnswerConfidence(answerText, question),
      timestamp: new Date(),
      follow_up_questions_generated: [],
      clarifications_needed: [],
      assumptions_identified: []
    };

    // Process answer for insights
    answer.assumptions_identified = this.extractAssumptions(answerText);
    answer.clarifications_needed = this.identifyClarificationsNeeded(answerText, question);

    session.answers_received.push(answer);

    // Generate follow-up questions based on answer
    const followUpQuestions = await this.generateFollowUpQuestions(question, answer, session);
    answer.follow_up_questions_generated = followUpQuestions.map(q => q.id);
    session.questions_asked.push(...followUpQuestions);

    // Update gaps and edge cases
    await this.updateGapsAndEdgeCases(session, answer);

    // Recalculate confidence
    const previousConfidence = session.confidence_score;
    session.confidence_score = await this.calculateCurrentConfidence(session);
    const confidenceImprovement = session.confidence_score - previousConfidence;

    console.log(`  📈 Confidence: ${previousConfidence.toFixed(1)}% → ${session.confidence_score.toFixed(1)}% (+${confidenceImprovement.toFixed(1)}%)`);

    // Check if we should advance to next phase
    await this.checkPhaseTransition(session);

    // Generate next round of questions if needed
    if (session.confidence_score < session.target_confidence && session.status === 'active') {
      const nextQuestions = await this.generateNextRoundQuestions(session);
      session.questions_asked.push(...nextQuestions);
      console.log(`  🔄 Generated ${nextQuestions.length} additional questions`);
    }

    // Check for completion
    if (session.confidence_score >= session.target_confidence) {
      console.log(`  🎉 Target confidence achieved! Session complete.`);
      session.current_phase = 'completion';
      session.status = 'completed';
    }

    // Update session duration
    session.session_duration = Date.now() - session.session_start.getTime();

    return session;
  }

  async generateTriageQuestions(taskContext: TaskContext): Promise<Question[]> {
    console.log('  🎯 Generating triage questions...');

    const questions: Question[] = [];
    const priorityCategories = this.identifyPriorityCategories(taskContext);

    // Generate high-impact questions across key categories
    for (const category of priorityCategories.slice(0, this.TRIAGE_QUESTION_COUNT)) {
      const generator = this.questionGenerators.get(category.question_type);
      if (generator) {
        const question = await generator.generateQuestion(taskContext, category.focus_area);
        question.phase = 'triage';
        question.priority = 'high';
        questions.push(question);
      }
    }

    // Ensure we have exactly TRIAGE_QUESTION_COUNT questions
    while (questions.length < this.TRIAGE_QUESTION_COUNT) {
      const fallbackQuestion = await this.generateFallbackQuestion(taskContext, questions.length);
      questions.push(fallbackQuestion);
    }

    return questions;
  }

  async generateFollowUpQuestions(
    originalQuestion: Question,
    answer: Answer,
    session: QuestioningSession
  ): Promise<Question[]> {
    const followUps: Question[] = [];

    // Check trigger conditions
    for (const trigger of originalQuestion.follow_up_triggers) {
      if (this.evaluateTriggerCondition(trigger, answer)) {
        for (const questionText of trigger.follow_up_questions) {
          const followUp = await this.createFollowUpQuestion(
            questionText,
            originalQuestion,
            answer,
            session
          );
          followUps.push(followUp);
        }
      }
    }

    // Generate questions based on identified gaps
    const gapQuestions = await this.generateGapBasedQuestions(answer, session);
    followUps.push(...gapQuestions);

    // Generate clarification questions
    const clarificationQuestions = await this.generateClarificationQuestions(answer, session);
    followUps.push(...clarificationQuestions);

    return followUps;
  }

  async generateNextRoundQuestions(session: QuestioningSession): Promise<Question[]> {
    console.log(`  🔍 Generating next round questions (phase: ${session.current_phase})`);

    const questions: Question[] = [];

    // Identify highest priority gaps
    const criticalGaps = session.identified_gaps.filter(gap => gap.severity === 'critical');
    const highGaps = session.identified_gaps.filter(gap => gap.severity === 'high');

    // Generate questions for critical gaps first
    for (const gap of criticalGaps.slice(0, 3)) {
      const gapQuestions = await this.generateQuestionsForGap(gap, session);
      questions.push(...gapQuestions);
    }

    // Generate questions for high priority gaps
    for (const gap of highGaps.slice(0, 2)) {
      const gapQuestions = await this.generateQuestionsForGap(gap, session);
      questions.push(...gapQuestions);
    }

    // Generate edge case exploration questions
    const edgeCaseQuestions = await this.generateEdgeCaseQuestions(session);
    questions.push(...edgeCaseQuestions);

    // Phase-specific question generation
    const phaseQuestions = await this.generatePhaseSpecificQuestions(session);
    questions.push(...phaseQuestions);

    return questions.slice(0, 10); // Limit to reasonable batch size
  }

  async analyzeSessionConfidence(session: QuestioningSession): Promise<ConfidenceAnalysis> {
    const analysis: ConfidenceAnalysis = {
      overall_confidence: session.confidence_score,
      category_confidence: {},
      gap_analysis: {
        critical_gaps: session.identified_gaps.filter(g => g.severity === 'critical'),
        medium_gaps: session.identified_gaps.filter(g => g.severity === 'medium'),
        low_gaps: session.identified_gaps.filter(g => g.severity === 'low')
      },
      readiness_assessment: {
        ready_for_implementation: false,
        blocking_issues: [],
        recommended_actions: []
      }
    };

    // Calculate confidence per category
    for (const category of Object.values(QuestionCategory)) {
      analysis.category_confidence[category] = await this.calculateCategoryConfidence(
        session,
        category
      );
    }

    // Assess readiness for implementation
    analysis.readiness_assessment = await this.assessImplementationReadiness(session);

    return analysis;
  }

  private async calculateInitialConfidence(taskContext: TaskContext): Promise<number> {
    const factors = {
      requirement_clarity: this.assessRequirementClarity(taskContext.initial_requirements),
      domain_familiarity: this.assessDomainFamiliarity(taskContext.domain),
      context_availability: taskContext.existing_context ? 0.3 : 0.0,
      stakeholder_definition: taskContext.stakeholders.length > 0 ? 0.2 : 0.0,
      business_context: taskContext.business_context ? 0.15 : 0.0
    };

    const totalConfidence = Object.values(factors).reduce((sum, factor) => sum + factor, 0);
    return Math.min(totalConfidence * 100, 100);
  }

  private async calculateCurrentConfidence(session: QuestioningSession): Promise<number> {
    return await this.confidenceCalculator.calculateConfidence(session);
  }

  private async checkPhaseTransition(session: QuestioningSession): Promise<void> {
    const currentPhase = session.current_phase;

    switch (currentPhase) {
      case 'triage':
        if (session.answers_received.length >= this.TRIAGE_QUESTION_COUNT) {
          session.current_phase = 'exploration';
          console.log('  ➡️ Transitioning to exploration phase');
        }
        break;

      case 'exploration':
        if (session.confidence_score > 60 || session.answers_received.length > 20) {
          session.current_phase = 'validation';
          console.log('  ➡️ Transitioning to validation phase');
        }
        break;

      case 'validation':
        if (session.confidence_score > 75 || this.hasMinimalGaps(session)) {
          session.current_phase = 'refinement';
          console.log('  ➡️ Transitioning to refinement phase');
        }
        break;

      case 'refinement':
        if (session.confidence_score >= session.target_confidence) {
          session.current_phase = 'completion';
          session.status = 'completed';
          console.log('  ✅ Session completed successfully');
        }
        break;
    }
  }

  private initializeQuestionGenerators(): void {
    this.questionGenerators = new Map([
      ['clarification', new ClarificationQuestionGenerator()],
      ['exploration', new ExplorationQuestionGenerator()],
      ['validation', new ValidationQuestionGenerator()],
      ['edge_case', new EdgeCaseQuestionGenerator()],
      ['constraint', new ConstraintQuestionGenerator()],
      ['assumption', new AssumptionQuestionGenerator()],
      ['integration', new IntegrationQuestionGenerator()],
      ['performance', new PerformanceQuestionGenerator()],
      ['security', new SecurityQuestionGenerator()],
      ['usability', new UsabilityQuestionGenerator()],
      ['business_rule', new BusinessRuleQuestionGenerator()],
      ['workflow', new WorkflowQuestionGenerator()],
      ['error_handling', new ErrorHandlingQuestionGenerator()]
    ]);
  }

  private generateSessionId(): string {
    return `qs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private identifyPriorityCategories(taskContext: TaskContext): Array<{question_type: QuestionType, focus_area: string}> {
    const categories = [];

    // Always start with functional clarification
    categories.push({ question_type: 'clarification' as QuestionType, focus_area: 'core_functionality' });

    // Add domain-specific priorities
    if (taskContext.domain.includes('api')) {
      categories.push({ question_type: 'integration' as QuestionType, focus_area: 'api_design' });
    }

    if (taskContext.complexity_level === 'complex') {
      categories.push({ question_type: 'constraint' as QuestionType, focus_area: 'complexity_management' });
    }

    // Add business context if available
    if (taskContext.business_context) {
      categories.push({ question_type: 'business_rule' as QuestionType, focus_area: 'business_logic' });
    }

    // Always include edge cases
    categories.push({ question_type: 'edge_case' as QuestionType, focus_area: 'error_scenarios' });

    return categories;
  }

  // Additional helper methods would be implemented here...
  // (Implementation details abbreviated for length)
}

// Abstract base class for question generators
abstract class QuestionGenerator {
  abstract generateQuestion(taskContext: TaskContext, focusArea: string): Promise<Question>;
}

// Example concrete question generator
class ClarificationQuestionGenerator extends QuestionGenerator {
  async generateQuestion(taskContext: TaskContext, focusArea: string): Promise<Question> {
    const questionText = this.generateClarificationText(taskContext, focusArea);

    return {
      id: `clarification_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      text: questionText,
      type: 'clarification',
      category: 'functional',
      priority: 'high',
      reasoning: `Clarification needed for ${focusArea} to establish baseline understanding`,
      expected_answer_type: 'text',
      follow_up_triggers: [
        {
          condition: 'mentions_multiple_options',
          operator: 'contains',
          value: ['or', 'either', 'maybe'],
          follow_up_questions: ['Which option would you prefer and why?']
        }
      ],
      gap_addresses: [focusArea],
      timestamp: new Date(),
      phase: 'triage'
    };
  }

  private generateClarificationText(taskContext: TaskContext, focusArea: string): string {
    // Implementation would generate appropriate clarification questions
    // based on task context and focus area
    return `Can you clarify the specific requirements for ${focusArea} in the context of ${taskContext.task_description}?`;
  }
}

// Confidence calculator class
class ConfidenceCalculator {
  async calculateConfidence(session: QuestioningSession): Promise<number> {
    // Implementation would calculate confidence based on:
    // - Answer completeness
    // - Gap coverage
    // - Edge case identification
    // - Validation responses
    return Math.min(100, session.answers_received.length * 5 + 30);
  }
}

// Gap detector class
class GapDetector {
  detectGaps(session: QuestioningSession): RequirementGap[] {
    // Implementation would analyze answers to identify gaps
    return [];
  }
}

// Edge case detector class
class EdgeCaseDetector {
  detectEdgeCases(session: QuestioningSession): EdgeCase[] {
    // Implementation would identify edge cases from answers
    return [];
  }
}
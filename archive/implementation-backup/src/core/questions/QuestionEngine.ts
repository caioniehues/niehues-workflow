/**
 * Question Engine Implementation
 *
 * Manages adaptive questioning using templates, confidence calculation,
 * and intelligent follow-up generation to ensure complete understanding
 * before proceeding through workflow phases.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseManager } from '../database/DatabaseManager.js';
import { ConfidenceCalculator } from './ConfidenceCalculator.js';
import type {
  IQuestionEngine,
  Question,
  QuestionCategory,
  QuestionPriority,
  Answer,
  QuestionContext,
  QuestioningResult,
  QuestioningStats,
  QuestionTemplate,
  QuestionEngineConfig,
} from './IQuestionEngine.js';
import type { WorkflowPhase } from '../context/IContextManager.js';

/**
 * Template data structure from questions.json
 */
interface TemplateData {
  templates: QuestionTemplate[];
  followUpRules: {
    maxDepth: number;
    conditions: Record<string, {
      triggers: string[];
      action: string;
    }>;
  };
  phaseTransitions: Record<WorkflowPhase, {
    minQuestions: number;
    minCoverage: Record<QuestionCategory, number>;
    targetConfidence: number;
  }>;
  adaptiveRules: {
    increasePriorityOn: Record<string, QuestionCategory[]>;
    skipIfAnswered: {
      similarQuestions: boolean;
      coveredInFollowUp: boolean;
    };
    repeatIfAmbiguous: {
      maxAttempts: number;
      escalateTo: QuestionCategory;
    };
  };
}

export class QuestionEngine implements IQuestionEngine {
  private db: DatabaseManager | null = null;
  private confidenceCalculator: ConfidenceCalculator;
  private templates: Map<string, QuestionTemplate> = new Map();
  private templateData: TemplateData | null = null;
  private sessionId: string | null = null;
  private projectPath: string | null = null;
  private config: QuestionEngineConfig;

  // Track asked questions to avoid repetition
  private askedQuestionIds = new Set<string>();
  private questionAnswerMap = new Map<string, Answer>();
  private followUpDepth = new Map<string, number>();
  private currentPhase: WorkflowPhase = 'brainstorm';

  constructor(config: QuestionEngineConfig = {}) {
    this.config = {
      defaultTargetConfidence: 0.85,
      maxQuestionsPerSession: 100,
      enableAdaptivePriority: true,
      persistQuestions: true,
      ...config,
    };

    this.confidenceCalculator = new ConfidenceCalculator({
      targetConfidence: this.config.defaultTargetConfidence,
    });
  }

  /**
   * Initialize the question engine with a session
   */
  async initialize(sessionId: string, projectPath: string): Promise<void> {
    this.sessionId = sessionId;
    this.projectPath = projectPath;

    // Initialize database
    if (this.config.persistQuestions) {
      this.db = new DatabaseManager(projectPath);
    }

    // Load templates
    await this.loadTemplates(this.config.templatesPath);

    // Load existing session data if available
    if (this.db) {
      await this.loadSessionData(sessionId);
    }
  }

  /**
   * Generate the next adaptive question based on context
   */
  async generateNextQuestion(context: QuestionContext): Promise<Question | null> {
    // Check if we've reached max questions
    if (this.askedQuestionIds.size >= (this.config.maxQuestionsPerSession || 100)) {
      return null;
    }

    // Update current phase
    this.currentPhase = context.phase;

    // Check if confidence threshold is met
    const currentConfidence = await this.calculateConfidence(context.previousAnswers);
    if (!this.shouldContinueQuestioning(currentConfidence, context.targetConfidence)) {
      return null;
    }

    // Get phase requirements
    const phaseReqs = this.templateData?.phaseTransitions[context.phase];
    if (!phaseReqs) {
      throw new Error(`No phase requirements for ${context.phase}`);
    }

    // Check coverage requirements
    const coverageGaps = this.findCoverageGaps(context);

    // Prioritize templates based on gaps and context
    const prioritizedTemplates = this.prioritizeTemplates(context, coverageGaps);

    // Select next question from prioritized templates
    for (const template of prioritizedTemplates) {
      if (!this.askedQuestionIds.has(template.id)) {
        const question = this.createQuestionFromTemplate(template, context);
        this.askedQuestionIds.add(template.id);

        if (this.db && this.config.persistQuestions) {
          await this.storeQuestion(question);
        }

        return question;
      }
    }

    // If all templates exhausted but confidence not met, generate clarification
    if (currentConfidence < (context.targetConfidence || this.config.defaultTargetConfidence!)) {
      return this.generateGenericClarification(context);
    }

    return null;
  }

  /**
   * Process an answer and update confidence
   */
  async processAnswer(answer: Answer): Promise<number> {
    // Store answer
    this.questionAnswerMap.set(answer.questionId, answer);

    if (this.db && this.config.persistQuestions) {
      await this.storeAnswer(answer);
    }

    // Detect ambiguity
    if (this.detectAmbiguity(answer.answer)) {
      // Reduce confidence for ambiguous answers
      answer.confidence = Math.max(0, answer.confidence - 0.2);
    }

    // Calculate updated confidence
    const allAnswers = Array.from(this.questionAnswerMap.values());
    return this.calculateConfidence(allAnswers);
  }

  /**
   * Calculate overall confidence from all answers
   */
  async calculateConfidence(answers: Answer[]): Promise<number> {
    if (answers.length === 0) return 0;

    // Get questions for context
    const questions = await this.getQuestionsForAnswers(answers);

    const result = this.confidenceCalculator.calculate(answers, questions);
    return result.overall;
  }

  /**
   * Determine if questioning should continue
   */
  shouldContinueQuestioning(
    confidence: number,
    targetConfidence?: number
  ): boolean {
    const target = targetConfidence || this.config.defaultTargetConfidence || 0.85;

    // Check minimum questions for phase
    const phaseReqs = this.templateData?.phaseTransitions[this.currentPhase];
    if (phaseReqs && this.askedQuestionIds.size < phaseReqs.minQuestions) {
      return true; // Haven't asked minimum questions yet
    }

    return confidence < target;
  }

  /**
   * Generate multiple diverse questions for a topic
   */
  async generateQuestions(
    topic: string,
    phase: WorkflowPhase,
    count: number = 5
  ): Promise<Question[]> {
    const questions: Question[] = [];
    const context: QuestionContext = {
      phase,
      topic,
      previousAnswers: [],
      targetConfidence: this.config.defaultTargetConfidence || 0.85,
    };

    // Get templates for this phase
    const phaseTemplates = Array.from(this.templates.values())
      .filter(t => t.phase.includes(phase));

    // Sort by priority and category diversity
    const categoriesUsed = new Set<QuestionCategory>();
    const priorityOrder: QuestionPriority[] = ['critical', 'high', 'medium', 'low'];

    for (const priority of priorityOrder) {
      const priorityTemplates = phaseTemplates
        .filter(t => t.priority === priority)
        .filter(t => !categoriesUsed.has(t.category));

      for (const template of priorityTemplates) {
        if (questions.length >= count) break;

        const question = this.createQuestionFromTemplate(template, context);
        questions.push(question);
        categoriesUsed.add(template.category);
      }

      if (questions.length >= count) break;
    }

    return questions;
  }

  /**
   * Get follow-up questions based on an answer
   */
  async getFollowUpQuestions(answer: Answer): Promise<Question[]> {
    const followUps: Question[] = [];

    // Find the original question's template
    const originalTemplate = this.findTemplateByQuestionId(answer.questionId);
    if (!originalTemplate || !originalTemplate.followUps) {
      return followUps;
    }

    // Check follow-up depth
    const depth = this.followUpDepth.get(answer.questionId) || 0;
    const maxDepth = this.templateData?.followUpRules.maxDepth || 3;

    if (depth >= maxDepth) {
      return followUps;
    }

    // Determine which follow-ups to use based on answer characteristics
    const triggeredFollowUps = this.determineFollowUps(answer, originalTemplate);

    for (const followUpId of triggeredFollowUps) {
      const template = this.templates.get(followUpId);
      if (template && !this.askedQuestionIds.has(template.id)) {
        const question = this.createQuestionFromTemplate(template, {
          phase: this.currentPhase,
          topic: this.extractTopicFromAnswer(answer),
          previousAnswers: [answer],
          targetConfidence: this.config.defaultTargetConfidence || 0.85,
        });

        question.followUpTo = answer.questionId;
        this.followUpDepth.set(question.id, depth + 1);
        followUps.push(question);
      }
    }

    return followUps;
  }

  /**
   * Store a question-answer pair in the database
   */
  async storeQuestionAnswer(question: Question, answer: Answer): Promise<void> {
    if (!this.db || !this.sessionId) return;

    await this.storeQuestion(question);
    await this.storeAnswer(answer);
  }

  /**
   * Retrieve questions and answers for a session
   */
  async getSessionQuestions(sessionId: string): Promise<{
    question: Question;
    answer?: Answer;
  }[]> {
    if (!this.db) return [];

    const questions = this.db.getQuestions(sessionId);
    const result: { question: Question; answer?: Answer }[] = [];

    for (const q of questions) {
      const question: Question = {
        id: q.id,
        phase: q.phase as WorkflowPhase,
        question: q.question,
        category: 'requirements', // Would need to store this
        priority: 'medium', // Would need to store this
      };

      let answer: Answer | undefined;
      if (q.answer) {
        answer = {
          questionId: q.id,
          answer: q.answer,
          confidence: q.confidence || 0,
          timestamp: new Date(q.timestamp),
        };
      }

      result.push({ question, answer });
    }

    return result;
  }

  /**
   * Get statistics about questioning effectiveness
   */
  async getStats(): Promise<QuestioningStats> {
    const questionsPerPhase: Record<WorkflowPhase, number> = {
      init: 0,
      brainstorm: 0,
      specify: 0,
      decompose: 0,
      implement: 0,
    };

    const categoryFrequency = new Map<QuestionCategory, number>();

    for (const templateId of this.askedQuestionIds) {
      const template = this.templates.get(templateId);
      if (template) {
        for (const phase of template.phase) {
          questionsPerPhase[phase]++;
        }
        categoryFrequency.set(
          template.category,
          (categoryFrequency.get(template.category) || 0) + 1
        );
      }
    }

    // Calculate average confidence gain
    const answers = Array.from(this.questionAnswerMap.values());
    let avgConfidenceGain = 0;
    if (answers.length > 1) {
      const firstConfidence = answers[0].confidence;
      const lastConfidence = answers[answers.length - 1].confidence;
      avgConfidenceGain = (lastConfidence - firstConfidence) / answers.length;
    }

    // Find most effective categories
    const sortedCategories = Array.from(categoryFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    return {
      totalQuestions: this.askedQuestionIds.size,
      questionsPerPhase,
      averageConfidenceGain: avgConfidenceGain,
      mostEffectiveCategories: sortedCategories.slice(0, 3),
      convergenceRate: avgConfidenceGain * answers.length, // Simplified metric
    };
  }

  /**
   * Load question templates from templates file
   */
  async loadTemplates(templatePath?: string): Promise<void> {
    const path = templatePath || join(this.projectPath || '.', 'src', 'templates', 'questions.json');

    if (!existsSync(path)) {
      throw new Error(`Question templates not found at ${path}`);
    }

    const content = readFileSync(path, 'utf-8');
    this.templateData = JSON.parse(content) as TemplateData;

    // Index templates by ID
    for (const template of this.templateData.templates) {
      this.templates.set(template.id, template);
    }
  }

  /**
   * Extract insights from the questioning session
   */
  async extractInsights(answers: Answer[]): Promise<string[]> {
    const questions = await this.getQuestionsForAnswers(answers);
    const result = this.confidenceCalculator.calculate(answers, questions);
    return result.insights;
  }

  /**
   * Detect ambiguity in an answer
   */
  detectAmbiguity(answer: string): boolean {
    const ambiguousPatterns = [
      'maybe', 'possibly', 'might', 'could be', 'depends',
      'sometimes', 'not sure', 'i think', 'probably',
      'it varies', 'in some cases', 'potentially',
    ];

    const lowerAnswer = answer.toLowerCase();
    return ambiguousPatterns.some(pattern => lowerAnswer.includes(pattern));
  }

  /**
   * Generate a clarification question for ambiguous answer
   */
  async generateClarificationQuestion(
    originalQuestion: Question,
    ambiguousAnswer: string
  ): Promise<Question> {
    // Extract the ambiguous part
    const ambiguousParts = this.extractAmbiguousParts(ambiguousAnswer);

    // Find clarification template
    const clarifyTemplate = this.templates.get('clarify-ambiguous');
    if (!clarifyTemplate) {
      // Create a generic clarification
      return {
        id: uuidv4(),
        phase: originalQuestion.phase,
        question: `Could you be more specific about "${ambiguousParts[0]}"? What exactly do you mean?`,
        category: 'clarification',
        priority: 'critical',
        followUpTo: originalQuestion.id,
      };
    }

    // Use template
    const question = clarifyTemplate.template
      .replace('{ambiguous_term}', ambiguousParts[0] || 'that');

    return {
      id: uuidv4(),
      phase: originalQuestion.phase,
      question,
      category: 'clarification',
      priority: 'critical',
      followUpTo: originalQuestion.id,
    };
  }

  /**
   * Close the question engine and clean up resources
   */
  async close(): Promise<void> {
    if (this && this.db) {
      this.db.close();
      this.db = null;
    }

    if (this) {
      this.askedQuestionIds?.clear();
      this.questionAnswerMap?.clear();
      this.followUpDepth?.clear();
    }
  }

  // Private helper methods

  /**
   * Load existing session data from database
   */
  private async loadSessionData(sessionId: string): Promise<void> {
    if (!this.db) return;

    const questions = this.db.getQuestions(sessionId);
    for (const q of questions) {
      this.askedQuestionIds.add(q.id);
      if (q.answer) {
        this.questionAnswerMap.set(q.id, {
          questionId: q.id,
          answer: q.answer,
          confidence: q.confidence || 0,
          timestamp: new Date(q.timestamp),
        });
      }
    }
  }

  /**
   * Find coverage gaps in the current questioning
   */
  private findCoverageGaps(context: QuestionContext): QuestionCategory[] {
    const phaseReqs = this.templateData?.phaseTransitions[context.phase];
    if (!phaseReqs) return [];

    const categoryCounts = new Map<QuestionCategory, number>();

    // Count asked questions per category
    for (const templateId of this.askedQuestionIds) {
      const template = this.templates.get(templateId);
      if (template) {
        categoryCounts.set(
          template.category,
          (categoryCounts.get(template.category) || 0) + 1
        );
      }
    }

    // Find gaps
    const gaps: QuestionCategory[] = [];
    for (const [category, minCount] of Object.entries(phaseReqs.minCoverage)) {
      const currentCount = categoryCounts.get(category as QuestionCategory) || 0;
      if (currentCount < minCount) {
        gaps.push(category as QuestionCategory);
      }
    }

    return gaps;
  }

  /**
   * Prioritize templates based on context and gaps
   */
  private prioritizeTemplates(
    context: QuestionContext,
    coverageGaps: QuestionCategory[]
  ): QuestionTemplate[] {
    const phaseTemplates = Array.from(this.templates.values())
      .filter(t => t.phase.includes(context.phase));

    // Score each template
    const scoredTemplates = phaseTemplates.map(template => {
      let score = 0;

      // Priority scoring
      switch (template.priority) {
        case 'critical': score += 1000; break;
        case 'high': score += 100; break;
        case 'medium': score += 10; break;
        case 'low': score += 1; break;
      }

      // Gap coverage bonus
      if (coverageGaps.includes(template.category)) {
        score += 500;
      }

      // Adaptive priority based on context
      if (this.config.enableAdaptivePriority && this.templateData?.adaptiveRules) {
        const rules = this.templateData.adaptiveRules;

        // Low confidence boost
        const confidence = this.calculateConfidenceSync(context.previousAnswers);
        if (confidence < 0.5 && rules.increasePriorityOn.lowConfidence?.includes(template.category)) {
          score += 200;
        }
      }

      return { template, score };
    });

    // Sort by score
    scoredTemplates.sort((a, b) => b.score - a.score);

    return scoredTemplates.map(s => s.template);
  }

  /**
   * Create a Question from a template
   */
  private createQuestionFromTemplate(
    template: QuestionTemplate,
    context: QuestionContext
  ): Question {
    // Replace placeholders in template
    let questionText = template.template;
    questionText = questionText.replace(/{topic}/g, context.topic);

    // Additional placeholder replacements based on context
    if (context.existingKnowledge) {
      for (const [key, value] of Object.entries(context.existingKnowledge)) {
        questionText = questionText.replace(new RegExp(`{${key}}`, 'g'), String(value));
      }
    }

    return {
      id: uuidv4(),
      phase: context.phase,
      question: questionText,
      category: template.category,
      priority: template.priority,
      metadata: {
        templateId: template.id,
        sessionId: this.sessionId,
      },
    };
  }

  /**
   * Generate a generic clarification question
   */
  private generateGenericClarification(context: QuestionContext): Question {
    return {
      id: uuidv4(),
      phase: context.phase,
      question: `We need more clarity on ${context.topic}. Could you provide more specific details about your requirements and constraints?`,
      category: 'clarification',
      priority: 'high',
    };
  }

  /**
   * Get questions for a set of answers
   */
  private async getQuestionsForAnswers(answers: Answer[]): Promise<Question[]> {
    const questions: Question[] = [];

    for (const answer of answers) {
      // Try to find from asked questions
      const template = this.findTemplateByQuestionId(answer.questionId);
      if (template) {
        questions.push({
          id: answer.questionId,
          phase: this.currentPhase,
          question: template.template,
          category: template.category,
          priority: template.priority,
        });
      } else if (this.db) {
        // Try database
        const dbQuestions = this.db.getQuestions(this.sessionId || '');
        const dbQuestion = dbQuestions.find(q => q.id === answer.questionId);
        if (dbQuestion) {
          questions.push({
            id: dbQuestion.id,
            phase: dbQuestion.phase as WorkflowPhase,
            question: dbQuestion.question,
            category: 'requirements', // Default
            priority: 'medium', // Default
          });
        }
      }
    }

    return questions;
  }

  /**
   * Synchronous confidence calculation for scoring
   */
  private calculateConfidenceSync(answers: Answer[]): number {
    if (answers.length === 0) return 0;

    const avgConfidence = answers.reduce((sum, a) => sum + a.confidence, 0) / answers.length;
    return avgConfidence;
  }

  /**
   * Find template by question ID
   */
  private findTemplateByQuestionId(questionId: string): QuestionTemplate | null {
    // This would need to track which template was used for each question
    // For now, return null
    return null;
  }

  /**
   * Determine which follow-ups to trigger
   */
  private determineFollowUps(answer: Answer, template: QuestionTemplate): string[] {
    if (!template.followUps || template.followUps.length === 0) {
      return [];
    }

    // Check for ambiguity
    if (this.detectAmbiguity(answer.answer)) {
      // Prioritize clarification follow-ups
      return template.followUps.filter(id => {
        const followUp = this.templates.get(id);
        return followUp?.category === 'clarification';
      });
    }

    // Check answer length
    if (answer.answer.length < 50) {
      // Short answer, ask for more details
      return template.followUps;
    }

    // Default: use first follow-up
    return [template.followUps[0]];
  }

  /**
   * Extract topic from an answer
   */
  private extractTopicFromAnswer(answer: Answer): string {
    // Simple extraction - take first noun-like phrase
    const words = answer.answer.split(/\s+/);
    return words.slice(0, 3).join(' ');
  }

  /**
   * Extract ambiguous parts from an answer
   */
  private extractAmbiguousParts(answer: string): string[] {
    const ambiguousPatterns = [
      'maybe', 'possibly', 'might', 'could be', 'depends',
      'sometimes', 'not sure', 'i think', 'probably',
    ];

    const parts: string[] = [];
    const lowerAnswer = answer.toLowerCase();

    for (const pattern of ambiguousPatterns) {
      if (lowerAnswer.includes(pattern)) {
        // Extract surrounding context
        const index = lowerAnswer.indexOf(pattern);
        const start = Math.max(0, index - 20);
        const end = Math.min(answer.length, index + pattern.length + 20);
        parts.push(answer.substring(start, end).trim());
      }
    }

    return parts.length > 0 ? parts : ['your response'];
  }

  /**
   * Store a question in the database
   */
  private async storeQuestion(question: Question): Promise<void> {
    if (!this.db || !this.sessionId) return;

    const questionId = this.db.saveQuestion(
      this.sessionId,
      question.phase,
      question.question
    );

    // Update question ID if generated
    if (questionId !== question.id) {
      question.id = questionId;
    }
  }

  /**
   * Store an answer in the database
   */
  private async storeAnswer(answer: Answer): Promise<void> {
    if (!this.db) return;

    this.db.answerQuestion(
      answer.questionId,
      answer.answer,
      answer.confidence
    );
  }
}
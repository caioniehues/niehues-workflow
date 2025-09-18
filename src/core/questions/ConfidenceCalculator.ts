/**
 * Confidence Calculator
 *
 * Calculates confidence scores from answers using multiple factors including:
 * - Answer completeness and clarity
 * - Coverage of critical question categories
 * - Consistency across related answers
 * - Specificity vs vagueness
 * - Presence of concrete examples
 */

import type {
  Answer,
  Question,
  QuestionCategory,
  QuestionPriority,
} from './IQuestionEngine.js';

/**
 * Factors that contribute to confidence calculation
 */
export interface ConfidenceFactors {
  clarity: number;         // 0-1: How clear and unambiguous the answer is
  completeness: number;    // 0-1: How complete the answer is
  specificity: number;     // 0-1: Level of specific details vs vague statements
  consistency: number;     // 0-1: Consistency with other answers
  coverage: number;        // 0-1: Coverage of critical categories
  examples: number;        // 0-1: Presence of concrete examples
}

/**
 * Weights for different confidence factors
 */
export interface FactorWeights {
  clarity: number;
  completeness: number;
  specificity: number;
  consistency: number;
  coverage: number;
  examples: number;
}

/**
 * Result of confidence calculation
 */
export interface ConfidenceResult {
  overall: number;               // 0-1: Overall confidence score
  factors: ConfidenceFactors;   // Individual factor scores
  missing: QuestionCategory[];  // Categories that need more coverage
  insights: string[];           // Insights about the confidence level
}

/**
 * Configuration for confidence calculation
 */
export interface ConfidenceConfig {
  weights?: Partial<FactorWeights>;
  criticalCategories?: QuestionCategory[];
  minAnswersForConsistency?: number;
  targetConfidence?: number;
}

export class ConfidenceCalculator {
  private readonly weights: FactorWeights;
  private readonly criticalCategories: Set<QuestionCategory>;
  private readonly minAnswersForConsistency: number;
  private readonly targetConfidence: number;

  constructor(config: ConfidenceConfig = {}) {
    // Default weights that sum to 1.0
    this.weights = {
      clarity: config.weights?.clarity ?? 0.25,
      completeness: config.weights?.completeness ?? 0.20,
      specificity: config.weights?.specificity ?? 0.20,
      consistency: config.weights?.consistency ?? 0.15,
      coverage: config.weights?.coverage ?? 0.15,
      examples: config.weights?.examples ?? 0.05,
      ...config.weights,
    };

    // Normalize weights to sum to 1.0
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.01) {
      Object.keys(this.weights).forEach(key => {
        this.weights[key as keyof FactorWeights] /= sum;
      });
    }

    // Critical categories that must be covered
    this.criticalCategories = new Set(config.criticalCategories || [
      'requirements',
      'constraints',
      'edge-cases',
    ]);

    this.minAnswersForConsistency = config.minAnswersForConsistency ?? 3;
    this.targetConfidence = config.targetConfidence ?? 0.85;
  }

  /**
   * Calculate overall confidence from answers and questions
   */
  public calculate(
    answers: Answer[],
    questions: Question[]
  ): ConfidenceResult {
    if (answers.length === 0) {
      return {
        overall: 0,
        factors: this.getEmptyFactors(),
        missing: Array.from(this.criticalCategories),
        insights: ['No answers provided yet'],
      };
    }

    const factors = this.calculateFactors(answers, questions);
    const overall = this.calculateOverall(factors);
    const missing = this.findMissingCategories(questions);
    const insights = this.generateInsights(factors, answers, questions);

    return { overall, factors, missing, insights };
  }

  /**
   * Calculate individual confidence factors
   */
  private calculateFactors(
    answers: Answer[],
    questions: Question[]
  ): ConfidenceFactors {
    return {
      clarity: this.calculateClarity(answers),
      completeness: this.calculateCompleteness(answers, questions),
      specificity: this.calculateSpecificity(answers),
      consistency: this.calculateConsistency(answers),
      coverage: this.calculateCoverage(questions),
      examples: this.calculateExamples(answers),
    };
  }

  /**
   * Calculate clarity factor based on answer characteristics
   */
  private calculateClarity(answers: Answer[]): number {
    if (answers.length === 0) return 0;

    const clarityScores = answers.map(answer => {
      let score = 0;
      const text = answer.answer.toLowerCase();

      // Penalize vague phrases
      const vaguePhases = [
        'maybe', 'possibly', 'might', 'could be', 'not sure',
        'i think', 'probably', 'depends', 'sometimes',
      ];
      const vagueCount = vaguePhases.filter(phrase => text.includes(phrase)).length;
      score -= vagueCount * 0.1;

      // Reward definitive statements
      const definitivePhases = [
        'must', 'will', 'always', 'never', 'exactly',
        'specifically', 'definitely', 'certainly',
      ];
      const definitiveCount = definitivePhases.filter(phrase => text.includes(phrase)).length;
      score += definitiveCount * 0.1;

      // Check for yes/no answers without elaboration (bad)
      if (text.length < 10 && (text === 'yes' || text === 'no')) {
        score -= 0.3;
      }

      // Reward structured answers (bullet points, numbered lists)
      if (text.includes('\n-') || text.includes('\n*') || /\n\d+\./.test(text)) {
        score += 0.2;
      }

      // Base score on answer confidence
      score += answer.confidence;

      return Math.max(0, Math.min(1, score));
    });

    return clarityScores.reduce((sum, s) => sum + s, 0) / clarityScores.length;
  }

  /**
   * Calculate completeness based on answer length and structure
   */
  private calculateCompleteness(answers: Answer[], questions: Question[]): number {
    if (answers.length === 0) return 0;

    const completenessScores = answers.map((answer, index) => {
      const question = questions[index];
      if (!question) return 0.5;

      const text = answer.answer;
      let score = 0;

      // Check answer length (too short is incomplete, too long might be rambling)
      const wordCount = text.split(/\s+/).length;
      if (wordCount < 5) {
        score = 0.2;
      } else if (wordCount < 20) {
        score = 0.5;
      } else if (wordCount < 100) {
        score = 0.8;
      } else if (wordCount < 200) {
        score = 1.0;
      } else {
        score = 0.9; // Slightly penalize very long answers
      }

      // Check for structured response to multi-part questions
      if (text.includes('?') && question.question.includes('?')) {
        const questionMarks = question.question.match(/\?/g)?.length || 1;
        const answerParts = text.split(/\n\n|\n-|\n\d+\./).length;
        if (answerParts >= questionMarks) {
          score = Math.min(1, score + 0.2);
        }
      }

      return score;
    });

    return completenessScores.reduce((sum, s) => sum + s, 0) / completenessScores.length;
  }

  /**
   * Calculate specificity based on presence of concrete details
   */
  private calculateSpecificity(answers: Answer[]): number {
    if (answers.length === 0) return 0;

    const specificityScores = answers.map(answer => {
      const text = answer.answer.toLowerCase();
      let score = 0.5; // Base score

      // Check for specific technical terms
      const technicalIndicators = [
        // Programming concepts
        'api', 'database', 'function', 'class', 'interface',
        'component', 'service', 'repository', 'controller',
        // Specific requirements
        'milliseconds', 'seconds', 'bytes', 'users', 'requests',
        'performance', 'latency', 'throughput',
        // Concrete examples
        'for example', 'e.g.', 'such as', 'specifically',
        'in this case', 'the following',
      ];

      const technicalCount = technicalIndicators.filter(term => text.includes(term)).length;
      score += Math.min(0.3, technicalCount * 0.05);

      // Check for numbers and measurements
      if (/\d+/.test(text)) {
        score += 0.1;
      }

      // Check for code snippets or technical notation
      if (text.includes('```') || text.includes('`') || text.includes('()') || text.includes('{}')) {
        score += 0.2;
      }

      // Penalize generic statements
      const genericPhrases = [
        'it depends', 'various', 'different', 'some', 'many',
        'a lot', 'a few', 'several', 'multiple',
      ];
      const genericCount = genericPhrases.filter(phrase => text.includes(phrase)).length;
      score -= genericCount * 0.05;

      return Math.max(0, Math.min(1, score));
    });

    return specificityScores.reduce((sum, s) => sum + s, 0) / specificityScores.length;
  }

  /**
   * Calculate consistency across related answers
   */
  private calculateConsistency(answers: Answer[]): number {
    if (answers.length < this.minAnswersForConsistency) {
      // Not enough answers to measure consistency
      return 0.7; // Neutral score
    }

    // Group answers by similarity and check for contradictions
    let consistencyScore = 1.0;
    const answerTexts = answers.map(a => a.answer.toLowerCase());

    // Simple consistency check: look for contradictory patterns
    for (let i = 0; i < answerTexts.length; i++) {
      for (let j = i + 1; j < answerTexts.length; j++) {
        if (this.detectContradiction(answerTexts[i], answerTexts[j])) {
          consistencyScore -= 0.15;
        }
      }
    }

    // Check for consistent terminology usage
    const allTerms = new Set<string>();
    const termFrequency = new Map<string, number>();

    answerTexts.forEach(text => {
      const terms = this.extractKeyTerms(text);
      terms.forEach(term => {
        allTerms.add(term);
        termFrequency.set(term, (termFrequency.get(term) || 0) + 1);
      });
    });

    // Reward consistent use of domain terms
    const consistentTerms = Array.from(termFrequency.entries())
      .filter(([_, freq]) => freq >= answers.length * 0.3)
      .length;

    if (allTerms.size > 0) {
      consistencyScore += (consistentTerms / allTerms.size) * 0.2;
    }

    return Math.max(0, Math.min(1, consistencyScore));
  }

  /**
   * Calculate coverage of critical question categories
   */
  private calculateCoverage(questions: Question[]): number {
    if (questions.length === 0) return 0;

    const categoriesCovered = new Set(questions.map(q => q.category));
    const criticalCovered = Array.from(this.criticalCategories)
      .filter(cat => categoriesCovered.has(cat)).length;

    const criticalCoverage = this.criticalCategories.size > 0
      ? criticalCovered / this.criticalCategories.size
      : 1;

    // Also consider overall category diversity
    const totalPossibleCategories = 9; // From QuestionCategory type
    const diversityScore = categoriesCovered.size / totalPossibleCategories;

    // Weight critical coverage more heavily
    return criticalCoverage * 0.7 + diversityScore * 0.3;
  }

  /**
   * Calculate presence of concrete examples in answers
   */
  private calculateExamples(answers: Answer[]): number {
    if (answers.length === 0) return 0;

    const exampleScores = answers.map(answer => {
      const text = answer.answer.toLowerCase();
      let score = 0;

      // Check for example indicators
      const exampleIndicators = [
        'for example', 'for instance', 'e.g.', 'such as',
        'like', 'consider', 'suppose', 'imagine',
        'let\'s say', 'scenario', 'use case', 'sample',
      ];

      const exampleCount = exampleIndicators.filter(indicator => text.includes(indicator)).length;
      score = Math.min(1, exampleCount * 0.25);

      // Check for code examples
      if (text.includes('```') || text.includes('`')) {
        score = Math.min(1, score + 0.5);
      }

      // Check for structured scenarios (numbered or bulleted)
      if (/\n\d+\..*\n\d+\./.test(text) || /\n-.*\n-/.test(text)) {
        score = Math.min(1, score + 0.3);
      }

      return score;
    });

    return exampleScores.reduce((sum, s) => sum + s, 0) / exampleScores.length;
  }

  /**
   * Calculate overall confidence from weighted factors
   */
  private calculateOverall(factors: ConfidenceFactors): number {
    let overall = 0;

    overall += factors.clarity * this.weights.clarity;
    overall += factors.completeness * this.weights.completeness;
    overall += factors.specificity * this.weights.specificity;
    overall += factors.consistency * this.weights.consistency;
    overall += factors.coverage * this.weights.coverage;
    overall += factors.examples * this.weights.examples;

    return Math.max(0, Math.min(1, overall));
  }

  /**
   * Find critical categories that haven't been covered
   */
  private findMissingCategories(questions: Question[]): QuestionCategory[] {
    const covered = new Set(questions.map(q => q.category));
    return Array.from(this.criticalCategories).filter(cat => !covered.has(cat));
  }

  /**
   * Generate insights about the confidence level
   */
  private generateInsights(
    factors: ConfidenceFactors,
    answers: Answer[],
    questions: Question[]
  ): string[] {
    const insights: string[] = [];

    // Analyze factor levels
    if (factors.clarity < 0.5) {
      insights.push('Answers contain too much ambiguity - need more definitive responses');
    }
    if (factors.completeness < 0.5) {
      insights.push('Answers are too brief - need more comprehensive responses');
    }
    if (factors.specificity < 0.5) {
      insights.push('Answers lack concrete details - need specific examples and measurements');
    }
    if (factors.consistency < 0.5) {
      insights.push('Detected potential contradictions - need to clarify inconsistencies');
    }
    if (factors.coverage < 0.5) {
      insights.push('Critical categories not covered - need to address requirements, constraints, and edge cases');
    }
    if (factors.examples < 0.3) {
      insights.push('Lack of concrete examples - need specific scenarios or use cases');
    }

    // Positive insights
    if (factors.clarity > 0.8) {
      insights.push('Answers are clear and unambiguous');
    }
    if (factors.consistency > 0.8) {
      insights.push('Responses are highly consistent');
    }
    if (factors.coverage > 0.8) {
      insights.push('Good coverage across all critical categories');
    }

    // Overall assessment
    const overall = this.calculateOverall(factors);
    if (overall >= this.targetConfidence) {
      insights.push(`Confidence threshold reached (${(overall * 100).toFixed(1)}% >= ${(this.targetConfidence * 100).toFixed(1)}%)`);
    } else {
      const gap = this.targetConfidence - overall;
      insights.push(`Need ${(gap * 100).toFixed(1)}% more confidence to reach threshold`);
    }

    return insights;
  }

  /**
   * Detect potential contradictions between two answers
   */
  private detectContradiction(text1: string, text2: string): boolean {
    // Simple contradiction detection - could be enhanced with NLP
    const opposites = [
      ['yes', 'no'],
      ['true', 'false'],
      ['always', 'never'],
      ['must', 'must not'],
      ['will', 'won\'t'],
      ['can', 'cannot'],
      ['should', 'should not'],
    ];

    for (const [word1, word2] of opposites) {
      if ((text1.includes(word1) && text2.includes(word2)) ||
          (text1.includes(word2) && text2.includes(word1))) {
        // Check if they're talking about the same subject (very simple heuristic)
        const sharedWords = this.getSharedWords(text1, text2);
        if (sharedWords.length > 3) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Extract key terms from text for consistency analysis
   */
  private extractKeyTerms(text: string): string[] {
    // Simple term extraction - remove common words
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall',
      'that', 'this', 'these', 'those', 'it', 'its', 'we', 'our', 'your',
    ]);

    return text
      .split(/\s+/)
      .map(word => word.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(word => word.length > 3 && !commonWords.has(word));
  }

  /**
   * Get words shared between two texts
   */
  private getSharedWords(text1: string, text2: string): string[] {
    const words1 = new Set(this.extractKeyTerms(text1));
    const words2 = new Set(this.extractKeyTerms(text2));
    return Array.from(words1).filter(word => words2.has(word));
  }

  /**
   * Get empty factors object
   */
  private getEmptyFactors(): ConfidenceFactors {
    return {
      clarity: 0,
      completeness: 0,
      specificity: 0,
      consistency: 0,
      coverage: 0,
      examples: 0,
    };
  }

  /**
   * Check if confidence threshold is reached
   */
  public isConfidenceSufficient(confidence: number): boolean {
    return confidence >= this.targetConfidence;
  }

  /**
   * Get the target confidence threshold
   */
  public getTargetConfidence(): number {
    return this.targetConfidence;
  }
}
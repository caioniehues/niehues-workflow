/**
 * ConfidenceCalculator.ts
 * Created: 2025-09-16
 *
 * Multi-factor confidence calculation engine
 * Implements constitutional weighting from Nexus Enhanced
 */

import type {
  Task,
  Context,
  ConfidenceFactors,
  ConfidenceResult,
  Pattern,
  QuestioningPhase
} from './types';

import {
  CONSTITUTIONAL_WEIGHTS,
  AMBIGUOUS_WORDS,
  TEST_INDICATORS
} from './types';

export class ConfidenceCalculator {
  private patternHistory: Pattern[] = [];

  /**
   * Calculate overall confidence score for a task
   * Uses constitutional weighting system
   */
  calculate(task: Task, context: Context): ConfidenceResult {
    // Calculate individual factors
    const factors: ConfidenceFactors = {
      requirements_clarity: this.assessRequirementsClarity(task),
      test_coverage_defined: this.assessTestability(task),
      ambiguity_level: 100 - this.detectAmbiguity(task), // Invert for scoring
      context_completeness: this.assessContextCompleteness(context),
      dependencies_resolved: this.checkDependencies(task, context),
      pattern_similarity: this.findSimilarPatterns(task)
    };

    // Apply constitutional weights
    const weights = { ...CONSTITUTIONAL_WEIGHTS };

    // Calculate weighted average
    let overall = 0;
    let totalWeight = 0;

    for (const [key, value] of Object.entries(factors)) {
      const weight = weights[key as keyof ConfidenceFactors];
      overall += value * weight;
      totalWeight += weight;
    }

    overall = overall / totalWeight;

    // Determine questioning phase
    const questioningPhase = this.getQuestioningPhase(overall);

    // Generate recommendations
    const recommendations = this.generateRecommendations(factors, task, context);

    return {
      overall,
      breakdown: factors,
      factors, // For compatibility
      weights,
      recommendations,
      questioningPhase
    };
  }

  /**
   * Detect ambiguity level in requirements
   * Returns score 0-100 where higher means MORE ambiguous
   */
  detectAmbiguity(task: Task): number {
    const allText = [
      task.title,
      ...task.requirements,
      ...task.acceptanceCriteria,
      task.testStrategy
    ].join(' ').toLowerCase();

    let ambiguousCount = 0;
    let totalWords = allText.split(/\s+/).length;

    // Count ambiguous words
    for (const word of AMBIGUOUS_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = allText.match(regex);
      if (matches) {
        ambiguousCount += matches.length;
      }
    }

    // Calculate ambiguity percentage
    const ambiguityRatio = ambiguousCount / Math.max(totalWords, 1);

    // Scale to 0-100 with reasonable sensitivity
    // 0-2% ambiguous words = low ambiguity
    // 2-5% = medium ambiguity
    // >5% = high ambiguity
    return Math.min(100, ambiguityRatio * 2000);
  }

  /**
   * Assess testability based on test strategy and acceptance criteria
   */
  assessTestability(task: Task): number {
    let score = 0;

    // Check test strategy presence and quality
    if (task.testStrategy) {
      score += 30; // Base points for having strategy

      // Check for specific test types mentioned
      const strategyLower = task.testStrategy.toLowerCase();
      for (const indicator of TEST_INDICATORS) {
        if (strategyLower.includes(indicator)) {
          score += 10;
          if (score >= 60) break; // Cap strategy contribution
        }
      }
    }

    // Check acceptance criteria testability
    if (task.acceptanceCriteria.length > 0) {
      score += 20; // Base points for having AC

      // Each AC adds value up to a point
      const acScore = Math.min(20, task.acceptanceCriteria.length * 5);
      score += acScore;
    }

    return Math.min(100, score);
  }

  /**
   * Check if dependencies are resolved
   */
  checkDependencies(task: Task, context: Context): number {
    // If no dependencies, fully resolved
    if (task.dependencies.length === 0) {
      return 100;
    }

    // Check context resolution status
    if (context.core.dependencies.resolved) {
      return 100;
    }

    // Unresolved dependencies
    return 0;
  }

  /**
   * Find similar patterns in history
   */
  findSimilarPatterns(task: Task): number {
    if (this.patternHistory.length === 0) {
      return 10; // Low score for novel tasks
    }

    // Look for pattern matches
    const taskKeywords = this.extractKeywords(task);
    let bestMatch = 0;

    for (const pattern of this.patternHistory) {
      const patternKeywords = pattern.type.toLowerCase().split(/\s+/);

      // Calculate similarity
      let matches = 0;
      for (const keyword of taskKeywords) {
        if (patternKeywords.includes(keyword)) {
          matches++;
        }
      }

      const similarity = (matches / Math.max(taskKeywords.length, 1)) * 100;
      bestMatch = Math.max(bestMatch, similarity * pattern.successRate);
    }

    return Math.min(100, bestMatch);
  }

  /**
   * Determine questioning phase based on confidence level
   */
  getQuestioningPhase(confidence: number): QuestioningPhase {
    if (confidence < 30) return 'TRIAGE';
    if (confidence < 60) return 'EXPLORATION';
    if (confidence < 80) return 'EDGE_CASES';
    if (confidence < 95) return 'VALIDATION';
    return 'COMPLETE';
  }

  /**
   * Add pattern to history for future matching
   */
  addPatternToHistory(pattern: Pattern): void {
    this.patternHistory.push(pattern);
  }

  /**
   * Assess requirements clarity
   */
  private assessRequirementsClarity(task: Task): number {
    let score = 0;

    // Check requirements presence and specificity
    if (task.requirements.length === 0) {
      return 0;
    }

    // Base score for having requirements
    score = 40;

    // Check for specific, measurable requirements
    for (const req of task.requirements) {
      // Longer, detailed requirements score higher
      if (req.length > 50) score += 5;

      // Technical terms indicate clarity
      if (/\b(POST|GET|API|UUID|VARCHAR|TIMESTAMP|JWT)\b/i.test(req)) {
        score += 5;
      }

      // Specific numbers/constraints add clarity
      if (/\d+/.test(req)) {
        score += 3;
      }
    }

    // Check acceptance criteria alignment
    if (task.acceptanceCriteria.length >= task.requirements.length * 0.5) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Assess context completeness
   */
  private assessContextCompleteness(context: Context): number {
    let score = 0;

    // Base score for embedded context
    if (context.embedded) {
      score = 30;
    }

    // Size contribution (200-2000 lines ideal)
    if (context.size >= 200) score += 15;
    if (context.size >= 500) score += 10;
    if (context.size >= 1000) score += 5;

    // Extended context adds significant value
    if (context.extended) {
      if (context.extended.patterns?.length) score += 15;
      if (context.extended.historicalDecisions?.length) score += 15;
      if (context.extended.edgeCases?.length) score += 10;
    }

    // Source clarity
    if (context.source && context.source.length > 0) {
      score += 10;
    }

    // Dependencies resolution status
    if (context.core.dependencies.resolved) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Extract keywords from task for pattern matching
   */
  private extractKeywords(task: Task): string[] {
    const text = `${task.title} ${task.requirements.join(' ')}`.toLowerCase();

    // Extract significant words (excluding common words)
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);

    const words = text.split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !commonWords.has(word))
      .slice(0, 10); // Top 10 keywords

    return words;
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    factors: ConfidenceFactors,
    task: Task,
    context: Context
  ): string[] {
    const recommendations: string[] = [];

    if (factors.requirements_clarity < 60) {
      recommendations.push('Clarify requirements with specific technical details');
    }

    if (factors.test_coverage_defined < 50) {
      recommendations.push('Define comprehensive test strategy with specific test types');
    }

    if (factors.ambiguity_level < 70) { // Remember: inverted
      recommendations.push('Remove ambiguous language from requirements');
    }

    if (factors.context_completeness < 60) {
      recommendations.push('Expand context with patterns and historical decisions');
    }

    if (factors.dependencies_resolved < 100) {
      recommendations.push('Resolve all dependencies before proceeding');
    }

    if (factors.pattern_similarity < 30) {
      recommendations.push('Research similar implementations for guidance');
    }

    return recommendations;
  }
}
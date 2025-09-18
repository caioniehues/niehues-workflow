/**
 * Brainstorm Output Formatter
 *
 * Formats brainstorming results into structured markdown output and saves to
 * .nexus/current/brainstorm.md for documentation and handoff to specification phase.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import type { BrainstormResult, BrainstormApproach } from '../commands/NexusBrainstormCommand.js';
import type { Question, Answer } from '../core/questions/IQuestionEngine.js';

/**
 * Configuration for the brainstorm formatter
 */
export interface BrainstormFormatterConfig {
  outputPath?: string;
  includeFullQuestions?: boolean;
  includeInsights?: boolean;
  maxApproachesToShow?: number;
}

/**
 * Formats and saves brainstorming results to structured markdown
 */
export class BrainstormFormatter {
  private config: Required<BrainstormFormatterConfig>;

  constructor(config: BrainstormFormatterConfig = {}) {
    this.config = {
      outputPath: config.outputPath || '.nexus/current/brainstorm.md',
      includeFullQuestions: config.includeFullQuestions ?? true,
      includeInsights: config.includeInsights ?? true,
      maxApproachesToShow: config.maxApproachesToShow ?? 0 // 0 means show all
    };
  }

  /**
   * Format and save brainstorm results to markdown
   */
  async formatAndSave(result: BrainstormResult, projectPath: string = process.cwd()): Promise<void> {
    const fullOutputPath = join(projectPath, this.config.outputPath);

    // Ensure directory exists
    const outputDir = dirname(fullOutputPath);
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const markdown = this.formatToMarkdown(result);

    try {
      writeFileSync(fullOutputPath, markdown, 'utf8');
    } catch (error) {
      throw new Error(`Failed to save brainstorm markdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Format brainstorm result to markdown string
   */
  formatToMarkdown(result: BrainstormResult): string {
    const sections: string[] = [];

    // Header
    sections.push(this.formatHeader(result));

    // Executive Summary
    sections.push(this.formatExecutiveSummary(result));

    // Insights (if enabled)
    if (this.config.includeInsights && result.insights.length > 0) {
      sections.push(this.formatInsights(result.insights));
    }

    // Approaches
    sections.push(this.formatApproaches(result.approaches));

    // Questions and Answers (if enabled)
    if (this.config.includeFullQuestions && result.questions.length > 0) {
      sections.push(this.formatQuestioningSession(result.questions, result.answers));
    }

    // Metadata
    sections.push(this.formatMetadata(result));

    return sections.join('\n\n');
  }

  /**
   * Format the header section
   */
  private formatHeader(result: BrainstormResult): string {
    const timestamp = new Date().toISOString().split('T')[0];

    return `# Brainstorm Session: ${result.topic}

*Generated on ${timestamp} | Confidence: ${(result.confidence * 100).toFixed(1)}%*

---`;
  }

  /**
   * Format executive summary section
   */
  private formatExecutiveSummary(result: BrainstormResult): string {
    return `## Executive Summary

**Topic:** ${result.topic}

**Session Outcome:**
- Generated **${result.approaches.length}** unique approaches
- Achieved **${(result.confidence * 100).toFixed(1)}%** confidence through adaptive questioning
- Explored **${result.questions.length}** key considerations
- Identified **${result.insights.length}** strategic insights

**Recommendation:** Proceed to specification phase with top approaches for detailed analysis.`;
  }

  /**
   * Format insights section
   */
  private formatInsights(insights: string[]): string {
    const formattedInsights = insights.map(insight => `- ${insight}`).join('\n');

    return `## Key Insights

${formattedInsights}`;
  }

  /**
   * Format approaches section
   */
  private formatApproaches(approaches: BrainstormApproach[]): string {
    const approachesToShow = this.config.maxApproachesToShow > 0
      ? approaches.slice(0, this.config.maxApproachesToShow)
      : approaches;

    let content = `## Generated Approaches

Total approaches: **${approaches.length}**
${this.config.maxApproachesToShow > 0 && approaches.length > this.config.maxApproachesToShow
  ? `(Showing top ${this.config.maxApproachesToShow})`
  : ''}

`;

    approachesToShow.forEach((approach, index) => {
      content += this.formatSingleApproach(approach, index + 1);
      content += '\n\n';
    });

    // Summary table
    content += this.formatApproachSummaryTable(approachesToShow);

    return content.trim();
  }

  /**
   * Format a single approach
   */
  private formatSingleApproach(approach: BrainstormApproach, number: number): string {
    const complexityBadge = this.getComplexityBadge(approach.complexity);
    const feasibilityBadge = this.getFeasibilityBadge(approach.feasibility);
    const innovationBadge = this.getInnovationBadge(approach.innovation);

    return `### ${number}. ${approach.title}

${complexityBadge} ${feasibilityBadge} ${innovationBadge}

**Description:** ${approach.description}

**Pros:**
${approach.pros.map(pro => `- ✅ ${pro}`).join('\n')}

**Cons:**
${approach.cons.map(con => `- ❌ ${con}`).join('\n')}`;
  }

  /**
   * Format approach summary table
   */
  private formatApproachSummaryTable(approaches: BrainstormApproach[]): string {
    const headers = '| # | Approach | Complexity | Feasibility | Innovation |';
    const separator = '|---|----------|------------|-------------|------------|';

    const rows = approaches.map((approach, index) => {
      const title = approach.title.length > 25
        ? approach.title.substring(0, 22) + '...'
        : approach.title;

      return `| ${index + 1} | ${title} | ${this.capitalizeFirst(approach.complexity)} | ${this.capitalizeFirst(approach.feasibility)} | ${this.capitalizeFirst(approach.innovation)} |`;
    }).join('\n');

    return `### Approach Comparison

${headers}
${separator}
${rows}`;
  }

  /**
   * Format questioning session section
   */
  private formatQuestioningSession(questions: Question[], answers: Answer[]): string {
    const answerMap = new Map(answers.map(a => [a.questionId, a]));

    let content = `## Questioning Session

**Questions Asked:** ${questions.length}
**Adaptive Questioning Approach:** Used to achieve target confidence threshold

`;

    questions.forEach((question, index) => {
      const answer = answerMap.get(question.id);
      const confidence = answer ? `${(answer.confidence * 100).toFixed(1)}%` : 'N/A';

      content += `### Q${index + 1}: ${question.category.toUpperCase()}

**Question:** ${question.question}

**Answer:** ${answer?.answer || '*No answer recorded*'}

**Priority:** ${question.priority} | **Confidence Impact:** ${confidence}

---

`;
    });

    return content.trim();
  }

  /**
   * Format metadata section
   */
  private formatMetadata(result: BrainstormResult): string {
    return `## Session Metadata

- **Session Date:** ${new Date().toISOString()}
- **Topic:** ${result.topic}
- **Questions Asked:** ${result.questions.length}
- **Approaches Generated:** ${result.approaches.length}
- **Final Confidence:** ${(result.confidence * 100).toFixed(1)}%
- **Phase:** Brainstorm (Complete)
- **Next Phase:** Specify

---

*This document was automatically generated by the Nexus brainstorm formatter.*
*Ready for specification phase - use \`nexus-specify\` to continue.*`;
  }

  /**
   * Get complexity badge
   */
  private getComplexityBadge(complexity: string): string {
    const badges = {
      low: '🟢 **Low Complexity**',
      medium: '🟡 **Medium Complexity**',
      high: '🔴 **High Complexity**'
    };
    return badges[complexity as keyof typeof badges] || complexity;
  }

  /**
   * Get feasibility badge
   */
  private getFeasibilityBadge(feasibility: string): string {
    const badges = {
      low: '🔴 **Low Feasibility**',
      medium: '🟡 **Medium Feasibility**',
      high: '🟢 **High Feasibility**'
    };
    return badges[feasibility as keyof typeof badges] || feasibility;
  }

  /**
   * Get innovation badge
   */
  private getInnovationBadge(innovation: string): string {
    const badges = {
      low: '🔵 **Low Innovation**',
      medium: '🟡 **Medium Innovation**',
      high: '🟣 **High Innovation**'
    };
    return badges[innovation as keyof typeof badges] || innovation;
  }

  /**
   * Capitalize first letter of string
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Helper function to format and save brainstorm results
 */
export async function formatBrainstormResults(
  result: BrainstormResult,
  config: BrainstormFormatterConfig = {},
  projectPath: string = process.cwd()
): Promise<void> {
  const formatter = new BrainstormFormatter(config);
  await formatter.formatAndSave(result, projectPath);
}
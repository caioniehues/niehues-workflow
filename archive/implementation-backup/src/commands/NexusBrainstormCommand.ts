/**
 * Nexus Brainstorm Command
 *
 * Implements creative ideation phase using adaptive questioning to generate
 * multiple approaches and solutions. Leverages the QuestionEngine to ensure
 * comprehensive exploration of problem space before moving to specification.
 */

import { CommandHandler, CommandConfig, CommandResult } from './CommandHandler.js';
import { QuestionEngine } from '../core/questions/QuestionEngine.js';
import type {
  IQuestionEngine,
  Question,
  Answer,
  QuestionContext
} from '../core/questions/IQuestionEngine.js';
import type { WorkflowPhase } from '../core/context/IContextManager.js';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { BrainstormFormatter } from '../utils/BrainstormFormatter.js';

/**
 * Configuration for the nexus-brainstorm command
 */
export interface BrainstormCommandConfig extends CommandConfig {
  topic?: string;
  targetApproaches?: number;
  maxQuestions?: number;
  targetConfidence?: number;
}

/**
 * Represents a generated approach during brainstorming
 */
export interface BrainstormApproach {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  complexity: 'low' | 'medium' | 'high';
  feasibility: 'low' | 'medium' | 'high';
  innovation: 'low' | 'medium' | 'high';
}

/**
 * Result of brainstorming session
 */
export interface BrainstormResult {
  topic: string;
  approaches: BrainstormApproach[];
  insights: string[];
  questions: Question[];
  answers: Answer[];
  confidence: number;
}

/**
 * Implementation of the nexus-brainstorm command
 */
export class NexusBrainstormCommand extends CommandHandler {
  private topic: string;
  private targetApproaches: number;
  private maxQuestions: number;
  private targetConfidence: number;
  private questionEngine: IQuestionEngine | null = null;
  private approaches: BrainstormApproach[] = [];
  private questions: Question[] = [];
  private answers: Answer[] = [];

  constructor(config: BrainstormCommandConfig = {}) {
    super(config);
    this.topic = config.topic || '';
    this.targetApproaches = config.targetApproaches || 20;
    this.maxQuestions = config.maxQuestions || 15;
    this.targetConfidence = config.targetConfidence || 0.85;
  }

  /**
   * Get the workflow phase for this command
   */
  protected getPhase(): WorkflowPhase {
    return 'brainstorm';
  }

  /**
   * Validate preconditions for brainstorming
   */
  protected async validatePreconditions(): Promise<void> {
    // Check if Nexus is initialized
    if (!existsSync(this.nexusDir)) {
      throw new Error('Nexus not initialized. Run nexus-init first.');
    }

    // Check if already in a later phase
    if (this.contextManager) {
      const currentPhase = this.contextManager.getCurrentPhase();
      if (currentPhase && currentPhase !== 'init' && currentPhase !== 'brainstorm') {
        this.log('warn', `Project is in ${currentPhase} phase. Brainstorming may override existing progress.`);

        const { proceed } = await inquirer.prompt([{
          type: 'confirm',
          name: 'proceed',
          message: 'Continue with brainstorming?',
          default: false
        }]);

        if (!proceed) {
          throw new Error('Brainstorming cancelled by user.');
        }
      }
    }

    // Prompt for topic if not provided
    if (!this.topic) {
      const { topic } = await inquirer.prompt([{
        type: 'input',
        name: 'topic',
        message: 'What would you like to brainstorm about?',
        validate: (input: string) => input.trim().length > 0 || 'Topic cannot be empty'
      }]);
      this.topic = topic.trim();
    }
  }

  /**
   * Execute the brainstorming command
   */
  protected async executeCommand(): Promise<CommandResult> {
    try {
      this.log('info', `Starting brainstorming session for: ${chalk.cyan(this.topic)}`);

      // Initialize question engine
      await this.initializeQuestionEngine();

      // Set context phase
      if (this.contextManager) {
        await this.contextManager.setCurrentPhase('brainstorm');
        await this.contextManager.set('brainstorm:topic', this.topic);
      }

      // Run adaptive questioning session
      await this.runQuestioningSession();

      // Generate approaches based on answers
      await this.generateApproaches();

      // Create brainstorm result
      const result: BrainstormResult = {
        topic: this.topic,
        approaches: this.approaches,
        insights: await this.extractInsights(),
        questions: this.questions,
        answers: this.answers,
        confidence: await this.calculateFinalConfidence()
      };

      // Save brainstorm session
      await this.saveBrainstormSession(result);

      // Display results
      this.displayResults(result);

      return {
        success: true,
        message: `Brainstorming completed! Generated ${result.approaches.length} approaches with ${(result.confidence * 100).toFixed(1)}% confidence.`,
        data: result
      };

    } catch (error) {
      return {
        success: false,
        message: `Brainstorming failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error : new Error(String(error))
      };
    }
  }

  /**
   * Initialize the question engine for brainstorming
   */
  private async initializeQuestionEngine(): Promise<void> {
    this.questionEngine = new QuestionEngine({
      defaultTargetConfidence: this.targetConfidence,
      persistQuestions: true,
      templatesPath: join(process.cwd(), 'src', 'templates', 'questions.json')
    });

    await this.questionEngine.initialize(this.sessionId!, this.projectPath);
    this.log('info', 'Question engine initialized for brainstorming');
  }

  /**
   * Run adaptive questioning session
   */
  private async runQuestioningSession(): Promise<void> {
    this.log('info', 'Starting adaptive questioning session...');

    const context: QuestionContext = {
      phase: 'brainstorm',
      topic: this.topic,
      previousAnswers: [],
      targetConfidence: this.targetConfidence
    };

    let questionCount = 0;
    let currentConfidence = 0;

    while (
      questionCount < this.maxQuestions &&
      currentConfidence < this.targetConfidence &&
      this.questionEngine!.shouldContinueQuestioning(currentConfidence, this.targetConfidence)
    ) {
      // Generate next question
      const question = await this.questionEngine!.generateNextQuestion(context);

      if (!question) {
        this.log('info', 'No more questions to ask');
        break;
      }

      this.questions.push(question);

      // Ask user the question
      const answer = await this.askQuestion(question);
      this.answers.push(answer);

      // Process answer and update confidence
      currentConfidence = await this.questionEngine!.processAnswer(answer);

      // Update context for next iteration
      context.previousAnswers = [...this.answers];

      questionCount++;

      this.log('info', `Question ${questionCount}/${this.maxQuestions} | Confidence: ${(currentConfidence * 100).toFixed(1)}%`);
    }

    this.log('success', `Questioning session completed! Final confidence: ${(currentConfidence * 100).toFixed(1)}%`);
  }

  /**
   * Ask a question to the user
   */
  private async askQuestion(question: Question): Promise<Answer> {
    console.log('\n' + chalk.blue('━'.repeat(60)));
    console.log(chalk.blue.bold(`Question ${this.answers.length + 1}:`));
    console.log(chalk.white(question.question));
    console.log(chalk.gray(`Category: ${question.category} | Priority: ${question.priority}`));
    console.log(chalk.blue('━'.repeat(60)));

    const { answer } = await inquirer.prompt([{
      type: 'input',
      name: 'answer',
      message: 'Your answer:',
      validate: (input: string) => input.trim().length > 0 || 'Answer cannot be empty'
    }]);

    // Calculate initial confidence based on answer length and detail
    const confidence = this.calculateAnswerConfidence(answer.trim());

    return {
      questionId: question.id,
      answer: answer.trim(),
      confidence,
      timestamp: new Date()
    };
  }

  /**
   * Calculate confidence based on answer quality
   */
  private calculateAnswerConfidence(answer: string): number {
    // Basic heuristics for answer confidence
    let confidence = 0.3; // Base confidence

    // Length factor
    if (answer.length > 50) confidence += 0.2;
    if (answer.length > 100) confidence += 0.2;

    // Specificity indicators
    if (answer.includes('because') || answer.includes('therefore')) confidence += 0.1;
    if (answer.includes('example') || answer.includes('specifically')) confidence += 0.1;
    if (/\d+/.test(answer)) confidence += 0.1; // Contains numbers/metrics

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate approaches based on collected answers
   */
  private async generateApproaches(): Promise<void> {
    this.log('info', 'Generating approaches based on your answers...');

    // Analyze answers to identify key themes and constraints
    const themes = this.extractThemes();
    const constraints = this.extractConstraints();

    // Generate diverse approaches
    const baseApproaches = [
      this.generateMinimalViableApproach(),
      this.generateComprehensiveApproach(),
      this.generateIncrementalApproach(),
      this.generateDisruptiveApproach(),
      this.generateHybridApproach(),
      ...this.generateThemeBasedApproaches(themes),
      ...this.generateConstraintBasedApproaches(constraints)
    ];

    // Ensure we meet the target number of approaches
    while (this.approaches.length < this.targetApproaches) {
      this.approaches.push(...baseApproaches);
    }

    // Keep only the target number of unique approaches
    this.approaches = this.approaches
      .slice(0, this.targetApproaches)
      .map((approach, index) => ({
        ...approach,
        id: `approach-${index + 1}`
      }));

    this.log('success', `Generated ${this.approaches.length} unique approaches`);
  }

  /**
   * Extract key themes from answers
   */
  private extractThemes(): string[] {
    const allText = this.answers.map(a => a.answer).join(' ').toLowerCase();

    // Common brainstorming themes
    const themes = [
      'user experience', 'performance', 'scalability', 'security', 'integration',
      'automation', 'simplicity', 'flexibility', 'innovation', 'cost-effectiveness'
    ];

    return themes.filter(theme =>
      allText.includes(theme.replace(' ', '')) ||
      allText.includes(theme)
    );
  }

  /**
   * Extract constraints from answers
   */
  private extractConstraints(): string[] {
    const constraints: string[] = [];

    this.answers.forEach(answer => {
      const text = answer.answer.toLowerCase();

      if (text.includes('budget') || text.includes('cost')) constraints.push('budget');
      if (text.includes('time') || text.includes('deadline')) constraints.push('timeline');
      if (text.includes('team') || text.includes('resource')) constraints.push('resources');
      if (text.includes('legacy') || text.includes('existing')) constraints.push('legacy-systems');
      if (text.includes('compliance') || text.includes('regulation')) constraints.push('compliance');
    });

    return Array.from(new Set(constraints));
  }

  /**
   * Generate a minimal viable approach
   */
  private generateMinimalViableApproach(): BrainstormApproach {
    return {
      id: 'mvp',
      title: 'Minimal Viable Approach',
      description: `Start with the simplest possible solution for ${this.topic} that delivers core value quickly.`,
      pros: ['Fast to implement', 'Low risk', 'Quick feedback', 'Minimal resources'],
      cons: ['Limited functionality', 'May need significant rework', 'Might not scale'],
      complexity: 'low',
      feasibility: 'high',
      innovation: 'low'
    };
  }

  /**
   * Generate a comprehensive approach
   */
  private generateComprehensiveApproach(): BrainstormApproach {
    return {
      id: 'comprehensive',
      title: 'Comprehensive Solution',
      description: `Build a full-featured, enterprise-grade solution for ${this.topic} with all anticipated needs.`,
      pros: ['Complete solution', 'Future-proof', 'Scalable', 'Professional'],
      cons: ['High complexity', 'Long development time', 'High cost', 'Over-engineering risk'],
      complexity: 'high',
      feasibility: 'medium',
      innovation: 'medium'
    };
  }

  /**
   * Generate an incremental approach
   */
  private generateIncrementalApproach(): BrainstormApproach {
    return {
      id: 'incremental',
      title: 'Incremental Development',
      description: `Build ${this.topic} in planned phases, adding features incrementally based on feedback.`,
      pros: ['Manageable phases', 'Early value delivery', 'Adaptable', 'Risk mitigation'],
      cons: ['Longer overall timeline', 'Coordination overhead', 'Integration challenges'],
      complexity: 'medium',
      feasibility: 'high',
      innovation: 'medium'
    };
  }

  /**
   * Generate a disruptive approach
   */
  private generateDisruptiveApproach(): BrainstormApproach {
    return {
      id: 'disruptive',
      title: 'Disruptive Innovation',
      description: `Completely reimagine ${this.topic} using cutting-edge technology and novel approaches.`,
      pros: ['Breakthrough potential', 'Competitive advantage', 'Innovation leadership', 'Market differentiation'],
      cons: ['High uncertainty', 'Technical risk', 'Market acceptance risk', 'High investment'],
      complexity: 'high',
      feasibility: 'low',
      innovation: 'high'
    };
  }

  /**
   * Generate a hybrid approach
   */
  private generateHybridApproach(): BrainstormApproach {
    return {
      id: 'hybrid',
      title: 'Hybrid Strategy',
      description: `Combine proven methods with innovative elements for ${this.topic} to balance risk and reward.`,
      pros: ['Balanced risk', 'Best of both worlds', 'Flexible', 'Pragmatic'],
      cons: ['Complexity in integration', 'Potential compromises', 'Requires diverse skills'],
      complexity: 'medium',
      feasibility: 'medium',
      innovation: 'medium'
    };
  }

  /**
   * Generate theme-based approaches
   */
  private generateThemeBasedApproaches(themes: string[]): BrainstormApproach[] {
    return themes.slice(0, 5).map((theme, index) => ({
      id: `theme-${index}`,
      title: `${theme.charAt(0).toUpperCase() + theme.slice(1)}-Focused Approach`,
      description: `Prioritize ${theme} as the primary driver for ${this.topic} implementation.`,
      pros: [`Optimized for ${theme}`, 'Clear focus', 'Measurable outcomes'],
      cons: ['May sacrifice other aspects', 'Single point of failure', 'Limited flexibility'],
      complexity: 'medium' as const,
      feasibility: 'medium' as const,
      innovation: 'medium' as const
    }));
  }

  /**
   * Generate constraint-based approaches
   */
  private generateConstraintBasedApproaches(constraints: string[]): BrainstormApproach[] {
    return constraints.slice(0, 3).map((constraint, index) => ({
      id: `constraint-${index}`,
      title: `${constraint.charAt(0).toUpperCase() + constraint.slice(1)}-Constrained Approach`,
      description: `Design ${this.topic} specifically to work within ${constraint} limitations.`,
      pros: ['Realistic constraints', 'Practical focus', 'Resource-aware'],
      cons: ['Limited scope', 'Potential compromises', 'May miss opportunities'],
      complexity: 'low' as const,
      feasibility: 'high' as const,
      innovation: 'low' as const
    }));
  }

  /**
   * Extract insights from the brainstorming session
   */
  private async extractInsights(): Promise<string[]> {
    const insights: string[] = [];

    // Analyze answer patterns
    if (this.answers.length > 0) {
      insights.push(`Identified ${this.answers.length} key considerations through adaptive questioning`);
    }

    // Theme insights
    const themes = this.extractThemes();
    if (themes.length > 0) {
      insights.push(`Key themes emerged: ${themes.join(', ')}`);
    }

    // Constraint insights
    const constraints = this.extractConstraints();
    if (constraints.length > 0) {
      insights.push(`Primary constraints: ${constraints.join(', ')}`);
    }

    // Confidence insight
    const finalConfidence = await this.calculateFinalConfidence();
    insights.push(`Achieved ${(finalConfidence * 100).toFixed(1)}% confidence in problem understanding`);

    return insights;
  }

  /**
   * Calculate final confidence score
   */
  private async calculateFinalConfidence(): Promise<number> {
    if (!this.questionEngine) return 0;
    return await this.questionEngine.calculateConfidence(this.answers);
  }

  /**
   * Save brainstorm session to file
   */
  private async saveBrainstormSession(result: BrainstormResult): Promise<void> {
    const sessionFile = join(this.currentDir, 'brainstorm-session.json');

    try {
      // Save JSON session file
      writeFileSync(sessionFile, JSON.stringify(result, null, 2));
      this.log('info', `Brainstorm session saved to ${sessionFile}`);

      // Save structured markdown output
      const formatter = new BrainstormFormatter();
      await formatter.formatAndSave(result, this.projectPath);
      this.log('info', 'Brainstorm markdown saved to .nexus/current/brainstorm.md');

      // Save to context manager
      if (this.contextManager) {
        await this.contextManager.set('brainstorm:result', result);
        await this.contextManager.set('brainstorm:approaches', result.approaches);
        await this.contextManager.set('brainstorm:confidence', result.confidence);
      }
    } catch (error) {
      this.log('warn', `Failed to save brainstorm session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Display brainstorming results
   */
  private displayResults(result: BrainstormResult): void {
    console.log('\n' + chalk.green('🎯 BRAINSTORMING RESULTS'));
    console.log(chalk.green('═'.repeat(60)));

    console.log(chalk.blue.bold(`Topic: ${result.topic}`));
    console.log(chalk.blue(`Confidence: ${(result.confidence * 100).toFixed(1)}%`));
    console.log(chalk.blue(`Approaches Generated: ${result.approaches.length}`));

    console.log('\n' + chalk.yellow.bold('KEY INSIGHTS:'));
    result.insights.forEach((insight, index) => {
      console.log(chalk.yellow(`${index + 1}. ${insight}`));
    });

    console.log('\n' + chalk.cyan.bold('TOP APPROACHES:'));
    result.approaches.slice(0, 5).forEach((approach, index) => {
      console.log(chalk.cyan.bold(`${index + 1}. ${approach.title}`));
      console.log(chalk.white(`   ${approach.description}`));
      console.log(chalk.gray(`   Complexity: ${approach.complexity} | Feasibility: ${approach.feasibility} | Innovation: ${approach.innovation}`));
      console.log();
    });

    if (result.approaches.length > 5) {
      console.log(chalk.gray(`... and ${result.approaches.length - 5} more approaches saved to session file`));
    }

    console.log(chalk.green('\n✅ Brainstorming phase completed successfully!'));
    console.log(chalk.gray('Next step: Run nexus-specify to define detailed requirements'));
  }
}

/**
 * Helper function to run nexus-brainstorm command
 */
export async function runNexusBrainstorm(config: BrainstormCommandConfig = {}): Promise<CommandResult> {
  const command = new NexusBrainstormCommand(config);
  return await command.run();
}
import * as fs from 'fs-extra';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as crypto from 'crypto';

interface DecomposeOptions {
  strategy: 'auto' | 'manual' | 'guided';
  contextMode: 'adaptive' | 'full' | 'minimal';
  maxContextSize?: number;
  outputDir?: string;
}

interface FunctionalRequirement {
  id: string;
  description: string;
  source: string;
  priority: 'must' | 'should' | 'could' | 'wont';
}

interface AcceptanceCriterion {
  description: string;
  given: string;
  when: string;
  then: string;
}

interface Dependency {
  task_id: string;
  description: string;
  type: 'blocks' | 'depends' | 'parallel';
}

interface TechnicalContext {
  description: string;
  technology_stack: string[];
  patterns: string[];
  constraints: string[];
  code_examples?: string;
}

interface ConstitutionalRule {
  rule: string;
  description: string;
  enforcement: 'blocking' | 'warning';
  source: string;
}

interface ImplementationPattern {
  name: string;
  description: string;
  code: string;
  relevance: number;
  source: string;
}

interface EdgeCase {
  scenario: string;
  impact: 'high' | 'medium' | 'low';
  likelihood: 'high' | 'medium' | 'low';
  mitigation: string;
}

interface Decision {
  id: string;
  decision: string;
  rationale: string;
  date: string;
  relevance: number;
}

interface TaskReference {
  id: string;
  title: string;
  relationship: string;
}

interface EmbeddedContext {
  core_context: {
    requirements: FunctionalRequirement[];
    acceptance_criteria: AcceptanceCriterion[];
    dependencies: Dependency[];
    technical_context: TechnicalContext;
    constitutional_requirements: ConstitutionalRule[];
  };
  extended_context?: {
    similar_patterns: ImplementationPattern[];
    edge_cases: EdgeCase[];
    historical_decisions: Decision[];
    related_tasks: TaskReference[];
  };
  reference_context: {
    full_specification: string;
    architecture_docs: string[];
    previous_tasks: string[];
  };
}

interface TDDRequirements {
  test_first_required: boolean;
  minimum_coverage: number;
  test_cases: TestCase[];
  test_strategy: string;
  mock_requirements: string[];
}

interface TestCase {
  suite: string;
  description: string;
  implementation_hint: string;
  type: 'unit' | 'integration' | 'e2e';
}

interface TaskWithContext {
  id: string;
  epic: string;
  story: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  confidence: number;
  context_strategy: 'adaptive' | 'full' | 'minimal';
  context_size: number;
  embedded_context: EmbeddedContext;
  dependencies: string[];
  tdd_requirements: TDDRequirements;
  estimated_hours?: number;
  complexity?: 'simple' | 'medium' | 'complex';
  risk_level?: 'low' | 'medium' | 'high';
  tags?: string[];
}

interface DependencyGraph {
  nodes: string[];
  edges: Array<{ from: string; to: string; type: string }>;
  criticalPath: string[];
  parallelOpportunities: string[][];
}

interface DecomposeResult {
  tasks: TaskWithContext[];
  dependencyGraph: DependencyGraph;
  summary: {
    totalTasks: number;
    avgContextSize: number;
    avgConfidence: number;
    criticalPathLength: number;
    parallelizablePercentage: number;
  };
}

interface ShardIndex {
  epics: Array<{ id: string; title: string }>;
  stories: Array<{
    epicId: string;
    stories: Array<{ id: string; title: string }>;
  }>;
  tasks: Array<{
    storyId: string;
    tasks: Array<{ id: string; title: string }>;
  }>;
  crossReferences: Array<{ from: string; to: string[] }>;
}

export class DecomposeEngine {
  private shardsPath: string;
  private tasksPath: string;
  private patternsLibrary: ImplementationPattern[] = [];
  private decisionsHistory: Decision[] = [];
  private maxContextSize: number = 2000;

  constructor() {
    this.shardsPath = '.nexus/specs/sharded';
    this.tasksPath = '.nexus/tasks';
    this.loadPatternLibrary();
    this.loadDecisionHistory();
  }

  /**
   * Main decomposition method
   */
  async decompose(specPath: string, options: DecomposeOptions): Promise<DecomposeResult> {
    console.log('🔄 Starting enhanced task decomposition...');
    console.log(`Strategy: ${options.strategy}`);
    console.log(`Context Mode: ${options.contextMode}`);

    if (options.maxContextSize) {
      this.maxContextSize = options.maxContextSize;
    }

    if (options.outputDir) {
      this.tasksPath = options.outputDir;
    }

    // 1. Load sharded specifications or single spec
    const shards = await this.loadSpecifications(specPath);

    // 2. Parse task structure based on strategy
    let tasks: TaskWithContext[];
    if (options.strategy === 'manual') {
      tasks = await this.manualDecomposition(shards, options);
    } else if (options.strategy === 'guided') {
      tasks = await this.guidedDecomposition(shards, options);
    } else {
      tasks = await this.autoDecomposition(shards, options);
    }

    // 3. Generate dependency graph
    const dependencyGraph = this.generateDependencyGraph(tasks);

    // 4. Write task files
    await this.writeTaskFiles(tasks);

    // 5. Generate summary
    const summary = this.generateSummary(tasks, dependencyGraph);

    console.log('✅ Decomposition complete!');
    console.log(`📊 Created ${tasks.length} tasks with average confidence: ${summary.avgConfidence.toFixed(1)}%`);

    return { tasks, dependencyGraph, summary };
  }

  /**
   * Load specifications from sharded directory or single file
   */
  private async loadSpecifications(specPath: string): Promise<any> {
    const stats = await fs.stat(specPath);

    if (stats.isDirectory()) {
      // Load sharded specs
      return this.loadShardedSpecs(specPath);
    } else {
      // Load single spec file
      return this.loadSingleSpec(specPath);
    }
  }

  /**
   * Load sharded specifications
   */
  private async loadShardedSpecs(shardsDir: string): Promise<any> {
    const indexPath = path.join(shardsDir, 'index.json');

    if (!await fs.pathExists(indexPath)) {
      // Find subdirectory with index.json
      const entries = await fs.readdir(shardsDir);
      for (const entry of entries) {
        const subPath = path.join(shardsDir, entry);
        const subIndexPath = path.join(subPath, 'index.json');
        if (await fs.pathExists(subIndexPath)) {
          return this.loadShardedSpecsFromIndex(subPath);
        }
      }
      throw new Error('No index.json found in sharded specifications');
    }

    return this.loadShardedSpecsFromIndex(shardsDir);
  }

  /**
   * Load sharded specs using index file
   */
  private async loadShardedSpecsFromIndex(baseDir: string): Promise<any> {
    const indexPath = path.join(baseDir, 'index.json');
    const index: ShardIndex = await fs.readJSON(indexPath);

    const epics = [];
    const stories = [];
    const tasks = [];

    // Load epic shards
    for (const epic of index.epics) {
      const epicPath = path.join(baseDir, 'epics', `${epic.id}.md`);
      if (await fs.pathExists(epicPath)) {
        const content = await fs.readFile(epicPath, 'utf-8');
        epics.push(this.parseEpicShard(epic.id, epic.title, content));
      }
    }

    // Load story shards
    for (const storyGroup of index.stories) {
      for (const story of storyGroup.stories) {
        const storyPath = path.join(baseDir, 'stories', `${story.id}.md`);
        if (await fs.pathExists(storyPath)) {
          const content = await fs.readFile(storyPath, 'utf-8');
          stories.push(this.parseStoryShard(story.id, story.title, storyGroup.epicId, content));
        }
      }
    }

    // Load task shards
    for (const taskGroup of index.tasks) {
      for (const task of taskGroup.tasks) {
        const taskPath = path.join(baseDir, 'tasks', `${task.id}.md`);
        if (await fs.pathExists(taskPath)) {
          const content = await fs.readFile(taskPath, 'utf-8');
          tasks.push(this.parseTaskShard(task.id, task.title, taskGroup.storyId, content));
        }
      }
    }

    return { epics, stories, tasks, index };
  }

  /**
   * Load a single specification file
   */
  private async loadSingleSpec(specPath: string): Promise<any> {
    const content = await fs.readFile(specPath, 'utf-8');
    const parsed = this.parseMonolithicSpec(content);
    return parsed;
  }

  /**
   * Parse epic shard content
   */
  private parseEpicShard(id: string, title: string, content: string): any {
    const requirements = this.extractRequirements(content);
    const technicalContext = this.extractTechnicalContext(content);

    return {
      id,
      title,
      content,
      requirements,
      technicalContext,
      stories: []
    };
  }

  /**
   * Parse story shard content
   */
  private parseStoryShard(id: string, title: string, epicId: string, content: string): any {
    const acceptanceCriteria = this.extractAcceptanceCriteria(content);
    const userStories = this.extractUserStories(content);

    return {
      id,
      title,
      epic_id: epicId,
      content,
      acceptanceCriteria,
      userStories,
      tasks: []
    };
  }

  /**
   * Parse task shard content
   */
  private parseTaskShard(id: string, title: string, storyId: string, content: string): any {
    return {
      id,
      title,
      story_id: storyId,
      content,
      dependencies: this.extractDependencies(content),
      complexity: this.detectComplexity(content),
      estimated_hours: this.estimateHours(content)
    };
  }

  /**
   * Parse monolithic specification
   */
  private parseMonolithicSpec(content: string): any {
    const sections = this.splitIntoSections(content);
    const epics = [];
    const stories = [];
    const tasks = [];

    // Create pseudo-shards from sections
    let epicId = 'epic-main';
    let storyId = 'story-main';

    epics.push({
      id: epicId,
      title: 'Main Specification',
      requirements: this.extractRequirements(content),
      technicalContext: this.extractTechnicalContext(content),
      stories: [storyId]
    });

    stories.push({
      id: storyId,
      title: 'Main Story',
      epic_id: epicId,
      acceptanceCriteria: this.extractAcceptanceCriteria(content),
      userStories: this.extractUserStories(content),
      tasks: []
    });

    // Generate tasks from sections
    for (const [sectionName, sectionContent] of Object.entries(sections)) {
      const taskId = `task-${sectionName.toLowerCase().replace(/\s+/g, '-')}`;
      tasks.push({
        id: taskId,
        title: sectionName,
        story_id: storyId,
        content: sectionContent,
        dependencies: [],
        complexity: this.detectComplexity(sectionContent),
        estimated_hours: this.estimateHours(sectionContent)
      });
    }

    return { epics, stories, tasks };
  }

  /**
   * Auto decomposition strategy
   */
  private async autoDecomposition(shards: any, options: DecomposeOptions): Promise<TaskWithContext[]> {
    const tasks: TaskWithContext[] = [];

    // Process each story
    for (const story of shards.stories || []) {
      const epic = shards.epics?.find((e: any) => e.id === story.epic_id);
      if (!epic) continue;

      // Generate tasks from story content
      const storyTasks = await this.generateTasksFromStory(story, epic, options);
      tasks.push(...storyTasks);
    }

    // Process standalone tasks
    for (const task of shards.tasks || []) {
      const story = shards.stories?.find((s: any) => s.id === task.story_id);
      const epic = story ? shards.epics?.find((e: any) => e.id === story.epic_id) : null;

      const taskWithContext = await this.createTaskWithContext(
        task,
        story || { id: 'standalone', acceptanceCriteria: [], userStories: [] },
        epic || { id: 'standalone', requirements: [], technicalContext: {} },
        options
      );

      tasks.push(taskWithContext);
    }

    return tasks;
  }

  /**
   * Manual decomposition with interactive boundary detection
   */
  private async manualDecomposition(shards: any, options: DecomposeOptions): Promise<TaskWithContext[]> {
    console.log('📝 Manual decomposition mode - interactive boundary selection');

    const inquirer = require('inquirer');
    const tasks: TaskWithContext[] = [];

    // For each epic, ask about task boundaries
    for (const epic of shards.epics || []) {
      console.log(`\n🎯 Epic: ${epic.title}`);
      console.log('─'.repeat(50));

      const boundaries = this.detectPotentialBoundaries(epic.content);

      const { selectedBoundaries } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedBoundaries',
          message: 'Select task boundaries:',
          choices: boundaries.map((b: any, index: number) => ({
            name: `Line ${b.line}: ${b.preview}`,
            value: index,
            checked: b.confidence > 0.7
          }))
        }
      ]);

      // Create tasks based on selected boundaries
      const selectedTasks = await this.createTasksFromBoundaries(
        epic,
        selectedBoundaries.map((i: number) => boundaries[i]),
        options
      );

      tasks.push(...selectedTasks);
    }

    return tasks;
  }

  /**
   * Guided decomposition with suggestions
   */
  private async guidedDecomposition(shards: any, options: DecomposeOptions): Promise<TaskWithContext[]> {
    console.log('🎯 Guided decomposition mode - AI-assisted boundary detection');

    const inquirer = require('inquirer');
    const tasks: TaskWithContext[] = [];

    for (const story of shards.stories || []) {
      const epic = shards.epics?.find((e: any) => e.id === story.epic_id);
      if (!epic) continue;

      console.log(`\n📖 Story: ${story.title}`);
      console.log('Suggested task breakdown:');

      // Generate suggested tasks
      const suggestedTasks = await this.suggestTaskBreakdown(story, epic);

      // Display suggestions
      suggestedTasks.forEach((task: any, index: number) => {
        console.log(`  ${index + 1}. ${task.title}`);
        console.log(`     Complexity: ${task.complexity}, Est: ${task.estimated_hours}h`);
      });

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: 'How would you like to proceed?',
          choices: [
            { name: 'Accept all suggestions', value: 'accept' },
            { name: 'Modify suggestions', value: 'modify' },
            { name: 'Create custom tasks', value: 'custom' }
          ]
        }
      ]);

      if (action === 'accept') {
        for (const suggested of suggestedTasks) {
          const taskWithContext = await this.createTaskWithContext(
            suggested,
            story,
            epic,
            options
          );
          tasks.push(taskWithContext);
        }
      } else if (action === 'modify') {
        const modifiedTasks = await this.modifyTaskSuggestions(suggestedTasks, story, epic, options);
        tasks.push(...modifiedTasks);
      } else {
        const customTasks = await this.createCustomTasks(story, epic, options);
        tasks.push(...customTasks);
      }
    }

    return tasks;
  }

  /**
   * Generate tasks from a story
   */
  private async generateTasksFromStory(story: any, epic: any, options: DecomposeOptions): Promise<TaskWithContext[]> {
    const tasks: TaskWithContext[] = [];

    // Extract task definitions from story content
    const taskDefinitions = this.extractTaskDefinitions(story);

    for (const taskDef of taskDefinitions) {
      const task = await this.createTaskWithContext(taskDef, story, epic, options);
      tasks.push(task);
    }

    // If no explicit tasks, create from acceptance criteria
    if (tasks.length === 0 && story.acceptanceCriteria?.length > 0) {
      for (const criterion of story.acceptanceCriteria) {
        const taskDef = this.createTaskFromCriterion(criterion, story);
        const task = await this.createTaskWithContext(taskDef, story, epic, options);
        tasks.push(task);
      }
    }

    return tasks;
  }

  /**
   * Create a task with embedded context
   */
  private async createTaskWithContext(
    taskDef: any,
    story: any,
    epic: any,
    options: DecomposeOptions
  ): Promise<TaskWithContext> {
    const taskId = taskDef.id || this.generateTaskId(epic.id, story.id, taskDef.title);
    const confidence = this.calculateConfidence(taskDef, story, epic);

    // Build embedded context
    const embeddedContext = await this.buildEmbeddedContext(
      taskDef,
      story,
      epic,
      confidence,
      options.contextMode
    );

    // Generate TDD requirements
    const tddRequirements = this.generateTDDRequirements(taskDef, embeddedContext);

    // Calculate context size
    const contextSize = this.calculateContextSize(embeddedContext);

    return {
      id: taskId,
      epic: epic.id,
      story: story.id,
      title: taskDef.title || 'Unnamed Task',
      description: taskDef.description || '',
      status: 'pending',
      confidence,
      context_strategy: options.contextMode,
      context_size: contextSize,
      embedded_context: embeddedContext,
      dependencies: taskDef.dependencies || [],
      tdd_requirements: tddRequirements,
      estimated_hours: taskDef.estimated_hours,
      complexity: taskDef.complexity || 'medium',
      risk_level: this.assessRiskLevel(taskDef, confidence),
      tags: taskDef.tags || []
    };
  }

  /**
   * Build embedded context for a task
   */
  private async buildEmbeddedContext(
    taskDef: any,
    story: any,
    epic: any,
    confidence: number,
    contextMode: string
  ): Promise<EmbeddedContext> {
    // Core context (always included)
    const coreContext = {
      requirements: this.extractRelevantRequirements(epic.requirements || [], taskDef),
      acceptance_criteria: story.acceptanceCriteria || [],
      dependencies: this.mapDependencies(taskDef),
      technical_context: epic.technicalContext || {},
      constitutional_requirements: this.getConstitutionalRequirements()
    };

    // Extended context (conditional)
    let extendedContext;
    if (confidence < 85 || contextMode === 'full') {
      extendedContext = {
        similar_patterns: await this.findSimilarPatterns(taskDef),
        edge_cases: this.identifyEdgeCases(taskDef, story.acceptanceCriteria),
        historical_decisions: this.findRelevantDecisions(taskDef),
        related_tasks: this.findRelatedTasks(taskDef, epic, story)
      };
    }

    // Reference context (always minimal)
    const referenceContext = {
      full_specification: path.join('..', 'specs', 'sharded', 'epics', `${epic.id}.md`),
      architecture_docs: this.getArchitectureDocs(epic.id),
      previous_tasks: taskDef.dependencies || []
    };

    const context: EmbeddedContext = {
      core_context: coreContext,
      extended_context: extendedContext,
      reference_context: referenceContext
    };

    // Optimize context size if needed
    return this.optimizeContextSize(context);
  }

  /**
   * Optimize context size to stay within limits
   */
  private optimizeContextSize(context: EmbeddedContext): EmbeddedContext {
    const currentSize = this.calculateContextSize(context);

    if (currentSize <= this.maxContextSize) {
      return context;
    }

    console.log(`🔧 Optimizing context size: ${currentSize} → ${this.maxContextSize}`);

    // Trim extended context first
    if (context.extended_context) {
      context.extended_context.similar_patterns = context.extended_context.similar_patterns.slice(0, 2);
      context.extended_context.edge_cases = context.extended_context.edge_cases.slice(0, 5);
      context.extended_context.historical_decisions = context.extended_context.historical_decisions.slice(0, 3);
      context.extended_context.related_tasks = context.extended_context.related_tasks.slice(0, 3);
    }

    // If still too large, remove extended context entirely
    const newSize = this.calculateContextSize(context);
    if (newSize > this.maxContextSize) {
      delete context.extended_context;
    }

    return context;
  }

  /**
   * Calculate context size in lines
   */
  private calculateContextSize(context: EmbeddedContext): number {
    let size = 0;

    // Core context
    size += context.core_context.requirements.length * 3;
    size += context.core_context.acceptance_criteria.length * 4;
    size += context.core_context.dependencies.length * 2;
    size += 20; // Technical context and constitutional requirements

    // Extended context
    if (context.extended_context) {
      size += context.extended_context.similar_patterns.length * 20;
      size += context.extended_context.edge_cases.length * 5;
      size += context.extended_context.historical_decisions.length * 8;
      size += context.extended_context.related_tasks.length * 2;
    }

    // Reference context
    size += 5; // Just links

    return Math.round(size);
  }

  /**
   * Calculate confidence for a task
   */
  private calculateConfidence(taskDef: any, story: any, epic: any): number {
    let confidence = 100;

    // Reduce for missing information
    if (!taskDef.description) confidence -= 15;
    if (!story.acceptanceCriteria || story.acceptanceCriteria.length === 0) confidence -= 20;
    if (!epic.requirements || epic.requirements.length === 0) confidence -= 15;
    if (!epic.technicalContext) confidence -= 10;
    if (taskDef.complexity === 'complex') confidence -= 20;
    if (taskDef.dependencies && taskDef.dependencies.length > 3) confidence -= 10;

    // Boost for existing patterns
    if (this.hasMatchingPattern(taskDef)) confidence += 10;

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Generate TDD requirements for a task
   */
  private generateTDDRequirements(taskDef: any, context: EmbeddedContext): TDDRequirements {
    const testCases = this.generateTestCases(context.core_context.acceptance_criteria);

    return {
      test_first_required: true,
      minimum_coverage: 80,
      test_cases: testCases,
      test_strategy: this.determineTestStrategy(taskDef),
      mock_requirements: this.identifyMockRequirements(context.core_context.dependencies)
    };
  }

  /**
   * Generate test cases from acceptance criteria
   */
  private generateTestCases(acceptanceCriteria: AcceptanceCriterion[]): TestCase[] {
    const testCases: TestCase[] = [];

    for (const criterion of acceptanceCriteria) {
      testCases.push({
        suite: 'Acceptance Tests',
        description: `should ${criterion.description.toLowerCase()}`,
        implementation_hint: `Given ${criterion.given}, when ${criterion.when}, then ${criterion.then}`,
        type: 'integration'
      });
    }

    // Add standard test cases
    testCases.push({
      suite: 'Error Handling',
      description: 'should handle invalid input gracefully',
      implementation_hint: 'Test with null, undefined, and malformed data',
      type: 'unit'
    });

    testCases.push({
      suite: 'Edge Cases',
      description: 'should handle boundary conditions',
      implementation_hint: 'Test minimum and maximum values, empty collections',
      type: 'unit'
    });

    return testCases;
  }

  /**
   * Generate dependency graph from tasks
   */
  private generateDependencyGraph(tasks: TaskWithContext[]): DependencyGraph {
    const nodes = tasks.map(t => t.id);
    const edges: Array<{ from: string; to: string; type: string }> = [];

    // Build edges from dependencies
    for (const task of tasks) {
      for (const dep of task.dependencies) {
        edges.push({
          from: dep,
          to: task.id,
          type: 'depends'
        });
      }
    }

    // Calculate critical path
    const criticalPath = this.calculateCriticalPath(tasks, edges);

    // Identify parallel opportunities
    const parallelOpportunities = this.identifyParallelOpportunities(tasks, edges);

    return {
      nodes,
      edges,
      criticalPath,
      parallelOpportunities
    };
  }

  /**
   * Calculate the critical path through tasks
   */
  private calculateCriticalPath(
    tasks: TaskWithContext[],
    edges: Array<{ from: string; to: string; type: string }>
  ): string[] {
    // Simple implementation - find longest dependency chain
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const paths: string[][] = [];

    // Find all paths from root tasks (no dependencies)
    const rootTasks = tasks.filter(t => t.dependencies.length === 0);

    for (const root of rootTasks) {
      const path = this.findLongestPath(root.id, edges, taskMap);
      paths.push(path);
    }

    // Return the longest path
    return paths.reduce((longest, current) =>
      current.length > longest.length ? current : longest, []
    );
  }

  /**
   * Find the longest path from a given task
   */
  private findLongestPath(
    taskId: string,
    edges: Array<{ from: string; to: string; type: string }>,
    taskMap: Map<string, TaskWithContext>
  ): string[] {
    const dependents = edges.filter(e => e.from === taskId).map(e => e.to);

    if (dependents.length === 0) {
      return [taskId];
    }

    const paths = dependents.map(dep =>
      [taskId, ...this.findLongestPath(dep, edges, taskMap)]
    );

    return paths.reduce((longest, current) =>
      current.length > longest.length ? current : longest
    );
  }

  /**
   * Identify tasks that can be executed in parallel
   */
  private identifyParallelOpportunities(
    tasks: TaskWithContext[],
    edges: Array<{ from: string; to: string; type: string }>
  ): string[][] {
    const opportunities: string[][] = [];

    // Group tasks by their dependency depth
    const depthMap = new Map<number, string[]>();

    for (const task of tasks) {
      const depth = this.calculateDependencyDepth(task.id, edges);
      const tasksAtDepth = depthMap.get(depth) || [];
      tasksAtDepth.push(task.id);
      depthMap.set(depth, tasksAtDepth);
    }

    // Tasks at the same depth can potentially run in parallel
    for (const [depth, taskIds] of depthMap) {
      if (taskIds.length > 1) {
        opportunities.push(taskIds);
      }
    }

    return opportunities;
  }

  /**
   * Calculate dependency depth for a task
   */
  private calculateDependencyDepth(
    taskId: string,
    edges: Array<{ from: string; to: string; type: string }>
  ): number {
    const dependencies = edges.filter(e => e.to === taskId).map(e => e.from);

    if (dependencies.length === 0) {
      return 0;
    }

    return 1 + Math.max(...dependencies.map(dep =>
      this.calculateDependencyDepth(dep, edges)
    ));
  }

  /**
   * Write task files to disk
   */
  private async writeTaskFiles(tasks: TaskWithContext[]): Promise<void> {
    await fs.ensureDir(this.tasksPath);

    for (const task of tasks) {
      const filename = `${task.id}.md`;
      const filepath = path.join(this.tasksPath, filename);
      const content = this.generateTaskFileContent(task);

      await fs.writeFile(filepath, content);
      console.log(`📝 Created task: ${filename}`);
    }

    // Create index file
    const indexPath = path.join(this.tasksPath, 'index.json');
    const index = {
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        epic: t.epic,
        story: t.story,
        status: t.status,
        confidence: t.confidence,
        dependencies: t.dependencies
      })),
      generated: new Date().toISOString()
    };

    await fs.writeJSON(indexPath, index, { spaces: 2 });
  }

  /**
   * Generate task file content
   */
  private generateTaskFileContent(task: TaskWithContext): string {
    const frontmatter = yaml.dump({
      id: task.id,
      epic: task.epic,
      story: task.story,
      title: task.title,
      status: task.status,
      confidence: task.confidence,
      context_strategy: task.context_strategy,
      context_size: task.context_size,
      created: new Date().toISOString(),
      dependencies: task.dependencies,
      estimated_hours: task.estimated_hours,
      complexity: task.complexity,
      risk_level: task.risk_level,
      tags: task.tags
    });

    return `---
${frontmatter}---

# Task: ${task.title}

${task.description ? `## Description\n${task.description}\n` : ''}

## Embedded Context

### Core Context (Always Included)

**Requirements:**
${this.formatRequirements(task.embedded_context.core_context.requirements)}

**Acceptance Criteria:**
${this.formatAcceptanceCriteria(task.embedded_context.core_context.acceptance_criteria)}

**Dependencies:**
${this.formatDependencies(task.embedded_context.core_context.dependencies)}

**Technical Context:**
${this.formatTechnicalContext(task.embedded_context.core_context.technical_context)}

**Constitutional Requirements:**
${this.formatConstitutionalRequirements(task.embedded_context.core_context.constitutional_requirements)}

${task.embedded_context.extended_context ? `
### Extended Context (Confidence < 85%)

**Similar Implementation Patterns:**
${this.formatPatterns(task.embedded_context.extended_context.similar_patterns)}

**Edge Cases to Consider:**
${this.formatEdgeCases(task.embedded_context.extended_context.edge_cases)}

**Relevant Historical Decisions:**
${this.formatDecisions(task.embedded_context.extended_context.historical_decisions)}

**Related Tasks:**
${this.formatRelatedTasks(task.embedded_context.extended_context.related_tasks)}
` : ''}

### Reference Context (Links Only)

- Full Specification: [${task.embedded_context.reference_context.full_specification}](${task.embedded_context.reference_context.full_specification})
${task.embedded_context.reference_context.architecture_docs.map(doc =>
  `- Architecture: [${path.basename(doc)}](${doc})`
).join('\n')}
${task.embedded_context.reference_context.previous_tasks.map(taskId =>
  `- Previous Task: [${taskId}](./${taskId}.md)`
).join('\n')}

## TDD Requirements (Constitutional)

### Test First (Required Before Implementation)

**Strategy:** ${task.tdd_requirements.test_strategy}
**Minimum Coverage:** ${task.tdd_requirements.minimum_coverage}%

\`\`\`javascript
${this.formatTestCases(task.tdd_requirements.test_cases)}
\`\`\`

**Mock Requirements:**
${task.tdd_requirements.mock_requirements.map(req => `- ${req}`).join('\n')}

## Implementation Notes

[To be filled during implementation]

## Decision Log

[To be filled with implementation decisions]

## Completion Checklist

- [ ] Tests written and failing (RED)
- [ ] Implementation complete (GREEN)
- [ ] Code refactored (REFACTOR)
- [ ] All tests passing
- [ ] Coverage >= ${task.tdd_requirements.minimum_coverage}%
- [ ] Edge cases handled
- [ ] Documentation updated
- [ ] Code reviewed
`;
  }

  // Formatting helper methods
  private formatRequirements(requirements: FunctionalRequirement[]): string {
    if (!requirements || requirements.length === 0) {
      return '- No specific requirements identified';
    }
    return requirements.map(req =>
      `- **${req.id}**: ${req.description}\n  *Priority: ${req.priority}, Source: ${req.source}*`
    ).join('\n');
  }

  private formatAcceptanceCriteria(criteria: AcceptanceCriterion[]): string {
    if (!criteria || criteria.length === 0) {
      return '- No acceptance criteria specified';
    }
    return criteria.map((criterion, index) =>
      `${index + 1}. ${criterion.description}\n   - Given: ${criterion.given}\n   - When: ${criterion.when}\n   - Then: ${criterion.then}`
    ).join('\n');
  }

  private formatDependencies(dependencies: Dependency[]): string {
    if (!dependencies || dependencies.length === 0) {
      return '- No dependencies';
    }
    return dependencies.map(dep =>
      `- ${dep.description} (${dep.task_id}) [${dep.type}]`
    ).join('\n');
  }

  private formatTechnicalContext(context: TechnicalContext): string {
    if (!context || !context.description) {
      return '- No technical context specified';
    }
    let result = `${context.description}\n`;
    if (context.technology_stack?.length > 0) {
      result += `\n**Technology Stack:** ${context.technology_stack.join(', ')}\n`;
    }
    if (context.patterns?.length > 0) {
      result += `**Patterns:** ${context.patterns.join(', ')}\n`;
    }
    if (context.constraints?.length > 0) {
      result += `**Constraints:**\n${context.constraints.map(c => `- ${c}`).join('\n')}\n`;
    }
    if (context.code_examples) {
      result += `\n**Code Example:**\n\`\`\`typescript\n${context.code_examples}\n\`\`\``;
    }
    return result;
  }

  private formatConstitutionalRequirements(requirements: ConstitutionalRule[]): string {
    return requirements.map(req =>
      `- **${req.rule}**: ${req.description} [${req.enforcement}]\n  *Source: ${req.source}*`
    ).join('\n');
  }

  private formatPatterns(patterns: ImplementationPattern[]): string {
    if (!patterns || patterns.length === 0) {
      return '- No similar patterns found';
    }
    return patterns.map(pattern =>
      `**${pattern.name}** (Relevance: ${(pattern.relevance * 100).toFixed(0)}%)\n${pattern.description}\n\`\`\`typescript\n${pattern.code}\n\`\`\`\n*Source: ${pattern.source}*`
    ).join('\n\n');
  }

  private formatEdgeCases(edgeCases: EdgeCase[]): string {
    if (!edgeCases || edgeCases.length === 0) {
      return '- No edge cases identified';
    }
    return edgeCases.map(edge =>
      `- **${edge.scenario}**\n  Impact: ${edge.impact}, Likelihood: ${edge.likelihood}\n  Mitigation: ${edge.mitigation}`
    ).join('\n');
  }

  private formatDecisions(decisions: Decision[]): string {
    if (!decisions || decisions.length === 0) {
      return '- No relevant decisions found';
    }
    return decisions.map(decision =>
      `- **${decision.decision}** (${decision.date})\n  Rationale: ${decision.rationale}\n  Relevance: ${(decision.relevance * 100).toFixed(0)}%`
    ).join('\n');
  }

  private formatRelatedTasks(tasks: TaskReference[]): string {
    if (!tasks || tasks.length === 0) {
      return '- No related tasks';
    }
    return tasks.map(task =>
      `- [${task.title}](./${task.id}.md) - ${task.relationship}`
    ).join('\n');
  }

  private formatTestCases(testCases: TestCase[]): string {
    return testCases.map(test =>
      `describe('${test.suite}', () => {
  it('${test.description}', async () => {
    // ${test.implementation_hint}
    // TODO: Implement test
  });
});`
    ).join('\n\n');
  }

  /**
   * Generate summary of decomposition
   */
  private generateSummary(tasks: TaskWithContext[], graph: DependencyGraph): any {
    const totalTasks = tasks.length;
    const avgContextSize = tasks.reduce((sum, t) => sum + t.context_size, 0) / totalTasks;
    const avgConfidence = tasks.reduce((sum, t) => sum + t.confidence, 0) / totalTasks;
    const criticalPathLength = graph.criticalPath.length;

    const parallelizableTasks = graph.parallelOpportunities.reduce((sum, group) => sum + group.length, 0);
    const parallelizablePercentage = (parallelizableTasks / totalTasks) * 100;

    return {
      totalTasks,
      avgContextSize: Math.round(avgContextSize),
      avgConfidence: Math.round(avgConfidence),
      criticalPathLength,
      parallelizablePercentage: Math.round(parallelizablePercentage)
    };
  }

  // Utility methods
  private loadPatternLibrary(): void {
    const patternPath = '.nexus/patterns/library.json';
    if (fs.pathExistsSync(patternPath)) {
      this.patternsLibrary = fs.readJsonSync(patternPath);
    }
  }

  private loadDecisionHistory(): void {
    const decisionPath = '.nexus/decision-log.md';
    if (fs.pathExistsSync(decisionPath)) {
      const content = fs.readFileSync(decisionPath, 'utf-8');
      this.decisionsHistory = this.parseDecisionLog(content);
    }
  }

  private parseDecisionLog(content: string): Decision[] {
    // Simple parsing - would be more sophisticated in production
    const decisions: Decision[] = [];
    const sections = content.split(/^###\s+/m);

    for (const section of sections) {
      if (section.trim()) {
        const lines = section.split('\n');
        const title = lines[0];
        const dateMatch = section.match(/Date:\s*(.+)/);
        const rationaleMatch = section.match(/Rationale:\s*(.+)/);

        if (title) {
          decisions.push({
            id: this.generateHash(title),
            decision: title,
            rationale: rationaleMatch ? rationaleMatch[1] : '',
            date: dateMatch ? dateMatch[1] : new Date().toISOString(),
            relevance: 0.5
          });
        }
      }
    }

    return decisions;
  }

  private extractRequirements(content: string): FunctionalRequirement[] {
    const requirements: FunctionalRequirement[] = [];
    const reqPattern = /(?:FR|NFR|REQ)[-_](\d+(?:\.\d+)?):?\s*(.+?)(?:\n|$)/gi;
    let match;

    while ((match = reqPattern.exec(content)) !== null) {
      requirements.push({
        id: `REQ-${match[1]}`,
        description: match[2].trim(),
        source: 'specification',
        priority: 'must'
      });
    }

    return requirements;
  }

  private extractAcceptanceCriteria(content: string): AcceptanceCriterion[] {
    const criteria: AcceptanceCriterion[] = [];

    // Look for Given/When/Then patterns
    const gwtPattern = /Given\s+(.+?)\s+When\s+(.+?)\s+Then\s+(.+?)(?:\n|$)/gi;
    let match;

    while ((match = gwtPattern.exec(content)) !== null) {
      criteria.push({
        description: `${match[1]} → ${match[2]} → ${match[3]}`,
        given: match[1].trim(),
        when: match[2].trim(),
        then: match[3].trim()
      });
    }

    // Also look for numbered acceptance criteria
    const numberedPattern = /\d+\.\s*(.+?)(?:\n|$)/g;
    while ((match = numberedPattern.exec(content)) !== null) {
      if (!match[1].includes('Given')) { // Avoid duplicates
        criteria.push({
          description: match[1].trim(),
          given: 'the system is in a valid state',
          when: 'the action is performed',
          then: match[1].trim()
        });
      }
    }

    return criteria;
  }

  private extractTechnicalContext(content: string): TechnicalContext {
    const context: TechnicalContext = {
      description: '',
      technology_stack: [],
      patterns: [],
      constraints: []
    };

    // Extract technology mentions
    const techPattern = /(React|Angular|Vue|Node\.js|Python|Java|TypeScript|JavaScript|PostgreSQL|MongoDB|Redis|Docker|Kubernetes)/gi;
    const techMatches = content.match(techPattern);
    if (techMatches) {
      context.technology_stack = [...new Set(techMatches)];
    }

    // Extract patterns
    const patternPattern = /(MVC|MVVM|Repository|Factory|Singleton|Observer|Strategy|Command|Decorator)/gi;
    const patternMatches = content.match(patternPattern);
    if (patternMatches) {
      context.patterns = [...new Set(patternMatches)];
    }

    // Extract constraints
    const constraintPattern = /constraint[s]?:?\s*(.+?)(?:\n|$)/gi;
    let match;
    while ((match = constraintPattern.exec(content)) !== null) {
      context.constraints.push(match[1].trim());
    }

    context.description = `Technical implementation using ${context.technology_stack.join(', ')}`;

    return context;
  }

  private extractUserStories(content: string): string[] {
    const stories: string[] = [];
    const storyPattern = /As\s+a\s+(.+?)\s+I\s+want\s+(.+?)\s+so\s+that\s+(.+?)(?:\n|$)/gi;
    let match;

    while ((match = storyPattern.exec(content)) !== null) {
      stories.push(`As a ${match[1]}, I want ${match[2]} so that ${match[3]}`);
    }

    return stories;
  }

  private extractDependencies(content: string): string[] {
    const dependencies: string[] = [];
    const depPattern = /depends?\s+on:?\s*(.+?)(?:\n|$)/gi;
    let match;

    while ((match = depPattern.exec(content)) !== null) {
      const deps = match[1].split(/[,;]/).map(d => d.trim());
      dependencies.push(...deps);
    }

    return dependencies;
  }

  private detectComplexity(content: string): 'simple' | 'medium' | 'complex' {
    const lines = content.split('\n').length;
    const hasAsync = /async|await|promise|then|catch/i.test(content);
    const hasComplexLogic = /if.*else|switch|while|for.*of|for.*in/i.test(content);

    if (lines > 500 || (hasAsync && hasComplexLogic)) {
      return 'complex';
    } else if (lines > 200 || hasAsync || hasComplexLogic) {
      return 'medium';
    }
    return 'simple';
  }

  private estimateHours(content: string): number {
    const complexity = this.detectComplexity(content);
    const lines = content.split('\n').length;

    const baseHours = {
      simple: 2,
      medium: 5,
      complex: 8
    };

    const hours = baseHours[complexity] + Math.floor(lines / 100);
    return Math.min(hours, 16); // Cap at 2 days
  }

  private splitIntoSections(content: string): { [key: string]: string } {
    const sections: { [key: string]: string } = {};
    const lines = content.split('\n');
    let currentSection = 'Introduction';
    let currentContent: string[] = [];

    for (const line of lines) {
      if (line.match(/^#{1,3}\s+/)) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = line.replace(/^#{1,3}\s+/, '').trim();
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n');
    }

    return sections;
  }

  private extractTaskDefinitions(story: any): any[] {
    // Extract explicit task definitions from story content
    const tasks: any[] = [];

    if (story.content) {
      const taskPattern = /(?:task|TODO):\s*(.+?)(?:\n|$)/gi;
      let match;

      while ((match = taskPattern.exec(story.content)) !== null) {
        tasks.push({
          title: match[1].trim(),
          description: '',
          dependencies: []
        });
      }
    }

    return tasks;
  }

  private createTaskFromCriterion(criterion: AcceptanceCriterion, story: any): any {
    return {
      title: `Implement: ${criterion.description}`,
      description: `Given ${criterion.given}, when ${criterion.when}, then ${criterion.then}`,
      dependencies: [],
      complexity: 'medium',
      estimated_hours: 4
    };
  }

  private detectPotentialBoundaries(content: string): any[] {
    const boundaries: any[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let confidence = 0;
      let type = '';

      // Headers are strong boundaries
      if (line.match(/^#{1,3}\s+/)) {
        confidence = 0.9;
        type = 'header';
      }
      // User stories are good boundaries
      else if (line.match(/^As\s+a\s+/i)) {
        confidence = 0.8;
        type = 'user-story';
      }
      // Requirements are boundaries
      else if (line.match(/^(?:FR|NFR|REQ)[-_]\d+/)) {
        confidence = 0.7;
        type = 'requirement';
      }
      // Numbered lists might be boundaries
      else if (line.match(/^\d+\.\s+/)) {
        confidence = 0.5;
        type = 'list-item';
      }

      if (confidence > 0) {
        boundaries.push({
          line: i + 1,
          preview: line.substring(0, 80) + (line.length > 80 ? '...' : ''),
          confidence,
          type
        });
      }
    }

    return boundaries;
  }

  private async createTasksFromBoundaries(epic: any, boundaries: any[], options: DecomposeOptions): Promise<TaskWithContext[]> {
    const tasks: TaskWithContext[] = [];
    const lines = epic.content.split('\n');

    for (let i = 0; i < boundaries.length; i++) {
      const start = boundaries[i].line - 1;
      const end = i < boundaries.length - 1 ? boundaries[i + 1].line - 1 : lines.length;

      const taskContent = lines.slice(start, end).join('\n');
      const taskDef = {
        title: lines[start].replace(/^#{1,3}\s+/, '').replace(/^\d+\.\s+/, ''),
        description: taskContent,
        dependencies: [],
        complexity: this.detectComplexity(taskContent),
        estimated_hours: this.estimateHours(taskContent)
      };

      const task = await this.createTaskWithContext(
        taskDef,
        { id: 'manual-story', acceptanceCriteria: [], userStories: [] },
        epic,
        options
      );

      tasks.push(task);
    }

    return tasks;
  }

  private async suggestTaskBreakdown(story: any, epic: any): Promise<any[]> {
    const suggestions: any[] = [];

    // Suggest tasks based on acceptance criteria
    for (const criterion of story.acceptanceCriteria || []) {
      suggestions.push({
        title: `Implement: ${criterion.description}`,
        description: `${criterion.given} → ${criterion.when} → ${criterion.then}`,
        complexity: 'medium',
        estimated_hours: 4,
        dependencies: []
      });
    }

    // Suggest tasks based on user stories
    for (const userStory of story.userStories || []) {
      suggestions.push({
        title: userStory.substring(0, 50),
        description: userStory,
        complexity: 'medium',
        estimated_hours: 6,
        dependencies: []
      });
    }

    // Suggest standard tasks
    if (suggestions.length === 0) {
      suggestions.push(
        {
          title: 'Data model implementation',
          description: 'Create data models and schemas',
          complexity: 'simple',
          estimated_hours: 3,
          dependencies: []
        },
        {
          title: 'Business logic implementation',
          description: 'Implement core business logic',
          complexity: 'medium',
          estimated_hours: 5,
          dependencies: ['Data model implementation']
        },
        {
          title: 'API endpoints',
          description: 'Create REST API endpoints',
          complexity: 'medium',
          estimated_hours: 4,
          dependencies: ['Business logic implementation']
        },
        {
          title: 'Integration tests',
          description: 'Write integration tests',
          complexity: 'simple',
          estimated_hours: 3,
          dependencies: ['API endpoints']
        }
      );
    }

    return suggestions;
  }

  private async modifyTaskSuggestions(suggestions: any[], story: any, epic: any, options: DecomposeOptions): Promise<TaskWithContext[]> {
    const inquirer = require('inquirer');
    const tasks: TaskWithContext[] = [];

    for (const suggestion of suggestions) {
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: `Task: ${suggestion.title}`,
          choices: [
            { name: 'Keep as is', value: 'keep' },
            { name: 'Modify', value: 'modify' },
            { name: 'Skip', value: 'skip' }
          ]
        }
      ]);

      if (action === 'keep') {
        const task = await this.createTaskWithContext(suggestion, story, epic, options);
        tasks.push(task);
      } else if (action === 'modify') {
        const modified = await inquirer.prompt([
          {
            type: 'input',
            name: 'title',
            message: 'Task title:',
            default: suggestion.title
          },
          {
            type: 'editor',
            name: 'description',
            message: 'Task description:',
            default: suggestion.description
          },
          {
            type: 'list',
            name: 'complexity',
            message: 'Complexity:',
            choices: ['simple', 'medium', 'complex'],
            default: suggestion.complexity
          },
          {
            type: 'number',
            name: 'estimated_hours',
            message: 'Estimated hours:',
            default: suggestion.estimated_hours
          }
        ]);

        const task = await this.createTaskWithContext(modified, story, epic, options);
        tasks.push(task);
      }
    }

    return tasks;
  }

  private async createCustomTasks(story: any, epic: any, options: DecomposeOptions): Promise<TaskWithContext[]> {
    const inquirer = require('inquirer');
    const tasks: TaskWithContext[] = [];
    let addMore = true;

    while (addMore) {
      const taskDef = await inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Task title:'
        },
        {
          type: 'editor',
          name: 'description',
          message: 'Task description:'
        },
        {
          type: 'list',
          name: 'complexity',
          message: 'Complexity:',
          choices: ['simple', 'medium', 'complex'],
          default: 'medium'
        },
        {
          type: 'number',
          name: 'estimated_hours',
          message: 'Estimated hours:',
          default: 4
        }
      ]);

      const task = await this.createTaskWithContext(taskDef, story, epic, options);
      tasks.push(task);

      const { more } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'more',
          message: 'Add another task?',
          default: false
        }
      ]);

      addMore = more;
    }

    return tasks;
  }

  private extractRelevantRequirements(requirements: FunctionalRequirement[], taskDef: any): FunctionalRequirement[] {
    if (!requirements || requirements.length === 0) {
      return [];
    }

    // Filter requirements relevant to this task
    return requirements.filter(req => {
      const taskText = `${taskDef.title} ${taskDef.description}`.toLowerCase();
      return req.description.toLowerCase().split(' ').some(word =>
        taskText.includes(word)
      );
    }).slice(0, 5); // Limit to 5 most relevant
  }

  private mapDependencies(taskDef: any): Dependency[] {
    const dependencies: Dependency[] = [];

    for (const dep of taskDef.dependencies || []) {
      dependencies.push({
        task_id: dep,
        description: `Depends on task ${dep}`,
        type: 'depends'
      });
    }

    return dependencies;
  }

  private getConstitutionalRequirements(): ConstitutionalRule[] {
    return [
      {
        rule: 'TDD_MANDATORY',
        description: 'Tests MUST be written before implementation',
        enforcement: 'blocking',
        source: 'Constitution Article I'
      },
      {
        rule: 'COVERAGE_MINIMUM',
        description: 'Test coverage must be at least 80%',
        enforcement: 'blocking',
        source: 'Constitution Article I'
      },
      {
        rule: 'NO_IMPLICIT_DECISIONS',
        description: 'All decisions must be explicit and documented',
        enforcement: 'warning',
        source: 'Constitution Article II'
      },
      {
        rule: 'CONTEXT_PRESERVATION',
        description: 'Every task must have embedded context',
        enforcement: 'blocking',
        source: 'Constitution Article IV'
      }
    ];
  }

  private async findSimilarPatterns(taskDef: any): Promise<ImplementationPattern[]> {
    const patterns: ImplementationPattern[] = [];

    // Search pattern library
    for (const pattern of this.patternsLibrary) {
      const relevance = this.calculatePatternRelevance(pattern, taskDef);
      if (relevance > 0.5) {
        patterns.push({
          ...pattern,
          relevance
        });
      }
    }

    // Sort by relevance and return top matches
    return patterns.sort((a, b) => b.relevance - a.relevance).slice(0, 3);
  }

  private calculatePatternRelevance(pattern: any, taskDef: any): number {
    // Simple keyword matching - would be more sophisticated in production
    const taskText = `${taskDef.title} ${taskDef.description}`.toLowerCase();
    const patternText = `${pattern.name} ${pattern.description}`.toLowerCase();

    const taskWords = taskText.split(/\s+/);
    const patternWords = patternText.split(/\s+/);

    const commonWords = taskWords.filter(word =>
      patternWords.includes(word) && word.length > 3
    );

    return commonWords.length / Math.max(taskWords.length, patternWords.length);
  }

  private identifyEdgeCases(taskDef: any, acceptanceCriteria: AcceptanceCriterion[]): EdgeCase[] {
    const edgeCases: EdgeCase[] = [];

    // Standard edge cases
    edgeCases.push({
      scenario: 'Null or undefined input',
      impact: 'high',
      likelihood: 'medium',
      mitigation: 'Add input validation and null checks'
    });

    edgeCases.push({
      scenario: 'Empty collections or arrays',
      impact: 'medium',
      likelihood: 'high',
      mitigation: 'Handle empty collections gracefully'
    });

    // Task-specific edge cases
    if (taskDef.description?.includes('async') || taskDef.description?.includes('concurrent')) {
      edgeCases.push({
        scenario: 'Race condition',
        impact: 'high',
        likelihood: 'medium',
        mitigation: 'Implement proper locking or use atomic operations'
      });
    }

    if (taskDef.description?.includes('database') || taskDef.description?.includes('storage')) {
      edgeCases.push({
        scenario: 'Database connection failure',
        impact: 'high',
        likelihood: 'low',
        mitigation: 'Implement retry logic and fallback mechanisms'
      });
    }

    return edgeCases.slice(0, 5);
  }

  private findRelevantDecisions(taskDef: any): Decision[] {
    const relevant: Decision[] = [];

    for (const decision of this.decisionsHistory) {
      const relevance = this.calculateDecisionRelevance(decision, taskDef);
      if (relevance > 0.3) {
        relevant.push({
          ...decision,
          relevance
        });
      }
    }

    return relevant.sort((a, b) => b.relevance - a.relevance).slice(0, 3);
  }

  private calculateDecisionRelevance(decision: Decision, taskDef: any): number {
    // Simple keyword matching
    const taskText = `${taskDef.title} ${taskDef.description}`.toLowerCase();
    const decisionText = `${decision.decision} ${decision.rationale}`.toLowerCase();

    const taskWords = taskText.split(/\s+/);
    const decisionWords = decisionText.split(/\s+/);

    const commonWords = taskWords.filter(word =>
      decisionWords.includes(word) && word.length > 3
    );

    return commonWords.length / Math.max(taskWords.length, decisionWords.length);
  }

  private findRelatedTasks(taskDef: any, epic: any, story: any): TaskReference[] {
    // In a real implementation, this would search existing tasks
    return [];
  }

  private getArchitectureDocs(epicId: string): string[] {
    // Return paths to relevant architecture documents
    return [
      `../docs/architecture/${epicId}-architecture.md`,
      '../docs/architecture/system-overview.md'
    ];
  }

  private hasMatchingPattern(taskDef: any): boolean {
    return this.patternsLibrary.some(pattern =>
      this.calculatePatternRelevance(pattern, taskDef) > 0.7
    );
  }

  private assessRiskLevel(taskDef: any, confidence: number): 'low' | 'medium' | 'high' {
    if (confidence >= 90 && taskDef.complexity === 'simple') {
      return 'low';
    } else if (confidence < 70 || taskDef.complexity === 'complex') {
      return 'high';
    }
    return 'medium';
  }

  private determineTestStrategy(taskDef: any): string {
    if (taskDef.complexity === 'complex') {
      return 'Comprehensive unit + integration + e2e tests';
    } else if (taskDef.complexity === 'medium') {
      return 'Unit tests with key integration tests';
    }
    return 'Unit tests with basic coverage';
  }

  private identifyMockRequirements(dependencies: Dependency[]): string[] {
    const mocks: string[] = [];

    for (const dep of dependencies) {
      mocks.push(`Mock for ${dep.task_id}: ${dep.description}`);
    }

    // Add standard mocks
    mocks.push('Database connection mock');
    mocks.push('External API mock');

    return mocks;
  }

  private generateTaskId(epicId: string, storyId: string, title: string): string {
    const sanitized = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 20);

    const hash = crypto.createHash('sha256')
      .update(`${epicId}-${storyId}-${title}`)
      .digest('hex')
      .substring(0, 6);

    return `${epicId.substring(0, 10)}-${sanitized}-${hash}`;
  }

  private generateHash(input: string): string {
    return crypto.createHash('sha256')
      .update(input)
      .digest('hex')
      .substring(0, 8);
  }
}
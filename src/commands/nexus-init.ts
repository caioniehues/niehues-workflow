import * as fs from 'fs-extra';
import * as path from 'path';
import * as inquirer from 'inquirer';
import { execSync } from 'child_process';
import { ConstitutionalEnforcer } from '../engine/constitution/ConstitutionalEnforcer';
import { TemplateHelpers, TemplateContext } from '../templates/TemplateHelpers';
import { ProjectDiscovery } from '../engine/discovery/ProjectDiscovery';
import { MetricsCollector } from '../engine/metrics/MetricsCollector';

export interface InitOptions {
  force?: boolean;
  template?: string;
  skipDiscovery?: boolean;
}

export class NexusInitCommand {
  private readonly NEXUS_DIR = '.nexus';
  private readonly TEMPLATES_DIR = path.join(__dirname, '../../templates');
  private templateHelpers: TemplateHelpers;
  private discovery: ProjectDiscovery;
  private metrics: MetricsCollector;

  constructor() {
    this.templateHelpers = new TemplateHelpers();
    this.discovery = new ProjectDiscovery();
    this.metrics = new MetricsCollector();
  }

  /**
   * Execute the initialization command
   */
  async execute(options: InitOptions = {}): Promise<void> {
    console.log('🚀 Initializing Nexus Enhanced Workflow');
    console.log('Version: 2.0.0');
    console.log('─'.repeat(50));

    try {
      // Phase 1: Pre-flight checks
      await this.performPreflightChecks(options);

      // Phase 2: Project discovery
      const context = await this.discoverProject(options);

      // Phase 3: Interactive configuration
      if (!options.skipDiscovery) {
        await this.interactiveConfiguration(context);
      }

      // Phase 4: Create directory structure
      await this.createDirectoryStructure();

      // Phase 5: Generate foundation files
      await this.generateFoundationFiles(context);

      // Phase 6: Setup enforcement mechanisms
      await this.setupEnforcement(context);

      // Phase 7: Initialize metrics
      await this.initializeMetrics(context);

      // Phase 8: Create initial tasks
      await this.createInitialTasks();

      // Phase 9: Final validation
      await this.validateSetup();

      this.printSuccessMessage();
    } catch (error: any) {
      console.error('❌ Initialization failed:', error.message);
      console.error('Run with --force to overwrite existing setup');
      process.exit(1);
    }
  }

  /**
   * Perform pre-flight checks before initialization
   */
  private async performPreflightChecks(options: InitOptions): Promise<void> {
    console.log('\n📋 Phase 1: Pre-flight Checks');

    // Check if .nexus already exists
    if (await fs.pathExists(this.NEXUS_DIR)) {
      if (!options.force) {
        throw new Error('.nexus directory already exists. Use --force to overwrite.');
      }
      console.log('  ⚠️  Overwriting existing .nexus directory (--force)');
      await fs.remove(this.NEXUS_DIR);
    }

    // Check for git repository
    const isGitRepo = await this.checkGitRepository();
    if (!isGitRepo) {
      console.log('  ⚠️  Not a git repository. Initializing git...');
      execSync('git init', { stdio: 'pipe' });
    }

    // Check for package.json or equivalent
    const projectType = await this.detectProjectType();
    console.log(`  ✓ Detected project type: ${projectType}`);

    // Check for existing CI/CD
    const cicdPlatform = await this.detectCICD();
    if (cicdPlatform) {
      console.log(`  ✓ Detected CI/CD: ${cicdPlatform}`);
    }

    console.log('  ✓ Pre-flight checks complete');
  }

  /**
   * Discover project characteristics
   */
  private async discoverProject(options: InitOptions): Promise<TemplateContext> {
    console.log('\n🔍 Phase 2: Project Discovery');

    const discoveries = await this.discovery.runDiscovery();
    const context = this.templateHelpers.generateDefaultContext(discoveries.projectName);

    console.log('  ✓ Discovered project characteristics:');
    console.log(`    - Language: ${discoveries.language}`);
    console.log(`    - Framework: ${discoveries.framework || 'None detected'}`);
    console.log(`    - Test Framework: ${discoveries.testFramework || 'None detected'}`);
    console.log(`    - Package Manager: ${discoveries.packageManager}`);
    console.log(`    - Database: ${discoveries.database || 'None detected'}`);

    // Merge discoveries into context
    Object.assign(context, {
      project_name: discoveries.projectName,
      primary_language: discoveries.language,
      primary_framework: discoveries.framework,
      database: discoveries.database,
      test_framework_unit: discoveries.testFramework,
      package_manager: discoveries.packageManager
    });

    // Apply template if specified
    if (options.template) {
      const templateOverrides = await this.loadTemplate(options.template);
      Object.assign(context, templateOverrides);
    }

    return context;
  }

  /**
   * Interactive configuration wizard
   */
  private async interactiveConfiguration(context: TemplateContext): Promise<void> {
    console.log('\n💬 Phase 3: Interactive Configuration');
    console.log('Let\'s configure your project\'s constitutional framework...\n');

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'project_name',
        message: 'Project name:',
        default: context.project_name
      },
      {
        type: 'input',
        name: 'project_mission',
        message: 'Project mission (one line):',
        default: 'To deliver high-quality software that solves real problems'
      },
      {
        type: 'input',
        name: 'project_vision',
        message: 'Project vision (one line):',
        default: 'A robust, maintainable solution that scales with user needs'
      },
      {
        type: 'number',
        name: 'test_coverage_min',
        message: 'Minimum test coverage (%):',
        default: context.test_coverage_min,
        validate: (input) => input >= 0 && input <= 100
      },
      {
        type: 'number',
        name: 'confidence_threshold',
        message: 'Confidence threshold for questioning (%):',
        default: context.confidence_threshold,
        validate: (input) => input >= 50 && input <= 100
      },
      {
        type: 'list',
        name: 'branching_strategy',
        message: 'Git branching strategy:',
        choices: ['git-flow', 'github-flow', 'gitlab-flow', 'trunk-based'],
        default: context.branching_strategy
      },
      {
        type: 'checkbox',
        name: 'project_values',
        message: 'Select project values:',
        choices: [
          { name: 'Quality over Speed', value: 'quality' },
          { name: 'Documentation First', value: 'documentation' },
          { name: 'Security by Design', value: 'security' },
          { name: 'Performance Critical', value: 'performance' },
          { name: 'User Experience Focus', value: 'ux' },
          { name: 'Scalability Priority', value: 'scalability' },
          { name: 'Maintainability First', value: 'maintainability' }
        ],
        default: ['quality', 'maintainability']
      }
    ]);

    // Process project values
    answers.project_values = answers.project_values.map((value: string) => ({
      name: value,
      description: this.getValueDescription(value)
    }));

    Object.assign(context, answers);

    // Set some architecture principles by default
    context.architecture_principles = [
      {
        principle: 'Single Responsibility',
        rationale: 'Each module should have one reason to change',
        implications: 'More files, clearer boundaries, easier testing'
      },
      {
        principle: 'DRY (Don\'t Repeat Yourself)',
        rationale: 'Avoid duplication to reduce maintenance burden',
        implications: 'Need good abstraction skills'
      },
      {
        principle: 'KISS (Keep It Simple)',
        rationale: 'Simple solutions are easier to understand and maintain',
        implications: 'May sacrifice some optimization'
      }
    ];
  }

  /**
   * Create the Nexus directory structure
   */
  private async createDirectoryStructure(): Promise<void> {
    console.log('\n📁 Phase 4: Creating Directory Structure');

    const directories = [
      '.nexus',
      '.nexus/brainstorms',
      '.nexus/specs',
      '.nexus/specs/monolithic',
      '.nexus/specs/sharded',
      '.nexus/specs/sharded/epics',
      '.nexus/specs/sharded/stories',
      '.nexus/tasks',
      '.nexus/patterns',
      '.nexus/templates',
      '.nexus/metrics',
      '.claude',
      '.claude/commands',
      '.claude/agents',
      'src/engine',
      'src/engine/constitution',
      'src/engine/context',
      'src/engine/agents',
      'src/engine/sharding',
      'src/engine/metrics',
      'src/engine/questioning',
      'src/engine/learning',
      'src/pipeline',
      'src/validation',
      'src/types',
      'tests/unit',
      'tests/integration',
      'tests/e2e',
      'docs/examples',
      'docs/architecture',
      'docs/api'
    ];

    for (const dir of directories) {
      await fs.ensureDir(dir);
      console.log(`  ✓ Created ${dir}/`);
    }
  }

  /**
   * Generate foundation files from templates
   */
  private async generateFoundationFiles(context: TemplateContext): Promise<void> {
    console.log('\n📝 Phase 5: Generating Foundation Files');

    // Add timestamp and other computed values
    context.timestamp = new Date().toISOString();
    context.initial_date = new Date().toISOString().split('T')[0];
    context.initial_deciders = 'Team';
    context.next_review_date = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const files = [
      {
        template: 'constitution.md.hbs',
        output: '.nexus/constitution.md',
        name: 'Constitution'
      },
      {
        template: 'project-dna.md.hbs',
        output: '.nexus/project-dna.md',
        name: 'Project DNA'
      },
      {
        template: 'quality-rules.md.hbs',
        output: '.nexus/quality-rules.md',
        name: 'Quality Rules'
      },
      {
        template: 'decision-log.md.hbs',
        output: '.nexus/decision-log.md',
        name: 'Decision Log'
      }
    ];

    for (const file of files) {
      const templatePath = path.join(this.TEMPLATES_DIR, file.template);
      await this.templateHelpers.renderToFile(templatePath, file.output, context);
      console.log(`  ✓ Generated ${file.name}: ${file.output}`);
    }

    // Create initial metrics file
    await this.createMetricsFile();
    console.log('  ✓ Generated Metrics: .nexus/metrics.yaml');
  }

  /**
   * Setup enforcement mechanisms
   */
  private async setupEnforcement(context: TemplateContext): Promise<void> {
    console.log('\n🛡️ Phase 6: Setting Up Enforcement Mechanisms');

    // Create git hooks
    await this.createGitHooks(context);
    console.log('  ✓ Created git hooks for TDD enforcement');

    // Create VS Code settings
    await this.createVSCodeSettings(context);
    console.log('  ✓ Created VS Code workspace settings');

    // Create CI/CD templates (GitHub Actions for now)
    if (!await fs.pathExists('.github/workflows')) {
      await this.createCIPipeline(context);
      console.log('  ✓ Created CI/CD pipeline configuration');
    }

    // Initialize constitutional enforcer
    const enforcer = new ConstitutionalEnforcer();
    await enforcer.initialize({
      constitutionPath: '.nexus/constitution.md',
      strictMode: true
    });
    console.log('  ✓ Initialized constitutional enforcer');
  }

  /**
   * Create git hooks for enforcement
   */
  private async createGitHooks(context: TemplateContext): Promise<void> {
    const hooksDir = '.git/hooks';
    await fs.ensureDir(hooksDir);

    // Pre-commit hook
    const preCommitHook = `#!/bin/bash
# Nexus Enhanced Workflow - Pre-commit Hook

echo "🔍 Nexus: Validating TDD compliance..."

# Check if tests exist for new files
NEW_FILES=$(git diff --cached --name-only --diff-filter=A | grep -E '\\.(ts|js|tsx|jsx)$' | grep -v test | grep -v spec)

for file in $NEW_FILES; do
  TEST_FILE=$(echo $file | sed 's/\\.\\(ts\\|js\\|tsx\\|jsx\\)$/.test.\\1/')
  SPEC_FILE=$(echo $file | sed 's/\\.\\(ts\\|js\\|tsx\\|jsx\\)$/.spec.\\1/')

  if [ ! -f "$TEST_FILE" ] && [ ! -f "$SPEC_FILE" ]; then
    echo "❌ No test file found for $file"
    echo "   Please create $TEST_FILE or $SPEC_FILE"
    exit 1
  fi
done

echo "✅ Nexus: TDD compliance validated"
`;

    await fs.writeFile(path.join(hooksDir, 'pre-commit'), preCommitHook);
    await fs.chmod(path.join(hooksDir, 'pre-commit'), '755');
  }

  /**
   * Create VS Code settings
   */
  private async createVSCodeSettings(context: TemplateContext): Promise<void> {
    const settings = {
      "nexus.enabled": true,
      "nexus.tdd.enforceRedGreenRefactor": true,
      "nexus.tdd.blockCodeWithoutTests": true,
      "nexus.coverage.minimum": context.test_coverage_min,
      "nexus.questioning.confidenceThreshold": context.confidence_threshold,
      "nexus.context.minLines": context.min_context_lines,
      "nexus.context.maxLines": context.max_context_lines,
      "editor.formatOnSave": true,
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
      },
      "files.exclude": {
        "**/.nexus/metrics": true,
        "**/.nexus/patterns": true
      }
    };

    await fs.ensureDir('.vscode');
    await fs.writeJSON('.vscode/settings.json', settings, { spaces: 2 });
  }

  /**
   * Create CI/CD pipeline configuration
   */
  private async createCIPipeline(context: TemplateContext): Promise<void> {
    const githubActions = `name: Nexus Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run Tests with Coverage
        run: |
          npm test -- --coverage
          echo "Minimum coverage: ${context.test_coverage_min}%"

      - name: Run Security Scan
        run: |
          npm audit
`;

    await fs.ensureDir('.github/workflows');
    await fs.writeFile('.github/workflows/nexus-validation.yml', githubActions);
  }

  /**
   * Initialize metrics tracking
   */
  private async initializeMetrics(context: TemplateContext): Promise<void> {
    console.log('\n📊 Phase 7: Initializing Metrics');

    const initialMetrics = {
      project: context.project_name,
      initialized: new Date().toISOString(),
      baseline: {
        test_coverage: 0,
        code_complexity: 0,
        technical_debt: 0,
        documentation_coverage: 0
      },
      targets: {
        test_coverage: context.test_coverage_min,
        code_complexity: context.cyclomatic_function || 10,
        technical_debt: 0,
        documentation_coverage: 80
      },
      history: []
    };

    await this.metrics.initialize(initialMetrics);
    console.log('  ✓ Metrics baseline established');
    console.log('  ✓ Tracking enabled for workflow performance');
  }

  /**
   * Create initial tasks using STM
   */
  private async createInitialTasks(): Promise<void> {
    console.log('\n📋 Phase 8: Creating Initial Tasks');

    const tasks = [
      {
        title: 'Complete project DNA documentation',
        description: 'Fill in remaining project DNA sections with team',
        priority: 'high',
        tags: ['setup', 'documentation']
      },
      {
        title: 'Configure CI/CD pipeline',
        description: 'Set up automated testing and deployment',
        priority: 'high',
        tags: ['setup', 'automation']
      },
      {
        title: 'Create first specification',
        description: 'Use /nexus-brainstorm to create your first feature spec',
        priority: 'medium',
        tags: ['workflow', 'specification']
      },
      {
        title: 'Team onboarding',
        description: 'Onboard team members to Nexus workflow',
        priority: 'medium',
        tags: ['team', 'training']
      }
    ];

    // Create tasks using STM if available
    try {
      for (const task of tasks) {
        execSync(`stm add "${task.title}" --description "${task.description}" --tags "${task.tags.join(',')}"`, {
          stdio: 'pipe'
        });
      }
      console.log(`  ✓ Created ${tasks.length} initial tasks in STM`);
    } catch {
      // Fallback to creating a tasks file
      await fs.writeJSON('.nexus/tasks/initial-tasks.json', tasks, { spaces: 2 });
      console.log('  ✓ Created initial tasks file');
    }
  }

  /**
   * Validate the setup is complete
   */
  private async validateSetup(): Promise<void> {
    console.log('\n✅ Phase 9: Validating Setup');

    const validations = [
      { name: 'Constitution exists', check: () => fs.pathExists('.nexus/constitution.md') },
      { name: 'Project DNA exists', check: () => fs.pathExists('.nexus/project-dna.md') },
      { name: 'Quality rules exist', check: () => fs.pathExists('.nexus/quality-rules.md') },
      { name: 'Decision log exists', check: () => fs.pathExists('.nexus/decision-log.md') },
      { name: 'Git hooks installed', check: () => fs.pathExists('.git/hooks/pre-commit') },
      { name: 'Metrics initialized', check: () => fs.pathExists('.nexus/metrics.yaml') },
      { name: 'Directory structure complete', check: () => this.validateDirectories() }
    ];

    let allValid = true;
    for (const validation of validations) {
      const isValid = await validation.check();
      console.log(`  ${isValid ? '✓' : '❌'} ${validation.name}`);
      if (!isValid) allValid = false;
    }

    if (!allValid) {
      throw new Error('Setup validation failed. Please check the errors above.');
    }
  }

  /**
   * Validate required directories exist
   */
  private async validateDirectories(): Promise<boolean> {
    const requiredDirs = [
      '.nexus', '.nexus/brainstorms', '.nexus/specs', '.nexus/tasks',
      '.claude', '.claude/commands', 'src/engine', 'tests'
    ];

    for (const dir of requiredDirs) {
      if (!(await fs.pathExists(dir))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Print success message with next steps
   */
  private printSuccessMessage(): void {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 NEXUS ENHANCED WORKFLOW INITIALIZED SUCCESSFULLY! 🎉');
    console.log('='.repeat(60));
    console.log('\n📚 Next Steps:');
    console.log('  1. Review and customize .nexus/constitution.md');
    console.log('  2. Complete .nexus/project-dna.md with your team');
    console.log('  3. Run /nexus-brainstorm to start your first feature');
    console.log('  4. Use /nexus-specify to create specifications');
    console.log('  5. Use /nexus-implement for TDD development');
    console.log('\n💡 Commands Available:');
    console.log('  • /nexus-brainstorm - Generate 20+ approaches');
    console.log('  • /nexus-specify - Create detailed specifications');
    console.log('  • /nexus-shard - Break down large specs');
    console.log('  • /nexus-decompose - Create task files');
    console.log('  • /nexus-implement - TDD implementation');
    console.log('\n📖 Documentation: docs/nexus-enhanced-guide.md');
    console.log('🆘 Help: /nexus-help');
    console.log('\n' + '='.repeat(60));
  }

  // Helper methods
  private async checkGitRepository(): Promise<boolean> {
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  private async detectProjectType(): Promise<string> {
    if (await fs.pathExists('package.json')) return 'Node.js/JavaScript';
    if (await fs.pathExists('Cargo.toml')) return 'Rust';
    if (await fs.pathExists('go.mod')) return 'Go';
    if (await fs.pathExists('pom.xml')) return 'Java/Maven';
    if (await fs.pathExists('build.gradle')) return 'Java/Gradle';
    if (await fs.pathExists('requirements.txt')) return 'Python';
    if (await fs.pathExists('Gemfile')) return 'Ruby';
    if (await fs.pathExists('composer.json')) return 'PHP';
    return 'Unknown';
  }

  private async detectCICD(): Promise<string | null> {
    if (await fs.pathExists('.github/workflows')) return 'GitHub Actions';
    if (await fs.pathExists('.gitlab-ci.yml')) return 'GitLab CI';
    if (await fs.pathExists('Jenkinsfile')) return 'Jenkins';
    if (await fs.pathExists('.circleci')) return 'CircleCI';
    if (await fs.pathExists('azure-pipelines.yml')) return 'Azure DevOps';
    return null;
  }

  private async loadTemplate(templateName: string): Promise<any> {
    const templatePath = path.join(this.TEMPLATES_DIR, 'presets', `${templateName}.json`);
    if (await fs.pathExists(templatePath)) {
      return fs.readJSON(templatePath);
    }
    return {};
  }

  private getValueDescription(value: string): string {
    const descriptions: { [key: string]: string } = {
      'quality': 'Prioritize code quality and maintainability over speed',
      'documentation': 'Comprehensive documentation for all components',
      'security': 'Security considerations in every design decision',
      'performance': 'Optimize for performance from the start',
      'ux': 'User experience drives technical decisions',
      'scalability': 'Design for scale from day one',
      'maintainability': 'Code that is easy to understand and modify'
    };
    return descriptions[value] || value;
  }

  private async createMetricsFile(): Promise<void> {
    const yaml = await import('js-yaml');
    const metrics = {
      version: '1.0.0',
      project_initialized: new Date().toISOString(),
      workflow_metrics: {
        total_brainstorms: 0,
        total_specifications: 0,
        total_shards: 0,
        total_tasks: 0,
        tasks_completed: 0,
        average_confidence: 0,
        average_context_size: 0
      },
      quality_metrics: {
        test_coverage: 0,
        code_complexity: 0,
        documentation_coverage: 0,
        technical_debt: 0
      },
      performance_metrics: {
        average_task_time: 0,
        specification_to_implementation: 0,
        rework_rate: 0,
        first_pass_success: 0
      }
    };

    await fs.writeFile('.nexus/metrics.yaml', yaml.dump(metrics));
  }
}

// CLI entry point
if (require.main === module) {
  const command = new NexusInitCommand();

  const args = process.argv.slice(2);
  const options: InitOptions = {
    force: args.includes('--force'),
    skipDiscovery: args.includes('--skip-discovery')
  };

  const templateArg = args.find(arg => arg.startsWith('--template='));
  if (templateArg) {
    options.template = templateArg.split('=')[1];
  }

  command.execute(options).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
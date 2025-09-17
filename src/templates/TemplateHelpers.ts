import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export interface TemplateContext {
  project_name: string;
  timestamp: string;
  initial_date: string;
  initial_deciders: string;
  next_review_date: string;
  test_coverage_min: number;
  confidence_threshold: number;
  min_context_lines: number;
  max_context_lines: number;
  max_file_lines: number;
  cyclomatic_function: number;
  max_nesting_depth: number;
  branching_strategy: string;
  commit_format: string;
  primary_language: string;
  primary_framework?: string;
  database?: string;
  test_framework_unit?: string;
  test_framework_integration?: string;
  test_framework_e2e?: string;
  ci_cd_platform?: string;
  hosting_platform?: string;
  monitoring_solution?: string;
  project_mission?: string;
  project_vision?: string;
  project_values?: Array<{ name: string; description: string }>;
  architecture_principles?: Array<{
    principle: string;
    rationale: string;
    implications: string;
  }>;
  external_dependencies?: Array<{
    name: string;
    version: string;
    purpose: string;
  }>;
  [key: string]: any;
}

export class TemplateHelpers {
  private handlebars: typeof Handlebars;

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerHelpers();
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHelpers(): void {
    // Equality helper for conditionals
    this.handlebars.registerHelper('eq', (a: any, b: any) => a === b);

    // Not equal helper
    this.handlebars.registerHelper('neq', (a: any, b: any) => a !== b);

    // Greater than helper
    this.handlebars.registerHelper('gt', (a: number, b: number) => a > b);

    // Less than helper
    this.handlebars.registerHelper('lt', (a: number, b: number) => a < b);

    // Date formatting helper
    this.handlebars.registerHelper('formatDate', (date: string | Date) => {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    });

    // Uppercase helper
    this.handlebars.registerHelper('uppercase', (str: string) =>
      str ? str.toUpperCase() : ''
    );

    // Lowercase helper
    this.handlebars.registerHelper('lowercase', (str: string) =>
      str ? str.toLowerCase() : ''
    );

    // JSON stringify helper
    this.handlebars.registerHelper('json', (obj: any) =>
      JSON.stringify(obj, null, 2)
    );

    // Array length helper
    this.handlebars.registerHelper('length', (arr: any[]) =>
      Array.isArray(arr) ? arr.length : 0
    );

    // Pluralize helper
    this.handlebars.registerHelper('pluralize', (count: number, singular: string, plural: string) =>
      count === 1 ? singular : plural
    );
  }

  /**
   * Generate default context with common values
   */
  generateDefaultContext(projectName: string): TemplateContext {
    const now = new Date();
    const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    return {
      project_name: projectName || 'Unknown Project',
      timestamp: now.toISOString(),
      initial_date: now.toISOString().split('T')[0],
      initial_deciders: 'Team',
      next_review_date: threeMonthsLater.toISOString().split('T')[0],
      test_coverage_min: 80,
      confidence_threshold: 85,
      min_context_lines: 200,
      max_context_lines: 2000,
      max_file_lines: 500,
      cyclomatic_function: 10,
      max_nesting_depth: 4,
      branching_strategy: 'git-flow',
      commit_format: 'conventional-commits',
      primary_language: 'TypeScript',
      test_framework_unit: 'Jest',
      ci_cd_platform: 'GitHub Actions'
    };
  }

  /**
   * Load and compile a template from file
   */
  async loadTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
    try {
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      return this.handlebars.compile(templateContent);
    } catch (error) {
      throw new Error(`Failed to load template ${templatePath}: ${error.message}`);
    }
  }

  /**
   * Render a template with the given context
   */
  async renderTemplate(
    templatePath: string,
    context: TemplateContext
  ): Promise<string> {
    const template = await this.loadTemplate(templatePath);
    return template(context);
  }

  /**
   * Render a template directly to a file
   */
  async renderToFile(
    templatePath: string,
    outputPath: string,
    context: TemplateContext
  ): Promise<void> {
    try {
      const rendered = await this.renderTemplate(templatePath, context);
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, rendered, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to render template to ${outputPath}: ${error.message}`);
    }
  }

  /**
   * Render multiple templates with the same context
   */
  async renderMultiple(
    templates: Array<{ templatePath: string; outputPath: string }>,
    context: TemplateContext
  ): Promise<void> {
    for (const { templatePath, outputPath } of templates) {
      await this.renderToFile(templatePath, outputPath, context);
    }
  }

  /**
   * Check if a template exists
   */
  async templateExists(templatePath: string): Promise<boolean> {
    return fs.pathExists(templatePath);
  }

  /**
   * List all available templates in a directory
   */
  async listTemplates(directory: string): Promise<string[]> {
    try {
      const files = await fs.readdir(directory);
      return files.filter(file => file.endsWith('.hbs'));
    } catch (error) {
      throw new Error(`Failed to list templates in ${directory}: ${error.message}`);
    }
  }

  /**
   * Validate that required context fields are present
   */
  validateContext(context: TemplateContext, requiredFields: string[]): void {
    const missing = requiredFields.filter(field => !context[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required context fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Merge multiple contexts with priority (later contexts override earlier)
   */
  mergeContexts(...contexts: Partial<TemplateContext>[]): TemplateContext {
    return Object.assign({}, ...contexts) as TemplateContext;
  }

  /**
   * Create a context from environment variables
   */
  createContextFromEnv(prefix: string = 'NEXUS_'): Partial<TemplateContext> {
    const context: Partial<TemplateContext> = {};

    for (const [key, value] of Object.entries(process.env)) {
      if (key.startsWith(prefix)) {
        const contextKey = key
          .substring(prefix.length)
          .toLowerCase()
          .replace(/_/g, '_');
        context[contextKey] = value;
      }
    }

    return context;
  }

  /**
   * Load context from a JSON or YAML file
   */
  async loadContextFromFile(filePath: string): Promise<Partial<TemplateContext>> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      if (filePath.endsWith('.json')) {
        return JSON.parse(content);
      } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
        const yaml = await import('js-yaml');
        return yaml.load(content) as Partial<TemplateContext>;
      } else {
        throw new Error('Unsupported file format. Use JSON or YAML.');
      }
    } catch (error) {
      throw new Error(`Failed to load context from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Save context to a file for reuse
   */
  async saveContext(
    context: TemplateContext,
    filePath: string
  ): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(filePath));

      if (filePath.endsWith('.json')) {
        await fs.writeJSON(filePath, context, { spaces: 2 });
      } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
        const yaml = await import('js-yaml');
        await fs.writeFile(filePath, yaml.dump(context), 'utf-8');
      } else {
        throw new Error('Unsupported file format. Use JSON or YAML.');
      }
    } catch (error) {
      throw new Error(`Failed to save context to ${filePath}: ${error.message}`);
    }
  }

  /**
   * Compile and cache a template for repeated use
   */
  private templateCache = new Map<string, HandlebarsTemplateDelegate>();

  async getCachedTemplate(templatePath: string): Promise<HandlebarsTemplateDelegate> {
    if (!this.templateCache.has(templatePath)) {
      const template = await this.loadTemplate(templatePath);
      this.templateCache.set(templatePath, template);
    }
    return this.templateCache.get(templatePath)!;
  }

  /**
   * Clear the template cache
   */
  clearCache(): void {
    this.templateCache.clear();
  }

  /**
   * Register a partial template for reuse
   */
  async registerPartial(name: string, templatePath: string): Promise<void> {
    const content = await fs.readFile(templatePath, 'utf-8');
    this.handlebars.registerPartial(name, content);
  }

  /**
   * Register all templates in a directory as partials
   */
  async registerPartialsDirectory(directory: string): Promise<void> {
    const templates = await this.listTemplates(directory);

    for (const template of templates) {
      const name = path.basename(template, '.hbs');
      const templatePath = path.join(directory, template);
      await this.registerPartial(name, templatePath);
    }
  }
}
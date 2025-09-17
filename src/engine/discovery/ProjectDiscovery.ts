import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';

export interface ProjectDiscoveryResult {
  projectName: string;
  language: string;
  framework?: string;
  testFramework?: string;
  packageManager: string;
  database?: string;
  hasGit: boolean;
  hasCI: boolean;
  ciPlatform?: string;
  dependencies: string[];
  devDependencies: string[];
  scripts: Record<string, string>;
  structure: {
    hasSrc: boolean;
    hasTests: boolean;
    hasDocs: boolean;
    hasConfig: boolean;
  };
  metrics: {
    fileCount: number;
    lineCount: number;
    testFileCount: number;
  };
}

export class ProjectDiscovery {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Run complete project discovery
   */
  async runDiscovery(): Promise<ProjectDiscoveryResult> {
    const result: ProjectDiscoveryResult = {
      projectName: await this.detectProjectName(),
      language: await this.detectPrimaryLanguage(),
      packageManager: await this.detectPackageManager(),
      hasGit: await this.detectGit(),
      hasCI: false,
      dependencies: [],
      devDependencies: [],
      scripts: {},
      structure: {
        hasSrc: await fs.pathExists(path.join(this.projectRoot, 'src')),
        hasTests: await this.detectTestDirectory(),
        hasDocs: await fs.pathExists(path.join(this.projectRoot, 'docs')),
        hasConfig: await fs.pathExists(path.join(this.projectRoot, 'config'))
      },
      metrics: await this.calculateMetrics()
    };

    // Detect framework based on language
    if (result.language === 'JavaScript' || result.language === 'TypeScript') {
      const nodeInfo = await this.detectNodeProject();
      result.framework = nodeInfo.framework;
      result.testFramework = nodeInfo.testFramework;
      result.dependencies = nodeInfo.dependencies;
      result.devDependencies = nodeInfo.devDependencies;
      result.scripts = nodeInfo.scripts;
    } else if (result.language === 'Python') {
      const pythonInfo = await this.detectPythonProject();
      result.framework = pythonInfo.framework;
      result.testFramework = pythonInfo.testFramework;
      result.dependencies = pythonInfo.dependencies;
    } else if (result.language === 'Java') {
      const javaInfo = await this.detectJavaProject();
      result.framework = javaInfo.framework;
      result.testFramework = javaInfo.testFramework;
    }

    // Detect database
    result.database = await this.detectDatabase(result.dependencies);

    // Detect CI/CD
    const ciInfo = await this.detectCICD();
    result.hasCI = ciInfo.hasCI;
    result.ciPlatform = ciInfo.platform;

    return result;
  }

  /**
   * Detect project name from various sources
   */
  private async detectProjectName(): Promise<string> {
    // Try package.json first
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJSON(packageJsonPath);
        if (packageJson.name) return packageJson.name;
      } catch {}
    }

    // Try Cargo.toml for Rust projects
    const cargoTomlPath = path.join(this.projectRoot, 'Cargo.toml');
    if (await fs.pathExists(cargoTomlPath)) {
      try {
        const content = await fs.readFile(cargoTomlPath, 'utf-8');
        const match = content.match(/name\s*=\s*"([^"]+)"/);
        if (match) return match[1];
      } catch {}
    }

    // Try go.mod for Go projects
    const goModPath = path.join(this.projectRoot, 'go.mod');
    if (await fs.pathExists(goModPath)) {
      try {
        const content = await fs.readFile(goModPath, 'utf-8');
        const match = content.match(/module\s+([^\s]+)/);
        if (match) return path.basename(match[1]);
      } catch {}
    }

    // Default to directory name
    return path.basename(this.projectRoot);
  }

  /**
   * Detect primary programming language
   */
  private async detectPrimaryLanguage(): Promise<string> {
    const extensions = {
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.py': 'Python',
      '.java': 'Java',
      '.rs': 'Rust',
      '.go': 'Go',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.cs': 'C#',
      '.cpp': 'C++',
      '.c': 'C',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.scala': 'Scala',
      '.r': 'R'
    };

    const counts: Record<string, number> = {};

    // Check for TypeScript config first (prioritize TS over JS)
    if (await fs.pathExists(path.join(this.projectRoot, 'tsconfig.json'))) {
      return 'TypeScript';
    }

    // Count file extensions
    await this.walkDirectory(this.projectRoot, (filePath: string) => {
      const ext = path.extname(filePath).toLowerCase();
      if (extensions[ext]) {
        counts[extensions[ext]] = (counts[extensions[ext]] || 0) + 1;
      }
    });

    // Find the most common language
    let maxCount = 0;
    let primaryLanguage = 'Unknown';

    for (const [lang, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        primaryLanguage = lang;
      }
    }

    return primaryLanguage;
  }

  /**
   * Detect package manager
   */
  private async detectPackageManager(): Promise<string> {
    if (await fs.pathExists(path.join(this.projectRoot, 'package-lock.json'))) {
      return 'npm';
    }
    if (await fs.pathExists(path.join(this.projectRoot, 'yarn.lock'))) {
      return 'yarn';
    }
    if (await fs.pathExists(path.join(this.projectRoot, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    if (await fs.pathExists(path.join(this.projectRoot, 'Cargo.toml'))) {
      return 'cargo';
    }
    if (await fs.pathExists(path.join(this.projectRoot, 'go.mod'))) {
      return 'go mod';
    }
    if (await fs.pathExists(path.join(this.projectRoot, 'requirements.txt')) ||
        await fs.pathExists(path.join(this.projectRoot, 'Pipfile'))) {
      return 'pip';
    }
    if (await fs.pathExists(path.join(this.projectRoot, 'pom.xml'))) {
      return 'maven';
    }
    if (await fs.pathExists(path.join(this.projectRoot, 'build.gradle'))) {
      return 'gradle';
    }
    if (await fs.pathExists(path.join(this.projectRoot, 'Gemfile'))) {
      return 'bundler';
    }
    if (await fs.pathExists(path.join(this.projectRoot, 'composer.json'))) {
      return 'composer';
    }

    return 'unknown';
  }

  /**
   * Detect Node.js project details
   */
  private async detectNodeProject(): Promise<{
    framework?: string;
    testFramework?: string;
    dependencies: string[];
    devDependencies: string[];
    scripts: Record<string, string>;
  }> {
    const result = {
      framework: undefined as string | undefined,
      testFramework: undefined as string | undefined,
      dependencies: [] as string[],
      devDependencies: [] as string[],
      scripts: {} as Record<string, string>
    };

    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (!await fs.pathExists(packageJsonPath)) {
      return result;
    }

    try {
      const packageJson = await fs.readJSON(packageJsonPath);

      // Get dependencies
      result.dependencies = Object.keys(packageJson.dependencies || {});
      result.devDependencies = Object.keys(packageJson.devDependencies || {});
      result.scripts = packageJson.scripts || {};

      const allDeps = [...result.dependencies, ...result.devDependencies];

      // Detect framework
      if (allDeps.includes('next')) result.framework = 'Next.js';
      else if (allDeps.includes('react')) result.framework = 'React';
      else if (allDeps.includes('vue')) result.framework = 'Vue';
      else if (allDeps.includes('@angular/core')) result.framework = 'Angular';
      else if (allDeps.includes('svelte')) result.framework = 'Svelte';
      else if (allDeps.includes('express')) result.framework = 'Express';
      else if (allDeps.includes('fastify')) result.framework = 'Fastify';
      else if (allDeps.includes('koa')) result.framework = 'Koa';
      else if (allDeps.includes('nestjs') || allDeps.includes('@nestjs/core')) result.framework = 'NestJS';

      // Detect test framework
      if (allDeps.includes('jest')) result.testFramework = 'Jest';
      else if (allDeps.includes('mocha')) result.testFramework = 'Mocha';
      else if (allDeps.includes('vitest')) result.testFramework = 'Vitest';
      else if (allDeps.includes('jasmine')) result.testFramework = 'Jasmine';
      else if (allDeps.includes('ava')) result.testFramework = 'AVA';
      else if (allDeps.includes('tape')) result.testFramework = 'Tape';
      else if (allDeps.includes('@playwright/test')) result.testFramework = 'Playwright';
      else if (allDeps.includes('cypress')) result.testFramework = 'Cypress';
    } catch (error) {
      console.error('Error reading package.json:', error);
    }

    return result;
  }

  /**
   * Detect Python project details
   */
  private async detectPythonProject(): Promise<{
    framework?: string;
    testFramework?: string;
    dependencies: string[];
  }> {
    const result = {
      framework: undefined as string | undefined,
      testFramework: undefined as string | undefined,
      dependencies: [] as string[]
    };

    // Check requirements.txt
    const reqPath = path.join(this.projectRoot, 'requirements.txt');
    if (await fs.pathExists(reqPath)) {
      try {
        const content = await fs.readFile(reqPath, 'utf-8');
        result.dependencies = content
          .split('\n')
          .filter(line => line && !line.startsWith('#'))
          .map(line => line.split('==')[0].split('>=')[0].split('~=')[0].trim());

        // Detect framework
        if (result.dependencies.includes('django')) result.framework = 'Django';
        else if (result.dependencies.includes('flask')) result.framework = 'Flask';
        else if (result.dependencies.includes('fastapi')) result.framework = 'FastAPI';
        else if (result.dependencies.includes('pyramid')) result.framework = 'Pyramid';
        else if (result.dependencies.includes('tornado')) result.framework = 'Tornado';

        // Detect test framework
        if (result.dependencies.includes('pytest')) result.testFramework = 'pytest';
        else if (result.dependencies.includes('unittest2')) result.testFramework = 'unittest';
        else if (result.dependencies.includes('nose2')) result.testFramework = 'nose2';
      } catch {}
    }

    // Check Pipfile
    const pipfilePath = path.join(this.projectRoot, 'Pipfile');
    if (await fs.pathExists(pipfilePath)) {
      try {
        const content = await fs.readFile(pipfilePath, 'utf-8');
        // Basic parsing - could be improved with TOML parser
        if (content.includes('django')) result.framework = 'Django';
        if (content.includes('flask')) result.framework = 'Flask';
        if (content.includes('pytest')) result.testFramework = 'pytest';
      } catch {}
    }

    return result;
  }

  /**
   * Detect Java project details
   */
  private async detectJavaProject(): Promise<{
    framework?: string;
    testFramework?: string;
  }> {
    const result = {
      framework: undefined as string | undefined,
      testFramework: undefined as string | undefined
    };

    // Check pom.xml for Maven projects
    const pomPath = path.join(this.projectRoot, 'pom.xml');
    if (await fs.pathExists(pomPath)) {
      try {
        const content = await fs.readFile(pomPath, 'utf-8');
        if (content.includes('spring-boot')) result.framework = 'Spring Boot';
        else if (content.includes('spring-framework')) result.framework = 'Spring';
        else if (content.includes('quarkus')) result.framework = 'Quarkus';
        else if (content.includes('micronaut')) result.framework = 'Micronaut';

        if (content.includes('junit-jupiter')) result.testFramework = 'JUnit 5';
        else if (content.includes('junit')) result.testFramework = 'JUnit 4';
        else if (content.includes('testng')) result.testFramework = 'TestNG';
      } catch {}
    }

    // Check build.gradle for Gradle projects
    const gradlePath = path.join(this.projectRoot, 'build.gradle');
    if (await fs.pathExists(gradlePath)) {
      try {
        const content = await fs.readFile(gradlePath, 'utf-8');
        if (content.includes('spring-boot')) result.framework = 'Spring Boot';
        if (content.includes('junit')) result.testFramework = 'JUnit';
      } catch {}
    }

    return result;
  }

  /**
   * Detect database from dependencies
   */
  private async detectDatabase(dependencies: string[]): Promise<string | undefined> {
    const databaseMap = {
      'mysql': 'MySQL',
      'mysql2': 'MySQL',
      'pg': 'PostgreSQL',
      'postgres': 'PostgreSQL',
      'mongodb': 'MongoDB',
      'mongoose': 'MongoDB',
      'redis': 'Redis',
      'ioredis': 'Redis',
      'sqlite3': 'SQLite',
      'better-sqlite3': 'SQLite',
      'mssql': 'SQL Server',
      'oracledb': 'Oracle',
      'cassandra-driver': 'Cassandra',
      'neo4j-driver': 'Neo4j',
      'elasticsearch': 'Elasticsearch',
      '@elastic/elasticsearch': 'Elasticsearch'
    };

    for (const dep of dependencies) {
      if (databaseMap[dep]) {
        return databaseMap[dep];
      }
    }

    // Check for ORMs that might indicate a database
    if (dependencies.includes('typeorm')) return 'SQL Database';
    if (dependencies.includes('sequelize')) return 'SQL Database';
    if (dependencies.includes('prisma')) return 'SQL/NoSQL Database';
    if (dependencies.includes('knex')) return 'SQL Database';

    return undefined;
  }

  /**
   * Detect Git repository
   */
  private async detectGit(): Promise<boolean> {
    return fs.pathExists(path.join(this.projectRoot, '.git'));
  }

  /**
   * Detect CI/CD platform
   */
  private async detectCICD(): Promise<{ hasCI: boolean; platform?: string }> {
    const ciChecks = [
      { path: '.github/workflows', platform: 'GitHub Actions' },
      { path: '.gitlab-ci.yml', platform: 'GitLab CI' },
      { path: 'Jenkinsfile', platform: 'Jenkins' },
      { path: '.circleci', platform: 'CircleCI' },
      { path: 'azure-pipelines.yml', platform: 'Azure DevOps' },
      { path: '.travis.yml', platform: 'Travis CI' },
      { path: 'bitbucket-pipelines.yml', platform: 'Bitbucket Pipelines' },
      { path: '.drone.yml', platform: 'Drone CI' },
      { path: 'cloudbuild.yaml', platform: 'Google Cloud Build' }
    ];

    for (const check of ciChecks) {
      if (await fs.pathExists(path.join(this.projectRoot, check.path))) {
        return { hasCI: true, platform: check.platform };
      }
    }

    return { hasCI: false };
  }

  /**
   * Detect test directory
   */
  private async detectTestDirectory(): Promise<boolean> {
    const testDirs = ['test', 'tests', '__tests__', 'spec', 'specs'];

    for (const dir of testDirs) {
      if (await fs.pathExists(path.join(this.projectRoot, dir))) {
        return true;
      }
    }

    // Check for test files in src
    const srcPath = path.join(this.projectRoot, 'src');
    if (await fs.pathExists(srcPath)) {
      let hasTests = false;
      await this.walkDirectory(srcPath, (filePath: string) => {
        if (filePath.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
          hasTests = true;
        }
      }, 2); // Limited depth for performance
      return hasTests;
    }

    return false;
  }

  /**
   * Calculate project metrics
   */
  private async calculateMetrics(): Promise<{
    fileCount: number;
    lineCount: number;
    testFileCount: number;
  }> {
    let fileCount = 0;
    let lineCount = 0;
    let testFileCount = 0;

    await this.walkDirectory(this.projectRoot, async (filePath: string) => {
      const ext = path.extname(filePath).toLowerCase();
      const validExts = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.rs', '.go', '.rb', '.php', '.cs', '.cpp', '.c'];

      if (validExts.includes(ext)) {
        fileCount++;

        if (filePath.match(/\.(test|spec)\./)) {
          testFileCount++;
        }

        try {
          const content = await fs.readFile(filePath, 'utf-8');
          lineCount += content.split('\n').length;
        } catch {}
      }
    });

    return { fileCount, lineCount, testFileCount };
  }

  /**
   * Walk directory recursively
   */
  private async walkDirectory(
    dir: string,
    callback: (filePath: string) => void | Promise<void>,
    maxDepth: number = 10,
    currentDepth: number = 0
  ): Promise<void> {
    if (currentDepth >= maxDepth) return;

    const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'out', 'target', '.next', 'coverage', '.venv', 'venv'];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (!ignoreDirs.includes(entry.name)) {
            await this.walkDirectory(fullPath, callback, maxDepth, currentDepth + 1);
          }
        } else {
          await callback(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }
}
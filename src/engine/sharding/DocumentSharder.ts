import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';

interface ShardConfig {
  maxLines: number;
  preserveContext: boolean;
  hierarchyLevels: string[];
  outputDir: string;
}

interface Shard {
  id: string;
  type: 'epic' | 'story' | 'task';
  title: string;
  content: string;
  lineCount: number;
  parent?: string;
  children: string[];
  crossReferences: string[];
  contextScope: string[];
  metadata: {
    originalFile: string;
    originalLines: [number, number];
    createdAt: Date;
    version: string;
  };
}

interface ShardingResult {
  totalShards: number;
  hierarchy: ShardHierarchy;
  navigationIndex: NavigationIndex;
  crossReferenceMap: Map<string, string[]>;
  metrics: ShardingMetrics;
}

interface ShardHierarchy {
  epics: Shard[];
  stories: Map<string, Shard[]>;
  tasks: Map<string, Shard[]>;
}

interface NavigationIndex {
  byId: Map<string, Shard>;
  byType: Map<string, Shard[]>;
  byContext: Map<string, Shard[]>;
  searchIndex: Map<string, string[]>;
}

interface ShardingMetrics {
  originalLines: number;
  totalShardLines: number;
  compressionRatio: number;
  averageShardSize: number;
  maxShardSize: number;
  minShardSize: number;
  crossReferenceCount: number;
  processingTime: number;
}

export class DocumentSharder {
  private config: ShardConfig;
  private shards: Map<string, Shard>;
  private hierarchy: ShardHierarchy;
  private crossReferences: Map<string, Set<string>>;

  constructor(config?: Partial<ShardConfig>) {
    this.config = {
      maxLines: 500,
      preserveContext: true,
      hierarchyLevels: ['epic', 'story', 'task'],
      outputDir: '.nexus/specs/sharded',
      ...config
    };

    this.shards = new Map();
    this.hierarchy = {
      epics: [],
      stories: new Map(),
      tasks: new Map()
    };
    this.crossReferences = new Map();
  }

  /**
   * Shard a document into manageable pieces
   */
  async shardDocument(filePath: string): Promise<ShardingResult> {
    const startTime = Date.now();

    // Read and parse the document
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const originalLineCount = lines.length;

    // Parse document structure
    const sections = this.parseDocumentStructure(lines);

    // Create shards based on structure
    const epics = this.createEpicShards(sections);

    // Break down epics into stories
    for (const epic of epics) {
      const stories = this.createStoryShards(epic);
      this.hierarchy.stories.set(epic.id, stories);

      // Break down stories into tasks
      for (const story of stories) {
        const tasks = this.createTaskShards(story);
        this.hierarchy.tasks.set(story.id, tasks);
      }
    }

    // Detect and record cross-references
    this.detectCrossReferences();

    // Build navigation index
    const navigationIndex = this.buildNavigationIndex();

    // Calculate metrics
    const metrics = this.calculateMetrics(originalLineCount, startTime);

    // Write shards to disk
    await this.writeShards(filePath);

    return {
      totalShards: this.shards.size,
      hierarchy: this.hierarchy,
      navigationIndex,
      crossReferenceMap: this.crossReferences,
      metrics
    };
  }

  /**
   * Parse document structure to identify sections
   */
  private parseDocumentStructure(lines: string[]): Map<string, string[]> {
    const sections = new Map<string, string[]>();
    let currentSection = 'preamble';
    let currentContent: string[] = [];

    for (const line of lines) {
      // Detect section headers (markdown format)
      if (line.match(/^#{1,3}\s+/)) {
        if (currentContent.length > 0) {
          sections.set(currentSection, currentContent);
        }
        currentSection = line.replace(/^#{1,3}\s+/, '').trim();
        currentContent = [line];
      } else {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentContent.length > 0) {
      sections.set(currentSection, currentContent);
    }

    return sections;
  }

  /**
   * Create epic-level shards from document sections
   */
  private createEpicShards(sections: Map<string, string[]>): Shard[] {
    const epics: Shard[] = [];
    const epicSections = this.groupIntoEpics(sections);

    for (const [epicName, sectionNames] of epicSections) {
      const epicContent: string[] = [];

      for (const sectionName of sectionNames) {
        const content = sections.get(sectionName) || [];
        epicContent.push(...content);
      }

      const epic: Shard = {
        id: this.generateShardId('epic', epicName),
        type: 'epic',
        title: epicName,
        content: epicContent.join('\n'),
        lineCount: epicContent.length,
        children: [],
        crossReferences: [],
        contextScope: sectionNames,
        metadata: {
          originalFile: '',
          originalLines: [0, epicContent.length],
          createdAt: new Date(),
          version: '1.0.0'
        }
      };

      this.shards.set(epic.id, epic);
      epics.push(epic);
    }

    this.hierarchy.epics = epics;
    return epics;
  }

  /**
   * Group sections into epic categories
   */
  private groupIntoEpics(sections: Map<string, string[]>): Map<string, string[]> {
    const epics = new Map<string, string[]>();

    // Define epic groupings based on common patterns
    const epicPatterns = {
      'requirements': ['functional', 'non-functional', 'requirement', 'criteria'],
      'architecture': ['architecture', 'design', 'system', 'component', 'technical'],
      'implementation': ['implementation', 'code', 'api', 'interface', 'integration'],
      'validation': ['test', 'validation', 'quality', 'acceptance', 'scenario'],
      'deployment': ['deployment', 'release', 'operations', 'monitoring', 'infrastructure'],
      'documentation': ['documentation', 'user', 'guide', 'manual', 'reference']
    };

    for (const [sectionName] of sections) {
      let assigned = false;

      for (const [epicName, patterns] of Object.entries(epicPatterns)) {
        if (patterns.some(pattern =>
          sectionName.toLowerCase().includes(pattern)
        )) {
          const existing = epics.get(epicName) || [];
          existing.push(sectionName);
          epics.set(epicName, existing);
          assigned = true;
          break;
        }
      }

      // Default epic for unmatched sections
      if (!assigned) {
        const existing = epics.get('general') || [];
        existing.push(sectionName);
        epics.set('general', existing);
      }
    }

    return epics;
  }

  /**
   * Create story-level shards from an epic
   */
  private createStoryShards(epic: Shard): Shard[] {
    const stories: Shard[] = [];
    const lines = epic.content.split('\n');

    if (lines.length <= this.config.maxLines) {
      // Epic is small enough to be a single story
      const story: Shard = {
        id: this.generateShardId('story', epic.title),
        type: 'story',
        title: `${epic.title} - Main Story`,
        content: epic.content,
        lineCount: lines.length,
        parent: epic.id,
        children: [],
        crossReferences: [],
        contextScope: epic.contextScope,
        metadata: {
          ...epic.metadata,
          originalLines: [0, lines.length]
        }
      };

      epic.children.push(story.id);
      this.shards.set(story.id, story);
      stories.push(story);
    } else {
      // Split epic into multiple stories
      const chunks = this.splitIntoChunks(lines, Math.ceil(this.config.maxLines * 0.7));

      chunks.forEach((chunk, index) => {
        const story: Shard = {
          id: this.generateShardId('story', `${epic.title}-${index + 1}`),
          type: 'story',
          title: `${epic.title} - Part ${index + 1}`,
          content: chunk.join('\n'),
          lineCount: chunk.length,
          parent: epic.id,
          children: [],
          crossReferences: [],
          contextScope: [`${epic.title}-part${index + 1}`],
          metadata: {
            ...epic.metadata,
            originalLines: [
              index * Math.ceil(this.config.maxLines * 0.7),
              Math.min((index + 1) * Math.ceil(this.config.maxLines * 0.7), lines.length)
            ]
          }
        };

        epic.children.push(story.id);
        this.shards.set(story.id, story);
        stories.push(story);
      });
    }

    return stories;
  }

  /**
   * Create task-level shards from a story
   */
  private createTaskShards(story: Shard): Shard[] {
    const tasks: Shard[] = [];
    const lines = story.content.split('\n');

    if (lines.length <= Math.ceil(this.config.maxLines * 0.5)) {
      // Story is small enough to be a single task
      const task: Shard = {
        id: this.generateShardId('task', story.title),
        type: 'task',
        title: `${story.title} - Implementation`,
        content: story.content,
        lineCount: lines.length,
        parent: story.id,
        children: [],
        crossReferences: [],
        contextScope: story.contextScope,
        metadata: story.metadata
      };

      story.children.push(task.id);
      this.shards.set(task.id, task);
      tasks.push(task);
    } else {
      // Split story into multiple tasks
      const chunks = this.splitIntoChunks(lines, Math.ceil(this.config.maxLines * 0.3));

      chunks.forEach((chunk, index) => {
        const task: Shard = {
          id: this.generateShardId('task', `${story.title}-task${index + 1}`),
          type: 'task',
          title: `${story.title} - Task ${index + 1}`,
          content: chunk.join('\n'),
          lineCount: chunk.length,
          parent: story.id,
          children: [],
          crossReferences: [],
          contextScope: [`${story.title}-task${index + 1}`],
          metadata: {
            ...story.metadata,
            originalLines: [
              index * Math.ceil(this.config.maxLines * 0.3),
              Math.min((index + 1) * Math.ceil(this.config.maxLines * 0.3), lines.length)
            ]
          }
        };

        story.children.push(task.id);
        this.shards.set(task.id, task);
        tasks.push(task);
      });
    }

    return tasks;
  }

  /**
   * Split content into chunks while preserving context
   */
  private splitIntoChunks(lines: string[], maxSize: number): string[][] {
    const chunks: string[][] = [];
    let currentChunk: string[] = [];
    let inCodeBlock = false;
    let inList = false;

    for (const line of lines) {
      // Track code blocks
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
      }

      // Track lists
      if (line.match(/^[-*+]\s+/) || line.match(/^\d+\.\s+/)) {
        inList = true;
      } else if (line.trim() === '') {
        inList = false;
      }

      // Add line to current chunk
      currentChunk.push(line);

      // Check if we should start a new chunk
      if (currentChunk.length >= maxSize && !inCodeBlock && !inList) {
        // Look for a good breaking point
        const breakPoint = this.findBreakPoint(currentChunk);

        if (breakPoint > 0) {
          chunks.push(currentChunk.slice(0, breakPoint));
          currentChunk = currentChunk.slice(breakPoint);
        } else {
          chunks.push(currentChunk);
          currentChunk = [];
        }
      }
    }

    // Add remaining content
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  /**
   * Find a good breaking point in content
   */
  private findBreakPoint(lines: string[]): number {
    // Look for section breaks in reverse order (prefer later breaks)
    for (let i = lines.length - 1; i >= Math.floor(lines.length * 0.7); i--) {
      if (lines[i].match(/^#{1,6}\s+/) || // Header
          lines[i].trim() === '' && i > 0 && lines[i - 1].trim() === '') { // Double blank line
        return i;
      }
    }

    return -1;
  }

  /**
   * Detect cross-references between shards
   */
  private detectCrossReferences(): void {
    for (const [id, shard] of this.shards) {
      const references = new Set<string>();

      // Look for references to other sections
      const refPattern = /(?:see|refer to|as described in|defined in)\s+(?:section\s+)?["']?([^"'\n]+)["']?/gi;
      let match;

      while ((match = refPattern.exec(shard.content)) !== null) {
        const referencedTitle = match[1].trim();

        // Find matching shard
        for (const [otherId, otherShard] of this.shards) {
          if (otherId !== id &&
              otherShard.title.toLowerCase().includes(referencedTitle.toLowerCase())) {
            references.add(otherId);

            // Add reverse reference
            const reverseRefs = this.crossReferences.get(otherId) || new Set();
            reverseRefs.add(id);
            this.crossReferences.set(otherId, reverseRefs);
          }
        }
      }

      // Look for requirement references (e.g., REQ-001, FR-123)
      const reqPattern = /\b([A-Z]{2,4}-\d{3,4})\b/g;
      while ((match = reqPattern.exec(shard.content)) !== null) {
        const reqId = match[1];

        // Find shards containing this requirement
        for (const [otherId, otherShard] of this.shards) {
          if (otherId !== id && otherShard.content.includes(reqId)) {
            references.add(otherId);
          }
        }
      }

      shard.crossReferences = Array.from(references);
      this.crossReferences.set(id, references);
    }
  }

  /**
   * Build navigation index for shards
   */
  private buildNavigationIndex(): NavigationIndex {
    const index: NavigationIndex = {
      byId: new Map(),
      byType: new Map(),
      byContext: new Map(),
      searchIndex: new Map()
    };

    for (const [id, shard] of this.shards) {
      // By ID
      index.byId.set(id, shard);

      // By Type
      const typeShards = index.byType.get(shard.type) || [];
      typeShards.push(shard);
      index.byType.set(shard.type, typeShards);

      // By Context
      for (const context of shard.contextScope) {
        const contextShards = index.byContext.get(context) || [];
        contextShards.push(shard);
        index.byContext.set(context, contextShards);
      }

      // Search Index - tokenize content
      const tokens = this.tokenizeContent(shard.content);
      for (const token of tokens) {
        const shardIds = index.searchIndex.get(token) || [];
        if (!shardIds.includes(id)) {
          shardIds.push(id);
        }
        index.searchIndex.set(token, shardIds);
      }
    }

    return index;
  }

  /**
   * Tokenize content for search index
   */
  private tokenizeContent(content: string): Set<string> {
    const tokens = new Set<string>();

    // Extract words
    const words = content.toLowerCase().match(/\b[a-z]+\b/g) || [];
    for (const word of words) {
      if (word.length > 3) { // Skip short words
        tokens.add(word);
      }
    }

    // Extract camelCase and snake_case identifiers
    const identifiers = content.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
    for (const id of identifiers) {
      tokens.add(id.toLowerCase());
    }

    return tokens;
  }

  /**
   * Calculate sharding metrics
   */
  private calculateMetrics(originalLines: number, startTime: number): ShardingMetrics {
    let totalLines = 0;
    let maxSize = 0;
    let minSize = Infinity;

    for (const shard of this.shards.values()) {
      totalLines += shard.lineCount;
      maxSize = Math.max(maxSize, shard.lineCount);
      minSize = Math.min(minSize, shard.lineCount);
    }

    return {
      originalLines,
      totalShardLines: totalLines,
      compressionRatio: 1 - (totalLines / originalLines),
      averageShardSize: Math.round(totalLines / this.shards.size),
      maxShardSize: maxSize,
      minShardSize: minSize,
      crossReferenceCount: this.crossReferences.size,
      processingTime: Date.now() - startTime
    };
  }

  /**
   * Write shards to disk
   */
  private async writeShards(originalPath: string): Promise<void> {
    const baseDir = this.config.outputDir;
    const baseName = path.basename(originalPath, path.extname(originalPath));

    // Create directory structure
    await fs.ensureDir(path.join(baseDir, baseName, 'epics'));
    await fs.ensureDir(path.join(baseDir, baseName, 'stories'));
    await fs.ensureDir(path.join(baseDir, baseName, 'tasks'));

    // Write shards
    for (const [id, shard] of this.shards) {
      const fileName = `${id}.md`;
      const subDir = `${shard.type}s`;
      const filePath = path.join(baseDir, baseName, subDir, fileName);

      // Add metadata header
      const content = this.formatShardContent(shard);

      await fs.writeFile(filePath, content);
    }

    // Write navigation index
    const indexPath = path.join(baseDir, baseName, 'index.json');
    const indexData = {
      originalFile: originalPath,
      totalShards: this.shards.size,
      epics: this.hierarchy.epics.map(e => ({ id: e.id, title: e.title })),
      stories: Array.from(this.hierarchy.stories.entries()).map(([epicId, stories]) => ({
        epicId,
        stories: stories.map(s => ({ id: s.id, title: s.title }))
      })),
      tasks: Array.from(this.hierarchy.tasks.entries()).map(([storyId, tasks]) => ({
        storyId,
        tasks: tasks.map(t => ({ id: t.id, title: t.title }))
      })),
      crossReferences: Array.from(this.crossReferences.entries()).map(([id, refs]) => ({
        from: id,
        to: Array.from(refs)
      }))
    };

    await fs.writeJSON(indexPath, indexData, { spaces: 2 });
  }

  /**
   * Format shard content with metadata
   */
  private formatShardContent(shard: Shard): string {
    const header = [
      '---',
      `id: ${shard.id}`,
      `type: ${shard.type}`,
      `title: ${shard.title}`,
      shard.parent ? `parent: ${shard.parent}` : '',
      shard.children.length > 0 ? `children: [${shard.children.join(', ')}]` : '',
      shard.crossReferences.length > 0 ? `references: [${shard.crossReferences.join(', ')}]` : '',
      `context: [${shard.contextScope.join(', ')}]`,
      `lines: ${shard.lineCount}`,
      `created: ${shard.metadata.createdAt.toISOString()}`,
      `version: ${shard.metadata.version}`,
      '---',
      ''
    ].filter(line => line !== '').join('\n');

    // Add navigation links
    const navigation = [];

    if (shard.parent) {
      const parent = this.shards.get(shard.parent);
      if (parent) {
        navigation.push(`← [${parent.title}](../${parent.type}s/${shard.parent}.md)`);
      }
    }

    if (shard.children.length > 0) {
      navigation.push('', '### Sub-sections:');
      for (const childId of shard.children) {
        const child = this.shards.get(childId);
        if (child) {
          navigation.push(`- [${child.title}](../${child.type}s/${childId}.md)`);
        }
      }
    }

    if (shard.crossReferences.length > 0) {
      navigation.push('', '### Related:');
      for (const refId of shard.crossReferences) {
        const ref = this.shards.get(refId);
        if (ref) {
          navigation.push(`- [${ref.title}](../${ref.type}s/${refId}.md)`);
        }
      }
    }

    const navigationSection = navigation.length > 0 ? navigation.join('\n') + '\n\n---\n\n' : '';

    return header + navigationSection + shard.content;
  }

  /**
   * Generate a unique shard ID
   */
  private generateShardId(type: string, title: string): string {
    const sanitized = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 30);

    const hash = crypto.createHash('sha256')
      .update(`${type}-${title}-${Date.now()}`)
      .digest('hex')
      .substring(0, 8);

    return `${type}-${sanitized}-${hash}`;
  }

  /**
   * Reassemble shards into original document
   */
  async reassembleDocument(shardDir: string): Promise<string> {
    // Load index
    const indexPath = path.join(shardDir, 'index.json');
    const index = await fs.readJSON(indexPath);

    const content: string[] = [];

    // Reassemble in hierarchical order
    for (const epic of index.epics) {
      const epicShard = await this.loadShard(shardDir, 'epics', epic.id);
      content.push(epicShard.content);

      const stories = index.stories.find((s: any) => s.epicId === epic.id);
      if (stories) {
        for (const story of stories.stories) {
          const storyShard = await this.loadShard(shardDir, 'stories', story.id);

          const tasks = index.tasks.find((t: any) => t.storyId === story.id);
          if (!tasks) {
            content.push(storyShard.content);
          }
        }
      }
    }

    return content.join('\n\n');
  }

  /**
   * Load a shard from disk
   */
  private async loadShard(baseDir: string, type: string, id: string): Promise<Shard> {
    const filePath = path.join(baseDir, type, `${id}.md`);
    const content = await fs.readFile(filePath, 'utf-8');

    // Parse metadata from frontmatter
    const lines = content.split('\n');
    const metadataEnd = lines.indexOf('---', 1);
    const metadata: any = {};

    for (let i = 1; i < metadataEnd; i++) {
      const [key, ...valueParts] = lines[i].split(':');
      if (key) {
        metadata[key.trim()] = valueParts.join(':').trim();
      }
    }

    // Extract content after frontmatter and navigation
    const contentStart = lines.findIndex((line, idx) =>
      idx > metadataEnd && line === '---'
    );

    const shardContent = contentStart > -1
      ? lines.slice(contentStart + 2).join('\n')
      : lines.slice(metadataEnd + 1).join('\n');

    return {
      id: metadata.id,
      type: metadata.type as 'epic' | 'story' | 'task',
      title: metadata.title,
      content: shardContent,
      lineCount: parseInt(metadata.lines),
      parent: metadata.parent,
      children: metadata.children ? JSON.parse(metadata.children) : [],
      crossReferences: metadata.references ? JSON.parse(metadata.references) : [],
      contextScope: metadata.context ? JSON.parse(metadata.context) : [],
      metadata: {
        originalFile: '',
        originalLines: [0, 0],
        createdAt: new Date(metadata.created),
        version: metadata.version
      }
    };
  }
}
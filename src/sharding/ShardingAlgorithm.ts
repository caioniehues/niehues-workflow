/**
 * ShardingAlgorithm.ts
 * Created: 2025-09-16 20:40:23 WEST
 *
 * AST-based markdown sharding inspired by BMAD-METHOD
 * Uses unified.js for proper markdown parsing to handle edge cases
 * like code blocks containing ## symbols
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import type { Root, Heading, Content } from 'mdast';
import { VFile } from 'vfile';

export interface ShardConfig {
  maxShardSize?: number;  // Maximum lines per shard
  shardByLevel?: number;  // Heading level to shard by (default: 2)
  preserveContext?: boolean;  // Include context from parent sections
}

export interface Boundary {
  index: number;
  title: string;
  line: number;
  depth: number;
  node: Heading;
}

export interface Shard {
  id: string;
  title: string;
  filename: string;
  content: string;
  contextBoundary: {
    includes: string[];      // Related sections
    references: string[];    // Cross-references to other shards
    dependencies: string[];  // Dependencies on other shards
  };
  metadata: {
    originalLine: number;
    contentLines: number;
    hasCodeBlocks: boolean;
    hasDiagrams: boolean;
  };
}

export interface ShardResult {
  shards: Shard[];
  index: ShardIndex;
  originalAst: Root;
}

export interface ShardIndex {
  title: string;
  introduction: string;
  sections: Array<{
    id: string;
    title: string;
    filename: string;
    line: number;
  }>;
}

export class ShardingAlgorithm {
  private config: Required<ShardConfig>;

  constructor(config: ShardConfig = {}) {
    this.config = {
      maxShardSize: config.maxShardSize ?? 1500,
      shardByLevel: config.shardByLevel ?? 2,
      preserveContext: config.preserveContext ?? true
    };
  }

  /**
   * Main sharding method using AST parsing
   * This ensures proper handling of markdown structure
   */
  async shardDocument(content: string, documentPath: string): Promise<ShardResult> {
    // Parse markdown to AST
    const processor = unified().use(remarkParse);
    const ast = processor.parse(content) as Root;

    // Find sharding boundaries
    const boundaries = this.detectBoundaries(ast);

    // Create shards from boundaries
    const shards = await this.createShards(ast, boundaries, content);

    // Build navigation index
    const index = this.buildIndex(ast, shards, documentPath);

    return {
      shards,
      index,
      originalAst: ast
    };
  }

  /**
   * Detect natural boundaries in the document
   * Based on heading levels and document structure
   */
  private detectBoundaries(ast: Root): Boundary[] {
    const boundaries: Boundary[] = [];
    let nodeIndex = 0;

    visit(ast, (node, index, parent) => {
      if (node.type === 'heading' && node.depth === this.config.shardByLevel) {
        const heading = node as Heading;
        boundaries.push({
          index: nodeIndex,
          title: this.extractHeadingText(heading),
          line: heading.position?.start.line ?? 0,
          depth: heading.depth,
          node: heading
        });
      }
      if (parent === ast) {
        nodeIndex++;
      }
    });

    return boundaries;
  }

  /**
   * Extract text content from heading node
   */
  private extractHeadingText(heading: Heading): string {
    const processor = unified().use(remarkStringify);
    const content = heading.children
      .map(child => processor.stringify(child as any))
      .join('')
      .trim();
    return content;
  }

  /**
   * Create individual shards from boundaries
   */
  private async createShards(
    ast: Root,
    boundaries: Boundary[],
    originalContent: string
  ): Promise<Shard[]> {
    const shards: Shard[] = [];

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      const nextBoundary = boundaries[i + 1];

      // Extract content between boundaries
      const shardContent = this.extractShardContent(
        ast,
        boundary,
        nextBoundary
      );

      // Detect cross-references and dependencies
      const contextBoundary = this.analyzeContextBoundary(
        shardContent,
        boundaries,
        i
      );

      // Create shard object
      const shard: Shard = {
        id: `shard-${i + 1}`,
        title: boundary.title,
        filename: this.generateFilename(boundary.title, i + 1),
        content: await this.adjustHeadingLevels(shardContent),
        contextBoundary,
        metadata: {
          originalLine: boundary.line,
          contentLines: this.countContentLines(shardContent),
          hasCodeBlocks: this.detectCodeBlocks(shardContent),
          hasDiagrams: this.detectDiagrams(shardContent)
        }
      };

      // Check if shard is too large and needs further splitting
      if (shard.metadata.contentLines > this.config.maxShardSize) {
        const subShards = await this.splitLargeShard(shard, ast);
        shards.push(...subShards);
      } else {
        shards.push(shard);
      }
    }

    return shards;
  }

  /**
   * Extract content for a specific shard
   */
  private extractShardContent(
    ast: Root,
    startBoundary: Boundary,
    endBoundary?: Boundary
  ): string {
    const startIndex = ast.children.findIndex(
      node => node === startBoundary.node
    );

    const endIndex = endBoundary
      ? ast.children.findIndex(node => node === endBoundary.node)
      : ast.children.length;

    // Create new AST with just this section
    const shardAst: Root = {
      type: 'root',
      children: ast.children.slice(startIndex, endIndex)
    };

    // Convert back to markdown
    const processor = unified().use(remarkStringify);
    return processor.stringify(shardAst);
  }

  /**
   * Analyze context boundary for a shard
   * Identifies dependencies and cross-references
   */
  private analyzeContextBoundary(
    content: string,
    allBoundaries: Boundary[],
    currentIndex: number
  ): Shard['contextBoundary'] {
    const references: string[] = [];
    const dependencies: string[] = [];
    const includes: string[] = [];

    // Look for references to other sections
    const linkPattern = /\[([^\]]+)\]\(#([^)]+)\)/g;
    let match;

    while ((match = linkPattern.exec(content)) !== null) {
      const [, linkText, anchor] = match;

      // Find which shard this anchor belongs to
      const targetShard = allBoundaries.find(b =>
        this.generateAnchor(b.title) === anchor
      );

      if (targetShard) {
        references.push(`${targetShard.title} (${anchor})`);

        // If referencing a previous section, it's a dependency
        const targetIndex = allBoundaries.indexOf(targetShard);
        if (targetIndex < currentIndex) {
          dependencies.push(targetShard.title);
        }
      }
    }

    // Include parent context if configured
    if (this.config.preserveContext && currentIndex > 0) {
      includes.push(allBoundaries[currentIndex - 1].title);
    }

    return { includes, references, dependencies };
  }

  /**
   * Adjust heading levels in sharded content
   * Level 2 becomes level 1, level 3 becomes level 2, etc.
   */
  private async adjustHeadingLevels(content: string): Promise<string> {
    const processor = unified().use(remarkParse);
    const ast = processor.parse(content) as Root;

    visit(ast, 'heading', (node: Heading) => {
      if (node.depth > 1) {
        node.depth = (node.depth - 1) as 1 | 2 | 3 | 4 | 5 | 6;
      }
    });

    const stringifier = unified().use(remarkStringify);
    return stringifier.stringify(ast);
  }

  /**
   * Generate a filename from section title
   */
  private generateFilename(title: string, index: number): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return `${index.toString().padStart(2, '0')}-${slug}.md`;
  }

  /**
   * Generate anchor from title (for cross-references)
   */
  private generateAnchor(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Count content lines (excluding empty lines)
   */
  private countContentLines(content: string): number {
    return content.split('\n').filter(line => line.trim()).length;
  }

  /**
   * Detect if content contains code blocks
   */
  private detectCodeBlocks(content: string): boolean {
    return /```[\s\S]*?```/.test(content);
  }

  /**
   * Detect if content contains diagrams (mermaid, etc.)
   */
  private detectDiagrams(content: string): boolean {
    return /```(?:mermaid|graph|sequenceDiagram|gantt|flowchart)/.test(content);
  }

  /**
   * Split a large shard into smaller pieces
   */
  private async splitLargeShard(shard: Shard, ast: Root): Promise<Shard[]> {
    // Parse the shard content
    const processor = unified().use(remarkParse);
    const shardAst = processor.parse(shard.content) as Root;

    // Find sub-boundaries (level 3 headings)
    const subBoundaries: Boundary[] = [];
    visit(shardAst, 'heading', (node: Heading, index) => {
      if (node.depth === 2) {  // Originally level 3, now level 2 after adjustment
        subBoundaries.push({
          index: index ?? 0,
          title: this.extractHeadingText(node),
          line: node.position?.start.line ?? 0,
          depth: node.depth,
          node
        });
      }
    });

    if (subBoundaries.length === 0) {
      // Can't split further, return as-is
      return [shard];
    }

    // Create sub-shards
    const subShards: Shard[] = [];
    for (let i = 0; i < subBoundaries.length; i++) {
      const subShard: Shard = {
        ...shard,
        id: `${shard.id}-${i + 1}`,
        title: `${shard.title} - ${subBoundaries[i].title}`,
        filename: this.generateFilename(
          `${shard.title}-${subBoundaries[i].title}`,
          parseInt(shard.id.split('-')[1]) * 10 + i
        )
      };
      subShards.push(subShard);
    }

    return subShards;
  }

  /**
   * Build navigation index for sharded documents
   */
  private buildIndex(ast: Root, shards: Shard[], documentPath: string): ShardIndex {
    // Extract title and introduction
    let title = 'Document';
    let introduction = '';

    // Find first heading (document title)
    const firstHeading = ast.children.find(node => node.type === 'heading') as Heading;
    if (firstHeading) {
      title = this.extractHeadingText(firstHeading);

      // Get content before first level 2 heading as introduction
      const firstShardIndex = ast.children.findIndex(
        node => node.type === 'heading' && (node as Heading).depth === this.config.shardByLevel
      );

      if (firstShardIndex > 0) {
        const introAst: Root = {
          type: 'root',
          children: ast.children.slice(0, firstShardIndex)
        };
        const processor = unified().use(remarkStringify);
        introduction = processor.stringify(introAst);
      }
    }

    // Build sections list
    const sections = shards.map(shard => ({
      id: shard.id,
      title: shard.title,
      filename: shard.filename,
      line: shard.metadata.originalLine
    }));

    return {
      title,
      introduction,
      sections
    };
  }
}

/**
 * Convenience function for one-shot sharding
 */
export async function shardMarkdown(
  content: string,
  path: string,
  config?: ShardConfig
): Promise<ShardResult> {
  const sharder = new ShardingAlgorithm(config);
  return sharder.shardDocument(content, path);
}
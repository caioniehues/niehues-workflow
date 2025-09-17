import { BoundaryEnforcer, ActionContext } from './BoundaryEnforcer';
import { AgentRole } from './AgentDefinitions';

export interface DocumentShard {
  id: string;
  title: string;
  content: string;
  line_count: number;
  parent_document: string;
  shard_index: number;
  total_shards: number;
  context_dependencies: string[];
  cross_references: CrossReference[];
  semantic_boundaries: SemanticBoundary[];
  navigation_metadata: NavigationMetadata;
}

export interface CrossReference {
  source_shard: string;
  target_shard: string;
  reference_type: 'requirement' | 'definition' | 'example' | 'dependency';
  source_line: number;
  target_section: string;
  description: string;
}

export interface SemanticBoundary {
  boundary_type: 'section' | 'topic' | 'functional_area' | 'architectural_layer';
  starts_at_line: number;
  ends_at_line: number;
  topic: string;
  importance: 'high' | 'medium' | 'low';
  context_required: string[];
}

export interface NavigationMetadata {
  previous_shard?: string;
  next_shard?: string;
  related_shards: string[];
  parent_sections: string[];
  child_sections: string[];
  estimated_reading_time: number;
  complexity_score: number;
}

export interface ShardingResult {
  shards: DocumentShard[];
  navigation_index: NavigationIndex;
  cross_reference_map: Map<string, CrossReference[]>;
  sharding_metrics: ShardingMetrics;
}

export interface NavigationIndex {
  document_id: string;
  total_shards: number;
  estimated_total_time: number;
  shard_hierarchy: ShardHierarchy[];
  topic_index: Map<string, string[]>;
  reference_graph: Map<string, string[]>;
}

export interface ShardHierarchy {
  shard_id: string;
  level: number;
  title: string;
  children: string[];
  estimated_time: number;
}

export interface ShardingMetrics {
  original_lines: number;
  total_shards_created: number;
  average_shard_size: number;
  max_shard_size: number;
  cross_references_count: number;
  semantic_boundaries_identified: number;
  complexity_distribution: Record<string, number>;
  sharding_efficiency: number;
}

export interface ShardingStrategy {
  max_lines_per_shard: number;
  preserve_semantic_boundaries: boolean;
  maintain_code_blocks: boolean;
  split_on_headers: boolean;
  minimum_context_overlap: number;
  cross_reference_tracking: boolean;
}

export class ShardSpecialist {
  private enforcer: BoundaryEnforcer;
  private role = AgentRole.SHARD_SPECIALIST;
  private shardingStrategy: ShardingStrategy = {
    max_lines_per_shard: 500,
    preserve_semantic_boundaries: true,
    maintain_code_blocks: true,
    split_on_headers: true,
    minimum_context_overlap: 50,
    cross_reference_tracking: true
  };

  constructor() {
    this.enforcer = new BoundaryEnforcer(true);
  }

  async shardDocument(
    content: string,
    documentId: string,
    strategy?: Partial<ShardingStrategy>
  ): Promise<ShardingResult> {
    // Enforce boundary: ShardSpecialist can parse and shard documents
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'parse',
      resource: 'specification_documents',
      phase: 'decompose'
    });

    console.log(`✅ Boundary check passed - Sharding document: ${documentId}`);

    if (strategy) {
      this.shardingStrategy = { ...this.shardingStrategy, ...strategy };
    }

    const lines = content.split('\n');
    if (lines.length <= this.shardingStrategy.max_lines_per_shard) {
      return this.createSingleShardResult(content, documentId, lines);
    }

    return await this.performDocumentSharding(lines, documentId);
  }

  async createNavigationIndex(shards: DocumentShard[]): Promise<NavigationIndex> {
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'create',
      resource: 'navigation_indices',
      phase: 'decompose'
    });

    console.log('✅ Creating navigation index for document shards');

    const totalTime = shards.reduce((sum, shard) =>
      sum + shard.navigation_metadata.estimated_reading_time, 0
    );

    const topicIndex = new Map<string, string[]>();
    const referenceGraph = new Map<string, string[]>();
    const hierarchy: ShardHierarchy[] = [];

    for (const shard of shards) {
      // Build topic index
      for (const boundary of shard.semantic_boundaries) {
        const topic = boundary.topic.toLowerCase();
        if (!topicIndex.has(topic)) {
          topicIndex.set(topic, []);
        }
        topicIndex.get(topic)!.push(shard.id);
      }

      // Build reference graph
      const references = shard.cross_references.map(ref => ref.target_shard);
      referenceGraph.set(shard.id, references);

      // Build hierarchy
      hierarchy.push({
        shard_id: shard.id,
        level: this.calculateShardLevel(shard),
        title: shard.title,
        children: this.findChildShards(shard, shards),
        estimated_time: shard.navigation_metadata.estimated_reading_time
      });
    }

    return {
      document_id: shards[0]?.parent_document || 'unknown',
      total_shards: shards.length,
      estimated_total_time: totalTime,
      shard_hierarchy: hierarchy,
      topic_index: topicIndex,
      reference_graph: referenceGraph
    };
  }

  async validateShardBoundaries(shards: DocumentShard[]): Promise<boolean> {
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'validate',
      resource: 'shard_boundaries',
      phase: 'decompose'
    });

    console.log('✅ Validating shard boundaries and integrity');

    // Check size constraints
    for (const shard of shards) {
      if (shard.line_count > this.shardingStrategy.max_lines_per_shard) {
        console.error(`❌ Shard ${shard.id} exceeds maximum size: ${shard.line_count} lines`);
        return false;
      }
    }

    // Validate cross-references
    const shardIds = new Set(shards.map(s => s.id));
    for (const shard of shards) {
      for (const ref of shard.cross_references) {
        if (!shardIds.has(ref.target_shard)) {
          console.error(`❌ Invalid cross-reference: ${ref.source_shard} -> ${ref.target_shard}`);
          return false;
        }
      }
    }

    // Check semantic boundary integrity
    for (const shard of shards) {
      if (!this.validateSemanticBoundaries(shard)) {
        console.error(`❌ Semantic boundary validation failed for shard: ${shard.id}`);
        return false;
      }
    }

    console.log('✅ All shard boundaries validated successfully');
    return true;
  }

  async generateShardingReport(result: ShardingResult): Promise<string> {
    this.enforcer.enforceBoundary({
      agent_role: this.role,
      action: 'generate',
      resource: 'sharding_reports',
      phase: 'decompose'
    });

    const metrics = result.sharding_metrics;
    const reductionPercentage = ((metrics.original_lines - (metrics.total_shards_created * metrics.average_shard_size)) / metrics.original_lines * 100).toFixed(1);

    return `
# Document Sharding Report

## Summary
- **Original Size**: ${metrics.original_lines} lines
- **Shards Created**: ${metrics.total_shards_created}
- **Average Shard Size**: ${Math.round(metrics.average_shard_size)} lines
- **Maximum Shard Size**: ${metrics.max_shard_size} lines
- **Size Reduction**: ${reductionPercentage}%
- **Sharding Efficiency**: ${(metrics.sharding_efficiency * 100).toFixed(1)}%

## Cross-Reference Analysis
- **Total Cross-References**: ${metrics.cross_references_count}
- **Average References per Shard**: ${(metrics.cross_references_count / metrics.total_shards_created).toFixed(1)}
- **Reference Graph Connectivity**: ${this.calculateConnectivity(result)}%

## Semantic Boundary Analysis
- **Boundaries Identified**: ${metrics.semantic_boundaries_identified}
- **High Importance**: ${metrics.complexity_distribution.high || 0}
- **Medium Importance**: ${metrics.complexity_distribution.medium || 0}
- **Low Importance**: ${metrics.complexity_distribution.low || 0}

## Navigation Structure
${this.generateNavigationSummary(result.navigation_index)}

## Quality Metrics
- **Shard Size Consistency**: ${this.calculateSizeConsistency(result.shards)}%
- **Context Overlap Coverage**: ${this.calculateContextCoverage(result.shards)}%
- **Reference Integrity**: ${await this.validateShardBoundaries(result.shards) ? '100%' : 'FAILED'}

## Recommendations
${this.generateShardingRecommendations(result)}
`;
  }

  // Constitutional enforcement: ShardSpecialist CANNOT modify content
  async modifySpecificationContent(content: string): Promise<never> {
    try {
      this.enforcer.enforceBoundary({
        agent_role: this.role,
        action: 'modify',
        resource: 'specification_content',
        phase: 'decompose'
      });
    } catch (error) {
      console.error('❌ Constitutional violation: ShardSpecialist cannot modify specification content');
      throw error;
    }
  }

  // Constitutional enforcement: ShardSpecialist CANNOT change requirements
  async updateRequirements(requirements: any[]): Promise<never> {
    try {
      this.enforcer.enforceBoundary({
        agent_role: this.role,
        action: 'update',
        resource: 'requirements',
        phase: 'specify'
      });
    } catch (error) {
      console.error('❌ Constitutional violation: ShardSpecialist cannot change requirements');
      throw error;
    }
  }

  // Constitutional enforcement: ShardSpecialist CANNOT write code
  async implementCode(code: string): Promise<never> {
    try {
      this.enforcer.enforceBoundary({
        agent_role: this.role,
        action: 'implement',
        resource: 'source_code',
        phase: 'implement'
      });
    } catch (error) {
      console.error('❌ Constitutional violation: ShardSpecialist cannot write code');
      throw error;
    }
  }

  // Private implementation methods

  private async performDocumentSharding(
    lines: string[],
    documentId: string
  ): Promise<ShardingResult> {
    const semanticBoundaries = this.identifySemanticBoundaries(lines);
    const shardBreakpoints = this.calculateOptimalBreakpoints(lines, semanticBoundaries);
    const shards: DocumentShard[] = [];
    const crossReferences: CrossReference[] = [];

    for (let i = 0; i < shardBreakpoints.length - 1; i++) {
      const startLine = shardBreakpoints[i];
      const endLine = shardBreakpoints[i + 1];
      const shardContent = lines.slice(startLine, endLine);

      const shard = await this.createDocumentShard(
        shardContent,
        documentId,
        i,
        shardBreakpoints.length - 1,
        startLine,
        semanticBoundaries
      );

      shards.push(shard);
      crossReferences.push(...shard.cross_references);
    }

    // Update navigation metadata for each shard
    this.updateNavigationMetadata(shards);

    const navigationIndex = await this.createNavigationIndex(shards);
    const crossReferenceMap = this.buildCrossReferenceMap(crossReferences);
    const metrics = this.calculateShardingMetrics(lines, shards);

    return {
      shards,
      navigation_index: navigationIndex,
      cross_reference_map: crossReferenceMap,
      sharding_metrics: metrics
    };
  }

  private createSingleShardResult(
    content: string,
    documentId: string,
    lines: string[]
  ): ShardingResult {
    const shard: DocumentShard = {
      id: `${documentId}_shard_1`,
      title: this.extractTitle(lines),
      content: content,
      line_count: lines.length,
      parent_document: documentId,
      shard_index: 0,
      total_shards: 1,
      context_dependencies: [],
      cross_references: [],
      semantic_boundaries: [],
      navigation_metadata: {
        estimated_reading_time: Math.ceil(lines.length / 50),
        complexity_score: this.calculateComplexityScore(lines)
      }
    };

    const navigationIndex: NavigationIndex = {
      document_id: documentId,
      total_shards: 1,
      estimated_total_time: shard.navigation_metadata.estimated_reading_time,
      shard_hierarchy: [{
        shard_id: shard.id,
        level: 0,
        title: shard.title,
        children: [],
        estimated_time: shard.navigation_metadata.estimated_reading_time
      }],
      topic_index: new Map(),
      reference_graph: new Map()
    };

    const metrics: ShardingMetrics = {
      original_lines: lines.length,
      total_shards_created: 1,
      average_shard_size: lines.length,
      max_shard_size: lines.length,
      cross_references_count: 0,
      semantic_boundaries_identified: 0,
      complexity_distribution: { low: 1 },
      sharding_efficiency: 1.0
    };

    return {
      shards: [shard],
      navigation_index: navigationIndex,
      cross_reference_map: new Map(),
      sharding_metrics: metrics
    };
  }

  private identifySemanticBoundaries(lines: string[]): SemanticBoundary[] {
    const boundaries: SemanticBoundary[] = [];
    let currentTopic = '';
    let sectionStart = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Major headers (# ##)
      if (/^#{1,2}\s+/.test(line)) {
        if (currentTopic && i > sectionStart) {
          boundaries.push({
            boundary_type: 'section',
            starts_at_line: sectionStart,
            ends_at_line: i - 1,
            topic: currentTopic,
            importance: 'high',
            context_required: this.extractContextFromSection(lines.slice(sectionStart, i))
          });
        }
        currentTopic = line.replace(/^#{1,2}\s+/, '');
        sectionStart = i;
      }

      // Functional boundaries (code blocks, lists, tables)
      else if (this.isFunctionalBoundary(line)) {
        boundaries.push({
          boundary_type: 'functional_area',
          starts_at_line: i,
          ends_at_line: this.findFunctionalBoundaryEnd(lines, i),
          topic: this.extractFunctionalTopic(lines, i),
          importance: 'medium',
          context_required: []
        });
      }
    }

    // Add final boundary
    if (currentTopic && sectionStart < lines.length) {
      boundaries.push({
        boundary_type: 'section',
        starts_at_line: sectionStart,
        ends_at_line: lines.length - 1,
        topic: currentTopic,
        importance: 'high',
        context_required: this.extractContextFromSection(lines.slice(sectionStart))
      });
    }

    return boundaries;
  }

  private calculateOptimalBreakpoints(
    lines: string[],
    boundaries: SemanticBoundary[]
  ): number[] {
    const breakpoints = [0];
    let currentSize = 0;
    const maxSize = this.shardingStrategy.max_lines_per_shard;

    for (const boundary of boundaries) {
      const boundarySize = boundary.ends_at_line - boundary.starts_at_line + 1;

      // If adding this boundary would exceed max size, create a breakpoint
      if (currentSize + boundarySize > maxSize && currentSize > 0) {
        breakpoints.push(boundary.starts_at_line);
        currentSize = boundarySize;
      } else {
        currentSize += boundarySize;
      }
    }

    breakpoints.push(lines.length);
    return breakpoints;
  }

  private async createDocumentShard(
    content: string[],
    documentId: string,
    index: number,
    totalShards: number,
    startLine: number,
    allBoundaries: SemanticBoundary[]
  ): Promise<DocumentShard> {
    const shardId = `${documentId}_shard_${index + 1}`;
    const title = this.extractTitle(content) || `Shard ${index + 1}`;

    // Find semantic boundaries within this shard
    const shardBoundaries = allBoundaries.filter(boundary =>
      boundary.starts_at_line >= startLine &&
      boundary.ends_at_line < startLine + content.length
    );

    // Adjust boundary line numbers to be relative to shard
    const adjustedBoundaries = shardBoundaries.map(boundary => ({
      ...boundary,
      starts_at_line: boundary.starts_at_line - startLine,
      ends_at_line: boundary.ends_at_line - startLine
    }));

    const crossReferences = this.extractCrossReferences(content, shardId, startLine);
    const contextDependencies = this.identifyContextDependencies(content, adjustedBoundaries);

    return {
      id: shardId,
      title: title,
      content: content.join('\n'),
      line_count: content.length,
      parent_document: documentId,
      shard_index: index,
      total_shards: totalShards,
      context_dependencies: contextDependencies,
      cross_references: crossReferences,
      semantic_boundaries: adjustedBoundaries,
      navigation_metadata: {
        estimated_reading_time: Math.ceil(content.length / 50),
        complexity_score: this.calculateComplexityScore(content)
      }
    };
  }

  private extractCrossReferences(
    content: string[],
    shardId: string,
    startLine: number
  ): CrossReference[] {
    const references: CrossReference[] = [];

    for (let i = 0; i < content.length; i++) {
      const line = content[i];

      // Find markdown links
      const linkMatches = line.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
      for (const match of linkMatches) {
        if (match[2].startsWith('#') || match[2].includes('.md')) {
          references.push({
            source_shard: shardId,
            target_shard: this.resolveReferenceTarget(match[2]),
            reference_type: 'definition',
            source_line: startLine + i,
            target_section: match[2],
            description: match[1]
          });
        }
      }

      // Find requirement references (REQ-xxx, US-xxx, etc.)
      const reqMatches = line.matchAll(/\b(REQ|US|AC|TC)-\d+/g);
      for (const match of reqMatches) {
        references.push({
          source_shard: shardId,
          target_shard: `requirement_${match[0]}`,
          reference_type: 'requirement',
          source_line: startLine + i,
          target_section: match[0],
          description: `Reference to ${match[0]}`
        });
      }
    }

    return references;
  }

  private updateNavigationMetadata(shards: DocumentShard[]): void {
    for (let i = 0; i < shards.length; i++) {
      const shard = shards[i];

      shard.navigation_metadata = {
        ...shard.navigation_metadata,
        previous_shard: i > 0 ? shards[i - 1].id : undefined,
        next_shard: i < shards.length - 1 ? shards[i + 1].id : undefined,
        related_shards: this.findRelatedShards(shard, shards),
        parent_sections: this.extractParentSections(shard),
        child_sections: this.extractChildSections(shard)
      };
    }
  }

  private calculateShardingMetrics(
    originalLines: string[],
    shards: DocumentShard[]
  ): ShardingMetrics {
    const totalShards = shards.length;
    const averageSize = shards.reduce((sum, shard) => sum + shard.line_count, 0) / totalShards;
    const maxSize = Math.max(...shards.map(shard => shard.line_count));
    const crossRefsCount = shards.reduce((sum, shard) => sum + shard.cross_references.length, 0);
    const boundariesCount = shards.reduce((sum, shard) => sum + shard.semantic_boundaries.length, 0);

    const complexityDist = shards.reduce((dist, shard) => {
      const score = shard.navigation_metadata.complexity_score;
      const level = score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low';
      dist[level] = (dist[level] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    const efficiency = 1 - (Math.abs(averageSize - this.shardingStrategy.max_lines_per_shard / 2) /
                           this.shardingStrategy.max_lines_per_shard);

    return {
      original_lines: originalLines.length,
      total_shards_created: totalShards,
      average_shard_size: averageSize,
      max_shard_size: maxSize,
      cross_references_count: crossRefsCount,
      semantic_boundaries_identified: boundariesCount,
      complexity_distribution: complexityDist,
      sharding_efficiency: Math.max(0, efficiency)
    };
  }

  // Helper methods for various calculations
  private extractTitle(lines: string[]): string {
    for (const line of lines.slice(0, 10)) {
      const match = line.match(/^#{1,3}\s+(.+)$/);
      if (match) return match[1].trim();
    }
    return 'Untitled Shard';
  }

  private calculateComplexityScore(lines: string[]): number {
    let score = 0;
    const factors = {
      codeBlocks: 0.3,
      tables: 0.2,
      lists: 0.1,
      links: 0.05,
      headers: 0.1
    };

    for (const line of lines) {
      if (/^```/.test(line)) score += factors.codeBlocks;
      if (/^\|/.test(line)) score += factors.tables;
      if (/^[\s]*[-*+]\s/.test(line)) score += factors.lists;
      if (/\[.*\]\(.*\)/.test(line)) score += factors.links;
      if (/^#{1,6}\s/.test(line)) score += factors.headers;
    }

    return Math.min(1, score / lines.length * 100);
  }

  private calculateShardLevel(shard: DocumentShard): number {
    return shard.semantic_boundaries.reduce((maxLevel, boundary) => {
      const headerMatch = shard.content.match(new RegExp(`^(#{1,6})\\s+${boundary.topic}`, 'm'));
      return headerMatch ? Math.max(maxLevel, headerMatch[1].length) : maxLevel;
    }, 1);
  }

  private findChildShards(shard: DocumentShard, allShards: DocumentShard[]): string[] {
    const shardLevel = this.calculateShardLevel(shard);
    return allShards
      .filter(s => s.id !== shard.id && this.calculateShardLevel(s) > shardLevel)
      .map(s => s.id);
  }

  private validateSemanticBoundaries(shard: DocumentShard): boolean {
    return shard.semantic_boundaries.every(boundary =>
      boundary.starts_at_line >= 0 &&
      boundary.ends_at_line < shard.line_count &&
      boundary.starts_at_line <= boundary.ends_at_line
    );
  }

  private buildCrossReferenceMap(references: CrossReference[]): Map<string, CrossReference[]> {
    const map = new Map<string, CrossReference[]>();
    for (const ref of references) {
      if (!map.has(ref.source_shard)) {
        map.set(ref.source_shard, []);
      }
      map.get(ref.source_shard)!.push(ref);
    }
    return map;
  }

  private isFunctionalBoundary(line: string): boolean {
    return /^```|^\|.*\||^[-*+]\s|^>\s/.test(line.trim());
  }

  private findFunctionalBoundaryEnd(lines: string[], start: number): number {
    const startLine = lines[start].trim();
    if (startLine.startsWith('```')) {
      for (let i = start + 1; i < lines.length; i++) {
        if (lines[i].trim().startsWith('```')) return i;
      }
    }
    return start;
  }

  private extractFunctionalTopic(lines: string[], index: number): string {
    const line = lines[index].trim();
    if (line.startsWith('```')) {
      return `Code block (${line.slice(3) || 'generic'})`;
    }
    if (line.startsWith('|')) return 'Table';
    if (/^[-*+]\s/.test(line)) return 'List';
    return 'Functional area';
  }

  private extractContextFromSection(lines: string[]): string[] {
    const context: string[] = [];
    for (const line of lines.slice(0, 5)) {
      if (line.trim() && !line.startsWith('#')) {
        context.push(line.trim().slice(0, 50));
      }
    }
    return context;
  }

  private identifyContextDependencies(
    content: string[],
    boundaries: SemanticBoundary[]
  ): string[] {
    const dependencies: Set<string> = new Set();

    for (const boundary of boundaries) {
      dependencies.add(boundary.topic);
      for (const context of boundary.context_required) {
        dependencies.add(context);
      }
    }

    return Array.from(dependencies);
  }

  private resolveReferenceTarget(reference: string): string {
    if (reference.startsWith('#')) {
      return `section_${reference.slice(1)}`;
    }
    if (reference.includes('.md')) {
      return reference.replace('.md', '_document');
    }
    return `external_${reference}`;
  }

  private findRelatedShards(shard: DocumentShard, allShards: DocumentShard[]): string[] {
    const related: Set<string> = new Set();

    // Add shards referenced by this shard
    for (const ref of shard.cross_references) {
      related.add(ref.target_shard);
    }

    // Add shards that reference this shard
    for (const otherShard of allShards) {
      if (otherShard.id === shard.id) continue;

      for (const ref of otherShard.cross_references) {
        if (ref.target_shard === shard.id) {
          related.add(otherShard.id);
        }
      }
    }

    return Array.from(related);
  }

  private extractParentSections(shard: DocumentShard): string[] {
    return shard.semantic_boundaries
      .filter(b => b.boundary_type === 'section' && b.importance === 'high')
      .map(b => b.topic);
  }

  private extractChildSections(shard: DocumentShard): string[] {
    return shard.semantic_boundaries
      .filter(b => b.boundary_type !== 'section')
      .map(b => b.topic);
  }

  private calculateConnectivity(result: ShardingResult): number {
    const totalPossibleConnections = result.shards.length * (result.shards.length - 1);
    const actualConnections = result.sharding_metrics.cross_references_count;
    return totalPossibleConnections > 0 ? (actualConnections / totalPossibleConnections * 100) : 0;
  }

  private generateNavigationSummary(index: NavigationIndex): string {
    let summary = `- **Total Shards**: ${index.total_shards}\n`;
    summary += `- **Estimated Reading Time**: ${index.estimated_total_time} minutes\n`;
    summary += `- **Hierarchy Levels**: ${Math.max(...index.shard_hierarchy.map(h => h.level))}\n`;
    summary += `- **Topics Indexed**: ${index.topic_index.size}\n`;
    return summary;
  }

  private calculateSizeConsistency(shards: DocumentShard[]): number {
    if (shards.length === 0) return 100;

    const sizes = shards.map(s => s.line_count);
    const mean = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const variance = sizes.reduce((sum, size) => sum + Math.pow(size - mean, 2), 0) / sizes.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(0, 100 - (stdDev / mean * 100));
  }

  private calculateContextCoverage(shards: DocumentShard[]): number {
    const totalContext = shards.reduce((sum, shard) => sum + shard.context_dependencies.length, 0);
    const coveredContext = shards.reduce((sum, shard) => {
      const covered = shard.context_dependencies.filter(dep =>
        shards.some(s => s.semantic_boundaries.some(b => b.topic.includes(dep)))
      ).length;
      return sum + covered;
    }, 0);

    return totalContext > 0 ? (coveredContext / totalContext * 100) : 100;
  }

  private generateShardingRecommendations(result: ShardingResult): string {
    const metrics = result.sharding_metrics;
    const recommendations: string[] = [];

    if (metrics.sharding_efficiency < 0.7) {
      recommendations.push('- Consider adjusting shard size limits for better efficiency');
    }

    if (metrics.cross_references_count / metrics.total_shards_created < 2) {
      recommendations.push('- Document may benefit from more cross-referencing');
    }

    if (metrics.complexity_distribution.high > metrics.total_shards_created * 0.3) {
      recommendations.push('- High complexity shards may need further decomposition');
    }

    if (recommendations.length === 0) {
      recommendations.push('- Sharding quality is optimal, no recommendations needed');
    }

    return recommendations.join('\n');
  }
}
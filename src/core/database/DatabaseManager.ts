import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';
import type {
  SessionRow,
  PatternRow,
  QuestionRow,
  TaskRow,
  AgentContextRow,
} from '../../types/database.js';

export class DatabaseManager {
  private db: Database.Database;
  private readonly dbPath: string;
  private idCounter: number = 0;

  constructor(projectPath: string = '.') {
    const nexusDir = join(projectPath, '.nexus');
    mkdirSync(nexusDir, { recursive: true });

    this.dbPath = join(nexusDir, 'nexus.db');
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    this.initialize();
  }

  private initialize(): void {
    // Sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        project_name TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT CHECK(status IN ('active', 'completed', 'failed')) DEFAULT 'active',
        phase TEXT CHECK(phase IN ('init', 'brainstorm', 'specify', 'decompose', 'implement'))
      )
    `);

    // Context cache table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS context_cache (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        phase TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        ttl TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        UNIQUE(session_id, phase, key)
      )
    `);

    // Patterns table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS patterns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        pattern TEXT NOT NULL,
        frequency INTEGER DEFAULT 1,
        success_rate REAL DEFAULT 1.0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Questions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        phase TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT,
        confidence_impact REAL DEFAULT 0,
        asked_at TEXT DEFAULT CURRENT_TIMESTAMP,
        answered_at TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      )
    `);

    // Confidence scores table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS confidence_scores (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        phase TEXT NOT NULL,
        score REAL NOT NULL CHECK(score >= 0 AND score <= 1),
        factors TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      )
    `);

    // Tasks table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT CHECK(status IN ('pending', 'in_progress', 'completed', 'blocked')) DEFAULT 'pending',
        dependencies TEXT DEFAULT '[]',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      )
    `);

    // Agent context table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_context (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        agent_name TEXT NOT NULL,
        phase TEXT NOT NULL,
        findings TEXT NOT NULL,
        confidence REAL NOT NULL CHECK(confidence >= 0 AND confidence <= 1),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      )
    `);

    // Constitution table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS constitution (
        id TEXT PRIMARY KEY,
        project_name TEXT NOT NULL UNIQUE,
        rules TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_context_cache_session ON context_cache(session_id);
      CREATE INDEX IF NOT EXISTS idx_context_cache_ttl ON context_cache(ttl);
      CREATE INDEX IF NOT EXISTS idx_questions_session ON questions(session_id);
      CREATE INDEX IF NOT EXISTS idx_confidence_session ON confidence_scores(session_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_session ON tasks(session_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_agent_context_session ON agent_context(session_id);
      CREATE INDEX IF NOT EXISTS idx_patterns_category ON patterns(category);
    `);
  }

  // Session operations
  createSession(projectName: string, phase: string = 'init'): SessionRow {
    const id = this.generateId();
    const stmt = this.db.prepare(`
      INSERT INTO sessions (id, project_name, phase)
      VALUES (?, ?, ?)
    `);

    stmt.run(id, projectName, phase);
    return this.getSession(id)!;
  }

  getSession(id: string): SessionRow | undefined {
    const stmt = this.db.prepare('SELECT * FROM sessions WHERE id = ?');
    return stmt.get(id) as SessionRow | undefined;
  }

  updateSession(id: string, updates: Partial<SessionRow>): void {
    const fields = Object.keys(updates)
      .filter(k => k !== 'id')
      .map(k => `${k} = ?`);

    if (fields.length === 0) return;

    const values = Object.keys(updates)
      .filter(k => k !== 'id')
      .map(k => (updates as any)[k]);

    values.push(new Date().toISOString());
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE sessions
      SET ${fields.join(', ')}, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(...values);
  }

  // Context cache operations
  setContext(sessionId: string, phase: string, key: string, value: any, ttlMinutes: number = 60): void {
    const ttl = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

    // First check if the key exists
    const existing = this.db.prepare(`
      SELECT id FROM context_cache
      WHERE session_id = ? AND phase = ? AND key = ?
    `).get(sessionId, phase, key) as { id: string } | undefined;

    if (existing) {
      // Update existing
      const stmt = this.db.prepare(`
        UPDATE context_cache
        SET value = ?, ttl = ?
        WHERE id = ?
      `);
      stmt.run(JSON.stringify(value), ttl, existing.id);
    } else {
      // Insert new
      const id = this.generateId();
      const stmt = this.db.prepare(`
        INSERT INTO context_cache (id, session_id, phase, key, value, ttl)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, sessionId, phase, key, JSON.stringify(value), ttl);
    }
  }

  getContext<T = any>(sessionId: string, phase: string, key: string): T | undefined {
    this.cleanExpiredContext();

    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      SELECT value FROM context_cache
      WHERE session_id = ? AND phase = ? AND key = ? AND ttl > ?
    `);

    const result = stmt.get(sessionId, phase, key, now) as { value: string } | undefined;
    return result ? JSON.parse(result.value) : undefined;
  }

  private cleanExpiredContext(): void {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      DELETE FROM context_cache WHERE ttl < ?
    `);
    stmt.run(now);
  }

  // Pattern operations
  savePattern(name: string, category: string, pattern: any): void {
    const id = this.generateId();
    const stmt = this.db.prepare(`
      INSERT INTO patterns (id, name, category, pattern)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(name) DO UPDATE SET
        frequency = frequency + 1,
        pattern = excluded.pattern,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(id, name, category, JSON.stringify(pattern));
  }

  getPatterns(category?: string): PatternRow[] {
    const stmt = category
      ? this.db.prepare('SELECT * FROM patterns WHERE category = ? ORDER BY success_rate DESC, frequency DESC')
      : this.db.prepare('SELECT * FROM patterns ORDER BY success_rate DESC, frequency DESC');

    return (category ? stmt.all(category) : stmt.all()) as PatternRow[];
  }

  // Question operations
  saveQuestion(sessionId: string, phase: string, question: string): string {
    const id = this.generateId();
    const stmt = this.db.prepare(`
      INSERT INTO questions (id, session_id, phase, question)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, sessionId, phase, question);
    return id;
  }

  answerQuestion(questionId: string, answer: string, confidenceImpact: number): void {
    const stmt = this.db.prepare(`
      UPDATE questions
      SET answer = ?, confidence_impact = ?, answered_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(answer, confidenceImpact, questionId);
  }

  getUnansweredQuestions(sessionId: string): QuestionRow[] {
    const stmt = this.db.prepare(`
      SELECT * FROM questions
      WHERE session_id = ? AND answer IS NULL
      ORDER BY asked_at ASC
    `);

    return stmt.all(sessionId) as QuestionRow[];
  }

  // Confidence operations
  saveConfidence(sessionId: string, phase: string, score: number, factors: any): void {
    const id = this.generateId();
    const stmt = this.db.prepare(`
      INSERT INTO confidence_scores (id, session_id, phase, score, factors)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, sessionId, phase, score, JSON.stringify(factors));
  }

  getLatestConfidence(sessionId: string, phase: string): number {
    const stmt = this.db.prepare(`
      SELECT score FROM confidence_scores
      WHERE session_id = ? AND phase = ?
      ORDER BY id DESC
      LIMIT 1
    `);

    const result = stmt.get(sessionId, phase) as { score: number } | undefined;
    return result?.score ?? 0;
  }

  // Task operations
  createTask(sessionId: string, name: string, description: string, dependencies: string[] = []): string {
    const id = this.generateId();
    const stmt = this.db.prepare(`
      INSERT INTO tasks (id, session_id, name, description, dependencies)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, sessionId, name, description, JSON.stringify(dependencies));
    return id;
  }

  updateTaskStatus(taskId: string, status: TaskRow['status']): void {
    const stmt = this.db.prepare(`
      UPDATE tasks
      SET status = ?, updated_at = CURRENT_TIMESTAMP,
          completed_at = CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
      WHERE id = ?
    `);

    stmt.run(status, status, taskId);
  }

  getTasks(sessionId: string, status?: TaskRow['status']): TaskRow[] {
    const stmt = status
      ? this.db.prepare('SELECT * FROM tasks WHERE session_id = ? AND status = ? ORDER BY created_at ASC')
      : this.db.prepare('SELECT * FROM tasks WHERE session_id = ? ORDER BY created_at ASC');

    return (status ? stmt.all(sessionId, status) : stmt.all(sessionId)) as TaskRow[];
  }

  // Agent context operations
  saveAgentContext(sessionId: string, agentName: string, phase: string, findings: any, confidence: number): void {
    const id = this.generateId();
    const stmt = this.db.prepare(`
      INSERT INTO agent_context (id, session_id, agent_name, phase, findings, confidence)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, sessionId, agentName, phase, JSON.stringify(findings), confidence);
  }

  getAgentContexts(sessionId: string, phase?: string): AgentContextRow[] {
    const stmt = phase
      ? this.db.prepare('SELECT * FROM agent_context WHERE session_id = ? AND phase = ? ORDER BY created_at DESC')
      : this.db.prepare('SELECT * FROM agent_context WHERE session_id = ? ORDER BY created_at DESC');

    return (phase ? stmt.all(sessionId, phase) : stmt.all(sessionId)) as AgentContextRow[];
  }

  // Constitution operations
  saveConstitution(projectName: string, rules: any): void {
    const id = this.generateId();
    const stmt = this.db.prepare(`
      INSERT INTO constitution (id, project_name, rules)
      VALUES (?, ?, ?)
      ON CONFLICT(project_name) DO UPDATE SET
        rules = excluded.rules,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(id, projectName, JSON.stringify(rules));
  }

  getConstitution(projectName: string): any | undefined {
    const stmt = this.db.prepare('SELECT rules FROM constitution WHERE project_name = ?');
    const result = stmt.get(projectName) as { rules: string } | undefined;
    return result ? JSON.parse(result.rules) : undefined;
  }

  // Utility methods
  private generateId(): string {
    const timestamp = Date.now();
    const counter = (this.idCounter++).toString().padStart(6, '0');
    const random = Math.random().toString(36).substring(2, 6);
    return `${timestamp}-${counter}-${random}`;
  }

  close(): void {
    this.db.close();
  }

  // Transaction support
  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  // Prepare statement for reuse
  prepare(sql: string): Database.Statement {
    return this.db.prepare(sql);
  }
}
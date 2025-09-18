export interface SessionRow {
  id: string;
  project_name: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'completed' | 'failed';
  phase: 'init' | 'brainstorm' | 'specify' | 'decompose' | 'implement';
}

export interface ContextCacheRow {
  id: string;
  session_id: string;
  phase: string;
  key: string;
  value: string; // JSON string
  ttl: string; // ISO date string
  created_at: string;
}

export interface PatternRow {
  id: string;
  name: string;
  category: string;
  pattern: string; // JSON string
  frequency: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionRow {
  id: string;
  session_id: string;
  phase: string;
  question: string;
  answer: string | null;
  confidence_impact: number;
  asked_at: string;
  answered_at: string | null;
}

export interface ConfidenceRow {
  id: string;
  session_id: string;
  phase: string;
  score: number;
  factors: string; // JSON string
  timestamp: string;
}

export interface TaskRow {
  id: string;
  session_id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dependencies: string; // JSON array of task IDs
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface AgentContextRow {
  id: string;
  session_id: string;
  agent_name: string;
  phase: string;
  findings: string; // JSON string
  confidence: number;
  created_at: string;
}

export interface ConstitutionRow {
  id: string;
  project_name: string;
  rules: string; // JSON string
  created_at: string;
  updated_at: string;
}
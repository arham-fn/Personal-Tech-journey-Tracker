export interface Topic {
  id: string;
  name: string;
  domain: string;
  subdomain?: string;
  definition: string;
  problem?: string;
  usage?: string;
  concept?: string;
  exercise?: string;
  learningTarget?: string;
  learningMode?: string;
  needInstall?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime?: number; // minutes
  priority: number; // 1-5
  priorityLabel?: string; // P1, P2, P3
  planWeek?: string; // W1, W2, etc.
  status: 'Not started' | 'Learning' | 'Tried it' | 'Done (can explain)' | 'Comfortable' | 'Skip / N/A' | string;
  confidence: number; // 1-5
  notes?: string;
  prerequisites?: string[];
  resources?: string[];
  officialUrl?: string;
  alreadyKnow?: 'Yes' | 'No' | 'Unsure' | string;
  installedTried?: 'Yes' | 'No' | 'Not applicable' | string;
  createdAt?: string; // ISO
  lastStudiedAt?: string;
  nextRevisionAt?: string;
  archived?: boolean;
}

export interface Session {
  id: string;
  date: string; // ISO date only
  topicId: string;
  duration: number; // minutes
  activity: 'Learn' | 'Practice' | 'Build' | 'Revise' | string;
  notes: string;
  outcomeUrl?: string;
}

export interface Settings {
  targetDate: string; // ISO date
  weeklyHourGoal: number;
  weeklySessionGoal: number;
  revisionIntervalDays: number;
  stageStartDate?: string;
  stageDeadline?: string;
}

export interface InstallItem {
  order: number;
  toolSetup: string;
  whyNeeded: string;
  installPriority: string;
  whereItRuns: string;
  verification: string;
  officialUrl: string;
  setupStatus: string;
  notes?: string;
}

export interface WeekPlanItem {
  week: string;
  dates: string;
  focus: string;
  atlasAreas: string;
  outputToBuild: string;
  successCheck: string;
  priority: string;
  notes?: string;
}

export interface CareerDirectionItem {
  direction: string;
  miniExperiment: string;
  usefulTopics: string;
  workFeelsLike: string;
  signsFit: string;
  curiosity: number;
  enjoyDebugging: number;
  wantToRepeat: number;
  exploreSixMonths: string;
  notes?: string;
}

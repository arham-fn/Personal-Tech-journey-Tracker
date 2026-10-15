import fs from 'fs';
import path from 'path';

function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

const raw = fs.readFileSync('tech_atlas_raw.csv', 'utf-8');
const lines = raw.split(/\r?\n/);

let mode = '';
const topics = [];
const installQueue = [];
const weeklyPlan = [];
const careerLab = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  if (line.includes('TECH ATLAS | 2026 EXPLORATION TRACKER')) {
    mode = 'ATLAS_HEADER';
    continue;
  }
  if (line.includes('INSTALL & HANDS-ON QUEUE')) {
    mode = 'INSTALL_HEADER';
    continue;
  }
  if (line.includes('12-WEEK EXPLORATION PLAN')) {
    mode = 'PLAN_HEADER';
    continue;
  }
  if (line.includes('CAREER LAB | JANUARY DECISION SUPPORT')) {
    mode = 'CAREER_HEADER';
    continue;
  }

  if (mode === 'ATLAS_HEADER') {
    if (line.startsWith('ID,Domain,Subdomain')) {
      mode = 'ATLAS_DATA';
    }
    continue;
  }

  if (mode === 'INSTALL_HEADER') {
    if (line.startsWith('Order,Tool / setup')) {
      mode = 'INSTALL_DATA';
    }
    continue;
  }

  if (mode === 'PLAN_HEADER') {
    if (line.startsWith('Week,Dates,Focus')) {
      mode = 'PLAN_DATA';
    }
    continue;
  }

  if (mode === 'CAREER_HEADER') {
    if (line.startsWith('Direction to test,Mini-experiment')) {
      mode = 'CAREER_DATA';
    }
    continue;
  }

  if (mode === 'ATLAS_DATA') {
    if (line.startsWith('T')) {
      const cols = parseCSVLine(line);
      if (cols.length >= 18) {
        topics.push({
          id: cols[0],
          domain: cols[1],
          subdomain: cols[2],
          name: cols[3],
          definition: cols[4],
          problem: cols[5],
          usage: cols[6],
          learningTarget: cols[7],
          learningMode: cols[8],
          needInstall: cols[9],
          priority: cols[10] === 'P1' ? 5 : cols[10] === 'P2' ? 4 : 3,
          priorityLabel: cols[10],
          planWeek: cols[11],
          prerequisites: cols[12] && cols[12] !== 'None' ? cols[12].split(',').map(s => s.trim()) : [],
          exercise: cols[13],
          officialUrl: cols[15] || '',
          alreadyKnow: cols[16] || 'Unsure',
          status: cols[17] || 'Not started',
          installedTried: cols[18] || 'No',
          notes: cols[19] || '',
          estimatedTime: 60,
          confidence: cols[17] === 'Comfortable' ? 5 : 1,
          createdAt: '2026-10-12T00:00:00.000Z',
          archived: false,
        });
      }
    }
  } else if (mode === 'INSTALL_DATA') {
    if (/^\d+,/.test(line)) {
      const cols = parseCSVLine(line);
      installQueue.push({
        order: Number(cols[0]),
        toolSetup: cols[1],
        whyNeeded: cols[2],
        installPriority: cols[3],
        whereItRuns: cols[4],
        verification: cols[5],
        officialUrl: cols[7] || '',
        setupStatus: cols[8] || 'Not started',
        notes: cols[9] || '',
      });
    }
  } else if (mode === 'PLAN_DATA') {
    if (/^W\d+,/.test(line)) {
      const cols = parseCSVLine(line);
      weeklyPlan.push({
        week: cols[0],
        dates: cols[1],
        focus: cols[2],
        atlasAreas: cols[3],
        outputToBuild: cols[4],
        successCheck: cols[5],
        priority: cols[6],
        notes: cols[7] || '',
      });
    }
  } else if (mode === 'CAREER_DATA') {
    const cols = parseCSVLine(line);
    if (cols.length >= 5 && cols[0] && !cols[0].startsWith('HOW TO USE')) {
      careerLab.push({
        direction: cols[0],
        miniExperiment: cols[1],
        usefulTopics: cols[2],
        workFeelsLike: cols[3],
        signsFit: cols[4],
        curiosity: Number(cols[5]) || 0,
        enjoyDebugging: Number(cols[6]) || 0,
        wantToRepeat: Number(cols[7]) || 0,
        exploreSixMonths: cols[8] || '',
        notes: cols[9] || '',
      });
    }
  }
}

const output = `// Auto-generated from user's Tech Atlas dataset
import type { Topic, InstallItem, WeekPlanItem, CareerDirectionItem, Settings } from './types';

export const INITIAL_ATLAS_TOPICS: Topic[] = ${JSON.stringify(topics, null, 2)};

export const INITIAL_INSTALL_QUEUE: InstallItem[] = ${JSON.stringify(installQueue, null, 2)};

export const INITIAL_WEEKLY_PLAN: WeekPlanItem[] = ${JSON.stringify(weeklyPlan, null, 2)};

export const INITIAL_CAREER_LAB: CareerDirectionItem[] = ${JSON.stringify(careerLab, null, 2)};

export const INITIAL_SETTINGS: Settings = {
  targetDate: '2026-12-31',
  weeklyHourGoal: 5,
  weeklySessionGoal: 4,
  revisionIntervalDays: 4,
  stageStartDate: '2026-10-12',
  stageDeadline: '2026-12-31',
};
`;

fs.writeFileSync('src/techAtlasData.ts', output, 'utf-8');
console.log(`Parsed successfully! Topics: ${topics.length}, Install items: ${installQueue.length}, Weeks: ${weeklyPlan.length}, Career directions: ${careerLab.length}`);

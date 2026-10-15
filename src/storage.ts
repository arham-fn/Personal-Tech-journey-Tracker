import type { Topic, Session, Settings, InstallItem, WeekPlanItem, CareerDirectionItem } from './types';
import {
  INITIAL_ATLAS_TOPICS,
  INITIAL_INSTALL_QUEUE,
  INITIAL_WEEKLY_PLAN,
  INITIAL_CAREER_LAB,
  INITIAL_SETTINGS
} from './techAtlasData';

function getJSON<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`Failed to parse localStorage key ${key}`);
    return null;
  }
}

function setJSON<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Topic / Tech Atlas Storage (142 items) */
export const TopicStorage = {
  key: 'techAtlas_topics_v2',
  getAll(): Topic[] {
    const data = getJSON<Topic[]>(this.key);
    if (!data || data.length === 0) {
      this.initDefault();
      return INITIAL_ATLAS_TOPICS;
    }
    return data;
  },
  initDefault(): void {
    setJSON(this.key, INITIAL_ATLAS_TOPICS);
  },
  get(id: string): Topic | undefined {
    return this.getAll().find(t => t.id === id);
  },
  add(topic: Topic): void {
    const topics = this.getAll();
    topics.unshift(topic);
    setJSON(this.key, topics);
  },
  update(updated: Topic): void {
    const topics = this.getAll().map(t => (t.id === updated.id ? updated : t));
    setJSON(this.key, topics);
  },
  delete(id: string): void {
    const topics = this.getAll().filter(t => t.id !== id);
    setJSON(this.key, topics);
  },
};

/** Session storage */
export const SessionStorage = {
  key: 'techAtlas_sessions_v2',
  getAll(): Session[] {
    const data = getJSON<Session[]>(this.key);
    if (!data) {
      setJSON(this.key, []);
      return [];
    }
    return data;
  },
  add(session: Session): void {
    const sessions = this.getAll();
    sessions.unshift(session);
    setJSON(this.key, sessions);
  },
  delete(id: string): void {
    const sessions = this.getAll().filter(s => s.id !== id);
    setJSON(this.key, sessions);
  },
};

/** Settings storage */
export const SettingsStorage = {
  key: 'techAtlas_settings_v2',
  get(): Settings {
    const data = getJSON<Settings>(this.key);
    if (!data) {
      setJSON(this.key, INITIAL_SETTINGS);
      return INITIAL_SETTINGS;
    }
    return data;
  },
  set(settings: Settings): void {
    setJSON(this.key, settings);
  },
};

/** Install & Hands-on Queue Storage */
export const InstallStorage = {
  key: 'techAtlas_install_queue',
  getAll(): InstallItem[] {
    const data = getJSON<InstallItem[]>(this.key);
    if (!data || data.length === 0) {
      setJSON(this.key, INITIAL_INSTALL_QUEUE);
      return INITIAL_INSTALL_QUEUE;
    }
    return data;
  },
  updateStatus(order: number, newStatus: string): void {
    const items = this.getAll().map(it => (it.order === order ? { ...it, setupStatus: newStatus } : it));
    setJSON(this.key, items);
  },
};

/** 12-Week Exploration Plan Storage */
export const PlanStorage = {
  key: 'techAtlas_weekly_plan',
  getAll(): WeekPlanItem[] {
    const data = getJSON<WeekPlanItem[]>(this.key);
    if (!data || data.length === 0) {
      setJSON(this.key, INITIAL_WEEKLY_PLAN);
      return INITIAL_WEEKLY_PLAN;
    }
    return data;
  },
  updateNotes(week: string, notes: string): void {
    const items = this.getAll().map(w => (w.week === week ? { ...w, notes } : w));
    setJSON(this.key, items);
  },
};

/** Career Lab Storage */
export const CareerStorage = {
  key: 'techAtlas_career_lab',
  getAll(): CareerDirectionItem[] {
    const data = getJSON<CareerDirectionItem[]>(this.key);
    if (!data || data.length === 0) {
      setJSON(this.key, INITIAL_CAREER_LAB);
      return INITIAL_CAREER_LAB;
    }
    return data;
  },
  updateItem(direction: string, patch: Partial<CareerDirectionItem>): void {
    const items = this.getAll().map(c => (c.direction === direction ? { ...c, ...patch } : c));
    setJSON(this.key, items);
  },
};

/** Reset everything back to the clean Tech Atlas defaults */
export function resetAllData(): void {
  TopicStorage.initDefault();
  setJSON(SessionStorage.key, []);
  SettingsStorage.set(INITIAL_SETTINGS);
  setJSON(InstallStorage.key, INITIAL_INSTALL_QUEUE);
  setJSON(PlanStorage.key, INITIAL_WEEKLY_PLAN);
  setJSON(CareerStorage.key, INITIAL_CAREER_LAB);
}

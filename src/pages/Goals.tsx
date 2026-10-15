import React, { useEffect, useState } from 'react';
import { SettingsStorage, SessionStorage } from '../storage';
import type { Settings, Session } from '../types';
import {
  IconGoals,
  IconClock,
  IconTrending,
  IconCheck,
  IconCalendar,
  IconSparkles
} from '../components/Icons';

function getWeekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 Sun, 1 Mon
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getCurrentWeekStats(sessions: Session[]) {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  let totalMinutes = 0;
  let totalSessions = 0;

  sessions.forEach(s => {
    const sessionDate = new Date(s.date);
    if (sessionDate >= weekStart && sessionDate < weekEnd) {
      totalMinutes += s.duration;
      totalSessions += 1;
    }
  });

  return { totalHours: +(totalMinutes / 60).toFixed(1), totalSessions };
}

const Goals: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(SettingsStorage.get());
  const [hourGoal, setHourGoal] = useState<number>(settings.weeklyHourGoal || 10);
  const [sessionGoal, setSessionGoal] = useState<number>(settings.weeklySessionGoal || 6);
  const [targetDate, setTargetDate] = useState<string>(settings.targetDate || '');
  const [stats, setStats] = useState({ totalHours: 0, totalSessions: 0 });
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    const s = SettingsStorage.get();
    setSettings(s);
    setHourGoal(s.weeklyHourGoal);
    setSessionGoal(s.weeklySessionGoal);
    setTargetDate(s.targetDate);

    const sessions = SessionStorage.getAll();
    setStats(getCurrentWeekStats(sessions));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Settings = {
      ...settings,
      weeklyHourGoal: hourGoal,
      weeklySessionGoal: sessionGoal,
      targetDate,
    };
    SettingsStorage.set(updated);
    setSettings(updated);

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const hourPercent = hourGoal > 0 ? Math.min(100, Math.round((stats.totalHours / hourGoal) * 100)) : 0;
  const sessionPercent = sessionGoal > 0 ? Math.min(100, Math.round((stats.totalSessions / sessionGoal) * 100)) : 0;

  // Calculate days remaining to target milestone
  const daysLeft = targetDate
    ? Math.max(0, Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="animate-fade">
      {/* Toast Alert */}
      {savedToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, var(--accent-emerald), #059669)',
            color: 'white',
            padding: '0.8rem 1.4rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            zIndex: 1000,
            animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            fontWeight: 600,
            fontSize: '0.88rem',
          }}
        >
          <IconCheck size={18} />
          Goals Successfully Saved!
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Weekly Objectives & Targets</h1>
          <p className="page-subtitle">Establish study commitments, pace yourself, and hit target deadlines.</p>
        </div>
        <div className="pill pill-blue">
          <IconCalendar size={14} />
          Current Sprint Active
        </div>
      </div>

      {/* Milestone Countdown Banner */}
      {daysLeft !== null && (
        <div
          className="card"
          style={{
            marginBottom: '1.75rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.08))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px var(--primary-glow)',
              }}
            >
              <IconSparkles size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Target Milestone Deadline
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Scheduled for {new Date(targetDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
              {daysLeft} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>days left</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Progress Visualizers & Goal Config */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem' }}>
        {/* Progress Tracker Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Weekly Hours Progress */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div className="card-title">
                  <IconClock size={18} color="var(--primary)" />
                  Weekly Immersion Hours
                </div>
                <div className="card-desc">Target: {hourGoal} focused hours per week</div>
              </div>
              <span className="pill pill-blue">{hourPercent}% Complete</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                {stats.totalHours}
              </span>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                / {hourGoal} hrs
              </span>
            </div>

            <div className="progress-track" style={{ height: '10px' }}>
              <div
                className="progress-indicator"
                style={{
                  width: `${hourPercent}%`,
                  background: 'linear-gradient(90deg, var(--primary), var(--accent-cyan))',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Remaining: {Math.max(0, +(hourGoal - stats.totalHours).toFixed(1))} hrs</span>
              <span>{hourPercent >= 100 ? '🎉 Target Achieved!' : 'On track for this sprint'}</span>
            </div>
          </div>

          {/* Weekly Sessions Progress */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div className="card-title">
                  <IconTrending size={18} color="var(--accent-emerald)" />
                  Weekly Practice Sessions
                </div>
                <div className="card-desc">Target: {sessionGoal} deep work blocks</div>
              </div>
              <span className="pill pill-green">{sessionPercent}% Complete</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                {stats.totalSessions}
              </span>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                / {sessionGoal} sessions
              </span>
            </div>

            <div className="progress-track" style={{ height: '10px' }}>
              <div
                className="progress-indicator"
                style={{
                  width: `${sessionPercent}%`,
                  background: 'linear-gradient(90deg, var(--accent-emerald), #059669)',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>Remaining: {Math.max(0, sessionGoal - stats.totalSessions)} sessions</span>
              <span>{sessionPercent >= 100 ? '🚀 High Output Week!' : 'Maintain consistency'}</span>
            </div>
          </div>
        </div>

        {/* Goal Settings Form */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '0.25rem' }}>
            <IconGoals size={18} color="var(--primary)" />
            Configure Sprint Targets
          </div>
          <div className="card-desc" style={{ marginBottom: '1.5rem' }}>
            Adjust your weekly bandwidth and career milestone
          </div>

          <form onSubmit={handleSave}>
            <div className="input-group">
              <label className="input-label">Weekly Hour Commitment (hrs)</label>
              <input
                type="number"
                min="1"
                max="80"
                className="input-field"
                value={hourGoal}
                onChange={e => setHourGoal(Number(e.target.value))}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Weekly Deep Work Sessions</label>
              <input
                type="number"
                min="1"
                max="40"
                className="input-field"
                value={sessionGoal}
                onChange={e => setSessionGoal(Number(e.target.value))}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Target Milestone Date</label>
              <input
                type="date"
                className="input-field"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              <IconCheck size={16} />
              Update Sprint Goals
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Goals;

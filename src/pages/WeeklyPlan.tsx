import React, { useState, useEffect } from 'react';
import type { WeekPlanItem } from '../types';
import { PlanStorage } from '../storage';
import {
  IconCalendarPlan
} from '../components/Icons';

const WeeklyPlan: React.FC = () => {
  const [plan, setPlan] = useState<WeekPlanItem[]>([]);
  const [notesDrafts, setNotesDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const data = PlanStorage.getAll();
    setPlan(data);
    const drafts: Record<string, string> = {};
    data.forEach(w => {
      drafts[w.week] = w.notes || '';
    });
    setNotesDrafts(drafts);
  }, []);

  const handleNotesChange = (week: string, val: string) => {
    setNotesDrafts(prev => ({ ...prev, [week]: val }));
    PlanStorage.updateNotes(week, val);
  };

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">12-Week Exploration Plan</h1>
          <p className="page-subtitle">
            A paced curriculum for Oct 12–Dec 31. Treat week topics as exploration targets, not a promise to master every framework.
          </p>
        </div>
        <div className="pill pill-blue">
          <IconCalendarPlan size={14} />
          Stage 1 • Oct 12–Dec 31
        </div>
      </div>

      {/* Week Timeline Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {plan.map((w, idx) => (
          <div
            key={w.week}
            className="card animate-slide-up"
            style={{
              animationDelay: `${idx * 0.04}s`,
              borderLeft: w.priority.includes('P1') ? '4px solid var(--primary)' : '4px solid var(--accent-cyan)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--accent-cyan))',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {w.week}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {w.focus}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    📅 {w.dates}
                  </div>
                </div>
              </div>

              <span className={`pill ${w.priority.includes('P1') ? 'pill-blue' : 'pill-gray'}`}>
                {w.priority}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg-muted)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Atlas Areas & Tools
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  {w.atlasAreas}
                </div>
              </div>

              <div style={{ background: 'var(--bg-muted)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Small Output to Build
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {w.outputToBuild}
                </div>
              </div>

              <div style={{ background: 'var(--bg-muted)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Success Check
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {w.successCheck}
                </div>
              </div>
            </div>

            {/* Notes / Proof Input */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontSize: '0.75rem' }}>
                Your Weekly Proof / Progress Notes
              </label>
              <input
                className="input-field"
                placeholder="Commit link, biggest obstacle overcome, or key learning..."
                value={notesDrafts[w.week] || ''}
                onChange={e => handleNotesChange(w.week, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyPlan;

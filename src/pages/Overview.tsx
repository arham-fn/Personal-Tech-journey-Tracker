import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopicStorage, SessionStorage, SettingsStorage } from '../storage';
import type { Topic, Session, Settings } from '../types';
import {
  IconRoadmap,
  IconTrending,
  IconCalendarPlan,
  IconInstall,
  IconClock,
  IconSparkles
} from '../components/Icons';

const DOMAIN_ORDER = [
  'Foundations & programming',
  'Web development',
  'Databases & data',
  'AI & data science',
  'Systems, cloud & DevOps',
  'Cybersecurity',
  'Testing & quality',
  'Mobile, desktop & games',
  'Embedded, robotics & IoT',
  'Developer productivity & emerging tech',
];

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [settings, setSettings] = useState<Settings>(SettingsStorage.get());

  useEffect(() => {
    setTopics(TopicStorage.getAll().filter(t => !t.archived));
    setSessions(SessionStorage.getAll());
    setSettings(SettingsStorage.get());
  }, []);

  const totalTopics = topics.length;

  // Tracked metrics matching the user's Control Panel
  const comfortableOrDone = topics.filter(
    t => t.status === 'Comfortable' || t.status === 'Done (can explain)'
  ).length;

  const alreadyKnowCount = topics.filter(t => t.alreadyKnow === 'Yes').length;

  const installedTriedCount = topics.filter(
    t => t.installedTried === 'Yes' || t.status === 'Tried it'
  ).length;

  const notStartedCount = topics.filter(t => t.status === 'Not started').length;
  const learningCount = topics.filter(t => t.status === 'Learning').length;
  const triedItCount = topics.filter(t => t.status === 'Tried it').length;
  const doneCanExplainCount = topics.filter(t => t.status === 'Done (can explain)').length;
  const comfortableCount = topics.filter(t => t.status === 'Comfortable').length;

  // Deadline calculation: Oct 12 - Dec 31, 2026
  const deadlineDate = new Date(settings.stageDeadline || '2026-12-31');
  const now = new Date('2026-10-15'); // local current date
  const diffTime = deadlineDate.getTime() - now.getTime();
  const daysToDeadline = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Group by Domain
  const domainStats = DOMAIN_ORDER.map(dom => {
    const inDomain = topics.filter(t => t.domain.toLowerCase() === dom.toLowerCase());
    const total = inDomain.length;
    const knowAlready = inDomain.filter(t => t.alreadyKnow === 'Yes').length;
    const doneComfortable = inDomain.filter(
      t => t.status === 'Comfortable' || t.status === 'Done (can explain)'
    ).length;
    const installedTried = inDomain.filter(
      t => t.installedTried === 'Yes' || t.status === 'Tried it'
    ).length;
    const pct = total > 0 ? Math.round((doneComfortable / total) * 100) : 0;
    return {
      domain: dom,
      total,
      knowAlready,
      doneComfortable,
      installedTried,
      pct,
    };
  });

  // Learning Mode breakdown
  const learningModes: Record<string, number> = {};
  topics.forEach(t => {
    const m = t.learningMode || 'Concept only';
    learningModes[m] = (learningModes[m] || 0) + 1;
  });

  return (
    <div className="animate-fade">
      {/* Banner */}
      <div
        className="card animate-slide-up"
        style={{
          marginBottom: '1.75rem',
          background: 'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.18), transparent 45%), linear-gradient(135deg, #10162A, #0C1120)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          boxShadow: '0 12px 30px -10px rgba(99, 102, 241, 0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="pill pill-blue" style={{ fontSize: '0.72rem', fontWeight: 800 }}>
                STAGE 1 ACTIVE
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Oct 12 – Dec 31, 2026 • {totalHours} hrs logged
              </span>
            </div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#FFF', letterSpacing: '-0.02em' }}>
              Tech Literacy & Exploration Control Panel
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Build breadth first across 142 landscape tools, practice selectively, then choose a 6-month direction.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/plan')}>
              <IconCalendarPlan size={16} />
              12-Week Plan
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/roadmap')}>
              <IconRoadmap size={16} />
              Open Tech Atlas
            </button>
          </div>
        </div>
      </div>

      {/* Top Level Metric Tiles matching Control Panel */}
      <div className="stats-grid">
        <div className="stat-tile" style={{ '--tile-accent': 'var(--primary)', '--icon-bg': 'rgba(99, 102, 241, 0.15)', '--icon-color': 'var(--primary)' } as any}>
          <div>
            <div className="stat-label">Tracked Items</div>
            <div className="stat-value">{totalTopics}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              10 architectural domains
            </div>
          </div>
          <div className="stat-icon-wrapper">
            <IconRoadmap size={22} />
          </div>
        </div>

        <div className="stat-tile" style={{ '--tile-accent': 'var(--accent-emerald)', '--icon-bg': 'rgba(16, 185, 129, 0.15)', '--icon-color': 'var(--accent-emerald)' } as any}>
          <div>
            <div className="stat-label">Done / Comfortable</div>
            <div className="stat-value" style={{ color: '#34D399' }}>{comfortableOrDone}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {alreadyKnowCount} already known
            </div>
          </div>
          <div className="stat-icon-wrapper">
            <IconTrending size={22} />
          </div>
        </div>

        <div className="stat-tile" style={{ '--tile-accent': 'var(--accent-cyan)', '--icon-bg': 'rgba(6, 182, 212, 0.15)', '--icon-color': 'var(--accent-cyan)' } as any}>
          <div>
            <div className="stat-label">Installed / Tried</div>
            <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{installedTriedCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Hands-on verifications
            </div>
          </div>
          <div className="stat-icon-wrapper">
            <IconInstall size={22} />
          </div>
        </div>

        <div className="stat-tile" style={{ '--tile-accent': 'var(--accent-amber)', '--icon-bg': 'rgba(245, 158, 11, 0.15)', '--icon-color': 'var(--accent-amber)' } as any}>
          <div>
            <div className="stat-label">Days to Deadline</div>
            <div className="stat-value" style={{ color: '#FBBF24' }}>{daysToDeadline}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Until Dec 31 finish line
            </div>
          </div>
          <div className="stat-icon-wrapper">
            <IconClock size={22} />
          </div>
        </div>
      </div>

      {/* Status Breakdown Pills & Learning Mode Mix */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Status Breakdown Card */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '0.25rem' }}>
            <IconSparkles size={18} color="var(--primary)" />
            Atlas Status Breakdown
          </div>
          <div className="card-desc" style={{ marginBottom: '1.25rem' }}>
            A topic counts as complete when marked "Done (can explain)" or "Comfortable"
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'var(--bg-muted)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Not started</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{notStartedCount}</div>
            </div>
            <div style={{ background: 'var(--bg-muted)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Learning</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#818CF8' }}>{learningCount}</div>
            </div>
            <div style={{ background: 'var(--bg-muted)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tried it</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#06B6D4' }}>{triedItCount}</div>
            </div>
            <div style={{ background: 'var(--bg-muted)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Done (explain)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FBBF24' }}>{doneCanExplainCount}</div>
            </div>
            <div style={{ background: 'var(--bg-muted)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Comfortable</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34D399' }}>{comfortableCount}</div>
            </div>
          </div>
        </div>

        {/* Learning Mode Mix */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '0.25rem' }}>
            Learning Mode Distribution
          </div>
          <div className="card-desc" style={{ marginBottom: '1rem' }}>
            Balance between mental models, browser experimentation, and installs
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {Object.entries(learningModes).slice(0, 5).map(([mode, count]) => {
              const pct = Math.round((count / totalTopics) * 100);
              return (
                <div key={mode}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{mode}</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{count} ({pct}%)</span>
                  </div>
                  <div className="progress-track" style={{ height: '6px' }}>
                    <div className="progress-indicator" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress by Domain Table (Exact table from Control Panel) */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div className="card-title">Progress by Architectural Domain</div>
            <div className="card-desc">Completion tracking across the 10 technology pillars</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/roadmap')}>
            View All in Tech Atlas →
          </button>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th style={{ textAlign: 'center' }}>Total</th>
                <th style={{ textAlign: 'center' }}>Know Already</th>
                <th style={{ textAlign: 'center' }}>Done / Comfortable</th>
                <th style={{ textAlign: 'center' }}>Installed / Tried</th>
                <th style={{ width: '220px' }}>% Complete</th>
              </tr>
            </thead>
            <tbody>
              {domainStats.map(d => (
                <tr key={d.domain}>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {d.domain}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    {d.total}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: d.knowAlready > 0 ? '#34D399' : 'var(--text-muted)' }}>
                    {d.knowAlready}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: d.doneComfortable > 0 ? '#34D399' : 'var(--text-muted)' }}>
                    {d.doneComfortable}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: d.installedTried > 0 ? '#06B6D4' : 'var(--text-muted)' }}>
                    {d.installedTried}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="progress-track" style={{ flex: 1, height: '8px' }}>
                        <div
                          className="progress-indicator"
                          style={{
                            width: `${d.pct}%`,
                            background: d.pct > 0 ? 'linear-gradient(90deg, var(--accent-emerald), #059669)' : 'var(--primary)',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', minWidth: '35px', textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {d.pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;

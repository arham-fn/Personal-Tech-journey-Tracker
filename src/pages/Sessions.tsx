import React, { useEffect, useState, useRef } from 'react';
import type { Session, Topic } from '../types';
import { SessionStorage, TopicStorage } from '../storage';
import {
  IconPlay,
  IconPause,
  IconCheck,
  IconTrash,
  IconSparkles
} from '../components/Icons';

const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Form State
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [activity, setActivity] = useState<Session['activity']>('Learn');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Stopwatch state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Success toast state
  const [showToast, setShowToast] = useState(false);

  const loadData = () => {
    setSessions(SessionStorage.getAll());
    const t = TopicStorage.getAll().filter(item => !item.archived);
    setTopics(t);
    if (t.length > 0 && !selectedTopicId) {
      setSelectedTopicId(t[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Stopwatch ticking effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const handleStartPause = () => {
    setIsRunning(prev => !prev);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsElapsed(0);
  };

  const addPresetMinutes = (mins: number) => {
    setSecondsElapsed(prev => prev + mins * 60);
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    const durationMinutes = Math.max(1, Math.round(secondsElapsed / 60));

    if (!selectedTopicId) {
      alert('Please choose a topic.');
      return;
    }

    const newSession: Session = {
      id: 'ses-' + Date.now(),
      date,
      topicId: selectedTopicId,
      duration: durationMinutes,
      activity,
      notes,
    };

    SessionStorage.add(newSession);

    // Update topic lastStudiedAt and status if not started
    const topic = topics.find(t => t.id === selectedTopicId);
    if (topic) {
      const updatedTopic: Topic = {
        ...topic,
        lastStudiedAt: new Date().toISOString(),
        status: topic.status === 'Not started' ? 'Learning' : topic.status,
      };
      TopicStorage.update(updatedTopic);
    }

    // Reset timer & form
    setIsRunning(false);
    setSecondsElapsed(0);
    setNotes('');
    loadData();

    // Trigger toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeleteSession = (id: string) => {
    if (window.confirm('Delete this logged session?')) {
      SessionStorage.delete(id);
      loadData();
    }
  };

  const totalTimeMins = sessions.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="animate-fade">
      {/* Toast Notification */}
      {showToast && (
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
            fontSize: '0.9rem',
          }}
        >
          <IconCheck size={18} />
          Focus Session Logged Successfully!
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Deep Work & Practice Sessions</h1>
          <p className="page-subtitle">Time-track active recall, build sessions, and deliberate coding exercises.</p>
        </div>
        <div className="pill pill-green">
          <span className="pill-dot" />
          {sessions.length} sessions logged ({Math.round(totalTimeMins / 60)} hrs)
        </div>
      </div>

      {/* Top Section: Live Stopwatch & Quick Logger */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Live Stopwatch Card */}
        <div className={`stopwatch-card ${isRunning ? 'active-timer' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <span className={`pill ${isRunning ? 'pill-rose' : 'pill-blue'}`}>
              <span className="pill-dot" />
              {isRunning ? 'FOCUS SESSION RUNNING' : 'STANDBY MODE'}
            </span>
          </div>

          <div className={`timer-digits ${isRunning ? 'active' : ''}`}>
            {formatTimer(secondsElapsed)}
          </div>

          {/* Quick preset minute pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[15, 30, 45, 60].map(mins => (
              <button
                key={mins}
                type="button"
                className="filter-btn"
                style={{ fontSize: '0.75rem' }}
                onClick={() => addPresetMinutes(mins)}
              >
                +{mins}m
              </button>
            ))}
          </div>

          {/* Timer Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              type="button"
              className={`btn ${isRunning ? 'btn-danger' : 'btn-success'}`}
              style={{ minWidth: '140px', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
              onClick={handleStartPause}
            >
              {isRunning ? (
                <>
                  <IconPause size={18} /> Pause Timer
                </>
              ) : (
                <>
                  <IconPlay size={18} /> Start Session
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetTimer}
              disabled={secondsElapsed === 0}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Log Session Form */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '1rem' }}>
            <IconSparkles size={18} color="var(--primary)" />
            Session Details & Notes
          </div>

          <form onSubmit={handleSaveSession}>
            <div className="input-group">
              <label className="input-label">Select Roadmap Topic</label>
              <select
                className="select-field"
                value={selectedTopicId}
                onChange={e => setSelectedTopicId(e.target.value)}
                required
              >
                {topics.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.domain} • {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group">
                <label className="input-label">Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Activity Type</label>
                <select
                  className="select-field"
                  value={activity}
                  onChange={e => setActivity(e.target.value as Session['activity'])}
                >
                  <option value="Learn">Learn (Reading/Theory)</option>
                  <option value="Practice">Practice (Exercises)</option>
                  <option value="Build">Build (Project Work)</option>
                  <option value="Revise">Revise (Spaced Review)</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Session Learnings & Artifacts</label>
              <textarea
                className="textarea-field"
                rows={3}
                placeholder="What did you implement or figure out today? Any obstacles?"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <IconCheck size={16} />
              Save Completed Session
            </button>
          </form>
        </div>
      </div>

      {/* History Log Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="card-title">Historical Log</div>
          <div className="card-desc">Comprehensive record of all technical learning immersions</div>
        </div>

        <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Topic & Domain</th>
                <th>Duration</th>
                <th>Activity</th>
                <th>Reflection Notes</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => {
                const topic = topics.find(t => t.id === s.topicId);
                const activityPill =
                  s.activity === 'Learn' ? 'pill-blue' :
                  s.activity === 'Practice' ? 'pill-green' :
                  s.activity === 'Build' ? 'pill-purple' : 'pill-amber';

                return (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {s.date}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {topic?.name ?? 'General Practice'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {topic?.domain}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      {s.duration} mins
                    </td>
                    <td>
                      <span className={`pill ${activityPill}`}>
                        <span className="pill-dot" />
                        {s.activity}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: '350px' }}>
                      {s.notes || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        title="Delete record"
                        onClick={() => handleDeleteSession(s.id)}
                      >
                        <IconTrash size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No sessions recorded yet. Start the stopwatch above or add a completed session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sessions;

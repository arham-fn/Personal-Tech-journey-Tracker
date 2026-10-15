import React, { useEffect, useState } from 'react';
import type { Topic } from '../types';
import { TopicStorage, SettingsStorage } from '../storage';
import {
  IconCheck,
  IconClock
} from '../components/Icons';

const Revision: React.FC = () => {
  const [dueTopics, setDueTopics] = useState<Topic[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    const all = TopicStorage.getAll().filter(t => !t.archived);
    setAllTopics(all);

    // Topics that are due (either nextRevisionAt is in the past, or never set but studied)
    const due = all.filter(t => {
      if (!t.nextRevisionAt) return false;
      return new Date(t.nextRevisionAt) <= new Date();
    });
    setDueTopics(due);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRateConfidence = (topic: Topic, rating: number) => {
    const settings = SettingsStorage.get();
    const baseInterval = settings.revisionIntervalDays || 4;

    // Spaced repetition multiplier based on rating (1 to 5)
    // 1 -> 1 day, 2 -> base * 0.7, 3 -> base, 4 -> base * 2, 5 -> base * 3.5
    const multipliers = [0, 1, Math.round(baseInterval * 0.75), baseInterval, baseInterval * 2, baseInterval * 3.5];
    const daysToAdd = Math.max(1, Math.round(multipliers[rating] || 3));

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);

    const updated: Topic = {
      ...topic,
      confidence: rating,
      status: rating >= 4 ? 'Confident' : 'Practiced',
      nextRevisionAt: nextDate.toISOString(),
      lastStudiedAt: new Date().toISOString(),
    };

    TopicStorage.update(updated);

    // Show toast
    setToastMessage(`Scheduled "${topic.name}" for review in ${daysToAdd} day(s)!`);
    setTimeout(() => setToastMessage(null), 3500);

    loadData();
  };

  return (
    <div className="animate-fade">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, var(--primary), #4F46E5)',
            color: 'white',
            padding: '0.8rem 1.4rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 25px -5px var(--primary-glow)',
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
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Spaced Repetition Queue</h1>
          <p className="page-subtitle">Test cognitive recall before the forgetting curve takes effect.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className={`pill ${dueTopics.length > 0 ? 'pill-rose' : 'pill-green'}`}>
            <span className="pill-dot" />
            {dueTopics.length} Topics Due Today
          </span>
        </div>
      </div>

      {/* When Due Topics Exist */}
      {dueTopics.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {dueTopics.map(t => {
            const isRevealed = !!revealedIds[t.id];

            return (
              <div
                key={t.id}
                className="card animate-slide-up"
                style={{
                  borderLeft: '4px solid var(--accent-rose)',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span className="pill pill-blue" style={{ fontSize: '0.7rem', marginRight: '0.5rem' }}>
                      {t.domain}
                    </span>
                    <span className="pill pill-gray" style={{ fontSize: '0.7rem' }}>
                      Current Confidence: {'★'.repeat(t.confidence)}
                    </span>
                  </div>

                  <span className="pill pill-rose" style={{ fontSize: '0.72rem' }}>
                    <IconClock size={12} />
                    Due for Spaced Recall
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {t.name}
                </h3>

                {t.definition && (
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
                    {t.definition}
                  </p>
                )}

                {/* Hidden Recall Details */}
                {isRevealed && (
                  <div
                    className="animate-scale-in"
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    {t.concept && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                          Core Mechanism
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                          {t.concept}
                        </div>
                      </div>
                    )}

                    {t.exercise && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
                          Challenge Exercise
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                          {t.exercise}
                        </div>
                      </div>
                    )}

                    {t.notes && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Your Study Notes
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {t.notes}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => toggleReveal(t.id)}
                  >
                    {isRevealed ? 'Hide Recall Details' : '🔍 Reveal Concept & Exercise'}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Recall Confidence:
                    </span>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRateConfidence(t, 1)}
                      title="1 - Struggled (Review tomorrow)"
                    >
                      1 • Struggled
                    </button>
                    <button
                      type="button"
                      className="filter-btn"
                      onClick={() => handleRateConfidence(t, 2)}
                      title="2 - Hard"
                    >
                      2 • Hard
                    </button>
                    <button
                      type="button"
                      className="filter-btn"
                      onClick={() => handleRateConfidence(t, 3)}
                      title="3 - Moderate"
                    >
                      3 • Good
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRateConfidence(t, 4)}
                      title="4 - Solid"
                    >
                      4 • Solid
                    </button>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={() => handleRateConfidence(t, 5)}
                      title="5 - Mastered"
                    >
                      5 • Mastered
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Queue Celebration State */
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3.5rem 2rem',
            background: 'radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.12), transparent 70%), var(--bg-card)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            <IconCheck size={32} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            All Caught Up on Revisions!
          </h2>
          <p style={{ maxWidth: '460px', margin: '0 auto 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            You have successfully reviewed all scheduled topics for today. Spaced repetition ensures high cognitive retention with minimal fatigue.
          </p>

          <div style={{ display: 'inline-flex', gap: '1rem', padding: '0.75rem 1.25rem', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Active Topics</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{allTopics.length}</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border-subtle)' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Next Topic Due</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>In 2 days</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Revision;

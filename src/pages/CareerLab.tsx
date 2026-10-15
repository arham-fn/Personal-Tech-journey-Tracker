import React, { useState, useEffect } from 'react';
import type { CareerDirectionItem } from '../types';
import { CareerStorage } from '../storage';
import {
  IconCareer,
  IconCheck
} from '../components/Icons';

const CareerLab: React.FC = () => {
  const [directions, setDirections] = useState<CareerDirectionItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    setDirections(CareerStorage.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRatingChange = (dirName: string, field: 'curiosity' | 'enjoyDebugging' | 'wantToRepeat', val: number) => {
    CareerStorage.updateItem(dirName, { [field]: val });
    loadData();
  };

  const handleDecisionChange = (dirName: string, val: string) => {
    CareerStorage.updateItem(dirName, { exploreSixMonths: val });
    loadData();
    setToastMessage(`Decision saved for ${dirName}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleNotesChange = (dirName: string, val: string) => {
    CareerStorage.updateItem(dirName, { notes: val });
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
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Career Lab | January Decision Support</h1>
          <p className="page-subtitle">
            Use mini-experiments to test real engineering work. Do not choose a field only because a creator claims it is hyped or lucrative.
          </p>
        </div>
        <div className="pill pill-purple">
          <IconCareer size={14} />
          9 Career Directions Evaluated
        </div>
      </div>

      {/* Directions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {directions.map(dir => (
          <div
            key={dir.direction}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderTop: dir.exploreSixMonths === 'Yes' ? '4px solid var(--accent-emerald)' : '4px solid var(--primary)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {dir.direction}
                </h3>
                {dir.exploreSixMonths && (
                  <span className={`pill ${dir.exploreSixMonths === 'Yes' ? 'pill-green' : dir.exploreSixMonths === 'Maybe' ? 'pill-amber' : 'pill-rose'}`}>
                    {dir.exploreSixMonths}
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.75rem' }}>
                Tools: {dir.usefulTopics}
              </div>

              {/* Mini Experiment Box */}
              <div style={{ background: 'var(--bg-muted)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  🧪 Mini-Experiment
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  {dir.miniExperiment}
                </div>
              </div>

              {/* Work Feeling & Signs */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Daily feel:</strong> {dir.workFeelsLike}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Signs it fits:</strong> {dir.signsFit}
              </div>
            </div>

            {/* Interactive Rating Matrix */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Curiosity</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(dir.direction, 'curiosity', star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: star <= (dir.curiosity || 0) ? '#FBBF24' : 'rgba(255,255,255,0.15)',
                          fontSize: '1rem',
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Debugging</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(dir.direction, 'enjoyDebugging', star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: star <= (dir.enjoyDebugging || 0) ? '#34D399' : 'rgba(255,255,255,0.15)',
                          fontSize: '1rem',
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Repeat?</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(dir.direction, 'wantToRepeat', star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: star <= (dir.wantToRepeat || 0) ? '#818CF8' : 'rgba(255,255,255,0.15)',
                          fontSize: '1rem',
                        }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6-Month Commitment Choice & Notes */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <select
                  className="select-field"
                  style={{ flex: 1, padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                  value={dir.exploreSixMonths || ''}
                  onChange={e => handleDecisionChange(dir.direction, e.target.value)}
                >
                  <option value="">Commitment?</option>
                  <option value="Yes">Explore for 6 months (Yes)</option>
                  <option value="Maybe">Maybe / Secondary</option>
                  <option value="No">No / Ruled out</option>
                </select>
              </div>

              <input
                className="input-field"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                placeholder="Notes or next step..."
                value={dir.notes || ''}
                onChange={e => handleNotesChange(dir.direction, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerLab;

import React, { useState, useEffect } from 'react';
import type { InstallItem } from '../types';
import { InstallStorage } from '../storage';
import {
  IconExternalLink,
  IconSearch
} from '../components/Icons';

const InstallQueue: React.FC = () => {
  const [items, setItems] = useState<InstallItem[]>([]);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const loadData = () => {
    setItems(InstallStorage.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = (order: number, newStatus: string) => {
    InstallStorage.updateStatus(order, newStatus);
    loadData();
  };

  const filteredItems = items.filter(it => {
    const matchesSearch =
      it.toolSetup.toLowerCase().includes(search.toLowerCase()) ||
      it.whyNeeded.toLowerCase().includes(search.toLowerCase()) ||
      it.whereItRuns.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || it.installPriority.includes(priorityFilter);
    return matchesSearch && matchesPriority;
  });

  const verifiedCount = items.filter(it => it.setupStatus === 'Verified working' || it.setupStatus === 'Installed').length;

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Install & Hands-On Queue</h1>
          <p className="page-subtitle">
            Do not download everything on day one. Start with essentials, then install tools only when your sprint plan reaches them.
          </p>
        </div>
        <span className="pill pill-green">
          <span className="pill-dot" />
          {verifiedCount} of {items.length} Set Up & Verified
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <IconSearch size={16} />
          </div>
          <input
            className="input-field"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search tools, platforms, requirements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          {['All', 'Must install', 'No download', 'Weeks', 'Optional'].map(pf => (
            <button
              key={pf}
              className={`filter-btn ${priorityFilter === pf ? 'active' : ''}`}
              onClick={() => setPriorityFilter(pf)}
            >
              {pf === 'All' ? 'All Priorities' : pf}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tools */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {filteredItems.map(it => {
          const isVerified = it.setupStatus === 'Verified working' || it.setupStatus === 'Installed';
          const isMustNow = it.installPriority.includes('Must install') || it.installPriority.includes('Install now');

          return (
            <div
              key={it.order}
              className="card"
              style={{
                borderLeft: isVerified ? '4px solid var(--accent-emerald)' : isMustNow ? '4px solid var(--accent-amber)' : '4px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {it.order}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {it.toolSetup}
                    </h3>
                  </div>

                  <span className={`pill ${isMustNow ? 'pill-amber' : 'pill-blue'}`} style={{ fontSize: '0.68rem' }}>
                    {it.installPriority}
                  </span>
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                  {it.whyNeeded}
                </p>

                <div style={{ background: 'var(--bg-muted)', padding: '0.65rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)', marginBottom: '0.2rem' }}>
                    Verification & Proof
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {it.verification}
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Runs on:</strong> {it.whereItRuns}
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <select
                  className="select-field"
                  style={{ width: 'auto', padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                  value={it.setupStatus}
                  onChange={e => handleStatusChange(it.order, e.target.value)}
                >
                  <option value="Not started">Not started</option>
                  <option value="Verified working">Verified working</option>
                  <option value="Installed">Installed</option>
                  <option value="Later / optional">Later / optional</option>
                </select>

                {it.officialUrl && (
                  <a
                    href={it.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.35rem' }}
                  >
                    Open Guide
                    <IconExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstallQueue;

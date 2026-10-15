import React, { useState, useEffect } from 'react';
import type { Topic } from '../types';
import { TopicStorage } from '../storage';
import {
  IconSearch
} from '../components/Icons';

const DOMAINS = [
  'All',
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

const WEEKS = ['All', 'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
const PRIORITIES = ['All', 'P1', 'P2', 'P3'];
const STATUSES = ['All', 'Not started', 'Learning', 'Tried it', 'Done (can explain)', 'Comfortable', 'Skip / N/A'];

const Roadmap: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [weekFilter, setWeekFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const loadData = () => {
    setTopics(TopicStorage.getAll().filter(t => !t.archived));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateTopicField = (id: string, field: keyof Topic, value: any) => {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;

    const updated = { ...topic, [field]: value };
    // If setting to Comfortable, automatically set alreadyKnow if not set
    if (field === 'status' && value === 'Comfortable' && topic.alreadyKnow !== 'Yes') {
      updated.alreadyKnow = 'Yes';
    }
    TopicStorage.update(updated);
    loadData();
  };

  const filteredTopics = topics.filter(t => {
    const s = search.toLowerCase();
    const matchesSearch =
      t.id.toLowerCase().includes(s) ||
      t.name.toLowerCase().includes(s) ||
      (t.subdomain && t.subdomain.toLowerCase().includes(s)) ||
      (t.definition && t.definition.toLowerCase().includes(s)) ||
      (t.problem && t.problem.toLowerCase().includes(s)) ||
      (t.exercise && t.exercise.toLowerCase().includes(s));

    const matchesDomain = domainFilter === 'All' || t.domain.toLowerCase() === domainFilter.toLowerCase();
    const matchesWeek = weekFilter === 'All' || t.planWeek === weekFilter;
    const matchesPriority = priorityFilter === 'All' || t.priorityLabel === priorityFilter;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;

    return matchesSearch && matchesDomain && matchesWeek && matchesPriority && matchesStatus;
  });

  return (
    <div className="animate-fade">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tech Atlas | 2026 Exploration Tracker</h1>
          <p className="page-subtitle">
            Curated landscape map of 142 tools & concepts. Filter by domain, priority, or sprint week.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <span className="pill pill-blue">
            Showing {filteredTopics.length} of {topics.length} items
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <IconSearch size={16} />
            </div>
            <input
              className="input-field"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search ID (T001), tool, problem it solves, practice task..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              className="select-field"
              style={{ width: 'auto', minWidth: '130px' }}
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p === 'All' ? 'All Priorities' : `Priority ${p}`}</option>
              ))}
            </select>

            <select
              className="select-field"
              style={{ width: 'auto', minWidth: '130px' }}
              value={weekFilter}
              onChange={e => setWeekFilter(e.target.value)}
            >
              {WEEKS.map(w => (
                <option key={w} value={w}>{w === 'All' ? 'All Weeks' : `Week ${w}`}</option>
              ))}
            </select>

            <select
              className="select-field"
              style={{ width: 'auto', minWidth: '150px' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              {STATUSES.map(st => (
                <option key={st} value={st}>{st === 'All' ? 'All Statuses' : st}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="filter-pills" style={{ overflowX: 'auto', paddingBottom: '2px' }}>
          {DOMAINS.map(d => (
            <button
              key={d}
              className={`filter-btn ${domainFilter === d ? 'active' : ''}`}
              onClick={() => setDomainFilter(d)}
              style={{ fontSize: '0.74rem' }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
        {filteredTopics.map(t => {
          const isDone = t.status === 'Comfortable' || t.status === 'Done (can explain)';
          const isLearning = t.status === 'Learning';

          const statusBadgeClass =
            t.status === 'Comfortable' ? 'pill-green' :
            t.status === 'Done (can explain)' ? 'pill-green' :
            t.status === 'Learning' ? 'pill-blue' :
            t.status === 'Tried it' ? 'pill-cyan' :
            t.status === 'Skip / N/A' ? 'pill-rose' : 'pill-gray';

          return (
            <div
              key={t.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: isDone ? '4px solid var(--accent-emerald)' : isLearning ? '4px solid var(--primary)' : '4px solid var(--border-subtle)',
              }}
            >
              <div>
                {/* Header row: ID, Domain & Priority */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        padding: '0.15rem 0.45rem',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {t.id}
                    </span>
                    <span className="pill pill-blue" style={{ fontSize: '0.68rem' }}>
                      {t.planWeek || 'W1'}
                    </span>
                    {t.priorityLabel && (
                      <span className={`pill ${t.priorityLabel === 'P1' ? 'pill-amber' : 'pill-gray'}`} style={{ fontSize: '0.68rem' }}>
                        {t.priorityLabel}
                      </span>
                    )}
                  </div>

                  <span className={`pill ${statusBadgeClass}`} style={{ fontSize: '0.68rem' }}>
                    <span className="pill-dot" />
                    {t.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.2rem' }}>
                  {t.domain} {t.subdomain ? `• ${t.subdomain}` : ''}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                  {t.name}
                </h3>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                  {t.definition}
                </p>

                {/* Problem it solves */}
                {t.problem && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Solves:</strong> {t.problem}
                  </div>
                )}

                {/* Practice Task Box */}
                {t.exercise && (
                  <div style={{ background: 'var(--bg-muted)', padding: '0.65rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-emerald)', marginBottom: '0.2rem' }}>
                      Proof / Practice Task
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {t.exercise}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Interactive Status Controls & Link */}
              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <div>
                    <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                      Progress Status
                    </label>
                    <select
                      className="select-field"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.76rem' }}
                      value={t.status}
                      onChange={e => handleUpdateTopicField(t.id, 'status', e.target.value)}
                    >
                      <option value="Not started">Not started</option>
                      <option value="Learning">Learning</option>
                      <option value="Tried it">Tried it</option>
                      <option value="Done (can explain)">Done (can explain)</option>
                      <option value="Comfortable">Comfortable</option>
                      <option value="Skip / N/A">Skip / N/A</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                      Already Know?
                    </label>
                    <select
                      className="select-field"
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.76rem' }}
                      value={t.alreadyKnow || 'Unsure'}
                      onChange={e => handleUpdateTopicField(t.id, 'alreadyKnow', e.target.value)}
                    >
                      <option value="Unsure">Unsure</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedTopic(t)}
                    style={{ fontSize: '0.74rem' }}
                  >
                    Details & Notes
                  </button>

                  {t.officialUrl && (
                    <a
                      href={t.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ gap: '0.3rem', fontSize: '0.74rem' }}
                    >
                      Open Guide ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredTopics.length === 0 && (
          <div
            className="card"
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-muted)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>No topics match criteria</div>
            <p style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>Try clearing or widening your filters above.</p>
          </div>
        )}
      </div>

      {/* Full Details Modal */}
      {selectedTopic && (
        <div className="modal-backdrop" onClick={() => setSelectedTopic(null)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span className="pill pill-blue">{selectedTopic.id}</span>
                  <span className="pill pill-amber">{selectedTopic.planWeek}</span>
                  <span className="pill pill-gray">{selectedTopic.priorityLabel}</span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {selectedTopic.name}
                </h2>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedTopic(null)}
                style={{ borderRadius: '50%', padding: '0.2rem 0.5rem' }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  What It Is
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
                  {selectedTopic.definition}
                </div>
              </div>

              {selectedTopic.problem && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                    Problem It Solves
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {selectedTopic.problem}
                  </div>
                </div>
              )}

              {selectedTopic.usage && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Where & How Used
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {selectedTopic.usage}
                  </div>
                </div>
              )}

              {selectedTopic.learningTarget && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
                    Learning Target
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {selectedTopic.learningTarget}
                  </div>
                </div>
              )}

              {selectedTopic.exercise && (
                <div style={{ background: 'var(--bg-muted)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Proof / Practice Task
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>
                    {selectedTopic.exercise}
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Installed / Tried?</label>
                  <select
                    className="select-field"
                    value={selectedTopic.installedTried || 'No'}
                    onChange={e => handleUpdateTopicField(selectedTopic.id, 'installedTried', e.target.value)}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                    <option value="Not applicable">Not applicable</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Need Install?</label>
                  <input
                    className="input-field"
                    readOnly
                    value={selectedTopic.needInstall || 'No'}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Personal Evidence & Study Notes</label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  placeholder="Record summary, repo URL, or proof you completed this topic..."
                  value={selectedTopic.notes || ''}
                  onChange={e => handleUpdateTopicField(selectedTopic.id, 'notes', e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              {selectedTopic.officialUrl && (
                <a
                  href={selectedTopic.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  Visit Official Resource ↗
                </a>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedTopic(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;

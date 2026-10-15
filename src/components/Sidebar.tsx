import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  IconOverview,
  IconRoadmap,
  IconCalendarPlan,
  IconInstall,
  IconSessions,
  IconRevision,
  IconCareer,
  IconGoals,
  IconSettings,
  IconFlame,
  IconSparkles
} from './Icons';
import { TopicStorage, InstallStorage } from '../storage';

const links = [
  { to: '/', label: 'Control Panel', icon: IconOverview },
  { to: '/roadmap', label: 'Tech Atlas (142)', icon: IconRoadmap },
  { to: '/plan', label: '12-Week Plan', icon: IconCalendarPlan },
  { to: '/install', label: 'Install Queue', icon: IconInstall, badgeKey: 'install' },
  { to: '/sessions', label: 'Focus & Log', icon: IconSessions },
  { to: '/revision', label: 'Revision Deck', icon: IconRevision, badgeKey: 'revision' },
  { to: '/career', label: 'Career Lab', icon: IconCareer },
  { to: '/goals', label: 'Goals & Targets', icon: IconGoals },
  { to: '/settings', label: 'Backup & Settings', icon: IconSettings },
];

const Sidebar: React.FC = () => {
  const dueCount = TopicStorage.getAll().filter(
    t => !t.archived && t.nextRevisionAt && new Date(t.nextRevisionAt) <= new Date()
  ).length;

  const mustInstallCount = InstallStorage.getAll().filter(
    it => (it.installPriority.includes('Must install') || it.installPriority.includes('Install now')) &&
          it.setupStatus === 'Not started'
  ).length;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <IconSparkles size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="brand-title">Tech Atlas</span>
            <span className="brand-badge">2026</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Breadth First • Selective Depth</div>
        </div>
      </div>

      <ul className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="icon-box">
                  <Icon size={18} />
                </span>
                <span style={{ flex: 1 }}>{link.label}</span>

                {link.badgeKey === 'install' && mustInstallCount > 0 && (
                  <span
                    style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#FBBF24',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    {mustInstallCount}
                  </span>
                )}

                {link.badgeKey === 'revision' && dueCount > 0 && (
                  <span
                    style={{
                      background: 'var(--accent-rose)',
                      color: 'white',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 0 8px rgba(244, 63, 94, 0.4)',
                    }}
                  >
                    {dueCount}
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <div className="streak-card">
          <div className="streak-icon">
            <IconFlame size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FCD34D' }}>Stage 1 Active</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Finish Line: Dec 31, 2026</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

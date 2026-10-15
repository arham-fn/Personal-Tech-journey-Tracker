import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { SettingsStorage, TopicStorage, SessionStorage, resetAllData } from '../storage';
import type { Settings } from '../types';
import {
  IconSettings,
  IconDownload,
  IconUpload,
  IconCheck,
  IconSparkles
} from '../components/Icons';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(SettingsStorage.get());
  const [revisionInterval, setRevisionInterval] = useState<number>(settings.revisionIntervalDays || 4);
  const [targetDate, setTargetDate] = useState<string>(settings.targetDate || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const s = SettingsStorage.get();
    setSettings(s);
    setRevisionInterval(s.revisionIntervalDays);
    setTargetDate(s.targetDate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Settings = {
      ...settings,
      revisionIntervalDays: revisionInterval,
      targetDate,
    };
    SettingsStorage.set(updated);
    setSettings(updated);
    showToast('Settings saved successfully!');
  };

  // Export all data to Excel Workbook (.xlsx)
  const handleExportExcel = () => {
    try {
      const topics = TopicStorage.getAll();
      const sessions = SessionStorage.getAll();
      const currentSettings = [SettingsStorage.get()];

      const wb = XLSX.utils.book_new();

      const wsTopics = XLSX.utils.json_to_sheet(topics);
      XLSX.utils.book_append_sheet(wb, wsTopics, 'Topics');

      const wsSessions = XLSX.utils.json_to_sheet(sessions);
      XLSX.utils.book_append_sheet(wb, wsSessions, 'Sessions');

      const wsSettings = XLSX.utils.json_to_sheet(currentSettings);
      XLSX.utils.book_append_sheet(wb, wsSettings, 'Settings');

      XLSX.writeFile(wb, `Tech_Ledger_Backup_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast('Exported Excel workbook (.xlsx) successfully!');
    } catch (err) {
      console.error(err);
      alert('Error generating Excel file');
    }
  };

  // Export JSON backup
  const handleExportJSON = () => {
    const fullBackup = {
      topics: TopicStorage.getAll(),
      sessions: SessionStorage.getAll(),
      settings: SettingsStorage.get(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tech-ledger-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported JSON backup successfully!');
  };

  // Import backup file (Excel .xlsx or JSON)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(data as string);
          if (parsed.topics && Array.isArray(parsed.topics)) {
            parsed.topics.forEach((t: any) => TopicStorage.add(t));
          }
          if (parsed.sessions && Array.isArray(parsed.sessions)) {
            parsed.sessions.forEach((s: any) => SessionStorage.add(s));
          }
          showToast(`Imported ${parsed.topics?.length || 0} topics & ${parsed.sessions?.length || 0} sessions from JSON!`);
        } else {
          // Excel / XLSX file
          const workbook = XLSX.read(data, { type: 'binary' });
          let importedTopicsCount = 0;
          let importedSessionsCount = 0;

          if (workbook.SheetNames.includes('Topics')) {
            const topicRows = XLSX.utils.sheet_to_json<any>(workbook.Sheets['Topics']);
            topicRows.forEach(t => {
              if (t.name) {
                TopicStorage.add({
                  id: t.id || 'top-' + Date.now() + Math.random().toString(36).substring(2, 5),
                  name: t.name,
                  domain: t.domain || 'General',
                  definition: t.definition || '',
                  problem: t.problem || '',
                  usage: t.usage || '',
                  concept: t.concept || '',
                  exercise: t.exercise || '',
                  difficulty: t.difficulty || 'Intermediate',
                  estimatedTime: Number(t.estimatedTime) || 60,
                  priority: Number(t.priority) || 3,
                  status: t.status || 'Learning',
                  confidence: Number(t.confidence) || 1,
                  notes: t.notes || '',
                  prerequisites: [],
                  resources: [],
                  createdAt: t.createdAt || new Date().toISOString(),
                  archived: false,
                });
                importedTopicsCount++;
              }
            });
          }

          if (workbook.SheetNames.includes('Sessions')) {
            const sessionRows = XLSX.utils.sheet_to_json<any>(workbook.Sheets['Sessions']);
            sessionRows.forEach(s => {
              if (s.topicId) {
                SessionStorage.add({
                  id: s.id || 'ses-' + Date.now() + Math.random().toString(36).substring(2, 5),
                  date: s.date || new Date().toISOString().split('T')[0],
                  topicId: s.topicId,
                  duration: Number(s.duration) || 30,
                  activity: s.activity || 'Practice',
                  notes: s.notes || '',
                });
                importedSessionsCount++;
              }
            });
          }

          showToast(`Imported ${importedTopicsCount} topics & ${importedSessionsCount} sessions from Excel!`);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to parse uploaded file. Please make sure it is a valid .xlsx or .json file.');
      }
    };

    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  // Reset to default sample state
  const handleResetDemoData = () => {
    if (window.confirm('Reset all topics and sessions back to sample tech curriculum? This will overwrite existing custom items.')) {
      resetAllData();
      const s = SettingsStorage.get();
      setSettings(s);
      setRevisionInterval(s.revisionIntervalDays);
      setTargetDate(s.targetDate);
      showToast('Reset to demo tech curriculum!');
    }
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
          <h1 className="page-title">Preferences & Data Management</h1>
          <p className="page-subtitle">Configure spaced repetition algorithms, export records, and manage backups.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Core Algorithm Settings */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '0.25rem' }}>
            <IconSettings size={18} color="var(--primary)" />
            Spaced Repetition & Milestone Parameters
          </div>
          <div className="card-desc" style={{ marginBottom: '1.5rem' }}>
            Fine-tune cognitive review intervals and milestones
          </div>

          <form onSubmit={handleSaveSettings}>
            <div className="input-group">
              <label className="input-label">Base Revision Interval (days)</label>
              <input
                type="number"
                min="1"
                max="30"
                className="input-field"
                value={revisionInterval}
                onChange={e => setRevisionInterval(Number(e.target.value))}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Default interval multiplier for newly mastered concepts.
              </span>
            </div>

            <div className="input-group">
              <label className="input-label">Career Target / Interview Milestone</label>
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
              style={{ marginTop: '0.5rem' }}
            >
              <IconCheck size={16} />
              Save Preferences
            </button>
          </form>
        </div>

        {/* Export & Import Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: '0.25rem' }}>
              <IconDownload size={18} color="var(--accent-cyan)" />
              Export & Import Backups
            </div>
            <div className="card-desc" style={{ marginBottom: '1.25rem' }}>
              Download or restore your study history and curriculum
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleExportExcel}
              >
                <IconDownload size={16} />
                Export Excel (.xlsx)
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleExportJSON}
              >
                <IconDownload size={16} />
                Export JSON
              </button>

              <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
                <IconUpload size={16} />
                Import (.xlsx / .json)
                <input
                  type="file"
                  accept=".xlsx, .xls, .json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {/* Reset Demo State */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '0.25rem' }}>
              <IconSparkles size={18} color="var(--accent-amber)" />
              Demo Tech Curriculum
            </div>
            <div className="card-desc" style={{ marginBottom: '1.25rem' }}>
              Populate ledger with high-signal System Design, React 19, and Database items
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetDemoData}
            >
              <IconSparkles size={16} />
              Reset to Sample Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

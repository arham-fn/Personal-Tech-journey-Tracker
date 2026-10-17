import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Roadmap from './pages/Roadmap';
import InstallQueue from './pages/InstallQueue';
import WeeklyPlan from './pages/WeeklyPlan';
import CareerLab from './pages/CareerLab';
import Sessions from './pages/Sessions';
import Revision from './pages/Revision';
import Goals from './pages/Goals';
import Settings from './pages/Settings';

const Layout: React.FC = () => (
  <>
    <Sidebar />
    <main className="main-content">
      <Outlet />
    </main>
  </>
);

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}> 
        <Route index element={<Overview />} />
        <Route path="overview" element={<Navigate to="/" replace />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="plan" element={<WeeklyPlan />} />
        <Route path="install" element={<InstallQueue />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="revision" element={<Revision />} />
        <Route path="career" element={<CareerLab />} />
        <Route path="goals" element={<Goals />} />
        <Route path="settings" element={<Settings />} />
        {/* Fallback wildcard for any unknown path */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;

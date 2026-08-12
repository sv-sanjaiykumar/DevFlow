import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ProfilePage } from './pages/ProfilePage';
import { Toaster } from 'sonner';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Telemetry Dashboard';
    if (location.pathname === '/projects') return 'Engineering Workspaces';
    if (location.pathname.startsWith('/projects/')) return 'Kanban Board';
    if (location.pathname === '/ai-assistant') return 'AI Task Generator';
    if (location.pathname === '/profile') return 'Developer Profile';
    return 'DevFlow Workspace';
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} title={getPageTitle()} />
        <main className="flex-1 bg-[#09090b]">{children}</main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster theme="dark" position="bottom-right" richColors />
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/"
              element={
                <MainLayout>
                  <DashboardPage />
                </MainLayout>
              }
            />
            <Route
              path="/projects"
              element={
                <MainLayout>
                  <ProjectsPage />
                </MainLayout>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <MainLayout>
                  <ProjectDetailPage />
                </MainLayout>
              }
            />
            <Route
              path="/ai-assistant"
              element={
                <MainLayout>
                  <AIAssistantPage />
                </MainLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <MainLayout>
                  <ProfilePage />
                </MainLayout>
              }
            />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

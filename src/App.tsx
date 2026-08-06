import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, type TabType } from './components/Sidebar';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { BatchManagement } from './components/BatchManagement';
import { UserManagement } from './components/UserManagement';
import { ActivityLogView } from './components/ActivityLogView';
import { ReportsView } from './components/ReportsView';
import { EmailLogView } from './components/EmailLogView';
import { ToastContainer } from './components/ToastContainer';
import { LoginPage } from './components/Auth/LoginPage';

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(
    () => (currentUser?.role === 'admin' ? 'admin-dashboard' : 'user-dashboard')
  );

  // When switching personas, auto-navigate to appropriate home tab
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'admin' && activeTab === 'user-dashboard') {
      setActiveTab('admin-dashboard');
    } else if (currentUser.role === 'user' && activeTab === 'admin-dashboard') {
      setActiveTab('user-dashboard');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Left Navigation Sidebar */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Main View Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'user-dashboard' && <UserDashboard />}
            
            {activeTab === 'admin-dashboard' && (
              <AdminDashboard
                onOpenNewBatchModal={() => setActiveTab('batches')}
                onOpenUpdatePriceModal={() => setActiveTab('batches')}
                onOpenAddUserModal={() => setActiveTab('users')}
              />
            )}

            {activeTab === 'batches' && <BatchManagement />}

            {activeTab === 'users' && <UserManagement />}

            {activeTab === 'activity' && <ActivityLogView />}

            {activeTab === 'reports' && <ReportsView />}

            {activeTab === 'emails' && <EmailLogView />}
          </div>

        </div>
      </main>

      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <MainApp />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

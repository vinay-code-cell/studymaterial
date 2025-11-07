import { useState } from 'react';
import { BookOpen, Shield } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

function App() {
  const [view, setView] = useState<'dashboard' | 'admin'>('dashboard');

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-800">StudyHub</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setView('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>
        </div>
      </nav>

      {view === 'dashboard' ? <Dashboard /> : <AdminPanel />}
    </div>
  );
}

export default App;

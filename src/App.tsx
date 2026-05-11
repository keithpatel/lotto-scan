import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { StoreProvider } from './contexts/StoreContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Ticket, Loader2 } from 'lucide-react';

const Inventory = lazy(() => import('./pages/Inventory').then(m => ({ default: m.Inventory })));
const Books = lazy(() => import('./pages/Books').then(m => ({ default: m.Books })));
const Audits = lazy(() => import('./pages/Audits').then(m => ({ default: m.Audits })));
const Days = lazy(() => import('./pages/Days').then(m => ({ default: m.Days })));
const Employees = lazy(() => import('./pages/Employees').then(m => ({ default: m.Employees })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full py-24" style={{ background: '#0a0a0f' }}>
      <div className="w-8 h-8 border-2 border-[#fbbf24] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="w-12 h-12 border-3 border-[#fbbf24] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#0a0a0f' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full" style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
        </div>
        
        <div className="relative z-10 max-w-md w-full mx-4">
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', boxShadow: '0 4px 20px rgba(251, 191, 36, 0.15)' }}>
              <Ticket className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-3" style={{ color: '#f5f5f7' }}>Lotto Scan</h1>
            <p className="text-lg" style={{ color: '#a1a1aa' }}>Premium scratcher inventory management</p>
          </div>

          <div className="animate-fade-in-up delay-200" style={{ background: '#1a1a24', borderRadius: '24px', padding: '40px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)' }}>
            <h2 className="text-2xl font-display font-bold text-center mb-3" style={{ color: '#f5f5f7' }}>Welcome Back</h2>
            <p className="text-center mb-8" style={{ color: '#71717a' }}>Sign in to manage your inventory</p>
            
            <button 
              onClick={signIn}
              className="w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
              style={{ 
                background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                color: '#000',
                boxShadow: '0 4px 20px rgba(251, 191, 36, 0.15)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Continue with Google
            </button>
          </div>

          <p className="text-center mt-8 text-sm animate-fade-in-up delay-300" style={{ color: '#71717a' }}>
            Secure authentication via Google
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <AuthGate>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/inventory" replace />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="books" element={<Books />} />
                <Route path="audits" element={<Audits />} />
                <Route path="days" element={<Days />} />
                <Route path="employees" element={<Employees />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthGate>
      </StoreProvider>
    </AuthProvider>
  );
}

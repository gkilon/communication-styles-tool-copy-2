
import React, { useState, useEffect, ReactNode, ErrorInfo, Component } from 'react';
import SimpleApp from './SimpleApp';
import { AdminDashboard } from './components/AdminDashboard';
import { auth, isFirebaseInitialized } from './firebaseConfig';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { getUserProfile } from './services/firebaseService';

type AppView = 'simple' | 'admin' | 'loading';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App Component Crash:", error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F3EF] p-6 text-center" dir="rtl">
          <div className="bg-white p-10 rounded-3xl border border-red-200 shadow-2xl max-w-lg">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-black text-brand-dark mb-4">משהו לא עובד כרגע</h1>
            <p className="text-brand-muted mb-8 font-light text-lg">חלה שגיאה לא צפויה בטעינת המערכת. אנחנו מצטערים על אי הנוחות.</p>

            <div className="bg-brand-beige p-5 rounded-xl text-right mb-8 overflow-hidden grayscale">
              <p className="text-xs font-bold text-brand-muted uppercase mb-2 tracking-widest border-b border-brand-muted/10 pb-2">פרטי שגיאה:</p>
              <pre className="text-[10px] text-red-500 overflow-auto max-h-32 font-mono" dir="ltr">
                {error?.message}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="bg-brand-accent hover:bg-brand-accent/90 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-lg active:scale-95"
            >
              ניסיון טעינה חוזר
            </button>
          </div>
        </div>
      );
    }
    return children;
  }
}

export const App: React.FC = () => {
  const [view, setView] = useState<AppView>('loading');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (view === 'loading') setView('simple');
    }, 3000);

    if (!isFirebaseInitialized) {
      setView('simple');
      clearTimeout(timer);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fast path: Check specific admin email immediately to avoid race conditions
        if (currentUser.email?.toLowerCase() === 'admin@manager.com') {
          setView('admin');
          clearTimeout(timer);
          return;
        }

        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile?.role === 'admin') {
            setView('admin');
          } else {
            setView('simple');
          }
        } catch (e) {
          console.error("Profile load error:", e);
          setView('simple');
        }
      } else {
        setView('simple');
      }
      clearTimeout(timer);
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleAdminLogin = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      alert("שגיאה בהתחברות: " + error.message);
    }
  };

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
    setUser(null);
    setView('simple');
  };

  return (
    <ErrorBoundary>
      {view === 'admin' ? (
        <AdminDashboard onBack={handleSignOut} />
      ) : view === 'simple' ? (
        <SimpleApp onAdminLoginAttempt={handleAdminLogin} user={user} />
      ) : (
        <div className="min-h-screen bg-[#F4F3EF] flex flex-col items-center justify-center" dir="rtl">
          <div className="flex flex-col items-center gap-8">
            <div className="relative">
              <div className="w-16 h-16 border-[3px] border-brand-accent/10 border-t-brand-accent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-brand-touch rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-brand-dark tracking-tight">GILAD KILON .</p>
              <p className="text-xs text-brand-muted uppercase tracking-[0.3em] font-bold mt-2 mr-[-0.3em]">נא להמתין...</p>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

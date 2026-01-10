
import React, { useState } from 'react';

interface PasswordScreenProps {
  onAuthenticate: (password: string) => boolean;
  onAdminLogin?: (email: string, pass: string) => Promise<void>;
  onTeamLoginClick?: () => void;
  onBack?: () => void;
  hasDatabaseConnection?: boolean;
}

export const PasswordScreen: React.FC<PasswordScreenProps> = ({
  onAuthenticate,
  onAdminLogin,
  onTeamLoginClick,
  onBack,
  hasDatabaseConnection = false
}) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isAdminMode) {
      if (!email || !password) {
        setError('אנא מלא אימייל וסיסמה');
        setLoading(false);
        return;
      }
      if (onAdminLogin) {
        try {
          await onAdminLogin(email, password);
        } catch (err: any) {
          console.error(err);
          setError('פרטי התחברות שגויים');
        }
      }
    } else {
      const success = onAuthenticate(password);
      if (!success) {
        setError('סיסמה שגויה.');
        setPassword('');
      }
    }
    setLoading(false);
  };

  const toggleMode = () => {
    const newMode = !isAdminMode;
    setIsAdminMode(newMode);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-md mx-auto animate-fade-in-up border border-brand-muted/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full -mr-12 -mt-12 pointer-events-none"></div>

      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-brand-muted hover:text-brand-dark transition-colors p-2 z-10"
          title="חזרה לבחירה"
        >
          <span className="text-xl">✕</span>
        </button>
      )}

      {hasDatabaseConnection && !isAdminMode && (
        <div className="mb-8 p-6 bg-brand-accent/5 rounded-2xl border border-brand-accent/10">
          <p className="text-brand-dark text-sm mb-4 font-bold">חלק מארגון או סדנה?</p>
          <button
            onClick={onTeamLoginClick}
            className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-extrabold py-4 px-4 rounded-xl text-lg transition-all shadow-lg active:scale-95"
          >
            כניסת חבר צוות / משתתף סדנה
          </button>
          <p className="text-brand-muted text-xs mt-3 italic font-light">שמירת תוצאות וניתוח צוותי</p>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <div className="h-px bg-brand-muted/10 flex-1"></div>
        <span className="text-brand-muted text-[10px] font-bold uppercase tracking-widest px-2">
          {hasDatabaseConnection && !isAdminMode ? 'או כניסה אישית' : (isAdminMode ? 'ניהול מערכת' : 'גישה מהירה')}
        </span>
        <div className="h-px bg-brand-muted/10 flex-1"></div>
      </div>

      <h2 className="text-2xl font-black text-brand-dark mb-2">
        {isAdminMode ? 'כניסת מנהל' : 'הזן סיסמת גישה'}
      </h2>
      <p className="text-brand-muted mb-8 text-sm font-light">
        {isAdminMode
          ? 'הזן פרטי מנהל (אימייל וסיסמה)'
          : 'הזן את סיסמת הגישה לשאלון אישי'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

        {isAdminMode && (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-brand-muted/20 rounded-xl py-3.5 px-5 text-brand-dark text-center placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
            placeholder="אימייל מנהל"
            dir="ltr"
            autoComplete="off"
          />
        )}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-white border border-brand-muted/20 rounded-xl py-3.5 px-5 text-brand-dark text-center placeholder-brand-muted/40 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
          placeholder="סיסמה"
          dir="ltr"
          autoComplete="new-password"
        />

        {error && <div className="text-red-600 text-xs font-bold bg-red-50 p-2 rounded-lg border border-red-100">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-touch hover:bg-brand-touch/90 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-4"
        >
          {loading ? 'מתחבר...' : 'כניסה'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-brand-muted/10">
        <button
          onClick={toggleMode}
          className="text-xs text-brand-muted hover:text-brand-accent transition-colors font-medium underline underline-offset-4"
        >
          {isAdminMode ? 'חזרה למסך כניסה רגיל' : 'כניסת מנהל (Admin Dashboard)'}
        </button>
      </div>
    </div>
  );
};

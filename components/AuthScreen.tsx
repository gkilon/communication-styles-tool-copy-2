
import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, isFirebaseInitialized } from '../firebaseConfig';
import { createUserProfile, getTeams, ensureGoogleUserProfile } from '../services/firebaseService';
import { Team } from '../types';
import { ArrowLeftIcon, GoogleIcon } from './icons/Icons';

interface AuthScreenProps {
  onLoginSuccess: () => void;
  onBack?: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [isTeamLocked, setIsTeamLocked] = useState(false);

  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!isFirebaseInitialized) return;
      try {
        let teamsData = await getTeams();
        const urlParams = new URLSearchParams(window.location.search);
        const teamParam = urlParams.get('team');

        if (teamParam) {
          const foundTeam = teamsData.find(t => t.name.toLowerCase() === teamParam.toLowerCase());
          if (foundTeam) {
            setTeams([foundTeam]);
            setSelectedTeam(foundTeam.name);
            setIsTeamLocked(true);
          } else {
            setTeams(teamsData);
          }
        } else {
          setTeams(teamsData);
        }
      } catch (e) {
        console.error("Failed to load teams", e);
      }
    };
    fetchTeams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isFirebaseInitialized) {
      setError("שגיאה: הגדרות Firebase חסרות. לא ניתן להתחבר.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const role: 'user' | 'admin' = (adminCode === 'inspire') ? 'admin' : 'user';

        if (!name) {
          setError("נא למלא שם מלא");
          setLoading(false);
          return;
        }

        if (role === 'user' && !selectedTeam) {
          setError("חובה לבחור צוות כדי להצטרף לסדנה");
          setLoading(false);
          return;
        }

        const teamToSave = role === 'admin' ? 'Management' : selectedTeam;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await createUserProfile(userCredential.user.uid, {
          email,
          displayName: name,
          team: teamToSave,
          role: role
        });
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      let msg = "אירעה שגיאה. נא לנסות שוב.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') msg = "פרטים שגויים.";
      if (err.code === 'auth/email-already-in-use') msg = "המייל הזה כבר קיים במערכת. נסו להתחבר במקום להירשם.";
      if (err.code === 'auth/weak-password') msg = "הסיסמה חייבת להכיל לפחות 6 תווים.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    if (!isFirebaseInitialized) {
      setError("החיבור נכשל: המערכת לא הוגדרה כראוי.");
      setLoading(false);
      return;
    }

    if (!isLogin && !selectedTeam) {
      setError("להרשמה דרך גוגל, חובה לבחור צוות תחילה.");
      setLoading(false);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const teamToUse = (!isLogin && selectedTeam) ? selectedTeam : 'General';
      await ensureGoogleUserProfile(result.user, teamToUse);
      onLoginSuccess();
    } catch (err: any) {
      console.error("Google login error details:", err);
      let msg = "שגיאה בהתחברות עם Google.";
      if (err.code === 'auth/popup-closed-by-user') msg = "ההתחברות בוטלה.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl text-center max-w-lg w-full mx-auto animate-fade-in-up border border-brand-muted/20 relative overflow-hidden">
      {/* Decorative dots */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full -mr-12 -mt-12 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-brand-touch/5 rounded-full -ml-8 -mb-8 pointer-events-none"></div>

      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-brand-muted hover:text-brand-dark transition-colors p-2"
        >
          <ArrowLeftIcon className="w-6 h-6 rotate-180" />
        </button>
      )}

      <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-2">
        {isLogin ? 'ברוכים השבים' : 'משתמש חדש? בוא נתחיל'}
      </h2>
      <p className="text-brand-muted mb-8 text-lg font-light">
        {isLogin ? 'התחברות לחשבון קיים' : 'יצירת חשבון והצטרפות לצוות'}
      </p>

      {!isLogin && (
        <div className="mb-8 text-right bg-brand-accent/5 p-5 rounded-2xl border border-brand-accent/10">
          <label className="block text-brand-dark text-base mb-2 pr-1 font-bold">בחירת הצוות שלך:</label>
          <select
            value={selectedTeam}
            onChange={(e) => {
              setSelectedTeam(e.target.value);
              setError('');
            }}
            disabled={isTeamLocked}
            className={`w-full bg-white border border-brand-muted/20 rounded-xl py-4 px-5 text-brand-dark text-lg focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all ${isTeamLocked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:border-brand-accent/50'}`}
          >
            {!isTeamLocked && <option value="" disabled>-- בחר צוות מהרשימה --</option>}
            {teams.map(team => (
              <option key={team.id} value={team.name}>{team.name}</option>
            ))}
          </select>
          {isTeamLocked && <p className="text-xs text-brand-accent/70 mt-3 text-center font-medium italic">הצוות הוגדר מראש עבור הקישור שקיבלת</p>}
        </div>
      )}

      <div className="space-y-4 mb-8">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-brand-dark hover:bg-gray-50 font-bold text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.98] border border-brand-muted/20"
        >
          {loading ? (
            <span className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <GoogleIcon className="w-6 h-6" />
              <span>{isLogin ? 'כניסה עם Google' : 'הרשמה מהירה עם Google'}</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-4 py-2">
          <div className="h-px bg-brand-muted/10 flex-1"></div>
          <span className="text-brand-muted text-xs font-bold px-2">או ידנית עם אימייל</span>
          <div className="h-px bg-brand-muted/10 flex-1"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        {!isLogin && (
          <div className="space-y-1">
            <label className="block text-brand-muted text-xs font-bold pr-1 uppercase tracking-wider">שם מלא</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/50 border border-brand-muted/20 rounded-xl py-4 px-5 text-brand-dark text-lg focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent focus:bg-white transition-all outline-none"
              placeholder="איך קוראים לך?"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-brand-muted text-xs font-bold pr-1 uppercase tracking-wider">כתובת אימייל</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/50 border border-brand-muted/20 rounded-xl py-4 px-5 text-brand-dark text-lg focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent focus:bg-white transition-all outline-none text-left"
            style={{ direction: 'ltr' }}
            placeholder="email@domain.com"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-brand-muted text-xs font-bold pr-1 uppercase tracking-wider">סיסמה</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/50 border border-brand-muted/20 rounded-xl py-4 px-5 text-brand-dark text-lg focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent focus:bg-white transition-all outline-none text-left"
            style={{ direction: 'ltr' }}
            placeholder="******"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center bg-red-50 p-4 rounded-xl border border-red-100 animate-shake">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-touch hover:bg-brand-touch/90 text-white font-extrabold py-5 px-8 rounded-2xl text-xl transition-all shadow-lg shadow-brand-touch/20 mt-6 disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? 'מעבד...' : (isLogin ? 'התחברות' : 'צור חשבון והתחל בשאלון')}
        </button>
      </form>

      <div className="mt-10 text-brand-muted flex flex-col sm:flex-row justify-center items-center gap-2 border-t border-brand-muted/10 pt-8">
        <span>{isLogin ? 'משתמש חדש בסדנה?' : 'כבר רשום במערכת?'}</span>
        <button
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
          className="text-brand-accent underline hover:text-brand-dark font-bold decoration-1 underline-offset-4 transition-colors"
        >
          {isLogin ? 'צור חשבון חדש' : 'התחבר מכאן'}
        </button>
      </div>
    </div>
  );
};

export default AuthScreen;

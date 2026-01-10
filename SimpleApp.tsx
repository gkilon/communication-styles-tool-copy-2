
import React, { useState, useMemo, useEffect } from 'react';
import { IntroScreen } from './components/IntroScreen';
import { QuestionnaireScreen } from './components/QuestionnaireScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { PasswordScreen } from './components/PasswordScreen';
import { UnifiedEntryScreen } from './components/UnifiedEntryScreen';
import AuthScreen from './components/AuthScreen';
import { Scores } from './types';
import { QUESTION_PAIRS } from './constants/questionnaireData';
import { saveUserResults } from './services/firebaseService';

interface SimpleAppProps {
  onAdminLoginAttempt: (email: string, pass: string) => Promise<void>;
  user?: any;
}

const SimpleApp: React.FC<SimpleAppProps> = ({ onAdminLoginAttempt, user }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showTeamAuth, setShowTeamAuth] = useState(false);
  const [showPersonalAuth, setShowPersonalAuth] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [step, setStep] = useState<'intro' | 'questionnaire' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
      setShowTeamAuth(false);
      setShowPersonalAuth(false);
    }
  }, [user]);

  const scores = useMemo<Scores | null>(() => {
    if (step !== 'results') return null;

    const newScores: Scores = { a: 0, b: 0, c: 0, d: 0 };
    let totalQuestions = 0;

    QUESTION_PAIRS.forEach(q => {
      const val = answers[q.id];
      if (val !== undefined && val > 0) {
        const [col1, col2] = q.columns;
        newScores[col1] += (6 - val);
        newScores[col2] += (val - 1);
        totalQuestions++;
      }
    });

    if (totalQuestions === 0) return { a: 0, b: 0, c: 0, d: 0 };
    return newScores;
  }, [step, answers]);

  useEffect(() => {
    if (step === 'results' && scores && user) {
      saveUserResults(scores).catch(err => console.error("Firebase save error:", err));
    }
  }, [step, scores, user]);

  const handleSimpleAuthenticate = (password: string) => {
    if (password.toLowerCase() === 'inspire') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleStart = () => setStep('questionnaire');
  const handleSubmit = () => setStep('results');

  const handleReset = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStep('intro');
  };

  const handleEditAnswers = () => {
    setStep('questionnaire');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowPersonalAuth(false);
    setShowTeamAuth(false);
    setShowAdminAuth(false);
    handleReset();
    import('firebase/auth').then(({ signOut, getAuth }) => {
      const auth = getAuth();
      if (auth.currentUser) signOut(auth);
    });
  };

  const handleSelectionReset = () => {
    setShowTeamAuth(false);
    setShowPersonalAuth(false);
    setShowAdminAuth(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-brand-dark p-4 sm:p-8 font-sans dir-rtl flex flex-col items-center">
      <div className="w-full max-w-6xl mx-auto">

        <div className="text-center sm:text-right">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark tracking-tight">
            שאלון סגנונות תקשורת
          </h1>
          <p className="text-brand-muted mt-1 text-lg font-light">תובנות מבוססות AI לפיתוח אישי וניהולי</p>
        </div>

        {(isAuthenticated || showPersonalAuth || showTeamAuth) && (
          <div className="sm:absolute top-0 right-0 mt-4 sm:mt-0">
            <button
              onClick={isAuthenticated ? handleLogout : handleSelectionReset}
              className="text-sm text-brand-muted hover:text-brand-dark border border-brand-muted/30 rounded px-4 py-2 bg-white/50 backdrop-blur-sm transition-colors"
            >
              חזרה
            </button>
          </div>
        )}
      </div>

      <main className="w-full flex justify-center mt-12">
        {!isAuthenticated ? (
          !showTeamAuth && !showPersonalAuth && !showAdminAuth ? (
            <UnifiedEntryScreen
              onPersonalSelect={() => setShowPersonalAuth(true)}
              onTeamSelect={() => setShowTeamAuth(true)}
              onAdminSelect={() => setShowAdminAuth(true)}
            />
          ) : showTeamAuth ? (
            <AuthScreen onLoginSuccess={() => { }} onBack={handleSelectionReset} />
          ) : showAdminAuth ? (
            <PasswordScreen
              onAuthenticate={() => false}
              onAdminLogin={onAdminLoginAttempt}
              onBack={handleSelectionReset}
              hasDatabaseConnection={false}
            />
          ) : (
            <PasswordScreen
              onAuthenticate={handleSimpleAuthenticate}
              onBack={handleSelectionReset}
              hasDatabaseConnection={false}
            />
          )
        ) : (
          <div className="w-full">
            {step === 'intro' && <IntroScreen onStart={handleStart} />}
            {step === 'questionnaire' && (
              <QuestionnaireScreen
                answers={answers}
                setAnswers={setAnswers}
                onSubmit={handleSubmit}
                currentQuestionIndex={currentQuestionIndex}
                setCurrentQuestionIndex={setCurrentQuestionIndex}
              />
            )}
            {step === 'results' && scores && (
              <ResultsScreen
                scores={scores}
                onReset={handleReset}
                onEdit={handleEditAnswers}
                onLogout={handleLogout}
                user={user}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SimpleApp;

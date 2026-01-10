
import React, { useState, useMemo, useEffect } from 'react';
import { Scores } from '../types';
import { ResultsChart } from './ResultsChart';
import { CombinedAnalysis } from './CombinedAnalysis';
import { AiCoach } from './AiCoach';
import { UserTeamMap } from './UserTeamMap';

interface ResultsScreenProps {
  scores: Scores;
  onReset: () => void;
  onEdit: () => void;
  onLogout: () => void;
  user?: any;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  scores,
  onReset,
  onEdit,
  onLogout,
  user
}) => {
  const [showAiCoach, setShowAiCoach] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const analysisData = useMemo(() => {
    // Basic analysis logic to pass to CombinedAnalysis
    const { a, b, c, d } = scores;
    const dominant = [
      { name: 'דומיננטיות', val: (a || 0) + (c || 0) },
      { name: 'השפעה', val: (a || 0) + (d || 0) },
      { name: 'יציבות', val: (b || 0) + (d || 0) },
      { name: 'מצפוניות', val: (b || 0) + (c || 0) }
    ].sort((x, y) => y.val - x.val)[0].name;

    return {
      general: `סגנון התקשורת העיקרי שלך הוא ${dominant}. אתה נוטה לשלב בין מיקוד במשימות לבין רגישות בין-אישית במינונים ייחודיים.`,
      strengths: "יכולת ניתוח גבוהה, תקשורת ברורה, ומיקוד במטרות ארוכות טווח.",
      weaknesses: "קושי בקבלת החלטות תחת לחץ זמן קיצוני או נטייה לפרטנות יתר.",
      recommendations: "נסה לשלב יותר את הצד הקיים בך של הקשבה פעילה גם במצבים תחרותיים."
    };
  }, [scores]);

  useEffect(() => {
    if (user?.uid) {
      import('../services/firebaseService').then(({ getUserProfile }) => {
        getUserProfile(user.uid).then(profile => setUserProfile(profile));
      });
    }
  }, [user]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* Top Header Card */}
      <div className="bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-xl border border-brand-muted/20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
        <h2 className="text-4xl md:text-5xl font-black text-brand-dark mb-4">פרופיל התקשורת שלך מוכן</h2>
        <p className="text-brand-muted text-lg md:text-xl font-light">ניתוח מעמיק של סגנון התקשורת וההשפעה שלך על הסביבה</p>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setShowAiCoach(true)}
            className="bg-brand-touch hover:bg-brand-touch/90 text-white font-bold py-4 px-10 rounded-2xl text-xl transition-all shadow-lg active:scale-95 flex items-center gap-3"
          >
            <span>🤖</span>
            <span>התייעץ עם מאמן AI אישי</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Visual Chart Card */}
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-brand-muted/10 shadow-lg">
          <h3 className="text-2xl font-bold text-brand-dark mb-8 border-b border-brand-muted/10 pb-4">מפה ויזואלית</h3>
          <ResultsChart scores={scores} />
        </div>

        {/* Combined Analysis Card */}
        <div className="bg-white/60 backdrop-blur-sm p-8 rounded-3xl border border-brand-muted/10 shadow-lg">
          <h3 className="text-2xl font-bold text-brand-dark mb-8 border-b border-brand-muted/10 pb-4">ניתוח סגנון</h3>
          <CombinedAnalysis analysis={analysisData} />
        </div>
      </div>

      {userProfile?.team && (
        <div className="animate-fade-in-up">
          <UserTeamMap
            teamName={userProfile.team}
            currentUserId={user.uid}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-12 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-brand-muted/10 shadow-lg">
        <button onClick={onEdit} className="px-8 py-3 rounded-xl border border-brand-muted/20 text-brand-muted font-bold hover:bg-white hover:text-brand-dark transition-all">ערוך תשובות</button>
        <button onClick={onReset} className="px-8 py-3 rounded-xl bg-brand-accent/10 text-brand-accent font-bold hover:bg-brand-accent hover:text-white transition-all">מילוי מחדש</button>
        <button onClick={onLogout} className="px-8 py-3 rounded-xl bg-brand-muted/5 text-brand-muted font-medium hover:bg-brand-muted/10 transition-all">יציאה</button>
      </div>

      {/* AI Coach Modal */}
      {showAiCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={() => setShowAiCoach(false)}></div>
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#F4F3EF] rounded-3xl shadow-2xl overflow-hidden border border-brand-muted/20 animate-scale-in">
            <div className="flex justify-between items-center p-6 border-b border-brand-muted/10 bg-white/50">
              <h3 className="text-2xl font-black text-brand-dark flex items-center gap-3">
                <span className="text-3xl">🤖</span>
                <span>מאמן AI אישי</span>
              </h3>
              <button onClick={() => setShowAiCoach(false)} className="text-brand-muted hover:text-brand-dark p-2 text-2xl">✕</button>
            </div>
            <div className="overflow-y-auto p-0" style={{ height: 'calc(90vh - 80px)' }}>
              <AiCoach scores={scores} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
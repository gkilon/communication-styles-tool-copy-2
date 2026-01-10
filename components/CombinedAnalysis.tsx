import React from 'react';

interface Analysis {
  general: string;
  strengths: string;
  weaknesses: string;
  recommendations: string;
}

interface CombinedAnalysisProps {
  analysis: Analysis;
}

export const CombinedAnalysis: React.FC<CombinedAnalysisProps> = ({ analysis }) => {
  if (!analysis) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-brand-muted/20 shadow-lg">
      <h2 className="text-3xl font-black text-brand-dark mb-6">הניתוח המשולב שלך</h2>

      <div className="space-y-8">
        {/* General */}
        <div className="border-r-4 border-brand-accent pr-6">
          <h3 className="text-2xl font-bold text-brand-dark mb-3">כללי</h3>
          <p className="text-brand-muted leading-relaxed text-lg">
            {analysis.general}
          </p>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-5 rounded-xl border-r-4 border-green-500">
            <h4 className="font-bold text-brand-dark mb-3 text-lg text-green-700">חוזקות</h4>
            <p className="text-brand-muted leading-relaxed">{analysis.strengths}</p>
          </div>

          <div className="bg-amber-50 p-5 rounded-xl border-r-4 border-amber-500">
            <h4 className="font-bold text-brand-dark mb-3 text-lg text-amber-700">אזורים לפיתוח</h4>
            <p className="text-brand-muted leading-relaxed">{analysis.weaknesses}</p>
          </div>
        </div>

        {/* Actionable Insights */}
        <div className="bg-gradient-to-l from-brand-touch/5 to-transparent p-6 rounded-xl border border-brand-touch/20">
          <h4 className="font-bold text-brand-dark mb-3 text-lg flex items-center gap-2">
            <span className="text-brand-touch text-2xl">💡</span>
            המלצות לפעולה
          </h4>
          <p className="text-brand-muted leading-relaxed text-lg">
            {analysis.recommendations}
          </p>
        </div>
      </div>
    </div>
  );
};
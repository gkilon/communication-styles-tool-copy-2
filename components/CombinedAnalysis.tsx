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
    <div className="h-full flex flex-col text-right" dir="rtl">
      <div className="space-y-8 text-brand-dark/80 leading-relaxed">
        <div className="bg-brand-accent/5 p-4 rounded-xl border-r-4 border-brand-accent">
          <h4 className="text-xl font-bold text-brand-dark mb-2">כללי</h4>
          <p className="text-lg">{analysis.general}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-4 rounded-xl border-r-4 border-green-500">
            <h4 className="text-xl font-bold text-brand-dark mb-2 text-green-700">חוזקות</h4>
            <p>{analysis.strengths}</p>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border-r-4 border-amber-500">
            <h4 className="text-xl font-bold text-brand-dark mb-2 text-amber-700">אזורים לפיתוח</h4>
            <p>{analysis.weaknesses}</p>
          </div>
        </div>

        <div className="bg-brand-touch/5 p-4 rounded-xl border-r-4 border-brand-touch">
          <h4 className="text-xl font-bold text-brand-dark mb-2 text-brand-touch">המלצות לפעולה</h4>
          <p className="text-lg">{analysis.recommendations}</p>
        </div>
      </div>
    </div>
  );
};
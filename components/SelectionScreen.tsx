
import React from 'react';

interface SelectionScreenProps {
    onPersonalSelect: () => void;
    onTeamSelect: () => void;
}

export const SelectionScreen: React.FC<SelectionScreenProps> = ({ onPersonalSelect, onTeamSelect }) => {
    return (
        <div className="flex flex-col md:flex-row gap-8 max-w-5xl w-full mx-auto px-4 md:px-0 animate-fade-in-up">
            {/* Personal Path Card */}
            <button
                onClick={onPersonalSelect}
                className="flex-1 bg-white/80 backdrop-blur-md p-10 rounded-3xl border border-brand-muted/20 shadow-xl hover:shadow-2xl transition-all group text-right hover:border-brand-accent/40"
            >
                <div className="w-16 h-16 bg-brand-accent/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">👤</span>
                </div>
                <h3 className="text-3xl font-black text-brand-dark mb-4">שאלון אישי</h3>
                <p className="text-brand-muted text-lg font-light leading-relaxed mb-8 h-20">
                    כניסה מהירה לשאלון אישי לשימוש פרטי. אין צורך ברישום מראש, רק סיסמת גישה.
                </p>
                <div className="flex items-center gap-2 text-brand-accent font-bold group-hover:translate-x-[-8px] transition-transform">
                    <span>המשך לשאלון</span>
                    <span className="text-xl">←</span>
                </div>
            </button>

            {/* Team Path Card */}
            <button
                onClick={onTeamSelect}
                className="flex-1 bg-white border-2 border-brand-accent/20 p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all group text-right relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

                <div className="w-16 h-16 bg-brand-touch/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">👥</span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-3xl font-black text-brand-dark">שאלון צוותי</h3>
                    <span className="bg-brand-touch/10 text-brand-touch text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">מומלץ</span>
                </div>
                <p className="text-brand-muted text-lg font-light leading-relaxed mb-8 h-20">
                    כניסה לסדנה או צוות. כולל רישום אישי, שמירת תוצאות ובניית מפה צוותית דינמית.
                </p>
                <div className="flex items-center gap-2 text-brand-touch font-bold group-hover:translate-x-[-8px] transition-transform">
                    <span>הצטרפות לצוות</span>
                    <span className="text-xl">←</span>
                </div>
            </button>
        </div>
    );
};

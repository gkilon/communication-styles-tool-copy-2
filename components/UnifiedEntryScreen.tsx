
import React from 'react';

interface UnifiedEntryScreenProps {
    onPersonalSelect: () => void;
    onTeamSelect: () => void;
    onAdminSelect: () => void;
}

export const UnifiedEntryScreen: React.FC<UnifiedEntryScreenProps> = ({
    onPersonalSelect,
    onTeamSelect,
    onAdminSelect
}) => {
    return (
        <div className="flex flex-col gap-6 max-w-2xl w-full mx-auto px-4 md:px-0 animate-fade-in-up">
            <div className="text-center mb-4">
                <h2 className="text-3xl md:text-4xl font-black text-brand-dark mb-3">בחר את סוג הכניסה</h2>
                <p className="text-brand-muted text-lg font-light">איך תרצה להשתמש בשאלון?</p>
            </div>

            {/* Personal Entry */}
            <button
                onClick={onPersonalSelect}
                className="w-full bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-brand-muted/20 shadow-lg hover:shadow-xl transition-all group text-right hover:border-brand-accent/40"
            >
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-brand-accent/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                        <span className="text-2xl">👤</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-2xl font-black text-brand-dark mb-2">שאלון אישי</h3>
                        <p className="text-brand-muted text-base font-light leading-relaxed">
                            כניסה מהירה עם סיסמה. ללא רישום, ללא שמירת נתונים.
                        </p>
                    </div>
                    <div className="text-brand-accent opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <span className="text-2xl">←</span>
                    </div>
                </div>
            </button>

            {/* Team Entry */}
            <button
                onClick={onTeamSelect}
                className="w-full bg-white border-2 border-brand-touch/30 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all group text-right relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-touch/5 rounded-full -mr-12 -mt-12 pointer-events-none"></div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 bg-brand-touch/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                        <span className="text-2xl">👥</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-black text-brand-dark">שאלון צוותי</h3>
                            <span className="bg-brand-touch/10 text-brand-touch text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">מומלץ</span>
                        </div>
                        <p className="text-brand-muted text-base font-light leading-relaxed">
                            הצטרפות לסדנה או צוות. כולל רישום, שמירת תוצאות ומפה צוותית.
                        </p>
                    </div>
                    <div className="text-brand-touch opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <span className="text-2xl">←</span>
                    </div>
                </div>
            </button>

            {/* Admin Entry */}
            <button
                onClick={onAdminSelect}
                className="w-full bg-brand-muted/5 backdrop-blur-sm p-6 rounded-xl border border-brand-muted/20 hover:border-brand-muted/40 transition-all group text-center"
            >
                <div className="flex items-center justify-center gap-3">
                    <span className="text-lg">⚙️</span>
                    <span className="text-sm font-bold text-brand-muted group-hover:text-brand-dark transition-colors">
                        כניסת מנהל
                    </span>
                </div>
            </button>
        </div>
    );
};

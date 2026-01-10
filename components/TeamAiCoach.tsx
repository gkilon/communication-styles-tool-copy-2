
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { getTeamAiAdvice } from '../services/geminiService';
import { SparklesIcon } from './icons/Icons';

interface TeamAiCoachProps {
    users: UserProfile[];
    teamName: string;
}

export const TeamAiCoach: React.FC<TeamAiCoachProps> = ({ users, teamName }) => {
    const [challenge, setChallenge] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!challenge.trim() || users.length === 0) return;

        setIsLoading(true);
        setAiResponse('');

        try {
            const response = await getTeamAiAdvice(users, challenge);
            setAiResponse(response);
        } catch (e) {
            setAiResponse("אירעה שגיאה בקבלת הייעוץ. אנא נסה שוב.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderResponse = (text: string) => {
        if (!text) return null;

        let htmlContent = '';
        const marked = (window as any).marked;

        try {
            if (marked && typeof marked.parse === 'function') {
                const result = marked.parse(text);
                if (typeof result === 'string') {
                    htmlContent = result;
                } else {
                    htmlContent = text.replace(/\n/g, '<br />');
                }
            } else if (marked && typeof marked === 'function') {
                const result = marked(text);
                if (typeof result === 'string') {
                    htmlContent = result;
                } else {
                    htmlContent = text.replace(/\n/g, '<br />');
                }
            } else {
                htmlContent = text.replace(/\n/g, '<br />');
            }
        } catch (error) {
            console.warn("Error parsing markdown:", error);
            htmlContent = text.replace(/\n/g, '<br />');
        }

        return (
            <div className="prose max-w-none prose-p:text-brand-dark/80 prose-headings:text-brand-accent prose-li:text-brand-dark/80 prose-strong:text-brand-dark font-light leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
        );
    };

    return (
        <div className="bg-white/40 p-6 rounded-2xl border border-brand-muted/10 mt-12 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-8 border-b border-brand-muted/10 pb-6">
                <div className="bg-brand-accent/10 p-3 rounded-xl">
                    <SparklesIcon className="w-8 h-8 text-brand-accent" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-brand-dark">מנוע ניתוח ארגוני חכם: {teamName}</h3>
                    <p className="text-sm text-brand-muted font-light tracking-wide mt-1">אבחון ההרכב האנושי אל מול יעדי הצוות ואתגריו</p>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Input Section */}
                <div className="w-full xl:w-1/3 space-y-6">
                    <div className="space-y-3">
                        <label className="block text-sm text-brand-dark mb-2 font-bold uppercase tracking-wider bg-brand-beige px-3 py-1 rounded-md inline-block">מה האתגר המרכזי?</label>
                        <textarea
                            value={challenge}
                            onChange={(e) => setChallenge(e.target.value)}
                            placeholder="לדוגמה: ירידה בשיתוף הפעולה, קושי בעמידה בלוחות זמנים, או חיכוכים בין מחלקות..."
                            className="w-full h-40 bg-white border border-brand-muted/20 rounded-2xl p-4 text-brand-dark focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all resize-none text-sm placeholder-brand-muted/40 shadow-inner"
                        />
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !challenge.trim() || users.length === 0}
                        className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 text-lg active:scale-95"
                    >
                        {isLoading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                <span>מנתח נתוני צוות...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-6 h-6" />
                                <span>הפק המלצות לניהול הצוות</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Output Section */}
                <div className="w-full xl:w-2/3 bg-white/60 rounded-2xl p-8 border border-brand-muted/10 min-h-[300px] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

                    {!aiResponse && !isLoading && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-60">
                            <div className="w-20 h-20 bg-brand-beige rounded-full flex items-center justify-center mb-6">
                                <SparklesIcon className="w-10 h-10 text-brand-muted/50" />
                            </div>
                            <p className="text-brand-dark font-bold text-lg">בוא נצלול לעומק ה-DNA של הצוות</p>
                            <p className="text-brand-muted mt-2 text-sm max-w-sm">הזן את האתגר הניהולי שעומד בפניך כדי לקבל ניתוח אסטרטגי המבוסס על סגנונות התקשורת של חברי הצוות.</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="space-y-6 animate-pulse p-4">
                            <div className="h-6 bg-brand-beige rounded-full w-1/4"></div>
                            <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                            <div className="space-y-3 mt-8">
                                <div className="h-3 bg-gray-50 rounded-full w-full"></div>
                                <div className="h-3 bg-gray-50 rounded-full w-full"></div>
                                <div className="h-3 bg-gray-50 rounded-full w-5/6"></div>
                                <div className="h-3 bg-gray-50 rounded-full w-4/6"></div>
                            </div>
                        </div>
                    )}

                    {aiResponse && (
                        <div className="animate-fade-in relative z-10">
                            {renderResponse(aiResponse)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

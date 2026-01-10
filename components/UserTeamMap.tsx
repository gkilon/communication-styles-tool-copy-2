
import React, { useEffect, useState } from 'react';
import { getTeamMembers } from '../services/firebaseService';
import { UserProfile, Scores } from '../types';

interface UserTeamMapProps {
    teamName: string;
    currentUserId: string;
}

export const UserTeamMap: React.FC<UserTeamMapProps> = ({ teamName, currentUserId }) => {
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTeam = async () => {
            try {
                const data = await getTeamMembers(teamName);
                setMembers(data);
            } catch (e) {
                console.error("Failed to load team map", e);
            } finally {
                setLoading(false);
            }
        };
        loadTeam();
    }, [teamName]);

    const getDominantColor = (scores?: Scores) => {
        if (!scores) return 'bg-gray-400';
        const { a, b, c, d } = scores;
        const results = [
            { val: (a || 0) + (c || 0), code: 'bg-rose-500' },
            { val: (a || 0) + (d || 0), code: 'bg-amber-400' },
            { val: (b || 0) + (d || 0), code: 'bg-emerald-500' },
            { val: (b || 0) + (c || 0), code: 'bg-indigo-500' }
        ];
        results.sort((x, y) => y.val - x.val);
        return results[0].code;
    };

    if (loading) return <div className="animate-pulse h-64 bg-brand-beige/30 rounded-2xl border border-brand-muted/10 flex items-center justify-center text-brand-muted">טוען מפה צוותית...</div>;

    return (
        <div className="bg-white/40 p-6 rounded-3xl border border-brand-muted/10 mt-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-brand-dark">המפה הצוותית של: {teamName}</h3>
                <div className="text-[10px] text-brand-muted flex gap-3 font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-full"></span> אדום</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full"></span> צהוב</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> ירוק</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 bg-indigo-500 rounded-full"></span> כחול</div>
                </div>
            </div>

            <div className="relative w-full max-w-sm mx-auto aspect-square bg-white rounded-2xl overflow-hidden border border-brand-muted/10 shadow-inner" dir="ltr">
                {/* Grid Lines */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-brand-muted/10 transform -translate-x-1/2"></div>
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-brand-muted/10 transform -translate-y-1/2"></div>

                {/* Axis Labels */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-brand-muted/60 uppercase tracking-widest">משימתיות</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-brand-muted/60 uppercase tracking-widest">אנשים</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-bold text-brand-muted/60 uppercase tracking-widest">מופנמות</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[8px] font-bold text-brand-muted/60 uppercase tracking-widest">מוחצנות</div>

                {members.map((m) => {
                    if (!m.scores) return null;
                    const { a, b, c, d } = m.scores;
                    const totalX = (a + b) || 1;
                    const totalY = (c + d) || 1;
                    const xPos = (a / totalX) * 100;
                    const yPos = (d / totalY) * 100;
                    const isMe = m.uid === currentUserId;

                    return (
                        <div
                            key={m.uid}
                            className={`absolute w-4 h-4 rounded-full border border-white shadow-sm transform translate-x-1/2 -translate-y-1/2 transition-all ${getDominantColor(m.scores)} ${isMe ? 'z-20 w-8 h-8 ring-4 ring-brand-touch/30 border-2' : 'z-10 opacity-70'}`}
                            style={{ right: `${xPos}%`, top: `${yPos}%` }}
                        >
                            {isMe && (
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black text-brand-touch">אני</div>
                            )}
                        </div>
                    );
                })}
            </div>
            <p className="text-center text-[10px] text-brand-muted mt-6 font-light">המיקום שלך על המפה ביחס לשאר חברי הצוות שלך בסדנה.</p>
        </div>
    );
};

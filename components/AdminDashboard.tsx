
import React, { useEffect, useState } from 'react';
import { getAllUsers, createTeam, getTeams, updateUserTeam, createUserProfile } from '../services/firebaseService';
import { auth } from '../firebaseConfig';
import { UserProfile, Team, Scores } from '../types';
import { ArrowLeftIcon } from './icons/Icons';
import { TeamAiCoach } from './TeamAiCoach';

interface AdminDashboardProps {
    onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    const [loading, setLoading] = useState(true);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [filterTeam, setFilterTeam] = useState('');
    const [newTeamName, setNewTeamName] = useState('');
    const [createTeamStatus, setCreateTeamStatus] = useState<{ msg: string, type: 'success' | 'error' | '' }>({ msg: '', type: '' });

    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (retryCount = 0) => {
        setLoading(true);
        setError(null);
        try {
            const [usersData, teamsData] = await Promise.all([getAllUsers(), getTeams()]);
            setUsers(usersData);
            setTeams(teamsData);
        } catch (err: any) {
            console.error("Failed to load admin data", err);

            // Auto-repair for main admin if rights are missing
            if ((err.code === 'permission-denied' || err.message?.includes('permission-denied')) &&
                auth.currentUser?.email?.toLowerCase() === 'admin@manager.com' &&
                retryCount === 0) {

                console.log("Attempting to repair admin permissions...");
                try {
                    await createUserProfile(auth.currentUser.uid, {
                        email: auth.currentUser.email,
                        displayName: auth.currentUser.displayName || 'Admin',
                        team: 'Management',
                        role: 'admin'
                    });
                    // Retry loading data once after repair
                    await loadData(1);
                    return;
                } catch (repairErr) {
                    console.error("Repair failed", repairErr);
                }
            }

            if (err.code === 'permission-denied' || err.message?.includes('permission-denied')) {
                setError('PERMISSION_DENIED');
            } else {
                setError(err.message || 'שגיאה לא ידועה בטעינת נתונים');
            }
        } finally {
            if (retryCount === 0 || error !== 'PERMISSION_DENIED') {
                setLoading(false);
            }
        }
    };

    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) return;
        setCreateTeamStatus({ msg: 'יוצר...', type: '' });
        try {
            await createTeam(newTeamName.trim());
            setNewTeamName('');
            setCreateTeamStatus({ msg: 'הצוות נוצר בהצלחה!', type: 'success' });
            loadData();
            setTimeout(() => setCreateTeamStatus({ msg: '', type: '' }), 3000);
        } catch (e: any) {
            setCreateTeamStatus({ msg: e.message || 'שגיאה ביצירת הצוות', type: 'error' });
            if (e.code === 'permission-denied') setError('PERMISSION_DENIED');
        }
    };

    const handleMoveUser = async (userId: string, newTeam: string) => {
        if (!window.confirm(`האם להעביר את המשתמש לצוות "${newTeam}"?`)) return;

        setUpdatingUserId(userId);
        try {
            await updateUserTeam(userId, newTeam);
            setUsers(prev => prev.map(u => u.uid === userId ? { ...u, team: newTeam } : u));
        } catch (e) {
            alert("שגיאה בהעברת המשתמש");
        } finally {
            setUpdatingUserId(null);
        }
    };

    const getDominantColorInfo = (scores?: Scores) => {
        if (!scores) return null;
        const { a, b, c, d } = scores;
        const results = [
            { color: 'אדום', val: (a || 0) + (c || 0), code: 'bg-rose-500', border: 'border-rose-300' },
            { color: 'צהוב', val: (a || 0) + (d || 0), code: 'bg-amber-400', border: 'border-amber-200' },
            { color: 'ירוק', val: (b || 0) + (d || 0), code: 'bg-emerald-500', border: 'border-emerald-300' },
            { color: 'כחול', val: (b || 0) + (c || 0), code: 'bg-indigo-500', border: 'border-indigo-300' }
        ];
        results.sort((x, y) => y.val - x.val);
        return results[0];
    };

    const renderDominantColorBadge = (scores?: any) => {
        const info = getDominantColorInfo(scores);
        if (!info) return <span className="text-brand-muted italic text-xs">טרם מולא</span>;
        return (
            <span className={`px-2 py-1 rounded-md text-[10px] text-white font-bold ${info.code} shadow-sm`}>
                {info.color}
            </span>
        );
    };

    const filteredUsers = filterTeam ? users.filter(u => u.team === filterTeam) : users;

    if (error === 'PERMISSION_DENIED') {
        return (
            <div className="min-h-screen p-6 text-right" dir="rtl">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-red-200">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-4xl text-red-500">🔒</span>
                        <h1 className="text-3xl font-bold text-brand-dark">אין הרשאת גישה</h1>
                    </div>
                    <p className="text-lg mb-6 text-brand-muted font-light">הצלחת להתחבר כמנהל, אך אין לך הרשאה לקרוא את הנתונים ב-Firebase. בדוק את הגדרות האבטחה (Database Rules) בקונסול של Google.</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={loadData} className="w-full bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md">נסה לטעון שוב ↻</button>
                        <button onClick={onBack} className="text-brand-muted hover:text-brand-dark transition-colors font-medium">חזרה למסך הבית</button>
                    </div>
                </div>
            </div>
        );
    }

    const TeamMap = () => {
        if (!filterTeam || filteredUsers.length === 0) return null;

        return (
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-brand-muted/10 mb-8 animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-brand-dark">מפה דינמית: {filterTeam}</h3>
                    <div className="text-xs text-brand-muted flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-500 rounded-full"></span> כחול</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500 rounded-full"></span> אדום</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded-full"></span> ירוק</div>
                        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-400 rounded-full"></span> צהוב</div>
                    </div>
                </div>

                <div className="relative w-full max-w-lg mx-auto aspect-square bg-white rounded-2xl overflow-hidden border border-brand-muted/20 shadow-xl" dir="ltr">
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-50/10 border-b border-l border-brand-muted/5"></div>
                    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-50/10 border-b border-brand-muted/5"></div>
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-green-50/10 border-l border-brand-muted/5"></div>
                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-50/10"></div>

                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-brand-muted/20 transform -translate-x-1/2"></div>
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-brand-muted/20 transform -translate-y-1/2"></div>

                    {filteredUsers.map((u) => {
                        if (!u.scores) return null;
                        const { a, b, c, d } = u.scores;
                        const totalX = (a + b) || 1;
                        const totalY = (c + d) || 1;
                        const xPos = (a / totalX) * 100;
                        const yPos = (d / totalY) * 100;
                        const clampedX = Math.max(5, Math.min(95, xPos));
                        const clampedY = Math.max(5, Math.min(95, yPos));
                        const domInfo = getDominantColorInfo(u.scores);
                        const dotColor = domInfo ? domInfo.code : 'bg-gray-400';
                        const borderColor = 'border-white';

                        return (
                            <div
                                key={u.uid}
                                className={`absolute w-6 h-6 rounded-full border-2 ${borderColor} shadow-lg transform translate-x-1/2 -translate-y-1/2 group cursor-pointer ${dotColor} hover:scale-150 transition-all z-10 flex items-center justify-center`}
                                style={{ right: `${clampedX}%`, top: `${clampedY}%` }}
                            >
                                <span className="text-[6px] text-white font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-1">
                                    {u.displayName?.split(' ')[0]}
                                </span>
                                <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-brand-dark text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap shadow-xl z-50">
                                    {u.displayName}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <TeamAiCoach users={filteredUsers} teamName={filterTeam} />
            </div>
        )
    };

    return (
        <div className="min-h-screen text-right pb-20" dir="rtl">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-brand-muted/10">
                    <div>
                        <h2 className="text-3xl font-black text-brand-dark">ניהול סדנאות</h2>
                        <p className="text-brand-muted text-sm mt-1 font-light tracking-wide italic">מעקב אחר התקדמות וניתוח צוותים בזמן אמת</p>
                    </div>
                    <button onClick={onBack} className="flex items-center gap-2 text-brand-muted hover:text-brand-dark px-5 py-2.5 rounded-xl text-sm bg-brand-beige transition-all border border-brand-muted/10">
                        <ArrowLeftIcon className="w-4 h-4 rotate-180" />
                        <span className="font-bold">חזרה למערכת</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-md border-r-4 border-brand-accent">
                        <div className="text-brand-muted text-xs font-bold uppercase tracking-wider mb-2">סה"כ משתתפים</div>
                        <div className="text-4xl font-black text-brand-dark">{loading ? '...' : users.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md border-r-4 border-brand-touch">
                        <div className="text-brand-muted text-xs font-bold uppercase tracking-wider mb-2">שאלונים שהושלמו</div>
                        <div className="text-4xl font-black text-brand-dark">{loading ? '...' : users.filter(u => u.scores).length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md border-r-4 border-emerald-500">
                        <div className="text-brand-muted text-xs font-bold uppercase tracking-wider mb-2">צוותים פעילים</div>
                        <div className="text-4xl font-black text-brand-dark">{loading ? '...' : teams.length}</div>
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg mb-10 border border-brand-muted/20">
                    <h3 className="text-lg font-bold text-brand-dark mb-4">פתיחת סדנה חדשה</h3>
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                        <input
                            type="text"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            placeholder="שם הצוות (לדוגמה: הנהלה בכירה)"
                            className="flex-1 bg-white border border-brand-muted/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
                        />
                        <button
                            onClick={handleCreateTeam}
                            disabled={!newTeamName.trim() || loading}
                            className="bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-3.5 px-8 rounded-xl disabled:opacity-50 transition-all shadow-lg active:scale-95"
                        >
                            צור צוות
                        </button>
                    </div>
                    {createTeamStatus.msg && (
                        <div className={`mt-4 p-3 rounded-lg text-sm font-bold ${createTeamStatus.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {createTeamStatus.msg}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-brand-muted/20">
                    <div className="p-6 border-b border-brand-muted/10 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-bold text-brand-dark">בחר צוות:</label>
                            <select
                                value={filterTeam}
                                onChange={(e) => { setFilterTeam(e.target.value); setShowMap(!!e.target.value); }}
                                className="bg-white text-brand-dark border border-brand-muted/20 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-accent font-medium shadow-sm"
                            >
                                <option value="">-- כל המשתמשים --</option>
                                {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            </select>
                        </div>
                        {filterTeam && (
                            <button
                                onClick={() => setShowMap(!showMap)}
                                className={`px-6 py-2 rounded-full font-bold transition-all text-xs shadow-md border ${showMap ? 'bg-brand-accent text-white border-brand-accent' : 'bg-white text-brand-accent border-brand-accent/30 hover:bg-brand-beige'}`}
                            >
                                {showMap ? 'הצג רשימת שמות' : 'הצג מפת צוות דינמית'}
                            </button>
                        )}
                    </div>

                    <div className="p-0">
                        {loading ? (
                            <div className="text-center py-20 text-brand-muted animate-pulse font-bold text-lg">טוען נתונים...</div>
                        ) : showMap && filterTeam ? (
                            <div className="p-6"><TeamMap /></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-right border-collapse">
                                    <thead className="bg-gray-50 text-brand-muted text-[10px] font-bold uppercase tracking-widest">
                                        <tr>
                                            <th className="py-5 px-6">שם המשתתף</th>
                                            <th className="py-5 px-6">צוות שיוך</th>
                                            <th className="py-5 px-6">סטטוס</th>
                                            <th className="py-5 px-6">תוצאה בולטת</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-muted/5">
                                        {filteredUsers.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center py-20 text-brand-muted font-light">לא נמצאו משתמשים התואמים לסינון הנבחר</td></tr>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <tr key={user.uid} className="hover:bg-brand-beige/30 transition-colors group">
                                                    <td className="py-4 px-6">
                                                        <div className="font-bold text-brand-dark group-hover:text-brand-accent transition-colors">{user.displayName || 'ללא שם'}</div>
                                                        <div className="text-[10px] text-brand-muted/60 dir-ltr text-right font-mono">{user.email}</div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                value={user.team}
                                                                onChange={(e) => handleMoveUser(user.uid, e.target.value)}
                                                                disabled={updatingUserId === user.uid}
                                                                className={`bg-white border border-brand-muted/10 rounded-lg px-3 py-1.5 text-[11px] font-bold focus:ring-2 focus:ring-brand-accent/10 transition-all text-brand-accent ${updatingUserId === user.uid ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:border-brand-accent/30 shadow-sm'}`}
                                                            >
                                                                {teams.map(t => (
                                                                    <option key={t.id} value={t.name}>{t.name}</option>
                                                                ))}
                                                                {teams.every(t => t.name !== user.team) && (
                                                                    <option value={user.team}>{user.team}</option>
                                                                )}
                                                            </select>
                                                            {updatingUserId === user.uid && (
                                                                <span className="w-3 h-3 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {user.scores ?
                                                            <span className="text-emerald-600 text-[10px] bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 font-bold">סויים</span> :
                                                            <span className="text-brand-muted/50 text-[10px] bg-gray-50 px-2 py-1 rounded-md border border-gray-100 font-medium">טרם</span>
                                                        }
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {renderDominantColorBadge(user.scores)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

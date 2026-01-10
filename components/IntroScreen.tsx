
import React from 'react';

interface IntroScreenProps {
  onStart: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md p-10 md:p-14 rounded-2xl shadow-xl text-center max-w-4xl mx-auto animate-fade-in-up border border-brand-muted/20">
      <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-8">ברוכים הבאים</h2>
      <div className="space-y-6 text-brand-dark/80 text-xl md:text-2xl leading-relaxed font-light">
        <p>
          שאלון זה יסייע לך לזהות את <strong className="text-brand-dark font-bold">סגנון התקשורת הדומיננטי</strong> שלך.
          בכל שאלה יוצג בפניך צמד של תכונות.
        </p>
        <p>
          במציאות, כולנו מורכבים ובדרך כלל מפגינים את שתי התכונות במידה זו או אחרת.
          המטרה כאן היא לסמן על הסקאלה לאיזו תכונה אתה נוטה <strong>יותר</strong> באופן טבעי ברוב המצבים.
        </p>
        <p>
          אין תשובות "נכונות" או "לא נכונות", פשוט ענה/י בכנות.
        </p>
        <p className="bg-brand-beige/50 p-6 rounded-xl border-r-4 border-brand-touch text-lg md:text-xl text-brand-dark">
          בסיום, תקבל/י מפה מקיפה של פרופיל התקשורת שלך, שתחשוף את החוזקות, האתגרים והשילוב הייחודי שיוצר את סגנונך האישי.
          <br /><br />
          בנוסף, יעמוד לרשותך <span className="text-brand-accent font-bold">מאמן AI מתקדם</span> שינתח את הפרופיל שלך לעומק ויספק לך אסטרטגיות צמיחה מותאמות אישית.
        </p>
      </div>
      <button
        onClick={onStart}
        className="mt-10 bg-brand-touch hover:bg-brand-touch/90 text-white font-bold py-4 px-12 rounded-full text-2xl transition-all transform hover:scale-105 duration-300 shadow-lg shadow-brand-touch/20"
      >
        התחל את השאלון
      </button>
    </div>
  );
};

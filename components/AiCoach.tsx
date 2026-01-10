
import React, { useState } from 'react';
import { Scores } from '../types';
import { getAiCoachAdvice } from '../services/geminiService';
import { SparklesIcon } from './icons/Icons';

interface AiCoachProps {
  scores: Scores;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const PRESET_QUESTIONS = [
  "איך אוכל לשפר את עבודת הצוות שלי?",
  "מה הדרך הטובה ביותר עבורי להשפיע על אחרים?",
  "תן לי טיפ להתמודדות עם קונפליקטים.",
  "כיצד אוכל למנף את החוזקות שלי כדי להתקדם בקריירה?"
];

const AiMessageContent: React.FC<{ text: string }> = ({ text }) => {
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
    console.warn("Error parsing AI coach markdown:", error);
    htmlContent = text.replace(/\n/g, '<br />');
  }

  return (
    <div
      className="prose max-w-none prose-p:text-brand-dark/90 prose-ul:text-brand-dark/90 prose-li:text-brand-dark/90 prose-strong:text-brand-accent"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};


export const AiCoach: React.FC<AiCoachProps> = ({ scores }) => {
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || userInput;
    if (!text.trim() || isLoading) return;

    const newUserMessage: Message = { sender: 'user', text };
    setConversation(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const aiResponse = await getAiCoachAdvice(scores, text);
      const safeResponse = aiResponse || "מצטער, התקבלה תשובה ריקה. אנא נסה שוב.";
      const newAiMessage: Message = { sender: 'ai', text: safeResponse };
      setConversation(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error("Component error:", error);
      const errorMessage: Message = { sender: 'ai', text: 'מצטער, התרחשה שגיאה בתקשורת. אנא נסה שוב.' };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-brand-dark flex items-center">
            <SparklesIcon className="w-8 h-8 ml-3 text-brand-accent" />
            מאמן ה-AI האישי שלך
          </h3>
          <p className="text-brand-muted mt-1">ייעוץ חכם המותאם לסגנון התקשורת שלך</p>
        </div>
      </div>

      <div className="bg-white/50 border border-brand-muted/20 rounded-2xl p-4 flex-grow overflow-y-auto mb-6 min-h-[400px]">
        {conversation.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mb-4">
              <SparklesIcon className="w-8 h-8 text-brand-accent" />
            </div>
            <p className="text-brand-dark/60 font-medium text-lg">בוא נתחיל. שאל אותי כל דבר או בחר אחת מהשאלות:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full max-w-2xl">
              {PRESET_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="text-sm bg-white hover:bg-brand-accent hover:text-white border border-brand-muted/20 p-3 rounded-xl transition-all duration-200 text-brand-dark/70 text-right shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-6">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.sender === 'user'
                    ? 'bg-brand-accent text-white rounded-tr-none'
                    : 'bg-white text-brand-dark border border-brand-muted/10 rounded-tl-none'
                  }`}
              >
                {msg.sender === 'ai' ? (
                  <AiMessageContent text={msg.text} />
                ) : (
                  <p className="whitespace-pre-wrap font-medium">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-brand-dark p-4 rounded-2xl border border-brand-muted/10 rounded-tl-none">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-brand-muted/20 shadow-inner">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="כתוב את שאלתך כאן..."
          className="flex-grow bg-transparent py-3 px-4 text-brand-dark placeholder-brand-muted/60 focus:outline-none"
          disabled={isLoading}
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !userInput.trim()}
          className="bg-brand-accent hover:bg-brand-accent/90 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isLoading ? '...' : 'שלח'}
        </button>
      </div>
    </div>
  );
};

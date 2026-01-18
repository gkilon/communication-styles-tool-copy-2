
import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

const handler: Handler = async (event: HandlerEvent) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ text: 'Method Not Allowed' }) };
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ text: "שגיאת שרת: API_KEY חסר בהגדרות Netlify." })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { scores, userInput, mode, teamStats } = body;

    if (!userInput) {
      return { statusCode: 400, headers, body: JSON.stringify({ text: "לא הוזן טקסט לניתוח." }) };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let systemInstruction = "";

    if (mode === 'team') {
      const { red, yellow, green, blue, total } = teamStats || { red: 0, yellow: 0, green: 0, blue: 0, total: 0 };

      systemInstruction = `
    אתה יועץ ארגוני בכיר ומאמן מנהלים מומחה במתודולוגיית DISC (ארבעת הצבעים).
    
    תפקידך לספק למשתמש ניתוח צוותי מעמיק, חד ופרקטי.
    התשובה חייבת להיות בעברית עשירה ומקצועית (Markdown).
    
    נתוני הצוות (${total} משתתפים):
    - אדום (דומיננטיות): ${red}
    - צהוב (השפעה): ${yellow}
    - ירוק (יציבות): ${green}
    - כחול (דיוק): ${blue}
    
    האתגר הצוותי: "${userInput}"
    
    מבנה התשובה:
    1. **אבחון המצב**: שיקוף הדינמיקה הצוותית לאור הרכב הצבעים והאתגר.
    2. **ניתוח הכשל/ההזדמנות**: הסבר מדוע הרכב זה מתקשה (או מצליח) באתגר זה. זהה את "הצבע החסר".
    3. **תוכנית פעולה**: 3 צעדים מנהיגותיים קונקרטיים.
        `;
    } else {
      const sA = Number(scores?.a || 0);
      const sB = Number(scores?.b || 0);
      const sC = Number(scores?.c || 0);
      const sD = Number(scores?.d || 0);
      const r = sA + sC;
      const y = sA + sD;
      const g = sB + sD;
      const b = sB + sC;
      const colors = [{ n: 'אדום', v: r }, { n: 'צהוב', v: y }, { n: 'ירוק', v: g }, { n: 'כחול', v: b }].sort((m, n) => n.v - m.v);

      systemInstruction = `
    אתה יועץ ארגוני ומאמן אישי מומחה במודל ארבעת הצבעים.
    
    פרופיל המשתמש:
    - דומיננטי: ${colors[0].n} (${colors[0].v})
    - משני: ${colors[1].n} (${colors[1].v})
    
    השאלה/האתגר: "${userInput}"
    
    כתוב תשובה קצרה, חדה ומעצימה המותאמת אישית לפרופיל ${colors[0].n}.
    מבנה:
    1. **שיקוף**: איך הטיפוס שלך רואה את המצב.
    2. **עצה מעשית**: מה כדאי לעשות (Action Item).
    3. **נקודה למחשבה**: מה הצבע המשלים (למשל ${colors[3].n}) היה אומר על זה.
        `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userInput, // Simplified format as per guidelines
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
        topP: 0.95
      }
    });

    const outputText = response.text || "לא הצלחתי לגבש תשובה. נסה שוב בניסוח אחר.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: outputText }),
    };

  } catch (error: any) {
    console.error("Gemini Function Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ text: "חלה שגיאה בעיבוד ה-AI. אנא נסה שוב בעוד רגע." }),
    };
  }
};

export { handler };

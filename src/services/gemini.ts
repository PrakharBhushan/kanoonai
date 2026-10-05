import { GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';
import { supabase } from './supabase';

const genAI = new GoogleGenerativeAI(Constants.expoConfig?.extra?.geminiKey as string);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
// text-embedding-004 was shut down by Google on 2026-01-14. Replacement is
// gemini-embedding-001, which defaults to 3072 dimensions — the Supabase
// `law_chunks.embedding` column is vector(768), so we must request the
// truncated 768-dim output (Matryoshka representation) to match, or every
// similarity query will fail with a dimension mismatch.
const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: { role: 'user', parts: [{ text }] },
    outputDimensionality: 768,
  } as any);
  return result.embedding.values;
}

const FALLBACK_EN = `I could not find Indian law provisions specific to this situation in my database.

**WHAT YOU SHOULD DO**
1. Document everything — write down dates, times, and what happened
2. Gather any written evidence (messages, receipts, agreements)
3. Contact a legal aid clinic or local bar association for free legal guidance
4. If urgent, visit your nearest police station or magistrate's court

**LAW SOURCES**
• Constitutional rights (Article 21 — Right to Life and Personal Liberty)
• General civil remedies under Indian law

---
DISCLAIMER: This is legal information for awareness only. For case-specific advice, please consult a qualified advocate registered with the Bar Council of India.`;

const FALLBACK_HI = `मुझे इस स्थिति से जुड़ा कोई विशेष भारतीय कानून अपने डेटाबेस में नहीं मिला।

**आपको क्या करना चाहिए**
1. सब कुछ लिखकर रखें — तारीख, समय और क्या हुआ
2. कोई भी लिखित सबूत इकट्ठा करें (संदेश, रसीदें, समझौते)
3. मुफ्त कानूनी सलाह के लिए किसी लीगल एड क्लिनिक या स्थानीय बार एसोसिएशन से संपर्क करें
4. अगर जरूरी हो, तो नज़दीकी पुलिस स्टेशन या मजिस्ट्रेट कोर्ट जाएं

**कानून स्रोत**
• संवैधानिक अधिकार (अनुच्छेद 21 — जीवन और व्यक्तिगत स्वतंत्रता का अधिकार)
• भारतीय कानून के अंतर्गत सामान्य नागरिक उपाय

---
अस्वीकरण: यह जानकारी केवल सामान्य जागरूकता के लिए है। अपने मामले से जुड़ी सलाह के लिए बार काउंसिल ऑफ इंडिया में पंजीकृत वकील से सलाह लें।`;

export async function queryEmergency(
  userQuery: string,
  category: string,
  language: 'en' | 'hi' = 'en'
): Promise<string> {
  let lawContext = '';
  try {
    const embedding = await generateEmbedding(userQuery);
    const { data: chunks } = await supabase.rpc('match_law_chunks', {
      query_embedding: embedding,
      match_threshold: 0.45,
      match_count: 6,
      topic_filter: null,
    });
    lawContext = (chunks ?? []).map((c: any, i: number) =>
      `[Source ${i + 1}] ${c.law_name}${c.section_number ? ` — Section ${c.section_number}` : ''}\n${c.plain_english ?? c.content}`
    ).join('\n\n---\n\n');
  } catch {
    // Proceed without RAG context
  }

  // No matching law chunks — out of scope (e.g. non-Indian law) or DB has no coverage.
  // Return fixed guidance instead of letting the model invent an answer.
  if (!lawContext.trim()) {
    return language === 'hi' ? FALLBACK_HI : FALLBACK_EN;
  }

  const langInstruction = language === 'hi'
    ? 'Respond in simple Hindi (Devanagari script). Use words a Class 5 student would understand.'
    : 'Respond in simple English. Use words a Class 5 student would understand.';

  const systemPrompt = `You are KanoonAI, an Indian legal information assistant.
${langInstruction}

STRICT RULES:
1. ONLY use information from the provided law context
2. Never give case-specific legal advice
3. Always cite the exact section number and act name
4. Structure response as: SUMMARY | WHAT LAW SAYS | YOUR RIGHTS | STEPS TO TAKE | LAW SOURCES
5. End with: DISCLAIMER: This is legal information for awareness only. Consult a Bar Council of India registered advocate for case-specific advice.`;

  const userPrompt = lawContext
    ? `User's situation: ${userQuery}\n\nCategory: ${category}\n\nLaw context:\n${lawContext}`
    : `User's situation: ${userQuery}\n\nCategory: ${category}\n\n(No specific law context found — provide general constitutional rights guidance)`;

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: userPrompt }
  ]);
  return result.response.text();
}

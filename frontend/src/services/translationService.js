// ─────────────────────────────────────────────────────────────────────────────
//  translationService.js  →  src/services/translationService.js
//  ใช้ import.meta.env เพราะโปรเจกต์นี้ใช้ Vite (ไม่ใช่ Create React App)
// ─────────────────────────────────────────────────────────────────────────────

const API_KEY  = import.meta.env.VITE_GOOGLE_TRANSLATE_KEY || '';
const BASE_URL = 'https://translation.googleapis.com/language/translate/v2';

if (!API_KEY) {
  console.warn('[translationService] VITE_GOOGLE_TRANSLATE_KEY is not set — translation will be skipped');
}

/* ── In-memory cache: { "th::en::ข้อความ" → "translated" } ── */
const cache = new Map();
const cacheKey = (text, from, to) => `${from}::${to}::${text}`;

// ─────────────────────────────────────────────────────
//  translateText — แปลข้อความเดียว
// ─────────────────────────────────────────────────────
export const translateText = async (text, { from = 'th', to = 'en' } = {}) => {
  if (!text?.trim() || from === to) return text;
  if (!API_KEY) return text;

  const key = cacheKey(text, from, to);
  if (cache.has(key)) return cache.get(key);

  try {
    const res = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: from, target: to, format: 'text' }),
    });
    const data = await res.json();
    const translated = data?.data?.translations?.[0]?.translatedText || text;
    cache.set(key, translated);
    return translated;
  } catch (err) {
    console.error('[translationService] translateText error:', err);
    return text;
  }
};

// ─────────────────────────────────────────────────────
//  translateBatch — แปลหลายข้อความใน 1 request
// ─────────────────────────────────────────────────────
export const translateBatch = async (texts, { from = 'th', to = 'en' } = {}) => {
  if (!texts?.length || from === to) return texts;
  if (!API_KEY) return texts;

  const results = new Array(texts.length);
  const toFetch = [];

  texts.forEach((text, idx) => {
    if (!text?.trim()) { results[idx] = text; return; }
    const key = cacheKey(text, from, to);
    if (cache.has(key)) {
      results[idx] = cache.get(key);
    } else {
      toFetch.push({ idx, text });
    }
  });

  if (toFetch.length === 0) return results;

  try {
    const res = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q:      toFetch.map(f => f.text),
        source: from,
        target: to,
        format: 'text',
      }),
    });
    const data = await res.json();
    const translations = data?.data?.translations || [];

    toFetch.forEach(({ idx, text }, i) => {
      const translated = translations[i]?.translatedText || text;
      cache.set(cacheKey(text, from, to), translated);
      results[idx] = translated;
    });
  } catch (err) {
    console.error('[translationService] translateBatch error:', err);
    toFetch.forEach(({ idx, text }) => { results[idx] = text; });
  }

  return results;
};

// ─────────────────────────────────────────────────────
//  translateNewsArray — แปล array ของ news (title + category)
// ─────────────────────────────────────────────────────
export const translateNewsArray = async (newsArray, to = 'en') => {
  if (!newsArray?.length || to === 'th') return newsArray;

  const titles = newsArray.map(n => n.title || '');
  const cats   = newsArray.map(n => n.category?.name || n.category || '');

  const [translatedTitles, translatedCats] = await Promise.all([
    translateBatch(titles, { from: 'th', to }),
    translateBatch(cats,   { from: 'th', to }),
  ]);

  return newsArray.map((news, i) => ({
    ...news,
    title: translatedTitles[i] || news.title,
    category: news.category?.name
      ? { ...news.category, name: translatedCats[i] || news.category.name }
      : (translatedCats[i] || news.category),
  }));
};

// ─────────────────────────────────────────────────────
//  translateNewsDetail — แปล news เดี่ยว รวม content HTML
// ─────────────────────────────────────────────────────
export const translateNewsDetail = async (news, to = 'en') => {
  if (!news || to === 'th') return news;

  const [title, content, catName] = await Promise.all([
    translateText(news.title   || '', { to }),
    translateText(news.content || '', { to }),
    translateText(news.category?.name || news.category || '', { to }),
  ]);

  return {
    ...news,
    title,
    content,
    category: news.category?.name
      ? { ...news.category, name: catName }
      : catName,
  };
};
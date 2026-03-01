import { useState, useEffect } from 'react';
import { useLanguage } from '../src/context/Languagecontext.jsx';

export function useTranslatedNews(rawNews) {
  const { lang, translateList } = useLanguage();
  const [data, setData]               = useState(rawNews || []);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (!rawNews?.length) { setData([]); return; }

    if (lang === 'th') {
      setData(rawNews);
      return;
    }

    let cancelled = false;
    setTranslating(true);

    translateList(rawNews).then(translated => {
      if (!cancelled) {
        setData(translated);
        setTranslating(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setData(rawNews);   // fallback ต้นฉบับถ้า error
        setTranslating(false);
      }
    });

    return () => { cancelled = true; };
  }, [rawNews, lang]);   // re-run เมื่อ lang เปลี่ยน

  return { data, translating };
}
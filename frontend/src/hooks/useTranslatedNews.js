import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/Languagecontext';

export function useTranslatedNews(rawNews) {
  const { lang, translateList } = useLanguage();
  const [data, setData]               = useState(rawNews || []);
  const [translating, setTranslating] = useState(false);

  // ใช้ ref เก็บ rawNews ก่อนหน้า เพื่อ detect ว่า data จริงๆ เปลี่ยนไหม
  const prevLangRef = useRef(lang);

  useEffect(() => {
    if (!rawNews?.length) {
      setData([]);
      return;
    }

    // ถ้าเป็น TH ไม่ต้องแปล แสดงของเดิมเลย
    if (lang === 'th') {
      setData(rawNews);
      prevLangRef.current = lang;
      return;
    }

    let cancelled = false;
    setTranslating(true);

    translateList(rawNews)
      .then(translated => {
        if (!cancelled) {
          setData(translated);
          prevLangRef.current = lang;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(rawNews); // fallback ถ้า API error
        }
      })
      .finally(() => {
        if (!cancelled) setTranslating(false);
      });

    return () => { cancelled = true; };

  // lang ต้องอยู่ใน dependency array เสมอ
  // ถ้าไม่มี lang hook จะไม่ทำงานเมื่อกดเปลี่ยนภาษา
  }, [rawNews, lang, translateList]);

  return { data, translating };
}
// src/context/LanguageContext.jsx
// ══════════════════════════════════════════════════════
//  ครบในไฟล์เดียว: locales + Context + Provider + hook
//
//  วิธีใช้:
//  1. ครอบ App ด้วย <LanguageProvider> ใน main.jsx
//  2. ในทุก component: const { t, lang, switchLang } = useLanguage()
//  3. แทน text ด้วย t('key') เช่น t('nav_allNews')
// ══════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useCallback } from 'react';
import { translateNewsArray, translateNewsDetail, translateText } from '../services/translationService';

// ─────────────────────────────────────────────────────
//  LOCALES
// ─────────────────────────────────────────────────────
const locales = {

  th: {
    /* Navbar */
    nav_allNews:        'ข่าวทั้งหมด',
    nav_search:         'ค้นหาข่าว...',
    nav_login:          'เข้าสู่ระบบ',
    nav_profile:        'โปรไฟล์',
    nav_admin:          'แอดมิน',
    nav_logout:         'ออกจากระบบ',
    nav_categories:     'หมวดหมู่',

    /* Footer */
    footer_tagline:     'แหล่งข่าวที่คุณไว้วางใจ',
    footer_links:       'ลิงก์ด่วน',
    footer_home:        'หน้าแรก',
    footer_news:        'ข่าวสาร',
    footer_categories:  'หมวดหมู่',
    footer_rights:      'สงวนลิขสิทธิ์',

    /* NewsHero */
    hero_latest:        'ข่าวล่าสุด',
    hero_readMore:      'อ่านต่อ',

    /* CategoryFilter */
    cf_title:           'ข่าวสารทั้งหมด',
    cf_all:             'ทั้งหมด',
    cf_noNews:          'ไม่พบข่าวสาร',

    /* NewsDetail */
    nd_back:            'ย้อนกลับ',
    nd_backAll:         'กลับหน้าข่าวสารทั้งหมด',
    nd_home:            'หน้าแรก',
    nd_news:            'ข่าวสาร',
    nd_views:           'วิว',
    nd_viewCount:       'การเข้าชม',
    nd_loading:         'กำลังโหลดข่าวสาร...',
    nd_notFound:        'ไม่พบข่าวที่คุณต้องการ',
    nd_notFoundBack:    'กลับหน้าข่าวสาร',
    nd_tts_listen:      'ฟังข่าวนี้',
    nd_tts_reading:     'กำลังอ่าน...',
    nd_tts_paused:      'หยุดชั่วคราว',
    nd_tts_idle:        'อ่านออกเสียงโดย AI',
    nd_tts_speed:       'ความเร็ว',

    /* CategoryNews */
    cn_category:        'หมวดหมู่ข่าว',
    cn_backAll:         'กลับหน้าข่าวทั้งหมด',
    cn_found:           'พบ',
    cn_foundSuffix:     'ข่าว ในหมวด',
    cn_empty:           'ไม่พบข่าวในหมวด',
    cn_emptyDesc:       'ยังไม่มีข่าวสารในหมวดหมู่นี้ในขณะนี้',
    cn_emptyBtn:        'ดูข่าวทั้งหมด',
    cn_loading:         'กำลังโหลดข่าวสาร...',

    /* Popular */
    popular_title:      'ข่าวยอดนิยม',
    popular_views:      'ครั้ง',

    /* General */
    readMore:           'อ่านต่อ',
    views:              'ครั้ง',
    noImage:            'ไม่มีรูปภาพ',
  },

  en: {
    /* Navbar */
    nav_allNews:        'All News',
    nav_search:         'Search news...',
    nav_login:          'Sign In',
    nav_profile:        'Profile',
    nav_admin:          'Admin',
    nav_logout:         'Sign Out',
    nav_categories:     'Categories',

    /* Footer */
    footer_tagline:     'Your trusted news source',
    footer_links:       'Quick Links',
    footer_home:        'Home',
    footer_news:        'News',
    footer_categories:  'Categories',
    footer_rights:      'All rights reserved',

    /* NewsHero */
    hero_latest:        'Latest News',
    hero_readMore:      'Read More',

    /* CategoryFilter */
    cf_title:           'All News',
    cf_all:             'All',
    cf_noNews:          'No news found',

    /* NewsDetail */
    nd_back:            'Back',
    nd_backAll:         'Back to All News',
    nd_home:            'Home',
    nd_news:            'News',
    nd_views:           'views',
    nd_viewCount:       'views',
    nd_loading:         'Loading news...',
    nd_notFound:        'News not found',
    nd_notFoundBack:    'Back to News',
    nd_tts_listen:      'Listen to this article',
    nd_tts_reading:     'Reading...',
    nd_tts_paused:      'Paused',
    nd_tts_idle:        'Powered by AI voice',
    nd_tts_speed:       'Speed',

    /* CategoryNews */
    cn_category:        'Category',
    cn_backAll:         'Back to All News',
    cn_found:           'Found',
    cn_foundSuffix:     'articles in',
    cn_empty:           'No news in',
    cn_emptyDesc:       'No articles available in this category yet.',
    cn_emptyBtn:        'Browse All News',
    cn_loading:         'Loading news...',

    /* Popular */
    popular_title:      'Popular News',
    popular_views:      'views',

    /* General */
    readMore:           'Read More',
    views:              'views',
    noImage:            'No image',
  },

};

// ─────────────────────────────────────────────────────
//  CONTEXT
// ─────────────────────────────────────────────────────
const LanguageContext = createContext(null);

// ─────────────────────────────────────────────────────
//  PROVIDER
// ─────────────────────────────────────────────────────
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(
    () => localStorage.getItem('app_lang') || 'th'
  );

  /* เปลี่ยนภาษา + บันทึกลง localStorage */
  const switchLang = useCallback((newLang) => {
    if (locales[newLang]) {
      setLang(newLang);
      localStorage.setItem('app_lang', newLang);
    }
  }, []);

  /* t('key') → ข้อความตาม locale ปัจจุบัน */
  const t = useCallback((key) => {
    return locales[lang]?.[key] ?? locales['th']?.[key] ?? key;
  }, [lang]);

  /* ── แปล news array (title + category) ── */
  const translateList = useCallback(async (newsArray) => {
    if (lang === 'th') return newsArray;
    return translateNewsArray(newsArray, lang);
  }, [lang]);

  /* ── แปล news detail เดี่ยว (title + content + category) ── */
  const translateDetail = useCallback(async (news) => {
    if (lang === 'th') return news;
    return translateNewsDetail(news, lang);
  }, [lang]);

  /* ── แปลข้อความเดี่ยว (สำหรับ category name ใน URL ฯลฯ) ── */
  const translate = useCallback(async (text) => {
    if (lang === 'th') return text;
    return translateText(text, { to: lang });
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t, translateList, translateDetail, translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─────────────────────────────────────────────────────
//  HOOK
// ─────────────────────────────────────────────────────
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}

// ─────────────────────────────────────────────────────
//  KEY REFERENCE  (copy-paste ไปใช้ใน component)
// ─────────────────────────────────────────────────────
//
//  import { useLanguage } from '../context/LanguageContext';
//  const { t, lang, switchLang } = useLanguage();
//
//  Navbar ──────────────────────────────────────────────
//  t('nav_allNews')       t('nav_search')
//  t('nav_login')         t('nav_profile')
//  t('nav_admin')         t('nav_logout')
//
//  Footer ──────────────────────────────────────────────
//  t('footer_tagline')    t('footer_links')
//  t('footer_home')       t('footer_news')
//  t('footer_categories') t('footer_rights')
//
//  NewsDetail ──────────────────────────────────────────
//  t('nd_back')           t('nd_backAll')
//  t('nd_home')           t('nd_news')
//  t('nd_views')          t('nd_viewCount')
//  t('nd_loading')        t('nd_notFound')
//  t('nd_notFoundBack')   t('nd_tts_listen')
//  t('nd_tts_reading')    t('nd_tts_paused')
//  t('nd_tts_idle')       t('nd_tts_speed')
//
//  CategoryNews ────────────────────────────────────────
//  t('cn_category')       t('cn_backAll')
//  t('cn_found')          t('cn_foundSuffix')
//  t('cn_empty')          t('cn_emptyDesc')
//  t('cn_emptyBtn')       t('cn_loading')
//
//  CategoryFilter ──────────────────────────────────────
//  t('cf_title')          t('cf_all')    t('cf_noNews')
//
//  General ─────────────────────────────────────────────
//  t('readMore')          t('views')     t('noImage')
//  t('popular_title')     t('popular_views')
//
//  ปุ่มเปลี่ยนภาษาใน Navbar ────────────────────────────
//  <button onClick={() => switchLang('th')} className={`nb-lang-btn ${lang==='th'?'active':''}`}>TH</button>
//  <button onClick={() => switchLang('en')} className={`nb-lang-btn ${lang==='en'?'active':''}`}>EN</button>
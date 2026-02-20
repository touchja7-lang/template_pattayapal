import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function About() {
  const location = useLocation();
  const path = location.pathname;

  let title = "";
  let content = "";

  if (path === "/about") {
    title = "เกี่ยวกับเรา";
    content = "อธิปบูรพา คือแหล่งข่าวสารที่เชื่อถือได้ ครอบคลุมทุกมิติในพื้นที่พัทยาและบริเวณใกล้เคียง เรามุ่งมั่นที่จะนำเสนอข้อมูลที่ถูกต้อง รวดเร็ว และทันสมัย เพื่อให้คุณไม่พลาดทุกเหตุการณ์สำคัญ";
  } else if (path === "/contact") {
    title = "ติดต่อเรา";
    content = "คุณสามารถติดต่อเราได้ผ่านช่องทางโซเชียลมีเดียต่างๆ หรือส่งอีเมลมาที่ ทีมงานของเราพร้อมรับฟังความคิดเห็นและข้อเสนอแนะจากคุณเสมอ";
  } else if (path === "/privacy") {
    title = "นโยบายความเป็นส่วนตัว";
    content = "เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ ข้อมูลส่วนบุคคลที่เราเก็บรวบรวมจะถูกนำไปใช้เพื่อพัฒนาการให้บริการและนำเสนอเนื้อหาที่ตรงกับความสนใจของคุณเท่านั้น";
  } else if (path === "/terms") {
    title = "เงื่อนไขการใช้งาน";
    content = "การใช้งานเว็บไซต์ อธิปบูรพา ถือว่าคุณยอมรับเงื่อนไขและข้อตกลงในการใช้งานที่เรากำหนดไว้ โปรดใช้งานอย่างสร้างสรรค์และเคารพสิทธิของผู้อื่น";
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 20px', minHeight: '50vh', fontFamily: 'Kanit, sans-serif' }}>
        <h1 style={{ color: '#333', marginBottom: '1.5rem', borderBottom: '3px solid #00a859', paddingBottom: '10px', display: 'inline-block' }}>{title}</h1>
        <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555', marginTop: '20px' }}>
          <p>{content}</p>
          <p style={{ marginTop: '20px' }}>
            ขอขอบคุณที่ไว้วางใจและติดตาม Pattayapal แหล่งข่าวสารออนไลน์อันดับหนึ่งของคนพัทยา
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default About;

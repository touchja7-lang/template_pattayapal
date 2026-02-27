// import React from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { IoArrowBack, IoLocationOutline, IoTimeOutline, IoEyeOutline } from 'react-icons/io5';
// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';
// import CommentSection from '../components/CommentSection';
// import { allLibraries } from '../data/libraryData';
// import '../css/LibraryDetail.css';

// function LibraryDetail() {
//   const { id } = useParams();
//   const library = allLibraries.find(lib => lib.id === parseInt(id));

//   if (!library) {
//     return (
//       <div>
//         <Navbar />
//         <div className="library-not-found">
//           <h2>ไม่พบสถานที่ท่องเที่ยวที่คุณค้นหา</h2>
//           <Link to="/library" className="back-to-library">กลับไปหน้าหลัก</Link>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="library-detail-wrapper">
//       <Navbar />
      
//       <Link to="/library" className="back-btn">
//         <IoArrowBack /> กลับ
//       </Link>

//       {/* ส่วนหัวภาพ */}
//       <div className="library-hero">
//         <img src={library.img} alt={library.title} className="library-cover-img" />
//         <div className="library-overlay">
//           <div className="library-header-content">
//             <span className="library-badge">{library.location}</span>
//             <h1 className="library-main-title">{library.title}</h1>
//             <div className="library-meta">
//               <span><IoEyeOutline /> {library.views} ครั้ง</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ส่วนเนื้อหา */}
//       <div className="library-body-container">
//         <div className="library-info-section">
//           <h2>รายละเอียด</h2>
//           <p className="library-description">{library.description}</p>
//         </div>

//         <div className="library-details-grid">
//           <div className="library-detail-item">
//             <IoLocationOutline className="detail-icon" />
//             <div>
//               <h3>ที่อยู่</h3>
//               <p>{library.address}</p>
//             </div>
//           </div>

//           <div className="library-detail-item">
//             <IoTimeOutline className="detail-icon" />
//             <div>
//               <h3>เวลาเปิด-ปิด</h3>
//               <p>{library.openingHours}</p>
//             </div>
//           </div>
//         </div>

//         {/* ส่วนแสดงความคิดเห็น */}
//         <CommentSection itemId={id} itemType="library" />
//       </div>

//       <Footer />
//     </div>
//   );
// }

// export default LibraryDetail;

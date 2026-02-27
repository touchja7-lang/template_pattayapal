// import React, { useState } from 'react'
// import ImageSlider from '../components/ImageSlider'
// import Navbar from '../components/Navbar'
// import PopularLibrary from '../components/Popularlibrary'
// import Footer from '../components/Footer'
// import CategoryFilter from '../components/CategoryFilter'
// import { allLibraries } from '../data/libraryData'
// import { Link } from 'react-router-dom'
// import '../css/Library.css'

// function Library() {
//   const [selectedLocation, setSelectedLocation] = useState('');

//   // ดึงสถานที่ทั้งหมดที่ไม่ซ้ำกัน
//   const locations = [...new Set(allLibraries.map(library => library.location))];

//   // กรองสถานที่ท่องเที่ยวตามหมวดหมู่ที่เลือก
//   const filteredLibraries = selectedLocation 
//     ? allLibraries.filter(library => library.location === selectedLocation)
//     : allLibraries;

//   return (
//     <div>
//       <Navbar />
//       <ImageSlider />
      
//       <div className="library-page-container">
//         <h2 className="library-page-title">สถานที่ท่องเที่ยวทั้งหมด</h2>
        
//         <CategoryFilter 
//           categories={locations}
//           selectedCategory={selectedLocation}
//           onSelectCategory={setSelectedLocation}
//         />

//         <div className="filtered-library-grid">
//           {filteredLibraries.length > 0 ? (
//             filteredLibraries.map((library) => (
//               <Link to={`/library/${library.id}`} key={library.id} className="library-card">
//                 <div className="library-card-image">
//                   <img src={library.img} alt={library.title} />
//                   <span className="library-card-location">{library.location}</span>
//                 </div>
//                 <div className="library-card-content">
//                   <h3 className="library-card-title">{library.title}</h3>
//                   <p className="library-card-description">{library.description}</p>
//                   <div className="library-card-meta">
//                     <span>👁 {library.views} ครั้ง</span>
//                   </div>
//                 </div>
//               </Link>
//             ))
//           ) : (
//             <p className="no-library">ไม่พบสถานที่ท่องเที่ยวในหมวดหมู่นี้</p>
//           )}
//         </div>
//       </div>

//       <Footer />
//     </div>
//   )
// }

// export default Library;

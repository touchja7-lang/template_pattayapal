import React from 'react'
import Navbar from '../components/Navbar'
import ImageSlider from '../components/ImageSlider'
import NewsGrid from '../components/NewsGrid'
import LibraryCard  from '../components/Librarycard'
import PopularSection from '../components/Popularcard'
import Footer from '../components/Footer' 


function Home() {
    return (
        <div className='home-container'>
            <Navbar />
            <ImageSlider />
            <NewsGrid />
            <PopularSection />
            <Footer />
        </div>
    )
}

export default Home

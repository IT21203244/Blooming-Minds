import React from 'react'
import Auditory from './img/auditory Learning.jpg'
import Kinesthetic from './img/kinesthetic learning.webp'
import ReadAndWrite from './img/readwrite-learner-strategy.jpg'
import Visual from './img/Visual Learning.jpg'
import './home.css'
function Home() {
    return (
        <div>
            <p className='topic_home'>Blooming <span className='sub_topic'>Minds</span></p>
            <div className='action_card'>
                <div className='card_home' onClick={() => (window.location.href = '/')}>
                    <img src={ReadAndWrite} alt="ReadAndWrite" className='card_image' />
                    <p className='card_link' >Read / Write Learning</p>
                </div>
                <div className='card_home' onClick={() => (window.location.href = '/')}>
                    <img src={Visual} alt="Visual learning" className='card_image' />
                    <p className='card_link' >Visual Learning</p>
                </div>
                <div className='card_home' onClick={() => (window.location.href = '/AuditoryHomePage')}>
                    <img src={Auditory} alt="auditory learning" className='card_image' />
                    <p className='card_link' >Auditory Learning</p>
                </div>
                <div  onClick={() => (window.location.href = '/KnestheticHome')} className='card_home new_ad'>
                    <img src={Kinesthetic} alt="Kinesthetic learning" className='card_image' />
                    <p className='card_link'>Kinesthetic Learning</p>
                </div>
            </div>
        </div>
    )
}

export default Home

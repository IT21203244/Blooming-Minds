import React, { useState } from 'react';
import Auditory from './img/audio.png';
import Kinesthetic from './img/jump.png';
import ReadAndWrite from './img/read.png';
import Visual from './img/countt.png';
import AppLogo from './img/Frame 4.png'; 
import './Home.css';

function MainProgressDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Track sidebar state

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar state
    };

    return (
        <div className="home-container">
            {/* Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="logo-container">
                    <img src={AppLogo} alt="Blooming Minds Logo" className="app-logo" />
                </div>
                <div className="nav-items">
                    <div className="nav-item" onClick={toggleSidebar}>
                        <i className={`fa ${isSidebarOpen ? 'fa-angle-left' : 'fa-angle-right'}`}></i>
                    </div>
                    <div className="nav-item">
                        <i className="fa fa-home"></i>
                        {isSidebarOpen && <span className="nav-item-text">Home</span>}
                    </div>
                    <div className="nav-item">
                        <i className="fa fa-th"></i>
                        {isSidebarOpen && <span className="nav-item-text">Dashboard</span>}
                    </div>
                    <div className="nav-item">
                        <i className="fa fa-user"></i>
                        {isSidebarOpen && <span className="nav-item-text">Profile</span>}
                    </div>
                    <hr className="nav-divider" />
                    <div className="nav-item">
                        <i className="fa fa-clock-o"></i>
                        {isSidebarOpen && <span className="nav-item-text">History</span>}
                    </div>
                    <div className="nav-item">
                        <i className="fa fa-line-chart"></i>
                        {isSidebarOpen && <span className="nav-item-text">Statistics</span>}
                    </div>
                    <hr className="nav-divider" />
                    <div className="nav-item">
                        <i className="fa fa-cog"></i>
                        {isSidebarOpen && <span className="nav-item-text">Settings</span>}
                    </div>
                    <div className="nav-item">
                        <i className="fa fa-sign-out"></i>
                        {isSidebarOpen && <span className="nav-item-text">Logout</span>}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="main-content">
                <div className="action_card">
                    <div className="card_home" onClick={() => (window.location.href = '/rwstat-home')}>
                        <img src={ReadAndWrite} alt="ReadAndWrite" className="card_image1" />
                        <div className="card_link">Read / Write Statistics</div>
                    </div>
                    <div className="card_home" onClick={() => (window.location.href = '/vstat-home')}>
                        <img src={Visual} alt="Visual learning" className="card_image2" />
                        <div className="card_link">Visual Statistics</div>
                    </div>
                    <div className="card_home" onClick={() => (window.location.href = '/')}>
                        <img src={Auditory} alt="auditory learning" className="card_image3" />
                        <div className="card_link">Auditory Statistics</div>
                    </div>
                    <div onClick={() => (window.location.href = '/KnestheticHome')} className="card_home new_ad">
                        <img src={Kinesthetic} alt="Kinesthetic learning" className="card_image4" />
                        <div className="card_link">Kinesthetic Statistics</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MainProgressDashboard;

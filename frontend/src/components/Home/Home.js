import React ,{useState}from 'react'
import { Link } from "react-router-dom";
import Auditory from './img/audio.jpg';
import Kinesthetic from './img/kinesthetic.png';
import ReadAndWrite from './img/writing.jpg';
import Visual from './img/math.jpg';
import AppLogo from './img/Frame 4.png'; 
import './home.css'

function Home() {

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
                        <Link to="/main-progress" className="nav-link" style={{ textDecoration: "none", color: "inherit" }}>
                            <i className="fa fa-line-chart"></i>
                            {isSidebarOpen && <span className="nav-item-text">Statistics</span>}
                        </Link>
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
                    <div className="card_home" onClick={() => (window.location.href = '/rw-home')}>
                        <img src={ReadAndWrite} alt="ReadAndWrite" className="card_image1" />
                        <div className="card_link">Read / Write Learning</div>
                    </div>
                    <div className="card_home" onClick={() => (window.location.href = '/v-home')}>
                        <img src={Visual} alt="Visual learning" className="card_image2" />
                        <div className="card_link">Visual Learning</div>
                    </div>
                    <div className="card_home" onClick={() => (window.location.href = '/AuditoryHomePage')}>
                        <img src={Auditory} alt="auditory learning" className="card_image3" />
                        <div className="card_link">Auditory Learning</div>
                    </div>
                    <div onClick={() => (window.location.href = '/KnestheticHome')} className="card_home new_ad">
                        <img src={Kinesthetic} alt="Kinesthetic learning" className="card_image4" />
                        <div className="card_link">Kinesthetic Learning</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home

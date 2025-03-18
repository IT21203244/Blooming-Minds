import React, { useState, useEffect } from 'react';
import './admin.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function SmileQuestAdmin() {
    const [smileData, setSmileData] = useState([]);
    const [loading, setLoading] = useState(true);  // Add a loading state
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchSmileData = async () => {
            try {
                setLoading(true); // Set loading to true when starting the fetch
                const response = await fetch('http://localhost:5000/api/get_emotion_data');
                const result = await response.json();
                if (response.ok) {
                    setSmileData(result); // Assuming the result is an array of smile records
                } else {
                    console.error(result.error);
                }
            } catch (error) {
                console.error('Error fetching smile records:', error);
            } finally {
                setLoading(false); // Set loading to false when fetch is complete
            }
        };

        fetchSmileData();
    }, []);




    const generateReport = () => {
        const doc = new jsPDF("landscape");

        doc.setFontSize(18);
        doc.text('Smile Data Report', 14, 15);
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);

        const headers = [
            ['Username', 'Percentage', 'Date', 'Time']
        ];

        const data = smileData.map(record => [
            record.username,
            `${record.smile_percentage}%`,
            record.date,
            record.time,
        ]);

        doc.autoTable({
            head: headers,
            body: data,
            startY: 30,
        });

        doc.save('Smile_Data_Report.pdf');
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value.toLowerCase());
    };

    const filteredSmileData = smileData.filter(record => {
        const username = record.username ? record.username.toLowerCase() : '';
        const date = record.date ? record.date.toLowerCase() : '';
        return username.includes(searchQuery) || date.includes(searchQuery);
    });

    return (
        <div>
            <div className='nav_bar_kin_admin main_nav'>
                <p className='kin_admin_nav ' onClick={() => (window.location.href = '/KnestheticAdmin')}>letter Quest</p>
                <p className='kin_admin_nav kin_admin_nav_active_main' onClick={() => (window.location.href = '/actionQuestAdmin')}>Action Quest</p>
                <p className='kin_admin_nav' onClick={() => (window.location.href = '/KnestheticHome')}>Logout</p>
            </div>
            <div className="student-records-container">

                <div>
                    <h2 className='table_name'>Data Records</h2>
                    {loading ? (
                        <div className="loading-message">Loading...</div>
                    ) : (
                        <div>
                            <div className='action_set_kin_admin'>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Search by username "
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        className="search_bar_kin_admin"
                                    />
                                </div>

                                <button onClick={generateReport} className="generate_report_btn">
                                    Generate Report
                                </button>
                            </div>
                            <table className="student-records-table">
                                <thead>
                                    <tr>
                                        <th className='tble_kin_head'>Username</th>
                                        <th className='tble_kin_head'>Task Name</th>
                                        <th className='tble_kin_head'>Result</th>
                                        <th className='tble_kin_head'>Status</th>
                                        <th className='tble_kin_head'>Date</th>
                                        <th className='tble_kin_head'>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSmileData.map((record) => (
                                        <tr key={record._id}>
                                            <td className='tble_kin_bd'>{record.username}</td>
                                            <td className='tble_kin_bd'>{record.taskname}</td>
                                            <td className='tble_kin_bd'>{record.result}</td>
                                            <td className='tble_kin_bd'>{record.status}</td>
                                            <td className='tble_kin_bd'>{record.date}</td>
                                            <td className='tble_kin_bd'>{record.time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SmileQuestAdmin;

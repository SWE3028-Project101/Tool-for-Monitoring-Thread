import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Navigation 기능 추가
import Ranking from './Ranking';
import Search from './Search';
import './TotalPage.css';

function TotalPage() {
    const [activeTab, setActiveTab] = useState('ranking');
    const navigate = useNavigate(); // Navigation hook

    const renderContent = () => {
        switch (activeTab) {
            case 'search':
                return <Search />;
            case 'ranking':
                return <Ranking />;
            default:
                return null;
        }
    };

    return (
        <div className="total-page">
            <button className="back-button" onClick={() => navigate('/main')}>Back to Main</button>
            <div className="tab-container">
                <button
                    className={`tab ${activeTab === 'search' ? 'active' : ''}`}
                    onClick={() => setActiveTab('search')}
                >
                    Search
                </button>
                <button
                    className={`tab ${activeTab === 'ranking' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ranking')}
                >
                    Ranking
                </button>
            </div>
            <div className="content-container">
                {renderContent()}
            </div>
        </div>
    );
}

export default TotalPage;

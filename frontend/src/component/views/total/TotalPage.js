import React, { useState } from 'react';
import State from './State';
import Ranking from './Ranking';
import Search from './Search';
import './TotalPage.css';

function TotalPage() {
    const [activeTab, setActiveTab] = useState('ranking');

    const renderContent = () => {
        switch (activeTab) {
            case 'search':
                return <Search />;
            case 'ranking':
                return <Ranking />;
            case 'state':
                return <State />;
            default:
                return null;
        }
    };

    return (
        <div className="total-page">
            <div className="tab-container">
                <button className={`tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>Search</button>
                <button className={`tab ${activeTab === 'ranking' ? 'active' : ''}`} onClick={() => setActiveTab('ranking')}>Ranking</button>
                <button className={`tab ${activeTab === 'state' ? 'active' : ''}`} onClick={() => setActiveTab('state')}>State</button>
            </div>
            <div className="content-container">
                {renderContent()}
            </div>
        </div>
    );
}

export default TotalPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Ranking from './Ranking';
import Search from './Search';
import './TotalPage.css';

function TotalPage() {
  const [activeTab, setActiveTab] = useState('search');
  const navigate = useNavigate();

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

  const getContentBackgroundColor = () => {
    switch (activeTab) {
      case 'search':
        return '#00FFFF'; // Search 배경색
      case 'ranking':
        return '#8DFFE2'; // Ranking 배경색
      default:
        return '#FFFFFF'; // 기본 배경색
    }
  };

  return (
    <div className="total-page">
      {/* 뒤로가기 버튼 */}
      <div className="header-container">
        <button className="back-button" onClick={() => navigate('/myThreads')}>
          Back to Main
        </button>
      </div>

      {/* 탭 버튼 */}
      <div className="tab-container">
        <button
          className={`tab search ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
        <button
          className={`tab ranking ${activeTab === 'ranking' ? 'active' : ''}`}
          onClick={() => setActiveTab('ranking')}
        >
          Ranking
        </button>
      </div>

      {/* 콘텐츠 영역 */}
      <div
        className="content-container"
        style={{ backgroundColor: getContentBackgroundColor() }}
      >
        {renderContent()}
      </div>
    </div>
  );
}

export default TotalPage;

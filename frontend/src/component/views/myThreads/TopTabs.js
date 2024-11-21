import React from 'react';
import './TopTabs.css';
import { useNavigate } from 'react-router-dom';

function TopTabs({ data, categories, onCategorySelect }) {
  const [activeTab, setActiveTab] = React.useState(categories[0]);
  const navigate = useNavigate();

  const handleTabClick = (category) => {
    setActiveTab(category);
    onCategorySelect(category);
  };

  const goToTotal = () => {
    navigate("/total", { state: { data } });
  };

  return (
    <div className="category-tabs-container">
      <div className="category-tabs">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`category-tab ${activeTab === category ? 'active' : ''}`}
            onClick={() => handleTabClick(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="tab-spacer"></div>
      <button className="redirect-button" onClick={goToTotal}>Go to Total</button>
    </div>
  );
}

export default TopTabs;

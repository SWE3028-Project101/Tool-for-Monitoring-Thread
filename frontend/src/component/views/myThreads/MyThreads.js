import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopTabs from './TopTabs';
import CategorySummary from './CategorySummary';
import ThreadBubbles from './ThreadBubbles';
import ProblemLogs from './ProblemLogs';
// import './MyThreads.css';

function MyThreads({ data }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryData, setCategoryData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (data && data.length > 0) {
      const extractedCategories = Array.from(
        new Set(
          data.map(item => {
            const category = `/${item.uri.split('/')[1] || ''}`;
            return category === '/' ? '/' : `/${item.uri.split('/')[1]}`;
          })
        )
      ).filter(Boolean);
      
      setCategories(extractedCategories);

      const groupedData = extractedCategories.reduce((acc, category) => {
        acc[category] = data.filter(item => {
          return category === '/' ? item.uri === '/' : item.uri.startsWith(category);
        });
        return acc;
      }, {});
      
      setCategoryData(groupedData);
      if (selectedCategory === null && extractedCategories.length > 0) {
        setSelectedCategory(extractedCategories[0]);
      }
    }
  }, [data, selectedCategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const selectedCategoryData = categoryData[selectedCategory] || [];

  const largestMemory = (category) => {
    if (!category || category.length === 0) return null;
    return category.reduce((maxThread, currentThread) => {
        return parseInt(currentThread.memoryUsage) > parseInt(maxThread.memoryUsage) ? currentThread : maxThread;
    }, category[0]);
  };

  const slowestThread = (category) => {
    if (!category || category.length === 0) return null;
    return category.reduce((slowThread, currentThread) => {
        return parseInt(currentThread.executionTime) > parseInt(slowThread.executionTime) ? currentThread : slowThread;
    }, category[0]);
  };

  const totalMemory = (category) => {
    if (!category || category.length === 0) return 0;
    return category.reduce((total, item) => {
        return total + parseInt(item.memoryUsage);
    }, 0);
  };

  const goToTotal = () => {
    navigate("/total", { state: { data } });
  };

  return (
    <div>
      {categories.length > 0 && (
        <TopTabs
          data={data}
          categories={categories}
          onCategorySelect={handleCategorySelect}
        />
      )}

      {selectedCategoryData.length > 0 ? (
        <>
          <CategorySummary
            category={selectedCategory}
            total={totalMemory(selectedCategoryData)}
            largest={largestMemory(selectedCategoryData)}
            slowest={slowestThread(selectedCategoryData)}
            threadCount={selectedCategoryData.length}
          />
          <ThreadBubbles threads={selectedCategoryData} />
          <ProblemLogs logs={selectedCategoryData} />
        </>
      ) : (
        <p>No data available</p>
      )}

      
    </div>
  );
}

export default MyThreads;

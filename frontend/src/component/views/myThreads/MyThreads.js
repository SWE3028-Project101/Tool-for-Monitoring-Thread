import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopTabs from './TopTabs';
import CategorySummary from './CategorySummary';
import ThreadBubbles from './ThreadBubbles';
import ProblemLogs from './ProblemLogs';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
// import './MyThreads.css';

function MyThreads({ data }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryData, setCategoryData] = useState({});
  const location = useLocation();
  const totalThreadCount = location.state?.totalThreadCount;
  
  const navigate = useNavigate();
  const [errorData, setErrorData] = useState(null);
  const [errorCategoryData, setErrorCategoryData] = useState({});
  const [selectedErrorCategory, setSelectedErrorCategory] = useState(null);
  const callErrorApi = async() => {
    try{
      const response = await axios.get("api/error");
      setErrorData(response.data);
      console.log(response.errorData);
    } catch(error) {
      console.error("error fetching(/api/error)");
    }
  }

  useEffect(() => {
    
    //console.log("data.data is : ",data.data);
    
    //&& 'data' in data
    if (data!= null && data != undefined && Object.keys(data).length != 0) {
      //console.log('here');
   
      console.log('data is ',data.data);
      const extractedCategories = Array.from(
        new Set(
          data.data.map(item => {
            console.log(item);
            if (item.uri != null ) {
              const baseUri = item.uri.split('/')[1] || '';
              const category = `/${baseUri}`;
              return category === '/' ? '/' : category;
            }
          })
        )
      ).filter(Boolean);
      
      setCategories(extractedCategories);
     
      const groupedData = extractedCategories.reduce((acc, category) => {
        acc[category] = data.data.filter(item => {
          if(item.uri != null) {
            const itemBaseUri = `/${item.uri.split('/')[1]}`;
            return category === '/' ? item.uri === '/' : itemBaseUri === category;
          }
        });
        return acc;
      }, {});
      
      setCategoryData(groupedData);

      if (selectedCategory === null && extractedCategories.length > 0) {
        setSelectedCategory(extractedCategories[0]);
      }
    } else {
      console.log("no data");
      setSelectedCategory();
    }
    callErrorApi();

    const intervalIdError = setInterval(() => {
      console.log("fetching data from backend...(/api/error)");
      callErrorApi();
    }, 5000);

    
    if ( errorData && errorData.length > 1) {
      console.log(errorData);
      const extractedErrorCategory = Array.from(
        new Set(
          errorData.map(item => {
            if(item.uri != null) {
              const errorbaseUri = item.uri.split('/')[1] || '';
              const errorcategory = `/${errorbaseUri}`;
              return errorcategory === '/' ? '/' : errorcategory;
            }
          })
        )
      ).filter(Boolean);

      const groupedErrorData = extractedErrorCategory.reduce((acc, category) => {
        acc[category] = errorData.filter(item => {
          if(item.uri != null){
            const erroritemBaseUri = `/${item.uri.split('/')[1]}`;
            return category === '/' ? item.uri === '/' : erroritemBaseUri === category;
          }
        });
        return acc;
      }, {});

      setErrorCategoryData(groupedErrorData);

      if (selectedErrorCategory === null && extractedErrorCategory.length > 0) {
        setSelectedErrorCategory(extractedErrorCategory[0]);
      }
    }

    return () => clearInterval(intervalIdError);
  }, [data, selectedCategory, selectedErrorCategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedErrorCategory(category);
  };

  const selectedCategoryData = categoryData[selectedCategory] || [];
  console.log("selected categoryData: ", selectedCategoryData);
  console.log("data",data);
  const selectedErrorCategoryData = errorCategoryData[selectedErrorCategory] || [];

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

      {(selectedCategoryData.length > 0 && data!= null && data != undefined && Object.keys(data).length != 0 ) ? (
        <>
          <CategorySummary
            category={selectedCategory}
            total={totalMemory(selectedCategoryData)}
            largest={largestMemory(selectedCategoryData)}
            slowest={slowestThread(selectedCategoryData)}
            threadCount={selectedCategoryData.length}
            activeCount={data.data.length}
            totalCount={totalThreadCount}
          />
         
          <ThreadBubbles threads={selectedCategoryData} />
          <ProblemLogs logs={selectedErrorCategoryData} />
        </>
      ) : (
        <p>No data available</p>
      )}

      
    </div>
  );
}

export default MyThreads;

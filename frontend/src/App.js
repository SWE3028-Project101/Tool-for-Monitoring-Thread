
import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Main from './component/views/Main/Main'
import MyThreads from './component/views/myThreads/MyThreads'
import Total from './component/views/total/TotalPage'

import axios from 'axios';
import React, { useState, useEffect } from 'react';


function App() {
  const [data, setData] = useState(null);
  const callApi = async() => {
    try {
      const response = await axios.get("api/mainPage");
      setData(response.data);
      //console.log(response.data);
    } catch (error) {
      console.error("error fetching"); 
    }
  }
  useEffect(() => {
    // 처음에 한 번 실행
    //callApi();

    // 5초마다 callApi 실행
    const intervalId = setInterval(() => {
      //console.log("fetching data from backend...");
      callApi();
    }, 1000);

    // 컴포넌트 언마운트 시 interval 정리
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
      
      <Routes>
        <Route path = "/" element = {<Main />}></Route>
        <Route path = "/MyThreads" element = {<MyThreads data = {data} />}></Route>
        <Route path = "/total" element = {<Total />}></Route>
        
      </Routes>

      
      </BrowserRouter>
        
       
      
    </div>
  );
}

export default App;

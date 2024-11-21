import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Search.css';
import Pagination from "./Pagination";
function Search() {
    const [uri, setUri] = useState('');
    const [responseTime, setResponseTime] = useState('');
    const [memoryUsage, setMemoryUsage] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedHour, setSelectedHour] = useState("00");
    const [results, setResults] = useState([]);
    const [dataCount, setDataCount] = useState(0);
    const [totalPage, setTotalPage] = useState(0); // 전체 페이지 수 상태 추가
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 추가
    const itemsPerPage = 10; // 페이지당 항목 수

    const handleSearch = async (page = 0) => {
        const date = selectedDate.toISOString().split('T')[0]; // yyyy-mm-dd 형식
        console.log(page);
        try {
            const response = await axios.get('api', {
                params: {
                    search : uri,
                    executionTime : responseTime,
                    memoryUsage,
                    date,
                    time: selectedHour,
                    page : page
                },
            });
            if (Object.keys(response.data).length === 0) {
                console.log('no data');
                setResults([]);
                setTotalPage(0); // 데이터가 없을 경우 페이지 수를 0으로 설정
                setDataCount(0);
            } else {
                //console.log('1: ',response.data.data);
                //console.log('2: ',response.data.data.length);
                //console.log('totalPage : ',response.data.totalPage);
               
                setTotalPage(response.data.totalPage); // 백엔드에서 받은 totalPage 설정
                setResults(response.data.data);
                setDataCount(response.data.data.length);
            }

            
          
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
   // console.log('result is ',results);
    //console.log('result.data', results);
    const handlePageChange = (selectedPage) => {
        
        console.log('page change to : ',selectedPage.selected);
        
        setCurrentPage(selectedPage.selected + 1);
        handleSearch(selectedPage.selected + 1); // 페이지 변경 시 데이터 요청
    };

    return (
        <div className="search-container">
            <div className="search-input">
                <label>Search:</label>
                <input
                    type="text"
                    value={uri}
                    onChange={(e) => setUri(e.target.value)}
                    placeholder="Enter URI"
                />
            </div>

            <div className="filters">
                <div className="filter">
                    <label>Response Time (ms):</label>
                    <input
                        type="number"
                        value={responseTime}
                        onChange={(e) => setResponseTime(e.target.value)}
                        placeholder="Min response time"
                    />
                </div>
                <div className="filter">
                    <label>Memory Usage (MB):</label>
                    <input
                        type="number"
                        value={memoryUsage}
                        onChange={(e) => setMemoryUsage(e.target.value)}
                        placeholder="Min memory usage"
                    />
                </div>
                <div className="filter">
                    <label>Select Date:</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        dateFormat="yyyy-MM-dd"
                        showTimeSelect={false}
                    />
                </div>
                <div className="filter">
                    <label>Select Hour:</label>
                    <select
                        value={selectedHour}
                        onChange={(e) => setSelectedHour(e.target.value)}
                    >
                        {[...Array(24)].map((_, index) => {
                            const hour = index < 10 ? `0${index}` : index;
                            return (
                                <option key={index} value={hour}>{hour}</option>
                            );
                        })}
                    </select>
                </div>
            </div>

            <div className="search-button">
                <button onClick={handleSearch}>Search</button>
            </div>

            <div className="results-container">
                {results ? (
                    results.map((item, index) => (
                        <div key={index} className="result-item">
                            {`${index + 1}. ${item.uri} - memory usage: ${item.memoryUsage}MB, thread time: ${item.threadTime}ms`}
                        </div>
                    ))
                ) : (
                    <p>No data available</p>
                )}
                {/* 페이지네이션 */}
                {totalPage > 1 && (
                        <Pagination
                            pageCount={totalPage}
                            onPageChange={handlePageChange}
                            currentPage={currentPage}
                        />
                    )}
                <div className="data-count">
                    Data number: {dataCount}
                </div>
            </div>
        </div>
    );
}

export default Search;

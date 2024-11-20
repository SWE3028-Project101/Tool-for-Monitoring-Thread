import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Ranking.css';
import Pagination from "./Pagination";

function Ranking() {
    let [data, setData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedHour, setSelectedHour] = useState("00");
    const [calc, setCalc] = useState('average');
    const [sortCriteria, setSortCriteria] = useState('callCount');
    const [showData, setShowData] = useState(false);
    const [totalPage, setTotalPage] = useState(0); // 전체 페이지 수 상태 추가
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 추가
    const itemsPerPage = 1; // 페이지당 항목 수

    const handleSelect = async ( page = 1) => {
        setShowData(true);

        // 날짜 및 시간 포맷팅
        const date = selectedDate.toISOString().split('T')[0]; // yyyy-mm-dd
        const time = sortCriteria === 'callCount' ? selectedHour : null;

        try {
            // 백엔드로부터 필터링된 데이터 가져오기
            const response = await axios.get('api/rank', {
                params: {
                    date,
                    time, // Call Count의 경우 시간 값만 전달
                    calc: sortCriteria === 'memoryUsage' ? calc : null,
                    title: sortCriteria,
                    page : page
                },
            });
            console.log('ranking data is ',response.data);

            if (Object.keys(response.data).length === 0) {
                setData([]);
                setTotalPage(0); // 데이터가 없을 경우 페이지 수를 0으로 설정
            } else {
                setData(response.data.data);
                setTotalPage(response.data.totalPage); // 백엔드에서 받은 totalPage 설정
            }

            if(Object.keys(response.data).length == 0){
                setData([]);
            } else {
            setData(response.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    //console.log('data in summary ', data);
  //  if(Object.keys(data).length != 0)
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.data ? data.data.slice(indexOfFirstItem, indexOfLastItem) : [];
    const pageCount = data.data ? Math.ceil(data.data.length / itemsPerPage) : 0;
    
    
    
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
        handleSelect(page); // 페이지 변경 시 데이터 요청
    };

        return (
        <div className="ranking-container">
            <div className="ranking-tabs">
                <button
                    className={`ranking-tab ${sortCriteria === 'callCount' ? 'active' : ''}`}
                    onClick={() => {
                        setSortCriteria('callCount');
                        setCalc('average');
                        setShowData(false);
                    }}
                >
                    Call Count Ranking
                </button>
                <button
                    className={`ranking-tab ${sortCriteria === 'memoryUsage' ? 'active' : ''}`}
                    onClick={() => {
                        setSortCriteria('memoryUsage');
                        setCalc('average');
                        setShowData(true);
                    }}
                >
                    Memory Usage Ranking
                </button>
            </div>

            {sortCriteria === 'callCount' && (
                <div className="date-picker">
                    <label>Select Date:</label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => {
                            setSelectedDate(date);
                            handleSelect(); // 날짜 변경 시 자동으로 데이터 요청
                        }}
                        dateFormat="yyyy-MM-dd"
                        showTimeSelect={false}
                    />
                    <label>Select Hour:</label>
                    <select
                        value={selectedHour}
                        onChange={(e) => {
                            setSelectedHour(e.target.value);
                            handleSelect(); // 시간 변경 시 자동으로 데이터 요청
                        }}
                    >
                        {[...Array(24)].map((_, index) => {
                            const hour = index < 10 ? `0${index}` : index;
                            return (
                                <option key={index} value={hour}>{hour}</option>
                            );
                        })}
                    </select>
                </div>
            )}

            {sortCriteria === 'memoryUsage' && (
                <div className="memory-type-selector">
                    <button
                        className={`memory-type-btn ${calc === 'average' ? 'active' : ''}`}
                        onClick={() => {
                            setCalc('average');
                            handleSelect(); // 메모리 유형 변경 시 자동으로 데이터 요청
                        }}
                    >
                        Average
                    </button>
                    <button
                        className={`memory-type-btn ${calc === 'max' ? 'active' : ''}`}
                        onClick={() => {
                            setCalc('max');
                            handleSelect(); // 메모리 유형 변경 시 자동으로 데이터 요청
                        }}
                    >
                        Max
                    </button>
                    
                    <div className="date-picker memory-usage-date-picker">
                        <DatePicker
                            selected={selectedDate}
                            onChange={(date) => {
                                setSelectedDate(date);
                                handleSelect(); // 날짜 변경 시 자동으로 데이터 요청
                            }}
                            dateFormat="yyyy-MM-dd"
                            showTimeSelect={false}
                        />
                    </div>
                </div>
            )}

            {showData && (
                
                <div className="ranking-list">
                    
                    {data.data  ? (
                        data.data.map((item, index) => (
                            <div key={index} className="ranking-item">
                                {sortCriteria === 'callCount' ? (
                                    <p>{`${index + 1}. ${item.uri} - call count: ${item.calledNum}`}</p>
                                ) : (
                                    <p>{`${index + 1}. ${item.uri} - memory usage: ${calc === 'average' ? item.averageMemoryUsage : item.maxMemoryUsage}MB`}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No data available for the selected time period.</p>
                    )}
                {/* 페이지네이션 */}
                {totalPage > 1 && (
                        <Pagination
                            pageCount={totalPage}
                            onPageChange={handlePageChange}
                            currentPage={currentPage}
                        />
                    )}
                </div>
            )}
        </div>)
        /*
    ); 
    else {
        return (
            <div>no data</div>
        )
    }
        */
}

export default Ranking;

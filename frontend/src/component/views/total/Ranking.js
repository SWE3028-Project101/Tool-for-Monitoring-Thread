import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Ranking.css';
import Pagination from './Pagination';

function Ranking() {
    const [data, setData] = useState([]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [startHour, setStartHour] = useState('00');
    const [endHour, setEndHour] = useState('23');
    const [calc, setCalc] = useState('average');
    const [sortCriteria, setSortCriteria] = useState('callCount');
    const [showData, setShowData] = useState(false);
    const [totalPage, setTotalPage] = useState(0); // 전체 페이지 수 상태 추가
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 추가
    const itemsPerPage = 10; // 페이지당 항목 수

    const handleSelect = async (page = 1) => {
        
        const formattedStartDate = `${startDate.toISOString().split('T')[0]}`
        const formattedStartHour = `${startHour}`;
        const formattedEndDate = `${endDate.toISOString().split('T')[0]}`;
        const formattedEndHour = `${endHour}`;
        
        try {
            const response = await axios.get('api/rank', {
                params: {
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                    startHour : formattedStartHour,
                    endHour : formattedEndHour,
                    calc,
                    title: sortCriteria,
                    page,
                },
            });

            console.log('API Response:', response.data);

            if (response.data && response.data.data) {
                setData(response.data.data);
                setTotalPage(response.data.totalPage || 1);
                setShowData(true);
            } else {
                setData([]);
                setTotalPage(0);
                setShowData(true);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
            setShowData(true);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        handleSelect(page);
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
                        setShowData(false);
                    }}
                >
                    Memory Usage Ranking
                </button>
            </div>

            {/* 공통 DatePicker Section */}
            <div className="date-picker">
                <label>Start Date:</label>
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                    showTimeSelect={false}
                />
                <label>Start Hour:</label>
                <select
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                >
                    {[...Array(24)].map((_, index) => {
                        const hour = index < 10 ? `0${index}` : index;
                        return (
                            <option key={index} value={hour}>{hour}</option>
                        );
                    })}
                </select>
                <label>End Date:</label>
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                    showTimeSelect={false}
                />
                <label>End Hour:</label>
                <select
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                >
                    {[...Array(24)].map((_, index) => {
                        const hour = index < 10 ? `0${index}` : index;
                        return (
                            <option key={index} value={hour}>{hour}</option>
                        );
                    })}
                </select>
                <button onClick={() => handleSelect(currentPage)}>Select</button>
            </div>

            {/* Memory Usage Section 추가 버튼 */}
            {sortCriteria === 'memoryUsage' && (
                <div className="memory-type-selector">
                    <button
                        className={`memory-type-btn ${calc === 'average' ? 'active' : ''}`}
                        onClick={() => {
                            setCalc('average');
                            handleSelect();
                        }}
                    >
                        Average
                    </button>
                    <button
                        className={`memory-type-btn ${calc === 'max' ? 'active' : ''}`}
                        onClick={() => {
                            setCalc('max');
                            handleSelect();
                        }}
                    >
                        Max
                    </button>
                </div>
            )}

            {/* Data Display */}
            {showData && (
                <div className="ranking-list">
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <div key={index} className="ranking-item">
                                {sortCriteria === 'callCount' ? (
                                    <p>{`${index + 1}. ${item.uri} - call count: ${item.calledNum}`}</p>
                                ) : (
                                    <p>{`${index + 1}. ${item.uri} - memory usage: ${calc === 'average' ? item.averageMemoryUsage : item.maxMemoryUsage}B`}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No data available for the selected time period.</p>
                    )}
                    {totalPage > 1 && (
                        <Pagination
                            pageCount={totalPage}
                            onPageChange={handlePageChange}
                            currentPage={currentPage}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default Ranking;

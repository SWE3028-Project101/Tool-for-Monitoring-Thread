import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Ranking.css';

function Ranking() {
    const [data, setData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedHour, setSelectedHour] = useState("00");
    const [memoryType, setMemoryType] = useState('average');
    const [sortCriteria, setSortCriteria] = useState('callCount');
    const [showData, setShowData] = useState(false);

    const handleSelect = async () => {
        setShowData(true);

        // 날짜 및 시간 포맷팅
        const date = selectedDate.toISOString().split('T')[0]; // yyyy-mm-dd
        const hour = sortCriteria === 'callCount' ? selectedHour : null;

        try {
            // 백엔드로부터 필터링된 데이터 가져오기
            const response = await axios.get('http://localhost:9000/api/rank', {
                params: {
                    date,
                    hour, // Call Count의 경우 시간 값만 전달
                    memoryType: sortCriteria === 'memoryUsage' ? memoryType : null,
                    title: sortCriteria,
                },
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div className="ranking-container">
            <div className="ranking-tabs">
                <button
                    className={`ranking-tab ${sortCriteria === 'callCount' ? 'active' : ''}`}
                    onClick={() => {
                        setSortCriteria('callCount');
                        setMemoryType('average');
                        setShowData(false);
                    }}
                >
                    Call Count Ranking
                </button>
                <button
                    className={`ranking-tab ${sortCriteria === 'memoryUsage' ? 'active' : ''}`}
                    onClick={() => {
                        setSortCriteria('memoryUsage');
                        setMemoryType('average');
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
                        className={`memory-type-btn ${memoryType === 'average' ? 'active' : ''}`}
                        onClick={() => {
                            setMemoryType('average');
                            handleSelect(); // 메모리 유형 변경 시 자동으로 데이터 요청
                        }}
                    >
                        Average
                    </button>
                    <button
                        className={`memory-type-btn ${memoryType === 'max' ? 'active' : ''}`}
                        onClick={() => {
                            setMemoryType('max');
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
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <div key={index} className="ranking-item">
                                {sortCriteria === 'callCount' ? (
                                    <p>{`${index + 1}. ${item.uri} - call count: ${item.callCount}`}</p>
                                ) : (
                                    <p>{`${index + 1}. ${item.uri} - memory usage: ${memoryType === 'average' ? item.averageMemoryUsage : item.maxMemoryUsage}MB`}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No data available for the selected time period.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default Ranking;

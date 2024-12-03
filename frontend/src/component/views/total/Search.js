import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Search.css';

function Search() {
    const [uri, setUri] = useState('');
    const [responseTime, setResponseTime] = useState('');
    const [memoryUsage, setMemoryUsage] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedHour, setSelectedHour] = useState("00");
    const [results, setResults] = useState([]);
    const [dataCount, setDataCount] = useState(0);

    const handleSearch = async () => {
        const date = selectedDate.toISOString().split('T')[0]; // yyyy-mm-dd 형식
        try {
            const response = await axios.get('/api', {
                params: {
                    uri,
                    responseTime,
                    memoryUsage,
                    date,
                    hour: selectedHour,
                },
            });
            setResults(response.data);
            setDataCount(response.data.length);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
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
                    <label>Memory Usage (Byte):</label>
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
                {results.length > 0 ? (
                    results.map((item, index) => (
                        <div key={index} className="result-item">
                            {`${index + 1}. ${item.uri} - memory usage: ${item.memoryUsage}MB, thread time: ${item.threadTime}ms`}
                        </div>
                    ))
                ) : (
                    <p>No data available</p>
                )}
                <div className="data-count">
                    Data number: {dataCount}
                </div>
            </div>
        </div>
    );
}

export default Search;

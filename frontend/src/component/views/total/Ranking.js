import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Ranking.css';

function Ranking({ data }) {
  const [sortCriteria, setSortCriteria] = useState('callCount');
  const [memoryType, setMemoryType] = useState('average');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState("00");
  const [showData, setShowData] = useState(false);

  // yymmdd_hh 형식으로 변환하는 함수
  const formatDateTime = (date, hour) => {
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}_${hour}`;
  };

  // 데이터를 필터링하는 함수
  const filteredData = data.filter(item => {
    if (sortCriteria === 'callCount') return true;

    const itemDate = new Date(item.timestamp);
    const startDate = new Date(selectedDate);
    startDate.setHours(selectedHour);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    return itemDate >= startDate && itemDate < endDate;
  });

  // 데이터를 정렬하는 함수
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortCriteria === 'callCount') {
      return memoryType === 'average' ? b.averageCallCount - a.averageCallCount : b.maxCallCount - a.maxCallCount;
    } else {
      return b.memoryUsage - a.memoryUsage;
    }
  });

  // 상위 10개 항목만 표시
  const topTenData = sortedData.slice(0, 10);

  const handleSelect = () => {
    setShowData(true);
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
            setShowData(false);
          }}
        >
          Memory Usage Ranking
        </button>
      </div>

      {sortCriteria === 'memoryUsage' && (
        <div className="date-picker">
          <label>Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            showTimeSelect={false}
          />
          <label>Select Hour:</label>
          <select value={selectedHour} onChange={(e) => setSelectedHour(e.target.value)}>
            {[...Array(24)].map((_, index) => {
              const hour = index < 10 ? `0${index}` : index;
              return (
                <option key={index} value={hour}>{hour}</option>
              );
            })}
          </select>
          <button onClick={handleSelect}>Select</button>
          <p>Selected Date and Time: {formatDateTime(selectedDate, selectedHour)}</p>
        </div>
      )}

      {showData && (
        <div className="ranking-list">
          {topTenData.map((item, index) => (
            <div key={index} className="ranking-item">
              {sortCriteria === 'callCount' ? (
                <p>{`${index + 1}. ${item.uri} - call count: ${memoryType === 'average' ? item.averageCallCount : item.maxCallCount}`}</p>
              ) : (
                <p>{`${index + 1}. ${item.uri} - memory usage: ${item.memoryUsage}MB`}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Ranking;

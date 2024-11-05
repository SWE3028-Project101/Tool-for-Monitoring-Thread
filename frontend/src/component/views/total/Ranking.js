import React, { useState } from 'react';
import './Ranking.css';

function Ranking({ data }) {
  const [sortCriteria, setSortCriteria] = useState('callCount'); // 기본 정렬 기준을 'callCount'로 설정
  const [memoryType, setMemoryType] = useState('average'); // Call Count 탭의 기준 (average 또는 max)
  const [selectedDate, setSelectedDate] = useState(new Date()); // 선택한 날짜
  const [selectedTime, setSelectedTime] = useState("00:00"); // 선택한 시간

  // 데이터를 필터링하는 함수
  const filteredData = data.filter(item => {
    if (sortCriteria === 'callCount') return true; // callCount 탭에서는 필터링하지 않음

    const itemDate = new Date(item.timestamp); // item.timestamp는 데이터의 타임스탬프라고 가정
    const startDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    startDate.setHours(hours, minutes);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1시간 후

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

  return (
    <div className="ranking-container">
      <div className="ranking-tabs">
        <button
          className={`ranking-tab ${sortCriteria === 'callCount' ? 'active' : ''}`}
          onClick={() => {
            setSortCriteria('callCount');
            setMemoryType('average'); // Call Count 탭을 선택할 때 기본값으로 average 설정
          }}
        >
          Call Count Ranking
        </button>
        <button
          className={`ranking-tab ${sortCriteria === 'memoryUsage' ? 'active' : ''}`}
          onClick={() => {
            setSortCriteria('memoryUsage');
            setMemoryType('average'); // Memory 탭을 선택할 때 기본값으로 average 설정
          }}
        >
          Memory Usage Ranking
        </button>
      </div>

      {/* Call Count 탭에서는 선택기 숨기기 */}
      {sortCriteria === 'memoryUsage' && (
        <div className="date-picker">
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate.toISOString().substring(0, 10)} // YYYY-MM-DD 형식으로 날짜 표시
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
          <label>Select Time:</label>
          <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
            {/* 0시부터 23시까지 시간 옵션 생성 */}
            {[...Array(24)].map((_, index) => {
              const hour = index < 10 ? `0${index}` : index;
              return (
                <option key={index} value={`${hour}:00`}>{hour}:00</option> // 정각만 선택
              );
            })}
          </select>
        </div>
      )}

      {/* 정렬된 데이터 표시 */}
      <div className="ranking-list">
        {sortedData.map((item, index) => (
          <div key={index} className="ranking-item">
            {sortCriteria === 'callCount' ? (
              <p>{`${index + 1}. ${item.uri} - call count: ${memoryType === 'average' ? item.averageCallCount : item.maxCallCount}`}</p>
            ) : (
              <p>{`${index + 1}. ${item.uri} - memory usage: ${item.memoryUsage}MB`}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Ranking;

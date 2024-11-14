import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Ranking.css';

function Ranking({ data }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState("00");
  const [memoryType, setMemoryType] = useState('average');
  const [sortCriteria, setSortCriteria] = useState('callCount');
  const [showData, setShowData] = useState(false);

  // Call Count Ranking: 선택한 시간대의 데이터를 UTC 기준으로 필터링
  const filteredDataForCallCount = data.filter(item => {
    const itemDate = new Date(item.timestamp).getTime();
    const startDate = Date.UTC(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      parseInt(selectedHour),
      0,
      0,
      0
    );

    const endDate = startDate + (59 * 60 * 1000) + (59 * 1000) + 999;

    return itemDate >= startDate && itemDate <= endDate;
  });

  const calculateCallCount = (data) => {
    const callCountMap = {};
    data.forEach(item => {
      callCountMap[item.uri] = (callCountMap[item.uri] || 0) + 1;
    });
    return Object.keys(callCountMap).map(uri => ({
      uri,
      maxCallCount: callCountMap[uri],
    }));
  };

  const sortedCallCountData = calculateCallCount(filteredDataForCallCount).sort((a, b) => {
    return b.maxCallCount - a.maxCallCount;
  });

  const getYesterdayData = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endOfDay = new Date(yesterday);
    endOfDay.setHours(23, 59, 59, 999);

    return data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= yesterday && itemDate <= endOfDay;
    });
  };

  const calculateMemoryUsage = (data) => {
    const memoryUsageMap = {};

    data.forEach(item => {
      if (!memoryUsageMap[item.uri]) {
        memoryUsageMap[item.uri] = {
          totalMemory: 0,
          maxMemory: 0,
          count: 0,
        };
      }
      memoryUsageMap[item.uri].totalMemory += item.memoryUsage;
      memoryUsageMap[item.uri].maxMemory = Math.max(memoryUsageMap[item.uri].maxMemory, item.memoryUsage);
      memoryUsageMap[item.uri].count += 1;
    });

    return Object.keys(memoryUsageMap).map(uri => ({
      uri,
      averageMemoryUsage: memoryUsageMap[uri].totalMemory / memoryUsageMap[uri].count,
      maxMemoryUsage: memoryUsageMap[uri].maxMemory,
    }));
  };

  const yesterdayData = getYesterdayData();
  const memoryUsageData = calculateMemoryUsage(yesterdayData);

  const sortedMemoryUsageData = memoryUsageData.sort((a, b) => {
    if (memoryType === 'average') {
      return b.averageMemoryUsage - a.averageMemoryUsage;
    } else {
      return b.maxMemoryUsage - a.maxMemoryUsage;
    }
  });

  const topTenData = sortCriteria === 'callCount' ? sortedCallCountData.slice(0, 10) : sortedMemoryUsageData.slice(0, 10);

  const handleSelect = () => {
    setShowData(true);
  };

  useEffect(() => {
    if (sortCriteria === 'memoryUsage') {
      setShowData(true);
    }
  }, [sortCriteria, memoryType]);

  const getYesterdayString = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return `${yesterday.getFullYear()}/${(yesterday.getMonth() + 1).toString().padStart(2, '0')}/${yesterday.getDate().toString().padStart(2, '0')}`;
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
        </div>
      )}

      {sortCriteria === 'memoryUsage' && (
        <div className="memory-type-selector">
          <button
            className={`memory-type-btn ${memoryType === 'average' ? 'active' : ''}`}
            onClick={() => setMemoryType('average')}
          >
            Average
          </button>
          <button
            className={`memory-type-btn ${memoryType === 'max' ? 'active' : ''}`}
            onClick={() => setMemoryType('max')}
          >
            Max
          </button>
          <p>{getYesterdayString()}</p>
        </div>
      )}

      {showData && (
        <div className="ranking-list">
          {topTenData.length > 0 ? (
            topTenData.map((item, index) => (
              <div key={index} className="ranking-item">
                {sortCriteria === 'callCount' ? (
                  <p>{`${index + 1}. ${item.uri} - call count: ${item.maxCallCount}`}</p>
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

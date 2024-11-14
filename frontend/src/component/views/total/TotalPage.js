import React from 'react';
import { useLocation } from 'react-router-dom';
import Ranking from './Ranking';

function TotalPage() {
  const location = useLocation();

  // 받은 데이터 (더미 데이터)
  const data = location.state?.data || [
    { uri: "/user/apply", memoryUsage: 63.2, timestamp: "2024-11-14T09:00:10Z" },
    { uri: "/user/apply", memoryUsage: 63.2, timestamp: "2024-11-14T09:04:00Z" },
    { uri: "/user/profile", memoryUsage: 45.7, timestamp: "2024-11-14T10:00:00Z" },
    { uri: "/admin/dashboard", memoryUsage: 78.3, timestamp: "2024-11-14T11:00:00Z" },
    { uri: "/company/info", memoryUsage: 53.1, timestamp: "2024-11-14T09:00:00Z" },
    { uri: "/user/apply", memoryUsage: 69.5, timestamp: "2024-11-14T13:00:00Z" }
  ];

  return (
    <div className="total-page">
      <h1>Ranking</h1>
      <Ranking data={data} /> {/* 데이터를 Ranking 컴포넌트로 전달 */}
    </div>
  );
}

export default TotalPage;

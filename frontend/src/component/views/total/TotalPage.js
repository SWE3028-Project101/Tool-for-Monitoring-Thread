import React from 'react';
import { useLocation } from 'react-router-dom';
import Ranking from './Ranking';

function TotalPage() {  
  const location = useLocation();
  const data = location.state?.data || []; 

  return (
    <div className="total-page">
      <h1>Ranking</h1>
      <Ranking data={data} />
    </div>
  );
}

export default TotalPage;

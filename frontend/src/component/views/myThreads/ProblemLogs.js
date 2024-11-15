import React from 'react';
import './ProblemLogs.css';

function ProblemLogs({ logs }) {
  const errorLogs = Array.isArray(logs) ? logs.filter(item => item.isError) : [];
  console.log("Error Logs:", errorLogs);
  console.log("logs: ", logs);

  return (
    <div className="api-log">
      <h3>Log of API Problems</h3>
      {errorLogs.length > 0 ? (
        <ul>
          {errorLogs.map((item, index) => (
            <li key={index}>
              <strong>{index + 1}.</strong> {item.uri} - memory usage: {Math.round(item.memoryUsage/1_000_000)}MB, thread time: {item.executionTime}ms, ({item.time})
            </li>
          ))}
        </ul>
      ) : (
        <p>No errors found</p>
      )}
    </div>
  );
}

export default ProblemLogs;

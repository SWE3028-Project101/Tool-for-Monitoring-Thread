import React from 'react';

const CategorySummary = ({ category, total, largest, summaryData, threadCount }) => (
  <div className="category-summary">
    <h3>{category} Memory Usage: {total} MB </h3>
    <p>Largest Memory Usage Thread: {largest.memoryUsage} MB</p>
    <p>Slowest Thread: {summaryData.executionTime} ms</p>
    <p>Total Threads Called: {threadCount}</p>
  </div>
);

export default CategorySummary;

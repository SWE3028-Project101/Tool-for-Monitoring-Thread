import React from 'react';
import './CategorySummary.css'

const CategorySummary = ({ category, total, largest, slowest, threadCount, activeCount, totalCount }) => (
  
  <div className="category-summary">
    <h3>{category} Memory Usage: {Math.round(total/1_000_000)} MB </h3>
    <p>Largest Memory Usage Thread: {Math.round(largest.memoryUsage/1_000_000)} MB</p>
    <p>Slowest Thread: {slowest.executionTime} ms</p>
    <p>Total Threads Count: {threadCount}</p>
    <p>Idle over Total: {totalCount-activeCount}/{totalCount}</p>
  </div>
);

export default CategorySummary;

import React from 'react';
import './ThreadBubbles.css';

const ThreadBubbles = ({ threads }) => (
  <div className="thread-bubbles">
    {threads.map((thread, index) => (
      <div key={index} className="bubble">
        <p>{thread.uri}</p>
        <p>{thread.memoryUsage} MB</p>
        <p>{thread.executionTime} ms</p>
      </div>
    ))}
  </div>
);

export default ThreadBubbles;

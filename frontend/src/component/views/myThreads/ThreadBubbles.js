import React from 'react';
import './ThreadBubbles.css';

const ThreadBubbles = ({ threads }) => (
  <div className="thread-bubbles">
    {threads.map((thread, index) => (
      <div key={index} className={`bubble ${thread.isError === "True" ? 'yeserror' : 'noerror'}`}>
        
        <p>{thread.uri}</p>
        <p>{Math.round(thread.memoryUsage/1_000_000)} MB</p>
        <p>{thread.executionTime} </p>
      </div>
    ))}
  </div>
);

export default ThreadBubbles;

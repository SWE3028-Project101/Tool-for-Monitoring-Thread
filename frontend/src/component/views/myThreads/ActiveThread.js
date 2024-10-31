import React from 'react'
import './MyThreads.css'


function ActiveThread({uri,memoryUsage,executionTime}) {
    return (
        <div id = 'ActiveThread'>
            <p>testtest</p>
            <p>uri = {uri}</p>
            <p>memoryUsage = {memoryUsage}</p>
            <p>executionTime = {executionTime}</p>
        </div>
    );
}


export default ActiveThread;
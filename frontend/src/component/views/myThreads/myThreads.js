import React from 'react';
import './MyThreads.css';
import ActiveThread from './ActiveThread';
const datas = [
    {
    uri: "https://sample.com",
    memoryUsage : "1000",
    executionTime : "10ms" 
    },
    {
        uri: "https://sample.com",
        memoryUsage : "1000",
        executionTime : "10ms" 
    }
];
function MyThread() {

   
    return (
    <div>
        {datas.map((data,index)=> (
            <ActiveThread
            uri = {data.uri}
            memoryUsage = {data.memoryUsage}
            executionTime = {data.executionTime}
        />
        ))}
        
    </div>
    );
   
}

export default MyThread;
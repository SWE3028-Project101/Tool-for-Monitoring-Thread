import React from 'react';
import './MyThreads.css';
import ActiveThread from './ActiveThread';

function MyThread({data}) {

    console.log(data);
    return (
        <div>
            {data && data.length > 0 ? (
                data.map((item, index) => (
                    <ActiveThread
                        key={index}
                        uri={item.uri}
                        memoryUsage={item.memoryUsage}
                        executingTime={item.executingTime}
                    />
                ))
            ) : (
                <p>No data available</p>
            )}
        </div>
    );
   
}

export default MyThread;
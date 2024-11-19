import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './State.css';

function State() {
    const [data, setData] = useState({
        waiting: [],
        runnable: [],
        terminated: []
    });

    // 백엔드에서 데이터를 가져오는 함수
    const fetchData = async () => {
        try {
            const response = await axios.get('api/state');
            setData(response.data); // 데이터는 { waiting: [], runnable: [], terminated: [] } 형태라고 가정
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // 컴포넌트가 마운트될 때 데이터 가져오기
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="state-table">
            <div className="state-column">
                <div className="state-header waiting-header">Waiting</div>
                {data.waiting.length > 0 ? (
                    data.waiting.map((item, index) => (
                        <div key={index} className="state-item waiting-item">
                            {`${index + 1}. ${item}`}
                        </div>
                    ))
                ) : (
                    <p className="no-data">No data available</p>
                )}
            </div>
            <div className="state-column">
                <div className="state-header runnable-header">Runnable</div>
                {data.runnable.length > 0 ? (
                    data.runnable.map((item, index) => (
                        <div key={index} className="state-item runnable-item">
                            {`${index + 1}. ${item}`}
                        </div>
                    ))
                ) : (
                    <p className="no-data">No data available</p>
                )}
            </div>
            <div className="state-column">
                <div className="state-header terminated-header">Terminated</div>
                {data.terminated.length > 0 ? (
                    data.terminated.map((item, index) => (
                        <div key={index} className="state-item terminated-item">
                            {`${index + 1}. ${item}`}
                        </div>
                    ))
                ) : (
                    <p className="no-data">No data available</p>
                )}
            </div>
        </div>
    );
}

export default State;

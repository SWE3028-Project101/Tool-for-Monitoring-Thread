import  React from 'react'
import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Main.css';
import axios from 'axios';

function Main() {
  const [Host, setHost] = useState("");
  const [Port, setPort] = useState("");
  const [TotalThreadCount, setTotalThreadCount] = useState("");
  const navigate = useNavigate();
  
  const handleSubmit = async () => {
    const url = "/api";
    const data = {
      host: Host,
      port : Port,
      totalThreadCount : TotalThreadCount
    };
    try{
      const response = await axios.post(url,data);
      console.log('Response: ', response.data);
      navigate("/MyThreads");
    } catch (error){
      console.error('Error: ',error.response ? error.response.data : error.message);
    }
    
  };
  
    return (
        <div className = "container">
        <p className="title">
          Monitor your Thread pool
        </p>
        
          <div className="form-group">
            <label className = "label" htmlFor="hostInput">Enter your Host</label>
            <input className = "input"
              id = "hostInput"
              type = "text"
              value = {Host}
              onChange = {(e) => {
                console.log(e.target.value);
                setHost(e.target.value);
                console.log("host is set to : ", Host);
              }} />
            </div>
        <br></br>

          <div className="form-group">
            <label className = "label" htmlFor="hostInput">Enter your Port</label>
            <input className = "input"
              id = "PortInput"
              type = "text"
              value = {Port}
              
              onChange = {(e) => {
                console.log(e);
                setPort(e.target.value);
              }} />
          </div>
        <br></br>

          <div className="form-group">
            <label className = "label" htmlFor="hostInput">Enter your thread number</label>
            <input className = "input"
              id = "HostInput"
              type = "text"
              value = {TotalThreadCount}
              
              onChange = {(e) => {
                console.log(e);
                setTotalThreadCount(e.target.value);
              }} />
          </div>
        <br></br>
          <button className="button" size = "large" onClick = {handleSubmit}>
            see your threads!
          </button>
       </div>
    )
}


export default Main
import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Main from './component/views/Main/Main'
import MyThreads from './component/views/myThreads/myThreads'
import Total from './component/views/total/total'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      
      <Routes>
        <Route path = "/" element = {<Main />}></Route>
        <Route path = "/myThreads" element = {<MyThreads />}></Route>
        <Route path = "/total" element = {<Total />}></Route>
        
      </Routes>

      
      </BrowserRouter>
        
       
      
    </div>
  );
}

export default App;

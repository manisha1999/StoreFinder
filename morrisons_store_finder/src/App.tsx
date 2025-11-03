import React from 'react';

import './App.css';
import logo from './logo.svg'
import Home from './Components/Home/Home';
import SearchFeature from './Components/SearchFeature/SearchFeature';

function App() {
  return (
    <div className="App">
      <img className='logo' src={logo}/>
      <Home/>
      
      
    </div>
  );
}

export default App;

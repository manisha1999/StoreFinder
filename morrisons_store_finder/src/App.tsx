import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import logo from './logo.svg';
import Home from './Components/Home/Home';
import StoreDetailPage from './Components/StoreDetails/StoreDetailPage';

function App() {
  return (
    <Router>
      <div className="App">
        <img className='logo' src={logo} alt='logo'/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/storefinder/:storeId/:storeName" element={<StoreDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
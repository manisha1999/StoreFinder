import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import logo from './logo.svg';

const Home = lazy(() => import('./Components/Home/Home'));
const StoreDetailPage = lazy(() => import('./Components/StoreDetails/StoreDetailPage'));

function App() {
  return (
    <Router>
      <div className="App">
        <img className='logo' src={logo} alt='logo'/>
        <Suspense fallback={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '400px',
            fontSize: '1.2rem',
            color: '#666'
          }}>
            Loading...
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/storefinder/:storeId/:storeName" element={<StoreDetailPage />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
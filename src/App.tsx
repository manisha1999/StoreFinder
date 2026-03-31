import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Layout from './Components/Layout/Layout';
import {storeCache} from './Components/StoreCache/StoreCache'
const Home = lazy(() => import('./Components/Home/Home'));

const StoreDetailPage = lazy(() => import('./Components/StoreDetails/StoreDetailPage'));

function App() {
  useEffect(() => {
    storeCache.clearExpired();
  }, []);
  return (
    <Router>
      <Suspense fallback={<div className="loading">Loading...</div>}>
        <Routes>
          {/* <Route element={<Layout />}> */}
            <Route path="/" element={<Home />} />
            <Route path="/search/:postcode" element={<Home/>} />
            <Route path="/location" element={<Home />} />
            <Route path="/:postcode" element={<Home />} />
            <Route path="/storefinder/:storeId/:storeName" element={<StoreDetailPage />} />
          {/* </Route> */}
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;